const { Client } = require('pg');

const dbConfig = {
  host: 'ballast.proxy.rlwy.net', port: 18263, database: 'railway',
  user: 'postgres', password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
  ssl: { rejectUnauthorized: false }
};

async function main() {
  const client = new Client(dbConfig);
  await client.connect();

  // Buscar todas las variantes de nombre "Baldwin" en competitor_codes
  const { rows } = await client.query(`
    SELECT DISTINCT upper(elem->>'manufacturer') AS mfr, COUNT(*) AS n
    FROM elimfilters_catalog,
         jsonb_array_elements(competitor_codes) AS elem
    WHERE upper(elem->>'manufacturer') ILIKE '%BALD%'
    GROUP BY upper(elem->>'manufacturer')
    ORDER BY n DESC
  `);

  console.log('Variantes de BALDWIN en competitor_codes:');
  if (rows.length === 0) console.log('  (ninguna)');
  rows.forEach(r => console.log(`  "${r.mfr}" → ${r.n} códigos`));

  // Buscar en oem_codes también
  const { rows: oem } = await client.query(`
    SELECT DISTINCT upper(elem->>'manufacturer') AS mfr, COUNT(*) AS n
    FROM elimfilters_catalog,
         jsonb_array_elements(oem_codes) AS elem
    WHERE upper(elem->>'manufacturer') ILIKE '%BALD%'
    GROUP BY upper(elem->>'manufacturer')
    ORDER BY n DESC
  `);

  console.log('\nVariantes de BALDWIN en oem_codes:');
  if (oem.length === 0) console.log('  (ninguna)');
  oem.forEach(r => console.log(`  "${r.mfr}" → ${r.n} códigos`));

  // Muestra ejemplo de códigos Baldwin
  const { rows: sample } = await client.query(`
    SELECT sku, filter_type, elem->>'manufacturer' AS mfr, elem->>'code' AS code
    FROM elimfilters_catalog,
         jsonb_array_elements(competitor_codes) AS elem
    WHERE upper(elem->>'manufacturer') ILIKE '%BALD%'
    LIMIT 10
  `);
  if (sample.length > 0) {
    console.log('\nEjemplos:');
    sample.forEach(r => console.log(`  ${r.sku} [${r.filter_type}] → ${r.mfr} | ${r.code}`));
  }

  await client.end();
}
main().catch(e => console.error(e.message));
