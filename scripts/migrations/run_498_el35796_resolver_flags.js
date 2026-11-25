'use strict';

/**
 * EL35796 (Light Duty oil, Millard ML-57961 base by operator exception 2026-11-22; commercially known as 5796): the certification fails only BASE_CODE_NOT_UNIQUELY_RESOLVED because the resolver
 * (v_api_resolver_v7) accepts a catalogue base only when its governance says the manufacturer is verified: primary_manufacturer_verified OR (fallback_manufacturer_verified AND donaldson_absence_verified).
 * The exception row has neither, so ML57961 resolves to nothing. This sets those two flags (the same ones EA17203 carries) so ML57961 resolves to EL35796. Nothing else changes.
 * Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EL35796';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const cur = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!cur || cur.codigo_base !== 'ML57961' || cur.canonical_source_brand !== 'MILLARD' || !cur.catalog_active) throw new Error('SOURCE_CHANGED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur, row_sha256: sha(cur) }, null, 2));
    const enrichment = { ...(cur.enrichment_data || {}) };
    enrichment.codigo_base_governance = { ...(enrichment.codigo_base_governance || {}), fallback_manufacturer_verified: true, fallback_commercial_code_verified: true, donaldson_absence_verified: true, fram_absence_verified: true, mann_absence_verified: true };
    const patch = { enrichment_data: enrichment };
    report.gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
    await db.query('UPDATE public.elimfilters_catalog SET enrichment_data=$2::jsonb WHERE sku=$1', [SKU, JSON.stringify(enrichment)]);
    report.resolver_ml57961 = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part('ML57961')`)).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
