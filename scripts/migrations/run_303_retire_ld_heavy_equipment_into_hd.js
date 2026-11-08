'use strict';

/**
 * Retire 10 Light Duty rows whose manufacturer references and loaded equipment are Heavy Duty
 * (tractors, construction machinery, heavy trucks) into the Heavy Duty SKU that already carries the
 * same shared reference. Operator rule 2026-11-08: a product is HD or LD, defined by manufacturer and
 * equipment; the same reference cannot live in both. Precedent: run_275 (operator ruling 2026-10-12).
 *
 * Nothing is carried over: the shared references are already on the HD row, and references/applications
 * held only by the LD row stay on the retired row (reported, snapshotted, reversible). Each retired row
 * becomes inactive with resolution_status.superseded_by = HD SKU and a SUPERSEDED exact_part_reference,
 * so the former SKU still finds the product. The retired SKU's own exact_part_reference rows are removed
 * (snapshotted) because that table feeds the exact-conflict view that blocks the HD row.
 *
 * Left for a later decision (many references exist only on the LD row): EA32340, EA34360, EA32348,
 * EF32020, EA31004. Also not in this batch: EA16062 (HD with car equipment but Donaldson base),
 * ES94943/EF30121 and EA18653/EL39084 (distinct products, reference placement decided one by one).
 *
 * Dry-run by default (ROLLBACK). --execute commits. --snapshot <file> writes before-values for revert.
 */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const si = process.argv.indexOf('--snapshot');
const SNAPSHOT = si > 0 ? process.argv[si + 1] : null;
// [LD sku, HD sku, shared reference that proves it]
const PAIRS = [
  ['EA33589', 'EA11373', 'C23589'], ['EA35891', 'EA11373', 'C23589/1'],
  ['EA34985', 'EA11767', '194600'], ['EA39450', 'EA13553', '84187405'],
  ['EA30112', 'EA13611', '11110532'], ['EA34420', 'EA15903', 'CP24420'],
  ['EA39550', 'EA15904', 'CP29550'], ['EA35401', 'EA16409', '73337834'],
  ['EA33062', 'EA16921', '2683556'], ['EF38130', 'ES91437', '87802923'],
];
const norm = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const codeOf = (e) => norm(e && typeof e === 'object' ? e.code || e.reference : e);
const refsOf = (r) => [...(Array.isArray(r.oem_codes) ? r.oem_codes : []), ...(Array.isArray(r.competitor_codes) ? r.competitor_codes : [])];

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', retired: [] };
  const snap = { rows: [], crossref_resolved_cache: [], exact_part_reference: [] };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const lds = PAIRS.map((p) => p[0]), hds = [...new Set(PAIRS.map((p) => p[1]))];
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) FOR UPDATE', [[...lds, ...hds]])).rows;
    const by = Object.fromEntries(rows.map((r) => [r.sku, r]));
    const others = () => db.query(`SELECT md5(string_agg(md5(e::text),'|' ORDER BY e.sku)) h FROM public.elimfilters_catalog e WHERE NOT (e.sku=ANY($1::text[]))`, [lds]).then((r) => r.rows[0].h);
    const before = await others();
    const conflicts = () => db.query('SELECT count(*)::int n FROM public.exact_part_conflicts WHERE skus && $1::varchar[]', [hds]).then((r) => r.rows[0].n);
    report.hd_conflicts_before = await conflicts();

    for (const [ld, hd, shared] of PAIRS) {
      const a = by[ld], b = by[hd];
      if (!a || !b) throw new Error('MISSING ' + ld + '/' + hd);
      if (a.duty !== 'LIGHT_DUTY' || !a.catalog_active) throw new Error('LD_CHANGED ' + ld);
      if (b.duty !== 'HEAVY_DUTY' || !b.catalog_active) throw new Error('HD_CHANGED ' + hd);
      // the HD row lists the code; the LD row holds it in its JSON or as an official exact_part_reference
      const ldEpr = (await db.query(`SELECT 1 FROM public.exact_part_reference WHERE sku=$1 AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g'))=$2`, [ld, norm(shared)])).rowCount;
      if (!refsOf(b).some((e) => codeOf(e) === norm(shared)) || !(refsOf(a).some((e) => codeOf(e) === norm(shared)) || ldEpr)) throw new Error('SHARED_REF_NOT_ON_BOTH ' + ld + ' ' + shared);
      const hdSet = new Set(refsOf(b).map(codeOf));
      const ldOnly = refsOf(a).map(codeOf).filter((c) => c && !hdSet.has(c));
      snap.rows.push(a);
      snap.crossref_resolved_cache.push(...(await db.query('SELECT * FROM public.crossref_resolved_cache WHERE sku=$1', [ld])).rows);
      snap.exact_part_reference.push(...(await db.query('SELECT * FROM public.exact_part_reference WHERE sku=$1', [ld])).rows);
      const u = await db.query(
        `UPDATE public.elimfilters_catalog SET catalog_active=false,
           enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb),'{resolution_status}',$2::jsonb) WHERE sku=$1`,
        [ld, JSON.stringify({ state: 'INACTIVE_RETIRED', reason: 'LIGHT_DUTY_ROW_FOR_A_HEAVY_DUTY_PART_BY_MANUFACTURER_AND_EQUIPMENT', superseded_by: hd, shared_reference: shared, decided_by: 'OPERATOR', updated_at: '2026-11-08', migration: 'run_303' })]);
      if (u.rowCount !== 1) throw new Error('RETIRE_COUNT ' + ld);
      const cache = (await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [ld])).rowCount;
      const epr = (await db.query('DELETE FROM public.exact_part_reference WHERE sku=$1', [ld])).rowCount;
      await db.query(
        `INSERT INTO public.exact_part_reference(reference_type,brand,part_number,sku,source) VALUES ('SUPERSEDED','ELIMFILTERS',$1,$2,'RUN_303_RETIRED_INTO_HD')
         ON CONFLICT (reference_type,brand,part_number,sku,source) DO NOTHING`, [ld, hd]);
      report.retired.push({ ld, hd, ld_base: a.codigo_base, hd_base: b.codigo_base, shared, ld_refs: refsOf(a).length, ld_only_refs_not_carried: ldOnly.length, ld_vehicle_apps_not_carried: (a.vehicle_applications || []).length, cache_rows_removed: cache, exact_part_reference_removed: epr });
    }
    if ((await others()) !== before) throw new Error('OTHER_ROWS_CHANGED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify(snap, null, 1));
    report.hd_conflicts_after = await conflicts();
    report.cross_duty_still_active = (await db.query(
      `SELECT count(*)::int n FROM public.catalog_reference_classification_conflicts_v v JOIN public.elimfilters_catalog c ON c.sku=v.sku WHERE c.sku=ANY($1::text[]) AND c.catalog_active`, [hds])).rows[0].n;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
