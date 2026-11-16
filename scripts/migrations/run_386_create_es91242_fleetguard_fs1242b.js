'use strict';

/**
 * Creates ES91242 HYDROCORE (HD spin-on fuel/water separator with water bowl), codigo_base FS1242B (Fleetguard).
 * Base authority: ELIMFILTERS operator ruling 2026-11-16 (SKU ES91242, base FS1242B; supersedes the run_300 note that ES91242 is not created)
 * + Fleetguard official product page FS1242B (rendered 2026-11-16: thread 1-14 UNS-2B, largest OD 99.57 mm, height 230.81 mm, gasket OD 71.98 / ID 62.53 mm,
 * emulsified-water separation 90%, no standpipe; "Conjunto de FS1242 y tazon"; upgrade of FS1212; upgraded by FS1015B = ES91015).
 * Same governance shape as run_300 (VERIFIED_AFTERMARKET_FALLBACK). Donaldson P551000 (water separator spin-on twist&drain) is the reason for this SKU:
 * its natural ES91000 is held by another product. Codes/applications are left empty here: they are loaded through the governed paths afterwards.
 * Dry-run by default (ROLLBACK). --execute commits. Row did not exist before: rollback = delete this SKU.
 */
require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');

const APPLY = process.argv.includes('--execute');
const SKU = 'ES91242';
const BASE = 'FS1242B';
const URL_FG = 'https://www.fleetguard.com/es/product/fs1242b/01t5x000008FG9zAAG';
const AT = '2026-11-16T00:00:00.000Z';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

function buildRow() {
  return {
    sku: SKU, codigo_base: BASE, catalog_active: true, duty: 'HEAVY_DUTY',
    filter_type: 'water', technology: 'HYDROCORE™', sub_type: 'Spin On',
    thread_size: '1-14 UNS-2B', height_mm: 230.81, outer_diameter_mm: 99.57, gasket_od_mm: 71.98, gasket_id_mm: 62.53,
    filter_media: 'GENUINE FILTER MEDIA',
    description: `ELIMFILTERS® ${SKU} HYDROCORE™ premium spin-on fuel/water separator uses GENUINE FILTER MEDIA to capture harmful particles, protect fuel injectors and support cleaner fuel system performance.`,
    oem_codes: [], competitor_codes: [], equipment_applications: [], vehicle_applications: [],
    alternative_products: [], brand_crossrefs: {}, alternatives: [],
    specs: {
      product_type: 'FUEL_WATER_SEPARATOR_SPIN_ON', standpipe: false,
      fleetguard_upgrade_of: 'FS1212', fleetguard_upgraded_by: 'FS1015B', emulsified_water_separation_percent: 90,
      water_bowl: 'Fleetguard page comment: "Conjunto de FS1242 y tazon" (FS1242 and bowl assembly)',
      dimensions_source_url: URL_FG,
    },
    enrichment_data: {
      codigo_base_governance: {
        state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', verified_at: AT, evidence_url: URL_FG,
        policy_version: '2026-08-19-v3.1', required_authority: 'VERIFIED_AFTERMARKET_FALLBACK',
        current_codigo_base: BASE, approved_codigo_base: BASE, approved_manufacturer: 'FLEETGUARD',
        approved_source_column: 'COMPETITOR_CODES',
        verification_method: 'ELIMFILTERS_OPERATOR_CONFIRMATION_PLUS_FLEETGUARD_OFFICIAL_PRODUCT_PAGE_FS1242B',
        alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY',
        donaldson_absence_note: 'ELIMFILTERS operator ruling 2026-11-16: FS1242B is the approved commercial base (natural ES91000 for Donaldson P551000 is held by another product). Donaldson absence per operator ruling, not independently checked.',
        donaldson_absence_verified: true, observed_primary_candidates: [], contamination_flags: [],
        oem_code_count: 0, competitor_code_count: 0,
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
  const db = new Client(url ? { connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } } : { host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU, codigo_base: BASE };
  try {
    await db.query('BEGIN');
    const clash = await db.query(`SELECT sku,codigo_base FROM public.elimfilters_catalog
      WHERE sku=$1 OR upper(regexp_replace(coalesce(codigo_base,''),'[^A-Z0-9]','','g'))=$2 FOR UPDATE`, [SKU, BASE]);
    if (clash.rowCount) throw new Error('ALREADY_EXISTS ' + JSON.stringify(clash.rows));
    const row = buildRow();
    report.gateway = assertCanonicalWrite(row, { validateApplications: false });
    report.policy = evaluateCodigoBase(row);
    if (!report.policy.valid) throw new Error('POLICY_REJECTED ' + JSON.stringify(report.policy));
    const jsonCols = new Set(['oem_codes', 'competitor_codes', 'equipment_applications', 'vehicle_applications', 'alternative_products', 'brand_crossrefs', 'alternatives', 'specs', 'enrichment_data', 'canonical_evidence', 'duty_evidence']);
    const cols = Object.keys(row);
    const ins = await db.query(
      `INSERT INTO public.elimfilters_catalog (${cols.map((c) => '"' + c + '"').join(',')})
       VALUES (${cols.map((c, i) => '$' + (i + 1) + (jsonCols.has(c) ? '::jsonb' : '')).join(',')}) RETURNING id,sku,codigo_base,duty,catalog_active`,
      cols.map((c) => (jsonCols.has(c) ? JSON.stringify(row[c]) : row[c])));
    report.inserted = ins.rows[0];
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1) OR sku=$2`, [BASE, SKU])).rows;
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
