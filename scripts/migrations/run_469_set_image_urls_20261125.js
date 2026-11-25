'use strict';

/**
 * Registers the photos the operator uploaded to the CDN on 2026-11-25 (guarded: each row must still hold the value seen before; nothing else in the row changes).
 * EA12107, EA18972, EA19046, EL81604: image_url was NULL, the file EXISTS at PFX/SKU.png.
 * EL80287: EL8/EL80287.png did not exist; the uploaded file is "EL80287 (2).png" (rename it to EL80287.png later and re-point).
 * ES91047: ES9/ES91047.png did not exist; the uploaded file is ES91047.jpg.
 * Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const CDN = 'https://cdn.elimfilters.com';
const CHANGES = [
  { sku: 'EA12107', from: null, to: `${CDN}/EA1/EA12107.png` },
  { sku: 'EA18972', from: null, to: `${CDN}/EA1/EA18972.png` },
  { sku: 'EA19046', from: null, to: `${CDN}/EA1/EA19046.png` },
  { sku: 'EL81604', from: null, to: `${CDN}/EL8/EL81604.png` },
  { sku: 'EL80287', from: `${CDN}/EL8/EL80287.png`, to: `${CDN}/EL8/EL80287%20(2).png` },
  { sku: 'ES91047', from: `${CDN}/ES9/ES91047.png`, to: `${CDN}/ES9/ES91047.jpg` },
];
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', updated: [] };
  try {
    await db.query('BEGIN');
    const before = (await db.query(`SELECT sku, image_url, md5((to_jsonb(c)-'image_url')::text) h FROM public.elimfilters_catalog c WHERE sku = ANY($1::text[]) ORDER BY sku FOR UPDATE`, [CHANGES.map((c) => c.sku)])).rows;
    if (before.length !== CHANGES.length) throw new Error('SOURCE_ROWS_MISSING');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows: before, row_sha256: sha(before) }, null, 2));
    for (const c of CHANGES) {
      const b = before.find((x) => x.sku === c.sku);
      if ((b.image_url || null) !== c.from) throw new Error(`IMAGE_URL_CHANGED ${c.sku}`);
      const u = await db.query('UPDATE public.elimfilters_catalog SET image_url=$2 WHERE sku=$1', [c.sku, c.to]);
      if (u.rowCount !== 1) throw new Error('UPDATE_COUNT ' + c.sku);
      report.updated.push({ sku: c.sku, from: c.from, to: c.to });
    }
    const after = (await db.query(`SELECT sku, image_url, md5((to_jsonb(c)-'image_url')::text) h FROM public.elimfilters_catalog c WHERE sku = ANY($1::text[]) ORDER BY sku`, [CHANGES.map((c) => c.sku)])).rows;
    for (const a of after) { if (a.h !== before.find((x) => x.sku === a.sku).h) throw new Error('PROTECTED_FIELD_CHANGED ' + a.sku); }
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
