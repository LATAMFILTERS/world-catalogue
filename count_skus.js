require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  try {
    const ldRes = await client.query('SELECT COUNT(DISTINCT elimfilters_sku) as c FROM ld_catalog.ld_product_catalog');
    console.log('LD_COUNT=' + ldRes.rows[0].c);
  } catch (e) {
    console.log('LD_COUNT_ERROR=' + e.message);
  }

  try {
    const hdRes = await client.query('SELECT COUNT(DISTINCT elimfilters_sku) as c FROM public.elimfilters_catalog');
    console.log('HD_COUNT=' + hdRes.rows[0].c);
  } catch (e) {
    console.log('HD_COUNT_ERROR=' + e.message);
  }

  await client.end();
}
run();
