'use strict';

/**
 * Three hydraulic filters whose height_mm / outer_diameter_mm hold inch numbers
 * (same defect as run_243) and that earlier runs left out because the
 * converted value did not match the Fleetguard equivalent.
 *
 * Donaldson's store still refuses this machine, so the page was not read by
 * automation. The operator relayed what Donaldson publishes, and each stored
 * number is that inch figure:
 *   EH61234 P551234  5.66 x 3.67 in -> 143.8 x  93.2 mm   relayed: 144.0 mm (5.67") x 93.0 mm (3.66"), thread 1"-12 UN
 *   EH60416 P550416  7.13 x 3.82 in -> 181.1 x  97.0 mm   relayed quote: "Length 181 mm (7.13 inch)"
 *   EH60476 P550476  4.80 x 3.95 in -> 121.9 x 100.3 mm   relayed quotes: "Overall Length 4.80 inch (121.92 mm)", "3.95 inch outer diameter"
 *
 * Written value: the stored inch number x 25.4, one decimal. Each row is marked
 * pending an official page capture, with the relayed text and its origin.
 *
 * Crosses are not touched. Fleetguard's own records name these Donaldson codes
 * on HF6833 / HF6835 (P551234), HF6317 (P550416) and HF35276 (P550476), even
 * where the dimensions differ; that question is left open.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');

// sku, codigo_base, stored height, stored OD, mm the operator relayed for the height, relayed text
const ROWS = [
  ['EH61234', 'P551234', 5.66, 3.67, 144.0, 'Largo 144.0 mm (5.67"); diámetro exterior 93.0 mm (3.66"); rosca 1"-12 UN'],
  ['EH60416', 'P550416', 7.13, 3.82, 181.0, 'Donaldson P550416 – HYDRAULIC FILTER, SPIN-ON ... Length 181 mm (7.13 inch)'],
  ['EH60476', 'P550476', 4.8, 3.95, 121.92, 'Overall Length 4.80 inch (121.92 mm); 3.95 inch outer diameter; Inlet Diameter 1.06 inch (26.92 mm)'],
];

const toMm = inch => Math.round(Number(inch) * 25.4 * 10) / 10;

(async () => {
  for (const [sku, , h, , relayedMm] of ROWS) {
    // the conversion must land on the millimetre figure that was relayed
    if (Math.abs(toMm(h) - relayedMm) > 0.5) throw new Error(`CONVERSION_DOES_NOT_MATCH_RELAYED_VALUE ${sku}`);
  }

  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', updated: [], skipped: [] };

  try {
    await db.query('BEGIN');
    for (const [sku, base, h, od, , relayed] of ROWS) {
      // guarded by the stored values: a row edited since the review is skipped, not overwritten
      const u = await db.query(
        `UPDATE public.elimfilters_catalog
         SET height_mm=$1, outer_diameter_mm=$2,
             enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{dimension_review}', $7::jsonb)
         WHERE sku=$3 AND codigo_base=$4 AND height_mm=$5::numeric AND outer_diameter_mm=$6::numeric
         RETURNING sku, height_mm, outer_diameter_mm`,
        [toMm(h), toMm(od), sku, base, h, od, JSON.stringify({
          state: 'INCH_VALUE_CONVERTED_PENDING_OFFICIAL_PAGE',
          method: 'stored Donaldson inch value x 25.4',
          stored_before: { height: h, outer_diameter: od },
          relayed_donaldson_text: relayed,
          relayed_by: 'OPERATOR',
          read_by_automation: false,
          note: 'shop.donaldson.com refused this machine on 2026-10-12; the Donaldson figures were relayed by the operator and not read from the page by automation.',
          migration: 'run_266',
          reviewed_at: '2026-10-12',
        })]);
      if (u.rowCount === 1) report.updated.push(u.rows[0]);
      else report.skipped.push(sku);
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
