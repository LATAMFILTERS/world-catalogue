'use strict';

/**
 * EH60700 (P160700): close the height conflict recorded by run_246.
 *
 * Height stays 406.4 mm (16 in) by operator decision, 2026-10-12. It is NOT
 * recorded as verified against a Donaldson catalog line: Donaldson's Hydraulic
 * Filtration Product Guide F112100, PDF page 98, prints P160700 at
 * 11.6 in / 294 mm, while the stored Donaldson value and Fleetguard HF6296
 * give 16 in / 406.4 mm. No value changes; only the record of the decision.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  try {
    await db.query('BEGIN');
    const u = await db.query(
      `UPDATE public.elimfilters_catalog
       SET enrichment_data=jsonb_set(enrichment_data, '{dimension_review,height_conflict}',
             (enrichment_data->'dimension_review'->'height_conflict') || $1::jsonb)
       WHERE sku='EH60700' AND codigo_base='P160700' AND height_mm=406.4
         AND enrichment_data->'dimension_review'->'height_conflict'->>'resolution'='PENDING_DONALDSON_PRODUCT_PAGE'
       RETURNING sku, height_mm, outer_diameter_mm, enrichment_data->'dimension_review'->'height_conflict' AS height_conflict`,
      [JSON.stringify({
        resolution: 'OPERATOR_DECISION_KEEP_406_4_MM',
        decided_by: 'OPERATOR',
        decided_at: '2026-10-12',
        verified_against_donaldson_catalog_line: false,
        note: 'Kept at 406.4 mm (16 in) by operator decision; not a value verified against a Donaldson catalog line.',
        migration: 'run_249',
      })]);
    if (u.rowCount !== 1) throw new Error('ROW_NOT_IN_EXPECTED_STATE EH60700');
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ mode: APPLY ? 'execute' : 'dry-run', row: u.rows[0], transaction: APPLY ? 'COMMIT' : 'ROLLBACK' }, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    await db.end();
  }
})().catch(e => { console.error(e.stack || e); process.exit(1); });
