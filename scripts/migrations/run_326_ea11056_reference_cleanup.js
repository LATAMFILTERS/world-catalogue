'use strict';

/**
 * EA11056 (Donaldson P181056): remove the references it shares with other SKUs (exact conflicts) and the
 * references blocked by the classification quarantine. Only EA11056 is written; the other SKUs keep their codes.
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
const SKU = 'EA11056';
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const REMOVE = new Set(['3123012700', '73119795', 'AF2982', 'A822', 'HF1687', '362', 'E2408', 'T562', '027002423', 'TA7325']);
const keep = (list) => (Array.isArray(list) ? list : []).filter((x) => !REMOVE.has(norm(x.code || x.reference)));
const OTHERS_SQL = "SELECT sku, md5(row(oem_codes, competitor_codes, codigo_base, canonical_source_code)::text) h FROM public.elimfilters_catalog WHERE sku<>$1 ORDER BY sku";

function plan(row) {
  const oem = keep(row.oem_codes);
  const comp = keep(row.competitor_codes);
  const changed = oem.length !== row.oem_codes.length || comp.length !== row.competitor_codes.length;
  return changed ? { oem_codes: oem, competitor_codes: comp } : null;
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
    if (cur.canonical_source_code !== 'P181056') throw new Error('CANONICAL_MISMATCH');
    const othersHash = sha((await db.query(OTHERS_SQL, [SKU])).rows);
    report.before = [cur.oem_codes.length, cur.competitor_codes.length];
    const patch = plan(cur);
    report.already_clean = patch === null;
    if (patch) {
      report.gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
      if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur, row_sha256: sha(cur) }, null, 2));
      await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [SKU, JSON.stringify(patch.oem_codes), JSON.stringify(patch.competitor_codes)]);
    }
    const s = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    for (const x of [...s.oem_codes, ...s.competitor_codes]) if (REMOVE.has(norm(x.code || x.reference))) throw new Error('POST_WRITE_VERIFICATION_FAILED ' + x.code);
    if (s.canonical_source_code !== 'P181056' || s.codigo_base !== 'P181056') throw new Error('IDENTITY_CHANGED');
    if (sha((await db.query(OTHERS_SQL, [SKU])).rows) !== othersHash) throw new Error('OTHER_SKUS_CHANGED');
    report.after = [s.oem_codes.length, s.competitor_codes.length];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });

module.exports = { plan };
