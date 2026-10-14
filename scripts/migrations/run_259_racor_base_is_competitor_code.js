'use strict';

/**
 * Racor spin-on rows in ET9: the Racor base is a competitor code, not an OEM code.
 *
 * Operator ruling 2026-10-12: Parker is a filter manufacturer like Donaldson and
 * Fleetguard, not an OEM. run_239 to run_253 wrote these rows with
 * approved_source_column OEM_CODES and fleetguard_absence_verified true, only
 * because the write gateway then had no ET9 exception and demanded both. The
 * gateway now has one (approvedEt9ManufacturerBaseReady), so the rows can say
 * what is true:
 *   - approved_source_column -> COMPETITOR_CODES
 *   - fleetguard_absence_verified and its note are removed (never checked)
 *   - required_authority -> VERIFIED_ET9_MANUFACTURER_BASE
 *
 * donaldson_absence_verified stays: the database trigger
 * enforce_elimfilters_codigo_base_policy still requires it for a non-Donaldson
 * HD base. Its note already says it records the operator ruling.
 *
 * No SKU, codigo_base, cross or dimension changes — governance labels only.
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');

const APPLY = process.argv.includes('--execute');
const EXPECTED = 36;

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', relabelled: [] };

  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const rows = (await db.query(
      `SELECT * FROM public.elimfilters_catalog
       WHERE sku LIKE 'ET9%'
         AND upper(enrichment_data->'codigo_base_governance'->>'approved_manufacturer') IN ('RACOR','PARKER')
         AND upper(enrichment_data->'codigo_base_governance'->>'approved_source_column') = 'OEM_CODES'
       ORDER BY sku FOR UPDATE`)).rows;
    if (rows.length !== EXPECTED) throw new Error(`ROW_COUNT_CHANGED: expected ${EXPECTED}, found ${rows.length}`);

    for (const row of rows) {
      const enrichment = { ...row.enrichment_data };
      const gov = { ...enrichment.codigo_base_governance };
      delete gov.fleetguard_absence_verified;
      delete gov.fleetguard_absence_note;
      gov.approved_source_column = 'COMPETITOR_CODES';
      gov.required_authority = 'VERIFIED_ET9_MANUFACTURER_BASE';
      gov.manufacturer_classification_note = 'Parker Racor is a filter manufacturer, not an OEM (ELIMFILTERS operator ruling 2026-10-12); the base is a competitor code.';
      enrichment.codigo_base_governance = gov;

      const next = { ...row, enrichment_data: enrichment,
        competitor_codes: Array.isArray(row.competitor_codes) ? row.competitor_codes : [],
        oem_codes: Array.isArray(row.oem_codes) ? row.oem_codes : [] };
      assertCanonicalWrite(next);
      const verdict = evaluateCodigoBase(next);
      if (!verdict.valid || verdict.authority !== 'VERIFIED_ET9_MANUFACTURER_BASE') {
        throw new Error(`POLICY_DOES_NOT_ACCEPT ${row.sku}: ${JSON.stringify(verdict)}`);
      }
      const u = await db.query('UPDATE public.elimfilters_catalog SET enrichment_data=$2::jsonb WHERE sku=$1', [row.sku, JSON.stringify(enrichment)]);
      if (u.rowCount !== 1) throw new Error(`UPDATE_COUNT_CHANGED ${row.sku}`);
      report.relabelled.push(row.sku);
    }

    report.et9_labels_after = (await db.query(
      `SELECT enrichment_data->'codigo_base_governance'->>'approved_manufacturer' AS manufacturer,
              enrichment_data->'codigo_base_governance'->>'approved_source_column' AS source,
              enrichment_data->'codigo_base_governance'->>'fleetguard_absence_verified' AS fleetguard_absence,
              count(*)::int AS rows
       FROM public.elimfilters_catalog WHERE sku LIKE 'ET9%' GROUP BY 1,2,3 ORDER BY 1`)).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify({ ...report, relabelled: report.relabelled.length }, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    await db.end();
  }
})().catch(e => { console.error(e.stack || e); process.exit(1); });
