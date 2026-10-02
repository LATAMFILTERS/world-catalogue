#!/usr/bin/env node
// Builds frontend/src/data/product-pages.json (the snapshot read by the static Next build)
// from config/sku-sitemap-list.json.
//   Catalogue DB (operator, Lenovo):  CATALOG_DATABASE_URL=... node scripts/export-product-pages.mjs
//   Rows from a JSON export:          node scripts/export-product-pages.mjs --from-json=<file>   (file = {"rows":[...]} in elimfilters_catalog column shape)
// A SKU that fails a governance gate is reported as STOP_REVIEW and the export exits non-zero.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { buildRecord } = require('../lib/product-page-data.js');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const list = JSON.parse(readFileSync(path.join(root, 'config/sku-sitemap-list.json'), 'utf8'));
const entries = (list.skus || []).map((e) => (typeof e === 'string' ? { sku: e } : e));
const jsonArg = process.argv.find((a) => a.startsWith('--from-json'));
const fromJson = Boolean(jsonArg);
const seedFile = (jsonArg && jsonArg.split('=')[1]) || 'config/product-pages/seed-rows.json';

async function loadRows() {
  if (fromJson) {
    const rows = JSON.parse(readFileSync(path.resolve(root, seedFile), 'utf8')).rows;
    return { rows, source: seedFile.endsWith('seed-rows.json') ? { kind: 'repo-seed-rows', file: seedFile } : { kind: 'catalogue-db-export', file: path.basename(seedFile) } };
  }
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('Set CATALOG_DATABASE_URL (catalogue DB) or pass --from-json');
  const { default: pg } = await import('pg');
  const client = new pg.Client({ connectionString: url, ssl: /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false } });
  await client.connect();
  try {
    const { rows } = await client.query('SELECT * FROM elimfilters_catalog WHERE UPPER(sku) = ANY($1::text[])', [entries.map((e) => e.sku.toUpperCase())]);
    return { rows, source: { kind: 'catalogue-db', table: 'elimfilters_catalog' } };
  } finally {
    await client.end();
  }
}

const { rows, source } = await loadRows();
const products = [];
const blocked = [];
for (const entry of entries) {
  const row = rows.find((r) => String(r.sku).toUpperCase() === entry.sku.toUpperCase());
  try {
    if (!row) throw new Error(`STOP_REVIEW ${entry.sku}: not found in ${source.kind}`);
    if (!entry.family) throw new Error(`STOP_REVIEW ${entry.sku}: list entry has no family`);
    if (row.canonical_source_brand) console.warn(`WARN ${entry.sku}: derived from ${row.canonical_source_brand} ${row.canonical_source_code}; confirm the specs are ELIMFILTERS-validated before publishing`);
    if (row.canonical_source_status && row.canonical_source_status !== 'VERIFIED') console.warn(`NOTE ${entry.sku}: canonical_source_status=${row.canonical_source_status}`);
    products.push(buildRecord(row, entry, { ...source, ...(row._seed ? { seed: row._seed } : {}) }));
  } catch (error) {
    blocked.push(error.message);
  }
}

if (blocked.length) {
  console.error(blocked.join('\n'));
  process.exit(1);
}
const out = { phase: list.phase, options: list.options, products };
writeFileSync(path.join(root, 'frontend/src/data/product-pages.json'), `${JSON.stringify(out, null, 1)}\n`);
console.log(`product-pages.json: ${products.length} SKUs from ${source.kind}`);
