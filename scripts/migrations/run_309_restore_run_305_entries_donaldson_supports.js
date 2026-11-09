'use strict';

/**
 * Restore 5 reference entries that run_305 removed although Donaldson's own cross-reference search lists them for the
 * SKU's own base part (checked per brand, 2026-11-08):
 *   EH61735  F.B.O. 45252   -> Donaldson lists it for P171735
 *   EH61736  F.B.O. 45253   -> Donaldson lists it for P171736
 *   EA20161  DRESSER 67219 and KOMATSU 67219 -> Donaldson lists them for G100161
 *   EA27455  NAPA 6857      -> Donaldson lists it for P537455
 * run_305 judged the number by the other SKU's official page without looking at the brand; the same number is used by
 * different brands for different Donaldson parts. EA17360 (5829830, LA940) was correct and stays removed.
 * Source of the restored values: the run_305 snapshot (db_snapshot_pre_run305_exec.json), entries and exact_part_reference rows.
 *
 * Dry-run by default (ROLLBACK). --execute commits. --snapshot <file> writes before-values for revert.
 */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const FROM = arg('--from') || 'C:/ELIMSERVER/evidence/hd-audit-20261106/db_snapshot_pre_run305_exec.json';
// sku -> normalized codes to restore
const RESTORE = { EH61735: ['45252'], EH61736: ['45253'], EA20161: ['67219'], EA27455: ['6857'] };
const norm = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const codeOf = (e) => norm(e && typeof e === 'object' ? e.code || e.reference : e);
const arr = (v) => (Array.isArray(v) ? v : []);

(async () => {
  const src = JSON.parse(fs.readFileSync(FROM, 'utf8'));
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', restored: [] };
  const snap = { rows: [] };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const skus = Object.keys(RESTORE);
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) FOR UPDATE', [skus])).rows;
    const othersHash = () => db.query(`SELECT md5(string_agg(md5(e::text),'|' ORDER BY e.sku)) h FROM public.elimfilters_catalog e WHERE NOT (e.sku=ANY($1::text[]))`, [skus]).then((r) => r.rows[0].h);
    const before = await othersHash();
    const conflictsBefore = (await db.query('SELECT count(*)::int n FROM public.exact_part_conflicts WHERE skus && $1::varchar[]', [skus])).rows[0].n;

    for (const sku of skus) {
      const cur = rows.find((r) => r.sku === sku), old = src.rows.find((r) => r.sku === sku);
      if (!cur || !old || cur.duty !== 'HEAVY_DUTY' || !cur.catalog_active) throw new Error('ROW ' + sku);
      const want = new Set(RESTORE[sku]);
      const patch = { oem_codes: [...arr(cur.oem_codes)], competitor_codes: [...arr(cur.competitor_codes)] };
      let added = 0;
      for (const f of ['oem_codes', 'competitor_codes']) {
        for (const e of arr(old[f])) {
          const k = codeOf(e);
          if (!want.has(k) || patch[f].some((x) => codeOf(x) === k && norm(x.manufacturer || x.brand) === norm(e.manufacturer || e.brand))) continue;
          patch[f].push(e); added++;
        }
      }
      if (!added) throw new Error('NOTHING_TO_RESTORE ' + sku);
      assertGovernedCatalogPatch(cur, patch);
      snap.rows.push(cur);
      await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [sku, JSON.stringify(patch.oem_codes), JSON.stringify(patch.competitor_codes)]);
      let epr = 0;
      for (const r of src.exact_part_reference.filter((x) => x.sku === sku && want.has(norm(x.part_number)))) {
        epr += (await db.query(`INSERT INTO public.exact_part_reference(reference_type,brand,part_number,sku,source) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (reference_type,brand,part_number,sku,source) DO NOTHING`, [r.reference_type, r.brand, r.part_number, r.sku, r.source])).rowCount;
      }
      const inCache = (await db.query(`SELECT count(*)::int n FROM public.crossref_resolved_cache WHERE sku=$1 AND upper(regexp_replace(code,'[^A-Za-z0-9]','','g'))=ANY($2::text[])`, [sku, [...want]])).rows[0].n;
      if (!inCache) throw new Error('NOT_IN_CACHE ' + sku);
      report.restored.push({ sku, entries: added, exact_part_reference: epr, cache_rows: inCache });
    }
    if ((await othersHash()) !== before) throw new Error('OTHER_ROWS_CHANGED');
    report.conflicts_before = conflictsBefore;
    report.conflicts_after = (await db.query('SELECT count(*)::int n FROM public.exact_part_conflicts WHERE skus && $1::varchar[]', [skus])).rows[0].n;
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify(snap, null, 1));
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
