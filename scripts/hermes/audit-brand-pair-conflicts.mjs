#!/usr/bin/env node
// HERMES: audit OEM-vs-competitor classification conflicts where the SAME code is listed under two DIFFERENT brands
// (e.g. KOMATSU in oem_codes and MANN-HUMMEL in competitor_codes).
// READ ONLY: the database session is READ ONLY + ROLLBACK; the only output is files under out/hermes-brand-pair-audit.
// A pair is CONFIRMED only when the OFFICIAL MANN page of a MANN filter on the same SKU lists the shared code in its
// "OE Numbers" tab under the equipment brand (exact normalized code + manufacturer). No language model decides anything.
// Pairs whose competitor brand has no automated official source are reported as NO_OFFICIAL_SOURCE (never inferred).
// HTTP 403/429 is recorded as BLOCKED and three in a row abort the run (no evasion).
// Usage: node scripts/hermes/audit-brand-pair-conflicts.mjs [--limit N] [--pairs "KOMATSU|MANN-HUMMEL,DEMAG|MANN-HUMMEL"]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import pg from 'pg';
const require = createRequire(import.meta.url);
const { verifyProductIdentity, parseMannOeNumbers } = require('../../lib/mann-official-spec-verifier.js');

const DEFAULT_PAIRS = ['AMERICAN MOTORS CORPORATION|EXMAN', 'KOMATSU|MANN-HUMMEL', 'DEMAG|MANN-HUMMEL', 'ROVER|UNIPART', 'FINN-EQUIPMENT|FINN-FILTER'];
const args = Object.fromEntries(process.argv.slice(2).reduce((a, c, i, r) => { if (c.startsWith('--')) a.push([c.slice(2), r[i + 1] && !r[i + 1].startsWith('--') ? r[i + 1] : 'true']); return a; }, []));
const pairs = (args.pairs ? String(args.pairs).split(',') : DEFAULT_PAIRS).map((p) => p.split('|').map((s) => s.trim().toUpperCase()));
const limit = Number(args.limit || 100000);
const outDir = path.resolve('out/hermes-brand-pair-audit');
fs.mkdirSync(outDir, { recursive: true });

const norm = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MANN_BRANDS = new Set(['MANNHUMMEL', 'MANNFILTER', 'MANN']);

// MANN slug variants from a normalized catalog code (the catalog drops spaces and slashes: C339203 = "C 33 920/3").
function mannSlugVariants(code) {
  const c = String(code || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const v = new Set([c]);
  const m = c.match(/^([a-z]+)(\d+)$/);
  if (m && m[2].length >= 4) v.add(`${m[1]}${m[2].slice(0, -1)}/${m[2].slice(-1)}`);
  if (m && m[2].length >= 5) v.add(`${m[1]}${m[2].slice(0, -2)}/${m[2].slice(-2)}`);
  return [...v];
}

const url = process.env.DATABASE_URL || process.env.CATALOG_DATABASE_URL;
const db = new pg.Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
await db.connect();
let rows;
try {
  await db.query('BEGIN READ ONLY');
  ({ rows } = await db.query(`
    WITH cf AS (SELECT * FROM public.catalog_reference_classification_conflicts_v),
    o AS (SELECT c.sku, upper(regexp_replace(coalesce(x->>'code',x->>'reference',''),'[^A-Z0-9]','','g')) n, upper(coalesce(x->>'brand',x->>'manufacturer','?')) b
          FROM elimfilters_catalog c, jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb)) x),
    k AS (SELECT c.sku, upper(regexp_replace(coalesce(x->>'code',x->>'reference',''),'[^A-Z0-9]','','g')) n, upper(coalesce(x->>'brand',x->>'manufacturer','?')) b
          FROM elimfilters_catalog c, jsonb_array_elements(coalesce(c.competitor_codes,'[]'::jsonb)) x)
    SELECT cf.sku, cf.normalized_reference AS code, o.b AS oem_brand, k.b AS comp_brand,
      (SELECT coalesce(jsonb_agg(DISTINCT upper(regexp_replace(coalesce(x->>'code',x->>'reference',''),'[^A-Z0-9]','','g'))),'[]'::jsonb)
         FROM elimfilters_catalog c, jsonb_array_elements(coalesce(c.competitor_codes,'[]'::jsonb)) x
        WHERE c.sku=cf.sku AND upper(regexp_replace(coalesce(x->>'brand',x->>'manufacturer',''),'[^A-Z0-9]','','g')) IN ('MANNHUMMEL','MANNFILTER','MANN')) AS mann_codes
    FROM cf JOIN o ON o.sku=cf.sku AND o.n=cf.normalized_reference JOIN k ON k.sku=cf.sku AND k.n=cf.normalized_reference
    ORDER BY cf.sku, cf.normalized_reference`));
} finally { await db.query('ROLLBACK').catch(() => {}); await db.end(); }

const wanted = new Set(pairs.map((p) => p.join('|')));
rows = rows.filter((r) => wanted.has(`${r.oem_brand}|${r.comp_brand}`)).slice(0, limit);

const pageCache = new Map(); // mann code -> { status, oe[], url, sha256 }
let blockedRun = 0;
async function mannPage(code) {
  if (pageCache.has(code)) return pageCache.get(code);
  const rec = { code, status: 'NOT_FOUND', oe: [], attempts: [] };
  outer: for (const slug of mannSlugVariants(code)) {
    for (const locale of ['en', 'us-en']) {
      const u = `https://www.mann-filter.com/${locale}/catalog/search-results/product.html/${slug}_mann-filter.html`;
      try {
        const res = await fetch(u, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'ELIMFILTERS-Catalogue-Research/1.0' } });
        await sleep(400);
        if (res.status === 403 || res.status === 429) { rec.attempts.push({ url: u, http: res.status }); rec.status = 'BLOCKED'; blockedRun++; break outer; }
        blockedRun = 0;
        if (!res.ok) { rec.attempts.push({ url: u, http: res.status }); continue; }
        const html = await res.text();
        const id = verifyProductIdentity(html, code);
        rec.attempts.push({ url: u, http: res.status, identity: id.valid, title: id.title });
        if (id.valid) { Object.assign(rec, { status: 'OK', url: u, sha256: sha(html), oe: parseMannOeNumbers(html) }); break outer; }
      } catch (e) { rec.attempts.push({ url: u, error: String(e.message || e).slice(0, 80) }); }
    }
  }
  pageCache.set(code, rec);
  return rec;
}

const report = [];
for (const r of rows) {
  const rec = { sku: r.sku, code: r.code, oem_brand: r.oem_brand, comp_brand: r.comp_brand, status: 'NO_OFFICIAL_SOURCE', evidence: null };
  if (MANN_BRANDS.has(norm(r.comp_brand))) {
    rec.status = 'NOT_CONFIRMED';
    const mannCodes = (r.mann_codes || []).filter((c) => c !== r.code && /^[A-Z]{1,3}\d/.test(c));
    if (r.code && !mannCodes.length) rec.status = 'NO_MANN_FILTER_ON_SKU';
    for (const mc of mannCodes) {
      if (blockedRun >= 3) break;
      const page = await mannPage(mc);
      if (page.status === 'BLOCKED') { rec.status = 'BLOCKED'; break; }
      if (page.status !== 'OK') continue;
      const hit = page.oe.find((x) => norm(x.code) === r.code && norm(x.manufacturer) === norm(r.oem_brand));
      if (hit) { rec.status = 'CONFIRMED_OEM_NUMBER'; rec.evidence = { mann_code: mc, url: page.url, sha256: page.sha256, listed_as: hit }; break; }
    }
  }
  report.push(rec);
  if (blockedRun >= 3) { console.error('ABORT: MANN answered 403/429 three times in a row; not evading'); break; }
  if (report.length % 25 === 0) console.log(`progress ${report.length}/${rows.length}`);
}
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify({ pages: [...pageCache.values()], pairs: report }, null, 1));
const q = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
fs.writeFileSync(path.join(outDir, 'report.csv'), 'sku,code,oem_brand,comp_brand,status,mann_code,evidence_url,sha256\n' + report.map((x) => [x.sku, x.code, x.oem_brand, x.comp_brand, x.status, x.evidence?.mann_code, x.evidence?.url, x.evidence?.sha256].map(q).join(',')).join('\n'), 'utf8');
const by = {};
for (const x of report) { const k = `${x.oem_brand}|${x.comp_brand}|${x.status}`; by[k] = (by[k] || 0) + 1; }
console.log(JSON.stringify({ audited: report.length, of: rows.length, by_pair_status: by }, null, 1));
