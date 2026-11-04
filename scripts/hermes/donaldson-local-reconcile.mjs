#!/usr/bin/env node
// READ-ONLY reconciliation of the operator's local Donaldson capture (donaldson-local/resultados/productos.json) against
// the catalogue. Nothing is written to the database.
//
// Per Donaldson code (status EXTRAIDO, part_number == requested code, official shop URL):
//   PRESENT_OK          an active HD SKU has it as codigo_base and the SKU family matches the Donaldson description
//   PRESENT_FAMILY_CONFLICT  an active SKU has it as codigo_base but its prefix contradicts the Donaldson product type
//   INACTIVE_ONLY       only inactive SKUs carry it as codigo_base
//   REFERENCED_ONLY     not a base, but listed as a cross reference of an active SKU (another base brand)
//   MISSING             not in the catalogue at all -> proposed new SKU: HD prefix of the product type + last four digits
//                       of the Donaldson code (policy: HD base Donaldson). Proposal states: FREE | SLOT_TAKEN (collision ->
//                       Fleetguard cross / STOP_REVIEW per policy) | TYPE_REVIEW (description not mapped to a family)
// Product type from the Donaldson description (doctrine: water separator wording -> ES9, never EF9).
//
// Usage: node scripts/hermes/donaldson-local-reconcile.mjs --file <productos.json>

import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, cur, i, arr) => {
  if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return acc;
}, []));
if (!args.file) throw new Error('--file <productos.json> is required');
const records = JSON.parse(fs.readFileSync(args.file, 'utf8').replace(/^﻿/, ''));
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const last4 = (v) => String(v || '').replace(/\D/g, '').slice(-4).padStart(4, '0');

// Donaldson description -> HD family prefix (CLAUDE.md prefix system). Order matters.
function familyOf(desc) {
  const d = String(desc || '').toUpperCase();
  if (/WATER SEPARATOR|FUEL\/WATER|FUEL WATER/.test(d)) return 'ES9';
  if (/CABIN|VENTILATION/.test(d)) return 'EC1'; // Donaldson "AIR FILTER, PANEL/ROUND VENTILATION" = cab ventilation
  if (/AIR DRYER/.test(d)) return 'ED4';
  if (/COOLANT/.test(d)) return 'EW7';
  if (/HYDRAULIC/.test(d)) return 'EH6';
  if (/\bLUBE\b|\bOIL\b/.test(d)) return 'EL8';
  if (/\bFUEL\b/.test(d)) return 'EF9';
  if (/AIR CLEANER|HOUSING|PRECLEANER|ASSEMBLY/.test(d) && /AIR/.test(d)) return 'EA2';
  if (/AIR FILTER|\bAIR\b.*(PRIMARY|SAFETY|PANEL|ELEMENT)/.test(d)) return 'EA1';
  return null;
}

const url = process.env.CATALOG_DATABASE_URL;
if (!url) throw new Error('CATALOG_DATABASE_URL is required');
const db = new pg.Client({ connectionString: url });
await db.connect();
let cat, refs;
try {
  await db.query('BEGIN READ ONLY');
  ({ rows: cat } = await db.query(`SELECT sku, codigo_base, catalog_active, duty, technology, filter_type, canonical_source_brand,
      competitor_codes, oem_codes FROM public.elimfilters_catalog`));
  ({ rows: refs } = await db.query(`SELECT upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g')) n, sku, brand, reference_type FROM public.exact_part_reference`));
} finally { await db.query('ROLLBACK').catch(() => {}); await db.end(); }

const baseActive = new Map(); const baseInactive = new Map(); const skuSet = new Set(cat.map((r) => r.sku)); const altRef = new Map();
for (const r of cat) {
  const b = norm(r.codigo_base);
  if (b) (r.catalog_active ? baseActive : baseInactive).set(b, [...((r.catalog_active ? baseActive : baseInactive).get(b) || []), r]);
  if (r.catalog_active) for (const e of [...(r.competitor_codes || []), ...(r.oem_codes || [])]) {
    const c = norm(e && typeof e === 'object' ? e.code || e.part_number || e.reference : e);
    if (c) altRef.set(c, [...(altRef.get(c) || []), r.sku]);
  }
}
for (const x of refs) altRef.set(x.n, [...(altRef.get(x.n) || []), x.sku]);

const rows = []; const unusable = {};
for (const rec of records) {
  const code = norm(rec.requested_code); const o = rec.official || {};
  if (rec.status !== 'EXTRAIDO' || norm(o.part_number) !== code) { unusable[rec.status] = (unusable[rec.status] || 0) + 1; rows.push({ code, cls: `UNUSABLE_${rec.status}` }); continue; }
  const fam = familyOf(o.description);
  const row = { code, description: o.description, family: fam, url: rec.source_url };
  const act = baseActive.get(code) || [];
  if (act.length) {
    row.skus = act.map((r) => r.sku);
    const bad = act.filter((r) => fam && !r.sku.startsWith(fam) && !(fam === 'EA1' && r.sku.startsWith('EA2')) && !(fam === 'EA2' && r.sku.startsWith('EA1')));
    row.cls = bad.length ? 'PRESENT_FAMILY_CONFLICT' : 'PRESENT_OK';
    if (bad.length) row.conflict = bad.map((r) => `${r.sku}(${r.duty},${String(r.technology || '').replace(/[^A-Z]/gi, '')})`);
    if (act.some((r) => r.duty !== 'HEAVY_DUTY')) row.note = 'BASE_ON_NON_HD_SKU';
  } else if ((baseInactive.get(code) || []).length) {
    row.cls = 'INACTIVE_ONLY'; row.skus = baseInactive.get(code).map((r) => r.sku);
  } else if (altRef.has(code)) {
    row.cls = 'REFERENCED_ONLY'; row.skus = [...new Set(altRef.get(code))].slice(0, 5);
  } else {
    row.cls = 'MISSING';
    if (!fam) row.proposal = 'TYPE_REVIEW';
    else { const sku = `${fam}${last4(code)}`; row.proposed_sku = sku; row.proposal = skuSet.has(sku) ? 'SLOT_TAKEN' : 'FREE'; }
  }
  rows.push(row);
}
// Two missing codes proposing the same new SKU -> both need review.
const proposedCount = rows.filter((r) => r.proposal === 'FREE').reduce((m, r) => { m[r.proposed_sku] = (m[r.proposed_sku] || 0) + 1; return m; }, {});
for (const r of rows) if (r.proposal === 'FREE' && proposedCount[r.proposed_sku] > 1) r.proposal = 'SLOT_SHARED_IN_BATCH';

const outDir = path.resolve('out', 'donaldson-reconcile'); fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `reconcile-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(out, JSON.stringify({ file: args.file, generated_at: new Date().toISOString(), rows }, null, 2));
const by = (f) => rows.reduce((m, r) => { const k = f(r); if (k) m[k] = (m[k] || 0) + 1; return m; }, {});
const sample = (pred, n = 5) => rows.filter(pred).slice(0, n).map((r) => `${r.code} "${r.description}" -> ${r.skus || r.proposed_sku || ''} ${r.conflict || ''} ${r.proposal || ''}`.trim());
console.log(JSON.stringify({ codes: rows.length, classes: by((r) => r.cls),
  missing_proposals: by((r) => r.cls === 'MISSING' && `${r.proposal}${r.family ? ' ' + r.family : ''}`),
  unmapped_descriptions: by((r) => r.cls === 'MISSING' && !r.family && r.description),
  samples: { PRESENT_FAMILY_CONFLICT: sample((r) => r.cls === 'PRESENT_FAMILY_CONFLICT', 8), INACTIVE_ONLY: sample((r) => r.cls === 'INACTIVE_ONLY'),
    REFERENCED_ONLY: sample((r) => r.cls === 'REFERENCED_ONLY'), MISSING_FREE: sample((r) => r.proposal === 'FREE', 8), SLOT_TAKEN: sample((r) => r.proposal === 'SLOT_TAKEN') },
  file: out }, null, 2));
