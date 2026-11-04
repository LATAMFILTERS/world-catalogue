'use strict';

/**
 * ED47754 (ED4 = air dryer, DRYCORE) is the only active SKU whose technology label is the corrupted
 * literal "DRYCORE?" (bytes 445259434f52453f: a "?" where the trademark sign was lost in an encoding pass).
 * The other 15 DRYCORE SKUs carry the canonical "DRYCORE™" (…e284a2). Retired/corrupted technology labels
 * must not reach public, computational or Part Search surfaces, so the label is restored. One SKU, one column.
 *
 * Guarded: only the row with sku='ED47754' AND technology='DRYCORE?' AND an ED4 prefix is touched; any other
 * count than exactly 1 aborts. Dry-run by default (ROLLBACK). --apply to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--apply');
const SKU = 'ED47754';
const FROM = 'DRYCORE?';
const TO = 'DRYCORE™';

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  try {
    await db.query('BEGIN');
    const corrupted = await db.query(`SELECT sku FROM public.elimfilters_catalog WHERE catalog_active AND technology = $1`, [FROM]);
    const u = await db.query(
      `UPDATE public.elimfilters_catalog SET technology = $3 WHERE sku = $1 AND technology = $2 AND sku LIKE 'ED4%' RETURNING sku, technology`,
      [SKU, FROM, TO]);
    if (u.rowCount !== 1) throw new Error(`STOP_REVIEW: expected exactly 1 row for ${SKU} with "${FROM}", got ${u.rowCount}`);
    const after = await db.query(`SELECT technology, count(*)::int n FROM public.elimfilters_catalog WHERE catalog_active AND technology LIKE 'DRYCORE%' GROUP BY 1`);
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ migration: 'run_284_ed47754_drycore_technology_label', mode: APPLY ? 'apply' : 'dry-run',
      corrupted_before: corrupted.rows.map((r) => r.sku), updated: u.rows, drycore_labels_after: after.rows,
      transaction: APPLY ? 'COMMIT' : 'ROLLBACK' }, null, 2));
  } catch (e) {
    await db.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    await db.end();
  }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
