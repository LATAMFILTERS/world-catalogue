require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("=== 1. DB Integrity: Garbage text in HD ===");
  const hdGarbage = await client.query(`
    SELECT sku, elem->>'manufacturer' as mfg, elem->>'code' as code
    FROM public.elimfilters_catalog,
         jsonb_array_elements(oem_codes) as elem
    WHERE LENGTH(elem->>'code') > 40
       OR elem->>'code' ILIKE '%PREMIUM%'
       OR elem->>'code' ILIKE '%FILTER%'
    LIMIT 10;
  `);
  console.table(hdGarbage.rows);

  console.log("\n=== 2. DB Integrity: Empty SKUs (No specs, no refs) ===");
  const emptyHd = await client.query(`
    SELECT COUNT(*) as c
    FROM public.elimfilters_catalog
    WHERE (oem_codes IS NULL OR jsonb_array_length(oem_codes) = 0)
      AND (competitor_codes IS NULL OR jsonb_array_length(competitor_codes) = 0)
  `);
  console.log("Empty HD SKUs:", emptyHd.rows[0].c);

  console.log("\n=== 3. DB Integrity: Duplicate Alternatives ===");
  // Just seeing if there are arrays with duplicates
  const dupAlts = await client.query(`
    SELECT sku, alternatives
    FROM public.elimfilters_catalog
    WHERE jsonb_array_length(alternatives) > 1
    LIMIT 5;
  `);
  console.log("Sample Alternatives:", JSON.stringify(dupAlts.rows, null, 2));

  await client.end();
}
run();
