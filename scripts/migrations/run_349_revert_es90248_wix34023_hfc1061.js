'use strict';

/**
 * Reverts run_348 on ES90248 (Donaldson P550248). New evidence (official Donaldson P550248 page, Parker BF9821 page, Fleetguard FS19587
 * page) shows that WIX 34023 and the JAC HFC1061 / CY4102BZLQ fitment belong to the Fleetguard FS19587 / Baldwin BF9821 group
 * (thread M20 x 1.5), not to P550248 (thread M16 x 1.5, no Baldwin/Clarcor/Wix/FS19587 in its cross list).
 * Restores equipment_applications, competitor_codes and enrichment_data from the run_348 snapshot and removes the four
 * evidence rows that run_348 wrote. Nothing else is touched.
 * Dry-run by default; --execute needs --snapshot <file> (the run_348 snapshot to restore from) and --backup <file> (current state).
 */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const BACKUP = arg('--backup');
const SKU = 'ES90248';
const EVIDENCE_IDS = [36784, 36785, 36786, 36787];

(async () => {
  if (!SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED');
  if (APPLY && !BACKUP) throw new Error('BACKUP_REQUIRED_FOR_EXECUTE');
  const before = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')).rows.find((r) => r.sku === SKU);
  if (!before) throw new Error('SNAPSHOT_ROW_MISSING');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client(url
    ? { connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } }
    : { host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };
  try {
    await db.query('BEGIN');
    const cur = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!cur || cur.codigo_base !== 'P550248') throw new Error('TARGET_CHANGED');
    if (!cur.competitor_codes.some((x) => String(x.code) === '34023')) throw new Error('NOTHING_TO_REVERT');
    if (APPLY) fs.writeFileSync(BACKUP, JSON.stringify({ captured_at: new Date().toISOString(), row: cur }, null, 2));
    await db.query('UPDATE public.elimfilters_catalog SET equipment_applications=$2::jsonb, competitor_codes=$3::jsonb, enrichment_data=$4::jsonb WHERE sku=$1',
      [SKU, JSON.stringify(before.equipment_applications), JSON.stringify(before.competitor_codes), JSON.stringify(before.enrichment_data)]);
    const del = await db.query(`DELETE FROM public.catalog_application_evidence WHERE sku=$1 AND id = ANY($2::bigint[]) AND created_at >= '2026-11-15'`, [SKU, EVIDENCE_IDS]);
    report.evidence_rows_deleted = del.rowCount;
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);
    const s = (await db.query('SELECT jsonb_array_length(equipment_applications) eq, jsonb_array_length(competitor_codes) cc, codigo_base FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    report.after = s;
    if (s.eq !== before.equipment_applications.length || s.cc !== before.competitor_codes.length || s.codigo_base !== 'P550248') throw new Error('POST_REVERT_VERIFICATION_FAILED');
    report.resolver_34023 = (await db.query(`SELECT code,sku FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part('34023')`)).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
