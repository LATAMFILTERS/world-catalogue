'use strict';

/**
 * Reverts run_353/run_354. EA17857 (Fleetguard AF27857) should not exist: the references of AF27857 (AGCO 6113198M1 / 6213198M1,
 * Bosch 986B03010, Renault 7424993638, Scania 1485592) are the ones the official Donaldson page lists for P784457, which the
 * catalogue already holds as EA16242 (Donaldson wins over Fleetguard in the canonical order). Donaldson's sheet does not name AF27857
 * (EA16242 holds it from the internal taxonomy only, 490 mm vs 535 mm), so nothing is added to EA16242 here.
 * Restores oem_codes / competitor_codes of EA16242 and EA31340 from the run_353 snapshot and deletes EA17857 with its ledger and cache rows.
 * Dry-run by default; --execute needs --snapshot <run_353 snapshot> and --backup <file>.
 */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const BACKUP = arg('--backup');
const SKU = 'EA17857';

(async () => {
  if (!SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED');
  if (APPLY && !BACKUP) throw new Error('BACKUP_REQUIRED_FOR_EXECUTE');
  const before = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')).rows;
  if (before.length !== 2) throw new Error('SNAPSHOT_ROWS');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client(url
    ? { connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } }
    : { host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };
  try {
    await db.query('BEGIN');
    const row = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!row || row.codigo_base !== 'AF27857') throw new Error('NOT_THE_EXPECTED_ROW');
    if (APPLY) {
      const ledger = (await db.query('SELECT * FROM public.catalog_sku_certification WHERE sku=$1', [SKU])).rows;
      const cur = (await db.query('SELECT sku,oem_codes,competitor_codes FROM public.elimfilters_catalog WHERE sku = ANY($1::text[])', [before.map((b) => b.sku)])).rows;
      fs.writeFileSync(BACKUP, JSON.stringify({ captured_at: new Date().toISOString(), ea17857: row, ledger, current_other_rows: cur }, null, 2));
    }
    for (const b of before) {
      await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [b.sku, JSON.stringify(b.oem_codes), JSON.stringify(b.competitor_codes)]);
    }
    report.deleted = {
      cache: (await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [SKU])).rowCount,
      ledger: (await db.query('DELETE FROM public.catalog_sku_certification WHERE sku=$1', [SKU])).rowCount,
      catalog: (await db.query('DELETE FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rowCount,
    };
    for (const b of before) await db.query('SELECT public.refresh_crossref_cache_sku($1)', [b.sku]);
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code) IN (ld_catalog.norm_part('AF27857'), ld_catalog.norm_part('1485592'), ld_catalog.norm_part('20544738'))`)).rows;
    report.left = (await db.query('SELECT count(*)::int n FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0].n;
    report.restored = (await db.query('SELECT sku, jsonb_array_length(oem_codes) oem, jsonb_array_length(competitor_codes) comp FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku', [before.map((b) => b.sku)])).rows;
    if (report.left !== 0) throw new Error('POST_DELETE_VERIFICATION_FAILED');
    for (const b of before) {
      const r = report.restored.find((x) => x.sku === b.sku);
      if (r.oem !== b.oem_codes.length || r.comp !== b.competitor_codes.length) throw new Error('RESTORE_MISMATCH ' + b.sku);
    }
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
