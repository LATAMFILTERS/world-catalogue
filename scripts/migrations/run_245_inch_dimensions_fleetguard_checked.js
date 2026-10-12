'use strict';

/**
 * Inch values in height_mm / outer_diameter_mm — 75 Donaldson-based products
 * whose Donaldson page could not be read (the store refused this machine on
 * 2026-10-12), cross-checked against Fleetguard instead.
 *
 * Same defect as run_243: the importer stored the inch number of Donaldson's
 * "8.63 inch (219.3 mm)". For each row in the data file:
 *   - the product already cites a Fleetguard equivalent, and Fleetguard's own
 *     record names the row's Donaldson codigo_base back;
 *   - stored x 25.4 lands within 5 % of the dimension Fleetguard publishes for
 *     that equivalent.
 *
 * What is written is the stored Donaldson number converted (x 25.4, one
 * decimal) — not Fleetguard's dimension, which belongs to another maker's
 * part. It is a conversion, not a value read from Donaldson's page; the row is
 * marked in enrichment_data.dimension_review so a later page capture can
 * replace it. The diameter is converted only where Fleetguard publishes one
 * to check against (61 rows); on the other 14 it stays as stored.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const ROWS = require('./run_245_inch_dimensions_fleetguard_checked.data.json');
const TOLERANCE = 0.05;

const toMm = inch => Math.round(Number(inch) * 25.4 * 10) / 10;
const within = (mm, reference) => Math.abs(mm - reference) / reference <= TOLERANCE;

function selfCheck() {
  if (toMm('9.02') !== 229.1 || toMm('4.51') !== 114.6) throw new Error('SELF_CHECK_CONVERSION');
  if (!within(229.1, 231.65) || within(143.8, 208.79)) throw new Error('SELF_CHECK_TOLERANCE');
}

(async () => {
  selfCheck();
  const plan = ROWS.map((r) => {
    const height = toMm(r.stored_height);
    if (!within(height, r.fleetguard_height_mm)) throw new Error(`HEIGHT_NOT_CONFIRMED ${r.sku}`);
    let od = null;
    if (r.fleetguard_od_mm !== null) {
      od = toMm(r.stored_od);
      if (!within(od, r.fleetguard_od_mm)) throw new Error(`OD_NOT_CONFIRMED ${r.sku}`);
    }
    return { ...r, height, od };
  });

  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', rows_in_data: plan.length, updated: 0, od_converted: 0, skipped: [] };

  try {
    await db.query('BEGIN');
    for (const p of plan) {
      // guarded by the stored values: a row edited since the review is skipped, not overwritten
      const u = await db.query(
        `UPDATE public.elimfilters_catalog
         SET height_mm=$1, outer_diameter_mm=coalesce($2::numeric, outer_diameter_mm),
             enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{dimension_review}', $7::jsonb)
         WHERE sku=$3 AND codigo_base=$4 AND height_mm=$5::numeric AND outer_diameter_mm=$6::numeric`,
        [p.height, p.od, p.sku, p.codigo_base, p.stored_height, p.stored_od, JSON.stringify({
          state: 'INCH_VALUE_CONVERTED_PENDING_OFFICIAL_PAGE',
          method: 'stored Donaldson inch value x 25.4; magnitude checked against the Fleetguard equivalent',
          stored_before: { height: p.stored_height, outer_diameter: p.stored_od },
          outer_diameter_converted: p.od !== null,
          fleetguard_equivalent: p.fleetguard,
          fleetguard_url: p.fleetguard_url,
          fleetguard_height_mm: p.fleetguard_height_mm,
          fleetguard_od_mm: p.fleetguard_od_mm,
          migration: 'run_245',
          reviewed_at: '2026-10-12',
        })]);
      if (u.rowCount === 1) { report.updated += 1; if (p.od !== null) report.od_converted += 1; }
      else report.skipped.push(p.sku);
    }
    report.sample = (await db.query(
      `SELECT sku, height_mm, outer_diameter_mm FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku`,
      [['EH60079', 'EH60083', 'EH60128']])).rows;
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
