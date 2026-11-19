'use strict';

/**
 * ES91000: phantom row (base FS1010V, no data; operator ruling 2026-11-18 "FANTASMA") becomes Donaldson P551000 (water separator Twist&Drain, spin-on).
 * SKU suffix 1000 matches P551000. Official page pasted by the operator: OD 93 mm, length 252 mm, thread 1-14 UN, gasket 72/62 mm, 10 micron, SAE J1488/J1985, collapse 75 psi.
 * Loads the Donaldson OEM cross tab (data/es91000_oem_20261118.txt). Codes Donaldson lists under P551000 that also sit on ES90901 (P550901) / ES98000 (P558000)
 * are moved to ES91000 (HD code ownership by the official sheet). P550901 and P558000 are linked as Donaldson ALTERNATIVE_PRODUCT (operator 2026-11-18).
 * Applications are NOT touched. Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'ES91000';
const OLD = 'FS1010V';
const BASE = 'P551000';
const OTHERS = ['ES90901', 'ES98000'];
const URL_DON = 'https://shop.donaldson.com/store/es-us/product/P551000';
const AT = '2026-11-18T00:00:00.000Z';
const SRC_OEM = 'DONALDSON_OFFICIAL_PRODUCT_PAGE_P551000_CROSS_REFERENCE_OPERATOR_PASTED_20261118';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

function readCodes() {
  const out = [];
  for (const line of fs.readFileSync(path.join(__dirname, 'data', 'es91000_oem_20261118.txt'), 'utf8').split(/\r?\n/)) {
    if (!line.trim() || line.startsWith('#')) continue;
    const i = line.indexOf(':');
    const brand = line.slice(0, i).trim().toUpperCase();
    for (const code of line.slice(i + 1).trim().split(/\s+/)) if (code) out.push({ brand, code });
  }
  return out;
}

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU, from: OLD, to: BASE };
  try {
    await db.query('BEGIN');
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku FOR UPDATE', [[SKU, ...OTHERS]])).rows;
    const cur = rows.find((r) => r.sku === SKU);
    if (!cur || cur.codigo_base !== OLD) throw new Error('SOURCE_CHANGED');
    const clash = await db.query(`SELECT sku FROM public.elimfilters_catalog WHERE sku<>$1 AND upper(regexp_replace(coalesce(codigo_base,''),'[^A-Za-z0-9]','','g'))=$2`, [SKU, BASE]);
    if (clash.rowCount) throw new Error('BASE_ALREADY_USED ' + clash.rows.map((r) => r.sku).join(','));
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows, row_sha256: sha(rows) }, null, 2));

    const list = readCodes();
    const listSet = new Set(list.map((x) => norm(x.code)));
    const oem = []; const seen = new Set([norm(BASE)]);
    for (const { brand, code } of list) { const k = norm(code); if (seen.has(k)) continue; seen.add(k); oem.push({ code, manufacturer: brand, classification: 'OEM', classification_source: SRC_OEM, source_url: URL_DON }); }

    report.moved = {};
    for (const s of OTHERS) {
      const r = rows.find((x) => x.sku === s);
      const isMoved = (x) => listSet.has(norm(x.code)) && norm(x.code) !== norm(r.codigo_base);
      const o = (r.oem_codes || []).filter((x) => !isMoved(x));
      const c = (r.competitor_codes || []).filter((x) => !isMoved(x));
      report.moved[s] = [...(r.oem_codes || []), ...(r.competitor_codes || [])].filter(isMoved).map((x) => `${x.manufacturer}:${x.code}`);
      report.moved[s + '_gateway'] = assertGovernedCatalogPatch(r, { oem_codes: o, competitor_codes: c }, { validateApplications: false }).valid;
      await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [s, JSON.stringify(o), JSON.stringify(c)]);
    }

    const enrichment = { ...(cur.enrichment_data || {}) };
    enrichment.rebased_from = { codigo_base: OLD, note: 'Operator 2026-11-18: FS1010V was a phantom row; rebased to Donaldson P551000', rebased_at: AT };
    enrichment.codigo_base_governance = {
      state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', verified_at: AT, evidence_url: URL_DON,
      evidence_level: 'OFFICIAL_PRODUCT_PAGE', evidence_authority: 'DONALDSON_OFFICIAL_CATALOG', policy_version: '2026-08-19-v3.1',
      required_authority: 'VERIFIED_DONALDSON', contamination_flags: [], observed_primary_candidates: [],
      current_codigo_base: BASE, approved_codigo_base: BASE, approved_manufacturer: 'DONALDSON', approved_source_column: 'COMPETITOR_CODES',
      verification_method: 'DONALDSON_OFFICIAL_PRODUCT_PAGE_P551000_OPERATOR_PASTED', alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY',
      primary_manufacturer_verified: true, oem_code_count: oem.length, competitor_code_count: 0,
    };
    const alt = ['P550901', 'P558000'].map((code) => ({ code, manufacturer: 'DONALDSON', relationship: 'ALTERNATIVE_PRODUCT', source_url: URL_DON }));
    const patch = {
      codigo_base: BASE, enrichment_data: enrichment, oem_codes: oem, competitor_codes: [], alternative_products: alt, alternatives: [],
      sub_type: 'Spin On', outer_diameter_mm: '93.00', height_mm: '252.00', thread_size: '1-14 UN', gasket_od_mm: '72.00', gasket_id_mm: '62.00',
      micron_rating: '10', nominal_efficiency: '10 micron', iso_test_method: 'SAE J1488, J1985', burst_pressure_psi: '75',
      canonical_source_brand: 'DONALDSON', canonical_source_code: BASE, canonical_source_url: URL_DON, canonical_source_status: 'VERIFIED', canonical_verified_at: AT,
      canonical_evidence: { authority: 'DONALDSON_OFFICIAL_PRODUCT_PAGE', source_url: URL_DON, evidence_hash: sha({ sku: SKU, base: BASE, url: URL_DON }) },
    };
    report.gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
    report.policy = evaluateCodigoBase({ ...cur, ...patch });
    if (!report.policy.valid) throw new Error('POLICY_REJECTED ' + JSON.stringify(report.policy));
    const jsonCols = new Set(['enrichment_data', 'oem_codes', 'competitor_codes', 'alternative_products', 'alternatives', 'canonical_evidence']);
    const cols = Object.keys(patch);
    await db.query(`UPDATE public.elimfilters_catalog SET ${cols.map((c, i) => `"${c}"=$${i + 2}${jsonCols.has(c) ? '::jsonb' : ''}`).join(',')} WHERE sku=$1`,
      [SKU, ...cols.map((c) => (jsonCols.has(c) ? JSON.stringify(patch[c]) : patch[c]))]);
    report.oem_loaded = oem.length;

    for (const s of [SKU, ...OTHERS]) {
      try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [s]); await db.query('RELEASE SAVEPOINT c'); } catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); }
    }
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code) IN (ld_catalog.norm_part('P551000'),ld_catalog.norm_part('FS1000'),ld_catalog.norm_part('3329289'),ld_catalog.norm_part('P550901'),ld_catalog.norm_part('P558000'))`)).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
