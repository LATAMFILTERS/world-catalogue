'use strict';

/**
 * Remove Volvo 3188140 from the three Donaldson-based products run_235 left
 * untouched (same mechanism as run_228). Fleetguard publishes that code for the
 * fuel processor housing FH23029 (ET93029), which keeps it.
 *
 *   EA11187 (P181187)  official Donaldson page, captured 2026-10-07: not listed
 *   EF90632 (P550632)  official Donaldson page, captured 2026-10-11: not listed
 *   EH66486 (P566486)  no official page: Donaldson returns NOT_FOUND (two tries,
 *                      2026-10-12) and Fleetguard has no record. Removed by
 *                      operator decision, logged with its own reason.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');
const { normalizeCode } = require('../../lib/catalog-codigo-base-policy');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const NOT_LISTED = 'DONALDSON_PAGE_DOES_NOT_LIST_CODE__RUN_236';
const NO_OFFICIAL_PAGE = 'BASE_HAS_NO_OFFICIAL_PAGE__OPERATOR_DECISION__RUN_236';

// sku, codigo_base that must be on the row, codes to remove, quarantine reason
const TARGETS = [
  ['EA11187', 'P181187', ['3188140'], NOT_LISTED],
  ['EF90632', 'P550632', ['3188140'], NOT_LISTED],
  ['EH66486', 'P566486', ['3188140'], NO_OFFICIAL_PAGE],
];

const codeOf = entry => normalizeCode((entry && typeof entry === 'object' ? entry.code || entry.reference : entry) || '');

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', cleaned: [] };

  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    for (const [sku, base, codes, reason] of TARGETS) {
      const found = await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [sku]);
      if (found.rowCount !== 1) throw new Error(`SKU_MISSING ${sku}`);
      const row = found.rows[0];
      if (row.codigo_base !== base) throw new Error(`BASE_CHANGED ${sku}: expected ${base}, found ${row.codigo_base}`);

      const reject = new Set(codes.map(normalizeCode));
      const patch = {};
      const removed = [];
      for (const field of ['competitor_codes', 'oem_codes']) {
        const before = Array.isArray(row[field]) ? row[field] : [];
        const after = before.filter(entry => !reject.has(codeOf(entry)));
        if (after.length === before.length) continue;
        patch[field] = after;
        for (const entry of before.filter(e => reject.has(codeOf(e)))) {
          removed.push({ field, code: entry.code, manufacturer: entry.manufacturer || null });
        }
      }
      const missing = codes.filter(c => !removed.some(r => normalizeCode(r.code) === normalizeCode(c)));
      if (missing.length) throw new Error(`CITE_NOT_FOUND ${sku}: ${missing.join(',')}`);

      assertGovernedCatalogPatch(row, patch, { rejectionCleanup: true });
      // trg_sync_crossref_cache rebuilds crossref_resolved_cache for the row on this update
      await db.query(
        `UPDATE public.elimfilters_catalog
         SET competitor_codes=coalesce($2::jsonb, competitor_codes), oem_codes=coalesce($3::jsonb, oem_codes)
         WHERE sku=$1`,
        [sku, patch.competitor_codes ? JSON.stringify(patch.competitor_codes) : null,
          patch.oem_codes ? JSON.stringify(patch.oem_codes) : null]);

      const legacy = await db.query(
        `DELETE FROM public.oem_codes_legacy WHERE sku=$1 AND upper(regexp_replace(code,'[^A-Za-z0-9]','','g')) = ANY($2::text[])`,
        [sku, [...reject]]);

      for (const r of removed) {
        await db.query(`
          INSERT INTO public.bad_crossref_quarantine(query_code,source_sku,source_base,source_duty,source_filter_type,source_field,brand,reason)
          SELECT $1,$2,$3,$4,$5,$6,$7,$8
          WHERE NOT EXISTS (SELECT 1 FROM public.bad_crossref_quarantine WHERE query_code=$1 AND source_sku=$2 AND source_field=$6)`,
        [r.code, sku, row.codigo_base, row.duty, row.filter_type, r.field, r.manufacturer, reason]);
      }

      const cache = await db.query(
        `SELECT code FROM public.crossref_resolved_cache WHERE sku=$1 AND upper(regexp_replace(code,'[^A-Za-z0-9]','','g')) = ANY($2::text[])`,
        [sku, [...reject]]);
      if (cache.rowCount) throw new Error(`CACHE_STILL_HOLDS ${sku}: ${cache.rows.map(r => r.code).join(',')}`);

      report.cleaned.push({ sku, codigo_base: base, removed, oem_codes_legacy_rows_deleted: legacy.rowCount });
    }

    // what each removed Fleetguard code resolves to once the wrong cites are gone
    report.resolves_to = (await db.query(
      `SELECT code, array_agg(sku ORDER BY sku) AS skus FROM public.crossref_resolved_cache
       WHERE code = ANY($1::text[]) GROUP BY code ORDER BY code`,
      [[...new Set(TARGETS.flatMap(t => t[2]))]])).rows;

    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    await db.end();
  }
})().catch(e => { console.error(e.stack || e); process.exit(1); });
