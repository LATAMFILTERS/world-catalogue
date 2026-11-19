'use strict';

/**
 * Creates EF95725 SYNTAPORE (HD fuel filter cartridge), codigo_base Fleetguard FF5725 (operator ruling 2026-11-19: replaces the proposed ES92414; "asi seguimos con las politicas").
 * SKU = EF9 + last four digits of FF5725. Base authority: Donaldson shop 2026-11-19 has no result for P502414 nor FF5725, and the operator rules Donaldson does not make it
 * -> Fleetguard base (VERIFIED_AFTERMARKET_FALLBACK, same precedent as EF95935). Official data: Fleetguard product page FF5725 (110.50 x 104.50 mm, Hino J05C).
 * Operator-supplied: inner diameter 29 mm, 4 micron, OEM/cross codes and application list. Not Donaldson P551310 (another separator). Image: EF9/EF95725.png.
 * Dry-run by default (ROLLBACK). --execute commits. Row did not exist before: rollback = delete this SKU.
 */
require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const SKU = 'EF95725';
const BASE = 'FF5725';
const URL_FG = 'https://www.fleetguard.com/es/product/ff5725/01t5x000008FBvIAAW';
const AT = '2026-11-19T00:00:00.000Z';
const SRC = 'OPERATOR_SUPPLIED_EF95725_ORDER_20261119';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

const OEM = [['TOYOTA', '23304-78110'], ['HINO', '23304-78110'], ['HINO', '23401-7811L']];
const COMP = [['SAKURA', 'F-1110'], ['WESFIL', 'WCF9'], ['RYCO', 'R2643'], ['RYCO', 'R2643P'], ['BLUE-PRINT', 'ADT32387']];
const APPS = [
  ['TOYOTA 343', 'TOYOTA N04C', '2003-2007'], ['TOYOTA 387', 'TOYOTA N04C', '2003-2007'],
  ['HINO DUTRO XZU404', 'HINO S05E 4.6L', ''], ['HINO DUTRO XZU414', 'HINO S05E 4.6L', ''], ['HINO DUTRO XZU424', 'HINO S05E 4.6L', ''], ['HINO DUTRO XZU434', 'HINO S05E 4.6L', ''],
  ['TOYOTA DYNA 400', '- DYNA 400', ''], ['HINO DUTRO XZU300', 'HINO J05C', ''], ['HINO RB8', 'HINO S05C-TB', ''],
];

function buildRow(oem, comp) {
  return {
    sku: SKU, codigo_base: BASE, catalog_active: true, duty: 'HEAVY_DUTY',
    filter_type: 'fuel', technology: 'SYNTAPORE™', sub_type: 'Cartridge', installation_type: 'Cartridge',
    height_mm: 110.5, outer_diameter_mm: 104.5, inner_diameter_mm: 29, micron_rating: '4', nominal_efficiency: '4 micron',
    filter_media: 'GENUINE FILTER MEDIA', image_url: 'https://cdn.elimfilters.com/EF9/EF95725.png',
    description: `ELIMFILTERS® ${SKU} SYNTAPORE™ fuel filter cartridge delivers superior performance using GENUINE FILTER MEDIA, removing harmful contaminants. ELIMFILTERS® fuel filters ensure optimal fuel system protection to meet or exceed OEM specifications.`,
    oem_codes: oem, competitor_codes: comp, equipment_applications: [], vehicle_applications: [], alternative_products: [], brand_crossrefs: {}, alternatives: [],
    specs: { product_type: 'FUEL_FILTER_CARTRIDGE', overall_length_mm: 110.5, outer_diameter_mm: 104.5, inner_diameter_mm: 29, micron: 4, element_type: 'Cartridge', dimensions_source_url: URL_FG },
    enrichment_data: {
      codigo_base_governance: {
        state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', verified_at: AT, evidence_url: URL_FG,
        policy_version: '2026-08-19-v3.1', required_authority: 'VERIFIED_AFTERMARKET_FALLBACK',
        current_codigo_base: BASE, approved_codigo_base: BASE, approved_manufacturer: 'FLEETGUARD', approved_source_column: 'COMPETITOR_CODES',
        verification_method: 'ELIMFILTERS_OPERATOR_RULING_PLUS_FLEETGUARD_OFFICIAL_PRODUCT_PAGE_FF5725',
        alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY',
        donaldson_absence_verified: true, donaldson_absence_note: 'Operator ruling 2026-11-19; Donaldson shop (es-us/en-us) returned no result for P502414 nor FF5725 on 2026-11-19.',
        observed_primary_candidates: [], contamination_flags: [], oem_code_count: oem.length, competitor_code_count: comp.length,
        primary_manufacturer_verified: false, fallback_manufacturer_verified: true, fallback_commercial_code_verified: true,
      },
    },
    canonical_source_brand: 'FLEETGUARD', canonical_source_code: BASE, canonical_source_url: URL_FG,
    canonical_source_status: 'VERIFIED', canonical_verified_at: AT,
    canonical_evidence: { authority: 'FLEETGUARD_OFFICIAL_PRODUCT_PAGE', source_url: URL_FG, evidence_hash: sha({ sku: SKU, base: BASE, url: URL_FG }) },
    duty_source_brand: 'FLEETGUARD', duty_source_url: URL_FG, duty_validation_status: 'VERIFIED', duty_verified_at: AT,
    duty_evidence: { duty: 'HEAVY_DUTY', authority: 'ELIMFILTERS_OPERATOR_RULING_2026-11-19', source_url: URL_FG },
  };
}

(async () => {
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU, codigo_base: BASE };
  try {
    await db.query('BEGIN');
    const clash = await db.query(`SELECT sku,codigo_base FROM public.elimfilters_catalog WHERE sku=$1 OR upper(regexp_replace(coalesce(codigo_base,''),'[^A-Z0-9]','','g'))=$2 FOR UPDATE`, [SKU, BASE]);
    if (clash.rowCount) throw new Error('ALREADY_EXISTS ' + JSON.stringify(clash.rows));
    const held = new Map();
    for (const r of (await db.query(`SELECT DISTINCT upper(regexp_replace(x->>'code','[^A-Za-z0-9]','','g')) code, c.sku FROM public.elimfilters_catalog c, jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb)||coalesce(c.competitor_codes,'[]'::jsonb)) x WHERE c.catalog_active`)).rows) { if (!held.has(r.code)) held.set(r.code, []); held.get(r.code).push(r.sku); }
    const have = new Set([norm(BASE)]); const skipped = [];
    const take = (list, mk) => list.reduce((out, [brand, code]) => {
      const k = norm(code);
      if (have.has(k)) return out;
      if (held.has(k)) { skipped.push(`${brand}:${code}=${held.get(k).join('/')}`); return out; }
      have.add(k); out.push(mk(brand, code)); return out;
    }, []);
    const oem = take(OEM, (brand, code) => ({ code, manufacturer: brand, classification: 'OEM', classification_source: SRC, source_url: URL_FG }));
    const comp = take(COMP, (brand, code) => ({ code, manufacturer: brand, classification: 'AFTERMARKET', classification_source: SRC, source_url: URL_FG }));
    report.codes = { oem: oem.map((x) => `${x.manufacturer}:${x.code}`), competitor: comp.map((x) => `${x.manufacturer}:${x.code}`), held_elsewhere_not_loaded: skipped };

    const row = buildRow(oem, comp);
    report.gateway = assertCanonicalWrite(row, { validateApplications: false });
    report.policy = evaluateCodigoBase(row);
    if (!report.policy.valid) throw new Error('POLICY_REJECTED ' + JSON.stringify(report.policy));
    const jsonCols = new Set(['oem_codes', 'competitor_codes', 'equipment_applications', 'vehicle_applications', 'alternative_products', 'brand_crossrefs', 'alternatives', 'specs', 'enrichment_data', 'canonical_evidence', 'duty_evidence']);
    const cols = Object.keys(row);
    report.inserted = (await db.query(
      `INSERT INTO public.elimfilters_catalog (${cols.map((c) => '"' + c + '"').join(',')})
       VALUES (${cols.map((c, i) => '$' + (i + 1) + (jsonCols.has(c) ? '::jsonb' : '')).join(',')}) RETURNING id,sku,codigo_base,duty,catalog_active`,
      cols.map((c) => (jsonCols.has(c) ? JSON.stringify(row[c]) : row[c])))).rows[0];

    const apps = APPS.map(([equipment, engine, year]) => ({ type: 'TRUCK', engine, equipment, ...(year ? { equipment_options: year } : {}) }));
    await applyVerifiedApplications(db, { sku: SKU, equipment_applications: apps,
      evidence: { authority: 'OPERATOR_SUPPLIED_APPLICATION_LIST', source_url: URL_FG, evidence_hash: sha({ sku: SKU, apps }), metadata: { method: 'operator-supplied-list-20261119', note: 'The Fleetguard FF5725 page lists Hino XZU300 Dutro J05C 2000-2008, Toyota Dyna 300 2004 and International 8600 C13 2008-2009; those entries are not loaded here.', equipment_count: apps.length } } });
    report.applications = apps.length;

    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE sku=$1 AND ld_catalog.norm_part(code) IN (ld_catalog.norm_part($2), ld_catalog.norm_part('23401-7811L'))`, [SKU, BASE])).rows;
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
