const https = require('https');
const { Client } = require('pg');

const dbConfig = {
  host: 'ballast.proxy.rlwy.net',
  port: 18263,
  database: 'railway',
  user: 'postgres',
  password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
  ssl: { rejectUnauthorized: false }
};

function getScrapeUrl(sku, filterType) {
  const t = (filterType || '').toLowerCase();
  if (t.includes('air') || sku.startsWith('EA'))
    return `https://www.airfilter-crossreference.com/convert/DONALDSON/${sku}`;
  if (t.includes('fuel') || t.includes('sep') || sku.startsWith('EF') || sku.startsWith('ES'))
    return `https://www.fuelfilter-crossreference.com/convert/DONALDSON/${sku}`;
  if (t.includes('lube') || t.includes('oil') || t.includes('hydr') || sku.startsWith('EL') || sku.startsWith('EH'))
    return `https://www.oilfilter-crossreference.com/convert/DONALDSON/${sku}`;
  return null;
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml'
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302)
        return fetchPage(res.headers.location).then(resolve).catch(reject);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function extractCrossRefs(html) {
  const results = [];
  const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  for (const row of rows) {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
    if (cells.length >= 2) {
      const brand = cells[0].replace(/<[^>]+>/g, '').trim();
      const code  = cells[1].replace(/<[^>]+>/g, '').trim();
      if (brand && code && brand.length < 60 && code.length < 60
          && brand !== 'Brand' && code !== 'Part Number')
        results.push({ manufacturer: brand.toUpperCase(), code: code.toUpperCase() });
    }
  }
  return results;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const client = new Client(dbConfig);
  await client.connect();
  console.log('Conectado a PostgreSQL\n');

  try {
    const { rows } = await client.query(`
      SELECT id, sku, filter_type, competitor_codes, oem_codes
      FROM elimfilters_catalog
      WHERE filter_type ILIKE '%air%'
         OR filter_type ILIKE '%fuel%'
         OR filter_type ILIKE '%sep%'
         OR filter_type ILIKE '%lube%'
         OR filter_type ILIKE '%oil%'
         OR filter_type ILIKE '%hydr%'
      ORDER BY filter_type, sku
    `);

    console.log(`${rows.length} filtros encontrados\n`);
    let updated = 0;

    for (const row of rows) {
      const oemCodes = Array.isArray(row.oem_codes) ? row.oem_codes : [];
      const donaldsonCode = oemCodes.find(c =>
        (c.manufacturer || '').toUpperCase().includes('DONALDSON')
      );
      const searchSku = donaldsonCode?.code || row.sku;
      const url = getScrapeUrl(searchSku, row.filter_type);

      if (!url) { console.log(`SKIP ${row.sku}`); continue; }

      process.stdout.write(`${row.sku} [${row.filter_type}] ${searchSku} ... `);

      try {
        const { status, body } = await fetchPage(url);
        if (status !== 200) { console.log(`[${status}]`); await sleep(500); continue; }

        const crossRefs = extractCrossRefs(body);
        if (crossRefs.length === 0) { console.log(`0 refs`); await sleep(500); continue; }

        const existing = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
        const existingSet = new Set(existing.map(c => `${c.manufacturer}|${c.code}`));
        const newEntries = crossRefs.filter(c => !existingSet.has(`${c.manufacturer}|${c.code}`));
        const merged = [...existing, ...newEntries];

        await client.query(
          `UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE id = $2`,
          [JSON.stringify(merged), row.id]
        );
        updated++;
        console.log(`+${newEntries.length} nuevos (total: ${merged.length})`);
      } catch (e) {
        console.log(`ERR: ${e.message}`);
      }

      await sleep(800);
    }

    console.log(`\nProceso completo. ${updated} filas actualizadas.`);
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
