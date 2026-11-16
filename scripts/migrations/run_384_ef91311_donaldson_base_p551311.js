'use strict';

/**
 * EF91311 (HD SYNTAPORE spin-on fuel filter): corrects codigo_base ST1311 -> P551311 (Donaldson).
 * ST1311 is not a Donaldson code; P551311 is ("FUEL FILTER, SPIN-ON SECONDARY", Donaldson scrape 2026-09-17, scripts/donaldson_fuel_final_results_20260917.json)
 * and the SKU suffix 1311 already matches the last four digits. Operator ruling 2026-11-16 (Victor): base = Donaldson P551311.
 * Only codigo_base, canonical_source_* and the codigo_base governance block change; codes, applications and everything else are untouched.
 * Dry-run by default (ROLLBACK); --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EF91311', OLD = 'ST1311', BASE = 'P551311';
const URL_DON = 'https://shop.donaldson.com/store/en-us/product/P551311/';
const AT = '2026-11-16T00:00:00.000Z';
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client(url ? { connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } } : { host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };
  try {
    await db.query('BEGIN');
    const row = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!row) throw new Error('SKU_NOT_FOUND');
    if (row.codigo_base === BASE) { report.result = 'already'; await db.query('ROLLBACK'); console.log(JSON.stringify(report, null, 2)); return; }
    if (row.codigo_base !== OLD) throw new Error('UNEXPECTED_CURRENT_BASE ' + row.codigo_base);
    const clash = (await db.query(`SELECT sku FROM public.elimfilters_catalog WHERE sku<>$1 AND (upper(regexp_replace(coalesce(codigo_base,''),'[^A-Za-z0-9]','','g'))=$2 OR upper(regexp_replace(coalesce(canonical_source_code,''),'[^A-Za-z0-9]','','g'))=$2)`, [SKU, norm(BASE)])).rows;
    if (clash.length) throw new Error('BASE_HELD_BY_OTHER_SKU ' + clash.map((r) => r.sku).join(','));
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row }, null, 2));
    const gov = {
      ...(row.enrichment_data?.codigo_base_governance || {}),
      state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', verified_at: AT, evidence_url: URL_DON,
      evidence_level: 'DONALDSON_CATALOG_SCRAPE', evidence_authority: 'DONALDSON_CATALOG_SCRAPE_20260917_OPERATOR_DIRECTED',
      required_authority: 'VERIFIED_DONALDSON', contamination_flags: [], observed_primary_candidates: [BASE],
      current_codigo_base: BASE, approved_codigo_base: BASE, approved_manufacturer: 'DONALDSON', approved_source_column: 'COMPETITOR_CODES',
      previous_codigo_base: OLD, verification_method: 'DONALDSON_P551311_SPIN_ON_SECONDARY_OPERATOR_RULING_20261116',
      alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY', primary_manufacturer_verified: true,
    };
    const next = { ...row, codigo_base: BASE, enrichment_data: { ...(row.enrichment_data || {}), codigo_base_governance: gov },
      canonical_source_brand: 'DONALDSON', canonical_source_code: BASE, canonical_source_url: URL_DON, canonical_source_status: 'VERIFIED', canonical_verified_at: AT,
      canonical_evidence: { authority: 'DONALDSON_CATALOG_SCRAPE_20260917', source_url: URL_DON, evidence_hash: sha({ sku: SKU, base: BASE, url: URL_DON }) } };
    report.gateway = assertCanonicalWrite(next, { validateApplications: false }).valid;
    report.policy = evaluateCodigoBase(next);
    if (!report.policy.valid) throw new Error('POLICY_REJECTED ' + JSON.stringify(report.policy));
    await db.query(`UPDATE public.elimfilters_catalog SET codigo_base=$2::text, enrichment_data=$3::jsonb, canonical_source_brand='DONALDSON', canonical_source_code=$2::text,
      canonical_source_url=$4, canonical_source_status='VERIFIED', canonical_verified_at=$5, canonical_evidence=$6::jsonb WHERE sku=$1`,
      [SKU, BASE, JSON.stringify(next.enrichment_data), URL_DON, AT, JSON.stringify(next.canonical_evidence)]);
    const after = (await db.query('SELECT codigo_base, canonical_source_code FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    if (after.codigo_base !== BASE) throw new Error('POST_WRITE_VERIFICATION_FAILED');
    report.before = OLD; report.after = after.codigo_base;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
