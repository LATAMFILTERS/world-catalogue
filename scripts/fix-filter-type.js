require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: 'ballast.proxy.rlwy.net',
  port: 18263,
  database: 'railway',
  user: 'postgres',
  password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
  ssl: { rejectUnauthorized: false }
});

const mappings = [
  ['Air Filter',     '%Air Filter%'],
  ['Hydraulic Filter', '%Hydraulic Filter%'],
  ['Oil Filter',     '%Oil Filter%'],
  ['Fuel Filter',    '%Fuel Filter%'],
  ['Cabin Air Filter', '%Cabin Air Filter%'],
];

async function run() {
  await client.connect();
  console.log('Connected. Fixing filter_type values...\n');

  for (const [plain, pattern] of mappings) {
    const r = await client.query(
      `UPDATE elimfilters_catalog
       SET filter_type = $1
       WHERE filter_type::text LIKE $2
         AND filter_type::text LIKE '{%'`,
      [plain, pattern]
    );
    console.log(`${plain}: ${r.rowCount} rows updated`);
  }

  const check = await client.query(
    `SELECT filter_type, COUNT(*) FROM elimfilters_catalog GROUP BY filter_type ORDER BY COUNT(*) DESC`
  );
  console.log('\nResult:');
  check.rows.forEach(r => console.log(`  ${r.filter_type} → ${r.count}`));

  await client.end();
}

run().catch(console.error);
