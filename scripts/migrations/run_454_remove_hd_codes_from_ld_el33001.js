'use strict';

/**
 * Cummins 3318853 and Fleetguard LF3000 are Heavy Duty codes: Donaldson P553000 official page (operator paste 2026-11-18) lists Cummins 3318853 and LF3000 under it,
 * and EL83000 (base P553000) already holds them. They also sit as competitor crosses on Light Duty EL33001 (ld_catalog.ld_competitor_cross_references, source WP12300/1),
 * which made them resolve to the LD row. HD owns codes shared with LD (policy 2026-11-12). Removes only those two rows.
 * Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const CODES = [['CUMMINS', '3318853'], ['FLEETGUARD', 'LF3000']];

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const rows = (await db.query("SELECT * FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku='EL33001' AND (competitor_brand,competitor_part_number) IN (('CUMMINS','3318853'),('FLEETGUARD','LF3000')) FOR UPDATE")).rows;
    if (rows.length !== CODES.length) throw new Error('SOURCE_CHANGED ' + rows.length);
    for (const [, code] of CODES) {
      if (!(await db.query("SELECT 1 FROM public.elimfilters_catalog WHERE sku='EL83000' AND catalog_active AND (oem_codes||competitor_codes) @> $1::jsonb", [JSON.stringify([{ code }])])).rowCount) throw new Error('EL83000_DOES_NOT_HOLD_' + code);
    }
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows }, null, 2));
    report.deleted = (await db.query('DELETE FROM ld_catalog.ld_competitor_cross_references WHERE id = ANY($1::bigint[])', [rows.map((r) => r.id)])).rowCount;
    for (const s of ['EL33001', 'EL83000']) {
      try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [s]); await db.query('RELEASE SAVEPOINT c'); } catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); }
    }
    report.resolver = (await db.query("SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code) IN (ld_catalog.norm_part('LF3000'),ld_catalog.norm_part('3318853'),ld_catalog.norm_part('P553000'))")).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
