'use strict';
/**
 * Run on Render Shell (read-only, makes no changes):
 *   node scripts/migrations/run_043_cl120_series60_candidates.js
 *
 * DURATECH HD pilot, re-scoped from Detroit Diesel DD15 to Detroit
 * Diesel Series 60 ("DD S60") per ELIMFILTERS direction. Lists ALL
 * candidate SKUs per filter_type for FREIGHTLINER COLUMBIA CL120 +
 * Series 60 - no automatic selection, a human confirms which exact
 * SKU goes in the kit.
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

  console.log('\n=== HD PLATFORM: FREIGHTLINER COLUMBIA CL120 + Detroit Diesel Series 60 ===');
  const { rows } = await client.query(`
    SELECT DISTINCT c.sku, c.codigo_base, c.filter_type, c.technology, eq->>'equipment' AS equipment, eq->>'engine' AS engine
    FROM elimfilters_catalog c,
      LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(c.equipment_applications) = 'array' THEN c.equipment_applications ELSE '[]'::jsonb END
      ) eq
    WHERE c.duty = 'HEAVY_DUTY'
      AND eq->>'equipment' ILIKE '%FREIGHTLINER%CL120%'
      AND eq->>'engine' ILIKE '%Series 60%'
    ORDER BY c.filter_type, c.sku
  `);

  console.log(`Total matches: ${rows.length}`);
  const byType = {};
  rows.forEach(r => (byType[r.filter_type] = byType[r.filter_type] || []).push(r));
  Object.entries(byType).forEach(([type, list]) => {
    console.log(`\n  -- ${type} (${list.length} candidates) --`);
    list.forEach(r => console.log(`     ${r.sku}  (${r.codigo_base})  ${r.technology}  engine="${r.engine}"`));
  });
  if (!rows.length) console.log('  No matches.');

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
