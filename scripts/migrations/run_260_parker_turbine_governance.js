'use strict';

/**
 * Parker Racor turbine rows (TURBOCORE™) that have no codigo_base governance.
 *
 * Sixteen ET9 turbine rows sit in state VERIFY_PRIMARY_ABSENCE: nothing records
 * who makes their base or how it is classified, so the write gateway rejects
 * any change to them. With the ET9 exception (PR #912) the correct record is
 * simple: base = Parker Racor part number, classified as a competitor code
 * (operator ruling 2026-10-12: Parker is a manufacturer, not an OEM).
 *
 * This run records it for the six rows that the gateway accepts and whose base
 * is printed as such in the Parker Racor catalog (operator-supplied
 * RacorCatalog.pdf):
 *   2010TM-OR / 2010PM-OR             500FG replacement elements,   PDF page 448
 *   2040SM-OR / 2040TM-OR / 2040PM-OR 900FH replacement elements,   PDF page 450
 *   2020TM-OR                         1000FH replacement element,   PDF page 452
 * The catalog rates the elements 2 / 10 / 30 micron for S / T / P; micron_rating
 * is empty on these rows and is filled from it.
 *
 * Left out — ten rows the gateway rejects, for operator review:
 *   - All ten carry the same block of 18 equipment entries with a type and a
 *     model but no make ("EXCAVADORA 345", "CAMION 772" ...), identical on ten
 *     different products. The gateway answers EQUIPMENT_IDENTITY_MISSING. They
 *     are ET90900, ET90902, ET91000, ET91002, ET92010S, ET92020P, ET92020S,
 *     ET95002, ET95010, ET95030.
 *   - Four of them also fail the SKU rule: ET90900 (900FH has three digits),
 *     ET90902 (902FH), ET95010 (500FG10 gives 0010, SKU ends 5010), ET95030.
 *
 * No SKU, codigo_base, cross or dimension changes.
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');

const APPLY = process.argv.includes('--execute');
const MIGRATION = 'run_260_parker_turbine_governance';
const SOURCE = 'Parker Racor filtration catalog (RacorCatalog.pdf), Turbine Series';
const VERIFIED_AT = '2026-10-12T00:00:00.000Z';

// sku, codigo_base, catalog note, PDF page, micron printed in the catalog
const ROWS = [
  ['ET92010T', '2010TM-OR', '500FG replacement element', 448, 10],
  ['ET92010P', '2010PM-OR', '500FG replacement element', 448, 30],
  ['ET92040S', '2040SM-OR', '900FH replacement element', 450, 2],
  ['ET92040T', '2040TM-OR', '900FH replacement element', 450, 10],
  ['ET92040P', '2040PM-OR', '900FH replacement element', 450, 30],
  ['ET92020T', '2020TM-OR', '1000FH replacement element', 452, 10],
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
      // micron is only filled where empty; an existing value must agree with the catalog
      const hasMicron = row.micron_rating !== null && String(row.micron_rating).trim() !== '';
      if (micron !== null && hasMicron && parseInt(row.micron_rating, 10) !== micron) {
        throw new Error(`MICRON_MISMATCH ${sku}: ${row.micron_rating} vs ${micron}`);
      }

      const note = `${SOURCE}, PDF page ${page}: ${base}, ${what}${micron !== null ? `, ${micron} micron` : ''}`;
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
         SET enrichment_data=$2::jsonb, micron_rating=CASE WHEN $3::boolean THEN $4::text ELSE micron_rating END
         WHERE sku=$1`, [sku, JSON.stringify(enrichment), fill, micron === null ? null : String(micron)]);
      if (u.rowCount !== 1) throw new Error(`UPDATE_COUNT_CHANGED ${sku}`);
      if (fill) report.micron_filled += 1;

      const hash = crypto.createHash('md5').update(`${MIGRATION}|${sku}|${base}|${page}`).digest('hex');
      await db.query(
        `INSERT INTO public.catalog_codigo_base_evidence
           (sku, evidence_kind, authority, manufacturer, reference_code, normalized_reference, source_url, evidence_hash, verified_at, metadata)
         VALUES ($1, 'FALLBACK_MANUFACTURER', 'RACOR', 'PARKER', $2, $3, $4, $5, $6, $7::jsonb)
         ON CONFLICT DO NOTHING`,
        [sku, base, base.replace(/[^A-Z0-9]/gi, '').toUpperCase(), `${SOURCE}, PDF page ${page}`, hash, VERIFIED_AT,
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
