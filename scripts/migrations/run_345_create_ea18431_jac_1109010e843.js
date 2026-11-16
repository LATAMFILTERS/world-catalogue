'use strict';

/**
 * Creates EA18431 (HD air element, 257.5 x 220.4 x 139.23 mm), codigo_base = JAC OEM 1109010E843-1.
 * Cross numbers: WIX 47085 and WEB WCA-2326 (aftermarket, alternates only). Fitment: JAC HFC1061, engine CY4102BZLQ 4L 3.9L
 * turbo intercooler, 2008 (Petroil Venezuela page; the dimensions and the 2008 year come from the Procura Center listing the
 * operator supplied). The OEM number comes from the Distribuidora Miraflores listing (operator supplied) and the Mival Filters page.
 * Donaldson and Fleetguard do not make it (operator ruling 2026-11-15), so the base is a verified OEM fallback (SKU = EA1 + last four digits, 8431).
 * Dry-run by default (ROLLBACK). --execute commits. No certification-ledger row is written here.
 */
require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const SKU = 'EA18431';
const BASE = '1109010E843-1';
const URL_OEM = 'https://www.mivalfilters.com/filtro-de-aire-jac-1109010e843-1';
const URL_WEB = 'https://www.mivalfilters.com/filtro-de-aire-web-wca-2326';
const URL_APP = 'https://petroil.net/productos/aplicaciones/jac/trucks/80552=Camiones-JAC-Modelo-HFC1061-Motor-CY4102BZLQ-4L-3.9L-4.5-y-4.7-Ton';
const AT = '2026-11-15T00:00:00.000Z';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const EQUIPMENT = [{ type: 'TRUCK', engine: 'CY4102BZLQ 4L 3.9L TURBO INTERCOOLER', equipment: 'JAC HFC1061', equipment_options: '2008; 4.5 Y 4.7 TON; VENEZUELA' }];
const SRC = 'DISTRIBUIDORA_MIRAFLORES_AND_MIVAL_FILTERS_LISTINGS_20261115';

function buildRow() {
  return {
    sku: SKU, codigo_base: BASE, catalog_active: true, duty: 'HEAVY_DUTY',
    filter_type: 'air', technology: 'MACROCORE™', sub_type: 'Primary Round',
    height_mm: 257.5, outer_diameter_mm: 220.4, inner_diameter_mm: 139.23, filter_media: 'GENUINE FILTER MEDIA',
    description: `ELIMFILTERS® ${SKU} MACROCORE™ primary round air filter element. Pleated media with a metal support captures dust before it reaches the engine intake and protects the engine in demanding operating conditions.`,
    oem_codes: [], // the JAC OEM number is the codigo_base itself and must not repeat in the alternates
    competitor_codes: [
      { code: '47085', manufacturer: 'WIX', classification: 'AFTERMARKET', classification_source: SRC, source_url: URL_OEM },
      { code: 'WCA-2326', manufacturer: 'WEB', classification: 'AFTERMARKET', classification_source: SRC, source_url: URL_WEB },
    ],
    equipment_applications: [], vehicle_applications: [], alternative_products: [], brand_crossrefs: {}, alternatives: [],
    specs: { product_type: 'AIR_ELEMENT_PRIMARY_ROUND', media_type: 'GENUINE FILTER MEDIA' },
    enrichment_data: {
      codigo_base_governance: {
        state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', verified_at: AT, evidence_url: URL_OEM,
        policy_version: '2026-08-19-v3.1', required_authority: 'VERIFIED_OEM_FALLBACK',
        current_codigo_base: BASE, approved_codigo_base: BASE, approved_manufacturer: 'JAC', approved_source_column: 'OEM_CODES',
        verification_method: 'ELIMFILTERS_OPERATOR_CONFIRMATION_PLUS_RETAILER_LISTINGS',
        alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY',
        donaldson_absence_note: 'ELIMFILTERS operator ruling 2026-11-15: Donaldson does not make this element (not independently checked).',
        fleetguard_absence_note: 'ELIMFILTERS operator ruling 2026-11-15: Fleetguard does not make this element (not independently checked).',
        donaldson_absence_verified: true, fleetguard_absence_verified: true, observed_primary_candidates: [], contamination_flags: [],
        oem_code_count: 0, competitor_code_count: 2,
        primary_manufacturer_verified: false, fallback_manufacturer_verified: true, fallback_commercial_code_verified: true,
      },
    },
    canonical_source_brand: 'JAC', canonical_source_code: BASE, canonical_source_url: URL_OEM,
    canonical_source_status: 'VERIFIED', canonical_verified_at: AT,
    canonical_evidence: { authority: 'JAC_OEM_NUMBER_FROM_RETAILER_LISTINGS', source_url: URL_OEM, evidence_hash: sha({ sku: SKU, base: BASE, url: URL_OEM }) },
    duty_source_brand: 'JAC', duty_source_url: URL_OEM, duty_validation_status: 'VERIFIED', duty_verified_at: AT,
    duty_evidence: { duty: 'HEAVY_DUTY', authority: 'ELIMFILTERS_OPERATOR_RULING_2026-11-15', source_url: URL_OEM },
  };
}

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client(url
    ? { connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } }
    : { host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU, codigo_base: BASE };
  try {
    await db.query('BEGIN');
    const norm = (s) => `upper(regexp_replace(coalesce(${s},''),'[^A-Za-z0-9]','','g'))`;
    const clash = await db.query(`SELECT sku,codigo_base FROM public.elimfilters_catalog WHERE sku=$1 OR ${norm('codigo_base')}='1109010E8431' FOR UPDATE`, [SKU]);
    if (clash.rowCount) throw new Error('ALREADY_EXISTS ' + JSON.stringify(clash.rows));
    const ref = await db.query(`SELECT DISTINCT sku FROM public.elimfilters_catalog c WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(oem_codes,'[]'::jsonb)||coalesce(competitor_codes,'[]'::jsonb)) x WHERE ${norm("x->>'code'")} IN ('1109010E8431','47085','WCA2326'))`);
    if (ref.rowCount) throw new Error('REFERENCE_COLLISION ' + ref.rows.map((r) => r.sku).join(','));
    const row = buildRow();
    report.gateway = assertCanonicalWrite(row, { validateApplications: false });
    report.policy = evaluateCodigoBase(row);
    if (!report.policy.valid) throw new Error('POLICY_REJECTED ' + JSON.stringify(report.policy));
    const jsonCols = new Set(['oem_codes', 'competitor_codes', 'equipment_applications', 'vehicle_applications', 'alternative_products', 'brand_crossrefs', 'alternatives', 'specs', 'enrichment_data', 'canonical_evidence', 'duty_evidence']);
    const cols = Object.keys(row);
    report.inserted = (await db.query(`INSERT INTO public.elimfilters_catalog (${cols.map((c) => '"' + c + '"').join(',')}) VALUES (${cols.map((c, i) => '$' + (i + 1) + (jsonCols.has(c) ? '::jsonb' : '')).join(',')}) RETURNING id,sku,codigo_base,duty,catalog_active`,
      cols.map((c) => (jsonCols.has(c) ? JSON.stringify(row[c]) : row[c])))).rows[0];
    report.application = await applyVerifiedApplications(db, { sku: SKU, equipment_applications: EQUIPMENT,
      evidence: { authority: 'DISTRIBUTOR_PAGE_OPERATOR_SUPPLIED', source_url: URL_APP, evidence_hash: sha({ sku: SKU, EQUIPMENT, URL_APP }), metadata: { method: 'distributor-page-operator-directed', distributor: 'Petroil Venezuela; Procura Center (year, dimensions)', fitment: 'distributor stated, not an official JAC sheet' } } });
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE sku=$1 OR ld_catalog.norm_part(code) IN (ld_catalog.norm_part('1109010E843-1'), ld_catalog.norm_part('47085'))`, [SKU])).rows;
    report.integrity = (await db.query(`SELECT
      (SELECT count(*)::int FROM public.exact_part_conflicts WHERE $1=ANY(skus)) exact_conflicts,
      (SELECT count(*)::int FROM public.catalog_reference_classification_conflicts_v WHERE sku=$1) classification_conflicts,
      (SELECT count(*)::int FROM public.bad_crossref_quarantine WHERE source_sku=$1) quarantine_rows`, [SKU])).rows[0];
    const i = report.integrity;
    if (i.exact_conflicts || i.classification_conflicts || i.quarantine_rows) throw new Error('INTEGRITY_FAILED ' + JSON.stringify(i));
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
