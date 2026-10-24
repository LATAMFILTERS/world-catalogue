#!/usr/bin/env node
// READ-ONLY PILOT · MANN-FILTER vehicle applications vs. current catalogue payload.
//
// Purpose: for ONE LD European SKU (base MANN), download the official MANN product
// page, parse its vehicle-application tables and compare them with the SKU's current
// vehicle_applications. Nothing is written to the database: the DB session is
// READ ONLY and always ends with ROLLBACK. Evidence/payload writes, if approved
// later, must go through lib/catalog-application-write-service.js
// (prepareVerifiedApplicationWrite), never through this script.
//
// Usage (Lenovo, from repo root):
//   CATALOG_DATABASE_URL=postgres://...@127.0.0.1:5432/catalogo_elimfilters \
//   node scripts/hermes/mann-vehicle-application-pilot.mjs \
//     --sku EL30816 --mann "HU 816 x" \
//     [--url https://www.mann-filter.com/us-es/catalogo/resultados-de-la-busqueda/producto.html/hu816x_mann-filter.html] \
//     [--out out/mann-pilot] [--html saved-page.html]
//
// --html lets you parse a page saved from the browser (Ctrl+S) if MANN blocks the fetch.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import pg from 'pg';

const require = createRequire(import.meta.url);
const { verifyProductIdentity, normalizePart } = require('../../lib/mann-official-spec-verifier.js');
const { normalizedApplication, applicationPayloadHash } = require('../../lib/catalog-application-governance.js');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, cur, i, arr) => {
  if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return acc;
}, []));

const sku = String(args.sku || '').trim().toUpperCase();
const mannCode = String(args.mann || '').trim();
if (!sku || !mannCode) throw new Error('--sku and --mann are required');
const slug = mannCode.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9/()]/g, '');
const url = args.url || `https://www.mann-filter.com/us-es/catalogo/resultados-de-la-busqueda/producto.html/${slug}_mann-filter.html`;
const outDir = path.resolve(args.out || `out/mann-pilot/${sku}`);
fs.mkdirSync(outDir, { recursive: true });

// ---------- 1. Official page ----------
let html;
let finalUrl = url;
let httpStatus = null;
if (args.html) {
  html = fs.readFileSync(args.html, 'utf8');
} else {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; ELIMFILTERS-MANN-Spec-Verifier/1.0; +https://elimfilters.com)',
      'accept-language': 'es-US,es;q=0.9,en;q=0.8',
    },
  });
  httpStatus = res.status;
  finalUrl = res.url || url;
  html = await res.text();
  if (!res.ok) throw new Error(`MANN HTTP ${res.status} for ${url}`);
}
const pageSha256 = crypto.createHash('sha256').update(html).digest('hex');
fs.writeFileSync(path.join(outDir, 'mann-page.html'), html);

const identity = verifyProductIdentity(html, mannCode);
if (!identity.valid) throw new Error(`IDENTITY_MISMATCH: page title "${identity.title}" does not match ${mannCode}`);

// ---------- 2. Parse headings + table rows in document order ----------
const decode = (s) => String(s || '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'")
  .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
  .replace(/\s+/g, ' ').trim();

const body = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
const events = [];
const tokenRe = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>|<tr[^>]*>([\s\S]*?)<\/tr>/gi;
for (let m; (m = tokenRe.exec(body));) {
  if (m[1] !== undefined) {
    events.push({ kind: 'heading', text: decode(m[1]) });
  } else {
    const cells = [...m[2].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => ({
      text: decode(c[1]),
      link: decode((c[1].match(/<a[^>]*>([\s\S]*?)<\/a>/i) || [])[1] || ''),
    }));
    events.push({ kind: 'row', cells });
  }
}

// "528i (4 L 2.0L FI Turbo 01/12-) for aluminium oil filter module" ->
// model / engine / fitment qualifier. The qualifier is a fitment condition and must be kept.
const splitModel = (text) => {
  const t = String(text || '').trim();
  const m = /^(.*?)\s*\(([^)]*)\)\s*(.*)$/.exec(t);
  return m ? { model: m[1].trim(), engine: m[2].trim(), qualifier: m[3].trim() } : { model: t, engine: '', qualifier: '' };
};
const isYear = (t) => /^(19|20)\d{2}$/.test(t);
const num = (t) => { const m = /\d+(?:[.,]\d+)?/.exec(String(t || '')); return m ? Number(m[0].replace(',', '.')) : null; };
const anomalies = [];
const parsed = [];
let make = null;
let year = null;
for (const ev of events) {
  if (ev.kind === 'heading') {
    if (isYear(ev.text)) year = ev.text; else if (ev.text) make = ev.text;
    continue;
  }
  const c = ev.cells;
  if (c.length < 6) continue;                                   // key/value duplicate blocks have 2 cells
  if (!/filtr|filter/i.test(c[1]?.text || '')) continue;          // header rows and unrelated tables
  if (/^(tipo de (modelo|filtro)|model type|filter type)$/i.test(c[0].text) || /^tipo de filtro$|^filter type$/i.test(c[1].text)) continue; // header row
  const split = splitModel(c[0].text);
  const model = c[0].link || split.model;
  const engineDescription = split.engine;
  let kw = num(c[4]?.text);
  let hp = num(c[5]?.text);
  if (kw != null && kw > 1000) { anomalies.push({ year, model, field: 'kW', value: kw }); kw = null; }
  if (hp != null && hp > 1500) { anomalies.push({ year, model, field: 'CV', value: hp }); hp = null; }
  parsed.push({
    make, year, model,
    engine: engineDescription,
    equipment_options: split.qualifier || null,
    engine_code: c[2]?.text && c[2].text !== '-' ? c[2].text : null,
    displacement_ccm: num(c[3]?.text),
    kw, hp,
    filter_type: c[1].text,
    production_text: c[6]?.text || null,
  });
}

const seen = new Set();
const mann = parsed.filter((r) => { const k = JSON.stringify(r); if (seen.has(k)) return false; seen.add(k); return true; });
fs.writeFileSync(path.join(outDir, 'mann-applications.json'), JSON.stringify(mann, null, 2));

// ---------- 3. Current catalogue payload (READ ONLY) ----------
const dbUrl = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
if (!dbUrl) throw new Error('CATALOG_DATABASE_URL is required');
const db = new pg.Client({ connectionString: dbUrl });
await db.connect();
let row;
let evidence;
try {
  await db.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
  ({ rows: [row] } = await db.query(
    `SELECT sku, duty, codigo_base, vehicle_applications, md5(vehicle_applications::text) AS vehicle_db_hash
       FROM public.elimfilters_catalog WHERE sku = $1`, [sku]));
  ({ rows: evidence } = await db.query(
    `SELECT application_kind, verified, source_url, evidence_hash, payload_hash, evidence_authority
       FROM public.catalog_application_evidence WHERE sku = $1`, [sku]));
} finally {
  await db.query('ROLLBACK').catch(() => {});
  await db.end();
}
if (!row) throw new Error(`SKU not found: ${sku}`);
const current = Array.isArray(row.vehicle_applications) ? row.vehicle_applications : [];
fs.writeFileSync(path.join(outDir, 'current-vehicle-applications.json'), JSON.stringify(current, null, 2));

// ---------- 4. Compare on make + model + year (+ engine code) ----------
// Legacy rows pack "YEAR MODEL (ENGINE)" into `model` with no year field
// (e.g. "2018 640i Gran Coupe (6 cyl. 3.0L FI Turbo 24V)"). Unpack before comparing.
const norm = (s) => normalizePart(s);
const formats = { year_in_model: 0, year_in_model_family: 0, year_field: 0, year_range: 0, no_year: 0 };
const currentParts = (e) => {
  const n = normalizedApplication(e) || {};
  let text = n.model || String(e.model_type || '').trim();
  let year = n.year;
  const fam = String(e.model_family || '').trim();
  if (year) formats.year_field++;
  else if (/^(?:19|20)\d{2}$/.test(fam)) { year = fam; formats.year_in_model_family++; }
  else {
    const m = /^((?:19|20)\d{2})\s+(.+)$/.exec(text);
    if (m) { year = m[1]; text = m[2]; formats.year_in_model++; }
    else if (String(e.year_range || '').trim()) { year = `RANGE:${String(e.year_range).trim()}`; formats.year_range++; }
    else formats.no_year++;
  }
  const sp = splitModel(text);
  return { make: n.make, year, model: sp.model, engine: sp.engine, qualifier: sp.qualifier, engine_code: String(e.engine_code || '').trim() };
};
const keyCur = (p) => [norm(p.make), norm(p.model), p.year, norm(p.qualifier)].join('|');
const keyMann = (r) => [norm(r.make), norm(r.model), r.year, norm(r.equipment_options)].join('|');
const curParsed = current.map(currentParts);
const curKeys = new Map();
for (const p of curParsed) { const k = keyCur(p); if (!curKeys.has(k)) curKeys.set(k, p); }
const mannKeys = new Map(mann.map((r) => [keyMann(r), r]));
const matched = [...mannKeys.keys()].filter((k) => curKeys.has(k));
const onlyMann = [...mannKeys.keys()].filter((k) => !curKeys.has(k));
const onlyCurrent = [...curKeys.keys()].filter((k) => !mannKeys.has(k));
const engineCodeMismatch = matched.filter((k) => norm(mannKeys.get(k).engine_code) !== norm(curKeys.get(k).engine_code))
  .map((k) => ({ key: k, mann: mannKeys.get(k).engine_code, current: curKeys.get(k).engine_code }));
const currentDuplicateRows = current.length - curKeys.size;

const report = {
  generated_at: new Date().toISOString(),
  mode: 'READ_ONLY_PILOT_NO_WRITES',
  sku, duty: row.duty, codigo_base: row.codigo_base, mann_code: mannCode,
  source: { url: finalUrl, http_status: httpStatus, page_sha256: pageSha256, title: identity.title },
  counts: {
    mann_rows_raw: parsed.length,
    mann_rows_dedup: mann.length,
    current_rows: current.length,
    matched_make_model_year: matched.length,
    only_in_mann: onlyMann.length,
    only_in_current: onlyCurrent.length,
    current_distinct_keys: curKeys.size,
    current_duplicate_rows: currentDuplicateRows,
    matched_engine_code_mismatch: engineCodeMismatch.length,
  },
  current_year_formats: formats,
  engine_code_mismatch_sample: engineCodeMismatch.slice(0, 20),
  mann_makes: [...new Set(mann.map((r) => r.make))],
  mann_years: [...new Set(mann.map((r) => r.year))].sort(),
  kw_hp_anomalies_set_to_null: anomalies,
  current_sample: current.slice(0, 3),
  current_payload_hash_normalized: applicationPayloadHash(current),
  current_vehicle_db_hash: row.vehicle_db_hash,
  existing_evidence: evidence,
  only_in_mann_sample: onlyMann.slice(0, 20),
  only_in_current_sample: onlyCurrent.slice(0, 20),
};
fs.writeFileSync(path.join(outDir, 'comparison.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, only_in_mann_sample: undefined, only_in_current_sample: undefined, current_sample: undefined }, null, 2));
console.log(`\nFiles: ${outDir}`);
if (!mann.length) {
  console.error('WARNING: 0 MANN rows parsed. Inspect mann-page.html; applications may load dynamically or the table markup differs.');
  process.exitCode = 2;
}
