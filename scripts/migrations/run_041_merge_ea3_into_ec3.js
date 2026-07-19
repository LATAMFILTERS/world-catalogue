'use strict';
/**
 * Run on Render Shell:
 *   node scripts/migrations/run_041_merge_ea3_into_ec3.js           (dry run — no changes)
 *   node scripts/migrations/run_041_merge_ea3_into_ec3.js --apply   (writes changes)
 *
 * run_040 found that for 16 of the 17 mislabeled EA3 "cabin filter"
 * SKUs, the matching EC3 twin already exists but is almost entirely
 * empty (0 oem_codes / 0 competitor_codes in most cases), while the
 * EA3 version carries all the real cross-reference data (Toyota,
 * Subaru, WIX, Daihatsu, etc.). One exception: EC30013 has 31
 * competitor_codes of its own that EA30013 lacks, so a blind overwrite
 * would lose data - this merges (union) both sides' oem_codes,
 * competitor_codes, and vehicle_applications into the EC3 row instead
 * of overwriting, then removes the now-redundant EA3 duplicate.
 *
 * EA33847/EC33847 is the one pair where EC3 already has 100% of EA3's
 * data (0 unique) - handled the same way (union is a no-op there,
 * EA3 gets removed as a pure duplicate).
 *
 * Safety: aborts a given pair's EA3 deletion if that SKU is
 * referenced by kit_components (FK has no ON DELETE handling assumed
 * safe here - none are expected to be in a kit yet, checked rather
 * than assumed).
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');

const PAIRS = [
  ['EA30007', 'EC30007'], ['EA30013', 'EC30013'], ['EA30032', 'EC30032'],
  ['EA30342', 'EC30342'], ['EA31828', 'EC31828'], ['EA31919', 'EC31919'],
  ['EA32023', 'EC32023'], ['EA32032', 'EC32032'], ['EA32035', 'EC32035'],
  ['EA32131', 'EC32131'], ['EA32226', 'EC32226'], ['EA32246', 'EC32246'],
  ['EA32345', 'EC32345'], ['EA33847', 'EC33847'], ['EA34017', 'EC34017'],
  ['EA35038', 'EC35038'],
];

function refKey(r) {
  const brand = (r.manufacturer || r.brand || '').toUpperCase().trim();
  const code = (r.code || '').toUpperCase().replace(/[\s-]/g, '');
  return `${brand}|${code}`;
}

function mergeRefArrays(a, b) {
  const arrA = Array.isArray(a) ? a : [];
  const arrB = Array.isArray(b) ? b : [];
  const seen = new Map();
  [...arrA, ...arrB].forEach(r => {
    const k = refKey(r);
    if (!seen.has(k)) seen.set(k, r);
  });
  return [...seen.values()];
}

function mergeVehicleApps(a, b) {
  const arrA = Array.isArray(a) ? a : [];
  const arrB = Array.isArray(b) ? b : [];
  const seen = new Map();
  [...arrA, ...arrB].forEach(v => {
    const k = JSON.stringify(v);
    if (!seen.has(k)) seen.set(k, v);
  });
  return [...seen.values()];
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN (pass --apply to write changes)'}`);

  let merged = 0, skippedInKit = 0, skippedMissing = 0;

  for (const [ea3Sku, ec3Sku] of PAIRS) {
    const { rows } = await client.query(
      `SELECT sku, oem_codes, competitor_codes, vehicle_applications FROM elimfilters_catalog WHERE sku = ANY($1)`,
      [[ea3Sku, ec3Sku]]
    );
    const ea3 = rows.find(r => r.sku === ea3Sku);
    const ec3 = rows.find(r => r.sku === ec3Sku);

    if (!ea3 || !ec3) {
      console.log(`  ${ea3Sku}/${ec3Sku}: SKIP - one or both rows missing`);
      skippedMissing++;
      continue;
    }

    const inKit = await client.query('SELECT kit_sku FROM kit_components WHERE filter_sku = $1', [ea3Sku]);
    if (inKit.rows.length) {
      console.log(`  ${ea3Sku}: SKIP - already referenced by kit(s) ${inKit.rows.map(r => r.kit_sku).join(', ')}`);
      skippedInKit++;
      continue;
    }

    const mergedOem = mergeRefArrays(ea3.oem_codes, ec3.oem_codes);
    const mergedComp = mergeRefArrays(ea3.competitor_codes, ec3.competitor_codes);
    const mergedVeh = mergeVehicleApps(ea3.vehicle_applications, ec3.vehicle_applications);

    console.log(`  ${ea3Sku} -> ${ec3Sku}: oem_codes ${(ec3.oem_codes||[]).length}->${mergedOem.length}, competitor_codes ${(ec3.competitor_codes||[]).length}->${mergedComp.length}, vehicle_applications ${(ec3.vehicle_applications||[]).length}->${mergedVeh.length}, then delete ${ea3Sku}`);
    merged++;

    if (APPLY) {
      await client.query(
        `UPDATE elimfilters_catalog SET oem_codes = $2::jsonb, competitor_codes = $3::jsonb, vehicle_applications = $4::jsonb WHERE sku = $1`,
        [ec3Sku, JSON.stringify(mergedOem), JSON.stringify(mergedComp), JSON.stringify(mergedVeh)]
      );
      await client.query(`DELETE FROM elimfilters_catalog WHERE sku = $1`, [ea3Sku]);
    }
  }

  console.log(`\nMerged+deleted: ${merged}  |  Skipped (in kit): ${skippedInKit}  |  Skipped (missing): ${skippedMissing}`);
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
