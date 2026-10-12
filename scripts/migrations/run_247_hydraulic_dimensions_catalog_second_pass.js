'use strict';

/**
 * Six more hydraulic elements fixed from Donaldson's Hydraulic Filtration
 * Product Guide F112100 (same source as run_244). A second extraction of the
 * PDF in table mode read these rows correctly.
 * https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/catalogs/Hydraulic/North-America/F112100-ENG/Hydraulic-Filtration-Product-Guide.pdf
 *
 * Height (catalog "Length in / mm" of the same part number):
 *   EH60693 P560693  5.35 in ->  136 mm   page 18, SP15/25
 *   EH60716 P560716 14.69 in ->  373 mm   page 94, DPK350   (stored 14.68)
 *   EH60718 P560718 14.69 in ->  373 mm   page 94, DPK350   (stored 14.68)
 *   EH61274 P171274 11.6  in ->  294 mm   page 76, HMK05/25 (stored 11.63)
 *   EH61276 P171276 11.6  in ->  294 mm   page 76, HMK05/25 (stored 11.63)
 *   EH60386 P550386  6.7  in ->  170 mm   page 21 — the stored 7.19 is not this
 *     part's length at all (7.2 in / 183 mm is P550388); this one is a wrong
 *     value, not a unit mix-up.
 *
 * Diameter: the catalog states it only for EH60386 (page 21: "All models
 * measure 5.0"/127mm outer diameter"). For the other five it is the stored
 * inch number x 25.4, the same operator-accepted conversion as run_246, and is
 * recorded as not cross-checked.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const SOURCE = 'Donaldson Hydraulic Filtration Product Guide F112100';

// sku, codigo_base, stored height, catalog inch, catalog mm, PDF page, stored OD, catalog OD mm (null = not stated)
const ROWS = [
  ['EH60386', 'P550386', 7.19, 6.7, 170, 21, 5.0, 127],
  ['EH60693', 'P560693', 5.35, 5.35, 136, 18, 3.66, null],
  ['EH60716', 'P560716', 14.68, 14.69, 373, 94, 3.29, null],
  ['EH60718', 'P560718', 14.68, 14.69, 373, 94, 3.29, null],
  ['EH61274', 'P171274', 11.63, 11.6, 294, 76, 4.7, null],
  ['EH61276', 'P171276', 11.63, 11.6, 294, 76, 4.7, null],
];

const toMm = inch => Math.round(Number(inch) * 25.4 * 10) / 10;

(async () => {
  for (const [sku, , stored, inch, mm] of ROWS) {
    if (Math.abs(inch * 25.4 - mm) > 1.5) throw new Error(`CATALOG_ROW_INCONSISTENT ${sku}`);
    // every row but EH60386 must be the same length the catalog prints, just in inches
    if (sku !== 'EH60386' && (Math.abs(stored - inch) > 0.06 || Math.abs(stored * 25.4 - mm) > 1.5)) {
      throw new Error(`HEIGHT_DOES_NOT_RESTATE_CATALOG ${sku}`);
    }
  }

  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', updated: [], skipped: [] };

  try {
    await db.query('BEGIN');
    for (const [sku, base, stored, inch, mm, page, storedOd, catalogOd] of ROWS) {
      const od = catalogOd !== null ? catalogOd : toMm(storedOd);
      // guarded by the stored values: a row edited since the review is skipped, not overwritten
      const u = await db.query(
        `UPDATE public.elimfilters_catalog
         SET height_mm=$1, outer_diameter_mm=$2,
             enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{dimension_review}', $7::jsonb)
         WHERE sku=$3 AND codigo_base=$4 AND height_mm=$5::numeric AND outer_diameter_mm=$6::numeric
         RETURNING sku, height_mm, outer_diameter_mm`,
        [mm, od, sku, base, stored, storedOd, JSON.stringify({
          state: catalogOd !== null ? 'DIMENSIONS_FROM_DONALDSON_CATALOG' : 'HEIGHT_FROM_DONALDSON_CATALOG_DIAMETER_CONVERTED',
          height_source: `${SOURCE}, PDF page ${page}: ${inch} in / ${mm} mm`,
          outer_diameter_basis: catalogOd !== null
            ? `${SOURCE}, PDF page ${page}: series outer diameter ${catalogOd} mm`
            : 'stored inch value x 25.4, not cross-checked; operator-accepted conversion (2026-10-12)',
          stored_before: { height: stored, outer_diameter: storedOd },
          migration: 'run_247',
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
