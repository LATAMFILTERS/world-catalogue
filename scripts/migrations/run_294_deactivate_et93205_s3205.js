'use strict';

/**
 * Operator ruling (Victor, 2026-11-04): remove ET93205 (base Racor S3205). S3205 is not in Parker's official catalogue
 * (not among the 132 Racor spin-on elements nor the turbine lists on ph.parker.com, product URL 404) and no distributor
 * lists it. "Remove" = deactivate: the row and its evidence are kept (catalog_active=false), nothing is deleted.
 * Dry-run by default (ROLLBACK). --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  try {
    await db.query('BEGIN');
    const u = await db.query(`UPDATE public.elimfilters_catalog SET catalog_active=false,
        enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb),'{deactivation}',$2::jsonb)
      WHERE sku=$1 AND codigo_base='S3205' AND catalog_active RETURNING sku`,
      ['ET93205', JSON.stringify({ reason: 'Racor S3205 not in Parker official catalogue (ph.parker.com, 2026-11-05); operator ruling', by: 'operator 2026-11-04', source: 'RUN_294' })]);
    if (u.rowCount !== 1) throw new Error('EXPECTED_1_ROW_GOT_' + u.rowCount);
    await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku = $1', ['ET93205']);
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ mode: APPLY ? 'execute' : 'dry-run', deactivated: u.rows, transaction: APPLY ? 'COMMIT' : 'ROLLBACK' }));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
