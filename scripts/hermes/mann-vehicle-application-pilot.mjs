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
      // Global (/en/) pages carry the structured vehicle record in the link's
      // data-g-binding-params (vehicleMake, vehicleModel, vehicleName, engineCode,
      // ccm, kw, bhp, vehicleManufacturedFrom/To).
      params: (() => {
        const raw = (c[1].match(/data-g-binding-params="([^"]*)"/i) || [])[1];
        if (!raw) return null;
        try { return Object.fromEntries(new URLSearchParams(decodeURIComponent(raw.replace(/&amp;/g, '&')).replace(/^\?/, ''))); } catch { return null; }
      })(),
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
    // US pages: MAKE heading -> YEAR headings. Global pages: MAKE -> MODEL headings.
    if (isYear(ev.text)) year = ev.text; else if (ev.text) { make = ev.text; year = null; }
    continue;
  }
  const c = ev.cells;
  if (c.length < 6) continue;                                   // key/value duplicate blocks have 2 cells
  if (!/filtr|filter/i.test(c[1]?.text || '')) continue;          // header rows and unrelated tables
  if (/^(tipo de (modelo|filtro)|model type|filter type)$/i.test(c[0].text) || /^tipo de filtro$|^filter type$/i.test(c[1].text)) continue; // header row
  const split = splitModel(c[0].text);
  const pr = c[0].params;
  if (!year && pr && pr.vehicleMake) {
    // Global page row: take identity from the structured record, never from headings.
    const yf = /^(\d{4})-/.exec(pr.vehicleManufacturedFrom || '');
    const yt = /^(\d{4})-/.exec(pr.vehicleManufacturedTo || '');
    parsed.push({
      make: pr.vehicleMake,
      year: null,
      // 1900-01-01 / 9999-12-31 are MANN placeholders for "no published period".
      year_from: yf && yf[1] !== '1900' ? yf[1] : null,
      year_to: yt && yt[1] !== '9999' ? yt[1] : null,
      model: [pr.vehicleModel || pr.modelSeriesName, pr.vehicleName].filter(Boolean).join(' ').trim(),
      engine: split.engine,
      equipment_options: split.qualifier || null,
      engine_code: pr.engineCode || (c[2]?.text !== '-' ? c[2]?.text : null) || null,
      displacement_ccm: num(pr.ccm) ?? num(c[3]?.text),
      kw: (() => { const v = num(pr.kw); return v != null && v > 1000 ? null : v; })(),
      hp: (() => { const v = num(pr.bhp); return v != null && v > 1500 ? null : v; })(),
      filter_type: c[1].text,
      production_text: c[6]?.text || null,
    });
    continue;
  }
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

// ---------- OE numbers tab (independent identity evidence) ----------
// Slice from the "OE Numbers" accordion header to the next section (Downloads / Legal), take the
// manufacturer from the last heading and every part-number-like token from cells / list items.
const oeNumbers = [];
{
  // The section is the accordion item with id="oeNumbers" (the earlier "OE Numbers" text is only a nav link).
  let start = body.search(/id="oeNumbers"/i);
  if (start < 0) start = body.search(/<span[^>]*cmp-accordion__title[^>]*>\s*(?:OE Numbers|N[uú]meros de equipo original)/i);
  if (start >= 0) {
    const rest = body.slice(start);
    const endRel = rest.slice(20).search(/id="(?:downloads|reachInformation)"/i);
    const oe = endRel >= 0 ? rest.slice(0, endRel + 20) : rest.slice(0, 200000);
    let maker = null;
    const re = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>|<(?:td|li|span|a|p|div)[^>]*>([^<]{1,300})<\/(?:td|li|span|a|p|div)>/gi;
    for (let m; (m = re.exec(oe));) {
      if (m[1] !== undefined) { const h = decode(m[1]); if (h && !/OE Numbers|equipo original/i.test(h)) maker = h; continue; }
      for (const piece of decode(m[2]).split(/[,;]\s*/)) {
        const t = piece.trim();
        if (/\d/.test(t) && /^[A-Z0-9][A-Z0-9 .\-\/]{2,40}$/i.test(t) && !/^(?:OE|MANN)/i.test(t)) oeNumbers.push({ manufacturer: maker, code: t });
      }
    }
  }
}
fs.writeFileSync(path.join(outDir, 'mann-oe-numbers.json'), JSON.stringify(oeNumbers, null, 2));
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
    `SELECT sku, duty, codigo_base, vehicle_applications, oem_codes, md5(vehicle_applications::text) AS vehicle_db_hash
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
  // Full vehicle text: legacy machinery rows split it as model_family ("2000-Serie")
  // + model_type ("2000 (-> 12999)"); global MANN rows carry vehicleModel + vehicleName.
  const full = [/^(?:19|20)\d{2}$/.test(fam) ? '' : fam, String(e.model_type || n.model || '').trim()].filter(Boolean).join(' ');
  return { make: n.make, year, model: sp.model, engine: sp.engine, qualifier: sp.qualifier, full, engine_code: String(e.engine_code || '').trim() };
};
// Global pages publish production periods, not model years: compare without year there.
const yearAgnostic = mann.length > 0 && mann.every((r) => !r.year);
const noParens = (t) => String(t || '').replace(/\([^)]*\)/g, ' ');
const keyCur = (p) => yearAgnostic
  ? [norm(p.make), norm(noParens(p.full))].join('|')
  : [norm(p.make), norm(p.model), p.year, norm(p.qualifier)].join('|');
const keyMann = (r) => yearAgnostic
  ? [norm(r.make), norm(noParens([r.model, r.equipment_options].filter(Boolean).join(' ')))].join('|')
  : [norm(r.make), norm(r.model), r.year, norm(r.equipment_options)].join('|');
const curParsed = current.map(currentParts);
const curKeys = new Map();
for (const p of curParsed) { const k = keyCur(p); if (!curKeys.has(k)) curKeys.set(k, p); }
const mannKeys = new Map(mann.map((r) => [keyMann(r), r]));
const matched = [...mannKeys.keys()].filter((k) => curKeys.has(k));
const onlyMann = [...mannKeys.keys()].filter((k) => !curKeys.has(k));
const onlyCurrent = [...curKeys.keys()].filter((k) => !mannKeys.has(k));
// Engine-code comparison: only a TRUE conflict blocks. Benign differences:
//   EMPTY        one side has no engine code (nothing contradicts)
//   CONTAINS     one code contains the other (B58B30M0 vs B58B30)
//   LIST_OVERLAP MANN lists several codes ("D14A2, A6, A8") and one matches
// Engine text cleanup before comparing: manufacturer names written in front of the code and the
// emission-standard label (Tier 3B vs Stage IIIB vs Euro 4 / EEV) do not identify a different engine.
const ENGINE_MAKERS = /\b(?:CUMMINS|JOHN\s+DEERE|DEUTZ|CATERPILLAR|CAT|PERKINS|IVECO|FPT|MAN|DAF|VOLVO|MERCEDES(?:-BENZ)?|MB|DETROIT(?:\s+DIESEL)?|KOMATSU|KUBOTA|YANMAR|ISUZU|HINO|SCANIA|LIEBHERR|NAVISTAR|INTERNATIONAL|MITSUBISHI|TOYOTA|NISSAN|HYUNDAI|DOOSAN|MTU|AGCO(?:\s+POWER)?|SISU)\b/gi;
const EMISSION = /\b(?:TIER\s*[0-9IV]+[A-Z]?|STAGE\s*[0-9IV]+[A-Z]?|EURO\s*[0-9IV]+|EEV|INTERIM|FINAL)\b/gi;
const engineText = (s) => String(s || '').replace(ENGINE_MAKERS, ' ').replace(EMISSION, ' ');
const engineClass = (a0, b0) => {
  const a = engineText(a0), b = engineText(b0);
  const na = norm(a), nb = norm(b);
  if (!na || !nb) return 'EMPTY';
  if (na === nb) return 'EQUAL';
  if (Math.min(na.length, nb.length) >= 3 && (na.includes(nb) || nb.includes(na))) return 'CONTAINS';
  const toks = (s) => String(s || '').split(/[,;/]|\s+(?:and|y)\s+/i).map(norm).filter((t) => t.length >= 2);
  const ta = toks(a), tb = toks(b);
  if (ta.some((x) => tb.some((y) => x === y || (x.length >= 4 && y.length >= 4 && (x.includes(y) || y.includes(x)))))) return 'LIST_OVERLAP';
  return 'CONFLICT';
};
// A model usually has several engine variants: compare each current engine against ALL MANN engines
// listed for the same key, not one arbitrary row (Map keeps a single row per key).
const groupBy = (rows, keyFn, codeFn) => { const m = new Map(); for (const r of rows) { const k = keyFn(r); if (!m.has(k)) m.set(k, []); m.get(k).push(codeFn(r)); } return m; };
const mannEng = groupBy(mann, keyMann, (r) => r.engine_code);
const curEng = groupBy(curParsed, keyCur, (p) => p.engine_code);
const rank = { EQUAL: 0, CONTAINS: 1, LIST_OVERLAP: 2, EMPTY: 3, CONFLICT: 4 };
const engineDiffs = [];
for (const k of matched) {
  const mannCodes = [...new Set(mannEng.get(k) || [])];
  for (const cur of [...new Set(curEng.get(k) || [])]) {
    let best = 'CONFLICT', bestMann = mannCodes[0];
    if (!norm(cur) || mannCodes.every((m) => !norm(m))) best = 'EMPTY';
    else for (const m of mannCodes) { const c = engineClass(m, cur); if (rank[c] < rank[best]) { best = c; bestMann = m; } }
    if (best !== 'EQUAL') engineDiffs.push({ key: k, mann: best === 'CONFLICT' ? mannCodes.join(' | ') : bestMann, current: cur, cls: best });
  }
}
const engineCodeMismatch = engineDiffs.filter((d) => d.cls === 'CONFLICT');
const engineBenign = engineDiffs.filter((d) => d.cls !== 'CONFLICT');
const currentDuplicateRows = current.length - curKeys.size;

const oeOf = (e) => normalizePart(e && typeof e === 'object' ? e.code || e.part_number || e.reference : e);
const skuOe = new Set((Array.isArray(row.oem_codes) ? row.oem_codes : []).map(oeOf).filter((x) => x.length >= 4));
const pageOe = new Set(oeNumbers.map((o) => normalizePart(o.code)).filter((x) => x.length >= 4));
const oeOverlap = [...pageOe].filter((c) => skuOe.has(c));
const report = {
  generated_at: new Date().toISOString(),
  mode: 'READ_ONLY_PILOT_NO_WRITES',
  sku, duty: row.duty, codigo_base: row.codigo_base, mann_code: mannCode,
  source: { url: finalUrl, http_status: httpStatus, page_sha256: pageSha256, title: identity.title },
  counts: {
    oe_on_page: pageOe.size,
    oe_on_sku: skuOe.size,
    oe_overlap: oeOverlap.length,
    mann_rows_raw: parsed.length,
    mann_rows_dedup: mann.length,
    current_rows: current.length,
    matched_make_model_year: matched.length,
    only_in_mann: onlyMann.length,
    only_in_current: onlyCurrent.length,
    current_distinct_keys: curKeys.size,
    current_duplicate_rows: currentDuplicateRows,
    matched_engine_code_mismatch: engineCodeMismatch.length,
    matched_engine_code_benign_diff: engineBenign.length,
  },
  oe_overlap_sample: oeOverlap.slice(0, 10),
  current_year_formats: formats,
  comparison_mode: yearAgnostic ? 'MAKE_MODEL_ONLY_PRODUCTION_PERIODS' : 'MAKE_MODEL_YEAR',
  engine_code_mismatch_sample: engineCodeMismatch.slice(0, 20),
  engine_code_benign_sample: engineBenign.slice(0, 10),
  mann_makes: [...new Set(mann.map((r) => r.make))],
  mann_years: [...new Set(mann.map((r) => r.year))].sort(),
  kw_hp_anomalies_set_to_null: anomalies,
  current_sample: current.slice(0, 3),
  current_payload_hash_normalized: applicationPayloadHash(current),
  current_vehicle_db_hash: row.vehicle_db_hash,
  existing_evidence: evidence,
  only_in_mann_all: onlyMann,
  only_in_current_all: onlyCurrent,
};
fs.writeFileSync(path.join(outDir, 'comparison.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, only_in_mann_all: undefined, only_in_current_all: undefined, current_sample: undefined }, null, 2));
console.log(`\nFiles: ${outDir}`);
if (!mann.length) {
  console.error('WARNING: 0 MANN rows parsed. Inspect mann-page.html; applications may load dynamically or the table markup differs.');
  process.exitCode = 2;
}
