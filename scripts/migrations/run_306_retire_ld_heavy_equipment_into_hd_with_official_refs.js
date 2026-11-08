'use strict';

/**
 * Retire EA32340, EA34360 and EA31004 (Light Duty rows whose references and equipment are Heavy Duty:
 * Liebherr, Terex, John Deere, Deutz, Case, New Holland, Komatsu, Claas, Caterpillar) into their Heavy Duty
 * SKU. Operator rule 2026-11-08: a product is HD or LD by manufacturer and equipment. Continues run_303.
 *
 * Unlike run_303, the references held only by the LD row are carried to the HD row when they have an official
 * MANN page source (MANN_OFFICIAL_PAGE_OE_20261025) in exact_part_reference: 5 + 2 + 14 = 21 expected.
 * References without an official source stay on the retired row (snapshotted, reversible).
 * Not in this batch: EF32020 (Mercedes OM651 references = light duty) and EA32348 (microcar + heavy mix).
 *
 * Dry-run by default (ROLLBACK). --execute commits. --snapshot <file> writes before-values for revert.
 */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const si = process.argv.indexOf('--snapshot');
const SNAPSHOT = si > 0 ? process.argv[si + 1] : null;
const OFFICIAL = 'MANN_OFFICIAL_PAGE_OE_20261025';
// [LD sku, HD sku, shared reference, expected carried count]
const PAIRS = [['EA32340', 'EA12481', '3695441M91', 5], ['EA34360', 'EA11750', '4286473M2', 2], ['EA31004', 'EA15362', '6682494', 14]];
const norm = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const codeOf = (e) => norm(e && typeof e === 'object' ? e.code || e.reference : e);
const arr = (v) => (Array.isArray(v) ? v : []);

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', retired: [] };
  const snap = { rows: [], crossref_resolved_cache: [], exact_part_reference: [] };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const lds = PAIRS.map((p) => p[0]), hds = PAIRS.map((p) => p[1]), all = [...lds, ...hds];
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) FOR UPDATE', [all])).rows;
    const by = Object.fromEntries(rows.map((r) => [r.sku, r]));
    const othersHash = () => db.query(`SELECT md5(string_agg(md5(e::text),'|' ORDER BY e.sku)) h FROM public.elimfilters_catalog e WHERE NOT (e.sku=ANY($1::text[]))`, [all]).then((r) => r.rows[0].h);
    const conflicts = () => db.query('SELECT count(*)::int n FROM public.exact_part_conflicts WHERE skus && $1::varchar[]', [all]).then((r) => r.rows[0].n);
    const before = await othersHash();
    report.conflicts_before = await conflicts();

    for (const [ld, hd, shared, expected] of PAIRS) {
      const a = by[ld], b = by[hd];
      if (!a || !b || a.duty !== 'LIGHT_DUTY' || !a.catalog_active || b.duty !== 'HEAVY_DUTY' || !b.catalog_active) throw new Error('ROW_CHANGED ' + ld);
      const hdCodes = new Set([...arr(b.oem_codes), ...arr(b.competitor_codes)].map(codeOf));
      if (!hdCodes.has(norm(shared))) throw new Error('SHARED_NOT_ON_HD ' + ld);
      const ldEpr = (await db.query('SELECT * FROM public.exact_part_reference WHERE sku=$1', [ld])).rows;
      if (!ldEpr.some((r) => norm(r.part_number) === norm(shared))) throw new Error('SHARED_NOT_ON_LD ' + ld);
      const officialKeys = new Set(ldEpr.filter((r) => r.source === OFFICIAL).map((r) => norm(r.part_number)));

      // carry: entries only on the LD row, with the official MANN source
      const patch = { oem_codes: [...arr(b.oem_codes)], competitor_codes: [...arr(b.competitor_codes)] };
      const carried = [];
      for (const f of ['oem_codes', 'competitor_codes']) {
        for (const e of arr(a[f])) {
          const k = codeOf(e);
          if (!k || hdCodes.has(k) || !officialKeys.has(k)) continue;
          hdCodes.add(k);
          patch[f].push({ ...e, classification_source: `RUN_306_CARRIED_FROM_${ld}__${OFFICIAL}` });
          carried.push(k);
        }
      }
      if (carried.length !== expected) throw new Error(`CARRIED_COUNT ${ld} ${carried.length} != ${expected}`);
      const taken = (await db.query(`SELECT DISTINCT upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g')) c, sku FROM public.exact_part_reference WHERE sku<>ALL($1::text[]) AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g'))=ANY($2::text[])`, [all, carried])).rows;
      if (taken.length) throw new Error('CARRIED_CODE_HELD_BY_OTHER_SKU ' + JSON.stringify(taken));
      assertGovernedCatalogPatch(b, patch);

      snap.rows.push(a, b);
      snap.crossref_resolved_cache.push(...(await db.query('SELECT * FROM public.crossref_resolved_cache WHERE sku=ANY($1::text[])', [[ld, hd]])).rows);
      snap.exact_part_reference.push(...ldEpr, ...(await db.query('SELECT * FROM public.exact_part_reference WHERE sku=$1', [hd])).rows);

      // trg_sync_crossref_cache rebuilds the HD cache rows on this update
      await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [hd, JSON.stringify(patch.oem_codes), JSON.stringify(patch.competitor_codes)]);
      for (const r of ldEpr.filter((x) => carried.includes(norm(x.part_number)))) {
        await db.query(`INSERT INTO public.exact_part_reference(reference_type,brand,part_number,sku,source) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (reference_type,brand,part_number,sku,source) DO NOTHING`, [r.reference_type, r.brand, r.part_number, hd, r.source]);
      }
      const u = await db.query(
        `UPDATE public.elimfilters_catalog SET catalog_active=false,
           enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb),'{resolution_status}',$2::jsonb) WHERE sku=$1`,
        [ld, JSON.stringify({ state: 'INACTIVE_RETIRED', reason: 'LIGHT_DUTY_ROW_FOR_A_HEAVY_DUTY_PART_BY_MANUFACTURER_AND_EQUIPMENT', superseded_by: hd, shared_reference: shared, carried_references: carried.length, decided_by: 'OPERATOR', updated_at: '2026-11-08', migration: 'run_306' })]);
      if (u.rowCount !== 1) throw new Error('RETIRE_COUNT ' + ld);
      const cache = (await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [ld])).rowCount;
      const epr = (await db.query('DELETE FROM public.exact_part_reference WHERE sku=$1', [ld])).rowCount;
      await db.query(`INSERT INTO public.exact_part_reference(reference_type,brand,part_number,sku,source) VALUES ('SUPERSEDED','ELIMFILTERS',$1,$2,'RUN_306_RETIRED_INTO_HD') ON CONFLICT (reference_type,brand,part_number,sku,source) DO NOTHING`, [ld, hd]);
      const inCache = new Set((await db.query(`SELECT upper(regexp_replace(code,'[^A-Za-z0-9]','','g')) c FROM public.crossref_resolved_cache WHERE sku=$1`, [hd])).rows.map((r) => r.c));
      const missing = carried.filter((c) => !inCache.has(c));
      if (missing.length) throw new Error('CARRIED_NOT_IN_HD_CACHE ' + hd + ' ' + missing.join(','));
      report.retired.push({ ld, hd, carried: carried.length, left_on_retired_row: arr(a.oem_codes).length + arr(a.competitor_codes).length - carried.length - (arr(a.oem_codes).concat(arr(a.competitor_codes)).filter((e) => new Set([...arr(b.oem_codes), ...arr(b.competitor_codes)].map(codeOf)).has(codeOf(e))).length), cache_rows_removed: cache, exact_part_reference_removed: epr });
    }
    if ((await othersHash()) !== before) throw new Error('OTHER_ROWS_CHANGED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify(snap, null, 1));
    report.conflicts_after = await conflicts();
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
