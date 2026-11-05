#!/usr/bin/env node
// Builds a productos.json-compatible file from the Donaldson recapture done in the ELIMSERVER Chrome
// (out/donaldson-recapture/recapture-raw-*.json: search result per requested code + rendered product pages with
// their HTML tables). Output: out/donaldson-recapture/productos-recaptura.json, usable with --file by
// donaldson-local-reconcile.mjs and donaldson-local-dimensions.mjs. Also prints the catalogue state of every code
// (READ-ONLY): which SKUs carry it as codigo_base, and the Donaldson status (ACTIVE / REPLACED_BY / DISCONTINUED / NOT_FOUND).
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const dir = path.resolve('out', 'donaldson-recapture');
const raw = JSON.parse(fs.readFileSync(path.join(dir, fs.readdirSync(dir).filter((f) => /^recapture-raw-\d+\.json$/.test(f)).sort().pop()), 'utf8'));
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const records = []; const status = {};
for (const [code, s] of Object.entries(raw.search_results)) {
  const t = s.search || ''; const link = (s.links || [])[0] || '';
  const linked = (/\/product\/([A-Z0-9]+)\//.exec(link) || [])[1] || null;
  status[code] = /discontinued/i.test(t) ? { status: 'DISCONTINUED' } : /couldn't find any results/i.test(t) ? { status: 'NOT_FOUND' }
    : linked && norm(linked) === norm(code) ? { status: 'ACTIVE' } : linked ? { status: 'REPLACED_BY', by: linked } : { status: 'UNKNOWN' };
}
for (const [code, p] of Object.entries(raw.pages)) {
  const attributes = {}; let xref = []; let eq = [];
  for (const tb of p.tables || []) {
    const head = (tb[0] || []).join('|');
    if (/^Manufacturer Name\|Manufacturer Part/.test(head)) { xref = tb.slice(1).map((r) => r.filter((x) => x !== '')); continue; }
    if (/^Equipment\|Year\|Equipment Type/.test(head)) { eq = tb.slice(1).map((r) => r.slice(0, 6)); continue; }
    if (tb.every((r) => r.length === 2 && r[0] && !/Contact Us|Qty|Pieces|Name/.test(r[0]))) for (const [k, v] of tb) attributes[k] = v;
  }
  const L = p.text.split('\n').map((s) => s.trim()).filter(Boolean);
  const i = L.findIndex((x, k) => x === code && L[k + 1] && /[A-Z]{3,},/.test(L[k + 1]));
  records.push({ requested_code: code, status: p.ready && Object.keys(attributes).length ? 'EXTRAIDO' : 'ERROR', source_url: p.source_url, scraped_at: p.scraped_at,
    official: { part_number: code, description: i >= 0 ? L[i + 1] : '', attributes, cross_references_raw: xref, equipment_raw: eq, alternatives: [] },
    audit: { capture: 'Claude recapture in ELIMSERVER Chrome 2026-11-05', donaldson_status: status[code] || { status: 'REPLACEMENT_OF ' + Object.keys(status).find((k) => status[k].by === code) } } });
}
fs.writeFileSync(path.join(dir, 'productos-recaptura.json'), JSON.stringify(records, null, 1));
const db = new pg.Client({ connectionString: process.env.CATALOG_DATABASE_URL }); await db.connect(); await db.query('BEGIN READ ONLY');
const codes = [...new Set([...Object.keys(status), ...Object.values(status).map((s) => s.by).filter(Boolean)])];
const rows = (await db.query(`SELECT sku, codigo_base, catalog_active, technology, product_dimensions_validation_status d FROM public.elimfilters_catalog WHERE upper(codigo_base) = ANY($1) ORDER BY codigo_base`, [codes])).rows;
await db.query('ROLLBACK'); await db.end();
for (const c of Object.keys(status)) {
  const r = records.find((x) => x.requested_code === c) || records.find((x) => x.requested_code === status[c].by);
  const skus = rows.filter((x) => norm(x.codigo_base) === c).map((x) => `${x.sku}${x.catalog_active ? '' : '(inactive)'}`).join(',');
  const newSkus = status[c].by ? rows.filter((x) => norm(x.codigo_base) === norm(status[c].by)).map((x) => `${x.sku}${x.catalog_active ? '' : '(inactive)'}`).join(',') : '';
  console.log([c, status[c].status + (status[c].by ? ' ' + status[c].by : ''), 'catalog=' + (skus || '-'), status[c].by ? 'replacement_catalog=' + (newSkus || '-') : '',
    r ? `${r.official.description} | ${Object.entries(r.official.attributes).filter(([k]) => /Diameter|Length|Width|Height|Thread/.test(k)).map(([k, v]) => k + ':' + v).join('; ')}` : ''].join(' ; '));
}
console.log('records', records.length, 'file', path.join(dir, 'productos-recaptura.json'));
