require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("=== LD DB AUDIT ===");

  // 1. Missing references
  const noRefs = await client.query(`
    SELECT COUNT(*) as c
    FROM ld_catalog.ld_product_catalog p
    LEFT JOIN ld_catalog.ld_competitor_cross_references c ON p.elimfilters_sku = c.elimfilters_sku
    LEFT JOIN ld_catalog.ld_oem_cross_references o ON p.elimfilters_sku = o.elimfilters_sku
    WHERE c.elimfilters_sku IS NULL AND o.elimfilters_sku IS NULL
  `);
  console.log(`LD SKUs with zero cross references: ${noRefs.rows[0].c}`);

  // 2. Garbage in competitor
  const garbage = await client.query(`
    SELECT COUNT(*) as c
    FROM ld_catalog.ld_competitor_cross_references
    WHERE LENGTH(competitor_part_number) > 30
       OR competitor_part_number ILIKE '%PREMIUM%'
  `);
  console.log(`LD garbage competitor references: ${garbage.rows[0].c}`);

  await client.end();
}
run();
