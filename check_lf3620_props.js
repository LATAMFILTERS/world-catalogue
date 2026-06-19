require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const res = await client.query(`
    SELECT sku, filter_type::text, technology, oem_codes, competitor_codes
    FROM public.elimfilters_catalog 
    WHERE sku IN ('EL81016', 'EL82100', 'EL83998')
  `);
  console.table(res.rows.map(r => ({
    sku: r.sku,
    technology: r.technology,
    oem_len: (r.oem_codes || []).length,
    comp_len: (r.competitor_codes || []).length
  })));

  await client.end();
}
run();
