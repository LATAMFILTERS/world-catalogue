#!/usr/bin/env node
// MANN → vehicle_applications replacement for ONE LD European SKU.
//
// DEFAULT = DRY RUN: performs the full governed write inside a transaction, runs the
// real presentation guard against the written row, prints before/after, then ROLLBACK.
// COMMIT only with BOTH flags:  --commit --confirm <SKU>
//
// Input: the output folder of scripts/hermes/mann-vehicle-application-pilot.mjs
// (mann-page.html, mann-applications.json, current-vehicle-applications.json, comparison.json).
// Writes go exclusively through lib/catalog-application-write-service.js.
//
// Usage:
//   node scripts/hermes/mann-vehicle-application-apply.mjs --sku EL30816 --in out\mann-pilot\EL30816-en
//   node scripts/hermes/mann-vehicle-application-apply.mjs --sku EL30816 --in out\mann-pilot\EL30816-en --commit --confirm EL30816

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import pg from 'pg';

const require = createRequire(import.meta.url);
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service.js');
const { governApplicationPresentation } = require('../../lib/application-presentation-guard.js');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, cur, i, arr) => {
  if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return acc;
}, []));
const sku = String(args.sku || '').trim().toUpperCase();
const inDir = path.resolve(String(args.in || ''));
if (!sku || !args.in) throw new Error('--sku and --in are required');
const commit = args.commit === 'true';
if (commit && String(args.confirm || '').toUpperCase() !== sku) throw new Error(`--commit requires --confirm ${sku}`);

// ---------- Inputs + integrity ----------
const read = (f) => JSON.parse(fs.readFileSync(path.join(inDir, f), 'utf8'));
const comparison = read('comparison.json');
const mannRows = read('mann-applications.json');
const currentRows = read('current-vehicle-applications.json');
const html = fs.readFileSync(path.join(inDir, 'mann-page.html'));
const pageSha = crypto.createHash('sha256').update(html).digest('hex');

const stop = (reason) => { throw new Error(`STOP_REVIEW: ${reason}`); };
if (comparison.sku !== sku) stop(`comparison.json is for ${comparison.sku}, not ${sku}`);
if (comparison.duty !== 'LIGHT_DUTY') stop(`duty ${comparison.duty} is not LIGHT_DUTY`);
if (pageSha !== comparison.source.page_sha256) stop('mann-page.html does not match page_sha256 in comparison.json');
if (!/^https:\/\/www\.mann-filter\.com\//.test(comparison.source.url)) stop('source URL is not mann-filter.com');
if (comparison.counts.matched_engine_code_mismatch !== 0) stop('engine-code mismatches between MANN and current rows');
if (!mannRows.length) stop('no MANN rows');
// Operator ruling 2026-10-24: MANN WD codes are Heavy Duty and must not be published in LD.
if (/^\s*WD/i.test(String(comparison.mann_code || ''))) stop(`MANN WD code ${comparison.mann_code} is HD; not published in LD`);
// Exact identity: the page title must name this code as a whole token
// ("C 37" must not be satisfied by "C 37 001").
const normTitle = String(comparison.source.title || '').toUpperCase().replace(/[^A-Z0-9 ]/g, ' ');
const codeTokens = String(comparison.mann_code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const titleCompact = normTitle.replace(/MANN FILTER/g, ' ').split(/\s+/).filter(Boolean);
const exact = titleCompact.some((_, i) => {
  let acc = '';
  for (let j = i; j < titleCompact.length; j++) { acc += titleCompact[j]; if (acc === codeTokens) return !/^\d/.test(titleCompact[j + 1] || ''); if (acc.length >= codeTokens.length) return false; }
  return false;
});
if (!exact) stop(`page title "${comparison.source.title}" is not an exact match for ${comparison.mann_code}`);
// LD family gate (repeated here so commits re-check it): EA3 engine air excludes cabin filters.
{
  const t = String(comparison.source.title || '');
  const fam = sku.slice(0, 3);
  const ok = fam === 'EA3' ? /air filter/i.test(t) && !/cabin|interior/i.test(t)
    : fam === 'EC3' ? /cabin|interior/i.test(t)
    : fam === 'EL3' ? /oil filter/i.test(t)
    : fam === 'EF3' ? /fuel filter/i.test(t) : true;
  if (!ok) stop(`FAMILY_MISMATCH: ${sku} vs "${t}"`);
}

// ---------- Target payload (MANN official rows, structured) ----------
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined && v !== ''));
const payload = mannRows
  .map((r) => clean({
    make: r.make,
    model: r.model,
    year: r.year,
    year_from: r.year_from,
    year_to: r.year_to,
    production_period: r.year ? null : r.production_text,
    engine: r.engine,
    engine_code: r.engine_code,
    displacement_ccm: r.displacement_ccm,
    kw: r.kw,
    hp: r.hp,
    equipment_options: r.equipment_options,
  }))
  .sort((a, b) => (b.year || '').localeCompare(a.year || '') || String(a.make).localeCompare(String(b.make)) || a.model.localeCompare(b.model) || String(a.equipment_options || '').localeCompare(String(b.equipment_options || '')));

// Rows the official page does not support are not migrated; kept for review.
const reviewKeys = new Set(comparison.only_in_current_all || []);
fs.writeFileSync(path.join(inDir, 'review-not-migrated.json'), JSON.stringify({
  sku, reason: 'NOT_LISTED_ON_OFFICIAL_MANN_PAGE', source_url: comparison.source.url,
  keys: [...reviewKeys], current_rows_snapshot: currentRows,
}, null, 2));

// ---------- DB ----------
const dbUrl = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
if (!dbUrl) throw new Error('CATALOG_DATABASE_URL is required');
if (!/@(127\.0\.0\.1|localhost)[:/]/.test(dbUrl)) stop('database is not local (127.0.0.1/localhost)');
const db = new pg.Client({ connectionString: dbUrl });
await db.connect();

const guardState = async () => {
  const { rows: [r] } = await db.query('SELECT sku, vehicle_applications FROM public.elimfilters_catalog WHERE sku=$1', [sku]);
  const out = await governApplicationPresentation({ results: [{ sku: r.sku, vehicle_applications: r.vehicle_applications }] }, db);
  const p = out.results[0];
  return { ...p.application_validation.vehicle_applications, visible_rows: p.vehicle_applications.length };
};

const report = { sku, mode: commit ? 'COMMIT' : 'DRY_RUN_ROLLBACK', source: comparison.source };
try {
  await db.query('BEGIN');
  const { rows: [before] } = await db.query(
    'SELECT md5(vehicle_applications::text) h, jsonb_array_length(vehicle_applications) n, catalog_active, duty FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [sku]);
  // Retired rows never receive applications; LD only.
  if (!before.catalog_active) stop('SKU is inactive/retired');
  if (before.duty !== 'LIGHT_DUTY') stop(`SKU duty is ${before.duty}`);
  if (before.h !== comparison.current_vehicle_db_hash) stop('vehicle_applications changed since the pilot ran; rerun the pilot');
  report.before = { rows: before.n, guard: await guardState() };

  report.write = await applyVerifiedApplications(db, {
    sku,
    vehicle_applications: payload,
    evidence: {
      authority: 'MANN_OFFICIAL_CATALOG',
      source_url: comparison.source.url,
      evidence_hash: pageSha,
      metadata: {
        mann_code: comparison.mann_code,
        page_title: comparison.source.title,
        captured_at: comparison.generated_at,
        rows: payload.length,
        not_migrated_review_keys: reviewKeys.size,
        kw_hp_anomalies_set_to_null: comparison.kw_hp_anomalies_set_to_null,
      },
    },
  });

  const { rows: [cache] } = await db.query("SELECT to_regproc('public.refresh_crossref_cache_sku') IS NOT NULL AS ok");
  if (cache.ok) { await db.query('SELECT public.refresh_crossref_cache_sku($1)', [sku]); report.crossref_cache_refreshed = true; }

  const { rows: [after] } = await db.query(
    'SELECT jsonb_array_length(vehicle_applications) n FROM public.elimfilters_catalog WHERE sku=$1', [sku]);
  const { rows: ev } = await db.query(
    'SELECT application_kind, evidence_authority, verified FROM public.catalog_application_evidence WHERE sku=$1 ORDER BY 1', [sku]);
  report.after = { rows: after.n, guard: await guardState(), evidence: ev };
  if (report.after.guard.state !== 'EVIDENCE_VERIFIED') stop(`guard after write is ${report.after.guard.state}; nothing committed`);

  await db.query(commit ? 'COMMIT' : 'ROLLBACK');
  report.result = commit ? 'COMMITTED' : 'ROLLED_BACK_NO_CHANGES';
} catch (e) {
  await db.query('ROLLBACK').catch(() => {});
  report.result = 'ROLLED_BACK_ERROR';
  report.error = e.message;
  process.exitCode = 1;
} finally {
  await db.end();
}
report.not_migrated_review_file = path.join(inDir, 'review-not-migrated.json');
console.log(JSON.stringify(report, null, 2));
