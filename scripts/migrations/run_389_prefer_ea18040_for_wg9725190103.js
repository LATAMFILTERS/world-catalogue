'use strict';

/**
 * run_389: second half of the WG9725190103 fix (see run_388, which retired the Light Duty filler row EA31810).
 * EA15978 (Heavy Duty, 32 applications) also holds WG9725190103 as KING-LONG and the write gateway refuses every patch of that row
 * (FLEETGUARD_ABSENCE_NOT_VERIFIED, HD_FINAL_FALLBACK_MUST_BE_OEM, SKU_SUFFIX_MISMATCH), so it is not edited. EA18040 gets the existing
 * search_result_priority override for that code (same mechanism as the oil alternatives families, priority 1000) and wins the tie.
 * Operator ruling 2026-11-16: EA18040 is the correct product. Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const CODE = 'WG9725190103';
const SKU = 'EA18040';

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const keeper = (await db.query('SELECT sku,duty,catalog_active FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    if (!keeper || !keeper.catalog_active || keeper.duty !== 'HEAVY_DUTY') throw new Error('KEEPER_CHANGED');
    const before = (await db.query('SELECT * FROM public.search_result_priority WHERE query_code=$1', [CODE])).rows;
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), search_result_priority_before: before }, null, 2));
    report.inserted = (await db.query(`INSERT INTO public.search_result_priority(query_code, sku, priority, note)
      SELECT $1, $2, 1000, 'Operator ruling 2026-11-16: EA18040 is the correct product for WG9725190103 (run_389)'
      WHERE NOT EXISTS (SELECT 1 FROM public.search_result_priority WHERE query_code=$1 AND sku=$2)`, [CODE, SKU])).rowCount;
    report.after = (await db.query('SELECT query_code,sku,priority FROM public.search_result_priority WHERE query_code=$1', [CODE])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
