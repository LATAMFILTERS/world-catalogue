'use strict';

/**
 * EH60416 (P550416) and EH60476 (P550476): replace the converted dimensions
 * with the ones on Donaldson's product pages, and close the "pending official
 * page" mark left by run_266.
 *
 * The operator pasted the full text of both pages on 2026-10-12 (attributes
 * kept in C:/ELIMSERVER/evidence/donaldson-pages-pasted-20261012/):
 *
 *   P550416  HYDRAULIC FILTER, SPIN-ON
 *     Length 7.13 inch (181 mm)   Outer Diameter 3.82 inch (97 mm)   Thread Size M24 x 1.5
 *   P550476  HYDRAULIC FILTER, IN-LINE
 *     Overall Length 4.80 inch (121.92 mm)   Length 4.72 inch (119.89 mm)
 *     Outer Diameter 3.95 inch (100.33 mm)   no thread (in-line, inlet 26.92 mm)
 *
 * height_mm of EH60476 holds the Overall Length (the stored 4.80 was that
 * figure); the body Length of 119.89 mm is recorded in the note.
 *
 * The pages were pasted by the operator, not read by automation: Donaldson's
 * store still refuses this machine. The mark says so.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');

// sku, base, [height, od] written by run_266, [height, od] on the page, thread on the page (null = none), page lines
const ROWS = [
  ['EH60416', 'P550416', [181.1, 97], [181, 97], 'M24 x 1.5',
    { length: '7.13 inch (181 mm)', outer_diameter: '3.82 inch (97 mm)', thread: 'M24 x 1.5' }],
  ['EH60476', 'P550476', [121.9, 100.3], [121.92, 100.33], null,
    { overall_length: '4.80 inch (121.92 mm)', length: '4.72 inch (119.89 mm)', outer_diameter: '3.95 inch (100.33 mm)',
      inlet_diameter: '1.06 inch (26.92 mm)' }],
];

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', updated: [] };

  try {
    await db.query('BEGIN');
    for (const [sku, base, was, page, thread, lines] of ROWS) {
      const found = await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [sku]);
      if (found.rowCount !== 1) throw new Error(`SKU_MISSING ${sku}`);
      const row = found.rows[0];
      if (row.codigo_base !== base) throw new Error(`BASE_CHANGED ${sku}: found ${row.codigo_base}`);
      if (Number(row.height_mm) !== was[0] || Number(row.outer_diameter_mm) !== was[1]) throw new Error(`DIMENSIONS_CHANGED_SINCE_RUN_266 ${sku}`);
      // the page must be a refinement of what was converted, not a different filter
      if (Math.abs(page[0] - was[0]) > 0.5 || Math.abs(page[1] - was[1]) > 0.5) throw new Error(`PAGE_DISAGREES_WITH_CONVERSION ${sku}`);
      if ((row.thread_size || null) !== thread) throw new Error(`THREAD_MISMATCH ${sku}: ${row.thread_size}`);

      const before = (row.enrichment_data || {}).dimension_review || {};
      const u = await db.query(
        `UPDATE public.elimfilters_catalog
         SET height_mm=$2, outer_diameter_mm=$3,
             enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{dimension_review}', $4::jsonb)
         WHERE sku=$1
         RETURNING sku, height_mm, outer_diameter_mm, thread_size`,
        [sku, page[0], page[1], JSON.stringify({
          state: 'DIMENSIONS_FROM_DONALDSON_PRODUCT_PAGE',
          source: `shop.donaldson.com product page ${base}, Attributes`,
          page_values: lines,
          pasted_by: 'OPERATOR',
          read_by_automation: false,
          stored_before_run_266: before.stored_before || null,
          previous_state: before.state || null,
          migration: 'run_270',
          reviewed_at: '2026-10-12',
        })]);
      report.updated.push(u.rows[0]);
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
