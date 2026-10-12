'use strict';

/**
 * Register the six SKUs renumbered by run_227 (EF9 -> ES9) as SUPERSEDED
 * ELIMFILTERS references, so a search for the former SKU returns the product
 * instead of no_match. Part Search reads them in its exact-reference step.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const SOURCE = 'RUN_227_EF9_TO_ES9_RENUMBER';

// former SKU, current SKU
const PAIRS = [
  ['EF90460', 'ES90460'],
  ['EF90467', 'ES90467'],
  ['EF90736', 'ES90736'],
  ['EF90849', 'ES90849'],
  ['EF93014', 'ES93014'],
  ['EF93015', 'ES93015'],
];

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', registered: [] };

  try {
    await db.query('BEGIN');
    for (const [former, current] of PAIRS) {
      // a former SKU that is a live SKU again must not be shadowed
      const live = await db.query('SELECT 1 FROM public.elimfilters_catalog WHERE sku=$1', [former]);
      if (live.rowCount) throw new Error(`FORMER_SKU_IS_LIVE ${former}`);
      const target = await db.query('SELECT 1 FROM public.elimfilters_catalog WHERE sku=$1 AND catalog_active', [current]);
      if (!target.rowCount) throw new Error(`CURRENT_SKU_MISSING ${current}`);
      const ins = await db.query(
        `INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source)
         VALUES ('SUPERSEDED', 'ELIMFILTERS', $1, $2, $3)
         ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`,
        [former, current, SOURCE]);
      report.registered.push({ former, current, inserted: ins.rowCount === 1 });
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
