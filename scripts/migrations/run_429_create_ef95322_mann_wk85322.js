'use strict';

/**
 * Creates EF95322 SYNTAPORE (HD fuel filter, MANN-FILTER WK 853/22, Mercedes-Benz 979 477 00 01; Petroil "F9053"), codigo_base = Mercedes-Benz OEM A9794770001.
 * SKU: operator order 2026-11-18 (EF95322 = EF9 + last four digits of WK 853/22). Base authority (Donaldson > Fleetguard > OEM): Donaldson official site 2026-11-18 has no result for
 * A9794770001 nor for WK853/22; Fleetguard absence is an OPERATOR ruling (not independently checked: its site cannot be queried by the agent) -> OEM base A9794770001 (VERIFIED_OEM_FALLBACK).
 * The gateway requires the SKU suffix to equal the last four digits of the base (0001 -> EF90001), so the row is inserted as EF90001 and renamed to the operator-ordered EF95322
 * in the same transaction (same operator-ruling exception as ES90120 / run_419). Official data: MANN-FILTER page WK 853/22 pasted by the operator (OD 80 mm, height 171 mm,
 * inlet 12.7 mm, outlet 9.9 mm; applications Mercedes-Benz 710 Plus / 712 E and Evobus 712, LO 812, LO 814 with OM 364 A/LA; OEM 979 477 00 01 / A 979 477 00 01).
 * The MANN page does not state the construction (spin-on or cartridge), so sub_type is left empty. Dry-run by default (ROLLBACK). --execute commits.
 * Row did not exist before: rollback = delete this SKU.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');

const APPLY = process.argv.includes('--execute');
const SKU = 'EF95322';
const BASE = 'A9794770001';
const INSERT_SKU = 'EF90001';
const URL_FG = 'https://www.mann-filter.com/br-pt/catalogo/resultados-da-pesquisa/produto.html/wk853/22_mann-filter.html';
const AT = '2026-11-17T00:00:00.000Z';
const SRC_OEM = 'MANN_OFFICIAL_PRODUCT_PAGE_WK853-22_ORIGINAL_NUMBERS_OPERATOR_PASTED_20261118';
const SRC_LIST = 'MANN_OFFICIAL_PRODUCT_PAGE_WK853-22_OPERATOR_PASTED_20261118';
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

function buildRow(oem, competitor) {
  return {
    sku: INSERT_SKU, codigo_base: BASE, catalog_active: true, duty: 'HEAVY_DUTY',
    filter_type: 'fuel', technology: 'SYNTAPORE™',
    height_mm: 171.0, outer_diameter_mm: 80.0, filter_media: 'GENUINE FILTER MEDIA', image_url: null,
    description: `ELIMFILTERS® ${SKU} SYNTAPORE™ fuel filter delivers superior performance using GENUINE FILTER MEDIA, removing harmful contaminants. ELIMFILTERS® fuel filters ensure optimal fuel system protection to meet or exceed OEM specifications.`,
    oem_codes: oem, competitor_codes: competitor, equipment_applications: [], vehicle_applications: [],
    alternative_products: [], brand_crossrefs: {}, alternatives: [],
    specs: {
      product_type: 'FUEL_FILTER', height_mm: 171.0, outer_diameter_mm: 80.0, inlet_mm: 12.7, outlet_mm: 9.9, dimensions_source_url: URL_FG,
    },
    enrichment_data: {
      codigo_base_governance: {
        state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', verified_at: AT, evidence_url: URL_FG,
        policy_version: '2026-08-19-v3.1', required_authority: 'VERIFIED_OEM_FALLBACK',
        current_codigo_base: BASE, approved_codigo_base: BASE, approved_manufacturer: 'MERCEDES-BENZ',
        approved_source_column: 'OEM_CODES',
        verification_method: 'ELIMFILTERS_OPERATOR_CONFIRMATION_PLUS_MANN_OFFICIAL_PRODUCT_PAGE_WK853-22_OEM_A9794770001',
        alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY',
        fleetguard_absence_verified: true, fleetguard_absence_note: 'ELIMFILTERS operator ruling 2026-11-18: Fleetguard does not make an equivalent (not independently checked; FS19532/FS19932 differ in size and thread).', donaldson_absence_verified: true, donaldson_absence_note: 'Donaldson official site, 2026-11-18: no result for WK853/22 nor for Mercedes-Benz A9794770001.', observed_primary_candidates: [], contamination_flags: [],
        oem_code_count: oem.length, competitor_code_count: competitor.length,
        primary_manufacturer_verified: false, fallback_manufacturer_verified: true, fallback_commercial_code_verified: true,
      },
    },
    canonical_source_brand: 'MERCEDES-BENZ', canonical_source_code: BASE, canonical_source_url: URL_FG,
    canonical_source_status: 'VERIFIED', canonical_verified_at: AT,
    canonical_evidence: { authority: 'MANN_OFFICIAL_PRODUCT_PAGE', source_url: URL_FG, evidence_hash: sha({ sku: SKU, base: BASE, url: URL_FG }) },
    duty_source_brand: 'MANN', duty_source_url: URL_FG, duty_validation_status: 'VERIFIED', duty_verified_at: AT,
    duty_evidence: { duty: 'HEAVY_DUTY', authority: 'ELIMFILTERS_OPERATOR_RULING_2026-11-17', source_url: URL_FG },
  };
}

(async () => {
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU, codigo_base: BASE };
  try {
    await db.query('BEGIN');
    const clash = await db.query(`SELECT sku,codigo_base FROM public.elimfilters_catalog WHERE sku IN ($1,$3) OR upper(regexp_replace(coalesce(codigo_base,''),'[^A-Z0-9]','','g'))=$2 FOR UPDATE`, [SKU, BASE, INSERT_SKU]);
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
    const oem = take(readCodes('ef95322_oem_20261118.txt'), (brand, code) => ({ code, manufacturer: brand, classification: 'OEM', classification_source: SRC_OEM, source_url: URL_FG }));
    const comp = take(readCodes('ef95322_competitors_20261118.txt'), (brand, code) => ({ code, manufacturer: brand, classification: 'AFTERMARKET', classification_source: SRC_LIST, source_url: URL_FG }));
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

    const ren = await db.query('UPDATE public.elimfilters_catalog SET sku=$1 WHERE sku=$2', [SKU, INSERT_SKU]);
    if (ren.rowCount !== 1) throw new Error('RENAME_FAILED');
    report.renamed_from = INSERT_SKU;
    const apps = [
      { type: 'TRUCK', engine: 'OM 364LA', equipment: 'MERCEDES-BENZ 710 PLUS', equipment_options: '01/1995 on' },
      { type: 'TRUCK', engine: 'OM 364 LA', equipment: 'MERCEDES-BENZ 712 E', equipment_options: '01/1995 on' },
      { type: 'TRUCK', engine: 'OM 364 A/LA', equipment: 'EVOBUS (MERCEDES-BENZ/SETRA) 712', equipment_options: '01/1998 on' },
      { type: 'TRUCK', engine: 'OM 364 A/LA', equipment: 'EVOBUS (MERCEDES-BENZ/SETRA) LO 812', equipment_options: '10/1990 on' },
      { type: 'TRUCK', engine: 'OM 364 A/LA', equipment: 'EVOBUS (MERCEDES-BENZ/SETRA) LO 814', equipment_options: '01/1998 on' },
    ];
    await applyVerifiedApplications(db, { sku: SKU, equipment_applications: apps,
      evidence: { authority: 'MANN_OFFICIAL_PRODUCT_PAGE', source_url: URL_FG, evidence_hash: sha({ sku: SKU, n: apps.length, URL_FG }), metadata: { method: 'official-mann-vehicle-list-operator-pasted', equipment_count: apps.length } } });
    report.applications = apps.length;


    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE sku=$1 AND ld_catalog.norm_part(code) IN (ld_catalog.norm_part($2), ld_catalog.norm_part('A9794770001'), ld_catalog.norm_part('WK85322'), ld_catalog.norm_part('9794770001'))`, [SKU, BASE])).rows;
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
