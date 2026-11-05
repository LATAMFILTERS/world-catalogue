#!/usr/bin/env node
// READ-ONLY. Builds the Donaldson product-page capture queue for active HEAVY_DUTY SKUs whose codigo_base is a
// Donaldson code not yet captured (operator capture donaldson-local + Claude recaptures). Product URLs come from the
// official sitemap index (out/donaldson/sitemap-index.json, built by donaldson-sitemap-index.mjs); codes absent from
// the sitemap are queued for search fallback. Output: out/donaldson-recapture/todo.json [{code, sku, url|null}].
// Usage: node scripts/hermes/donaldson-capture-todo.mjs --file <donaldson-local productos.json>
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, c, i, arr) => (c.startsWith('--') && a.push([c.slice(2), arr[i + 1]]), a), []));
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const done = new Set();
for (const r of JSON.parse(fs.readFileSync(args.file, 'utf8').replace(/^﻿/, ''))) if (r.status === 'EXTRAIDO') done.add(norm(r.requested_code));
const rdir = path.resolve('out', 'donaldson-recapture');
for (const f of fs.existsSync(rdir) ? fs.readdirSync(rdir).filter((x) => /^(productos-recaptura|batch-\d+)\.json$/.test(x)) : []) {
  const j = JSON.parse(fs.readFileSync(path.join(rdir, f), 'utf8'));
  for (const r of Array.isArray(j) ? j : Object.values(j.pages || {})) if (r.requested_code) done.add(norm(r.requested_code));
}
const sm = JSON.parse(fs.readFileSync(path.resolve('out', 'donaldson', 'sitemap-index.json'), 'utf8')).products;
const db = new pg.Client({ connectionString: process.env.CATALOG_DATABASE_URL }); await db.connect(); await db.query('BEGIN READ ONLY');
const { rows } = await db.query(`SELECT sku, codigo_base FROM public.elimfilters_catalog WHERE catalog_active AND duty='HEAVY_DUTY'
  AND (upper(coalesce(canonical_source_brand,''))='DONALDSON' OR codigo_base ~* '^(P\\d{6}|DB[A-Z]\\d{4}|X\\d{6})$') ORDER BY sku`);
await db.query('ROLLBACK'); await db.end();
const seen = new Set(); const todo = [];
for (const r of rows) {
  const c = norm(r.codigo_base); if (!c || done.has(c) || seen.has(c)) continue; seen.add(c);
  todo.push({ code: c, sku: r.sku, url: (sm[c] || [])[0] || null });
}
fs.mkdirSync(rdir, { recursive: true });
fs.writeFileSync(path.join(rdir, 'todo.json'), JSON.stringify(todo));
console.log(JSON.stringify({ hd_donaldson_skus: rows.length, already_captured: done.size, todo: todo.length, with_sitemap_url: todo.filter((t) => t.url).length,
  without_url: todo.filter((t) => !t.url).length, sample: todo.slice(0, 3) }));
