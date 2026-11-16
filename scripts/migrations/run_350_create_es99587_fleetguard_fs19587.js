'use strict';

/**
 * Creates ES99587 HYDROCORE (HD spin-on fuel/water separator), codigo_base FS19587 (Fleetguard).
 * Base authority: ELIMFILTERS operator ruling 2026-11-16 + Fleetguard official product page (FS19587: 149 mm, gasket 70 / 62.3 mm,
 * 1.83 l/min, 25 micron(c) 96 %, equipment Dongfeng CY4100 / CY4105 / CY4102). Same governance shape as run_336
 * (VERIFIED_FLEETGUARD_FALLBACK). Donaldson absence per operator ruling, not independently checked: Donaldson P550248 has thread
 * M16 x 1.5 and does not cross to FS19587, Baldwin BF9821 (M20 x 1.5) or Wix 34023.
 * Cross numbers: Baldwin BF9821 and Clarcor/Bengbu CX0710B4 (Parker official Baldwin page), HIFI SN25112 (direct match on the
 * fuelfilter-crossreference page), WIX 34023 (Petroil Venezuela and O'Reilly listings, retailer sources).
 * Fitment: the three Dongfeng engines of the Fleetguard page, plus JAC HFC1061 / CY4102BZLQ (Petroil Venezuela page, operator-directed).
 * Dry-run by default (ROLLBACK). --execute commits. No certification-ledger row is written here.
 */
require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');
const { applyVerifiedApplications, insertEvidence, dbJsonHash } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const SKU = 'ES99587';
const BASE = 'FS19587';
const URL_FG = 'https://www.fleetguard.com/es/product/fs19587/01t5x000008FBbaAAG';
const URL_BALDWIN = 'https://ph.parker.com/us/en/product/baldwin-spin-on-fuel-filters/bf9821';
const URL_HIFI = 'https://www.fuelfilter-crossreference.com/convert/FLEETGUARD/FS19587';
const URL_WIX = 'https://www.petroil.net/productos/filtros-separadores-de-agua/62999=34023-filtro-wix-combustible-separador-agua-camion-jac-hfc1061';
const URL_JAC = 'https://petroil.net/productos/aplicaciones/jac/trucks/80552=Camiones-JAC-Modelo-HFC1061-Motor-CY4102BZLQ-4L-3.9L-4.5-y-4.7-Ton';
const AT = '2026-11-16T00:00:00.000Z';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const DONGFENG = ['CY4100', 'CY4105', 'CY4102'].map((engine) => ({ type: 'TRUCK', engine, equipment: 'DONGFENG MOTOR' }));
const JAC = { type: 'TRUCK', engine: 'CY4102BZLQ 4L 3.9L', equipment: 'JAC HFC1061', equipment_options: '4.5 Y 4.7 TON; VENEZUELA' };
const EQUIPMENT = [...DONGFENG, JAC];
const alt = (code, manufacturer, source, source_url) => ({ code, manufacturer, classification: 'AFTERMARKET', classification_source: source, source_url });

function buildRow() {
  return {
    sku: SKU, codigo_base: BASE, catalog_active: true, duty: 'HEAVY_DUTY',
    filter_type: 'water', technology: 'HYDROCORE™', sub_type: 'Spin On',
    height_mm: 149.0, filter_media: 'GENUINE FILTER MEDIA',
    description: `ELIMFILTERS® ${SKU} HYDROCORE™ premium spin-on fuel/water separator uses GENUINE FILTER MEDIA to capture harmful particles, protect fuel injectors and support cleaner fuel system performance.`,
    oem_codes: [],
    competitor_codes: [
      alt('BF9821', 'BALDWIN', 'PARKER_BALDWIN_OFFICIAL_PAGE_BF9821_20261116', URL_BALDWIN),
      alt('CX0710B4', 'CLARCOR', 'PARKER_BALDWIN_OFFICIAL_PAGE_BF9821_20261116', URL_BALDWIN),
      alt('SN25112', 'HIFI FILTER', 'FUELFILTER_CROSSREFERENCE_DIRECT_MATCH_20261116', URL_HIFI),
      alt('34023', 'WIX', 'PETROIL_VENEZUELA_AND_OREILLY_LISTINGS_OPERATOR_DIRECTED_20261116', URL_WIX),
    ],
    equipment_applications: [], vehicle_applications: [], alternative_products: [], brand_crossrefs: {}, alternatives: [],
    specs: { product_type: 'FUEL_WATER_SEPARATOR_SPIN_ON', media_type: 'GENUINE FILTER MEDIA', gasket_outer_diameter_mm: 70.0, gasket_inner_diameter_mm: 62.3, rated_flow_l_min: 1.83, particle_efficiency: '96% at 25 micron(c)', emulsified_water_separation_pct: 90, min_hydrostatic_burst_kpa: 400, dimensions_source_url: URL_FG },
    enrichment_data: {
      codigo_base_governance: {
        state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', verified_at: AT, evidence_url: URL_FG,
        policy_version: '2026-08-19-v3.1', required_authority: 'VERIFIED_AFTERMARKET_FALLBACK',
        current_codigo_base: BASE, approved_codigo_base: BASE, approved_manufacturer: 'FLEETGUARD', approved_source_column: 'COMPETITOR_CODES',
        verification_method: 'ELIMFILTERS_OPERATOR_CONFIRMATION_PLUS_FLEETGUARD_OFFICIAL_PRODUCT_PAGE',
        alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY',
        donaldson_absence_note: 'ELIMFILTERS operator ruling 2026-11-16: FS19587 is the approved commercial base. Donaldson absence per operator ruling, not independently checked.',
        donaldson_absence_verified: true, observed_primary_candidates: [], contamination_flags: [],
        oem_code_count: 0, competitor_code_count: 4,
        primary_manufacturer_verified: false, fallback_manufacturer_verified: true, fallback_commercial_code_verified: true,
      },
    },
    canonical_source_brand: 'FLEETGUARD', canonical_source_code: BASE, canonical_source_url: URL_FG,
    canonical_source_status: 'VERIFIED', canonical_verified_at: AT,
    canonical_evidence: { authority: 'FLEETGUARD_OFFICIAL_PRODUCT_PAGE', source_url: URL_FG, evidence_hash: sha({ sku: SKU, base: BASE, url: URL_FG }) },
    duty_source_brand: 'FLEETGUARD', duty_source_url: URL_FG, duty_validation_status: 'VERIFIED', duty_verified_at: AT,
    duty_evidence: { duty: 'HEAVY_DUTY', authority: 'ELIMFILTERS_OPERATOR_RULING_2026-11-16', source_url: URL_FG },
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
    const clash = await db.query(`SELECT sku,codigo_base FROM public.elimfilters_catalog WHERE sku=$1 OR ${norm('codigo_base')}='FS19587' FOR UPDATE`, [SKU]);
    if (clash.rowCount) throw new Error('ALREADY_EXISTS ' + JSON.stringify(clash.rows));
    const ref = await db.query(`SELECT DISTINCT sku FROM public.elimfilters_catalog c WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(oem_codes,'[]'::jsonb)||coalesce(competitor_codes,'[]'::jsonb)) x WHERE ${norm("x->>'code'")} IN ('FS19587','BF9821','CX0710B4','SN25112','34023'))`);
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
      evidence: { authority: 'FLEETGUARD_OFFICIAL_PRODUCT_PAGE', source_url: URL_FG, evidence_hash: sha({ sku: SKU, EQUIPMENT, URL_FG }), metadata: { method: 'official-fleetguard-equipment-list', equipment_count: DONGFENG.length } } });
    const payloadHash = await dbJsonHash(db, EQUIPMENT);
    for (const kind of ['EQUIPMENT', 'ENGINE']) {
      await insertEvidence(db, { sku: SKU, kind, payloadHash, evidenceAuthority: 'DISTRIBUTOR_PAGE_OPERATOR_SUPPLIED', sourceUrl: URL_JAC,
        evidenceHash: sha({ sku: SKU, JAC, URL_JAC }), metadata: { method: 'distributor-page-operator-directed', distributor: 'Petroil Venezuela', model: 'JAC HFC1061', engine: 'CY4102BZLQ 4L 3.9L (as stated by the distributor)', fitment: 'distributor stated, not an official JAC sheet' } });
    }
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE sku=$1 OR ld_catalog.norm_part(code) IN (ld_catalog.norm_part('FS19587'), ld_catalog.norm_part('34023'), ld_catalog.norm_part('BF9821'))`, [SKU])).rows;
    report.integrity = (await db.query(`SELECT
      (SELECT count(*)::int FROM public.elimfilters_catalog WHERE ${norm('codigo_base')}='FS19587') base_sku_count,
      (SELECT count(*)::int FROM public.exact_part_conflicts WHERE $1=ANY(skus)) exact_conflicts,
      (SELECT count(*)::int FROM public.catalog_reference_classification_conflicts_v WHERE sku=$1) classification_conflicts,
      (SELECT count(*)::int FROM public.bad_crossref_quarantine WHERE source_sku=$1) quarantine_rows`, [SKU])).rows[0];
    const i = report.integrity;
    if (Number(i.base_sku_count) !== 1 || i.exact_conflicts || i.classification_conflicts || i.quarantine_rows) throw new Error('INTEGRITY_FAILED ' + JSON.stringify(i));
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
