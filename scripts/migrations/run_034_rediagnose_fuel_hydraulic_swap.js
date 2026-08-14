'use strict';
/**
 * Run on Render Shell (read-only, makes no changes):
 *   node scripts/migrations/run_034_rediagnose_fuel_hydraulic_swap.js
 *
 * run_032's DURATECH pilot candidates for Freightliner CL120 + DD15
 * surfaced HD rows with the Fuel/Hydraulic technology swap again -
 * fuel rows on NANOFORCE (should be SYNTAPORE) and hydraulic rows on
 * SYNTAPORE (should be NANOFORCE) - even though run_022 already fixed
 * this once. The affected rows this time have Fleetguard-style
 * codigo_base values (HF..., ST..., TF..., FF...) rather than
 * Donaldson P-codes, suggesting they came from a different/later
 * import pass than the one run_022 covered, or were re-imported after
 * run_022 ran.
 *
 * Re-scans the whole HEAVY_DUTY catalog (same criteria as run_021/
 * run_022) to size the current regression before deciding whether a
 * cleanup pass is needed again.
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
  const { rows: fuelWrong } = await client.query(`
    SELECT sku, codigo_base, filter_type, technology
    FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY' AND filter_type ILIKE '%fuel%' AND technology = 'NANOFORCE™'
    ORDER BY sku
  `);
  console.log(`Count: ${fuelWrong.length}`);
  fuelWrong.slice(0, 15).forEach(r => console.log(`  ${r.sku}  (${r.codigo_base})  ${r.filter_type}`));
  if (fuelWrong.length > 15) console.log(`  ... and ${fuelWrong.length - 15} more`);

  console.log('\n=== Hydraulic rows with technology = SYNTAPORE (expected: NANOFORCE) ===');
  const { rows: hydWrong } = await client.query(`
    SELECT sku, codigo_base, filter_type, technology
    FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY' AND filter_type ILIKE '%hydraulic%' AND technology = 'SYNTAPORE™'
    ORDER BY sku
  `);
  console.log(`Count: ${hydWrong.length}`);
  hydWrong.slice(0, 15).forEach(r => console.log(`  ${r.sku}  (${r.codigo_base})  ${r.filter_type}`));
  if (hydWrong.length > 15) console.log(`  ... and ${hydWrong.length - 15} more`);

  console.log('\n=== codigo_base pattern breakdown of the still-wrong rows ===');
  const pattern = (cb) => {
    if (!cb) return 'null';
    if (/^P\d/.test(cb)) return 'Donaldson (P...)';
    if (/^HF/.test(cb)) return 'Fleetguard (HF...)';
    if (/^(ST|TF|FF)/.test(cb)) return 'Fleetguard-style (ST/TF/FF...)';
    return 'other';
  };
  const counts = {};
  [...fuelWrong, ...hydWrong].forEach(r => {
    const p = pattern(r.codigo_base);
    counts[p] = (counts[p] || 0) + 1;
  });
  console.log(counts);

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
