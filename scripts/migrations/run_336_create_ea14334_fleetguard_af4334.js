'use strict';

/**
 * Creates EA14334 MACROCORE (HD primary radial-seal air element), codigo_base AF4334.
 * Base authority: ELIMFILTERS operator ruling 2026-11-15 + Fleetguard official product page (AF4334 Magnum RS:
 * 228 mm long, 154 mm OD, equipment Foton BJ1041 / ISF 2.8, official OEM cross Foton K1522).
 * Same governance shape as run_300 (VERIFIED_AFTERMARKET_FALLBACK, Fleetguard base). Donaldson absence per operator
 * ruling, not independently checked (no Donaldson-based air SKU of 228 x 154 mm exists in the catalogue).
 * The JAC 1109010D207 is NOT linked: neither the Fleetguard page nor the HIFI SA18270 list names it.
 * Dry-run by default (ROLLBACK). --execute commits. No certification-ledger row is written here.
 */
require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const SKU = 'EA14334';
const BASE = 'AF4334';
const URL_FG = 'https://www.fleetguard.com/product/af4334/01t5x000008FCl0AAG';
const AT = '2026-11-15T00:00:00.000Z';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const EQUIPMENT = [{ type: 'TRUCK', engine: 'CUMMINS ISF 2.8', equipment: 'FOTON BJ1041' }];

function buildRow() {
  return {
    sku: SKU, codigo_base: BASE, catalog_active: true, duty: 'HEAVY_DUTY',
    filter_type: 'air', technology: 'MACROCORE™', sub_type: 'Primary Radial Seal',
    height_mm: 228.0, outer_diameter_mm: 154.0, filter_media: 'GENUINE FILTER MEDIA',
    image_url: `https://cdn.elimfilters.com/EA1/${SKU}.png`,
    description: `ELIMFILTERS® ${SKU} MACROCORE™ primary radial-seal air filter element. Pleated cellulose media with a metal outer support captures dust before it reaches the engine intake and protects the engine in demanding operating conditions.`,
    oem_codes: [{ code: 'K1522', manufacturer: 'FOTON', classification: 'OEM', classification_source: 'FLEETGUARD_OFFICIAL_OEM_CROSS_REFERENCE_20261115', source_url: URL_FG }],
    competitor_codes: [], equipment_applications: [], vehicle_applications: [],
    alternative_products: [], brand_crossrefs: {}, alternatives: [],
    specs: { product_type: 'AIR_ELEMENT_PRIMARY_RADIAL_SEAL', rated_flow_m3_min: 1.98, media_type: 'Cellulose', dimensions_source_url: URL_FG },
    enrichment_data: {
      codigo_base_governance: {
        state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', verified_at: AT, evidence_url: URL_FG,
        policy_version: '2026-08-19-v3.1', required_authority: 'VERIFIED_AFTERMARKET_FALLBACK',
        current_codigo_base: BASE, approved_codigo_base: BASE, approved_manufacturer: 'FLEETGUARD', approved_source_column: 'COMPETITOR_CODES',
        verification_method: 'ELIMFILTERS_OPERATOR_CONFIRMATION_PLUS_FLEETGUARD_OFFICIAL_PRODUCT_PAGE',
        alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY',
        donaldson_absence_note: 'ELIMFILTERS operator ruling 2026-11-15: AF4334 is the approved commercial base. Donaldson absence per operator ruling, not independently checked.',
        donaldson_absence_verified: true, observed_primary_candidates: [], contamination_flags: [],
        oem_code_count: 1, competitor_code_count: 0,
        primary_manufacturer_verified: false, fallback_manufacturer_verified: true, fallback_commercial_code_verified: true,
      },
    },
    canonical_source_brand: 'FLEETGUARD', canonical_source_code: BASE, canonical_source_url: URL_FG,
    canonical_source_status: 'VERIFIED', canonical_verified_at: AT,
    canonical_evidence: { authority: 'FLEETGUARD_OFFICIAL_PRODUCT_PAGE', source_url: URL_FG, evidence_hash: sha({ sku: SKU, base: BASE, url: URL_FG }) },
    duty_source_brand: 'FLEETGUARD', duty_source_url: URL_FG, duty_validation_status: 'VERIFIED', duty_verified_at: AT,
    duty_evidence: { duty: 'HEAVY_DUTY', authority: 'ELIMFILTERS_OPERATOR_RULING_2026-11-15', source_url: URL_FG },
  };
}

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client({ connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU, codigo_base: BASE };
  try {
    await db.query('BEGIN');
    const clash = await db.query(`SELECT sku,codigo_base FROM public.elimfilters_catalog WHERE sku=$1 OR upper(regexp_replace(coalesce(codigo_base,''),'[^A-Z0-9]','','g'))=$2 FOR UPDATE`, [SKU, BASE]);
    if (clash.rowCount) throw new Error('ALREADY_EXISTS ' + JSON.stringify(clash.rows));
    const ref = await db.query(`SELECT DISTINCT sku FROM public.elimfilters_catalog c WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(oem_codes,'[]'::jsonb)||coalesce(competitor_codes,'[]'::jsonb)) x WHERE upper(regexp_replace(coalesce(x->>'code',''),'[^A-Z0-9]','','g')) IN ('K1522','AF4334'))`);
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
      evidence: { authority: 'FLEETGUARD_OFFICIAL_PRODUCT_PAGE', source_url: URL_FG, evidence_hash: sha({ sku: SKU, EQUIPMENT, URL_FG }), metadata: { method: 'official-fleetguard-equipment-list', equipment_count: 1 } } });
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1) OR ld_catalog.norm_part(code)=ld_catalog.norm_part('K1522') OR sku=$2`, [BASE, SKU])).rows;
    report.integrity = (await db.query(`SELECT
      (SELECT count(*)::int FROM public.elimfilters_catalog WHERE upper(regexp_replace(coalesce(codigo_base,''),'[^A-Z0-9]','','g'))=$2) base_sku_count,
      (SELECT count(*)::int FROM public.exact_part_conflicts WHERE $1=ANY(skus)) exact_conflicts,
      (SELECT count(*)::int FROM public.catalog_reference_classification_conflicts_v WHERE sku=$1) classification_conflicts,
      (SELECT count(*)::int FROM public.bad_crossref_quarantine WHERE source_sku=$1) quarantine_rows`, [SKU, BASE])).rows[0];
    const i = report.integrity;
    if (Number(i.base_sku_count) !== 1 || i.exact_conflicts || i.classification_conflicts || i.quarantine_rows) throw new Error('INTEGRITY_FAILED ' + JSON.stringify(i));
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
