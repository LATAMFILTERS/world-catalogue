'use strict';

/**
 * Fleetguard FS1280 is a Heavy Duty separator code and ES91329 (Donaldson P551329) already holds it. It also sits as a competitor cross on the Light Duty row EF39252
 * (ld_catalog.ld_competitor_cross_references, source WK925/2). Operator order 2026-11-18: "sácalo de LD". Removes only that one row; PSC410 (Tecfil) is left and reported.
 * Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const rows = (await db.query("SELECT * FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku='EF39252' AND competitor_brand='FLEETGUARD' AND competitor_part_number='FS1280' FOR UPDATE")).rows;
    if (rows.length !== 1) throw new Error('SOURCE_CHANGED ' + rows.length);
    if (!(await db.query("SELECT 1 FROM public.elimfilters_catalog WHERE sku='ES91329' AND catalog_active AND competitor_codes @> '[{\"code\":\"FS1280\"}]'::jsonb")).rowCount) throw new Error('ES91329_DOES_NOT_HOLD_FS1280');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows }, null, 2));
    report.deleted = (await db.query('DELETE FROM ld_catalog.ld_competitor_cross_references WHERE id=$1', [rows[0].id])).rowCount;
    for (const s of ['EF39252', 'ES91329']) {
      try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [s]); await db.query('RELEASE SAVEPOINT c'); } catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); }
    }
    report.resolver_fs1280 = (await db.query("SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part('FS1280')")).rows;
    report.still_on_ld = (await db.query("SELECT competitor_brand,competitor_part_number FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku='EF39252' AND competitor_part_number IN ('PSC410','FS1280')")).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
