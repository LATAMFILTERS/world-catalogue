'use strict';

/**
 * Twelve hydraulic elements whose height_mm holds the INCH length.
 *
 * Same defect as run_243, but shop.donaldson.com could not be read for these
 * (the store refused this machine on 2026-10-12). Source instead: Donaldson
 * Hydraulic Filtration Product Guide F112100, whose filter tables print the
 * length as "in  mm". On each row below the stored value rounds to the inch
 * figure and converts to the mm figure of the catalog row for the same part.
 * https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/catalogs/Hydraulic/North-America/F112100-ENG/Hydraulic-Filtration-Product-Guide.pdf
 *
 * The catalog rounds mm to whole numbers; a later page capture may refine them.
 * outer_diameter_mm is set only where the catalog states the series diameter
 * (PDF page 21: "All models measure 5.0"/127mm outer diameter"; page 98:
 * "4.39" (112mm) OD"). The other five keep their stored diameter, still unverified.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');

// sku, codigo_base, stored height, catalog inch, catalog mm, PDF page, stored OD, catalog OD mm (null = not stated)
const ROWS = [
  ['EH60250', 'P550250', 10.66, 10.7, 271, 21, 5.04, 127],
  ['EH60252', 'P550252', 10.66, 10.7, 271, 21, 5.04, 127],
  ['EH60276', 'P550276', 10.66, 10.7, 271, 21, 5.04, 127],
  ['EH60387', 'P550387', 6.66, 6.7, 170, 21, 4.86, 127],
  ['EH60388', 'P550388', 7.19, 7.2, 183, 21, 5.05, 127],
  ['EH61183', 'P561183', 10.66, 10.7, 271, 21, 5.04, 127],
  ['EH60309', 'P170309', 9.52, 9.5, 242, 68, 3.13, null],
  ['EH60310', 'P170310', 5.52, 5.5, 140, 68, 3.13, null],
  ['EH60311', 'P170311', 9.52, 9.5, 242, 68, 3.13, null],
  ['EH60312', 'P170312', 5.52, 5.5, 140, 68, 3.13, null],
  ['EH60584', 'P560584', 9.44, 9.4, 240, 72, 3.82, null],
  ['EH61016', 'P161016', 16.0, 16.0, 406, 98, 4.39, 112],
];

(async () => {
  for (const [sku, , stored, inch, mm, , storedOd, odMm] of ROWS) {
    // the stored number must be the catalog's inch figure and convert to its mm figure
    if (Math.abs(stored - inch) > 0.06 || Math.abs(stored * 25.4 - mm) > 1) throw new Error(`HEIGHT_DOES_NOT_RESTATE_CATALOG ${sku}`);
    if (odMm !== null && Math.abs(storedOd * 25.4 - odMm) > 4) throw new Error(`OD_DOES_NOT_FIT_CATALOG ${sku}`);
  }

  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', updated: [], skipped: [] };

  try {
    await db.query('BEGIN');
    for (const [sku, base, stored, , mm, page, storedOd, odMm] of ROWS) {
      // guarded by the stored values: a row edited since the review is skipped, not overwritten
      const u = await db.query(
        `UPDATE public.elimfilters_catalog
         SET height_mm=$1, outer_diameter_mm=coalesce($2::numeric, outer_diameter_mm)
         WHERE sku=$3 AND codigo_base=$4 AND height_mm=$5::numeric AND outer_diameter_mm=$6::numeric
         RETURNING sku, height_mm, outer_diameter_mm`,
        [mm, odMm, sku, base, stored, storedOd]);
      if (u.rowCount === 1) report.updated.push({ ...u.rows[0], catalog_page: page, od_from_catalog: odMm !== null });
      else report.skipped.push({ sku, expected_height: stored, expected_od: storedOd });
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
