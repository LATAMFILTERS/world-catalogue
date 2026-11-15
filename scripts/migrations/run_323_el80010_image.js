'use strict';

/** EL80010 (Donaldson P550010 cartridge): assign the render EL8/EL80010.png (label verified = EL80010). Image only.
 * Dry-run by default; --execute needs --snapshot <file>. */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EL80010';
const IMAGE = 'https://cdn.elimfilters.com/EL8/EL80010.png';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

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
    if (cur.canonical_source_code !== 'P550010') throw new Error('CANONICAL_MISMATCH');
    if (cur.image_url && cur.image_url !== IMAGE) throw new Error('IMAGE_ALREADY_SET ' + cur.image_url);
    report.already_present = cur.image_url === IMAGE;
    if (!report.already_present) {
      const patch = { image_url: IMAGE };
      report.gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
      if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur, row_sha256: sha(cur) }, null, 2));
      await db.query('UPDATE public.elimfilters_catalog SET image_url=$2 WHERE sku=$1', [SKU, IMAGE]);
    }
    const s = (await db.query('SELECT image_url, codigo_base, canonical_source_code FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    if (s.image_url !== IMAGE || s.codigo_base !== 'P550010') throw new Error('POST_WRITE_VERIFICATION_FAILED');
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
