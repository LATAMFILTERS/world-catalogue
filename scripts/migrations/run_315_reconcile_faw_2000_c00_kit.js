'use strict';

/**
 * FAW #1304: add the officially verified MANN-FILTER service-pack reference
 * SP 2652-2 to the existing ELIMFILTERS kit EK50401.
 *
 * The individual elements and their canonical identities are preserved.
 * Unverified Donaldson, Fleetguard, Createk and joined commercial references
 * are deliberately not written. Dry-run by default; --execute commits.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EK50401';
const CODE = 'SP 2652-2';
const NORM = 'SP26522';
const SOURCE_URL = 'https://www.mann-filter.com/cn-zh/catalog/search-results/product.html/sp2652-2_mann-filter.html';
const VERIFIED_AT = '2026-11-14T00:00:00.000Z';
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

function buildReference() {
  const evidence = { sku: SKU, code: CODE, role: 'SERVICE_PACK', source_url: SOURCE_URL };
  return {
    manufacturer: 'MANN-FILTER',
    code: CODE,
    classification: 'AFTERMARKET',
    classification_source: 'MANN_FILTER_OFFICIAL_SERVICE_PACK_20261114',
    product_role: 'KIT',
    kit_components: ['EA17800', 'EA16229'],
    source_url: SOURCE_URL,
    verification_status: 'VERIFIED',
    verified_at: VERIFIED_AT,
    evidence_hash: sha(evidence),
  };
}

function plan(row) {
  const refs = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
  if (refs.some((item) => norm(item && (item.code || item.reference)) === NORM)) return null;
  return { competitor_codes: [...refs, buildReference()] };
}

if (require.main === module) (async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB_URL_MISSING');
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU, reference: CODE };
  try {
    await db.query('BEGIN');
    const current = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!current) throw new Error('KIT_NOT_FOUND');
    const components = current.enrichment_data?.kit?.components || [];
    if (current.sub_type !== 'Kit' || components.map((x) => x.sku).join(',') !== 'EA17800,EA16229') throw new Error('KIT_IDENTITY_MISMATCH');
    const patch = plan(current);
    report.already_present = patch === null;
    if (patch) {
      report.gateway = assertGovernedCatalogPatch(current, patch, { validateApplications: false });
      const before = { captured_at: new Date().toISOString(), row: current, row_sha256: sha(current) };
      if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify(before, null, 2));
      await db.query('UPDATE public.elimfilters_catalog SET competitor_codes=$2::jsonb WHERE sku=$1', [SKU, JSON.stringify(patch.competitor_codes)]);
    }
    const ownerRows = (await db.query(`SELECT sku FROM public.elimfilters_catalog c
      WHERE regexp_replace(upper(coalesce(c.codigo_base,'')),'[^A-Z0-9]','','g')=$1
         OR regexp_replace(upper(coalesce(c.canonical_source_code,'')),'[^A-Z0-9]','','g')=$1
         OR EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb) || coalesce(c.competitor_codes,'[]'::jsonb)) x
                    WHERE regexp_replace(upper(coalesce(x->>'code',x->>'reference','')),'[^A-Z0-9]','','g')=$1)
      ORDER BY sku`, [NORM])).rows.map((x) => x.sku);
    report.owners = ownerRows;
    if (ownerRows.length !== 1 || ownerRows[0] !== SKU) throw new Error(`REFERENCE_COLLISION ${ownerRows.join(',')}`);
    const saved = (await db.query(`SELECT competitor_codes FROM public.elimfilters_catalog WHERE sku=$1`, [SKU])).rows[0];
    report.saved_reference = saved.competitor_codes.find((x) => norm(x.code || x.reference) === NORM) || null;
    if (!report.saved_reference || report.saved_reference.product_role !== 'KIT') throw new Error('POST_WRITE_VERIFICATION_FAILED');
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

module.exports = { buildReference, plan, norm };
