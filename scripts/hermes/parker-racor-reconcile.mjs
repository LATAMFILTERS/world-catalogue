#!/usr/bin/env node
// READ-ONLY reconciliation of the Parker/Racor capture (official ph.parker.com product pages, captured in the
// ELIMSERVER Chrome, files out/racor/parker-racor-capture-*.json) against catalogue SKUs whose base is Racor/Parker.
// Per SKU: official part found?, official family (Product Series / title), current prefix + technology,
// proposed family per the prefix system (CLAUDE.md):
//   - turbine housings (FH/FG) and their replacement elements -> ET9 TURBOCORE
//   - spin-on fuel filter / water separators (Parker "Diesel Spin-on FF/WS", Aquabloc) -> ES9 HYDROCORE
// and official dimensions vs the stored ones. Nothing is written to the database.
// Usage: node scripts/hermes/parker-racor-reconcile.mjs
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const dir = path.resolve('out', 'racor');
const products = {};
for (const f of fs.readdirSync(dir).filter((x) => /^parker-racor-capture-\d+\.json$/.test(x)).sort()) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  for (const [k, v] of Object.entries(j.products || {})) products[k.replace(/-EMED-1$/, '')] ||= { ...v, file: f };
}
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const mm = (v) => { const s = String(v || ''); const m = /\(\s*([\d.]+)\s*mm\s*\)/i.exec(s) || /([\d.]+)\s*cm\b/i.exec(s); return m ? (/cm/i.test(m[0]) ? Number(m[1]) * 10 : Number(m[1])) : null; };
function family(p) {
  const s = `${p.title} ${p.attrs['Product Series'] || ''}`;
  if (/Turbine/i.test(s)) return 'ET9';
  if (/Spin-on/i.test(s)) return 'ES9';
  return null;
}
const db = new pg.Client({ connectionString: process.env.CATALOG_DATABASE_URL });
await db.connect();
await db.query('BEGIN READ ONLY');
const { rows } = await db.query(`SELECT sku, codigo_base, technology, thread_size, height_mm, outer_diameter_mm, micron_rating
  FROM public.elimfilters_catalog WHERE catalog_active AND sku LIKE 'ET9%'
    AND upper(coalesce(enrichment_data->'codigo_base_governance'->>'approved_manufacturer','')) IN ('RACOR','PARKER')`);
const skus = new Set((await db.query(`SELECT sku FROM public.elimfilters_catalog`)).rows.map((r) => r.sku));
await db.query('ROLLBACK'); await db.end();

const out = rows.map((r) => {
  const p = products[norm(r.codigo_base)] || products[norm(r.codigo_base).replace(/MOR$/, 'M-OR')];
  const key = Object.keys(products).find((k) => norm(k) === norm(r.codigo_base));
  const off = key ? products[key] : p;
  const row = { sku: r.sku, base: r.codigo_base, tech: String(r.technology || '').replace(/[^A-Z]/gi, '') };
  if (!off) return { ...row, status: 'NOT_ON_PARKER_SITE' };
  const fam = family(off);
  const official = { thread: off.attrs['Thread Size'] || null, od_mm: mm(off.attrs['Outside Diameter'] || off.attrs.Diameter), height_mm: mm(off.attrs.Height),
    micron: off.attrs['Micron Rating'] || null, series: off.attrs['Product Series'] || null };
  const proposed = fam ? `${fam}${String(r.codigo_base).replace(/\D/g, '').slice(-4).padStart(4, '0')}` : null;
  return { ...row, status: fam && !r.sku.startsWith(fam) ? 'PREFIX_CONFLICT' : 'OK', official_family: fam, proposed_sku: proposed,
    proposed_slot: proposed && fam && !r.sku.startsWith(fam) ? (skus.has(proposed) ? 'TAKEN' : 'FREE') : null,
    url: off.url, official, stored: { thread: r.thread_size, od_mm: r.outer_diameter_mm, height_mm: r.height_mm, micron: r.micron_rating } };
});
const file = path.join(dir, `reconcile-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(file, JSON.stringify(out, null, 1));
const by = out.reduce((m, r) => { m[r.status] = (m[r.status] || 0) + 1; return m; }, {});
console.log(JSON.stringify({ skus: out.length, by, file }, null, 1));
for (const r of out) console.log([r.status, r.sku, r.base, r.tech, r.official_family || '', r.proposed_sku || '', r.proposed_slot || '',
  r.official ? `${r.official.thread}|${r.official.od_mm}|${r.official.height_mm}|${r.official.micron}` : ''].join(' ; '));
