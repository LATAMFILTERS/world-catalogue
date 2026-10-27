#!/usr/bin/env node
// Batch runner for LD SKUs whose canonical_source_brand is MANN-FILTER.
// Reuses, per SKU, the two governed scripts:
//   1. mann-vehicle-application-pilot.mjs  (read-only extraction + comparison)
//   2. mann-vehicle-application-apply.mjs  (dry-run by default; commit only when asked)
//
// DEFAULT: everything dry-run (ROLLBACK). A SKU is ELIGIBLE only if:
//   pilot ok, apply dry-run guard -> EVIDENCE_VERIFIED, 0 engine-code mismatches,
//   and (rule=base-code, default) >=1 matching application; (rule=ratio) matched/current >= --min-match.
// COMMIT: --commit-eligible --confirm-count <N>, where N must equal the number of
// eligible SKUs reported by the dry-run summary you are approving.
//
// Usage (Lenovo, CATALOG_DATABASE_URL loaded):
//   node scripts/hermes/mann-vehicle-application-batch.mjs --limit 20
//   node scripts/hermes/mann-vehicle-application-batch.mjs --offset 20 --limit 200
//   node scripts/hermes/mann-vehicle-application-batch.mjs --from-summary out\mann-batch\<run>\summary.json --commit-eligible --confirm-count 17

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, cur, i, arr) => {
  if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return acc;
}, []));
const limit = Number(args.limit || 20);
const offset = Number(args.offset || 0);
// rule=base-code (approved by Victor 2026-10-24): the base code (canonical identity or the
// single relational source_sku, same last-4 digits as the SKU) plus a valid MANN page is the
// authority. Require >=1 matching application and 0 engine-code mismatches; current rows not
// on the official page are not migrated (review file). rule=ratio keeps the old >= min-match test.
const rule = String(args.rule || 'base-code');
if (!['base-code', 'ratio'].includes(rule)) throw new Error('--rule must be base-code or ratio');
const prefix = args.prefix ? String(args.prefix).toUpperCase() : null;
// --after <SKU>: stable cursor. Committed SKUs drop out of the target list, so
// --offset shifts after a commit; --after does not.
const after = args.after ? String(args.after).toUpperCase() : null;
// --retry-from <summary.json[,summary.json]> --retry-reason <REASON>: only SKUs held with that reason.
let only = null;
if (args['retry-from']) {
  const reason = String(args['retry-reason'] || 'NO_MATCHING_APPLICATION');
  only = [];
  for (const f of String(args['retry-from']).split(',')) {
    for (const r of JSON.parse(fs.readFileSync(f.trim(), 'utf8')).rows || []) if (String(r.reason || '').startsWith(reason)) only.push(r.sku);
  }
}
// --skus A,B,C: only these SKUs (small verification runs).
if (args.skus) only = String(args.skus).toUpperCase().split(',').map((x) => x.trim()).filter(Boolean);
const minMatch = Number(args['min-match'] || 0.7);
const delayMs = Number(args['delay-ms'] || 2000);
const commitEligible = args['commit-eligible'] === 'true';
// LD family must match the official product type. EA3 = engine air, so "Cabin Air Filter"
// (MANN FP/CU/CUK) is NOT an EA3 match even though it contains "air filter".
const ldFamilyMatches = (sku, title) => {
  const t = String(title || '');
  const fam = sku.slice(0, 3);
  if (fam === 'EA3') return /air filter/i.test(t) && !/cabin|interior/i.test(t);
  if (fam === 'EC3') return /cabin|interior/i.test(t);
  if (fam === 'EL3') return /oil filter/i.test(t);
  if (fam === 'EF3') return /fuel filter/i.test(t);
  return true;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const normCode = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
// MANN site = Adobe AEM CIF + Magento GraphQL. The store view and endpoint are published by the official page in
// <meta name="store-config" content="{...}">, read once instead of guessed.
let mannStore = null;
async function mannStoreConfig() {
  if (mannStore) return mannStore;
  const res = await fetch('https://www.mann-filter.com/en/catalog/search-results.html', { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' } });
  const html = await res.text();
  const meta = /<meta[^>]+name="store-config"[^>]+content="([^"]+)"/i.exec(html) || /<meta[^>]+content="([^"]+)"[^>]+name="store-config"/i.exec(html);
  if (!meta) throw new Error(`NO_STORE_CONFIG metas=${[...html.matchAll(/<meta[^>]+name="([^"]+)"/gi)].map((m) => m[1]).join(',').slice(0, 200)}`);
  const cfg = JSON.parse(meta[1].replace(/&quot;|&#34;/g, '"').replace(/&amp;/g, '&'));
  mannStore = { store: cfg.storeView || cfg.storeCode || null, endpoint: new URL(cfg.graphqlEndpoint || '/api/graphql/catalog-prod', 'https://www.mann-filter.com').href,
    method: String(cfg.graphqlMethod || 'POST').toUpperCase(), headers: cfg.httpHeaders || {} };
  return mannStore;
}
async function resolveViaMannSearch(code) {
  try {
    const cfg = await mannStoreConfig();
    const query = `{ products(search: ${JSON.stringify(normCode(code))}, pageSize: 20) { items { sku name url_key } } }`;
    const headers = { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json', ...cfg.headers, ...(cfg.store ? { Store: cfg.store } : {}) };
    const res = cfg.method === 'GET'
      ? await fetch(`${cfg.endpoint}?query=${encodeURIComponent(query)}`, { headers })
      : await fetch(cfg.endpoint, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
    await sleep(delayMs);
    const body = await res.json().catch(() => null);
    if (!res.ok || body?.errors) return { url: null, note: `API_${res.status} ${JSON.stringify(body?.errors?.[0]?.message || '').slice(0, 80)}` };
    const items = body?.data?.products?.items || [];
    if (!items.length) return { url: null, note: 'NO_RESULT' };
    const exact = items.filter((it) => normCode(it.sku) === normCode(code) || normCode(String(it.url_key || '').replace(/_mann-filter$/i, '')) === normCode(code));
    if (exact.length !== 1 || !exact[0].url_key) return { url: null, note: exact.length ? 'MULTIPLE_EXACT' : `NO_EXACT_MATCH(${items.slice(0, 3).map((it) => it.sku).join('|')})` };
    return { url: `https://www.mann-filter.com/en/catalog/search-results/product.html/${exact[0].url_key}.html`, note: 'RESOLVED', sku: exact[0].sku };
  } catch (e) { return { url: null, note: `ERROR ${e.message}`.slice(0, 160) }; }
}
const slug = (code) => String(code).toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9/()]/g, '');

const runNode = (script, scriptArgs) => {
  const p = spawnSync(process.execPath, [path.join(here, script), ...scriptArgs], { encoding: 'utf8', env: process.env, maxBuffer: 64 * 1024 * 1024 });
  const out = p.stdout || '';
  const start = out.indexOf('{');
  let json = null;
  if (start >= 0) {
    // Last top-level JSON object printed by the script.
    for (let end = out.lastIndexOf('}'); end > start && !json; end = out.lastIndexOf('}', end - 1)) {
      try { json = JSON.parse(out.slice(start, end + 1)); } catch { /* keep shrinking */ }
    }
  }
  // Real message lines only ("Error: ...", "STOP_REVIEW: ...", "WARNING: ..."), never echoed source lines.
  const lines = (p.stderr || '').split('\n').map((l) => l.trim());
  const err = lines.find((l) => /^(\w*Error: |STOP_REVIEW: |WARNING: |error: )/.test(l)) || lines.find(Boolean) || null;
  return { status: p.status, json, error: p.status === 0 ? null : err };
};

// ---------- COMMIT MODE: only SKUs marked eligible in an approved dry-run summary ----------
if (commitEligible) {
  if (!args['from-summary']) throw new Error('--commit-eligible requires --from-summary <summary.json>');
  const summary = JSON.parse(fs.readFileSync(args['from-summary'], 'utf8'));
  const eligible = summary.rows.filter((r) => r.eligible);
  if (Number(args['confirm-count']) !== eligible.length) throw new Error(`--confirm-count must be ${eligible.length} (eligible SKUs in that summary)`);
  const results = [];
  for (const r of eligible) {
    const a = runNode('mann-vehicle-application-apply.mjs', ['--sku', r.sku, '--in', r.dir, '--commit', '--confirm', r.sku]);
    results.push({ sku: r.sku, result: a.json?.result || 'FAILED', guard: a.json?.after?.guard?.state || null, error: a.json?.error || a.error });
    console.log(`${r.sku}\t${results.at(-1).result}\t${results.at(-1).error || ''}`);
  }
  const outFile = path.join(path.dirname(args['from-summary']), 'commit-results.json');
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ committed: results.filter((x) => x.result === 'COMMITTED').length, failed: results.filter((x) => x.result !== 'COMMITTED').length, file: outFile }, null, 2));
  process.exit(0);
}

// ---------- DRY-RUN MODE ----------
const dbUrl = process.env.CATALOG_DATABASE_URL;
if (!dbUrl) throw new Error('CATALOG_DATABASE_URL is required');
const db = new pg.Client({ connectionString: dbUrl });
await db.connect();
await db.query('BEGIN READ ONLY');
// Base code = the MANN part number the applications were actually imported from.
// 1) ld_canonical_product_identity (MANN-FILTER, ACTIVE), else
// 2) ld_vehicle_applications.source_sku when the SKU has exactly ONE distinct
//    source code (origin master/external_recovered). SKUs with 2+ source codes
//    are mixed imports (e.g. EL30816 = HU816X + HU816ZKIT) and go to review.
// --from-classification <ld-base-classification json> [--class MANN_SAME_DIGITS]: targets are the SKUs of that class
// (European origin, a MANN code with the SKU's last four digits). The MANN code is taken RAW from competitor/oem codes
// (keeps "/" and spaces for the official URL); 2+ distinct same-digit MANN codes -> MULTIPLE_MANN_CODES (held).
let classTargets = null;
if (args['from-classification']) {
  const cls = String(args.class || 'MANN_SAME_DIGITS');
  const picked = JSON.parse(fs.readFileSync(args['from-classification'], 'utf8')).rows
    .filter((r) => r.cls === cls && (!prefix || r.sku.startsWith(prefix)) && (!after || r.sku > after) && (!only || only.includes(r.sku)));
  const normCode = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const { rows: raw } = await db.query(`SELECT sku, competitor_codes, oem_codes, codigo_base FROM public.elimfilters_catalog WHERE sku = ANY($1::text[])`, [picked.map((r) => r.sku)]);
  const bySku = new Map(raw.map((r) => [r.sku, r]));
  classTargets = picked.slice(offset, offset + limit).map((r) => {
    const row = bySku.get(r.sku) || {};
    const pool = [...(row.competitor_codes || []), ...(row.oem_codes || [])].map((e) => (e && typeof e === 'object' ? e.code || e.part_number || e.reference : e));
    if (row.codigo_base) pool.push(row.codigo_base);
    const want = new Set(r.same_digit_mann);
    const rawCodes = [...new Map(pool.filter((c) => want.has(normCode(c))).map((c) => [normCode(c), String(c).trim()])).values()];
    if (rawCodes.length === 1) return { sku: r.sku, mann_code: rawCodes[0], code_source: `CLASSIFICATION_${cls}`, source_codes: 1 };
    return { sku: r.sku, mann_code: null, code_source: rawCodes.length > 1 ? 'MULTIPLE_MANN_CODES' : 'MANN_CODE_NOT_FOUND_RAW', source_codes: rawCodes.length };
  });
}
const { rows: dbTargets } = classTargets ? { rows: [] } : await db.query(`
  WITH rel AS (
    SELECT v.elimfilters_sku AS sku, min(btrim(v.source_sku)) AS code,
           count(DISTINCT ld_catalog.norm_part(v.source_sku)) AS k
    FROM ld_catalog.ld_vehicle_applications v
    WHERE v.source_origin IN ('master','external_recovered') AND nullif(btrim(v.source_sku),'') IS NOT NULL
    GROUP BY 1)
  SELECT c.sku,
         coalesce(i.canonical_part_number, CASE WHEN rel.k = 1 THEN rel.code END) AS mann_code,
         CASE WHEN i.canonical_part_number IS NOT NULL THEN 'CANONICAL_IDENTITY'
              WHEN rel.k = 1 THEN 'RELATIONAL_SOURCE_SKU'
              WHEN rel.k > 1 THEN 'MIXED_SOURCE_SKU' ELSE 'NO_BASE_CODE' END AS code_source,
         rel.k AS source_codes
  FROM public.elimfilters_catalog c
  LEFT JOIN ld_catalog.ld_canonical_product_identity i
         ON i.elimfilters_sku = c.sku AND i.canonical_brand = 'MANN-FILTER' AND i.status = 'ACTIVE'
  LEFT JOIN rel ON rel.sku = c.sku
  WHERE c.duty = 'LIGHT_DUTY' AND c.catalog_active = true
    AND NOT (upper(coalesce(c.canonical_source_status,'')) IN ('VERIFIED','EXCEPTION_CONFIRMED') AND coalesce(c.canonical_source_brand,'') !~* '^MANN')
    AND jsonb_array_length(coalesce(c.vehicle_applications, '[]'::jsonb)) > 0
    AND NOT EXISTS (SELECT 1 FROM public.catalog_application_evidence e
                    WHERE e.sku = c.sku AND e.application_kind = 'VEHICLE' AND e.verified = true
                      AND e.payload_hash = md5(c.vehicle_applications::text))
    AND (i.canonical_part_number IS NOT NULL OR rel.k IS NOT NULL)
    AND ($3::text IS NULL OR c.sku LIKE $3::text || '%')
    AND ($4::text IS NULL OR c.sku > $4::text)
    AND ($5::text[] IS NULL OR c.sku = ANY($5::text[]))
  ORDER BY c.sku OFFSET $1 LIMIT $2`, [offset, limit, prefix, after, only]);
const targets = classTargets || dbTargets;
await db.query('ROLLBACK');
await db.end();

const runId = new Date().toISOString().replace(/[:.]/g, '-');
const runDir = path.resolve('out', 'mann-batch', runId);
fs.mkdirSync(runDir, { recursive: true });
const rows = [];
for (const [i, t] of targets.entries()) {
  const dir = path.join(runDir, t.sku);
  const last4 = (v) => String(v || '').replace(/\D/g, '').slice(-4).padStart(4, '0');
  if (!t.mann_code) {
    rows.push({ sku: t.sku, mann_code: null, code_source: t.code_source, source_codes: t.source_codes, eligible: false, reason: t.code_source });
    console.log(`[${i + 1}/${targets.length}] ${t.sku} -\tHOLD\t${t.code_source} (${t.source_codes} codigos)`);
    continue;
  }
  if (last4(t.mann_code) !== last4(t.sku)) {
    rows.push({ sku: t.sku, mann_code: t.mann_code, code_source: t.code_source, eligible: false, reason: 'BASE_CODE_SKU_DIGITS_MISMATCH' });
    console.log(`[${i + 1}/${targets.length}] ${t.sku} ${t.mann_code}\tHOLD\tBASE_CODE_SKU_DIGITS_MISMATCH`);
    continue;
  }
  // us-en first (US vehicle listings); fall back to the global en page when the
  // product is missing there or lists no vehicles.
  let pilot; let locale;
  for (locale of ['us-en', 'en']) {
    const url = `https://www.mann-filter.com/${locale}/catalog/search-results/product.html/${slug(t.mann_code)}_mann-filter.html`;
    pilot = runNode('mann-vehicle-application-pilot.mjs', ['--sku', t.sku, '--mann', t.mann_code, '--url', url, '--out', dir]);
    if (pilot.status === 0 && pilot.json?.counts) break;
    if (!/MANN HTTP 404|0 MANN rows/.test(pilot.error || '')) break;
    await sleep(delayMs);
  }
  // Catalogue codes are often stored without spaces/"/" (W7301 = W 730/1, HU8152X = HU 815/2 x), so the direct URL
  // 404s. Fallback: the official MANN catalogue API; accepted only when exactly ONE product has the identical
  // normalized code. The pilot/apply then run the usual identity, family and engine guards on that official page.
  let resolvedUrl = null; let resolveNote = null;
  if (pilot.status !== 0 && /MANN HTTP 404|0 MANN rows/.test(pilot.error || '')) {
    const r = await resolveViaMannSearch(t.mann_code);
    resolveNote = r.note;
    if (r.url) {
      for (const loc of ['us-en', 'en']) {
        resolvedUrl = r.url.replace(/mann-filter\.com\/[a-z-]+\//, `mann-filter.com/${loc}/`);
        locale = loc;
        pilot = runNode('mann-vehicle-application-pilot.mjs', ['--sku', t.sku, '--mann', t.mann_code, '--url', resolvedUrl, '--out', dir]);
        if (pilot.status === 0 && pilot.json?.counts) break;
        await sleep(delayMs);
      }
    }
  }
  const c = pilot.json?.counts;
  const row = { sku: t.sku, mann_code: t.mann_code, code_source: t.code_source, locale, dir, resolved_url: resolvedUrl, resolve_note: resolveNote, mann_rows: c?.mann_rows_dedup ?? null, current_rows: c?.current_rows ?? null,
    current_distinct: c?.current_distinct_keys ?? null, matched: c?.matched_make_model_year ?? null,
    only_in_current: c?.only_in_current ?? null, engine_mismatch: c?.matched_engine_code_mismatch ?? null,
    oe_overlap: c?.oe_overlap ?? null, match_ratio: null, guard_after: null, eligible: false, reason: null };
  if (pilot.status !== 0 || !c) {
    row.reason = resolveNote && !resolvedUrl ? `MANN_SEARCH_${resolveNote}` : `PILOT_FAILED: ${pilot.error}`;
  } else {
    row.match_ratio = c.current_distinct_keys ? Number((c.matched_make_model_year / c.current_distinct_keys).toFixed(3)) : 0;
    // LD family must match the official product type (EL3 oil, EA3 air, EC3 cabin, EF3 fuel).
    row.mann_title = pilot.json?.source?.title || null;
    if (!ldFamilyMatches(t.sku, row.mann_title)) {
      row.reason = `FAMILY_MISMATCH: ${row.mann_title}`;
      rows.push(row);
      console.log(`[${i + 1}/${targets.length}] ${t.sku} ${t.mann_code}\tHOLD\t${row.reason}`);
      fs.writeFileSync(path.join(runDir, 'summary.json'), JSON.stringify({ run_id: runId, offset, limit, prefix, rule, min_match: minMatch, rows }, null, 2));
      await sleep(delayMs);
      continue;
    }
    const apply = runNode('mann-vehicle-application-apply.mjs', ['--sku', t.sku, '--in', dir]);
    row.guard_after = apply.json?.after?.guard?.state || null;
    if (apply.json?.result !== 'ROLLED_BACK_NO_CHANGES') row.reason = `DRY_RUN_FAILED: ${apply.json?.error || apply.error}`;
    else if (c.matched_engine_code_mismatch !== 0) row.reason = 'ENGINE_CODE_MISMATCH';
    // Approved 2026-10-25: with 0 matching applications (current rows are junk), an OE number shared
    // between the official MANN page and the SKU is the independent identity proof.
    else if (rule === 'base-code' && c.matched_make_model_year < 1 && !(c.oe_overlap >= 1)) row.reason = 'NO_MATCHING_APPLICATION';
    else if (rule === 'ratio' && row.match_ratio < minMatch) row.reason = `LOW_MATCH_${row.match_ratio}`;
    else { row.eligible = true; row.reason = 'OK'; }
  }
  rows.push(row);
  console.log(`[${i + 1}/${targets.length}] ${t.sku} ${t.mann_code}\t${row.eligible ? 'ELIGIBLE' : 'HOLD'}\t${row.reason}`);
  fs.writeFileSync(path.join(runDir, 'summary.json'), JSON.stringify({ run_id: runId, offset, limit, prefix, rule, min_match: minMatch, rows }, null, 2));
  if (i < targets.length - 1) await sleep(delayMs);
}
fs.writeFileSync(path.join(runDir, 'summary.json'), JSON.stringify({ run_id: runId, offset, limit, prefix, rule, min_match: minMatch, rows }, null, 2));
const eligible = rows.filter((r) => r.eligible).length;
console.log(JSON.stringify({ run_dir: runDir, processed: rows.length, eligible, hold: rows.length - eligible,
  hold_reasons: rows.filter((r) => !r.eligible).reduce((m, r) => { const k = String(r.reason).split(':')[0].replace(/_0\.\d+$/, ''); m[k] = (m[k] || 0) + 1; return m; }, {}),
  summary: path.join(runDir, 'summary.json') }, null, 2));
