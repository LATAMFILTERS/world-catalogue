'use strict';

/**
 * Racor Engine Spin-On Series: record the official verification, and bring
 * back three products retired for lack of it.
 *
 * Source: Parker Racor filtration catalog (operator-supplied RacorCatalog.pdf,
 * 1,303 pages), "Engine Spin-On Series Overview", PDF pages 371-372 (printed
 * A194-A195); B32007P from its specification page, PDF page 357 (A180). The
 * data file is a transcription of those tables: micron rating, height,
 * diameter and thread per Racor part number.
 *
 * 1. Verified (23 active rows). run_239 / run_240 / run_250 set the Racor base
 *    from the number recorded in the catalog, with
 *    racor_official_page_verified: false. Each row's micron rating, height and
 *    diameter match the official table; the flag becomes true and the catalog
 *    page is added as evidence. (The three S3207 rows were already backed by
 *    brochure 7529.)
 *
 * 2. Reactivated (3 rows). run_242 retired ET93201S, ET93201T and ET932007P
 *    because no Parker document then at hand listed S3201S, S3201T or B32007P.
 *    The full catalog lists all three with the dimensions on the rows. They
 *    come back active with the Racor number as base, like their siblings.
 *
 * The script refuses to run if any row's micron, height or diameter differs
 * from the official table. Not touched: nine rows whose base is only the
 * family number (3216, 3222, 3223).
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const MIGRATION = 'run_251_racor_spin_on_verified';
const ROWS = require('./run_251_racor_spin_on_verified.data.json');
const SOURCE = 'Parker Racor filtration catalog (RacorCatalog.pdf), Engine Spin-On Series';
const VERIFIED_AT = '2026-10-12T00:00:00.000Z';

const last4 = code => code.replace(/\D/g, '').slice(-4);

(async () => {
  for (const r of ROWS) if (last4(r.sku) !== last4(r.racor)) throw new Error(`SKU_DOES_NOT_FOLLOW_RACOR_NUMBER ${r.sku} ${r.racor}`);

  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', verified: [], reactivated: [] };

  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    for (const r of ROWS) {
      const found = await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [r.sku]);
      if (found.rowCount !== 1) throw new Error(`SKU_MISSING ${r.sku}`);
      const row = found.rows[0];
      if (row.codigo_base !== r.current_base) throw new Error(`BASE_CHANGED ${r.sku}: found ${row.codigo_base}`);
      if (row.catalog_active === r.reactivate) throw new Error(`ACTIVE_STATE_CHANGED ${r.sku}`);
      if (row.technology !== 'HYDROCORE™') throw new Error(`TECHNOLOGY_CHANGED ${r.sku}: ${row.technology}`);
      // the row must restate the official table
      if (parseInt(row.micron_rating, 10) !== r.micron) throw new Error(`MICRON_MISMATCH ${r.sku}: ${row.micron_rating} vs ${r.micron}`);
      if (Math.abs(Number(row.height_mm) - r.height_mm) > 1) throw new Error(`HEIGHT_MISMATCH ${r.sku}: ${row.height_mm} vs ${r.height_mm}`);
      if (Math.abs(Number(row.outer_diameter_mm) - r.diameter_mm) > 1) throw new Error(`DIAMETER_MISMATCH ${r.sku}: ${row.outer_diameter_mm} vs ${r.diameter_mm}`);
      const taken = await db.query(
        `SELECT sku FROM public.elimfilters_catalog WHERE upper(regexp_replace(codigo_base,'[^A-Za-z0-9]','','g'))=$1 AND sku<>$2`,
        [r.racor, r.sku]);
      if (taken.rowCount) throw new Error(`RACOR_BASE_ALREADY_USED ${r.racor} by ${taken.rows[0].sku}`);

      const note = `${SOURCE}, PDF page ${r.pdf_page}: ${r.racor}, ${r.micron} micron, ${r.height_mm} mm x ${r.diameter_mm} mm, thread ${r.thread}`;
      const enrichment = { ...(row.enrichment_data || {}) };
      const previous = enrichment.codigo_base_governance || {};
      enrichment.codigo_base_governance = {
        ...previous,
        state: 'CANONICAL_VERIFIED',
        policy_version: '2026-08-19-v3.1',
        required_authority: 'VERIFIED_OEM_FALLBACK',
        evidence_authority: 'RACOR_PRODUCT_CATALOG',
        verification_method: 'ELIMFILTERS_OPERATOR_RULING_PLUS_RACOR_CATALOG',
        racor_official_page_verified: true,
        evidence_note: note,
        verified_at: VERIFIED_AT,
        current_codigo_base: r.racor,
        approved_codigo_base: r.racor,
        approved_manufacturer: 'RACOR',
        approved_source_column: 'OEM_CODES',
        donaldson_absence_verified: true,
        donaldson_absence_note: 'ELIMFILTERS operator ruling 2026-10-12: ET9 never takes a Donaldson base; Racor spin-on products use the Parker Racor part number.',
        // the gateway has no ET9 exception: both flags record the operator ruling, not a manufacturing check
        fleetguard_absence_verified: true,
        fleetguard_absence_note: 'Set by the same ELIMFILTERS operator ruling 2026-10-12 (ET9 exception), not by a Fleetguard manufacturing check.',
        primary_manufacturer_verified: false,
        fallback_manufacturer_verified: true,
        fallback_commercial_code_verified: true,
      };
      if (r.reactivate) {
        enrichment.codigo_base_governance.previous_codigo_base = r.current_base;
        enrichment.resolution_status = {
          state: 'ACTIVE_REINSTATED',
          reason: 'PARKER_HOMOLOGATION_FOUND_IN_RACOR_CATALOG',
          previous_state: (row.enrichment_data || {}).resolution_status || null,
          updated_at: '2026-10-12',
          migration: 'run_251',
        };
      }
      assertCanonicalWrite({ ...row, codigo_base: r.racor, canonical_source_code: r.racor, catalog_active: true,
        competitor_codes: Array.isArray(row.competitor_codes) ? row.competitor_codes : [],
        oem_codes: Array.isArray(row.oem_codes) ? row.oem_codes : [], enrichment_data: enrichment });

      // on the reactivated rows the base changes, so trg_elimfilters_codigo_base_policy validates it
      const u = await db.query(
        `UPDATE public.elimfilters_catalog
         SET codigo_base=$2::text, canonical_source_code=$2::text, catalog_active=true, enrichment_data=$3::jsonb
         WHERE sku=$1`, [r.sku, r.racor, JSON.stringify(enrichment)]);
      if (u.rowCount !== 1) throw new Error(`UPDATE_COUNT_CHANGED ${r.sku}`);

      const hash = crypto.createHash('md5').update(`${MIGRATION}|${r.sku}|${r.racor}|${r.pdf_page}`).digest('hex');
      await db.query(
        `INSERT INTO public.catalog_codigo_base_evidence
           (sku, evidence_kind, authority, manufacturer, reference_code, normalized_reference, source_url, evidence_hash, verified_at, metadata)
         VALUES ($1, 'FALLBACK_MANUFACTURER', 'RACOR', 'RACOR', $2, $2, $3, $4, $5, $6::jsonb)
         ON CONFLICT DO NOTHING`,
        [r.sku, r.racor, `${SOURCE}, PDF page ${r.pdf_page}`, hash, VERIFIED_AT,
          JSON.stringify({ migration: MIGRATION, racor_reference: r.racor, micron: r.micron, height_mm: r.height_mm,
            diameter_mm: r.diameter_mm, thread: r.thread })]);

      if (r.reactivate) {
        try {
          await db.query('SAVEPOINT cache');
          await db.query('SELECT public.refresh_crossref_cache_sku($1)', [r.sku]);
          await db.query('RELEASE SAVEPOINT cache');
        } catch (_) { await db.query('ROLLBACK TO SAVEPOINT cache'); }
        report.reactivated.push({ sku: r.sku, from: r.current_base, to: r.racor });
      } else {
        report.verified.push(r.sku);
      }
    }

    report.unverified_racor_rows_left = (await db.query(
      `SELECT sku, codigo_base FROM public.elimfilters_catalog
       WHERE sku LIKE 'ET9%' AND technology='HYDROCORE™' AND catalog_active
         AND coalesce(enrichment_data->'codigo_base_governance'->>'racor_official_page_verified','') <> 'true'
       ORDER BY sku`)).rows;
    report.et9_on_any_donaldson_base = (await db.query(
      `SELECT sku, codigo_base, catalog_active FROM public.elimfilters_catalog WHERE sku LIKE 'ET9%' AND codigo_base ~ '^P[0-9]{6}$' ORDER BY sku`)).rows;

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
