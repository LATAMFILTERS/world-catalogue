'use strict';

/**
 * Remove two Fleetguard-sourced codes from products whose own Fleetguard record
 * does not list them (same mechanism as run_228). Records captured 2026-10-12.
 *
 *   Volvo 3188140  Fleetguard publishes it for the fuel processor housing FH23029
 *                  (ET93029) and its obsolete predecessor FS1010. 38 unrelated
 *                  products (lube, hydraulic, transmission, coolant, fuel) cited it.
 *   FS1010         an obsolete fuel/water separator housing replaced by FH23000,
 *                  cited as a cross of a fuel cartridge (FF191) and a transmission
 *                  filter (TF15018).
 *
 * Not touched: ET93029, the real holder of 3188140, and three products with a
 * Donaldson base and no Fleetguard record (EA11187, EF90632, EH66486).
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');
const { normalizeCode } = require('../../lib/catalog-codigo-base-policy');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const REASON = 'FLEETGUARD_RECORD_DOES_NOT_LIST_CODE__RUN_235';

// sku, codigo_base that must be on the row, codes to remove
const TARGETS = [
  ['EF90035', 'TF15003', ['3188140']],
  ['EF90075', 'TF15007', ['3188140']],
  ['EF90191', 'FF191', ['3188140', 'FS1010']],
  ['EF91247', 'ST1247', ['3188140']],
  ['EF91481', 'ST1481', ['3188140']],
  ['EF91868', 'ST1868', ['3188140']],
  ['EF92005', 'FF42005', ['3188140']],
  ['EF92079', 'ST2079', ['3188140']],
  ['EF92101', 'ST2101', ['3188140']],
  ['EF95017', 'TF15017', ['3188140']],
  ['EF95018', 'TF15018', ['3188140', 'FS1010']],
  ['EF95032', 'TF15032', ['3188140']],
  ['EF95380', 'FF5380', ['3188140']],
  ['EF95813', 'FF5813', ['3188140']],
  ['EF95936', 'FF5936', ['3188140']],
  ['EH60151', 'HF30151', ['3188140']],
  ['EH60401', 'HF30401', ['3188140']],
  ['EH60428', 'HF30428', ['3188140']],
  ['EH60455', 'HF30455', ['3188140']],
  ['EH60585', 'HF30585', ['3188140']],
  ['EH60749', 'HF30749', ['3188140']],
  ['EH60800', 'HF30800', ['3188140']],
  ['EH66054', 'HF6054', ['3188140']],
  ['EH66088', 'HF6088', ['3188140']],
  ['EH67130', 'HF7130F', ['3188140']],
  ['EL80777', 'LF777', ['3188140']],
  ['EL83704', 'LF3704', ['3188140']],
  ['EL83724', 'LF3724', ['3188140']],
  ['EL86295', 'LF16295', ['3188140']],
  ['EL86434', 'LF16434', ['3188140']],
  ['EL87487', 'LF17487', ['3188140']],
  ['EL87811', 'LF17811', ['3188140']],
  ['ES90019', 'FS20019', ['3188140']],
  ['ES91258', 'FS1258', ['3188140']],
  ['ES99526', 'FS19526', ['3188140']],
  ['ES99968', 'FS19968', ['3188140']],
  ['EW72171', 'WF2171', ['3188140']],
  ['EW72187', 'WF2187', ['3188140']],
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

    for (const [sku, base, codes] of TARGETS) {
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
        [r.code, sku, row.codigo_base, row.duty, row.filter_type, r.field, r.manufacturer, REASON]);
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
