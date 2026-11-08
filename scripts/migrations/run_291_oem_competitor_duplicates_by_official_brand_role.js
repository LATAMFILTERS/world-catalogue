'use strict';

/**
 * Same rule as run_274 (a code held in both oem_codes and competitor_codes of an
 * active HD product stays only in the list its brand belongs to; no brand+code
 * pair is lost), applied with the brand classes derived from the manufacturers'
 * own published roles (run_291_brand_classes_official_evidence.json) for brands
 * run_274 left unclassified. Products the write gateway refuses are skipped.
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');
const CLASSES = require('./run_291_brand_classes_official_evidence.json');

const APPLY = process.argv.includes('--execute');
// --only-skus <file>: restrict to the SKUs listed (one per line). --snapshot <file.json>: write the before-values of every changed SKU (revert source).
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const ONLY = arg('--only-skus') ? new Set(require('fs').readFileSync(arg('--only-skus'), 'utf8').split(/\s+/).filter(Boolean)) : null;
const SNAPSHOT = arg('--snapshot');
const snap = [];
const SOURCE = 'OFFICIAL_ROLE_BRAND_CLASS_20261107';
const EQUIPMENT = new Set(CLASSES.EQUIPMENT);
const FILTER = new Set(CLASSES.FILTER);

const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const codeOf = (e) => norm(e && typeof e === 'object' ? e.code || e.reference : '');
const brandOf = (e) => norm(e && typeof e === 'object' ? e.manufacturer || e.brand : '');
const classOf = (e) => (FILTER.has(brandOf(e)) ? 'FILTER' : EQUIPMENT.has(brandOf(e)) ? 'EQUIPMENT' : null);
const pairKey = (e) => `${brandOf(e)}::${codeOf(e)}`;
const relabel = (e, classification) => {
  const { classification: _c, classification_source: _s, source_type: _t, ...rest } = e;
  return { ...rest, classification, classification_source: SOURCE };
};

// Returns the new lists for one product, or null when nothing changes.
function plan(row) {
  const oem = Array.isArray(row.oem_codes) ? row.oem_codes : [];
  const comp = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
  const base = norm(row.codigo_base);
  const oemCodes = new Set(oem.map(codeOf));
  const both = new Set(comp.map(codeOf).filter((c) => c && c !== base && oemCodes.has(c)));
  if (!both.size) return null;

  const leavesOem = (e) => both.has(codeOf(e)) && classOf(e) === 'FILTER';
  const leavesComp = (e) => both.has(codeOf(e)) && classOf(e) === 'EQUIPMENT';
  const oemKeys = new Set(oem.filter((e) => !leavesOem(e)).map(pairKey));
  const compKeys = new Set(comp.filter((e) => !leavesComp(e)).map(pairKey));

  const toComp = [];
  for (const e of oem.filter(leavesOem)) {
    if (!compKeys.has(pairKey(e))) { compKeys.add(pairKey(e)); toComp.push(relabel(e, 'COMPETITOR')); }
  }
  const toOem = [];
  for (const e of comp.filter(leavesComp)) {
    if (!oemKeys.has(pairKey(e))) { oemKeys.add(pairKey(e)); toOem.push(relabel(e, 'OEM')); }
  }
  const newOem = [...oem.filter((e) => !leavesOem(e)), ...toOem];
  const newComp = [...comp.filter((e) => !leavesComp(e)), ...toComp];
  if (newOem.length === oem.length && newComp.length === comp.length && !toOem.length && !toComp.length) return null;

  const newOemCodes = new Set(newOem.map(codeOf));
  return {
    oem_codes: newOem,
    competitor_codes: newComp,
    left_oem: oem.length - (newOem.length - toOem.length),
    left_competitor: comp.length - (newComp.length - toComp.length),
    moved_to_oem: toOem.length,
    moved_to_competitor: toComp.length,
    codes_in_both_before: both.size,
    codes_in_both_after: new Set(newComp.map(codeOf).filter((c) => c && c !== base && newOemCodes.has(c))).size,
  };
}

function selfCheck() {
  const row = {
    codigo_base: 'P550416',
    oem_codes: [{ code: '5551297', manufacturer: 'ALLISON' }, { code: '111', manufacturer: 'BALDWIN' }, { code: '9', manufacturer: 'NOBODY KNOWS' }],
    competitor_codes: [{ code: '5551-297', manufacturer: 'ALLISON' }, { code: '111', manufacturer: 'BALDWIN' }, { code: '9', manufacturer: 'NOBODY KNOWS' }],
  };
  const p = plan(row);
  const has = (list, brand, code) => list.some((e) => brandOf(e) === norm(brand) && codeOf(e) === code);
  const ok = has(p.oem_codes, 'ALLISON', '5551297') && !has(p.competitor_codes, 'ALLISON', '5551297')
    && !has(p.oem_codes, 'BALDWIN', '111') && has(p.competitor_codes, 'BALDWIN', '111')
    && has(p.oem_codes, 'NOBODY KNOWS', '9') && has(p.competitor_codes, 'NOBODY KNOWS', '9')
    && p.codes_in_both_before === 3 && p.codes_in_both_after === 1;
  if (!ok) throw new Error(`SELF_CHECK_FAILED ${JSON.stringify(p)}`);
  console.log('self-check ok');
}

if (process.argv.includes('--self-check')) { selfCheck(); return; }

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', products_changed: 0, left_oem: 0, left_competitor: 0, moved_to_oem: 0, moved_to_competitor: 0,
    codes_in_both_before: 0, codes_in_both_after: 0, products_fully_resolved: 0,
    skipped_by_gateway: 0, gateway_reasons: {} };

  try {
    await db.query('BEGIN');
    const conflictProducts = () => db.query(
      `SELECT count(DISTINCT v.sku)::int AS n FROM public.catalog_reference_classification_conflicts_v v
       JOIN public.elimfilters_catalog c ON c.sku=v.sku WHERE c.duty='HEAVY_DUTY' AND c.catalog_active`).then((r) => r.rows[0].n);
    report.active_products_in_conflict_before = await conflictProducts();

    const rows = (await db.query(
      `SELECT * FROM public.elimfilters_catalog c
       WHERE c.duty='HEAVY_DUTY' AND c.sku IN (SELECT sku FROM public.catalog_reference_classification_conflicts_v)
       ORDER BY c.sku FOR UPDATE OF c`)).rows;

    for (const row of rows) {
      if (ONLY && !ONLY.has(row.sku)) continue;
      const p = plan(row);
      if (!p) continue;
      const pairsBefore = new Set([...(row.oem_codes || []), ...(row.competitor_codes || [])].map(pairKey));
      const pairsAfter = new Set([...p.oem_codes, ...p.competitor_codes].map(pairKey));
      if (pairsBefore.size !== pairsAfter.size || [...pairsBefore].some((k) => !pairsAfter.has(k))) throw new Error(`REFERENCE_LOST ${row.sku}`);

      const patch = { oem_codes: p.oem_codes, competitor_codes: p.competitor_codes };
      // The write gateway refuses reference patches on a product whose base is
      // not verified. Those products are left as they are and counted.
      try {
        assertGovernedCatalogPatch(row, patch);
      } catch (e) {
        if (e.code !== 'CATALOG_PATCH_GATEWAY_BLOCKED') throw e;
        report.skipped_by_gateway += 1;
        for (const reason of e.validation.reasons) report.gateway_reasons[reason] = (report.gateway_reasons[reason] || 0) + 1;
        continue;
      }
      // trg_sync_crossref_cache rebuilds crossref_resolved_cache for the row on this update
      await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1',
        [row.sku, JSON.stringify(p.oem_codes), JSON.stringify(p.competitor_codes)]);
      snap.push({ sku: row.sku, fully_resolved: p.codes_in_both_after === 0, before: { oem_codes: row.oem_codes, competitor_codes: row.competitor_codes }, after: patch });
      report.products_changed += 1;
      for (const k of ['left_oem', 'left_competitor', 'moved_to_oem', 'moved_to_competitor', 'codes_in_both_before', 'codes_in_both_after']) report[k] += p[k];
      if (p.codes_in_both_after === 0) report.products_fully_resolved += 1;
    }

    report.active_products_in_conflict_after = await conflictProducts();
    if (SNAPSHOT) require('fs').writeFileSync(SNAPSHOT, JSON.stringify(snap, null, 1));
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    await db.end();
  }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
