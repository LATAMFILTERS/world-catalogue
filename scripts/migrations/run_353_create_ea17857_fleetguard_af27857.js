'use strict';

/**
 * Creates EA17857 (HD primary axial-seal air element), codigo_base = Fleetguard AF27857.
 * Authority: ELIMFILTERS operator instruction 2026-11-16 + Fleetguard official product page (AF27857: 535 mm long, 267.5 mm largest OD,
 * 170 mm ID, ISO 5011, official OEM cross list). Same governance shape as run_336/run_350 (VERIFIED_FLEETGUARD_FALLBACK);
 * Donaldson absence per operator ruling, not independently checked (Donaldson P784457 / EA16242 is 490 mm long, so it is a different element).
 * Also, so that no reference is shared between rows (exact-part conflicts):
 *  - EA16242 (HD, Donaldson P784457): drops AF27857 and Scania 1485592, which it held only from the internal taxonomy (20260927);
 *  - EA31340 (LD, MANN C271340): drops Scania 1485592 and Volvo 20544738 (HD owns the shared codes; LD and HD are not mixed).
 * Equipment applications (Fleetguard list: Volvo VM, Scania) are NOT loaded here.
 * Dry-run by default (ROLLBACK). --execute commits and needs --snapshot <file>. No certification-ledger row is written here.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite, assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EA17857';
const BASE = 'AF27857';
const URL_FG = 'https://www.fleetguard.com/es/product/af27857/01t5x000008FBviAAG';
const AT = '2026-11-16T00:00:00.000Z';
const SRC = 'FLEETGUARD_OFFICIAL_PRODUCT_PAGE_AF27857_20261116';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const oem = (code, manufacturer) => ({ code, manufacturer, classification: 'OEM', classification_source: SRC, source_url: URL_FG });
const alt = (code, manufacturer) => ({ code, manufacturer, classification: 'AFTERMARKET', classification_source: SRC, source_url: URL_FG });
const DROP = { EA16242: ['AF27857', '1485592'], EA31340: ['1485592', '20544738'] };

function buildRow() {
  return {
    sku: SKU, codigo_base: BASE, catalog_active: true, duty: 'HEAVY_DUTY',
    filter_type: 'air', technology: 'MACROCORE™', sub_type: 'Primary Radial Seal',
    height_mm: 535.0, outer_diameter_mm: 267.5, inner_diameter_mm: 170.0, filter_media: 'GENUINE FILTER MEDIA',
    description: `ELIMFILTERS® ${SKU} MACROCORE™ primary axial-seal air filter element. Pleated cellulose media captures dust before it reaches the engine intake and protects the engine in demanding operating conditions.`,
    oem_codes: [oem('7424993638', 'RENAULT'), oem('1533957', 'DAF'), oem('1527883', 'DAF'), oem('6213198M1', 'AGCO'), oem('6113198M1', 'AGCO'),
      oem('1485592', 'SCANIA'), oem('20544738', 'VOLVO')],
    competitor_codes: [alt('ARS9840', 'TEC-FIL'), alt('1534935', 'TRP'), alt('986626793', 'BOSCH'), alt('986B03010', 'BOSCH')],
    equipment_applications: [], vehicle_applications: [], alternative_products: [], brand_crossrefs: {}, alternatives: [],
    specs: { product_type: 'AIR_ELEMENT_PRIMARY_AXIAL_SEAL', media_type: 'GENUINE FILTER MEDIA', iso_5011: true, full_life_efficiency_pct: 99.95, dimensions_source_url: URL_FG },
    enrichment_data: {
      codigo_base_governance: {
        state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', verified_at: AT, evidence_url: URL_FG,
        policy_version: '2026-08-19-v3.1', required_authority: 'VERIFIED_AFTERMARKET_FALLBACK',
        current_codigo_base: BASE, approved_codigo_base: BASE, approved_manufacturer: 'FLEETGUARD', approved_source_column: 'COMPETITOR_CODES',
        verification_method: 'ELIMFILTERS_OPERATOR_CONFIRMATION_PLUS_FLEETGUARD_OFFICIAL_PRODUCT_PAGE',
        alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY',
        donaldson_absence_note: 'ELIMFILTERS operator ruling 2026-11-16: AF27857 is the approved commercial base. Donaldson absence per operator ruling, not independently checked.',
        donaldson_absence_verified: true, observed_primary_candidates: [], contamination_flags: [],
        oem_code_count: 7, competitor_code_count: 4,
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
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client(url
    ? { connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } }
    : { host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU, codigo_base: BASE, dropped: {} };
  try {
    await db.query('BEGIN');
    const clash = await db.query(`SELECT sku,codigo_base FROM public.elimfilters_catalog WHERE sku=$1 OR upper(regexp_replace(coalesce(codigo_base,''),'[^A-Za-z0-9]','','g'))='AF27857' FOR UPDATE`, [SKU]);
    if (clash.rowCount) throw new Error('ALREADY_EXISTS ' + JSON.stringify(clash.rows));
    const others = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) FOR UPDATE', [Object.keys(DROP)])).rows;
    if (others.length !== Object.keys(DROP).length) throw new Error('OTHER_SKU_NOT_FOUND');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows: others, row_sha256: sha(others) }, null, 2));
    const row = buildRow();
    report.gateway = assertCanonicalWrite(row, { validateApplications: false });
    report.policy = evaluateCodigoBase(row);
    if (!report.policy.valid) throw new Error('POLICY_REJECTED ' + JSON.stringify(report.policy));
    // 1. free the shared references on the other two rows
    for (const cur of others) {
      const drop = new Set(DROP[cur.sku].map(norm));
      const keep = (list) => list.filter((x) => !drop.has(norm(x.code || x.reference)));
      const patch = { oem_codes: keep(cur.oem_codes), competitor_codes: keep(cur.competitor_codes) };
      report.dropped[cur.sku] = [...cur.oem_codes, ...cur.competitor_codes].filter((x) => drop.has(norm(x.code))).map((x) => `${x.manufacturer} ${x.code}`);
      assertGovernedCatalogPatch(cur, patch, { validateApplications: false });
      await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [cur.sku, JSON.stringify(patch.oem_codes), JSON.stringify(patch.competitor_codes)]);
      await db.query(`DELETE FROM public.exact_part_reference WHERE sku=$1 AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g')) = ANY($2::text[])`, [cur.sku, [...drop]]);
      await db.query('SELECT public.refresh_crossref_cache_sku($1)', [cur.sku]);
    }
    // 2. create EA17857
    const jsonCols = new Set(['oem_codes', 'competitor_codes', 'equipment_applications', 'vehicle_applications', 'alternative_products', 'brand_crossrefs', 'alternatives', 'specs', 'enrichment_data', 'canonical_evidence', 'duty_evidence']);
    const cols = Object.keys(row);
    report.inserted = (await db.query(`INSERT INTO public.elimfilters_catalog (${cols.map((c) => '"' + c + '"').join(',')}) VALUES (${cols.map((c, i) => '$' + (i + 1) + (jsonCols.has(c) ? '::jsonb' : '')).join(',')}) RETURNING id,sku,codigo_base,duty,catalog_active`,
      cols.map((c) => (jsonCols.has(c) ? JSON.stringify(row[c]) : row[c])))).rows[0];
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE sku=$1 OR ld_catalog.norm_part(code) IN (ld_catalog.norm_part('AF27857'), ld_catalog.norm_part('1485592'), ld_catalog.norm_part('20544738'), ld_catalog.norm_part('ARS9840'))`, [SKU])).rows;
    report.integrity = (await db.query(`SELECT
      (SELECT count(*)::int FROM public.elimfilters_catalog WHERE upper(regexp_replace(coalesce(codigo_base,''),'[^A-Za-z0-9]','','g'))='AF27857') base_sku_count,
      (SELECT count(*)::int FROM public.exact_part_conflicts WHERE $1=ANY(skus)) exact_conflicts,
      (SELECT count(*)::int FROM public.catalog_reference_classification_conflicts_v WHERE sku=$1) classification_conflicts,
      (SELECT count(*)::int FROM public.bad_crossref_quarantine WHERE source_sku=$1) quarantine_rows`, [SKU])).rows[0];
    const i = report.integrity;
    if (Number(i.base_sku_count) !== 1 || i.exact_conflicts || i.classification_conflicts || i.quarantine_rows) throw new Error('INTEGRITY_FAILED ' + JSON.stringify(i) + ' ' + JSON.stringify(report.resolver));
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
