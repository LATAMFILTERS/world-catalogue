#!/usr/bin/env node
// Governed exact references (public.exact_part_reference) for LD SKUs whose applications are
// already verified against the official MANN page, using that same cached page as evidence:
//   COMPETITOR  MANN-FILTER <base code>   (the page title must name the code exactly)
//   OEM         <manufacturer> <OE number> from the page's "OE Numbers" tab
// Only SKUs with VEHICLE evidence MANN_OFFICIAL_CATALOG matching the current payload, whose cached
// mann-page.html has the same SHA-256 as that evidence. Nothing is deleted; existing rows stay.
// A code already registered (same type + brand + number) for a DIFFERENT active SKU is not added
// (reported as conflict). Part Search exact lookup only uses DONALDSON / SUPERSEDED rows, so these
// rows do not change search answers; they are evidence for catalogue readiness.
//
// DRY RUN by default (ROLLBACK). Execute: --execute --confirm-count <SKUs written in the dry run>.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import pg from 'pg';

const require = createRequire(import.meta.url);
const { parseMannOeNumbers, verifyProductIdentity, normalizePart } = require('../../lib/mann-official-spec-verifier.js');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, cur, i, arr) => {
  if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return acc;
}, []));
const execute = args.execute === 'true';
const SOURCE = 'MANN_OFFICIAL_PAGE_OE_20261025';

const pageBySha = new Map();
for (const root of ['out/mann-batch', 'out/mann-pilot']) {
  if (!fs.existsSync(root)) continue;
  const walk = (dir, depth) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory() && depth < 3) walk(p, depth + 1);
      else if (ent.isFile() && ent.name === 'mann-page.html') pageBySha.set(crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'), p);
    }
  };
  walk(root, 0);
}

const url = process.env.CATALOG_DATABASE_URL;
if (!url) throw new Error('CATALOG_DATABASE_URL is required');
if (!/@(127\.0\.0\.1|localhost)[:/]/.test(url)) throw new Error('database is not local');
const db = new pg.Client({ connectionString: url });
await db.connect();

const report = { mode: execute ? 'EXECUTE' : 'DRY_RUN_ROLLBACK', cached_pages: pageBySha.size, written: [], held: [], conflicts: [] };
try {
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  const { rows: targets } = await db.query(`
    SELECT c.sku, e.source_url, e.evidence_hash, e.metadata->>'mann_code' AS mann_code
    FROM public.elimfilters_catalog c
    JOIN public.catalog_application_evidence e
      ON e.sku = c.sku AND e.application_kind = 'VEHICLE' AND e.verified
     AND e.evidence_authority = 'MANN_OFFICIAL_CATALOG' AND e.payload_hash = md5(c.vehicle_applications::text)
    WHERE c.catalog_active AND c.duty = 'LIGHT_DUTY'
      AND NOT EXISTS (SELECT 1 FROM public.exact_part_reference x WHERE x.sku = c.sku AND x.source = $1)
    ORDER BY c.sku`, [SOURCE]);
  report.candidates = targets.length;

  // Existing registrations: (type|brand|number) -> set of SKUs
  const { rows: existing } = await db.query(`
    SELECT x.reference_type, upper(regexp_replace(x.brand,'[^A-Za-z0-9]','','g')) b,
           upper(regexp_replace(x.part_number,'[^A-Za-z0-9]','','g')) n, x.sku
    FROM public.exact_part_reference x JOIN public.elimfilters_catalog c ON c.sku = x.sku AND c.catalog_active`);
  const owners = new Map();
  for (const r of existing) { const k = `${r.reference_type}|${r.b}|${r.n}`; if (!owners.has(k)) owners.set(k, new Set()); owners.get(k).add(r.sku); }

  for (const t of targets) {
    const file = pageBySha.get(t.evidence_hash);
    if (!file) { report.held.push({ sku: t.sku, reason: 'NO_CACHED_PAGE_FOR_EVIDENCE_HASH' }); continue; }
    if (!t.mann_code) { report.held.push({ sku: t.sku, reason: 'NO_MANN_CODE_IN_EVIDENCE' }); continue; }
    const html = fs.readFileSync(file, 'utf8');
    if (!verifyProductIdentity(html, t.mann_code).valid) { report.held.push({ sku: t.sku, reason: 'IDENTITY_MISMATCH' }); continue; }

    const refs = [{ type: 'COMPETITOR', brand: 'MANN-FILTER', code: t.mann_code }];
    const seen = new Set();
    for (const o of parseMannOeNumbers(html)) {
      if (!o.manufacturer || normalizePart(o.code).length < 4) continue;
      const k = `${normalizePart(o.manufacturer)}|${normalizePart(o.code)}`;
      if (seen.has(k)) continue; seen.add(k);
      refs.push({ type: 'OEM', brand: o.manufacturer, code: o.code });
    }
    let added = 0;
    for (const r of refs) {
      const key = `${r.type}|${normalizePart(r.brand)}|${normalizePart(r.code)}`;
      const other = [...(owners.get(key) || [])].filter((s) => s !== t.sku);
      if (other.length) { report.conflicts.push({ sku: t.sku, ref: `${r.type} ${r.brand} ${r.code}`, other }); continue; }
      const ins = await db.query(
        `INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`,
        [r.type, r.brand, r.code, t.sku, SOURCE]);
      added += ins.rowCount;
    }
    if (!added) { report.held.push({ sku: t.sku, reason: 'NOTHING_NEW_OR_ALL_CONFLICT' }); continue; }
    await db.query(
      `UPDATE public.elimfilters_catalog SET enrichment_data = jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{crossref_evidence}', $2::jsonb) WHERE sku=$1`,
      [t.sku, JSON.stringify({ authority: 'MANN_OFFICIAL_CATALOG', source_url: t.source_url, page_sha256: t.evidence_hash, mann_code: t.mann_code,
        references_added: added, source: SOURCE, recorded_at: new Date().toISOString() })]);
    report.written.push({ sku: t.sku, mann_code: t.mann_code, added });
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
const outDir = path.resolve('out', 'mann-oe-references'); fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `oe-refs-${execute ? 'execute' : 'dryrun'}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(out, JSON.stringify(report, null, 2));
const reasons = report.held.reduce((m, h) => { m[h.reason] = (m[h.reason] || 0) + 1; return m; }, {});
console.log(JSON.stringify({ mode: report.mode, cached_pages: report.cached_pages, candidates: report.candidates,
  written: report.written.length, references_added: report.written.reduce((n, w) => n + w.added, 0),
  held: report.held.length, held_reasons: reasons, conflicts: report.conflicts.length,
  sample: report.written.slice(0, 5).map((w) => `${w.sku} ${w.mann_code} +${w.added}`),
  conflict_sample: report.conflicts.slice(0, 5).map((c) => `${c.sku} ${c.ref} ya en ${c.other.join(',')}`),
  transaction: report.transaction, error: report.error, file: out }, null, 2));
