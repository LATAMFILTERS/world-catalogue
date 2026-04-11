require('dotenv').config();
const https = require('https');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml'
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchPage(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function extractCrossRefs(html) {
  const results = [];
  // Extrae filas de tabla con marca y código
  const rowPattern = /<tr[^>]*>[\s\S]*?<\/tr>/gi;
  const rows = html.match(rowPattern) || [];

  for (const row of rows) {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
    if (cells.length >= 2) {
      const brand = cells[0].replace(/<[^>]+>/g, '').trim();
      const code  = cells[1].replace(/<[^>]+>/g, '').trim();
      if (brand && code && brand.length < 60 && code.length < 60
          && brand !== 'Brand' && code !== 'Part Number') {
        results.push({ manufacturer: brand.toUpperCase(), code: code.toUpperCase() });
      }
    }
  }
  return results;
}

async function scrapeCrossRef(donaldsonSku) {
  const url = `https://www.fuelfilter-crossreference.com/convert/DONALDSON/${donaldsonSku}`;
  try {
    const { status, body } = await fetchPage(url);
    if (status !== 200) {
      console.log(`  [${status}] ${donaldsonSku} - sin resultado`);
      return [];
    }
    const refs = extractCrossRefs(body);
    console.log(`  [OK] ${donaldsonSku} → ${refs.length} cross refs`);
    return refs;
  } catch (e) {
    console.log(`  [ERR] ${donaldsonSku}: ${e.message}`);
    return [];
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const client = await pool.connect();
  try {
    // Trae todos los SKUs de tipo Fuel Filter
    const { rows } = await client.query(`
      SELECT id, sku, competitor_codes
      FROM elimfilters_catalog
      WHERE filter_type ILIKE '%fuel%'
      ORDER BY sku
    `);

    console.log(`\n📋 ${rows.length} fuel filters encontrados\n`);

    let updated = 0;

    for (const row of rows) {
      // Busca el código Donaldson en oem_codes o usa el sku directamente
      const oem = await client.query(
        `SELECT oem_codes FROM elimfilters_catalog WHERE id = $1`, [row.id]
      );
      const oemCodes = oem.rows[0]?.oem_codes || [];
      const donaldsonCode = oemCodes.find(c =>
        (c.manufacturer || '').toUpperCase().includes('DONALDSON')
      );
      const searchSku = donaldsonCode?.code || row.sku;

      console.log(`→ ${row.sku} (buscando: ${searchSku})`);
      const crossRefs = await scrapeCrossRef(searchSku);

      if (crossRefs.length > 0) {
        // Combina con competitor_codes existentes, sin duplicar
        const existing = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
        const existingCodes = new Set(existing.map(c => `${c.manufacturer}|${c.code}`));
        const newEntries = crossRefs.filter(
          c => !existingCodes.has(`${c.manufacturer}|${c.code}`)
        );
        const merged = [...existing, ...newEntries];

        await client.query(
          `UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE id = $2`,
          [JSON.stringify(merged), row.id]
        );
        updated++;
        console.log(`  ✅ +${newEntries.length} nuevos (total: ${merged.length})`);
      }

      await sleep(800); // respetar el servidor
    }

    console.log(`\n✅ Proceso completo. ${updated} filas actualizadas.`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
