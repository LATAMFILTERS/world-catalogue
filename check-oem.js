const { Client } = require('pg');

const dbConfig = {
  host: 'ballast.proxy.rlwy.net',
  port: 18263,
  database: 'railway',
  user: 'postgres',
  password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
  ssl: { rejectUnauthorized: false }
};

async function main() {
  const client = new Client(dbConfig);
  await client.connect();

  // Ver muestra de oem_codes para filtros EA
  const { rows } = await client.query(`
    SELECT sku, filter_type, oem_codes
    FROM elimfilters_catalog
    WHERE sku LIKE 'EA%'
    LIMIT 10
  `);

  for (const r of rows) {
    console.log(`\n${r.sku} [${r.filter_type}]`);
    console.log('oem_codes:', JSON.stringify(r.oem_codes, null, 2));
  }

  await client.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
