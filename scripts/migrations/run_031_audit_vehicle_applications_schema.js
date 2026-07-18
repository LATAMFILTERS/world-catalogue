'use strict';
/**
 * Run on Render Shell (read-only, makes no changes):
 *   node scripts/migrations/run_031_audit_vehicle_applications_schema.js
 *
 * Decides whether DURATECH LD platform matching can safely rely on just
 * the "current" vehicle_applications schema (model_family/model_type/
 * engine_code/year-as-range), or whether the "legacy" schema (model as
 * free text, year/engine null) carries unique vehicles that would be
 * lost.
 *
 * A single SKU's vehicle_applications array can contain BOTH shapes for
 * what looks like the same underlying vehicle (seen on EA32524: Toyota
 * Starlet 1.3 EP91 appears once in each shape). This audits, across the
 * whole LD catalog:
 *   1. How many array entries are legacy-only, current-only, or
 *      ambiguous (missing distinguishing fields in both).
 *   2. Per SKU, whether it has ONLY legacy entries, ONLY current
 *      entries, or a mix.
 *   3. For "mixed" SKUs, whether legacy-entry-count == current-entry-
 *      count (suggesting exact 1:1 duplication, safe to drop legacy) or
 *      not (suggesting legacy holds unique vehicles).
 *   4. How many DISTINCT SKUs would have ZERO vehicle coverage left if
 *      legacy-only entries were ignored entirely for platform matching -
 *      this is the real "coverage lost" number that decides the
 *      approach.
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

  console.log('\n=== 1. Entry-level shape breakdown (all LD vehicle_applications entries) ===');
  const { rows: entryShape } = await client.query(`
    SELECT
      COUNT(*) FILTER (WHERE va ? 'model_family') AS current_shape,
      COUNT(*) FILTER (WHERE (va ? 'model') AND NOT (va ? 'model_family')) AS legacy_shape,
      COUNT(*) FILTER (WHERE NOT (va ? 'model') AND NOT (va ? 'model_family')) AS neither,
      COUNT(*) AS total
    FROM elimfilters_catalog c,
      LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(c.vehicle_applications) = 'array' THEN c.vehicle_applications ELSE '[]'::jsonb END
      ) va
    WHERE c.duty = 'LIGHT_DUTY'
  `);
  console.log(entryShape[0]);

  console.log('\n=== 2. Per-SKU classification ===');
  const { rows: skuShape } = await client.query(`
    WITH per_sku AS (
      SELECT
        c.sku,
        COUNT(*) FILTER (WHERE va ? 'model_family') AS current_count,
        COUNT(*) FILTER (WHERE (va ? 'model') AND NOT (va ? 'model_family')) AS legacy_count
      FROM elimfilters_catalog c,
        LATERAL jsonb_array_elements(
          CASE WHEN jsonb_typeof(c.vehicle_applications) = 'array' THEN c.vehicle_applications ELSE '[]'::jsonb END
        ) va
      WHERE c.duty = 'LIGHT_DUTY'
      GROUP BY c.sku
    )
    SELECT
      COUNT(*) FILTER (WHERE current_count > 0 AND legacy_count = 0) AS current_only_skus,
      COUNT(*) FILTER (WHERE legacy_count > 0 AND current_count = 0) AS legacy_only_skus,
      COUNT(*) FILTER (WHERE current_count > 0 AND legacy_count > 0) AS mixed_skus,
      COUNT(*) FILTER (WHERE current_count > 0 AND legacy_count > 0 AND current_count = legacy_count) AS mixed_equal_counts,
      COUNT(*) FILTER (WHERE current_count = 0 AND legacy_count = 0) AS neither_skus,
      COUNT(*) AS total_ld_skus
    FROM per_sku
  `);
  console.log(skuShape[0]);

  console.log('\n=== 3. Sample of legacy-only SKUs (coverage that would be LOST if using current-schema only) ===');
  const { rows: legacyOnlySample } = await client.query(`
    WITH per_sku AS (
      SELECT
        c.sku, c.filter_type,
        COUNT(*) FILTER (WHERE va ? 'model_family') AS current_count,
        COUNT(*) FILTER (WHERE (va ? 'model') AND NOT (va ? 'model_family')) AS legacy_count,
        jsonb_agg(va) FILTER (WHERE (va ? 'model') AND NOT (va ? 'model_family')) AS legacy_entries
      FROM elimfilters_catalog c,
        LATERAL jsonb_array_elements(
          CASE WHEN jsonb_typeof(c.vehicle_applications) = 'array' THEN c.vehicle_applications ELSE '[]'::jsonb END
        ) va
      WHERE c.duty = 'LIGHT_DUTY'
      GROUP BY c.sku, c.filter_type
    )
    SELECT sku, filter_type, legacy_count, legacy_entries
    FROM per_sku
    WHERE current_count = 0 AND legacy_count > 0
    LIMIT 10
  `);
  legacyOnlySample.forEach(r => {
    console.log(`  ${r.sku} (${r.filter_type}) - ${r.legacy_count} legacy-only vehicle entries`);
    console.log('   ', JSON.stringify(r.legacy_entries).slice(0, 300));
  });

  console.log('\n=== 4. Mixed-SKU sample: does legacy duplicate current, or add unique vehicles? ===');
  const { rows: mixedSample } = await client.query(`
    SELECT sku, vehicle_applications
    FROM elimfilters_catalog c
    WHERE duty = 'LIGHT_DUTY'
      AND EXISTS (SELECT 1 FROM jsonb_array_elements(vehicle_applications) va WHERE va ? 'model_family')
      AND EXISTS (SELECT 1 FROM jsonb_array_elements(vehicle_applications) va WHERE (va ? 'model') AND NOT (va ? 'model_family'))
    LIMIT 2
  `);
  mixedSample.forEach(r => {
    console.log(`\n  SKU: ${r.sku}`);
    console.log('  ', JSON.stringify(r.vehicle_applications, null, 2).slice(0, 1500));
  });

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
