'use strict';

/**
 * EA14353 is reactivated (operator 2026-11-25, "reactívalo mientras consigo Fleetguard"): run_482 retired it because its real base P524353 is discontinued at Donaldson, but the row (AF4353, Fleetguard, OD 234 x H 411,
 * 26 equipment applications, photo) is kept until the Fleetguard AF4353 page is brought in. Reverses only run_482 for this SKU: catalog_active=true and the INACTIVE_RETIRED resolution_status is removed.
 * It stays BLOCKED (base not verified); nothing else changes. Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const SKU = 'EA14353';

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const row = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!row || row.catalog_active || row.duty !== 'HEAVY_DUTY' || row.codigo_base !== 'AF4353' || row.enrichment_data?.resolution_status?.migration !== 'run_482') throw new Error('SOURCE_CHANGED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row, row_sha256: sha(row) }, null, 2));
    const enrichment = { ...(row.enrichment_data || {}) };
    delete enrichment.resolution_status;
    const u = await db.query('UPDATE public.elimfilters_catalog SET catalog_active=true, enrichment_data=$2::jsonb WHERE sku=$1', [SKU, JSON.stringify(enrichment)]);
    if (u.rowCount !== 1) throw new Error('UPDATE_COUNT');
    try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]); await db.query('RELEASE SAVEPOINT c'); } catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); }
    report.cache_rows = (await db.query('SELECT count(*)::int n FROM public.crossref_resolved_cache WHERE sku=$1', [SKU])).rows[0].n;
    const after = (await db.query("SELECT catalog_active, enrichment_data->'resolution_status' rs, codigo_base FROM public.elimfilters_catalog WHERE sku=$1", [SKU])).rows[0];
    report.after = after;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
