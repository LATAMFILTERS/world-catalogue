'use strict';
/**
 * Run on Render Shell (read-only, makes no changes):
 *   node scripts/migrations/run_021_diagnose_fuel_hydraulic_tech_swap.js
 *
 * import_donaldson.py's TECH_MAP hardcodes:
 *   "EF9": "NANOFORCE™",   // Fuel filters
 *   "EH6": "SYNTAPORE™",   // Hydraulic filters
 *
 * This contradicts the authoritative technology→system mapping documented
 * in CLAUDE.md (from the 2026-06-23 CORE-EEAT audit):
 *   NANOFORCE  -> Hydraulic (ISO 16889, NFPA T2.14)
 *   SYNTAPORE  -> Fuel / HPCR injectors (ASTM D6304, ISO 12937)
 *
 * i.e. the two are swapped for these two prefixes. If real, every HD Fuel
 * row imported via /api/import/donaldson would have technology=NANOFORCE™
 * (should be SYNTAPORE™) and every HD Hydraulic row would have
 * technology=SYNTAPORE™ (should be NANOFORCE™).
 *
 * This script only counts and samples — it does not change anything.
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

  console.log('\n=== Fuel rows with technology = NANOFORCE (expected: SYNTAPORE) ===');
  const fuelWrong = await client.query(`
    SELECT sku, filter_type, technology
    FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY'
      AND filter_type ILIKE '%fuel%'
      AND technology ILIKE '%NANOFORCE%'
    ORDER BY sku
  `);
  console.log(`Count: ${fuelWrong.rows.length}`);
  fuelWrong.rows.slice(0, 10).forEach(r => console.log(`  ${r.sku}  ${r.filter_type}  ${r.technology}`));
  if (fuelWrong.rows.length > 10) console.log(`  ... and ${fuelWrong.rows.length - 10} more`);

  console.log('\n=== Hydraulic rows with technology = SYNTAPORE (expected: NANOFORCE) ===');
  const hydWrong = await client.query(`
    SELECT sku, filter_type, technology
    FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY'
      AND filter_type ILIKE '%hydraulic%'
      AND technology ILIKE '%SYNTAPORE%'
    ORDER BY sku
  `);
  console.log(`Count: ${hydWrong.rows.length}`);
  hydWrong.rows.slice(0, 10).forEach(r => console.log(`  ${r.sku}  ${r.filter_type}  ${r.technology}`));
  if (hydWrong.rows.length > 10) console.log(`  ... and ${hydWrong.rows.length - 10} more`);

  console.log('\n=== For comparison: Fuel rows already correctly on SYNTAPORE ===');
  const fuelRight = await client.query(`
    SELECT COUNT(*) FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY' AND filter_type ILIKE '%fuel%' AND technology ILIKE '%SYNTAPORE%'
  `);
  console.log(`Count: ${fuelRight.rows[0].count}`);

  console.log('\n=== For comparison: Hydraulic rows already correctly on NANOFORCE ===');
  const hydRight = await client.query(`
    SELECT COUNT(*) FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY' AND filter_type ILIKE '%hydraulic%' AND technology ILIKE '%NANOFORCE%'
  `);
  console.log(`Count: ${hydRight.rows[0].count}`);

  console.log('\n=== All distinct (filter_type, technology) pairs for Fuel and Hydraulic HD rows ===');
  const pairs = await client.query(`
    SELECT filter_type, technology, COUNT(*) AS n
    FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY' AND (filter_type ILIKE '%fuel%' OR filter_type ILIKE '%hydraulic%')
    GROUP BY filter_type, technology
    ORDER BY filter_type, n DESC
  `);
  pairs.rows.forEach(r => console.log(`  ${r.filter_type} | ${r.technology} | ${r.n}`));

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
