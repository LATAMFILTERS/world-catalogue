'use strict';
/**
 * Run on Render Shell (read-only, makes no changes):
 *   node scripts/migrations/run_028_discover_duratech_platforms.js
 *
 * DURATECH pilot - step 1 (discovery only, no writes).
 *
 * A DURATECH kit bundles every filter SKU that applies to one specific
 * platform:
 *   - HD platform = exact (equipment, engine) pair from equipment_applications
 *   - LD platform = exact (make, model, year) triple from vehicle_applications
 * Every filter_type found for that platform goes in the kit (oil, fuel,
 * air, cabin, hydraulic, coolant - whatever applies, per ELIMFILTERS: sell
 * the complete set).
 *
 * This lists the platforms with the BEST filter-type coverage (most
 * complete kits) as pilot candidates, plus an explicit lookup for the two
 * example platforms given (Freightliner CL120 / Detroit Diesel, Toyota
 * RAV4 2022) so their exact stored spelling can be confirmed before any
 * kit is created.
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

  console.log('\n=== TOP 20 HD platforms by filter-type coverage (equipment + engine) ===');
  const { rows: hdTop } = await client.query(`
    SELECT
      eq->>'equipment' AS equipment,
      eq->>'engine'    AS engine,
      COUNT(DISTINCT c.filter_type) AS type_count,
      array_agg(DISTINCT c.filter_type) AS filter_types,
      array_agg(DISTINCT c.sku) AS skus
    FROM elimfilters_catalog c,
      LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(c.equipment_applications) = 'array' THEN c.equipment_applications ELSE '[]'::jsonb END
      ) eq
    WHERE c.duty = 'HEAVY_DUTY'
      AND eq->>'equipment' IS NOT NULL AND eq->>'equipment' <> ''
    GROUP BY eq->>'equipment', eq->>'engine'
    ORDER BY type_count DESC, equipment
    LIMIT 20
  `);
  hdTop.forEach(r => {
    console.log(`  ${r.equipment} | ${r.engine}  ->  ${r.type_count} types: [${r.filter_types.join(', ')}]  (${r.skus.length} SKUs)`);
  });

  console.log('\n=== TOP 20 LD platforms by filter-type coverage (make + model + year) ===');
  const { rows: ldTop } = await client.query(`
    SELECT
      va->>'make'  AS make,
      va->>'model' AS model,
      va->>'year'  AS year,
      COUNT(DISTINCT c.filter_type) AS type_count,
      array_agg(DISTINCT c.filter_type) AS filter_types,
      array_agg(DISTINCT c.sku) AS skus
    FROM elimfilters_catalog c,
      LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(c.vehicle_applications) = 'array' THEN c.vehicle_applications ELSE '[]'::jsonb END
      ) va
    WHERE c.duty = 'LIGHT_DUTY'
      AND va->>'make' IS NOT NULL AND va->>'make' <> ''
    GROUP BY va->>'make', va->>'model', va->>'year'
    ORDER BY type_count DESC, make, model
    LIMIT 20
  `);
  ldTop.forEach(r => {
    console.log(`  ${r.make} ${r.model} ${r.year}  ->  ${r.type_count} types: [${r.filter_types.join(', ')}]  (${r.skus.length} SKUs)`);
  });

  console.log('\n=== Explicit lookup: FREIGHTLINER CL120 (any engine) ===');
  const { rows: cl120 } = await client.query(`
    SELECT DISTINCT eq->>'equipment' AS equipment, eq->>'engine' AS engine, c.filter_type, c.sku
    FROM elimfilters_catalog c,
      LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(c.equipment_applications) = 'array' THEN c.equipment_applications ELSE '[]'::jsonb END
      ) eq
    WHERE c.duty = 'HEAVY_DUTY' AND eq->>'equipment' ILIKE '%FREIGHTLINER%CL120%'
    ORDER BY c.filter_type, c.sku
  `);
  console.log(`Matches: ${cl120.length}`);
  cl120.forEach(r => console.log(`  ${r.equipment} | ${r.engine} | ${r.filter_type} | ${r.sku}`));

  console.log('\n=== Explicit lookup: TOYOTA RAV4 2022 ===');
  const { rows: rav4 } = await client.query(`
    SELECT DISTINCT va->>'make' AS make, va->>'model' AS model, va->>'year' AS year, c.filter_type, c.sku
    FROM elimfilters_catalog c,
      LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(c.vehicle_applications) = 'array' THEN c.vehicle_applications ELSE '[]'::jsonb END
      ) va
    WHERE c.duty = 'LIGHT_DUTY' AND va->>'make' ILIKE 'TOYOTA' AND va->>'model' ILIKE '%RAV4%' AND va->>'year' = '2022'
    ORDER BY c.filter_type, c.sku
  `);
  console.log(`Matches: ${rav4.length}`);
  rav4.forEach(r => console.log(`  ${r.make} ${r.model} ${r.year} | ${r.filter_type} | ${r.sku}`));

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
