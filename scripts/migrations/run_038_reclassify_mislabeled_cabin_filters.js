'use strict';
/**
 * Run on Render Shell:
 *   node scripts/migrations/run_038_reclassify_mislabeled_cabin_filters.js           (dry run — no changes)
 *   node scripts/migrations/run_038_reclassify_mislabeled_cabin_filters.js --apply   (writes changes)
 *
 * run_036 found 17 EA3 (LD Air Filter) SKUs whose oem_codes cross-
 * reference Toyota's cabin/AC filter family (87139-xxxxx) alongside
 * other brands' cabin filter families (Subaru 72880-xxxxx, WIX 244xx,
 * Daihatsu 17800-87820-xxx) - real-world cabin filter part number
 * families, not engine air filter ones. Confirmed by ELIMFILTERS:
 * these are cabin filters mislabeled under the air filter prefix, not
 * a duplicate cross-reference issue.
 *
 * Renames each: EA3{digits} -> EC3{digits} (same 4 digits, per
 * ELIMFILTERS direction), and updates filter_type to match the
 * convention already used by real EC3 rows (detected below rather
 * than hardcoded).
 *
 * Safety:
 *   - Aborts a given rename if the target EC3 SKU already exists
 *     (collision) - does not overwrite existing data.
 *   - Aborts a given rename if the SKU is already referenced by
 *     kit_components (FK has no ON UPDATE CASCADE) - none of the 17
 *     are expected to be in a kit yet, but this is checked rather
 *     than assumed.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');

const EA3_SKUS = [
  'EA30007', 'EA30013', 'EA30032', 'EA30342', 'EA31828', 'EA31912',
  'EA31919', 'EA32023', 'EA32032', 'EA32035', 'EA32131', 'EA32226',
  'EA32246', 'EA32345', 'EA33847', 'EA34017', 'EA35038',
];

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN (pass --apply to write changes)'}`);

  // Detect the dominant filter_type label used by real EC3 rows
  const { rows: ec3Types } = await client.query(`
    SELECT filter_type, COUNT(*) AS n FROM elimfilters_catalog
    WHERE sku LIKE 'EC3%' GROUP BY filter_type ORDER BY n DESC
  `);
  console.log('\nExisting EC3 filter_type distribution:');
  ec3Types.forEach(r => console.log(`  ${r.filter_type}  |  ${r.n}`));
  const targetFilterType = ec3Types[0]?.filter_type || 'Cabin Filter';
  console.log(`Using filter_type: ${targetFilterType}`);

  let renamed = 0, skippedCollision = 0, skippedInKit = 0, skippedMissing = 0;

  for (const oldSku of EA3_SKUS) {
    const digits = oldSku.slice(3);
    const newSku = 'EC3' + digits;

    const exists = await client.query('SELECT sku FROM elimfilters_catalog WHERE sku = $1', [oldSku]);
    if (!exists.rows.length) {
      console.log(`  ${oldSku}: SKIP - source row no longer exists`);
      skippedMissing++;
      continue;
    }

    const collision = await client.query('SELECT sku FROM elimfilters_catalog WHERE sku = $1', [newSku]);
    if (collision.rows.length) {
      console.log(`  ${oldSku} -> ${newSku}: SKIP - target SKU already exists (collision, needs manual review)`);
      skippedCollision++;
      continue;
    }

    const inKit = await client.query('SELECT kit_sku FROM kit_components WHERE filter_sku = $1', [oldSku]);
    if (inKit.rows.length) {
      console.log(`  ${oldSku} -> ${newSku}: SKIP - already referenced by kit(s) ${inKit.rows.map(r => r.kit_sku).join(', ')}, rename would break FK`);
      skippedInKit++;
      continue;
    }

    console.log(`  ${oldSku} -> ${newSku}: OK`);
    renamed++;

    if (APPLY) {
      await client.query(
        'UPDATE elimfilters_catalog SET sku = $2, filter_type = $3 WHERE sku = $1',
        [oldSku, newSku, targetFilterType]
      );
    }
  }

  console.log(`\nRenamed: ${renamed}  |  Skipped (collision): ${skippedCollision}  |  Skipped (in kit): ${skippedInKit}  |  Skipped (missing): ${skippedMissing}`);
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
