'use strict';

/**
 * EW72096: the code base WF2096 was wrong. Operator 2026-11-25: EW72096 comes from Donaldson P552096. Verified on the official Donaldson page
 * https://shop.donaldson.com/store/es-us/product/P552096/20822 : coolant filter, spin-on, OD 93 mm, thread M16 x 1.5, length 136 mm = catalogue EW72096 (OD 93.47, H 138.33, M16 x 1.5-6H).
 * codigo_base -> P552096 (DONALDSON, VERIFIED); governance CANONICAL_VERIFIED; the old base WF2096 stays as a FLEETGUARD competitor code (cross reference).
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
const SKU = 'EW72096';
const OLD = 'WF2096';
const BASE = 'P552096';
const URL_DON = 'https://shop.donaldson.com/store/es-us/product/P552096/20822';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };
  try {
    await db.query('BEGIN');
    const cur = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!cur || cur.codigo_base !== OLD) throw new Error('SOURCE_CHANGED');
    const clash = await db.query(`SELECT sku FROM public.elimfilters_catalog WHERE sku<>$1 AND (upper(regexp_replace(coalesce(codigo_base,''),'[^A-Za-z0-9]','','g'))=$2 OR competitor_codes::text ilike $3 OR oem_codes::text ilike $3)`, [SKU, BASE, `%${BASE}%`]);
    if (clash.rowCount) throw new Error('CODE_ALREADY_USED ' + clash.rows.map((r) => r.sku).join(','));
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur, row_sha256: sha(cur) }, null, 2));
    const comp = (cur.competitor_codes || []).some((x) => norm(x.code) === OLD) ? cur.competitor_codes : [...(cur.competitor_codes || []), { code: OLD, manufacturer: 'FLEETGUARD', classification: 'AFTERMARKET', classification_source: 'OPERATOR_DECISION_20261125' }];
    const evidence = { page: URL_DON, attributes: { outer_diameter_mm: 93, thread: 'M16 x 1.5', length_mm: 136, style: 'Spin-On coolant' } };
    const enrichment = { ...(cur.enrichment_data || {}) };
    enrichment.codigo_base_governance = { ...(enrichment.codigo_base_governance || {}), state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', current_codigo_base: BASE, approved_codigo_base: BASE, approved_manufacturer: 'DONALDSON',
      approved_source_column: 'CODIGO_BASE', primary_manufacturer_verified: true, required_authority: 'VERIFIED_DONALDSON', evidence_url: URL_DON, evidence_kind: 'OFFICIAL_PRODUCT_PAGE', evidence_authority: 'DONALDSON_SHOP_PRODUCT_PAGE_20261125',
      evidence_hash: sha(evidence), verified_at: '2026-11-25T00:00:00.000Z', previous_codigo_base: OLD, competitor_code_count: comp.length, observed_fallback_candidates: [] };
    const patch = { codigo_base: BASE, competitor_codes: comp, enrichment_data: enrichment, canonical_source_brand: 'DONALDSON', canonical_source_status: 'VERIFIED', canonical_source_url: URL_DON };
    report.gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
    await db.query('UPDATE public.elimfilters_catalog SET codigo_base=$2, competitor_codes=$3::jsonb, enrichment_data=$4::jsonb, canonical_source_brand=$5, canonical_source_status=$6, canonical_source_url=$7 WHERE sku=$1', [SKU, BASE, JSON.stringify(comp), JSON.stringify(enrichment), 'DONALDSON', 'VERIFIED', URL_DON]);
    try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]); await db.query('RELEASE SAVEPOINT c'); } catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); }
    report.after = (await db.query('SELECT sku, codigo_base, canonical_source_brand, canonical_source_status, jsonb_array_length(competitor_codes) comp FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code) = ANY($1::text[])`, [[BASE, OLD]])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
