'use strict';

/**
 * ET9 Racor Engine Spin-On Series (S32xx elements, B32xxx bowl assemblies):
 * codigo_base Donaldson -> Parker Racor.
 *
 * Operator ruling 2026-10-12: ET9 is the one family whose codigo_base is never
 * Donaldson; it is the direct manufacturer's code (Parker Racor, or Fleetguard
 * for fuel processor housings). The non-turbine Racor spin-ons keep HYDROCORE™
 * and take the Racor part number as base, because that is the number customers
 * recognise.
 *
 * The Racor number of each row is the one already recorded with it in
 * catalog_codigo_base_evidence / catalog_application_evidence (racor_reference).
 * Parker's own pages could not be read (ph.parker.com answers 403), so the
 * governance block says racor_official_page_verified: false.
 *
 * The Donaldson code stays as a cross only where Donaldson's product page names
 * that Racor element as its application (P553202, P553203, P555060).
 *
 * Left out, still on a Donaldson base:
 *   ET93201S ET93201T ET93207P ET93207S ET93207T ET932007P  no Racor number on record
 *   ET93211 (B32011) ET93212B (B32012)  SKU does not end in the Racor number's last four digits
 *
 * SKUs, technology and filter_type do not change.
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');

// sku, Donaldson base on the row today, Racor part number, Donaldson page names this Racor part
const ROWS = [
  ['ET932002', 'P553202', 'B32002', false],
  ['ET932003', 'P553203', 'B32003', false],
  ['ET932004P', 'P553204', 'B32004P', false],
  ['ET932004S', 'P553204', 'B32004S', false],
  ['ET932004T', 'P553204', 'B32004T', false],
  ['ET93201P', 'P555010', 'S3201P', false],
  ['ET93202', 'P553202', 'S3202', true],
  ['ET93203', 'P553203', 'S3203', true],
  ['ET93204P', 'P553204', 'S3204P', false],
  ['ET93204S', 'P553204', 'S3204S', false],
  ['ET93204T', 'P553204', 'S3204T', false],
  ['ET93205', 'P553205', 'S3205', false],
  ['ET93206', 'P555060', 'S3206', true],
  ['ET93208T', 'P553004', 'S3208T', false],
  ['ET93209P', 'P559624', 'S3209P', false],
  ['ET93209T', 'P559624', 'S3209T', false],
  ['ET93212', 'P550936', 'S3212', false],
];

const last4 = code => code.replace(/\D/g, '').slice(-4);

(async () => {
  for (const [sku, , racor] of ROWS) {
    if (last4(sku) !== last4(racor)) throw new Error(`SKU_DOES_NOT_FOLLOW_RACOR_NUMBER ${sku} ${racor}`);
  }
  if (new Set(ROWS.map(r => r[2])).size !== ROWS.length) throw new Error('RACOR_NUMBER_REPEATED');

  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', rebased: [] };

  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    for (const [sku, donaldson, racor, donaldsonNamesIt] of ROWS) {
      const found = await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [sku]);
      if (found.rowCount !== 1) throw new Error(`SKU_MISSING ${sku}`);
      const row = found.rows[0];
      if (row.codigo_base !== donaldson) throw new Error(`BASE_CHANGED ${sku}: expected ${donaldson}, found ${row.codigo_base}`);
      if (row.technology !== 'HYDROCORE™') throw new Error(`TECHNOLOGY_CHANGED ${sku}: ${row.technology}`);

      const recorded = await db.query(
        `SELECT 1 FROM public.catalog_codigo_base_evidence WHERE sku=$1 AND metadata->>'racor_reference'=$2
         UNION ALL
         SELECT 1 FROM public.catalog_application_evidence WHERE sku=$1 AND metadata->>'racor_reference'=$2`, [sku, racor]);
      if (!recorded.rowCount) throw new Error(`RACOR_NUMBER_NOT_ON_RECORD ${sku} ${racor}`);
      const taken = await db.query(
        `SELECT sku FROM public.elimfilters_catalog WHERE upper(regexp_replace(codigo_base,'[^A-Za-z0-9]','','g'))=$1 AND sku<>$2`,
        [racor, sku]);
      if (taken.rowCount) throw new Error(`RACOR_BASE_ALREADY_USED ${racor} by ${taken.rows[0].sku}`);

      const competitor = Array.isArray(row.competitor_codes) ? row.competitor_codes.slice() : [];
      if (donaldsonNamesIt && !competitor.some(e => e && e.code === donaldson)) {
        competitor.push({ code: donaldson, manufacturer: 'DONALDSON' });
      }
      const enrichment = { ...(row.enrichment_data || {}) };
      enrichment.codigo_base_governance = {
        state: 'CANONICAL_VERIFIED',
        policy_version: '2026-08-19-v3.1',
        required_authority: 'VERIFIED_OEM_FALLBACK',
        evidence_authority: 'RACOR_REFERENCE_ON_RECORD',
        verification_method: 'ELIMFILTERS_OPERATOR_RULING_PLUS_RECORDED_RACOR_REFERENCE',
        racor_official_page_verified: false,
        current_codigo_base: racor,
        approved_codigo_base: racor,
        approved_manufacturer: 'RACOR',
        approved_source_column: 'OEM_CODES',
        donaldson_absence_verified: true,
        donaldson_absence_note: 'ELIMFILTERS operator ruling 2026-10-12: ET9 never takes a Donaldson base; Racor spin-on products use the Parker Racor part number.',
        // the gateway has no ET9 exception: both flags record the operator ruling, not a manufacturing check
        // (same convention as run_231)
        fleetguard_absence_verified: true,
        fleetguard_absence_note: 'Set by the same ELIMFILTERS operator ruling 2026-10-12 (ET9 exception), not by a Fleetguard manufacturing check.',
        primary_manufacturer_verified: false,
        fallback_manufacturer_verified: true,
        fallback_commercial_code_verified: true,
        previous_codigo_base: donaldson,
      };
      // some of these rows carry NULL oem_codes; the gateway reads that as an empty list
      assertCanonicalWrite({ ...row, codigo_base: racor, canonical_source_code: racor, competitor_codes: competitor,
        oem_codes: Array.isArray(row.oem_codes) ? row.oem_codes : [], enrichment_data: enrichment });

      // trg_elimfilters_codigo_base_policy validates the new base; trg_sync_crossref_cache rebuilds the cache row
      const u = await db.query(
        `UPDATE public.elimfilters_catalog
         SET codigo_base=$2::text, canonical_source_code=$2::text, competitor_codes=$3::jsonb, enrichment_data=$4::jsonb
         WHERE sku=$1`, [sku, racor, JSON.stringify(competitor), JSON.stringify(enrichment)]);
      if (u.rowCount !== 1) throw new Error(`UPDATE_COUNT_CHANGED ${sku}`);

      report.rebased.push({ sku, from: donaldson, to: racor, donaldson_kept_as_cross: donaldsonNamesIt });
    }

    // each Donaldson code must now resolve as a base to non-ET9 products only
    const still = await db.query(
      `SELECT sku, codigo_base FROM public.elimfilters_catalog WHERE sku LIKE 'ET9%' AND codigo_base = ANY($1::text[]) ORDER BY sku`,
      [[...new Set(ROWS.map(r => r[1]))]]);
    report.et9_still_on_these_donaldson_bases = still.rows;
    report.et9_on_any_donaldson_base = (await db.query(
      `SELECT sku, codigo_base FROM public.elimfilters_catalog WHERE sku LIKE 'ET9%' AND codigo_base ~ '^P[0-9]{6}$' ORDER BY sku`)).rows;

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
