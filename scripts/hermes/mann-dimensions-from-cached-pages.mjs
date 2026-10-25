#!/usr/bin/env node
// Official MANN product dimensions for LD SKUs, taken from the MANN product pages the
// vehicle-application batch already downloaded and bound as evidence.
//
// A SKU qualifies only if:
//   - it has VEHICLE evidence from MANN_OFFICIAL_CATALOG that matches its current payload, and
//   - a cached mann-page.html exists whose SHA-256 equals that evidence_hash (same page).
// Dimensions are parsed with lib/mann-official-spec-verifier.js (explicit labels only; anonymous
// A/B/C values are never mapped). Every parsed value must have a target column, otherwise the SKU is
// held as PARTIAL (no half-written dimension sets). An existing different value is a CONFLICT (held).
// Writes: the dimension columns, product_dimensions_source = 'OFFICIAL_MANN_PRODUCT_PAGE',
// product_dimensions_validation_status = 'FULL_PRODUCT_DIMENSIONS_OFFICIAL' (run_103 convention),
// and enrichment_data.dimension_evidence {url, sha256, values}.
//
// DRY RUN by default (ROLLBACK). Execute: --execute --confirm-count <N>.
// Usage: node scripts/hermes/mann-dimensions-from-cached-pages.mjs [--limit 5000]

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import pg from 'pg';

const require = createRequire(import.meta.url);
const { parseMannSummary, verifyProductIdentity } = require('../../lib/mann-official-spec-verifier.js');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, cur, i, arr) => {
  if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return acc;
}, []));
const execute = args.execute === 'true';
const limit = Number(args.limit || 5000);

// 1. Index cached pages by SHA-256 (out/mann-batch/<run>/<SKU>/ and out/mann-pilot/<dir>/).
const pageBySha = new Map();
for (const root of ['out/mann-batch', 'out/mann-pilot']) {
  if (!fs.existsSync(root)) continue;
  const walk = (dir, depth) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory() && depth < 3) walk(p, depth + 1);
      else if (ent.isFile() && ent.name === 'mann-page.html') {
        const html = fs.readFileSync(p);
        pageBySha.set(crypto.createHash('sha256').update(html).digest('hex'), p);
      }
    }
  };
  walk(root, 0);
}

const url = process.env.CATALOG_DATABASE_URL;
if (!url) throw new Error('CATALOG_DATABASE_URL is required');
if (!/@(127\.0\.0\.1|localhost)[:/]/.test(url)) throw new Error('database is not local');
const db = new pg.Client({ connectionString: url });
await db.connect();

const report = { mode: execute ? 'EXECUTE' : 'DRY_RUN_ROLLBACK', cached_pages: pageBySha.size, written: [], held: [] };
try {
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  const { rows: colRows } = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='elimfilters_catalog'`);
  const columns = new Set(colRows.map((r) => r.column_name));
  report.dimension_columns = ['outer_diameter_mm', 'outer_diameter_1_mm', 'inner_diameter_mm', 'inner_diameter_1_mm', 'gasket_od_mm', 'gasket_id_mm',
    'height_mm', 'product_length_mm', 'product_width_mm', 'inlet_mm', 'outlet_mm', 'thread_size'].filter((c) => columns.has(c));

  const { rows: targets } = await db.query(`
    SELECT c.sku, e.source_url, e.evidence_hash, c.product_dimensions_validation_status AS status, to_jsonb(c) AS row
    FROM public.elimfilters_catalog c
    JOIN public.catalog_application_evidence e
      ON e.sku = c.sku AND e.application_kind = 'VEHICLE' AND e.verified
     AND e.evidence_authority = 'MANN_OFFICIAL_CATALOG' AND e.payload_hash = md5(c.vehicle_applications::text)
    WHERE c.catalog_active AND c.duty = 'LIGHT_DUTY'
      AND coalesce(upper(c.product_dimensions_validation_status),'') NOT IN ('VERIFIED','FULL_PRODUCT_DIMENSIONS_OFFICIAL')
    ORDER BY c.sku LIMIT $1`, [limit]);
  report.candidates = targets.length;

  for (const t of targets) {
    const hold = (reason, extra = {}) => report.held.push({ sku: t.sku, reason, ...extra });
    const file = pageBySha.get(t.evidence_hash);
    if (!file) { hold('NO_CACHED_PAGE_FOR_EVIDENCE_HASH'); continue; }
    const html = fs.readFileSync(file, 'utf8');
    const code = (/MANN-FILTER\s+(.+?)\s+(?:Oil|Air|Cabin|Fuel|Hydraul|Secondary|Filter)/i.exec(verifyProductIdentity(html, '').title) || [])[1];
    const { values, summary } = parseMannSummary(html);
    // The shared parser lets "Inner diameter" also match "Inner diameter 1" (optional " 1").
    // If the page has only the "... 1" label, drop the duplicated plain value instead of inventing it.
    for (const [plain, one] of [['inner_diameter_mm', 'inner_diameter_1_mm'], ['outer_diameter_mm', 'outer_diameter_1_mm']]) {
      const label = plain.startsWith('inner') ? 'Inner diameter' : 'Outer diameter';
      const plainOnPage = new RegExp(`${label}(?!\\s*1)(?:\\s*\\([^)]*\\))?\\s*=`, 'i').test(summary || '');
      if (values[one] != null && values[plain] != null && !plainOnPage) delete values[plain];
    }
    const keys = Object.keys(values);
    if (!keys.length) { hold('NO_EXPLICIT_DIMENSIONS_ON_PAGE'); continue; }
    const unmapped = keys.filter((k) => !report.dimension_columns.includes(k));
    if (unmapped.length) { hold('PARTIAL_NO_COLUMN', { unmapped }); continue; }
    const conflicts = keys.filter((k) => t.row[k] != null && String(t.row[k]) !== String(values[k]) && Number(t.row[k]) !== Number(values[k]));
    if (conflicts.length) { hold('CONFLICT_WITH_EXISTING', { conflicts: conflicts.map((k) => `${k}: ${t.row[k]} vs ${values[k]}`) }); continue; }

    const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const params = [t.sku, ...keys.map((k) => values[k])];
    const n = params.length;
    const u = await db.query(
      `UPDATE public.elimfilters_catalog SET ${sets},
         product_dimensions_source = 'OFFICIAL_MANN_PRODUCT_PAGE',
         product_dimensions_validation_status = 'FULL_PRODUCT_DIMENSIONS_OFFICIAL',
         enrichment_data = jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{dimension_evidence}', $${n + 1}::jsonb)
       WHERE sku = $1 AND catalog_active`,
      [...params, JSON.stringify({ authority: 'MANN_OFFICIAL_CATALOG', source_url: t.source_url, page_sha256: t.evidence_hash, mann_code: code || null, values, captured_from: 'cached_vehicle_batch_page', recorded_at: new Date().toISOString() })]);
    if (u.rowCount !== 1) throw new Error(`UPDATE_COUNT ${t.sku}`);
    report.written.push({ sku: t.sku, values });
  }

  if (execute && Number(args['confirm-count']) !== report.written.length) {
    throw new Error(`--confirm-count must equal the dry-run written count (${report.written.length}); nothing committed`);
  }
  await db.query(execute ? 'COMMIT' : 'ROLLBACK');
  report.transaction = execute ? 'COMMIT' : 'ROLLBACK';
} catch (e) {
  await db.query('ROLLBACK').catch(() => {});
  report.transaction = 'ROLLBACK_ERROR';
  report.error = e.message;
  process.exitCode = 1;
} finally {
  await db.end();
}
const outDir = path.resolve('out', 'mann-dimensions'); fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `dimensions-${execute ? 'execute' : 'dryrun'}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(out, JSON.stringify(report, null, 2));
const reasons = report.held.reduce((m, h) => { m[h.reason] = (m[h.reason] || 0) + 1; return m; }, {});
console.log(JSON.stringify({ mode: report.mode, cached_pages: report.cached_pages, dimension_columns: report.dimension_columns, candidates: report.candidates,
  written: report.written.length, held: report.held.length, held_reasons: reasons,
  sample: report.written.slice(0, 5).map((w) => `${w.sku} ${JSON.stringify(w.values)}`),
  unmapped_sample: report.held.filter((h) => h.unmapped).slice(0, 3).map((h) => `${h.sku} ${h.unmapped.join(',')}`),
  transaction: report.transaction, error: report.error, file: out }, null, 2));
