'use strict';

/**
 * Four products left out of run_245 because the converted value differed from
 * the Fleetguard equivalent by more than its 5 % limit. Operator accepted a
 * 10 % limit for these on 2026-10-12: the gap is the normal difference between
 * two makers' parts, and the other dimension of each row matches closely.
 *
 * Written value: the stored Donaldson inch number x 25.4 (one decimal) — not
 * Fleetguard's dimension. Each Fleetguard record below names the row's
 * Donaldson codigo_base back. Rows are marked pending an official page.
 *
 *   EA17283 P607283  342.9 x 230.1   AF1631   342.90 x 253.00   (height exact, diameter 9.0 % apart)
 *   EH60426 P550426   82.8 x  76.7   HF35099   88.65 x  75.95   (height 6.6 %, same thread)
 *   EH61222 P551222  188.7 x 114.3   HF6210   205.23 x 114.81   (height 8.0 %)
 *   EH61347 P551347   79.5 x  51.1   HF35456   74.93 x  51.05   (height 6.1 %)
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const TOLERANCE = 0.10;

// sku, codigo_base, stored height, stored OD, Fleetguard part, Fleetguard height mm, Fleetguard OD mm
const ROWS = [
  ['EA17283', 'P607283', 13.5, 9.06, 'AF1631', 342.9, 253.0],
  ['EH60426', 'P550426', 3.26, 3.02, 'HF35099', 88.65, 75.95],
  ['EH61222', 'P551222', 7.43, 4.5, 'HF6210', 205.23, 114.81],
  ['EH61347', 'P551347', 3.13, 2.01, 'HF35456', 74.93, 51.05],
];

const toMm = inch => Math.round(Number(inch) * 25.4 * 10) / 10;
const gap = (mm, reference) => Math.abs(mm - reference) / reference;

(async () => {
  const plan = ROWS.map(([sku, base, h, od, fg, fgH, fgOd]) => {
    const height = toMm(h);
    const diameter = toMm(od);
    if (gap(height, fgH) > TOLERANCE || gap(diameter, fgOd) > TOLERANCE) throw new Error(`OUTSIDE_TOLERANCE ${sku}`);
    return { sku, base, h, od, fg, fgH, fgOd, height, diameter };
  });

  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', updated: [], skipped: [] };

  try {
    await db.query('BEGIN');
    for (const p of plan) {
      // guarded by the stored values: a row edited since the review is skipped, not overwritten
      const u = await db.query(
        `UPDATE public.elimfilters_catalog
         SET height_mm=$1, outer_diameter_mm=$2,
             enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{dimension_review}', $7::jsonb)
         WHERE sku=$3 AND codigo_base=$4 AND height_mm=$5::numeric AND outer_diameter_mm=$6::numeric
         RETURNING sku, height_mm, outer_diameter_mm`,
        [p.height, p.diameter, p.sku, p.base, p.h, p.od, JSON.stringify({
          state: 'INCH_VALUE_CONVERTED_PENDING_OFFICIAL_PAGE',
          method: 'stored Donaldson inch value x 25.4; magnitude checked against the Fleetguard equivalent at a 10 % limit (operator accepted 2026-10-12)',
          stored_before: { height: p.h, outer_diameter: p.od },
          fleetguard_equivalent: p.fg,
          fleetguard_height_mm: p.fgH,
          fleetguard_od_mm: p.fgOd,
          height_gap_pct: Math.round(gap(p.height, p.fgH) * 1000) / 10,
          od_gap_pct: Math.round(gap(p.diameter, p.fgOd) * 1000) / 10,
          migration: 'run_248',
        })]);
      if (u.rowCount === 1) report.updated.push(u.rows[0]);
      else report.skipped.push(p.sku);
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
