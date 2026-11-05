#!/usr/bin/env node
// READ-ONLY plan for the ET9 scope rule (Victor, 2026-11-04): ET9/TURBOCORE = Racor turbine housings (FH/FG) and their
// replacement elements, plus Fleetguard fuel-processor housings. Any fuel/water separator (spin-on or cartridge) is
// ES9/HYDROCORE. P/S/T suffix letters are kept (S3209P/S/T -> ES93209P/S/T). One SKU per turbine housing.
//
// For every active ET9 row that is not a turbine element/housing (technology HYDROCORE, or Parker "Spin-on" page):
//   Donaldson evidence = official Donaldson product pages of the operator capture whose cross reference lists the Racor code.
//   MERGE      the Donaldson product already has an active SKU -> ET9 row is redundant (supersede into it)
//   NEW_DON    Donaldson makes it, no SKU yet -> ES9 + last four of the Donaldson code
//   RACOR_BASE no Donaldson evidence in the capture -> ES9 + last four of the Racor code + its P/S/T letter (needs
//              Fleetguard check before mint, per HD order Donaldson -> Fleetguard -> OEM)
//   REVIEW     several Donaldson products, or the target slot is taken by another product
// Usage: node scripts/hermes/et9-scope-plan.mjs --file <donaldson productos.json>
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, c, i, arr) => (c.startsWith('--') && a.push([c.slice(2), arr[i + 1]]), a), []));
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const last4 = (v) => String(v || '').replace(/\D/g, '').slice(-4).padStart(4, '0');
const don = JSON.parse(fs.readFileSync(args.file, 'utf8').replace(/^﻿/, '')).filter((r) => r.status === 'EXTRAIDO');
const racorX = new Map(); // racor code -> [donaldson records]
for (const r of don) for (const x of r.official.cross_references_raw || []) {
  if (/RACOR|PARKER/i.test(x[0])) { const k = norm(x[1]); (racorX.get(k) || racorX.set(k, []).get(k)).push(r); }
}
const parker = {};
for (const f of fs.readdirSync('out/racor').filter((x) => /^parker-racor-capture-\d+\.json$/.test(x))) {
  for (const [k, v] of Object.entries(JSON.parse(fs.readFileSync('out/racor/' + f, 'utf8')).products || {})) parker[norm(k.replace(/-EMED-1$/, ''))] ||= v;
}
const db = new pg.Client({ connectionString: process.env.CATALOG_DATABASE_URL });
await db.connect(); await db.query('BEGIN READ ONLY');
const cat = (await db.query(`SELECT sku, codigo_base, catalog_active, technology, filter_type FROM public.elimfilters_catalog`)).rows;
const sup = new Set((await db.query(`SELECT part_number FROM public.exact_part_reference WHERE reference_type='SUPERSEDED' AND brand='ELIMFILTERS'`)).rows.map((r) => r.part_number));
await db.query('ROLLBACK'); await db.end();
const bySku = new Map(cat.map((r) => [r.sku, r])); const byBase = new Map();
for (const r of cat.filter((r) => r.catalog_active)) (byBase.get(norm(r.codigo_base)) || byBase.set(norm(r.codigo_base), []).get(norm(r.codigo_base))).push(r);

const et9 = cat.filter((r) => r.catalog_active && r.sku.startsWith('ET9'));
const plan = []; const planned = new Map();
for (const r of et9) {
  const tech = String(r.technology || '').replace(/[^A-Z]/gi, '');
  const p = parker[norm(r.codigo_base)];
  const spin = p && /Spin-on/i.test(`${p.title} ${p.attrs['Product Series'] || ''}`) && !/Turbine/i.test(p.title);
  if (tech !== 'HYDROCORE' && !spin) continue; // turbine housings / elements / Fleetguard processors stay
  const row = { sku: r.sku, base: r.codigo_base, tech, parker: p ? (p.attrs['Product Series'] || p.title) : 'NOT_ON_PARKER_SITE' };
  const ev = racorX.get(norm(r.codigo_base)) || [];
  const evCodes = [...new Set(ev.map((e) => norm(e.official.part_number)))];
  row.donaldson = ev.map((e) => `${e.official.part_number} "${e.official.description}"`);
  const letter = (/[PST]$/.exec(norm(r.codigo_base)) || [''])[0];
  if (evCodes.length > 1) { plan.push({ ...row, action: 'REVIEW', why: 'SEVERAL_DONALDSON' }); continue; }
  if (evCodes.length === 1) {
    const dc = evCodes[0]; const existing = (byBase.get(dc) || []).filter((x) => x.sku !== r.sku);
    if (existing.length === 1) { plan.push({ ...row, action: 'MERGE', into: existing[0].sku, into_tech: String(existing[0].technology).replace(/[^A-Z]/gi, '') }); continue; }
    if (existing.length > 1) { plan.push({ ...row, action: 'REVIEW', why: 'DONALDSON_BASE_ON_SEVERAL_SKUS ' + existing.map((x) => x.sku) }); continue; }
    const to = 'ES9' + last4(dc);
    plan.push({ ...row, action: bySku.has(to) || sup.has(to) || planned.has(to) ? 'REVIEW' : 'NEW_DON', to, new_base: dc, why: bySku.has(to) ? 'SLOT_TAKEN ' + bySku.get(to).codigo_base : undefined });
    planned.set(to, r.sku); continue;
  }
  const to = 'ES9' + last4(r.codigo_base) + letter;
  const taken = bySku.has(to) ? bySku.get(to).codigo_base : sup.has(to) ? 'FORMER_SKU' : planned.has(to) ? 'IN_BATCH ' + planned.get(to) : null;
  plan.push({ ...row, action: taken ? 'REVIEW' : 'RACOR_BASE', to, why: taken ? 'SLOT_TAKEN ' + taken : undefined });
  planned.set(to, r.sku);
}
const file = path.resolve('out', 'racor', `et9-scope-plan-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(file, JSON.stringify(plan, null, 1));
console.log(JSON.stringify({ et9_active: et9.length, to_move: plan.length, by: plan.reduce((m, x) => (m[x.action] = (m[x.action] || 0) + 1, m), {}), file }));
for (const x of plan) console.log([x.action, x.sku, x.base, x.into || x.to || '', x.why || '', x.donaldson.join(' / '), x.parker].join(' ; '));
