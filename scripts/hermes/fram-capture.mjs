#!/usr/bin/env node
// Captures official FRAM product data (www.fram.com, reachable directly from the ELIMSERVER) for the non-European LD
// queue built by fram-capture-todo.mjs. Per SKU:
//   - candidates (FRAM codes already on the SKU): search FRAM's part finder for the exact code, open its product page
//   - otherwise OEM codes: FRAM part finder (interchange) -> FRAM products listed for that OEM number
// Base choice (LD rule, non-European -> FRAM): the FRAM STANDARD line of the SKU family (EA3 CA*, EC3 CF*, EL3 PH*/CH*,
// EF3 G*/PS*/P*); premium lines (XG, TG, HM, XGA, FCF ...) are recorded as alternates, never as base. One standard code
// -> FOUND; several -> AMBIGUOUS; none -> NOT_FOUND. Nothing is written to the database.
// Product page data kept: part type, "More Information" attributes, vehicle applications (year/make/model/engine),
// competitor cross references, URL. Throttled; cached in out/fram/cache; batches in out/fram/batch-NNN.json; resumable.
// Usage: node scripts/hermes/fram-capture.mjs [--limit N]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const argv = process.argv.slice(2);
const LIMIT = argv.includes('--limit') ? Number(argv[argv.indexOf('--limit') + 1]) : Infinity;
const DIR = path.resolve('out', 'fram'); const CACHE = path.join(DIR, 'cache'); fs.mkdirSync(CACHE, { recursive: true });
const H = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36', Accept: 'text/html,application/json' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const STD = { EA3: /^CA\d/, EC3: /^CF\d/, EL3: /^(PH|CH)\d/, EF3: /^(G|PS|P)\d/ };
async function get(url, json = false) {
  const key = path.join(CACHE, crypto.createHash('sha1').update(url).digest('hex') + (json ? '.json' : '.html'));
  if (fs.existsSync(key)) { const t = fs.readFileSync(key, 'utf8'); return json ? JSON.parse(t) : t; }
  for (let a = 0; a < 3; a++) {
    try { await sleep(1200); const r = await fetch(url, { headers: H, signal: AbortSignal.timeout(30000) });
      if (r.status === 404) return json ? null : '';
      if (r.ok) { const t = await r.text(); if (/_Incapsula_Resource|Request unsuccessful/i.test(t)) throw new Error('BLOCKED'); fs.writeFileSync(key, t); return json ? JSON.parse(t) : t; } }
    catch (e) { if (e.message === 'BLOCKED') throw e; }
    await sleep(4000 * (a + 1));
  }
  throw new Error('FETCH_FAILED ' + url);
}
const strip = (s) => String(s).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#039;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
function tables(html) {
  return [...html.matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => [...m[0].matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((r) => [...r[0].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((c) => strip(c[1]))));
}
function productLinks(html) {
  return [...new Set([...html.matchAll(/href="(https:\/\/www\.fram\.com\/[a-z0-9-]+)"/g)].map((m) => m[1]))]
    .map((u) => ({ url: u, code: norm((/-([a-z]{1,5}\d{1,6}[a-z0-9]*)$/.exec(u) || [])[1]) })).filter((x) => x.code && /\d/.test(x.code));
}
async function product(url, code) {
  const html = await get(url);
  const t = tables(html); const info = {}; let apps = []; let xref = [];
  for (const tb of t) {
    const head = (tb[0] || []).join('|');
    if (/^Year\|Make\|Model/i.test(head)) { apps = apps.concat(tb.slice(1).filter((r) => r.length >= 3)); continue; }
    if (/^Brand\|Part Number/i.test(head)) { xref = xref.concat(tb.slice(1).filter((r) => r.length >= 2)); continue; }
    if (tb.every((r) => r.length === 2)) for (const [k, v] of tb) if (k) info[k] = v;
  }
  const title = strip((/<title>([\s\S]*?)<\/title>/i.exec(html) || [])[1] || '');
  return { code, url, title, info, applications: apps, cross_references: xref };
}
const todo = JSON.parse(fs.readFileSync(path.join(DIR, 'todo.json'), 'utf8'));
const done = new Set();
for (const f of fs.readdirSync(DIR).filter((x) => /^batch-\d+\.json$/.test(x))) for (const r of JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))) done.add(r.sku);
let batchNo = fs.readdirSync(DIR).filter((x) => /^batch-\d+\.json$/.test(x)).length; let buf = []; let n = 0;
const flush = () => { if (!buf.length) return; batchNo++; fs.writeFileSync(path.join(DIR, `batch-${String(batchNo).padStart(3, '0')}.json`), JSON.stringify(buf)); buf = []; };
for (const t of todo) {
  if (done.has(t.sku) || n >= LIMIT) continue; n++;
  const pre = t.sku.slice(0, 3); const rec = { sku: t.sku, cls: t.cls, method: t.candidates.length ? 'CANDIDATE' : 'OEM_INTERCHANGE', queried: [], found: [], status: 'NOT_FOUND' };
  try {
    const seen = new Map();
    const run = async (qs, exact) => { for (const q of qs) {
      const page = await get('https://www.fram.com/partFinder/page/index/?q=' + encodeURIComponent(q));
      const links = productLinks(page).filter((l) => !exact || l.code === norm(q));
      rec.queried.push({ q, exact, links: links.map((l) => l.code) });
      for (const l of links) if (!seen.has(l.code)) seen.set(l.code, l);
    } };
    await run(t.candidates, true);
    let std = [...seen.values()].filter((l) => STD[pre] && STD[pre].test(l.code));
    if (!std.length && t.oems.length) { rec.method = t.candidates.length ? 'CANDIDATE_THEN_OEM' : 'OEM_INTERCHANGE'; await run(t.oems, false); std = [...seen.values()].filter((l) => STD[pre] && STD[pre].test(l.code)); }
    rec.found = [...seen.values()].map((l) => l.code);
    if (std.length === 1) { rec.status = 'FOUND'; rec.base = std[0].code; rec.product = await product(std[0].url, std[0].code); }
    else if (std.length > 1) { rec.status = 'AMBIGUOUS'; rec.standard_candidates = std.map((l) => l.code); }
  } catch (e) { rec.status = 'ERROR'; rec.error = e.message; if (e.message === 'BLOCKED') { buf.push(rec); flush(); console.log('BLOCKED by FRAM, stopping'); process.exit(2); } }
  buf.push(rec); if (buf.length >= 25) flush();
  if (n % 25 === 0) console.log(new Date().toISOString(), 'done', n);
}
flush();
console.log('finished', n);
