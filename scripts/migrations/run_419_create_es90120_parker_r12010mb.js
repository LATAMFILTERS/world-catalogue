'use strict';

/**
 * Creates ES90120 HYDROCORE (HD spin-on fuel/water separator, Parker Racor R-120-10MB-AQII), codigo_base = Mercedes-Benz OEM A9584770115.
 * SKU: operator order 2026-11-18 (ES90120: "COMERCIALMENTE DEBEMOS CREARLO ASI, EL CLIENTE LO RECONOCE MAS ASI"; "FS120MB" is a Petroil GFC code, the original is Parker R-120-10MB-AQII).
 * Base authority (Donaldson > Fleetguard > OEM): Donaldson official site 2026-11-18 has no result for R120-10MB nor A9794770015; Fleetguard absence is an OPERATOR ruling
 * (not independently checked: the Fleetguard site cannot be queried by the agent; its FS19532/FS19932 differ in size and thread) -> OEM base A9584770115 (VERIFIED_OEM_FALLBACK).
 * The gateway requires the SKU suffix to equal the last four digits of the base (0115 -> ES90115), so the row is inserted as ES90115 and renamed to the operator-ordered
 * ES90120 in the same transaction (same operator-ruling exception as ES91856 -> ES90090, run_413). No derived rows exist yet, so the rename touches only the catalogue row.
 * Official data: Parker product page R-120-10MB-AQII pasted by the operator (10 micron, length 182 mm, OD 111.5 mm, thread 1"-12 UNF-2B, Mercedes Benz / Marcopolo,
 * OEM A9794770015KZ / A9584770115; related parts KR-5025 base, KR-27004CS bowl). No equipment models are listed, so no applications are loaded.
 * Alternates: third-party list; codes held by another SKU (WK10604 and A9794770015 sit on the Light Duty EF30604) are reported, never moved.
 * Dry-run by default (ROLLBACK). --execute commits. Row did not exist before: rollback = delete this SKU.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');

const APPLY = process.argv.includes('--execute');
const SKU = 'ES90120';
const BASE = 'A9584770115';
const INSERT_SKU = 'ES90115';
const URL_FG = 'https://ph.parker.com/br/es/product/racor-spin-on-fuel-filter-br/r-120-10mb-aqii';
const AT = '2026-11-17T00:00:00.000Z';
const SRC_OEM = 'PARKER_OFFICIAL_PRODUCT_PAGE_R-120-10MB-AQII_OEM_TAB_OPERATOR_PASTED_20261117';
const SRC_LIST = 'THIRD_PARTY_R-120-10MB-AQII_REPLACEMENT_LIST_OPERATOR_PASTED_20261118';
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
    filter_type: 'separator', technology: 'HYDROCORE™', sub_type: 'Spin On', installation_type: 'Spin-On', thread_size: '1-12 UNF', micron_rating: 10,
    height_mm: 182.0, outer_diameter_mm: 111.5, filter_media: 'GENUINE FILTER MEDIA', image_url: null,
    description: `ELIMFILTERS® ${SKU} HYDROCORE™ premium spin-on fuel/water separator uses GENUINE FILTER MEDIA to capture harmful particles, protect fuel injectors and support cleaner fuel system performance.`,
    oem_codes: oem, competitor_codes: competitor, equipment_applications: [], vehicle_applications: [],
    alternative_products: [], brand_crossrefs: {}, alternatives: [],
    specs: {
      product_type: 'FUEL_WATER_SEPARATOR_SPIN_ON', overall_length_mm: 182.0, outer_diameter_mm: 111.5, thread: '1"-12 UNF-2B', micron: 10, related_parts: 'Base KR-5025; bowl KR-27004CS', dimensions_source_url: URL_FG,
    },
    enrichment_data: {
      codigo_base_governance: {
        state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', verified_at: AT, evidence_url: URL_FG,
        policy_version: '2026-08-19-v3.1', required_authority: 'VERIFIED_OEM_FALLBACK',
        current_codigo_base: BASE, approved_codigo_base: BASE, approved_manufacturer: 'MERCEDES-BENZ',
        approved_source_column: 'OEM_CODES',
        verification_method: 'ELIMFILTERS_OPERATOR_CONFIRMATION_PLUS_PARKER_OFFICIAL_PRODUCT_PAGE_R-120-10MB-AQII_OEM_A9584770115',
        alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY',
        fleetguard_absence_verified: true, fleetguard_absence_note: 'ELIMFILTERS operator ruling 2026-11-18: Fleetguard does not make an equivalent (not independently checked; FS19532/FS19932 differ in size and thread).', donaldson_absence_verified: true, donaldson_absence_note: 'Donaldson official site, 2026-11-18: no result for R120-10MB nor for Mercedes-Benz A9794770015.', observed_primary_candidates: [], contamination_flags: [],
        oem_code_count: oem.length, competitor_code_count: competitor.length,
        primary_manufacturer_verified: false, fallback_manufacturer_verified: true, fallback_commercial_code_verified: true,
      },
    },
    canonical_source_brand: 'MERCEDES-BENZ', canonical_source_code: BASE, canonical_source_url: URL_FG,
    canonical_source_status: 'VERIFIED', canonical_verified_at: AT,
    canonical_evidence: { authority: 'PARKER_OFFICIAL_PRODUCT_PAGE', source_url: URL_FG, evidence_hash: sha({ sku: SKU, base: BASE, url: URL_FG }) },
    duty_source_brand: 'PARKER', duty_source_url: URL_FG, duty_validation_status: 'VERIFIED', duty_verified_at: AT,
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
    const oem = take(readCodes('es90120_oem_20261118.txt'), (brand, code) => ({ code, manufacturer: brand, classification: 'OEM', classification_source: SRC_OEM, source_url: URL_FG }));
    const comp = take(readCodes('es90120_competitors_20261118.txt'), (brand, code) => ({ code, manufacturer: brand, classification: 'AFTERMARKET', classification_source: SRC_LIST, source_url: URL_FG }));
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
    report.applications = 0; // the Parker page lists no equipment models


    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE sku=$1 AND ld_catalog.norm_part(code) IN (ld_catalog.norm_part($2), ld_catalog.norm_part('A9584770115'), ld_catalog.norm_part('A9794770015KZ'), ld_catalog.norm_part('PS10610'))`, [SKU, BASE])).rows;
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
