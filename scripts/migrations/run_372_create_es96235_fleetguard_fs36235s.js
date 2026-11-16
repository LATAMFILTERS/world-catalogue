'use strict';

/**
 * Creates ES96235 HYDROCORE (HD spin-on fuel/water separator), codigo_base FS36235S (Fleetguard).
 * Base authority: ELIMFILTERS operator instruction 2026-11-16 (SKU ES96235, image ES9/ES96235.png) + Fleetguard official product page
 * (FS36235S: 286.6 mm, largest OD 111 mm, gasket 102.2 / 92.6 mm, 7.6 l/min, burst 345 kPa; official OEM cross Weichai 612640080444 /
 * 1000524630 / 1000964807 and Yuchai D0030502A / G58001105240C; equipment Yuchai YC6G240-30). Same governance shape as run_350
 * (VERIFIED_FLEETGUARD_FALLBACK); Donaldson absence per operator ruling, not independently checked.
 * From the Petroil Venezuela Sinotruk HOWO A7 page (operator-directed): Sinotruk VG1540080211 and Yuchai G58001105240 (brands stated there)
 * and the HOWO A7 TR A7 4X6 380 Euro IV fitment. BF9880, R010053 and FS26389 are not loaded: Petroil states no brand for them.
 * Dry-run by default (ROLLBACK). --execute commits. No certification-ledger row is written here.
 */
require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');
const { applyVerifiedApplications, insertEvidence, dbJsonHash } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const SKU = 'ES96235';
const BASE = 'FS36235S';
const URL_FG = 'https://www.fleetguard.com/product/FS36235S';
const URL_PETROIL = 'https://petroil.net/productos/aplicaciones/sinotruck/trucks/80588=Camiones-SInotruck-HOWO-A7-Motor-TR-A7-4X6-380-EURO-IV';
const IMAGE = 'https://cdn.elimfilters.com/ES9/ES96235.png';
const AT = '2026-11-16T00:00:00.000Z';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const YUCHAI = { type: 'TRUCK', engine: 'YC6G240-30', equipment: 'YUCHAI ENG MACHINERY' };
const HOWO = { type: 'TRUCK', engine: 'TR A7 4X6 380 EURO IV', equipment: 'SINOTRUK HOWO A7', equipment_options: 'VENEZUELA' };
const EQUIPMENT = [YUCHAI, HOWO];
const SRC_FG = 'FLEETGUARD_OFFICIAL_PRODUCT_PAGE_FS36235S_20261116';
const SRC_PET = 'PETROIL_VENEZUELA_HOWO_A7_PAGE_OPERATOR_DIRECTED_20261116';
const oem = (code, manufacturer, src, url) => ({ code, manufacturer, classification: 'OEM', classification_source: src, source_url: url });

function buildRow() {
  return {
    sku: SKU, codigo_base: BASE, catalog_active: true, duty: 'HEAVY_DUTY',
    filter_type: 'water', technology: 'HYDROCORE™', sub_type: 'Spin On',
    height_mm: 286.6, outer_diameter_mm: 111.0, filter_media: 'GENUINE FILTER MEDIA', image_url: IMAGE,
    description: `ELIMFILTERS® ${SKU} HYDROCORE™ premium spin-on fuel/water separator uses GENUINE FILTER MEDIA to capture harmful particles, protect fuel injectors and support cleaner fuel system performance.`,
    oem_codes: [
      oem('612640080444', 'WEICHAI', SRC_FG, URL_FG), oem('1000524630', 'WEICHAI', SRC_FG, URL_FG), oem('1000964807', 'WEICHAI', SRC_FG, URL_FG),
      oem('D0030502A', 'YUCHAI ENG MACHINERY', SRC_FG, URL_FG), oem('G58001105240C', 'YUCHAI ENG MACHINERY', SRC_FG, URL_FG),
      oem('VG1540080211', 'SINOTRUK', SRC_PET, URL_PETROIL), oem('G58001105240', 'YUCHAI ENG MACHINERY', SRC_PET, URL_PETROIL),
    ],
    competitor_codes: [],
    equipment_applications: [], vehicle_applications: [], alternative_products: [], brand_crossrefs: {}, alternatives: [],
    specs: { product_type: 'FUEL_WATER_SEPARATOR_SPIN_ON', media_type: 'GENUINE FILTER MEDIA', gasket_outer_diameter_mm: 102.2, gasket_inner_diameter_mm: 92.6, rated_flow_l_min: 7.6, min_hydrostatic_burst_kpa: 345, thread_size_fleetguard: '25.83-0.9605 UNF 2B', includes: 'WIF', dimensions_source_url: URL_FG },
    enrichment_data: {
      codigo_base_governance: {
        state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', verified_at: AT, evidence_url: URL_FG,
        policy_version: '2026-08-19-v3.1', required_authority: 'VERIFIED_AFTERMARKET_FALLBACK',
        current_codigo_base: BASE, approved_codigo_base: BASE, approved_manufacturer: 'FLEETGUARD', approved_source_column: 'COMPETITOR_CODES',
        verification_method: 'ELIMFILTERS_OPERATOR_CONFIRMATION_PLUS_FLEETGUARD_OFFICIAL_PRODUCT_PAGE',
        alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY',
        donaldson_absence_note: 'ELIMFILTERS operator ruling 2026-11-16: FS36235S is the approved commercial base. Donaldson absence per operator ruling, not independently checked.',
        donaldson_absence_verified: true, observed_primary_candidates: [], contamination_flags: [],
        oem_code_count: 7, competitor_code_count: 0,
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
    const clash = await db.query(`SELECT sku,codigo_base FROM public.elimfilters_catalog WHERE sku=$1 OR ${norm('codigo_base')}='FS36235S' FOR UPDATE`, [SKU]);
    if (clash.rowCount) throw new Error('ALREADY_EXISTS ' + JSON.stringify(clash.rows));
    const ref = await db.query(`SELECT DISTINCT sku FROM public.elimfilters_catalog c WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(oem_codes,'[]'::jsonb)||coalesce(competitor_codes,'[]'::jsonb)) x WHERE ${norm("x->>'code'")} IN ('FS36235S','612640080444','1000524630','1000964807','D0030502A','G58001105240C','VG1540080211','G58001105240'))`);
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
    const payloadHash = await dbJsonHash(db, EQUIPMENT);
    for (const kind of ['EQUIPMENT', 'ENGINE']) {
      await insertEvidence(db, { sku: SKU, kind, payloadHash, evidenceAuthority: 'DISTRIBUTOR_PAGE_OPERATOR_SUPPLIED', sourceUrl: URL_PETROIL,
        evidenceHash: sha({ sku: SKU, HOWO, URL_PETROIL }), metadata: { method: 'distributor-page-operator-directed', distributor: 'Petroil Venezuela', model: 'SINOTRUK HOWO A7 TR A7 4X6 380 EURO IV', fitment: 'distributor stated, not an official Sinotruk sheet' } });
    }
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE sku=$1 AND ld_catalog.norm_part(code) IN (ld_catalog.norm_part('FS36235S'), ld_catalog.norm_part('612640080444'), ld_catalog.norm_part('VG1540080211'))`, [SKU])).rows;
    report.integrity = (await db.query(`SELECT
      (SELECT count(*)::int FROM public.elimfilters_catalog WHERE ${norm('codigo_base')}='FS36235S') base_sku_count,
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
