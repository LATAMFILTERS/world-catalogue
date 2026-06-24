require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  console.log('--- PRODUCT ---');
  let sku = null;
  try {
    const res = await client.query("SELECT elimfilters_sku, source_sku FROM ld_catalog.ld_product_catalog WHERE source_sku ILIKE '%712/22%'");
    console.log(res.rows);
    if (res.rows.length > 0) sku = res.rows[0].elimfilters_sku;
  } catch(e) { console.log(e.message); }

  if (sku) {
    console.log('\\n--- CHECKEANDO TODOS LOS FRAM EN REFS DE ' + sku + ' ---');
    try {
      const res2 = await client.query("SELECT competitor_brand, competitor_part_number FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku = $1 AND competitor_brand ILIKE '%fram%'", [sku]);
      console.log(res2.rows);
    } catch(e) { console.log(e.message); }
  }

  await client.end();
}
run();
