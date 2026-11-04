#!/usr/bin/env node
// Writes official Donaldson product dimensions to HD SKUs whose verified canonical base is that Donaldson code.
// Source: the operator's local capture of shop.donaldson.com product pages (donaldson-local/resultados/productos.json,
// 2026-11-02): per record requested_code, status, source_url, scraped_at and official.attributes such as
// "Outer Diameter": "4.21 inch (107 mm)". Only the metric value in parentheses is used.
//
// Guards: record status EXTRAIDO; official.part_number == requested_code == SKU codigo_base (normalized); source_url on
// shop.donaldson.com for that part; SKU active HEAVY_DUTY with canonical source DONALDSON VERIFIED/EXCEPTION_CONFIRMED;
// dimensions not already verified; every value numeric and 0 < mm < 3000.
// Mapping: Outer Diameter -> outer_diameter_mm, Inner Diameter -> inner_diameter_mm, Width -> product_width_mm,
// Height -> height_mm, Length -> height_mm for round/spin-on parts (no Width) or product_length_mm when Width exists
// (panels), Thread Size -> thread_size, Gasket OD/ID -> gasket_od_mm/gasket_id_mm. Other labels stay in the evidence.
// Previous unverified values are replaced (same rule approved for MANN, 2026-10-24) and kept in
// enrichment_data.dimension_evidence.replaced.
//
// DRY RUN by default (ROLLBACK). Execute: --file <productos.json> --execute --confirm-count <written in the dry run>.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import pg from 'pg';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, cur, i, arr) => {
  if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return acc;
}, []));
if (!args.file) throw new Error('--file <donaldson-local/resultados/productos.json> is required');
const execute = args.execute === 'true';
const rawText = fs.readFileSync(args.file, 'utf8').replace(/^﻿/, '');
const fileSha = crypto.createHash('sha256').update(rawText).digest('hex');
const records = JSON.parse(rawText);
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const mm = (v) => { const m = /\(\s*([\d.]+)\s*mm\s*\)/i.exec(String(v || '')); return m ? Number(m[1]) : null; };

const byCode = new Map(); const labelCount = {}; const unusable = {};
for (const r of records) {
  const code = norm(r.requested_code);
  const o = r.official || {};
  const why = r.status !== 'EXTRAIDO' ? `STATUS_${r.status}` : norm(o.part_number) !== code ? 'PART_NUMBER_MISMATCH'
    : !new RegExp(`^https://shop\\.donaldson\\.com/store/[a-z-]+/product/${code}/`, 'i').test(String(r.source_url || '')) ? 'SOURCE_URL_NOT_OFFICIAL' : null;
  if (why) { unusable[why] = (unusable[why] || 0) + 1; continue; }
  for (const k of Object.keys(o.attributes || {})) labelCount[k] = (labelCount[k] || 0) + 1;
  byCode.set(code, r);
}

function dimsFrom(a) {
  const out = {};
  const set = (col, label) => { const v = mm(a[label]); if (v != null && v > 0 && v < 3000) out[col] = v; };
  set('outer_diameter_mm', 'Outer Diameter');
  set('inner_diameter_mm', 'Inner Diameter');
  set('product_width_mm', 'Width');
  set('height_mm', 'Height');
  if (a.Length != null) { if (a.Width != null) set('product_length_mm', 'Length'); else if (out.height_mm == null) set('height_mm', 'Length'); else set('product_length_mm', 'Length'); }
  set('gasket_od_mm', 'Gasket OD'); set('gasket_id_mm', 'Gasket ID');
  if (a['Thread Size']) out.thread_size = String(a['Thread Size']).trim();
  return out;
}

const url = process.env.CATALOG_DATABASE_URL;
if (!url) throw new Error('CATALOG_DATABASE_URL is required');
if (!/@(127\.0\.0\.1|localhost)[:/]/.test(url)) throw new Error('database is not local');
const db = new pg.Client({ connectionString: url });
await db.connect();
const report = { mode: execute ? 'EXECUTE' : 'DRY_RUN_ROLLBACK', file: args.file, file_sha256: fileSha, records: records.length,
  usable_records: byCode.size, unusable_records: unusable, written: [], held: [] };
try {
  await db.query('BEGIN');
  const { rows: colRows } = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='elimfilters_catalog'`);
  const columns = new Set(colRows.map((r) => r.column_name));
  const { rows: targets } = await db.query(`SELECT to_jsonb(c) AS row FROM public.elimfilters_catalog c
    WHERE c.catalog_active AND c.duty='HEAVY_DUTY' AND upper(c.canonical_source_brand)='DONALDSON'
      AND upper(coalesce(c.canonical_source_status,'')) IN ('VERIFIED','EXCEPTION_CONFIRMED')
      AND upper(coalesce(c.product_dimensions_validation_status,'')) NOT IN ('VERIFIED','FULL_PRODUCT_DIMENSIONS_OFFICIAL') ORDER BY c.sku`);
  report.targets = targets.length;
  for (const { row } of targets) {
    const rec = byCode.get(norm(row.codigo_base));
    if (!rec) { report.held.push({ sku: row.sku, reason: 'NOT_IN_LOCAL_CAPTURE' }); continue; }
    const vals = Object.fromEntries(Object.entries(dimsFrom(rec.official.attributes || {})).filter(([k]) => columns.has(k)));
    if (!Object.keys(vals).some((k) => k.endsWith('_mm'))) { report.held.push({ sku: row.sku, code: rec.requested_code, reason: 'NO_DIMENSIONS_PUBLISHED' }); continue; }
    const keys = Object.keys(vals);
    const replaced = Object.fromEntries(keys.filter((k) => row[k] != null && String(row[k]) !== String(vals[k]) && Number(row[k]) !== Number(vals[k])).map((k) => [k, row[k]]));
    const evidence = { authority: 'DONALDSON_OFFICIAL_PRODUCT_PAGE', source_url: rec.source_url, scraped_at: rec.scraped_at, part_number: rec.official.part_number,
      description: rec.official.description || null, values: vals, attributes: rec.official.attributes, replaced: Object.keys(replaced).length ? replaced : undefined,
      capture_file_sha256: fileSha, capture: 'operator local capture donaldson-local 2026-11-02', recorded_at: new Date().toISOString() };
    const u = await db.query(`UPDATE public.elimfilters_catalog SET ${keys.map((k, i) => `${k}=$${i + 2}`).join(', ')},
        product_dimensions_source='OFFICIAL_DONALDSON_PRODUCT_PAGE', product_dimensions_validation_status='FULL_PRODUCT_DIMENSIONS_OFFICIAL',
        enrichment_data = jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{dimension_evidence}', $${keys.length + 2}::jsonb)
      WHERE sku=$1 AND catalog_active`, [row.sku, ...keys.map((k) => vals[k]), JSON.stringify(evidence)]);
    if (u.rowCount !== 1) throw new Error(`UPDATE_COUNT ${row.sku}`);
    report.written.push({ sku: row.sku, code: rec.requested_code, values: vals, replaced });
  }
  if (execute && Number(args['confirm-count']) !== report.written.length) {
    throw new Error(`--confirm-count must equal the dry-run written count (${report.written.length}); nothing committed`);
  }
  await db.query(execute ? 'COMMIT' : 'ROLLBACK');
  report.transaction = execute ? 'COMMIT' : 'ROLLBACK';
} catch (e) {
  await db.query('ROLLBACK').catch(() => {});
  report.transaction = 'ROLLBACK_ERROR'; report.error = e.message; process.exitCode = 1;
} finally { await db.end(); }
const outDir = path.resolve('out', 'donaldson-dimensions'); fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `dimensions-${execute ? 'execute' : 'dryrun'}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(out, JSON.stringify(report, null, 2));
const reasons = report.held.reduce((m, h) => { m[h.reason] = (m[h.reason] || 0) + 1; return m; }, {});
console.log(JSON.stringify({ mode: report.mode, records: report.records, usable_records: report.usable_records, unusable: report.unusable_records,
  targets: report.targets, written: report.written.length, with_replaced_values: report.written.filter((w) => Object.keys(w.replaced).length).length,
  by_prefix: report.written.reduce((m, w) => { const p = w.sku.slice(0, 3); m[p] = (m[p] || 0) + 1; return m; }, {}),
  held: report.held.length, held_reasons: reasons,
  sample: report.written.slice(0, 6).map((w) => `${w.sku} ${w.code} ${JSON.stringify(w.values)}`),
  replaced_sample: report.written.filter((w) => Object.keys(w.replaced).length).slice(0, 5).map((w) => `${w.sku} antes ${JSON.stringify(w.replaced)} ahora ${JSON.stringify(w.values)}`),
  top_labels: Object.entries(labelCount).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => `${k}:${v}`).join(', '),
  transaction: report.transaction, error: report.error, file: out }, null, 2));
