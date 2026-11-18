'use strict';

/** EF95322: assign the renders supplied by the operator (file name = SKU). Image only, one transaction.
 * Dry-run by default; --execute needs --snapshot <file>. */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKUS = ['EF95322'];
const imageFor = (sku) => `https://cdn.elimfilters.com/${sku.slice(0, 3)}/${sku}.png`;
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

if (require.main === module) (async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client(url ? { connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } } : { host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', skus: {} };
  try {
    await db.query('BEGIN');
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) FOR UPDATE', [SKUS])).rows;
    if (rows.length !== SKUS.length) throw new Error('SKU_NOT_FOUND');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows, row_sha256: sha(rows) }, null, 2));
    for (const cur of rows) {
      const image = imageFor(cur.sku);
      if (cur.image_url && cur.image_url !== image) throw new Error('IMAGE_ALREADY_SET ' + cur.sku);
      if (cur.image_url === image) { report.skus[cur.sku] = 'already'; continue; }
      const gateway = assertGovernedCatalogPatch(cur, { image_url: image }, { validateApplications: false }).valid;
      await db.query('UPDATE public.elimfilters_catalog SET image_url=$2 WHERE sku=$1', [cur.sku, image]);
      report.skus[cur.sku] = { image, gateway };
    }
    const after = (await db.query('SELECT sku,image_url,codigo_base FROM public.elimfilters_catalog WHERE sku = ANY($1::text[])', [SKUS])).rows;
    for (const s of after) {
      if (s.image_url !== imageFor(s.sku)) throw new Error('POST_WRITE_VERIFICATION_FAILED ' + s.sku);
      const before = rows.find((r) => r.sku === s.sku);
      if (before.codigo_base !== s.codigo_base) throw new Error('BASE_CHANGED ' + s.sku);
    }
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
