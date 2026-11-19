'use strict';

/**
 * Creates EA13687 MACROCORE (HD round primary air element), codigo_base Donaldson P633687 (operator order 2026-11-18: create EA13687 (JAC 1063)).
 * SKU = EA1 + last four digits of P633687. Official data: Donaldson product page P633687 pasted by the operator (OD 230 mm, ID 122 mm, length 265 mm,
 * efficiency 99.9 ISO 5011, primary, round, cellulose), its OEM cross tab (data/ea13687_oem_20261118.txt, DONSSON, JAC) and equipment tab
 * (data/ea13687_applications_20261118.txt). No third-party alternates loaded. Image: none yet (file name must start with the SKU).
 * Dry-run by default (ROLLBACK). --execute commits. Row did not exist before: rollback = delete this SKU.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const SKU = 'EA13687';
const BASE = 'P633687';
const URL_FG = 'https://shop.donaldson.com/store/es-us/product/p633687/prod350007';
const AT = '2026-11-18T00:00:00.000Z';
const SRC_OEM = 'DONALDSON_OFFICIAL_PRODUCT_PAGE_P633687_CROSS_REFERENCE_OPERATOR_PASTED_20261118';
const SRC_LIST = 'NONE';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const data = (f) => fs.readFileSync(path.join(__dirname, 'data', f), 'utf8').split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#'));

function readCodes(file) {
  const out = [];
  for (const line of data(file)) {
    const i = line.indexOf(':');
    const brand = line.slice(0, i).trim().toUpperCase();
    for (const code of line.slice(i + 1).trim().split(/\s+/)) if (code) out.push({ brand, code });
  }
  return out;
}
function readApplications() {
  return data('ea13687_applications_20261118.txt').map((line) => {
    const [eq, engine, year] = line.split('|');
    return { type: 'EQUIPMENT', engine: (engine || '').trim().toUpperCase(), equipment: eq.replace(/\s*-\s*/, ' ').replace(/\s+/g, ' ').trim().toUpperCase(), equipment_options: (year || '').trim() };
  });
}

function buildRow(oem, competitor) {
  return {
    sku: SKU, codigo_base: BASE, catalog_active: true, duty: 'HEAVY_DUTY',
    filter_type: 'air', technology: 'MACROCORE™', sub_type: 'Primary Round', installation_type: 'Round',
    height_mm: 265, outer_diameter_mm: 230, inner_diameter_mm: 122, filter_media: 'GENUINE FILTER MEDIA', image_url: null,
    description: `ELIMFILTERS® ${SKU} MACROCORE™, round primary air element is designed to meet the rugged demands of equipment operating in the harshest environments. The MACROCORE™ offers unique features that provide significant benefits for longer service life and optimum performance when the job demands it.`,
    oem_codes: oem, competitor_codes: competitor, equipment_applications: [], vehicle_applications: [],
    alternative_products: [], brand_crossrefs: {}, alternatives: [],
    specs: {
      product_type: 'AIR_PRIMARY_ROUND', overall_length_mm: 277.7, outer_diameter_mm: 230, inner_diameter_mm: 122, efficiency_pct: 99.9, efficiency_test: 'ISO 5011', element_shape: 'Round', dimensions_source_url: URL_FG,
    },
    enrichment_data: {
      codigo_base_governance: {
        state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', verified_at: AT, evidence_url: URL_FG,
        policy_version: '2026-08-19-v3.1', required_authority: 'VERIFIED_DONALDSON',
        current_codigo_base: BASE, approved_codigo_base: BASE, approved_manufacturer: 'DONALDSON',
        approved_source_column: 'COMPETITOR_CODES',
        verification_method: 'DONALDSON_OFFICIAL_PRODUCT_PAGE_P633687_OPERATOR_PASTED',
        alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY',
        observed_primary_candidates: [], contamination_flags: [],
        oem_code_count: oem.length, competitor_code_count: competitor.length,
        primary_manufacturer_verified: true,
      },
    },
    canonical_source_brand: 'DONALDSON', canonical_source_code: BASE, canonical_source_url: URL_FG,
    canonical_source_status: 'VERIFIED', canonical_verified_at: AT,
    canonical_evidence: { authority: 'DONALDSON_OFFICIAL_PRODUCT_PAGE', source_url: URL_FG, evidence_hash: sha({ sku: SKU, base: BASE, url: URL_FG }) },
    duty_source_brand: 'DONALDSON', duty_source_url: URL_FG, duty_validation_status: 'VERIFIED', duty_verified_at: AT,
    duty_evidence: { duty: 'HEAVY_DUTY', authority: 'ELIMFILTERS_OPERATOR_RULING_2026-11-18', source_url: URL_FG },
  };
}

(async () => {
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU, codigo_base: BASE };
  try {
    await db.query('BEGIN');
    const clash = await db.query(`SELECT sku,codigo_base FROM public.elimfilters_catalog WHERE sku=$1 OR upper(regexp_replace(coalesce(codigo_base,''),'[^A-Z0-9]','','g'))=$2 FOR UPDATE`, [SKU, BASE]);
    if (clash.rowCount) throw new Error('ALREADY_EXISTS ' + JSON.stringify(clash.rows));

    const heldRows = (await db.query(`SELECT DISTINCT upper(regexp_replace(x->>'code','[^A-Za-z0-9]','','g')) code, c.sku FROM public.elimfilters_catalog c, jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb)||coalesce(c.competitor_codes,'[]'::jsonb)) x WHERE c.catalog_active`)).rows;
    const held = new Map(); for (const r of heldRows) { if (!held.has(r.code)) held.set(r.code, []); held.get(r.code).push(r.sku); }
    const have = new Set([norm(BASE)]); const skipped = [];
    const take = (list, mk) => {
      const add = [];
      for (const { brand, code } of list) {
        const k = norm(code);
        if (have.has(k)) continue;
        if (held.has(k)) { skipped.push(`${brand}:${code}=${held.get(k).join('/')}`); continue; }
        have.add(k); add.push(mk(brand, code));
      }
      return add;
    };
    const oem = take(readCodes('ea13687_oem_20261118.txt'), (brand, code) => ({ code, manufacturer: brand, classification: 'OEM', classification_source: SRC_OEM, source_url: URL_FG }));
    const comp = take(readCodes('ea13687_competitors_20261118.txt'), (brand, code) => ({ code, manufacturer: brand, classification: 'AFTERMARKET', classification_source: SRC_LIST, source_url: URL_FG }));
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

    const seen = new Set(); const apps = [];
    for (const e of readApplications()) { const k = norm(`${e.equipment}|${e.engine}|${e.equipment_options}`); if (seen.has(k)) continue; seen.add(k); apps.push(e); }
    await applyVerifiedApplications(db, { sku: SKU, equipment_applications: apps,
      evidence: { authority: 'DONALDSON_OFFICIAL_PRODUCT_PAGE', source_url: URL_FG, evidence_hash: sha({ sku: SKU, n: apps.length, URL_FG }), metadata: { method: 'official-donaldson-equipment-list-operator-pasted', equipment_count: apps.length } } });
    report.applications = apps.length;

    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE sku=$1 AND ld_catalog.norm_part(code) IN (ld_catalog.norm_part($2), ld_catalog.norm_part('DA2005'), ld_catalog.norm_part('025DA2005L'))`, [SKU, BASE])).rows;
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
