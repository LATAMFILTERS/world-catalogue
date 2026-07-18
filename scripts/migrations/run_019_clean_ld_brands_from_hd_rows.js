'use strict';
/**
 * Run on Render Shell:
 *   node scripts/migrations/run_019_clean_ld_brands_from_hd_rows.js           (dry run — no changes)
 *   node scripts/migrations/run_019_clean_ld_brands_from_hd_rows.js --apply   (writes changes)
 *
 * Symmetric cleanup to run_017 (which removed FLEETGUARD/DONALDSON/BALDWIN
 * from LIGHT_DUTY rows). FRAM, NAPA, AC DELCO, PUROLATOR, CHAMPION, and SCT
 * are Light Duty-only brands in this catalog (confirmed by ELIMFILTERS) and
 * must never appear on a HEAVY_DUTY row.
 *
 * Scope is deliberately limited to these 6 confirmed brands. The other 12
 * candidates found by run_018 (BOSCH, MAHLE, HENGST, KNECHT, UFI, FILTRON,
 * SOFIMA, PURFLUX, MECAFILTER, COOPERS, CROSLAND, TECNOCAR) were confirmed
 * by ELIMFILTERS to be ambiguous — they have genuine industrial/Heavy Duty
 * lines in some markets, the same as MANN/WIX — so a code from one of them
 * on an HD row is not proof of an error and must NOT be removed here.
 *
 * This removes only the offending entries from each array — every other
 * entry (MANN, WIX, the 12 ambiguous brands, etc.) is left untouched. Rows
 * with no offending entries are not written at all.
 *
 * The root cause (POST /api/import/donaldson writing oem_codes/
 * competitor_codes from the import payload with no brand filtering) is
 * already fixed in server-original.js so future imports cannot
 * reintroduce this.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');
const LD_ONLY_BRANDS = new Set(['FRAM', 'NAPA', 'ACDELCO', 'AC DELCO', 'PUROLATOR', 'CHAMPION', 'SCT']);

function normalizeBrand(s) {
  return String(s || '').toUpperCase().replace(/[®™]/g, '').replace(/[-+]/g, ' ').replace(/\s+/g, ' ').trim();
}

function stripLdOnlyBrandRefs(refs) {
  if (!Array.isArray(refs)) return refs;
  return refs.filter(r => !LD_ONLY_BRANDS.has(normalizeBrand(r?.manufacturer || r?.brand || '')));
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
    WHERE duty = 'HEAVY_DUTY'
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
  `, [[...LD_ONLY_BRANDS]]);

  console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN (pass --apply to write changes)'}`);
  console.log(`Rows to clean: ${rows.length}\n`);

  let totalOemRemoved = 0;
  let totalCompRemoved = 0;
  const byFilterType = {};

  for (const r of rows) {
    const oemBefore = Array.isArray(r.oem_codes) ? r.oem_codes.length : 0;
    const compBefore = Array.isArray(r.competitor_codes) ? r.competitor_codes.length : 0;
    const newOem = stripLdOnlyBrandRefs(r.oem_codes || []);
    const newComp = stripLdOnlyBrandRefs(r.competitor_codes || []);
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
