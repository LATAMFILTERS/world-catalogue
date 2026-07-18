'use strict';
/**
 * Run on Render Shell:
 *   node scripts/migrations/run_022_fix_fuel_hydraulic_technology.js           (dry run — no changes)
 *   node scripts/migrations/run_022_fix_fuel_hydraulic_technology.js --apply   (writes changes)
 *
 * Two independent problems found by run_021 in the `technology` column of
 * HEAVY_DUTY Fuel/Hydraulic rows:
 *
 * STEP 1 — decorruption. Some rows carry the old "™ inserted between every
 * letter" corruption (same bug fix_descriptions.js fixed in `description`,
 * but that script never touched `technology`):
 *   Fuel:       "S™Y™N™T™A™P™O™R™E™™"  (29 rows)
 *   Hydraulic:  "N™A™N™O™F™O™R™C™E™™"  (94 rows)
 * Stripping the ™ characters from these yields "SYNTAPORE" (a known typo of
 * SYNTEPORE) and "NANOFORCE" respectively — both already the CORRECT
 * technology for their filter_type, so this step only decorrupts, no swap
 * needed for these rows.
 *
 * STEP 2 — the Fuel/Hydraulic technology swap. import_donaldson.py's
 * TECH_MAP had EF9 (Fuel) -> NANOFORCE™ and EH6 (Hydraulic) -> SYNTEPORE™,
 * backwards from the audited mapping in CLAUDE.md (NANOFORCE = Hydraulic,
 * SYNTEPORE = Fuel). Confirmed live: 564 Fuel rows on NANOFORCE™, 525
 * Hydraulic rows on SYNTEPORE™. TECH_MAP is already fixed in
 * import_donaldson.py so future imports are correct; this step fixes the
 * already-imported rows. Runs after STEP 1 so decorrupted rows are already
 * on their correct value and are not touched again here.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN (pass --apply to write changes)'}`);

  // ── STEP 1: decorrupt ──────────────────────────────────────────────────
  console.log('\n=== STEP 1: decorrupt technology values with repeated ™ ===');
  const { rows: corrupted } = await client.query(`
    SELECT sku, filter_type, technology
    FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY'
      AND technology IS NOT NULL
      AND (LENGTH(technology) - LENGTH(REPLACE(technology, '™', ''))) > 1
  `);
  console.log(`Rows found: ${corrupted.length}`);

  const SPELLING_FIX = { SYNTAPORE: 'SYNTEPORE', INTAKCORE: 'INTEKCORE' };
  let step1Changed = 0;

  for (const r of corrupted) {
    const stripped = r.technology.replace(/™/g, '').toUpperCase();
    const corrected = SPELLING_FIX[stripped] || stripped;
    const fixed = corrected + '™';

    console.log(`  ${r.sku}  (${r.filter_type})  ${r.technology}  ->  ${fixed}`);
    step1Changed++;

    if (APPLY) {
      await client.query(`UPDATE elimfilters_catalog SET technology = $2 WHERE sku = $1`, [r.sku, fixed]);
    }
  }
  console.log(`Step 1 rows changed: ${step1Changed}`);

  // ── STEP 2: swap fix ────────────────────────────────────────────────────
  console.log('\n=== STEP 2: fix Fuel/Hydraulic technology swap ===');

  const { rows: fuelWrong } = await client.query(`
    SELECT sku FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY' AND filter_type ILIKE '%fuel%' AND technology = 'NANOFORCE™'
  `);
  console.log(`Fuel rows NANOFORCE™ -> SYNTEPORE™: ${fuelWrong.length}`);
  if (APPLY) {
    await client.query(`
      UPDATE elimfilters_catalog SET technology = 'SYNTEPORE™'
      WHERE duty = 'HEAVY_DUTY' AND filter_type ILIKE '%fuel%' AND technology = 'NANOFORCE™'
    `);
  }

  const { rows: hydWrong } = await client.query(`
    SELECT sku FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY' AND filter_type ILIKE '%hydraulic%' AND technology = 'SYNTEPORE™'
  `);
  console.log(`Hydraulic rows SYNTEPORE™ -> NANOFORCE™: ${hydWrong.length}`);
  if (APPLY) {
    await client.query(`
      UPDATE elimfilters_catalog SET technology = 'NANOFORCE™'
      WHERE duty = 'HEAVY_DUTY' AND filter_type ILIKE '%hydraulic%' AND technology = 'SYNTEPORE™'
    `);
  }

  console.log(`\nTotal rows changed: ${step1Changed + fuelWrong.length + hydWrong.length}`);
  if (!APPLY) {
    console.log('\nNo changes written. Re-run with --apply to commit these changes.');
  } else {
    console.log('\n✅ Changes committed.');
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
