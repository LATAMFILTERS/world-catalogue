'use strict';
/**
 * Run on Render Shell:
 *   node scripts/migrations/run_023_strip_fits_suffix_from_descriptions.js           (dry run — no changes)
 *   node scripts/migrations/run_023_strip_fits_suffix_from_descriptions.js --apply   (writes changes)
 *
 * Reported: descriptions end with a redundant equipment-fitment list,
 * e.g. "...Fits: ATLAS COPCO DM45 HP, ATLAS COPCO DM50, ATLAS COPCO
 * DM50LP, +299 more." — this duplicates the Equipment Applications column
 * already rendered separately in the results card (part-search/results.html
 * renderCard(), the "Equipment / Vehicle" column built from
 * p.equipment_applications). Per ELIMFILTERS: the "Fits: ..." segment does
 * not belong in the description text.
 *
 * This strips everything from " Fits:" to the end of the description,
 * trimming trailing whitespace. Descriptions without a "Fits:" segment are
 * left untouched. Source data side already fixed in
 * scripts/donaldson_*_results.json and scripts/donaldson_import_ready.jsonl.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');

function stripFits(desc) {
  if (typeof desc !== 'string') return null;
  const idx = desc.indexOf(' Fits:');
  if (idx === -1) return null;
  return desc.slice(0, idx).replace(/\s+$/, '');
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();

  const { rows } = await client.query(`
    SELECT sku, filter_type, description
    FROM elimfilters_catalog
    WHERE description LIKE '% Fits:%'
  `);

  console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN (pass --apply to write changes)'}`);
  console.log(`Rows scanned: ${rows.length}\n`);

  let changed = 0;
  const byFilterType = {};

  for (const r of rows) {
    const fixed = stripFits(r.description);
    if (fixed === null) continue;

    changed++;
    byFilterType[r.filter_type] = (byFilterType[r.filter_type] || 0) + 1;

    if (changed <= 10) {
      console.log(`${r.sku}  (${r.filter_type})`);
      console.log(`  before: ...${r.description.slice(-90)}`);
      console.log(`  after:  ...${fixed.slice(-90)}`);
    }

    if (APPLY) {
      await client.query(`UPDATE elimfilters_catalog SET description = $2 WHERE sku = $1`, [r.sku, fixed]);
    }
  }

  if (changed > 10) console.log(`  ... and ${changed - 10} more`);

  console.log(`\nTotal descriptions changed: ${changed}`);
  console.log('\nBy filter_type:');
  Object.entries(byFilterType).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

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
