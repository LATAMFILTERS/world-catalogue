require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("=== DB AUDIT SCRIPT ===");

  // 1. Inverted data / Garbage in HD catalog
  const garbageQ = await client.query(`
    SELECT sku, 
           elem->>'manufacturer' as mfg, 
           elem->>'code' as code,
           'competitor' as source
    FROM public.elimfilters_catalog,
         jsonb_array_elements(competitor_codes) as elem
    WHERE LENGTH(elem->>'code') > 30
       OR elem->>'code' ILIKE '%PREMIUM%'
       OR elem->>'code' ILIKE '%FILTER%'
       OR elem->>'code' ILIKE '%SEAL%'
    UNION ALL
    SELECT sku, 
           elem->>'manufacturer' as mfg, 
           elem->>'code' as code,
           'oem' as source
    FROM public.elimfilters_catalog,
         jsonb_array_elements(oem_codes) as elem
    WHERE LENGTH(elem->>'code') > 30
       OR elem->>'code' ILIKE '%PREMIUM%'
       OR elem->>'code' ILIKE '%FILTER%'
       OR elem->>'code' ILIKE '%SEAL%'
  `);
  console.log(`\nFound ${garbageQ.rows.length} garbage/inverted cross-references in HD`);
  if (garbageQ.rows.length > 0) {
    console.table(garbageQ.rows.slice(0, 10)); // sample
  }

  // 2. Empty arrays or nulls in cross refs
  const emptyQ = await client.query(`
    SELECT COUNT(*) as c
    FROM public.elimfilters_catalog
    WHERE (oem_codes IS NULL OR jsonb_array_length(oem_codes) = 0)
      AND (competitor_codes IS NULL OR jsonb_array_length(competitor_codes) = 0)
  `);
  console.log(`\nFound ${emptyQ.rows[0].c} HD SKUs with zero cross-references.`);

  // 3. Duplicate codes within the same SKU's array
  const dupCodes = await client.query(`
    SELECT sku, elem->>'code' as code, COUNT(*) as c
    FROM public.elimfilters_catalog,
         jsonb_array_elements(oem_codes) as elem
    GROUP BY sku, elem->>'code'
    HAVING COUNT(*) > 1
    LIMIT 5;
  `);
  console.log(`\nSample of duplicate OEM codes within the same SKU:`);
  console.table(dupCodes.rows);

  // 4. Duplicate Alternatives
  const dupAlts = await client.query(`
    SELECT sku, alternatives
    FROM public.elimfilters_catalog
    WHERE jsonb_array_length(alternatives) > 1
    LIMIT 5;
  `);
  console.log(`\nSample of HD Alternatives arrays:`);
  dupAlts.rows.forEach(r => console.log(r.sku, r.alternatives));

  await client.end();
}

run().catch(console.error);
