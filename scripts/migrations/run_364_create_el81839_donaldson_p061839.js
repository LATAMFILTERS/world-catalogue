'use strict';

/**
 * Creates EL81839 (HD spin-on lube/oil filter), codigo_base = Donaldson P061839 (PURFLO compressor lube spin-on; SKU = EL8 + 1839).
 * Official data: Donaldson P061839 sheet pasted by the operator 2026-11-16 (93 mm OD, 200 mm long, 1-12 UN, gasket 72 / 62 mm,
 * 99 % at 37 micron ISO 16889, bypass 2.5 bar, burst 20 bar) and the 27 OEM cross numbers visible on that sheet (the pasted
 * list ends at Bottarini 220911). The sheet has no equipment list.
 * Competitor codes: from the third-party MANN W 962 cross list the operator pasted (data/w962_competitor_list_20261116.txt),
 * ONLY the codes that no other SKU holds, with no Donaldson and no MANN entries; the list is not an official sheet and does not
 * say that P061839 = W 962 (210 mm vs 200 mm), so they are loaded as alternates only.
 * Dry-run by default (ROLLBACK). --execute commits and needs --snapshot <file>. No certification-ledger row is written here.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EL81839';
const BASE = 'P061839';
const URL_DON = 'https://shop.donaldson.com/store/es-us/product/P061839/prod1530096';
const AT = '2026-11-16T00:00:00.000Z';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const SRC_DON = 'DONALDSON_OFFICIAL_PRODUCT_PAGE_P061839_20261116';
const SRC_LIST = 'THIRD_PARTY_MANN_W962_CROSS_LIST_OPERATOR_PASTED_20261116';

const DON_REFS = [
  ['ALMIG COMPRESSOR', ['201002985', '57203291', '47203291']],
  ['ATLAS COPCO', ['6211472200', '6211472250', '1614556200', '1202849600', '9721033800', '9709001200', '3184170100', '1619262700', '1613610590', 'A15H4123', '1613554400', '1613437800', '1616437800', '2255300203', '2914505000', '1619377100', '2255300234', '1613610500', '9712540104', '1612398000']],
  ['BETICO', ['4685610', '4460642']],
  ['BOGE', ['558000301']],
  ['BOTTARINI', ['220911']],
];
const OEM_BRANDS = new Set(['AGCO', 'ATLAS', 'ATLAS-COPCO', 'ATLAS-WEYHAUSEN', 'AUWAERTER', 'BAUDOUIN', 'BOMAG', 'CARRIER TRANSICOLD', 'CASE', 'CASE-IH', 'CASE-TEMP', 'CATERPILLAR', 'CECCATO', 'CLAAS', 'COMPAIR CANADA', 'COLES', 'DEUTZ', 'DEUTZ-FAHR', 'DYNAPAC', 'EVOBUS', 'FAHR', 'FAUN', 'FIAT', 'FIAT-ALLIS', 'FIAT-HITACHI', 'FOMOCO', 'FORD', 'GALION', 'GENERAL MOTORS', 'GROVE', 'GUELDNER', 'HAMM', 'HANOMAG-HENSCHEL', 'HYDRA-MAC', 'IHC-NAVISTAR', 'ISUZU', 'IVECO', 'JOHN DEERE', 'KAELBLE', 'KAESSBOHRER-PISTENBULLY', 'KRAMER', 'LEYBOLD', 'LIEBHERR', 'LINDE', 'LOSENHAUSEN', 'MACO-MEUDON', 'MAN', 'MANITOU', 'MASSEY-FERGUSON', 'MER', 'MERCEDES-BENZ', 'MERLO', 'MITSUBISHI', 'MONARK', 'MONARK-DIESEL', 'MWM', 'NEUSON', 'NEW HOLLAND', 'ORENSTEIN-KOPPEL', 'POCLAIN', 'RICHIER', 'ROTORCOMP', 'SAURER', 'SCHAEFF', 'SCHLUTER', 'SCHWING', 'STEYR', 'SULLAIR', 'TEREX', 'THERMO-KING', 'TIMBERJACK', 'TROJAN', 'VM', 'VOEGELE', 'VOGELE', 'VOLVO', 'WIRTGEN', 'ZETTELMEYER']);

function readList() {
  const out = [];
  for (const line of fs.readFileSync(path.join(__dirname, 'data', 'w962_competitor_list_20261116.txt'), 'utf8').split(/\r?\n/)) {
    if (!line.trim() || line.startsWith('#')) continue;
    const i = line.indexOf(':');
    const brand = line.slice(0, i).trim();
    const codes = line.slice(i + 1).trim();
    // the General Motors entries carry a "GM " prefix inside the code; every other code has no spaces except "FL 406"-style Motorcraft ones
    const items = brand === 'General Motors' ? codes.split(/ (?=GM )/) : brand === 'MOTORCRAFT' ? codes.split(/ (?=(?:EFL|FL))/).map((x) => x.trim()) : codes.split(/\s+/);
    for (const code of items) if (code) out.push({ brand, code: code.replace(/^GM /, '') });
  }
  return out;
}

function buildRow(oem, competitor) {
  return {
    sku: SKU, codigo_base: BASE, catalog_active: true, duty: 'HEAVY_DUTY',
    filter_type: 'oil', technology: 'SYNTRAX™', sub_type: 'Spin On', thread_size: '1-12 UN',
    height_mm: 200.0, outer_diameter_mm: 93.0, filter_media: 'GENUINE FILTER MEDIA',
    description: `ELIMFILTERS® ${SKU} SYNTRAX™ spin-on lube filter uses GENUINE FILTER MEDIA to keep lubricating oil clean, capture contaminants and protect the compressor or engine in demanding operating conditions.`,
    oem_codes: oem, competitor_codes: competitor,
    equipment_applications: [], vehicle_applications: [], alternative_products: [], brand_crossrefs: {}, alternatives: [],
    specs: { product_type: 'OIL_SPIN_ON_LUBE_COMPRESSOR', media_type: 'GENUINE FILTER MEDIA', thread_size: '1-12 UN', gasket_outer_diameter_mm: 72.0, gasket_inner_diameter_mm: 62.0, efficiency: '99% at 37 micron (ISO 16889)', bypass_setting_bar: 2.5, burst_pressure_bar: 20, dimensions_source_url: URL_DON },
    enrichment_data: {
      codigo_base_governance: {
        state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', verified_at: AT, evidence_url: URL_DON,
        evidence_level: 'OFFICIAL_PRODUCT_PAGE', evidence_authority: 'DONALDSON_OFFICIAL_CATALOG', policy_version: '2026-08-19-v3.1',
        required_authority: 'VERIFIED_DONALDSON', contamination_flags: [], observed_primary_candidates: [],
        current_codigo_base: BASE, approved_codigo_base: BASE, approved_manufacturer: 'DONALDSON', approved_source_column: 'COMPETITOR_CODES',
        verification_method: 'DONALDSON_OFFICIAL_PRODUCT_PAGE_P061839_OPERATOR_PASTED', alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY',
        primary_manufacturer_verified: true, oem_code_count: oem.length, competitor_code_count: competitor.length,
      },
    },
    canonical_source_brand: 'DONALDSON', canonical_source_code: BASE, canonical_source_url: URL_DON,
    canonical_source_status: 'VERIFIED', canonical_verified_at: AT,
    canonical_evidence: { authority: 'DONALDSON_OFFICIAL_PRODUCT_PAGE', source_url: URL_DON, evidence_hash: sha({ sku: SKU, base: BASE, url: URL_DON }) },
    duty_source_brand: 'DONALDSON', duty_source_url: URL_DON, duty_validation_status: 'VERIFIED', duty_verified_at: AT,
    duty_evidence: { duty: 'HEAVY_DUTY', authority: 'ELIMFILTERS_OPERATOR_RULING_2026-11-16', source_url: URL_DON },
  };
}

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client(url
    ? { connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } }
    : { host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU, codigo_base: BASE };
  try {
    await db.query('BEGIN');
    const clash = await db.query(`SELECT sku,codigo_base FROM public.elimfilters_catalog WHERE sku=$1 OR upper(regexp_replace(coalesce(codigo_base,''),'[^A-Za-z0-9]','','g'))=$2 FOR UPDATE`, [SKU, norm(BASE)]);
    if (clash.rowCount) throw new Error('ALREADY_EXISTS ' + JSON.stringify(clash.rows));
    // codes held by other SKUs (active or not)
    const held = new Map((await db.query(`SELECT upper(regexp_replace(coalesce(x->>'code',x->>'reference',''),'[^A-Za-z0-9]','','g')) k, array_agg(DISTINCT c.sku) skus
      FROM public.elimfilters_catalog c, jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb)||coalesce(c.competitor_codes,'[]'::jsonb)) x GROUP BY 1`)).rows.map((r) => [r.k, r.skus]));
    const bases = new Set((await db.query(`SELECT upper(regexp_replace(coalesce(codigo_base,''),'[^A-Za-z0-9]','','g')) k FROM public.elimfilters_catalog UNION SELECT upper(regexp_replace(coalesce(canonical_source_code,''),'[^A-Za-z0-9]','','g')) FROM public.elimfilters_catalog`)).rows.map((r) => r.k));
    const stamp = (code, manufacturer, classification, source) => ({ code, manufacturer, classification, classification_source: source, source_url: classification === 'OEM' && source === SRC_DON ? URL_DON : undefined });
    const oem = []; const seen = new Set([norm(BASE)]); const donExcluded = [];
    for (const [m, codes] of DON_REFS) for (const code of codes) {
      const k = norm(code);
      if (seen.has(k)) continue;
      if (held.has(k) || bases.has(k)) { donExcluded.push(`${m} ${code} (${(held.get(k) || ['base']).join('/')})`); continue; }
      seen.add(k); oem.push({ code, manufacturer: m, classification: 'OEM', classification_source: SRC_DON, source_url: URL_DON });
    }
    const competitor = []; const excluded = { held: [], base: [], dup: 0, short: 0 };
    for (const { brand, code } of readList()) {
      const k = norm(code);
      if (k.length < 4) { excluded.short++; continue; }
      if (seen.has(k)) { excluded.dup++; continue; }
      if (bases.has(k)) { excluded.base.push(`${brand} ${code}`); continue; }
      if (held.has(k)) { excluded.held.push(`${brand} ${code} -> ${held.get(k).join('/')}`); continue; }
      seen.add(k);
      const manufacturer = brand.toUpperCase();
      const isOem = OEM_BRANDS.has(manufacturer);
      (isOem ? oem : competitor).push({ code, manufacturer, classification: isOem ? 'OEM' : 'AFTERMARKET', classification_source: SRC_LIST });
    }
    report.official_donaldson_refs = { loaded: oem.filter((x) => x.classification_source === SRC_DON).length, excluded_because_other_sku_holds_them: donExcluded };
    report.list = { total_in_list: readList().length, loaded_as_oem: oem.filter((x) => x.classification_source === SRC_LIST).length, loaded_as_aftermarket: competitor.length,
      excluded_held_by_other_skus: excluded.held.length, excluded_already_a_base: excluded.base.length, excluded_duplicates: excluded.dup, excluded_too_short: excluded.short };
    const byHolder = {};
    for (const s of excluded.held) { const h = s.split(' -> ')[1]; byHolder[h] = (byHolder[h] || 0) + 1; }
    report.list.held_by = Object.entries(byHolder).sort((a, b) => b[1] - a[1]).slice(0, 8);
    report.list.excluded_bases_sample = excluded.base.slice(0, 6);

    const row = buildRow(oem, competitor);
    report.gateway = assertCanonicalWrite(row, { validateApplications: false }).valid;
    report.policy = evaluateCodigoBase(row);
    if (!report.policy.valid) throw new Error('POLICY_REJECTED ' + JSON.stringify(report.policy));
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ note: 'row did not exist before; created by run_364', row_sha256: sha(row) }, null, 2));
    const jsonCols = new Set(['oem_codes', 'competitor_codes', 'equipment_applications', 'vehicle_applications', 'alternative_products', 'brand_crossrefs', 'alternatives', 'specs', 'enrichment_data', 'canonical_evidence', 'duty_evidence']);
    const cols = Object.keys(row);
    report.inserted = (await db.query(`INSERT INTO public.elimfilters_catalog (${cols.map((c) => '"' + c + '"').join(',')}) VALUES (${cols.map((c, i) => '$' + (i + 1) + (jsonCols.has(c) ? '::jsonb' : '')).join(',')}) RETURNING id,sku,codigo_base,duty,catalog_active`,
      cols.map((c) => (jsonCols.has(c) ? JSON.stringify(row[c]) : row[c])))).rows[0];
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE sku=$1 AND ld_catalog.norm_part(code) IN (ld_catalog.norm_part('P061839'), ld_catalog.norm_part('6211472200'), ld_catalog.norm_part('PF856'))`, [SKU])).rows;
    report.integrity = (await db.query(`SELECT
      (SELECT count(*)::int FROM public.exact_part_conflicts WHERE $1=ANY(skus)) exact_conflicts,
      (SELECT count(*)::int FROM public.catalog_reference_classification_conflicts_v WHERE sku=$1) classification_conflicts,
      (SELECT count(*)::int FROM public.bad_crossref_quarantine WHERE source_sku=$1) quarantine_rows`, [SKU])).rows[0];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
