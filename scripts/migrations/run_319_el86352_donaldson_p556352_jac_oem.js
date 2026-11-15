'use strict';

/**
 * JAC Bufalo / Cummins ISF3.8 oil filter (OEM 1010305FE010 as supplied by the client).
 * EL86352 already carries Cummins 5262313; the official Donaldson page P556352 matches it
 * exactly (OD 101.5, M27x2, length 175.13, gasket 69.97/62.53, main application CUMMINS 5262313).
 * Canonical priority Donaldson -> Fleetguard: canonical becomes DONALDSON P556352 and the official
 * Fleetguard LF16352 becomes a classified equivalent. 1010305FE010 is stored as CLIENT_SUPPLIED
 * (no official source lists it). Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EL86352';
const OLD_BASE = 'LF16352';
const BASE = 'P556352';
const DON_URL = 'https://shop.donaldson.com/store/es-us/product/P556352/64439';
const FG_URL = 'https://www.fleetguard.com/es/product/lf16352/01t5x000008FBycAAG';
const AT = '2026-11-15T00:00:00.000Z';
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const has = (list, code) => list.some((x) => norm(x && (x.code || x.reference)) === norm(code));

const evidence = () => {
  const body = {
    method: 'operator-pasted-official-donaldson-product-page',
    source_url: DON_URL,
    part_number: BASE,
    description: 'LUBE FILTER, FULL FLOW SPIN-ON',
    attributes: { Type: 'Full-Flow', Style: 'Spin-On', Thread: 'M27 x 2', Length: '6.89 in (175.13 mm)', OuterDiameter: '4.00 in (101.5 mm)',
      GasketOD: '2.75 in (69.97 mm)', GasketID: '2.46 in (62.53 mm)', Efficiency95: '30 micron', PrimaryApplication: 'CUMMINS 5262313' },
    oem_count: 8,
    captured_at: AT,
  };
  return { ...body, evidence_hash: sha(body) };
};

const governance = () => ({
  state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', verified_at: AT, evidence_url: DON_URL,
  evidence_hash: evidence().evidence_hash, evidence_kind: 'OFFICIAL_OPERATOR_PASTED_PRODUCT_PAGE',
  evidence_authority: 'DONALDSON_OFFICIAL_PRODUCT_PAGE', policy_version: '2026-08-19-v3.1', contamination_flags: [],
  current_codigo_base: BASE, approved_codigo_base: BASE, approved_manufacturer: 'DONALDSON',
  approved_source_column: 'OEM_CODES', primary_manufacturer_verified: true,
});

const FLEETGUARD = {
  manufacturer: 'FLEETGUARD', code: OLD_BASE, classification: 'AFTERMARKET',
  classification_source: 'FLEETGUARD_OFFICIAL_PRODUCT_PAGE_20261115', source_url: FG_URL,
  verification_status: 'VERIFIED', verified_at: AT,
};
const JAC = {
  manufacturer: 'JAC', code: '1010305FE010', classification: 'OEM',
  classification_source: 'CLIENT_SUPPLIED_JAC_BUFALO_ISF38_20261115', verification_status: 'CLIENT_SUPPLIED', verified_at: AT,
};
const stamp = (x) => ({ ...x, evidence_hash: sha({ sku: SKU, code: x.code, source: x.source_url || x.classification_source }) });

function plan(row) {
  const oem = Array.isArray(row.oem_codes) ? row.oem_codes : [];
  const comp = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
  const patch = {};
  if (row.canonical_source_brand !== 'DONALDSON' || row.canonical_source_code !== BASE || row.codigo_base !== BASE) {
    Object.assign(patch, {
      codigo_base: BASE, canonical_source_brand: 'DONALDSON', canonical_source_code: BASE, canonical_source_status: 'VERIFIED',
      canonical_source_url: DON_URL, canonical_verified_at: AT, canonical_evidence: evidence(),
      enrichment_data: { ...(row.enrichment_data || {}), codigo_base_governance: governance() },
    });
  }
  if (!has(comp, OLD_BASE)) patch.competitor_codes = [...comp, stamp(FLEETGUARD)];
  if (!has(oem, JAC.code)) patch.oem_codes = [...oem, stamp(JAC)];
  return Object.keys(patch).length ? patch : null;
}

const OWNER_SQL = `SELECT sku FROM public.elimfilters_catalog c
  WHERE regexp_replace(upper(coalesce(c.codigo_base,'')),'[^A-Z0-9]','','g')=$1
     OR regexp_replace(upper(coalesce(c.canonical_source_code,'')),'[^A-Z0-9]','','g')=$1
     OR EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb) || coalesce(c.competitor_codes,'[]'::jsonb)) x
                WHERE regexp_replace(upper(coalesce(x->>'code',x->>'reference','')),'[^A-Z0-9]','','g')=$1)
  ORDER BY sku`;

const JSONB = new Set(['enrichment_data', 'canonical_evidence', 'oem_codes', 'competitor_codes']);

if (require.main === module) (async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB_URL_MISSING');
  const db = new Client({ connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };
  try {
    await db.query('BEGIN');
    const current = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!current) throw new Error('SKU_NOT_FOUND');
    if (current.codigo_base !== OLD_BASE && current.codigo_base !== BASE) throw new Error('UNEXPECTED_BASE ' + current.codigo_base);
    const keep = ['height_mm', 'outer_diameter_mm', 'thread_size', 'filter_type', 'duty', 'image_url'].map((k) => current[k]);
    const patch = plan(current);
    report.already_present = patch === null;
    if (patch) {
      report.gateway = assertGovernedCatalogPatch(current, patch, { validateApplications: false });
      if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: current, row_sha256: sha(current) }, null, 2));
      const keys = Object.keys(patch);
      const sets = keys.map((k, i) => `${k}=$${i + 2}${JSONB.has(k) ? '::jsonb' : ''}`).join(',');
      await db.query(`UPDATE public.elimfilters_catalog SET ${sets} WHERE sku=$1`, [SKU, ...keys.map((k) => (JSONB.has(k) ? JSON.stringify(patch[k]) : patch[k]))]);
    }
    report.owners = {};
    for (const code of [BASE, OLD_BASE, JAC.code]) {
      const owners = (await db.query(OWNER_SQL, [norm(code)])).rows.map((x) => x.sku);
      report.owners[code] = owners;
      if (owners.length !== 1 || owners[0] !== SKU) throw new Error(`REFERENCE_COLLISION ${code} ${owners.join(',')}`);
    }
    const s = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    const keep2 = ['height_mm', 'outer_diameter_mm', 'thread_size', 'filter_type', 'duty', 'image_url'].map((k) => s[k]);
    if (JSON.stringify(keep) !== JSON.stringify(keep2)) throw new Error('PHYSICAL_IDENTITY_CHANGED');
    if (s.canonical_source_brand !== 'DONALDSON' || s.canonical_source_code !== BASE || s.canonical_source_status !== 'VERIFIED' || s.codigo_base !== BASE) throw new Error('POST_WRITE_CANONICAL');
    if (!has(s.oem_codes, JAC.code) || !has(s.oem_codes, '5262313') || !has(s.competitor_codes, OLD_BASE)) throw new Error('POST_WRITE_REFERENCES');
    report.canonical = [s.canonical_source_brand, s.canonical_source_code, s.canonical_source_status];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw error;
  } finally {
    await db.end();
  }
})().catch((error) => { console.error(error.stack || error); process.exit(1); });

module.exports = { plan, norm, JAC, FLEETGUARD };
