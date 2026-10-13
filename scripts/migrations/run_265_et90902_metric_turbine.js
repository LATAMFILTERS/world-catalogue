'use strict';

/**
 * ET90902 (Parker Racor 902FH): record base governance and correct the port.
 *
 * Parker Racor catalog (operator-supplied RacorCatalog.pdf), Turbine Series,
 * "How to Order", printed page A253 (PDF page 275 of 888):
 *   "Specify 900FH for 7/8''-14 UNF ports or 902FH for 22M ports."
 * Read from a screenshot of the page taken by the operator on 2026-10-12; the
 * model numbers on that line are drawn in a font that text extraction drops.
 * Screenshot kept at
 * C:/ELIMSERVER/evidence/et9-review-20261012/racor-full/RacorCatalog-p275-A253-how-to-order.png
 *
 * So 902FH is a real Racor model: the 900 turbine with metric 22M ports.
 *   - Governance: base = 902FH, Parker, competitor code (same record as run_263).
 *   - thread_size: the row said "7/8-14 UNF (SAE J1926)", which is the 900FH
 *     port. It becomes "22M", as the catalog prints it.
 *   - SKU ET90902 is kept: 902FH has three digits, so the pair is added to the
 *     operator-approved allowlist in lib/catalog-codigo-base-policy.js.
 *
 * Not covered: ET91002 (1002FH). The matching line is on printed page A255
 * (PDF page 277), which has not been read yet.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');

const APPLY = process.argv.includes('--execute');
const MIGRATION = 'run_265_et90902_metric_turbine';
const CITATION = 'printed page A253 (PDF page 275)';
const STORED_THREAD = '7/8-14 UNF (SAE J1926)';
const CATALOG_THREAD = '22M';
const SOURCE = 'Parker Racor filtration catalog (RacorCatalog.pdf), Turbine Series';
const VERIFIED_AT = '2026-10-12T00:00:00.000Z';

// sku, codigo_base, catalog note, PDF page, micron printed in the catalog (null for the assembly)
const ROWS = [
  ['ET90902', '902FH', '900 turbine assembly with 22M ports ("Specify 900FH for 7/8-14 UNF ports or 902FH for 22M ports")', CITATION, null],
];

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', recorded: [], micron_filled: 0 };

  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    for (const [sku, base, what, page, micron] of ROWS) {
      const found = await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [sku]);
      if (found.rowCount !== 1) throw new Error(`SKU_MISSING ${sku}`);
      const row = found.rows[0];
      if (row.codigo_base !== base) throw new Error(`BASE_CHANGED ${sku}: found ${row.codigo_base}`);
      if (row.technology !== 'TURBOCORE™') throw new Error(`TECHNOLOGY_CHANGED ${sku}: ${row.technology}`);
      const before = (row.enrichment_data || {}).codigo_base_governance || {};
      if (before.approved_manufacturer) throw new Error(`GOVERNANCE_ALREADY_RECORDED ${sku}`);
      if (row.thread_size !== STORED_THREAD) throw new Error(`THREAD_CHANGED ${sku}: found ${row.thread_size}`);
      // micron is only filled where empty; an existing value must agree with the catalog
      const hasMicron = row.micron_rating !== null && String(row.micron_rating).trim() !== '';
      if (micron !== null && hasMicron && parseInt(row.micron_rating, 10) !== micron) {
        throw new Error(`MICRON_MISMATCH ${sku}: ${row.micron_rating} vs ${micron}`);
      }

      const note = `${SOURCE}, ${page}: ${base}, ${what}${micron !== null ? `, ${micron} micron` : ''}`;
      const enrichment = { ...(row.enrichment_data || {}) };
      enrichment.codigo_base_governance = {
        ...before,
        state: 'CANONICAL_VERIFIED',
        policy_version: '2026-08-19-v3.1',
        required_authority: 'VERIFIED_ET9_MANUFACTURER_BASE',
        evidence_authority: 'RACOR_PRODUCT_CATALOG',
        verification_method: 'ELIMFILTERS_OPERATOR_RULING_PLUS_RACOR_CATALOG',
        evidence_note: note,
        verified_at: VERIFIED_AT,
        current_codigo_base: base,
        approved_codigo_base: base,
        approved_manufacturer: 'PARKER',
        approved_source_column: 'COMPETITOR_CODES',
        manufacturer_classification_note: 'Parker Racor is a filter manufacturer, not an OEM (ELIMFILTERS operator ruling 2026-10-12); the base is a competitor code.',
        primary_manufacturer_verified: false,
        fallback_manufacturer_verified: true,
        fallback_commercial_code_verified: true,
        previous_state: before.state || null,
      };
      const next = { ...row, enrichment_data: enrichment,
        competitor_codes: Array.isArray(row.competitor_codes) ? row.competitor_codes : [],
        oem_codes: Array.isArray(row.oem_codes) ? row.oem_codes : [] };
      assertCanonicalWrite(next);
      const verdict = evaluateCodigoBase(next);
      if (!verdict.valid || verdict.authority !== 'VERIFIED_ET9_MANUFACTURER_BASE') {
        throw new Error(`POLICY_DOES_NOT_ACCEPT ${sku}: ${JSON.stringify(verdict)}`);
      }

      const fill = micron !== null && !hasMicron;
      const u = await db.query(
        `UPDATE public.elimfilters_catalog
         SET enrichment_data=$2::jsonb, micron_rating=CASE WHEN $3::boolean THEN $4::text ELSE micron_rating END,
             thread_size=$5
         WHERE sku=$1`, [sku, JSON.stringify(enrichment), fill, micron === null ? null : String(micron), CATALOG_THREAD]);
      if (u.rowCount !== 1) throw new Error(`UPDATE_COUNT_CHANGED ${sku}`);
      if (fill) report.micron_filled += 1;

      const hash = crypto.createHash('md5').update(`${MIGRATION}|${sku}|${base}|${page}`).digest('hex');
      await db.query(
        `INSERT INTO public.catalog_codigo_base_evidence
           (sku, evidence_kind, authority, manufacturer, reference_code, normalized_reference, source_url, evidence_hash, verified_at, metadata)
         VALUES ($1, 'FALLBACK_MANUFACTURER', 'RACOR', 'PARKER', $2, $3, $4, $5, $6, $7::jsonb)
         ON CONFLICT DO NOTHING`,
        [sku, base, base.replace(/[^A-Z0-9]/gi, '').toUpperCase(), `${SOURCE}, ${page}`, hash, VERIFIED_AT,
          JSON.stringify({ migration: MIGRATION, description: what, micron })]);
      report.recorded.push(sku);
    }

    report.turbines_without_governance = (await db.query(
      `SELECT sku, codigo_base FROM public.elimfilters_catalog
       WHERE sku LIKE 'ET9%' AND technology='TURBOCORE™'
         AND enrichment_data->'codigo_base_governance'->>'approved_manufacturer' IS NULL ORDER BY sku`)).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify({ ...report, recorded: report.recorded.length }, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    await db.end();
  }
})().catch(e => { console.error(e.stack || e); process.exit(1); });
