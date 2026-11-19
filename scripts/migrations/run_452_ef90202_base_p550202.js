'use strict';

/**
 * EF90202: codigo_base FF202 -> Donaldson P550202, and FS1280 removed from this SKU (operator order 2026-11-18: FS1280 belongs only to ES91329).
 * Donaldson official page (pasted by operator 2026-11-18): P550202 "FILTRO DE COMBUSTIBLE, SECUNDARIO ENROSCABLE", spin-on. SKU suffix 0202 already matches P550202.
 * The old base FF202 is kept in enrichment_data.rebased_from and as a FLEETGUARD competitor code. Only base fields, governance and codes change; dimensions are NOT touched
 * (row says 120 x 287 mm, Donaldson says 118.3 x 260 mm: reported to the operator). Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EF90202';
const OLD = 'FF202';
const BASE = 'P550202';
const URL_DON = 'https://shop.donaldson.com/store/es-us/product/P550202';
const AT = '2026-11-18T00:00:00.000Z';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU, from: OLD, to: BASE };
  try {
    await db.query('BEGIN');
    const cur = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!cur || cur.codigo_base !== OLD) throw new Error('SOURCE_CHANGED');
    const clash = await db.query(`SELECT sku FROM public.elimfilters_catalog WHERE sku<>$1 AND upper(regexp_replace(coalesce(codigo_base,''),'[^A-Za-z0-9]','','g'))=$2`, [SKU, BASE]);
    if (clash.rowCount) throw new Error('BASE_ALREADY_USED ' + clash.rows.map((r) => r.sku).join(','));
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur, row_sha256: sha(cur) }, null, 2));

    const enrichment = { ...(cur.enrichment_data || {}) };
    enrichment.rebased_from = { codigo_base: OLD, note: 'Operator 2026-11-17: ST1310 does not exist at Donaldson; rebased to P550202 ', rebased_at: AT };
    enrichment.codigo_base_governance = {
      state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', verified_at: AT, evidence_url: URL_DON,
      evidence_level: 'OFFICIAL_PRODUCT_PAGE', evidence_authority: 'DONALDSON_OFFICIAL_CATALOG', policy_version: '2026-08-19-v3.1',
      required_authority: 'VERIFIED_DONALDSON', contamination_flags: [], observed_primary_candidates: [],
      current_codigo_base: BASE, approved_codigo_base: BASE, approved_manufacturer: 'DONALDSON', approved_source_column: 'COMPETITOR_CODES',
      verification_method: 'DONALDSON_OFFICIAL_PRODUCT_PAGE_P550202_OPERATOR_ORDER', alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY',
      primary_manufacturer_verified: true, oem_code_count: (cur.oem_codes || []).length, competitor_code_count: (cur.competitor_codes || []).length,
    };
    const isFs = (x) => String(x.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '') === 'FS1280';
    const isBase = (x) => String(x.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '') === BASE;
    report.dropped_base_dupes = [...(cur.competitor_codes || []), ...(cur.oem_codes || [])].filter(isBase);
    const comp = (cur.competitor_codes || []).filter((x) => !isFs(x) && !isBase(x));
    if (!comp.some((x) => String(x.code).toUpperCase() === OLD)) comp.push({ code: OLD, manufacturer: 'FLEETGUARD' });
    report.removed_fs1280 = (cur.competitor_codes || []).length + 1 - comp.length >= 0 && (cur.competitor_codes || []).filter(isFs).length;
    const patch = {
      codigo_base: BASE, enrichment_data: enrichment, competitor_codes: comp,
      canonical_source_brand: 'DONALDSON', canonical_source_code: BASE, canonical_source_url: URL_DON, canonical_source_status: 'VERIFIED', canonical_verified_at: AT,
      oem_codes: (cur.oem_codes || []).filter((x) => !isBase(x)),
      canonical_evidence: { authority: 'DONALDSON_OFFICIAL_PRODUCT_PAGE', source_url: URL_DON, evidence_hash: sha({ sku: SKU, base: BASE, url: URL_DON }) },
    };
    const next = { ...cur, ...patch };
    report.gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
    report.policy = evaluateCodigoBase(next);
    if (!report.policy.valid) throw new Error('POLICY_REJECTED ' + JSON.stringify(report.policy));
    await db.query(`UPDATE public.elimfilters_catalog SET codigo_base=$2, enrichment_data=$3::jsonb, canonical_source_brand=$4, canonical_source_code=$5, canonical_source_url=$6,
      canonical_source_status=$7, canonical_verified_at=$8, canonical_evidence=$9::jsonb, competitor_codes=$10::jsonb, oem_codes=$11::jsonb WHERE sku=$1`,
    [SKU, BASE, JSON.stringify(enrichment), patch.canonical_source_brand, BASE, URL_DON, 'VERIFIED', AT, JSON.stringify(patch.canonical_evidence), JSON.stringify(comp), JSON.stringify(patch.oem_codes)]);
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE sku=$1 AND ld_catalog.norm_part(code) IN (ld_catalog.norm_part($2), ld_catalog.norm_part($3))`, [SKU, BASE, OLD])).rows;
    report.fs1280 = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part('FS1280')`)).rows;
    report.after = (await db.query('SELECT sku,codigo_base,canonical_source_brand,catalog_active FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
