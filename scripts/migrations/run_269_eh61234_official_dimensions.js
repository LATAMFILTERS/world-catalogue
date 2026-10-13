'use strict';

/**
 * EH61234 (Donaldson P551234): replace the converted dimensions with the ones
 * on Donaldson's product page, and close the "pending official page" mark.
 *
 * run_266 wrote stored-inch x 25.4 (143.8 x 93.2 mm) from figures the operator
 * relayed. The operator has now pasted the full text of Donaldson's P551234
 * page (kept in C:/ELIMSERVER/evidence/eh61234-hf6833-20261012/):
 *   Length          5.66 inch (143.76 mm)
 *   Outer Diameter  3.67 inch (93.22 mm)
 *   Thread Size     1-12 UN
 *   Gasket OD       2.83 inch (71.88 mm)
 *   Gasket ID       2.46 inch (62.48 mm)
 *
 * Thread and both gasket values already match the row; the script requires
 * that. Height and diameter take the page's millimetre figures. The page's
 * cross references (6) and equipment rows (51) are already on the row.
 *
 * The page was pasted by the operator, not read by automation: Donaldson's
 * store still refuses this machine. The mark says so.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const SKU = 'EH61234';
const BASE = 'P551234';
const PAGE = { length_mm: 143.76, od_mm: 93.22, thread: '1-12 UN', gasket_od_mm: 71.88, gasket_id_mm: 62.48, length_in: 5.66, od_in: 3.67 };

(async () => {
  // the page's own pairs must be consistent
  if (Math.abs(PAGE.length_in * 25.4 - PAGE.length_mm) > 0.2 || Math.abs(PAGE.od_in * 25.4 - PAGE.od_mm) > 0.2) throw new Error('SELF_CHECK_PAGE_VALUES');

  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();

  try {
    await db.query('BEGIN');
    const found = await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU]);
    if (found.rowCount !== 1) throw new Error(`SKU_MISSING ${SKU}`);
    const row = found.rows[0];
    if (row.codigo_base !== BASE) throw new Error(`BASE_CHANGED: found ${row.codigo_base}`);
    if (Number(row.height_mm) !== 143.8 || Number(row.outer_diameter_mm) !== 93.2) throw new Error('DIMENSIONS_CHANGED_SINCE_RUN_266');
    // what the row already holds must agree with the page
    if (row.thread_size !== PAGE.thread) throw new Error(`THREAD_MISMATCH: ${row.thread_size}`);
    if (Number(row.gasket_od_mm) !== PAGE.gasket_od_mm || Number(row.gasket_id_mm) !== PAGE.gasket_id_mm) throw new Error('GASKET_MISMATCH');

    const before = (row.enrichment_data || {}).dimension_review || {};
    const u = await db.query(
      `UPDATE public.elimfilters_catalog
       SET height_mm=$2, outer_diameter_mm=$3,
           enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{dimension_review}', $4::jsonb)
       WHERE sku=$1
       RETURNING sku, height_mm, outer_diameter_mm, gasket_od_mm, gasket_id_mm, thread_size`,
      [SKU, PAGE.length_mm, PAGE.od_mm, JSON.stringify({
        state: 'DIMENSIONS_FROM_DONALDSON_PRODUCT_PAGE',
        source: 'shop.donaldson.com product page P551234, Attributes',
        page_values: { length: '5.66 inch (143.76 mm)', outer_diameter: '3.67 inch (93.22 mm)', thread: '1-12 UN',
          gasket_od: '2.83 inch (71.88 mm)', gasket_id: '2.46 inch (62.48 mm)' },
        pasted_by: 'OPERATOR',
        read_by_automation: false,
        stored_before_run_266: before.stored_before || null,
        previous_state: before.state || null,
        migration: 'run_269',
        reviewed_at: '2026-10-12',
      })]);

    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ mode: APPLY ? 'execute' : 'dry-run', row: u.rows[0], transaction: APPLY ? 'COMMIT' : 'ROLLBACK' }, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    await db.end();
  }
})().catch(e => { console.error(e.stack || e); process.exit(1); });
