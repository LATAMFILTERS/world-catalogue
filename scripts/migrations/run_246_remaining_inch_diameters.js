'use strict';

/**
 * Follow-up to run_244 / run_245: 19 rows whose height was fixed but whose
 * outer_diameter_mm still holds the inch number, plus two single cases.
 *
 * 1. Diameters (19 rows). The height of each row was already confirmed to be
 *    an inch value (Donaldson catalog F112100 or the Fleetguard equivalent);
 *    both numbers came from the same Donaldson "x inch (y mm)" lines. No
 *    source was available to cross-check the diameter itself, so this is a
 *    plain conversion (stored x 25.4, one decimal) accepted by the operator on
 *    2026-10-12 and recorded as such in enrichment_data.dimension_review.
 *
 * 2. EH61040 (P761040) height 8.18 -> 208 mm: Donaldson EMEA Hydraulic
 *    Filtration Product Guide F116023, PDF page 90, FAL suction filters,
 *    dimension F = 208 mm (8.18 in = 207.8 mm). Its diameter is left alone:
 *    the table's dimension E (74 mm) does not match 2.72 in (69 mm).
 *
 * 3. EH60700 (P160700): run_245 wrote height 406.4 mm (stored 16.00 in,
 *    Fleetguard HF6296 = 406.4 mm). Donaldson's own catalog F112100, PDF page
 *    98, lists P160700 at 11.6 in / 294 mm. The two sources disagree; the
 *    height is not changed here, the conflict is recorded on the row.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');

// sku, codigo_base, stored outer_diameter (inch number)
const DIAMETERS = [
  ['EH60083', 'P550083', 4.41], ['EH60092', 'P170092', 4.42], ['EH60095', 'P170095', 3.6], ['EH60098', 'P170098', 3.6],
  ['EH60213', 'P550213', 6.0], ['EH60309', 'P170309', 3.13], ['EH60310', 'P170310', 3.13], ['EH60311', 'P170311', 3.13],
  ['EH60312', 'P170312', 3.13], ['EH60527', 'P560527', 4.39], ['EH60532', 'P550532', 5.51], ['EH60584', 'P560584', 3.82],
  ['EH60700', 'P160700', 4.39], ['EH61160', 'P551160', 3.94], ['EH61244', 'P171244', 2.83], ['EH61248', 'P171248', 2.73],
  ['EH61314', 'P171314', 2.69], ['EH61315', 'P171315', 2.69], ['EH61348', 'P551348', 3.66],
];

const toMm = inch => Math.round(Number(inch) * 25.4 * 10) / 10;
const merge = `enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{dimension_review}',
  coalesce(enrichment_data->'dimension_review','{}'::jsonb) || $1::jsonb)`;

(async () => {
  if (toMm(4.41) !== 112 || toMm(3.13) !== 79.5) throw new Error('SELF_CHECK_CONVERSION');

  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', diameters: [], skipped: [] };

  try {
    await db.query('BEGIN');

    for (const [sku, base, stored] of DIAMETERS) {
      // only rows whose height is already in millimetres, and whose diameter is still the stored inch number
      const u = await db.query(
        `UPDATE public.elimfilters_catalog SET outer_diameter_mm=$2, ${merge}
         WHERE sku=$3 AND codigo_base=$4 AND outer_diameter_mm=$5::numeric AND height_mm >= 50
         RETURNING sku, height_mm, outer_diameter_mm`,
        [JSON.stringify({
          state: 'INCH_VALUE_CONVERTED_PENDING_OFFICIAL_PAGE',
          outer_diameter_converted: true,
          outer_diameter_basis: 'stored inch value x 25.4, not cross-checked; height of the same row confirmed as inches; operator accepted 2026-10-12',
          outer_diameter_stored_before: stored,
          outer_diameter_migration: 'run_246',
        }), toMm(stored), sku, base, stored]);
      if (u.rowCount === 1) report.diameters.push(u.rows[0]);
      else report.skipped.push(sku);
    }

    const h = await db.query(
      `UPDATE public.elimfilters_catalog SET height_mm=208, ${merge}
       WHERE sku='EH61040' AND codigo_base='P761040' AND height_mm=8.18
       RETURNING sku, height_mm, outer_diameter_mm`,
      [JSON.stringify({
        state: 'HEIGHT_FROM_DONALDSON_CATALOG_DIAMETER_UNVERIFIED',
        height_source: 'Donaldson EMEA Hydraulic Filtration Product Guide F116023, PDF page 90, FAL suction filters, dimension F',
        height_source_url: 'https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/catalogs/Hydraulic/emea/f116023/Hydraulic-Filtration-Product-Guide.pdf',
        stored_before: { height: 8.18, outer_diameter: 2.72 },
        outer_diameter_converted: false,
        migration: 'run_246',
      })]);
    report.eh61040 = h.rows[0] || 'SKIPPED';

    const c = await db.query(
      `UPDATE public.elimfilters_catalog SET ${merge}
       WHERE sku='EH60700' AND codigo_base='P160700' AND height_mm=406.4
       RETURNING sku, height_mm, outer_diameter_mm`,
      [JSON.stringify({
        height_conflict: {
          written: '406.4 mm (stored 16.00 in; Fleetguard HF6296 = 406.4 mm)',
          donaldson_catalog: '11.6 in / 294 mm — Hydraulic Filtration Product Guide F112100, PDF page 98, HDK06 wire mesh',
          resolution: 'PENDING_DONALDSON_PRODUCT_PAGE',
        },
      })]);
    report.eh60700_conflict_recorded = c.rowCount === 1;

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
