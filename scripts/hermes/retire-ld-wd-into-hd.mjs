#!/usr/bin/env node
// Retire LD SKUs whose ONLY base is a MANN WD hydraulic code into the single HD
// hydraulic SKU (EH6) that already lists that WD as a competitor code.
//
// Operator ruling (Victor, 2026-10-24): a WD hydraulic is Heavy Duty and must not
// appear in Light Duty. Same procedure as run_275 (EL36219 -> EH60416):
//   1. LD row: catalog_active=false, enrichment_data.resolution_status = INACTIVE_RETIRED,
//      superseded_by = HD SKU (row and history kept; reversible).
//   2. crossref_resolved_cache rows of the LD SKU removed (an inactive row must not answer).
//   3. exact_part_reference SUPERSEDED ELIMFILTERS <LD SKU> -> HD SKU, so the old SKU
//      still finds the product.
//   4. Active LD canonical identity, if any, set to RETIRED.
// References and applications of the LD row are NOT carried to HD (no evidence here);
// they are listed in the report for review.
//
// Input: the JSON produced by ld-hydraulic-wd-inventory.mjs. Only rows with
// wd_scope=WD_SOLE_BASE and status=HD_HAS_WD_AS_COMPETITOR are processed.
// DRY RUN by default (everything runs, then ROLLBACK).
// Execute: --execute --confirm-count <N>  (N = eligible rows reported by the dry run).
//
// Usage:
//   node scripts/hermes/retire-ld-wd-into-hd.mjs --inventory out\ld-wd-inventory\inventory-....json
//   node scripts/hermes/retire-ld-wd-into-hd.mjs --inventory <same> --execute --confirm-count 14

import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, cur, i, arr) => {
  if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return acc;
}, []));
if (!args.inventory) throw new Error('--inventory <file> is required');
const execute = args.execute === 'true';
const norm = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const codeOf = (e) => (e && typeof e === 'object' ? e.code || e.part_number || e.reference : e);

const inventory = JSON.parse(fs.readFileSync(args.inventory, 'utf8'));
// --exclude EL33008,EL3xxxx : rows held back for review (e.g. non-standard HD SKU format).
const exclude = new Set(String(args.exclude || '').split(',').map((x) => x.trim().toUpperCase()).filter(Boolean));
// Standard HD SKU = 3-char prefix + 4 digits (EH6 + 4). A longer SKU is not a governed target.
const standardHd = (sku) => /^EH6\d{4}$/.test(sku);
const targets = inventory.filter((r) => r.wd_scope === 'WD_SOLE_BASE' && r.status === 'HD_HAS_WD_AS_COMPETITOR'
  && r.hd_matches.length === 1 && !exclude.has(r.ld_sku));
if (execute && Number(args['confirm-count']) !== targets.length) throw new Error(`--confirm-count must be ${targets.length}`);

const url = process.env.CATALOG_DATABASE_URL;
if (!url) throw new Error('CATALOG_DATABASE_URL is required');
if (!/@(127\.0\.0\.1|localhost)[:/]/.test(url)) throw new Error('database is not local');
const db = new pg.Client({ connectionString: url });
await db.connect();

const report = { mode: execute ? 'EXECUTE' : 'DRY_RUN_ROLLBACK', eligible: targets.length, retired: [], skipped: [] };
try {
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  for (const t of targets) {
    const ld = t.ld_sku; const hd = t.hd_matches[0].sku; const wd = t.wd_codes[0];
    const { rows } = await db.query(
      'SELECT sku, duty, catalog_active, codigo_base, oem_codes, competitor_codes, vehicle_applications, equipment_applications FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) FOR UPDATE',
      [[ld, hd]]);
    const L = rows.find((r) => r.sku === ld); const H = rows.find((r) => r.sku === hd);
    const skip = (reason) => report.skipped.push({ ld, hd, wd, reason });
    if (!L || L.duty !== 'LIGHT_DUTY' || !L.catalog_active) { skip('LD_ROW_CHANGED_OR_INACTIVE'); continue; }
    if (!H || H.duty !== 'HEAVY_DUTY' || !H.catalog_active || !hd.startsWith('EH6')) { skip('HD_TARGET_NOT_ACTIVE_EH6'); continue; }
    if (!standardHd(hd)) { skip('HD_TARGET_NON_STANDARD_SKU_FORMAT'); continue; }
    if (!(H.competitor_codes || []).some((e) => norm(codeOf(e)) === wd)) { skip('HD_TARGET_DOES_NOT_CITE_WD'); continue; }

    const u = await db.query(
      `UPDATE public.elimfilters_catalog
         SET catalog_active = false,
             enrichment_data = jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{resolution_status}', $2::jsonb)
       WHERE sku = $1 AND catalog_active`,
      [ld, JSON.stringify({
        state: 'INACTIVE_RETIRED',
        reason: 'LIGHT_DUTY_ROW_FOR_A_HEAVY_DUTY_MANN_WD_HYDRAULIC',
        superseded_by: hd,
        mann_wd_code: wd,
        decided_by: 'OPERATOR',
        updated_at: '2026-10-24',
        procedure: 'retire-ld-wd-into-hd (same as run_275)',
      })]);
    if (u.rowCount !== 1) throw new Error(`RETIRE_UPDATE_COUNT ${ld}`);
    const cache = (await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku = $1', [ld])).rowCount;
    await db.query(
      `INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source)
       VALUES ('SUPERSEDED', 'ELIMFILTERS', $1, $2, 'RETIRE_LD_WD_INTO_HD_20261024')
       ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`, [ld, hd]);
    const ident = (await db.query(
      `UPDATE ld_catalog.ld_canonical_product_identity SET status = 'RETIRED', updated_at = now()
       WHERE elimfilters_sku = $1 AND status = 'ACTIVE'`, [ld])).rowCount;

    const hdCodes = new Set([...(H.oem_codes || []), ...(H.competitor_codes || [])].map((e) => norm(codeOf(e))));
    const notCarried = [...(L.oem_codes || []), ...(L.competitor_codes || [])]
      .map((e) => ({ code: codeOf(e), manufacturer: e?.manufacturer || e?.brand || null }))
      .filter((e) => e.code && !hdCodes.has(norm(e.code)));
    report.retired.push({
      ld, hd, wd, cache_rows_removed: cache, identity_retired: ident,
      ld_vehicle_apps_not_carried: (L.vehicle_applications || []).length,
      ld_references_not_on_hd: notCarried.length,
    });
  }

  // Post-checks: no retired LD row is active; every successor reference exists.
  const ldSkus = report.retired.map((r) => r.ld);
  const stillActive = (await db.query('SELECT count(*)::int n FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) AND catalog_active', [ldSkus])).rows[0].n;
  if (stillActive) throw new Error(`POSTCHECK_ACTIVE_LD ${stillActive}`);
  report.superseded_refs = (await db.query(
    "SELECT count(*)::int n FROM public.exact_part_reference WHERE reference_type='SUPERSEDED' AND part_number = ANY($1::text[])", [ldSkus])).rows[0].n;

  await db.query(execute ? 'COMMIT' : 'ROLLBACK');
  report.transaction = execute ? 'COMMIT' : 'ROLLBACK';
} catch (e) {
  await db.query('ROLLBACK').catch(() => {});
  report.transaction = 'ROLLBACK_ERROR';
  report.error = e.message;
  process.exitCode = 1;
} finally {
  await db.end();
}
const out = path.join(path.dirname(args.inventory), `retire-${execute ? 'execute' : 'dryrun'}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(out, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, retired: report.retired.map((r) => `${r.ld} -> ${r.hd} (${r.wd}) apps_no_llevadas=${r.ld_vehicle_apps_not_carried} refs_no_en_hd=${r.ld_references_not_on_hd}`), file: out }, null, 2));
