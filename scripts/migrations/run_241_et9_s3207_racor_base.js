'use strict';

/**
 * ET93207P / ET93207S / ET93207T: codigo_base Donaldson P553207 -> Racor S3207P / S3207S / S3207T.
 *
 * run_239 left them out because no Racor number was on record. Parker's own
 * catalog now homologates them: Racor brochure 7529 "Fuel Filtration", page 7
 * (Diesel Spin-On Series, model 3250R), lists the replacement elements
 * S3207T (10 mic), S3207S (2 mic) and S3207P (30 mic). Each micron rating
 * matches the one on the catalog row.
 *
 * Same operator ruling as run_239 (2026-10-12): ET9 never takes a Donaldson
 * base; products homologated with Parker use the Racor number. SKUs,
 * technology and filter_type do not change. The Donaldson code is dropped as
 * base and not kept as a cross: Donaldson's P553207 page names no Racor part.
 *
 * Still on a Donaldson base after this run: ET93201S, ET93201T, ET932007P
 * (S3201S, S3201T and B32007P are not in brochure 7529).
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const MIGRATION = 'run_241_et9_s3207_racor_base';
const DONALDSON = 'P553207';
const SOURCE_URL = 'https://cdn.shopify.com/s/files/1/0741/8803/0203/files/7529_BRO_Fuel_Filtration.pdf';
const SOURCE_NOTE = 'Parker Racor brochure 7529 "Fuel Filtration", page 7, Diesel Spin-On Series, model 3250R, Replacement Element No.';
const VERIFIED_AT = '2026-10-12T00:00:00.000Z';

// sku, Racor part number, micron rating printed in the brochure
const ROWS = [
  ['ET93207P', 'S3207P', 30],
  ['ET93207S', 'S3207S', 2],
  ['ET93207T', 'S3207T', 10],
];

const last4 = code => code.replace(/\D/g, '').slice(-4);

(async () => {
  for (const [sku, racor] of ROWS) if (last4(sku) !== last4(racor)) throw new Error(`SKU_DOES_NOT_FOLLOW_RACOR_NUMBER ${sku} ${racor}`);

  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', rebased: [] };

  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    for (const [sku, racor, micron] of ROWS) {
      const found = await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [sku]);
      if (found.rowCount !== 1) throw new Error(`SKU_MISSING ${sku}`);
      const row = found.rows[0];
      if (row.codigo_base !== DONALDSON) throw new Error(`BASE_CHANGED ${sku}: found ${row.codigo_base}`);
      if (row.technology !== 'HYDROCORE™') throw new Error(`TECHNOLOGY_CHANGED ${sku}: ${row.technology}`);
      if (parseInt(row.micron_rating, 10) !== micron) throw new Error(`MICRON_DOES_NOT_MATCH_BROCHURE ${sku}: ${row.micron_rating} vs ${micron}`);
      const taken = await db.query(
        `SELECT sku FROM public.elimfilters_catalog WHERE upper(regexp_replace(codigo_base,'[^A-Za-z0-9]','','g'))=$1 AND sku<>$2`,
        [racor, sku]);
      if (taken.rowCount) throw new Error(`RACOR_BASE_ALREADY_USED ${racor} by ${taken.rows[0].sku}`);

      const enrichment = { ...(row.enrichment_data || {}) };
      enrichment.codigo_base_governance = {
        state: 'CANONICAL_VERIFIED',
        policy_version: '2026-08-19-v3.1',
        required_authority: 'VERIFIED_OEM_FALLBACK',
        evidence_authority: 'RACOR_PRODUCT_CATALOG',
        verification_method: 'ELIMFILTERS_OPERATOR_RULING_PLUS_RACOR_BROCHURE_7529',
        evidence_url: SOURCE_URL,
        evidence_note: SOURCE_NOTE,
        verified_at: VERIFIED_AT,
        current_codigo_base: racor,
        approved_codigo_base: racor,
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
        previous_codigo_base: DONALDSON,
      };
      assertCanonicalWrite({ ...row, codigo_base: racor, canonical_source_code: racor,
        competitor_codes: Array.isArray(row.competitor_codes) ? row.competitor_codes : [],
        oem_codes: Array.isArray(row.oem_codes) ? row.oem_codes : [], enrichment_data: enrichment });

      // trg_elimfilters_codigo_base_policy validates the new base; trg_sync_crossref_cache rebuilds the cache row
      const u = await db.query(
        `UPDATE public.elimfilters_catalog SET codigo_base=$2::text, canonical_source_code=$2::text, enrichment_data=$3::jsonb WHERE sku=$1`,
        [sku, racor, JSON.stringify(enrichment)]);
      if (u.rowCount !== 1) throw new Error(`UPDATE_COUNT_CHANGED ${sku}`);

      const hash = crypto.createHash('md5').update(`${MIGRATION}|${sku}|${racor}|${SOURCE_URL}`).digest('hex');
      const ev = await db.query(
        `INSERT INTO public.catalog_codigo_base_evidence
           (sku, evidence_kind, authority, manufacturer, reference_code, normalized_reference, source_url, evidence_hash, verified_at, metadata)
         VALUES ($1, 'FALLBACK_MANUFACTURER', 'RACOR', 'RACOR', $2, $2, $3, $4, $5, $6::jsonb)
         ON CONFLICT DO NOTHING`,
        [sku, racor, SOURCE_URL, hash, VERIFIED_AT,
          JSON.stringify({ migration: MIGRATION, racor_reference: racor, micron, source_note: SOURCE_NOTE })]);

      report.rebased.push({ sku, from: DONALDSON, to: racor, micron, evidence_rows_added: ev.rowCount });
    }

    report.products_on_P553207 = (await db.query(
      'SELECT sku FROM public.elimfilters_catalog WHERE codigo_base=$1 ORDER BY sku', [DONALDSON])).rows.map(r => r.sku);
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
