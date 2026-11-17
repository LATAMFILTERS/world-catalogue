'use strict';

/**
 * run_394 retired ED41413 into ED43571 (same filter). The former Donaldson base P951413 no longer found anything, so it is registered as a
 * SUPERSEDED reference of ED43571 (same mechanism as the retired SKU itself in run_394). P781466 is added too (operator request 2026-11-17): the Donaldson
 * official site shows P953571 as "Reemplaza pieza P781466" (note "P953571 = P781466 + 5g Lubricant"). Dry-run by default; --execute commits.
 */
require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const CODES = ['P951413', 'P781466'];
const SKU = 'ED43571';

(async () => {
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const keep = (await db.query('SELECT sku,catalog_active FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    if (!keep || !keep.catalog_active) throw new Error('TARGET_CHANGED');
    report.inserted = 0;
    for (const code of CODES) {
      report.inserted += (await db.query(`INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) VALUES ('SUPERSEDED','DONALDSON',$1,$2,'RUN_395_DONALDSON_CODE_MERGED_INTO_ED43571') ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`, [code, SKU])).rowCount;
    }
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
