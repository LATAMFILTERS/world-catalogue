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
    if (entry.hold) throw new Error(`HOLD ${entry.sku}: ${entry.hold}`);
    if (!row) throw new Error(`STOP_REVIEW ${entry.sku}: not found in ${source.kind}`);
    if (row.canonical_source_brand) console.warn(`NOTE ${entry.sku}: canonical source ${row.canonical_source_brand} ${row.canonical_source_code}`);
    const record = buildRecord(row, entry, { ...source, ...(row._seed ? { seed: row._seed } : {}) });
    if (!entry.family) throw new Error(`STOP_REVIEW ${entry.sku}: list entry has no family`);
    for (const w of record.physicalWarnings || []) console.warn(`WARN ${entry.sku}: ${w}`);
    products.push(record);
  } catch (error) {
    blocked.push({ sku: entry.sku.toUpperCase(), reason: error.message.replace(/^(STOP_REVIEW|HOLD) \S+: /, ''), kind: error.message.split(' ')[0] });
  }
}

console.log(`PUBLISHABLE (${products.length}): ${products.map((p) => p.sku).join(', ') || '-'}`);
for (const b of blocked) console.log(`BLOCKED ${b.sku} [${b.kind}]: ${b.reason}`);
const out = { phase: list.phase, options: list.options, policy: 'VERIFIED-only', products, blocked };
writeFileSync(path.join(root, 'frontend/src/data/product-pages.json'), `${JSON.stringify(out, null, 1)}\n`);
console.log(`product-pages.json: ${products.length} published, ${blocked.length} blocked (source: ${source.kind})`);
if (process.argv.includes('--strict') && blocked.length) process.exit(1);
