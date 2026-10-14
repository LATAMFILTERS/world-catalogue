'use strict';

/**
 * Descriptions that open with another SKU than the product's own.
 *
 * 100 active products have a description starting "ELIMFILTERS® <SKU> ..."
 * where <SKU> is not the row's SKU: a former SKU never updated after a
 * renumbering (ES91851 still says EF91851, ET93225P says ET91844P) or a
 * mistyped one (EA10002 says EA12000). In 89 cases that other SKU belongs to
 * a different active product. The text is public.
 *
 * The fix replaces that leading SKU with the row's own, and nothing else in
 * the text. The data file lists each (sku, SKU found in the description); a
 * row whose description no longer opens with that SKU is skipped and reported.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const PAIRS = require('./run_254_stale_sku_in_descriptions.data.json');
const PREFIX = 'ELIMFILTERS® ';

(async () => {
  for (const [sku, stale] of PAIRS) {
    if (sku === stale || !/^[A-Z]{2}[0-9][0-9A-Z]+$/.test(sku) || !/^[A-Z]{2}[0-9][0-9A-Z]+$/.test(stale)) throw new Error(`DATA_INVALID ${sku}`);
  }
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', pairs: PAIRS.length, updated: 0, skipped: [] };

  try {
    await db.query('BEGIN');
    for (const [sku, stale] of PAIRS) {
      const from = `${PREFIX}${stale} `;
      // only the leading SKU, and only while the description still opens with it
      const u = await db.query(
        `UPDATE public.elimfilters_catalog
         SET description = $2 || substr(description, length($3) + 1)
         WHERE sku=$1 AND left(description, length($3)) = $3`,
        [sku, `${PREFIX}${sku} `, from]);
      if (u.rowCount === 1) report.updated += 1;
      else report.skipped.push(sku);
    }
    report.still_mismatched = (await db.query(
      `SELECT count(*)::int AS n FROM public.elimfilters_catalog
       WHERE catalog_active AND substring(description from '^ELIMFILTERS. ([A-Z]{2}[0-9][0-9A-Z]+)') <> sku`)).rows[0].n;
    report.sample = (await db.query(
      `SELECT sku, left(description, 60) AS description FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku`,
      [['EA10002', 'ES91851', 'ET93225P']])).rows;
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
