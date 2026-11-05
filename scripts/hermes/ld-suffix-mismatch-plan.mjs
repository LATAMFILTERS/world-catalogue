#!/usr/bin/env node
// READ-ONLY plan for active LD SKUs whose number does not end in the last four digits of their codigo_base.
// Categories:
//   FORMAT_VARIANT   the base carries a manufacturer suffix that adds digits (C55(4), C911X-2, ...) and the digits of the
//                    core code (before "(", "-", "/", trailing letters+digits) DO match the SKU -> the SKU is right;
//                    record the core code as base? no: keep base, flag only (no renumbering).
//   RENUMBER_FREE    the base is a real code with other digits; target LD SKU = prefix + last four of the base is free
//   RENUMBER_TAKEN   same, but the target SKU exists (collision -> review)
//   BASE_NO_DIGITS   the base has fewer than 1 digit
// Output: out/audit/ld-suffix-plan-<ts>.json + summary.
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const l4 = (v) => String(v || '').replace(/\D/g, '').slice(-4).padStart(4, '0');
const core = (b) => String(b || '').toUpperCase().replace(/\s+/g, '').replace(/\(.*$/, '').replace(/[-/].*$/, '').replace(/^([A-Z]+\d+)[A-Z]+\d*$/, '$1');
const db = new pg.Client({ connectionString: process.env.CATALOG_DATABASE_URL });
await db.connect(); await db.query('BEGIN READ ONLY');
const rows = (await db.query(`SELECT sku, codigo_base, canonical_source_brand b, canonical_source_status s FROM public.elimfilters_catalog WHERE catalog_active AND duty='LIGHT_DUTY'`)).rows;
const all = new Set((await db.query(`SELECT sku FROM public.elimfilters_catalog`)).rows.map((r) => r.sku));
await db.query('ROLLBACK'); await db.end();
const plan = [];
for (const r of rows) {
  const skuDigits = r.sku.replace(/\D/g, '').slice(-4);
  if (!r.codigo_base || l4(r.codigo_base) === skuDigits) continue;
  const c = core(r.codigo_base);
  let cat; let target = null;
  if (!/\d/.test(r.codigo_base)) cat = 'BASE_NO_DIGITS';
  else if (c && /\d/.test(c) && l4(c) === skuDigits) cat = 'FORMAT_VARIANT';
  else { target = r.sku.slice(0, 3) + l4(r.codigo_base); cat = all.has(target) ? 'RENUMBER_TAKEN' : 'RENUMBER_FREE'; }
  plan.push({ sku: r.sku, base: r.codigo_base, core: c, brand: r.b, status: r.s, category: cat, target });
}
const dir = path.resolve('out', 'audit'); fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `ld-suffix-plan-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(file, JSON.stringify(plan, null, 1));
const by = plan.reduce((m, p) => { m[p.category] = (m[p.category] || 0) + 1; return m; }, {});
console.log(JSON.stringify({ total: plan.length, by, file }));
for (const k of Object.keys(by)) console.log(k, plan.filter((p) => p.category === k).slice(0, 12).map((p) => `${p.sku}=${p.base}${p.target ? '->' + p.target : ''}(${p.brand || '-'})`).join('  '));
