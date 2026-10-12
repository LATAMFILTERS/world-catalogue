'use strict';

/**
 * Register SKUs renumbered before run_227 as SUPERSEDED ELIMFILTERS references
 * (same mechanism as run_229). Pairs come from row-id continuity across the
 * catalog dumps of 2026-09-13..2026-10-12: same row id, same codigo_base, only
 * the SKU changed.
 *
 * Left out on purpose: EF90668/EF90669 (codigo_base changed with the rename),
 * EA30719 (target inactive), EH60950 (retired, not renumbered).
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const SOURCE = 'SKU_RENUMBER_ROW_ID_HISTORY_20261012';

// former SKU, current SKU
const PAIRS = [
  ['EA13082', 'EC13082'],
  ['EA16429', 'EC16429'],
  ['EA33748', 'EA13748'],
  ['EA34273', 'EA14273'],
  ['EA36062', 'EA16062'],
  ['ET91844P', 'ES91844'],
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
