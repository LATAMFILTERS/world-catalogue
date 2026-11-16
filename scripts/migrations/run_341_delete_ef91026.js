'use strict';

/**
 * EF91026 is a retired twin of ES91026 (same Donaldson base P551026) and must not exist (operator ruling 2026-11-15).
 * Deletes its row and its ledger/evidence rows. History tables (oem_codes_legacy, mixed_duty_crossref_audit, backup_*)
 * are left as they are. The SUPERSEDED reference EF91026 -> ES91026 (run_340) is kept so the old code still resolves.
 * Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EF91026';
const COL = { product_model: 'elimfilters_sku' };
const TABLES = ['product_model', 'catalog_codigo_base_evidence', 'catalog_codigo_base_sanitation_queue', 'catalog_sku_certification', 'elimfilters_catalog'];

if (require.main === module) (async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client(url
    ? { connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } }
    : { host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU, deleted: {} };
  try {
    await db.query('BEGIN');
    const row = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!row) throw new Error('SKU_NOT_FOUND');
    if (row.catalog_active || row.codigo_base !== 'P551026' || row.enrichment_data?.resolution_status?.superseded_by !== 'ES91026') throw new Error('NOT_THE_RETIRED_TWIN');
    const es = (await db.query(`SELECT c.catalog_active, s.certification_state FROM public.elimfilters_catalog c JOIN public.catalog_sku_certification s USING(sku) WHERE sku='ES91026'`)).rows[0];
    if (!es || !es.catalog_active || es.certification_state !== 'CERTIFIED') throw new Error('ES91026_NOT_CERTIFIED');
    const snap = { captured_at: new Date().toISOString(), catalog: row };
    for (const t of TABLES.filter((x) => x !== 'elimfilters_catalog')) snap[t] = (await db.query(`SELECT * FROM public.${t} WHERE ${COL[t] || 'sku'}=$1`, [SKU])).rows;
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify(snap, null, 2));
    for (const t of TABLES) report.deleted[t] = (await db.query(`DELETE FROM public.${t} WHERE ${COL[t] || 'sku'}=$1`, [SKU])).rowCount;
    await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [SKU]);
    report.left = (await db.query(`SELECT count(*)::int n FROM public.elimfilters_catalog WHERE sku=$1`, [SKU])).rows[0].n;
    report.p551026_rows = (await db.query(`SELECT sku, catalog_active FROM public.elimfilters_catalog WHERE upper(regexp_replace(codigo_base,'[^A-Za-z0-9]','','g'))='P551026'`)).rows;
    report.resolver_ef91026 = (await db.query(`SELECT code, sku FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part('EF91026') OR sku=$1`, [SKU])).rows;
    if (report.left !== 0 || report.p551026_rows.length !== 1) throw new Error('POST_DELETE_VERIFICATION_FAILED');
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
