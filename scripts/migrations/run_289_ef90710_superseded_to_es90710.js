'use strict';

/**
 * Operator ruling (Victor, 2026-11-04): former SKU EF90710 resolves to ES90710 (P580710, the separator that keeps the
 * 0710 digits); the Donaldson Blue alternative DBF0710 is ES90083 (Fleetguard FS20083). run_288 had registered the
 * EF90710 SUPERSEDED reference to ES90083; this repoints that one row. Dry-run by default (ROLLBACK). --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  try {
    await db.query('BEGIN');
    const target = await db.query(`SELECT 1 FROM public.elimfilters_catalog WHERE sku='ES90710' AND codigo_base='P580710' AND catalog_active`);
    if (target.rowCount !== 1) throw new Error('ES90710_P580710_NOT_ACTIVE');
    const u = await db.query(`UPDATE public.exact_part_reference SET sku='ES90710', source='RUN_289_EF90710_TO_ES90710_OPERATOR_20261104'
      WHERE reference_type='SUPERSEDED' AND brand='ELIMFILTERS' AND part_number='EF90710' AND sku='ES90083' RETURNING part_number, sku`);
    if (u.rowCount !== 1) throw new Error(`EXPECTED_1_ROW_GOT_${u.rowCount}`);
    for (const s of ['ES90710', 'ES90083']) {
      try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [s]); await db.query('RELEASE SAVEPOINT c'); }
      catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); }
    }
    const after = (await db.query(`SELECT part_number, sku, source FROM public.exact_part_reference WHERE part_number='EF90710'`)).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ mode: APPLY ? 'execute' : 'dry-run', after, transaction: APPLY ? 'COMMIT' : 'ROLLBACK' }, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
