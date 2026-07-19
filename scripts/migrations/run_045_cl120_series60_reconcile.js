'use strict';
/**
 * Run on Render Shell (read-only, makes no changes):
 *   node scripts/migrations/run_045_cl120_series60_reconcile.js
 *
 * run_044 (real Detroit OEM number lookup) and run_043
 * (equipment_applications tag lookup) returned ZERO overlapping SKUs
 * across oil, fuel primary (water), fuel secondary, and coolant for
 * the FREIGHTLINER COLUMBIA CL120 + Detroit Diesel Series 60 pilot.
 * That is too consistent across 4 independent categories to be
 * coincidence.
 *
 * This dumps the FULL oem_codes and competitor_codes for every SKU
 * that run_043 found via equipment_applications tagging, so we can see
 * what real cross-reference data (if any) those SKUs actually carry -
 * instead of reverse-searching from a fixed list of guessed numbers.
 * Also flags any ED4-prefixed "air" result as a likely air-dryer
 * miscategorization (DRYCORE = compressed air/pneumatic, not engine
 * intake) per CLAUDE.md's SKU prefix + technology mapping tables.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const CANDIDATE_SKUS = [
  // air
  'EA17817', 'ED47747', 'ED47750',
  // fuel (secondary/fine)
  'EF91247', 'EF92005', 'EF92101', 'EF95507', 'EF95636',
  // hydraulic (out of scope for this 5-filter kit, included for completeness)
  'EH60300', 'EH65153', 'EH66107', 'EH66551', 'EH67130', 'EH67407', 'EH67969', 'EH68936', 'EH69444',
  // oil
  'EL83724', 'EL86397', 'EL87811',
  // other/coolant
  'EW72053', 'EW72121', 'EW72126', 'EW72171',
  // water (fuel primary)
  'ES90253', 'ES91065', 'ES91258', 'ES91280', 'ES99513', 'ES99532', 'ES99728', 'ES99870', 'ES99968',
];

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();

  const { rows } = await client.query(
    `SELECT sku, codigo_base, filter_type, technology, duty, oem_codes, competitor_codes
     FROM elimfilters_catalog
     WHERE sku = ANY($1)
     ORDER BY filter_type, sku`,
    [CANDIDATE_SKUS]
  );

  let currentType = null;
  for (const r of rows) {
    if (r.filter_type !== currentType) {
      currentType = r.filter_type;
      console.log(`\n=== ${currentType} ===`);
    }
    const flag = /^ED4/.test(r.sku) ? '  [!] ED4 prefix = Air Dryer (DRYCORE), likely NOT an engine intake filter' : '';
    console.log(`\n${r.sku}  (${r.codigo_base})  ${r.technology}  duty=${r.duty}${flag}`);
    const oem = Array.isArray(r.oem_codes) ? r.oem_codes : [];
    const comp = Array.isArray(r.competitor_codes) ? r.competitor_codes : [];
    console.log(`  oem_codes (${oem.length}): ${oem.map(c => `${c.manufacturer}:${c.code}`).join(', ') || '(none)'}`);
    console.log(`  competitor_codes (${comp.length}): ${comp.map(c => `${c.brand}:${c.code}`).join(', ') || '(none)'}`);
  }

  const found = new Set(rows.map(r => r.sku));
  const missing = CANDIDATE_SKUS.filter(s => !found.has(s));
  if (missing.length) console.log(`\nNot found in catalog: ${missing.join(', ')}`);

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
