#!/usr/bin/env node
// Writes official Fleetguard product dimensions to active HD SKUs whose canonical source is Fleetguard and whose
// codigo_base is that Fleetguard code. Source: fleetguard.com product pages rendered in the ELIMSERVER Chrome
// (out/fleetguard/fleetguard-capture-*.json: per code type, category, obsolete flag, specs "x inch / y mm", related parts).
//
// Guards: product type must agree with the SKU family (ET9 = "Fuel Filter Housing" in Fuel Processors, ES9 =
// "Fuel/Water Separator", EF9 = "Fuel Filter", ED4 = "Air Dryer"); otherwise the row is held as TYPE_MISMATCH.
// Only the metric value is used; 0 < mm < 3000. Mapping:
//   housings (ET9): Height|Overall Height -> height_mm, Overall Width -> product_width_mm, Overall Length -> product_length_mm
//   elements/spin-on/dryer: Largest Outside Diameter -> outer_diameter_mm, Height|Overall Height -> height_mm,
//     Inside Diameter, End 1 -> inner_diameter_mm, Gasket Outside/Inside Diameter -> gasket_od_mm/gasket_id_mm, Thread Size -> thread_size
// Previous different values are kept in enrichment_data.dimension_evidence.replaced.
// DRY RUN by default (ROLLBACK). Execute: --execute --confirm-count <written in the dry run>.
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, c, i, arr) => (c.startsWith('--') && a.push([c.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']), a), []));
const execute = args.execute === 'true';
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const mm = (v) => { const m = /([\d.]+)\s*mm\b/i.exec(String(v || '')); const n = m ? Number(m[1]) : null; return n > 0 && n < 3000 ? n : null; };
const cap = {};
for (const f of fs.readdirSync('out/fleetguard').filter((x) => /^fleetguard-capture-\d+\.json$/.test(x)).sort()) {
  const j = JSON.parse(fs.readFileSync(path.join('out/fleetguard', f), 'utf8'));
  for (const [k, v] of Object.entries(j.products)) cap[norm(k)] = { ...v, captured_at: j.captured_at, file: f };
}
const FAMILY = { ET9: (p) => p.type === 'Fuel Filter Housing' && /Fuel Processors/.test(p.category), ES9: (p) => /^Fuel\/Water Separator/.test(p.type),
  EF9: (p) => /^Fuel Filter(,|$)/.test(p.type), ED4: (p) => /^Air Dryer/.test(p.type) };
function dims(prefix, s) {
  const o = {};
  if (prefix === 'ET9') {
    o.height_mm = mm(s.Height) ?? mm(s['Overall Height']); o.product_width_mm = mm(s['Overall Width']); o.product_length_mm = mm(s['Overall Length']);
  } else {
    o.outer_diameter_mm = mm(s['Largest Outside Diameter']); o.height_mm = mm(s.Height) ?? mm(s['Overall Height']); // "Height" is the value already verified on these rows
    o.inner_diameter_mm = mm(s['Inside Diameter, End 1']); o.gasket_od_mm = mm(s['Gasket Outside Diameter']); o.gasket_id_mm = mm(s['Gasket Inside Diameter']);
    if (s['Thread Size']) o.thread_size = s['Thread Size'];
  }
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v != null));
}
const db = new pg.Client({ connectionString: process.env.CATALOG_DATABASE_URL });
if (!/@(127\.0\.0\.1|localhost)[:/]/.test(process.env.CATALOG_DATABASE_URL || '')) throw new Error('database is not local');
await db.connect();
const report = { mode: execute ? 'EXECUTE' : 'DRY_RUN_ROLLBACK', captured_codes: Object.keys(cap).length, written: [], held: [] };
try {
  await db.query('BEGIN');
  const cols = new Set((await db.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='elimfilters_catalog'`)).rows.map((r) => r.column_name));
  const { rows } = await db.query(`SELECT to_jsonb(c) - 'enrichment_data' AS row FROM public.elimfilters_catalog c WHERE catalog_active AND duty='HEAVY_DUTY'
    AND upper(coalesce(canonical_source_brand,''))='FLEETGUARD' ORDER BY sku`);
  for (const { row } of rows) {
    const p = cap[norm(row.codigo_base)]; const prefix = row.sku.slice(0, 3);
    if (!p) { report.held.push({ sku: row.sku, reason: 'NOT_CAPTURED' }); continue; }
    if (!FAMILY[prefix] || !FAMILY[prefix](p)) { report.held.push({ sku: row.sku, reason: 'TYPE_MISMATCH', type: p.type, category: p.category }); continue; }
    const vals = Object.fromEntries(Object.entries(dims(prefix, p.specs || {})).filter(([k]) => cols.has(k)));
    if (!Object.keys(vals).some((k) => k.endsWith('_mm'))) { report.held.push({ sku: row.sku, reason: 'NO_DIMENSIONS_PUBLISHED' }); continue; }
    const keys = Object.keys(vals);
    const replaced = Object.fromEntries(keys.filter((k) => row[k] != null && Number(row[k]) !== Number(vals[k]) && String(row[k]) !== String(vals[k])).map((k) => [k, row[k]]));
    const ev = { authority: 'FLEETGUARD_OFFICIAL_PRODUCT_PAGE', source_url: p.url, captured_at: p.captured_at, capture_file: p.file, product_type: p.type,
      category: p.category, obsolete: p.obsolete, replaced_by: (p.related || {})['Replaced By'] || undefined, values: vals, specs: p.specs,
      replaced: Object.keys(replaced).length ? replaced : undefined, recorded_at: new Date().toISOString() };
    const u = await db.query(`UPDATE public.elimfilters_catalog SET ${keys.map((k, i) => `${k}=$${i + 2}`).join(', ')},
        product_dimensions_source='OFFICIAL_FLEETGUARD_PRODUCT_PAGE', product_dimensions_validation_status='FULL_PRODUCT_DIMENSIONS_OFFICIAL',
        enrichment_data = jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{dimension_evidence}', $${keys.length + 2}::jsonb)
      WHERE sku=$1 AND catalog_active`, [row.sku, ...keys.map((k) => vals[k]), JSON.stringify(ev)]);
    if (u.rowCount !== 1) throw new Error('UPDATE_COUNT ' + row.sku);
    report.written.push({ sku: row.sku, code: row.codigo_base, values: vals, replaced, obsolete: p.obsolete || undefined });
  }
  if (execute && Number(args['confirm-count']) !== report.written.length) throw new Error(`--confirm-count must equal ${report.written.length}; nothing committed`);
  await db.query(execute ? 'COMMIT' : 'ROLLBACK'); report.transaction = execute ? 'COMMIT' : 'ROLLBACK';
} catch (e) { await db.query('ROLLBACK').catch(() => {}); report.transaction = 'ROLLBACK_ERROR'; report.error = e.message; process.exitCode = 1; }
finally { await db.end(); }
const out = path.resolve('out', 'fleetguard', `dimensions-${execute ? 'execute' : 'dryrun'}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(out, JSON.stringify(report, null, 1));
console.log(JSON.stringify({ mode: report.mode, written: report.written.length, with_replaced: report.written.filter((w) => Object.keys(w.replaced).length).length,
  held: report.held, sample: report.written.slice(0, 5).map((w) => `${w.sku} ${w.code} ${JSON.stringify(w.values)}`),
  replaced_sample: report.written.filter((w) => Object.keys(w.replaced).length).slice(0, 5).map((w) => `${w.sku} antes ${JSON.stringify(w.replaced)} ahora ${JSON.stringify(w.values)}`),
  transaction: report.transaction, error: report.error, file: out }, null, 1));
