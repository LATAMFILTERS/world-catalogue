/**
 * DATABASE CLEANUP SCRIPT (HD CATALOG)
 * 1. Removes garbage/inverted text from oem_codes and competitor_codes JSONB arrays.
 * 2. Removes duplicate objects from the JSONB arrays to reduce bloat.
 */

require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("=== STARTING HD DATABASE CLEANUP ===");

  // Step 1: Clean garbage and duplicates using a massive CTE UPDATE
  const updateRes = await client.query(`
    WITH cleaned AS (
      SELECT 
        sku,
        (
          SELECT jsonb_agg(DISTINCT elem)
          FROM jsonb_array_elements(oem_codes) as elem
          WHERE LENGTH(elem->>'code') <= 30
            AND elem->>'code' NOT ILIKE '%PREMIUM%'
            AND elem->>'code' NOT ILIKE '%FILTER%'
            AND elem->>'code' NOT ILIKE '%SEAL%'
            AND elem->>'code' NOT ILIKE '%EQUIPMENT%'
            AND elem->>'code' NOT ILIKE '%PREVENT%'
            AND elem->>'code' NOT ILIKE '%COMBUSTION%'
            AND elem->>'code' NOT ILIKE '%AIRBORNE%'
        ) as new_oem,
        (
          SELECT jsonb_agg(DISTINCT elem)
          FROM jsonb_array_elements(competitor_codes) as elem
          WHERE LENGTH(elem->>'code') <= 30
            AND elem->>'code' NOT ILIKE '%PREMIUM%'
            AND elem->>'code' NOT ILIKE '%FILTER%'
            AND elem->>'code' NOT ILIKE '%SEAL%'
            AND elem->>'code' NOT ILIKE '%EQUIPMENT%'
            AND elem->>'code' NOT ILIKE '%PREVENT%'
            AND elem->>'code' NOT ILIKE '%COMBUSTION%'
            AND elem->>'code' NOT ILIKE '%AIRBORNE%'
        ) as new_comp
      FROM public.elimfilters_catalog
    )
    UPDATE public.elimfilters_catalog p
    SET 
      oem_codes = COALESCE(c.new_oem, '[]'::jsonb),
      competitor_codes = COALESCE(c.new_comp, '[]'::jsonb)
    FROM cleaned c
    WHERE p.sku = c.sku
      AND (
        p.oem_codes::text IS DISTINCT FROM COALESCE(c.new_oem, '[]'::jsonb)::text
        OR p.competitor_codes::text IS DISTINCT FROM COALESCE(c.new_comp, '[]'::jsonb)::text
      )
    RETURNING p.sku;
  `);

  console.log(`✅ Cleanup Complete. Modified ${updateRes.rowCount} SKUs in HD catalog.`);

  // Audit after cleanup
  const emptyQ = await client.query(`
    SELECT COUNT(*) as c
    FROM public.elimfilters_catalog
    WHERE (oem_codes IS NULL OR jsonb_array_length(oem_codes) = 0)
      AND (competitor_codes IS NULL OR jsonb_array_length(competitor_codes) = 0)
  `);
  console.log(`📊 HD SKUs with zero cross-references now: ${emptyQ.rows[0].c}`);

  await client.end();
}

run().catch(console.error);
