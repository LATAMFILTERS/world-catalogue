'use strict';

/**
 * EL86352: operator-instructed addition of JAC 1010320FE010 / 1010320-FE010 (client supplied, no official
 * source) and the image URL provided by the operator. Canonical (Donaldson P556352) is untouched.
 * Dry-run by default; --execute needs --snapshot <file>.
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
const IMAGE = 'https://cdn.elimfilters.com/EL8/EL80352.png';
const AT = '2026-11-15T00:00:00.000Z';
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const CODES = ['1010320FE010', '1010320-FE010'].map((code) => ({
  manufacturer: 'JAC', code, classification: 'OEM', classification_source: 'CLIENT_SUPPLIED_JAC_HFC4DE1_20261115',
  verification_status: 'CLIENT_SUPPLIED', verified_at: AT, evidence_hash: sha({ sku: SKU, code }),
}));

function plan(row) {
  const oem = Array.isArray(row.oem_codes) ? row.oem_codes : [];
  const add = CODES.filter((c) => !oem.some((x) => (x.code || '') === c.code));
  const patch = {};
  if (add.length) patch.oem_codes = [...oem, ...add];
  if (row.image_url !== IMAGE) patch.image_url = IMAGE;
  return Object.keys(patch).length ? patch : null;
}

if (require.main === module) (async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB_URL_MISSING');
  const db = new Client({ connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };
  try {
    await db.query('BEGIN');
    const cur = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!cur) throw new Error('SKU_NOT_FOUND');
    if (cur.canonical_source_code !== 'P556352') throw new Error('CANONICAL_MISMATCH');
    const keep = ['codigo_base', 'canonical_source_brand', 'canonical_source_code', 'height_mm', 'outer_diameter_mm', 'thread_size'].map((k) => cur[k]);
    const patch = plan(cur);
    report.already_present = patch === null;
    if (patch) {
      report.gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
      if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur, row_sha256: sha(cur) }, null, 2));
      const keys = Object.keys(patch);
      await db.query(`UPDATE public.elimfilters_catalog SET ${keys.map((k, i) => `${k}=$${i + 2}${k === 'oem_codes' ? '::jsonb' : ''}`).join(',')} WHERE sku=$1`,
        [SKU, ...keys.map((k) => (k === 'oem_codes' ? JSON.stringify(patch[k]) : patch[k]))]);
    }
    const owners = (await db.query(`SELECT DISTINCT sku FROM public.elimfilters_catalog c WHERE regexp_replace(upper(coalesce(codigo_base,'')),'[^A-Z0-9]','','g')='1010320FE010'
      OR EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(oem_codes,'[]'::jsonb)||coalesce(competitor_codes,'[]'::jsonb)) x WHERE regexp_replace(upper(coalesce(x->>'code','')),'[^A-Z0-9]','','g')='1010320FE010')`)).rows.map((x) => x.sku);
    report.owners = owners;
    if (owners.length !== 1 || owners[0] !== SKU) throw new Error('REFERENCE_COLLISION ' + owners.join(','));
    const s = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    if (JSON.stringify(keep) !== JSON.stringify(['codigo_base', 'canonical_source_brand', 'canonical_source_code', 'height_mm', 'outer_diameter_mm', 'thread_size'].map((k) => s[k]))) throw new Error('IDENTITY_CHANGED');
    if (s.image_url !== IMAGE || !CODES.every((c) => s.oem_codes.some((x) => x.code === c.code))) throw new Error('POST_WRITE_VERIFICATION_FAILED');
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });

module.exports = { plan, CODES };
