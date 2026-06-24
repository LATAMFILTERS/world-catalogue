require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const res = await client.query(`
    SELECT DISTINCT filter_type as segment FROM public.elimfilters_catalog
    UNION
    SELECT DISTINCT segment FROM ld_catalog.ld_product_catalog
  `);
  console.table(res.rows);

  await client.end();
}
run();
