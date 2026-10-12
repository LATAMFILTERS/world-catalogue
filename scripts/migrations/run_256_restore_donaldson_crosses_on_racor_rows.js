'use strict';

/**
 * Give two Racor spin-on rows their Donaldson code back as a cross.
 *
 *   ET93208T (base S3208T)  <- P553004
 *   ET93201P (base S3201P)  <- P555010
 *
 * run_239 moved these rows from the Donaldson base to the Racor number and kept
 * the Donaldson code as a cross only where a captured Donaldson page named the
 * Racor part. No page was captured for these two, so the code was dropped and
 * Part Search stopped answering P553004 and P555010.
 *
 * The catalog does hold evidence for both: catalog_codigo_base_evidence rows of
 * kind OFFICIAL_PRODUCT_PAGE (Donaldson product URL, verified 2026-09-07) that
 * name the same Racor part. That is the standard run_253 applied to P551844.
 * The pages could not be re-read (the store refused this machine on
 * 2026-10-12); the script requires the evidence row to exist.
 *
 * codigo_base stays Racor. Only competitor_codes changes.
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');

// sku, Racor base on the row, Donaldson code to restore
const ROWS = [
  ['ET93208T', 'S3208T', 'P553004'],
  ['ET93201P', 'S3201P', 'P555010'],
];

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', restored: [] };

  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    for (const [sku, racor, donaldson] of ROWS) {
      const found = await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [sku]);
      if (found.rowCount !== 1) throw new Error(`SKU_MISSING ${sku}`);
      const row = found.rows[0];
      if (row.codigo_base !== racor) throw new Error(`BASE_CHANGED ${sku}: found ${row.codigo_base}`);

      const evidence = await db.query(
        `SELECT source_url FROM public.catalog_codigo_base_evidence
         WHERE sku=$1 AND reference_code=$2 AND evidence_kind='OFFICIAL_PRODUCT_PAGE'
           AND manufacturer='DONALDSON' AND metadata->>'racor_reference'=$3`, [sku, donaldson, racor]);
      if (!evidence.rowCount) throw new Error(`NO_OFFICIAL_PAGE_EVIDENCE ${sku} ${donaldson}`);
      const holder = await db.query('SELECT sku FROM public.elimfilters_catalog WHERE codigo_base=$1', [donaldson]);
      if (holder.rowCount) throw new Error(`DONALDSON_CODE_IS_ANOTHER_BASE ${donaldson} -> ${holder.rows[0].sku}`);

      const competitor = Array.isArray(row.competitor_codes) ? row.competitor_codes.slice() : [];
      if (competitor.some(e => e && e.code === donaldson)) throw new Error(`ALREADY_PRESENT ${sku} ${donaldson}`);
      competitor.push({ code: donaldson, manufacturer: 'DONALDSON' });
      assertGovernedCatalogPatch(row, { competitor_codes: competitor });

      // trg_sync_crossref_cache rebuilds crossref_resolved_cache for the row on this update
      await db.query('UPDATE public.elimfilters_catalog SET competitor_codes=$2::jsonb WHERE sku=$1', [sku, JSON.stringify(competitor)]);
      const cached = await db.query(
        `SELECT 1 FROM public.crossref_resolved_cache WHERE sku=$1 AND upper(regexp_replace(code,'[^A-Za-z0-9]','','g'))=$2`, [sku, donaldson]);
      if (!cached.rowCount) throw new Error(`CACHE_DID_NOT_PICK_UP ${sku} ${donaldson}`);
      report.restored.push({ sku, codigo_base: racor, donaldson_cross: donaldson, evidence_url: evidence.rows[0].source_url });
    }
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
