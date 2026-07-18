'use strict';
/**
 * Run on Render Shell:
 *   node scripts/migrations/run_020_remove_redundant_technology_prefix.js           (dry run — no changes)
 *   node scripts/migrations/run_020_remove_redundant_technology_prefix.js --apply   (writes changes)
 *
 * Reported issue: HD product descriptions read
 *   "ELIMFILTERS SYNTRAX Lube Filter Spin-On OD 136 mm × L 308 mm. ...
 *    SYNTRAX advanced synthetic media removes harmful wear particles..."
 * — the technology name is stated twice: once immediately after ELIMFILTERS,
 * then again a sentence later where the technology is actually introduced.
 * Per ELIMFILTERS: the leading mention is redundant and should be dropped,
 * so the sentence reads "ELIMFILTERS Lube Filter Spin-On OD 136 mm × L 308 mm...".
 *
 * This is a systemic pattern from the Donaldson HD description template, not
 * a one-SKU issue: every donaldson_*_results.json source file (lube, fuel,
 * air, hydraulic, cabin, coolant, air-dryer) uses the same
 * "ELIMFILTERS {TECH} {FilterType}... {TECH} advanced/precision/etc..."
 * structure. See scripts/donaldson_*_results.json (already fixed in this
 * same commit) for the source-data side of this fix.
 *
 * Detection is intentionally structural rather than keyed off the row's
 * `technology` column (which can mismatch the description text due to
 * unrelated typos/history): it looks for an ALL-CAPS token immediately
 * after "ELIMFILTERS " at the very start of the description, and only
 * strips it if that exact token reappears later in the same description
 * (proving it really is a duplicate mention, not the only mention). Many
 * hydraulic descriptions, for example, mention NANOFORCE only once — those
 * are correctly left untouched.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');

function stripRedundantTechPrefix(desc) {
  if (typeof desc !== 'string') return null;
  const m = desc.match(/^ELIMFILTERS\s+([A-Z][A-Z0-9]{2,20})(?:™)?[.,]?\s+/);
  if (!m) return null;
  const tech = m[1];
  const rest = desc.slice(m[0].length);
  const reappearRe = new RegExp('\\b' + tech + '(?:™)?\\b');
  if (!reappearRe.test(rest)) return null;
  return 'ELIMFILTERS ' + rest;
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();

  const { rows } = await client.query(`
    SELECT sku, filter_type, technology, description
    FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY'
      AND description IS NOT NULL
      AND description LIKE 'ELIMFILTERS %'
  `);

  console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN (pass --apply to write changes)'}`);
  console.log(`Rows scanned: ${rows.length}\n`);

  let changed = 0;
  const byFilterType = {};

  for (const r of rows) {
    const fixed = stripRedundantTechPrefix(r.description);
    if (fixed === null || fixed === r.description) continue;

    changed++;
    byFilterType[r.filter_type] = (byFilterType[r.filter_type] || 0) + 1;

    if (changed <= 15) {
      console.log(`${r.sku}  (${r.filter_type} / ${r.technology})`);
      console.log(`  before: ${r.description.slice(0, 110)}...`);
      console.log(`  after:  ${fixed.slice(0, 110)}...`);
    }

    if (APPLY) {
      await client.query(
        `UPDATE elimfilters_catalog SET description = $2 WHERE sku = $1`,
        [r.sku, fixed]
      );
    }
  }

  if (changed > 15) console.log(`  ... and ${changed - 15} more`);

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
