'use strict';

/**
 * height_mm / outer_diameter_mm holding the INCH number of Donaldson's page.
 *
 * Donaldson prints dimensions as "8.63 inch (219.3 mm)". On 309 products the
 * importer stored the first number (8.63) in the millimetre column. The data
 * file lists every case where the stored value equals the inch number printed
 * on the captured official page of the row's own codigo_base; the fix writes
 * the millimetre number from that same page.
 *
 * Only Donaldson-based rows with a captured page are covered. Each update is
 * guarded by the stored value, so a row edited since the capture is skipped
 * and reported, not overwritten.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const FIXES = require('./run_243_inch_values_in_mm_columns.data.json');
const COLUMNS = new Set(['height_mm', 'outer_diameter_mm']);

(async () => {
  for (const f of FIXES) {
    if (!COLUMNS.has(f.column)) throw new Error(`COLUMN_NOT_ALLOWED ${f.sku} ${f.column}`);
    const m = /^\s*([0-9.]+)\s*inch\s*\(\s*([0-9.]+)\s*mm\s*\)/.exec(f.page_value);
    // the data must restate the page: stored = inch number, correct = mm number, and they convert
    if (!m || Number(m[1]) !== Number(f.stored) || Number(m[2]) !== f.correct_mm || Math.abs(Number(m[1]) * 25.4 - f.correct_mm) >= 1) {
      throw new Error(`DATA_DOES_NOT_RESTATE_PAGE ${f.sku} ${f.column}`);
    }
  }

  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', values_in_data: FIXES.length, updated: 0, skipped: [] };

  try {
    await db.query('BEGIN');
    for (const f of FIXES) {
      const u = await db.query(
        `UPDATE public.elimfilters_catalog SET ${f.column}=$1 WHERE sku=$2 AND codigo_base=$3 AND ${f.column}=$4::numeric`,
        [f.correct_mm, f.sku, f.codigo_base, f.stored]);
      if (u.rowCount === 1) report.updated += 1;
      else report.skipped.push({ sku: f.sku, column: f.column, expected_stored: f.stored });
    }
    report.products_updated = (await db.query(
      `SELECT count(*)::int AS n FROM public.elimfilters_catalog WHERE sku = ANY($1::text[])`, [[...new Set(FIXES.map(f => f.sku))]])).rows[0].n;
    report.sample = (await db.query(
      `SELECT sku, height_mm, outer_diameter_mm FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku`,
      [['ES93203', 'ES93204', 'ES93207']])).rows;
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
