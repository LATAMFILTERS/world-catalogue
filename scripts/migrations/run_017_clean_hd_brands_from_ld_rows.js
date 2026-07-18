'use strict';
/**
 * Run on Render Shell:
 *   node scripts/migrations/run_017_clean_hd_brands_from_ld_rows.js           (dry run — no changes)
 *   node scripts/migrations/run_017_clean_hd_brands_from_ld_rows.js --apply   (writes changes)
 *
 * FLEETGUARD, DONALDSON, and BALDWIN are Heavy Duty-only brands in this
 * catalog (confirmed by ELIMFILTERS). A code from one of them must never
 * appear on a LIGHT_DUTY row — but a large batch of MANN-based LD products
 * (EL3xxxx SKUs, across oil, air, cabin, and fuel filter types) ended up
 * with HD-brand cross-reference entries in oem_codes and/or competitor_codes,
 * most likely from the Donaldson-based competitor matrix (built for HD)
 * getting mixed into an LD import batch. See scripts/migrations/
 * run_016_diagnose_brand_duty_violations.js for the read-only scan that
 * found this.
 *
 * This removes only the offending entries from each array — every other
 * entry (MANN, MAHLE, BOSCH, FRAM, WIX, etc.) is left untouched. Rows with
 * no offending entries are not written at all.
 *
 * The root cause (POST /api/import/mann writing oem_codes/competitor_codes
 * from the import payload with no brand filtering) is already fixed in
 * server-original.js so future imports cannot reintroduce this.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');
const HD_ONLY_BRANDS = new Set(['FLEETGUARD', 'DONALDSON', 'BALDWIN']);

function normalizeBrand(s) {
  return String(s || '').toUpperCase().replace(/[®™]/g, '').replace(/[-+]/g, ' ').replace(/\s+/g, ' ').trim();
}

function stripHdOnlyBrandRefs(refs) {
  if (!Array.isArray(refs)) return refs;
  return refs.filter(r => !HD_ONLY_BRANDS.has(normalizeBrand(r?.manufacturer || r?.brand || '')));
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();

  const { rows } = await client.query(`
    SELECT sku, filter_type, oem_codes, competitor_codes
    FROM elimfilters_catalog
    WHERE duty = 'LIGHT_DUTY'
      AND (
        EXISTS (
          SELECT 1 FROM jsonb_array_elements(
            CASE WHEN jsonb_typeof(oem_codes) = 'array' THEN oem_codes ELSE '[]'::jsonb END
          ) AS ref
          WHERE UPPER(COALESCE(ref->>'manufacturer', ref->>'brand', '')) = ANY($1)
        )
        OR EXISTS (
          SELECT 1 FROM jsonb_array_elements(
            CASE WHEN jsonb_typeof(competitor_codes) = 'array' THEN competitor_codes ELSE '[]'::jsonb END
          ) AS ref
          WHERE UPPER(COALESCE(ref->>'manufacturer', ref->>'brand', '')) = ANY($1)
        )
      )
  `, [[...HD_ONLY_BRANDS]]);

  console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN (pass --apply to write changes)'}`);
  console.log(`Rows to clean: ${rows.length}\n`);

  let totalOemRemoved = 0;
  let totalCompRemoved = 0;
  const byFilterType = {};

  for (const r of rows) {
    const oemBefore = Array.isArray(r.oem_codes) ? r.oem_codes.length : 0;
    const compBefore = Array.isArray(r.competitor_codes) ? r.competitor_codes.length : 0;
    const newOem = stripHdOnlyBrandRefs(r.oem_codes || []);
    const newComp = stripHdOnlyBrandRefs(r.competitor_codes || []);
    const oemRemoved = oemBefore - newOem.length;
    const compRemoved = compBefore - newComp.length;
    totalOemRemoved += oemRemoved;
    totalCompRemoved += compRemoved;
    byFilterType[r.filter_type] = (byFilterType[r.filter_type] || 0) + oemRemoved + compRemoved;

    console.log(`${r.sku}  (${r.filter_type})  -oem_codes:${oemRemoved}  -competitor_codes:${compRemoved}`);

    if (APPLY) {
      await client.query(
        `UPDATE elimfilters_catalog SET oem_codes = $2::jsonb, competitor_codes = $3::jsonb WHERE sku = $1`,
        [r.sku, JSON.stringify(newOem), JSON.stringify(newComp)]
      );
    }
  }

  console.log(`\nTotal oem_codes entries removed: ${totalOemRemoved}`);
  console.log(`Total competitor_codes entries removed: ${totalCompRemoved}`);
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
