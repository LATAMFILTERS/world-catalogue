#!/usr/bin/env node
// Batch runner for LD SKUs whose canonical_source_brand is MANN-FILTER.
// Reuses, per SKU, the two governed scripts:
//   1. mann-vehicle-application-pilot.mjs  (read-only extraction + comparison)
//   2. mann-vehicle-application-apply.mjs  (dry-run by default; commit only when asked)
//
// DEFAULT: everything dry-run (ROLLBACK). A SKU is ELIGIBLE only if:
//   pilot ok, apply dry-run guard -> EVIDENCE_VERIFIED, 0 engine-code mismatches,
//   and matched / current_distinct_keys >= --min-match (default 0.70).
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
const minMatch = Number(args['min-match'] || 0.7);
const delayMs = Number(args['delay-ms'] || 2000);
const commitEligible = args['commit-eligible'] === 'true';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
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
const { rows: targets } = await db.query(`
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
  WHERE c.duty = 'LIGHT_DUTY'
    AND jsonb_array_length(coalesce(c.vehicle_applications, '[]'::jsonb)) > 0
    AND NOT EXISTS (SELECT 1 FROM public.catalog_application_evidence e
                    WHERE e.sku = c.sku AND e.application_kind = 'VEHICLE' AND e.verified = true
                      AND e.payload_hash = md5(c.vehicle_applications::text))
    AND (i.canonical_part_number IS NOT NULL OR rel.k IS NOT NULL)
  ORDER BY c.sku OFFSET $1 LIMIT $2`, [offset, limit]);
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
  const c = pilot.json?.counts;
  const row = { sku: t.sku, mann_code: t.mann_code, code_source: t.code_source, locale, dir, mann_rows: c?.mann_rows_dedup ?? null, current_rows: c?.current_rows ?? null,
    current_distinct: c?.current_distinct_keys ?? null, matched: c?.matched_make_model_year ?? null,
    only_in_current: c?.only_in_current ?? null, engine_mismatch: c?.matched_engine_code_mismatch ?? null,
    match_ratio: null, guard_after: null, eligible: false, reason: null };
  if (pilot.status !== 0 || !c) {
    row.reason = `PILOT_FAILED: ${pilot.error}`;
  } else {
    row.match_ratio = c.current_distinct_keys ? Number((c.matched_make_model_year / c.current_distinct_keys).toFixed(3)) : 0;
    const apply = runNode('mann-vehicle-application-apply.mjs', ['--sku', t.sku, '--in', dir]);
    row.guard_after = apply.json?.after?.guard?.state || null;
    if (apply.json?.result !== 'ROLLED_BACK_NO_CHANGES') row.reason = `DRY_RUN_FAILED: ${apply.json?.error || apply.error}`;
    else if (c.matched_engine_code_mismatch !== 0) row.reason = 'ENGINE_CODE_MISMATCH';
    else if (row.match_ratio < minMatch) row.reason = `LOW_MATCH_${row.match_ratio}`;
    else { row.eligible = true; row.reason = 'OK'; }
  }
  rows.push(row);
  console.log(`[${i + 1}/${targets.length}] ${t.sku} ${t.mann_code}\t${row.eligible ? 'ELIGIBLE' : 'HOLD'}\t${row.reason}`);
  fs.writeFileSync(path.join(runDir, 'summary.json'), JSON.stringify({ run_id: runId, offset, limit, min_match: minMatch, rows }, null, 2));
  if (i < targets.length - 1) await sleep(delayMs);
}
fs.writeFileSync(path.join(runDir, 'summary.json'), JSON.stringify({ run_id: runId, offset, limit, min_match: minMatch, rows }, null, 2));
const eligible = rows.filter((r) => r.eligible).length;
console.log(JSON.stringify({ run_dir: runDir, processed: rows.length, eligible, hold: rows.length - eligible,
  hold_reasons: rows.filter((r) => !r.eligible).reduce((m, r) => { const k = String(r.reason).split(':')[0].replace(/_0\.\d+$/, ''); m[k] = (m[k] || 0) + 1; return m; }, {}),
  summary: path.join(runDir, 'summary.json') }, null, 2));
