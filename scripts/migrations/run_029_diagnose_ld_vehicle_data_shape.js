'use strict';
/**
 * Run on Render Shell (read-only, makes no changes):
 *   node scripts/migrations/run_029_diagnose_ld_vehicle_data_shape.js
 *
 * run_028's exact-match lookup for "TOYOTA RAV4 2022" found 0 rows, and
 * the LD platform top-20 showed `year` stored as a date range
 * ("01/18 -> 12/21") rather than a plain 4-digit year, plus many rows
 * with model = null. This dumps raw vehicle_applications entries for
 * Toyota products to see the actual field shapes/values before designing
 * the real LD platform-matching query for DURATECH kits.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();

  console.log('\n=== Raw vehicle_applications entries where make ILIKE %TOYOTA% (first 40) ===');
  const { rows } = await client.query(`
    SELECT DISTINCT va->>'make' AS make, va->>'model' AS model, va->>'year' AS year,
           va->>'engine' AS engine, c.sku, c.filter_type
    FROM elimfilters_catalog c,
      LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(c.vehicle_applications) = 'array' THEN c.vehicle_applications ELSE '[]'::jsonb END
      ) va
    WHERE c.duty = 'LIGHT_DUTY' AND va->>'make' ILIKE '%TOYOTA%'
    ORDER BY make, model, year
    LIMIT 40
  `);
  console.log(`Sample rows: ${rows.length}`);
  rows.forEach(r => console.log(`  make=${r.make} | model=${r.model} | year=${r.year} | engine=${r.engine} | ${r.filter_type} | ${r.sku}`));

  console.log('\n=== Any Toyota model containing RAV (RAV4, RAV 4, etc.) ===');
  const { rows: rav } = await client.query(`
    SELECT DISTINCT va->>'make' AS make, va->>'model' AS model, va->>'year' AS year,
           va->>'engine' AS engine, c.sku, c.filter_type
    FROM elimfilters_catalog c,
      LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(c.vehicle_applications) = 'array' THEN c.vehicle_applications ELSE '[]'::jsonb END
      ) va
    WHERE c.duty = 'LIGHT_DUTY' AND va->>'make' ILIKE '%TOYOTA%' AND va->>'model' ILIKE '%RAV%'
    ORDER BY model, year
  `);
  console.log(`Matches: ${rav.length}`);
  rav.forEach(r => console.log(`  make=${r.make} | model=${r.model} | year=${r.year} | engine=${r.engine} | ${r.filter_type} | ${r.sku}`));

  console.log('\n=== One full raw vehicle_applications array sample (any Toyota row) ===');
  const { rows: sample } = await client.query(`
    SELECT sku, vehicle_applications
    FROM elimfilters_catalog
    WHERE duty = 'LIGHT_DUTY'
      AND vehicle_applications::text ILIKE '%TOYOTA%'
    LIMIT 1
  `);
  if (sample.length) {
    console.log(`SKU: ${sample[0].sku}`);
    console.log(JSON.stringify(sample[0].vehicle_applications, null, 2).slice(0, 2000));
  } else {
    console.log('No rows found.');
  }

  console.log('\n=== Overall: how often is model NULL/empty across all LD vehicle_applications? ===');
  const { rows: nullCheck } = await client.query(`
    SELECT
      COUNT(*) FILTER (WHERE va->>'model' IS NULL OR va->>'model' = '') AS null_model,
      COUNT(*) AS total
    FROM elimfilters_catalog c,
      LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(c.vehicle_applications) = 'array' THEN c.vehicle_applications ELSE '[]'::jsonb END
      ) va
    WHERE c.duty = 'LIGHT_DUTY'
  `);
  console.log(nullCheck[0]);

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
