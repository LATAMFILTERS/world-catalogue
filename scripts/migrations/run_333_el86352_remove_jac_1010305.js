'use strict';

/**
 * EL86352: remove JAC 1010305FE010 / 1010320-FE010 (added by run_321 on operator instruction, then
 * ruled out by the operator: the client row does not match JAC Venezuela, whose Bufalo uses Cummins C230-20 8.3 L, never ISF 3.8). Nothing else is touched.
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
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const REMOVE = '1010305FE010';

function plan(row) {
  const oem = Array.isArray(row.oem_codes) ? row.oem_codes : [];
  const kept = oem.filter((x) => norm(x.code || x.reference) !== REMOVE);
  return kept.length === oem.length ? null : { oem_codes: kept };
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
    const before = cur.oem_codes.length;
    const patch = plan(cur);
    report.already_absent = patch === null;
    if (patch) {
      report.gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
      if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur, row_sha256: sha(cur) }, null, 2));
      await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb WHERE sku=$1', [SKU, JSON.stringify(patch.oem_codes)]);
    }
    const s = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    const has = (c) => s.oem_codes.some((x) => norm(x.code) === norm(c));
    if (has(REMOVE) || !has('5262313')) throw new Error('POST_WRITE_VERIFICATION_FAILED');
    if (s.canonical_source_code !== 'P556352' || !s.image_url.endsWith('/EL86352.png')) throw new Error('UNEXPECTED_CHANGE');
    const owners = (await db.query(`SELECT sku FROM public.elimfilters_catalog c WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(oem_codes,'[]'::jsonb)||coalesce(competitor_codes,'[]'::jsonb)) x WHERE regexp_replace(upper(coalesce(x->>'code','')),'[^A-Z0-9]','','g')=$1)`, [REMOVE])).rows;
    report.owners_after = owners.map((x) => x.sku);
    report.oem_count = [before, s.oem_codes.length];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });

module.exports = { plan };
