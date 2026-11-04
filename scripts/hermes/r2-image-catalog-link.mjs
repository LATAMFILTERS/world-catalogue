#!/usr/bin/env node
// Links each catalogue SKU to its product image already published in Cloudflare R2 (bucket elimfilters-renders,
// public CDN https://cdn.elimfilters.com/<key>). Input: the bucket listing (aws s3api list-objects-v2 JSON).
//
// Per object: the ELIMFILTERS SKU is read from the file name (EF96745-SYNTAPORE-approved-opt.png, EF97440.png,
// fleetguard_ET97784.png). Per SKU one image is chosen:
//   - an "approved" file wins (Branding-approved naming); several approved -> newest, flagged;
//   - otherwise a single plain <SKU>.png; several unapproved -> MULTIPLE_UNAPPROVED (held).
// Checks before writing: SKU active in the catalogue; technology word in the file name (if any) equals the catalogue
// technology; the CDN URL answers 200 with an image content type.
// Approved images are written by default; unapproved ones only with --include-unapproved (image governance: catalog
// visual = approved masters). image_evidence.verified=true only for approved files.
// Existing different image_url values are kept unless --replace-existing (the previous value is preserved in evidence).
//
// DRY RUN by default (ROLLBACK). Execute: --inventory <json> --execute --confirm-count <written in the dry run>.

import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, cur, i, arr) => {
  if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return acc;
}, []));
if (!args.inventory) throw new Error('--inventory <out/r2-inventory/elimfilters-renders.json> is required');
const execute = args.execute === 'true';
const includeUnapproved = args['include-unapproved'] === 'true';
const replaceExisting = args['replace-existing'] === 'true';
const CDN = 'https://cdn.elimfilters.com/';
const TECH = ['MACROCORE', 'MICROKAPPA', 'DRYCORE', 'INTEKCORE', 'SYNTAPORE', 'HYDROCORE', 'TURBOCORE', 'SYNTRAX', 'NANOFORCE', 'THERMACORE'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const raw = JSON.parse(fs.readFileSync(args.inventory, 'utf8'));
const objects = (raw.Contents || raw).map((o) => ({ key: o.Key || o.key, size: o.Size ?? o.size, modified: o.LastModified || o.uploaded || null, etag: String(o.ETag || o.etag || '').replace(/"/g, '') }));
const images = objects.filter((o) => /\.(png|webp|jpe?g)$/i.test(o.key || ''));

const bySku = new Map(); const unparsed = [];
for (const o of images) {
  const base = path.posix.basename(o.key);
  const m = /^(?:fleetguard_)?(E[A-Z]\d{5})(?=[-_.]|$)/i.exec(base);
  if (!m) { unparsed.push(o.key); continue; }
  const sku = m[1].toUpperCase();
  const tech = TECH.find((t) => new RegExp(`(^|[-_])${t}([-_.]|$)`, 'i').test(base)) || null;
  (bySku.get(sku) || bySku.set(sku, []).get(sku)).push({ ...o, base, tech, approved: /approved/i.test(base) });
}

const url = process.env.CATALOG_DATABASE_URL;
if (!url) throw new Error('CATALOG_DATABASE_URL is required');
if (!/@(127\.0\.0\.1|localhost)[:/]/.test(url)) throw new Error('database is not local');
const db = new pg.Client({ connectionString: url });
await db.connect();
const report = { mode: execute ? 'EXECUTE' : 'DRY_RUN_ROLLBACK', inventory_objects: objects.length, image_objects: images.length,
  unparsed_names: unparsed, written: [], held: [], unchanged: [] };
try {
  await db.query('BEGIN');
  const { rows } = await db.query(`SELECT sku, technology, image_url, catalog_active, enrichment_data FROM public.elimfilters_catalog WHERE sku = ANY($1)`, [[...bySku.keys()]]);
  const cat = new Map(rows.map((r) => [r.sku, r]));
  for (const [sku, list] of [...bySku.entries()].sort()) {
    const hold = (reason, extra = {}) => report.held.push({ sku, reason, keys: list.map((x) => x.key), ...extra });
    const row = cat.get(sku);
    if (!row) { hold('SKU_NOT_IN_CATALOG'); continue; }
    if (!row.catalog_active) { hold('SKU_INACTIVE'); continue; }
    const approved = list.filter((x) => x.approved).sort((a, b) => String(b.modified).localeCompare(String(a.modified)));
    let pick = approved[0] || null; let note = approved.length > 1 ? `NEWEST_OF_${approved.length}_APPROVED` : null;
    if (!pick) {
      if (!includeUnapproved) { hold('UNAPPROVED_ONLY', { hint: 'run with --include-unapproved to link it' }); continue; }
      if (list.length > 1) { hold('MULTIPLE_UNAPPROVED'); continue; }
      pick = list[0];
    }
    const catTech = String(row.technology || '').toUpperCase().replace(/[^A-Z]/g, '');
    if (pick.tech && catTech && pick.tech !== catTech) { hold('TECHNOLOGY_MISMATCH', { file_tech: pick.tech, catalog_tech: catTech }); continue; }
    const cdnUrl = CDN + pick.key.split('/').map(encodeURIComponent).join('/');
    let status = 0; let ctype = '';
    try { const r = await fetch(cdnUrl, { method: 'HEAD' }); status = r.status; ctype = r.headers.get('content-type') || ''; } catch (e) { ctype = e.message; }
    await sleep(100);
    if (status !== 200 || !/^image\//i.test(ctype)) { hold('CDN_NOT_REACHABLE', { cdn_url: cdnUrl, status, ctype }); continue; }
    if (row.image_url === cdnUrl) { report.unchanged.push(sku); continue; }
    if (row.image_url && !replaceExisting) { hold('HAS_DIFFERENT_IMAGE', { current: row.image_url, proposed: cdnUrl }); continue; }
    const evidence = { source: 'R2:elimfilters-renders', r2_key: pick.key, cdn_url: cdnUrl, etag: pick.etag, size: pick.size, last_modified: pick.modified,
      approved_naming: pick.approved, verified: pick.approved, note, previous_image_url: row.image_url || null,
      checked: { http_status: status, content_type: ctype }, recorded_at: new Date().toISOString() };
    await db.query(`UPDATE public.elimfilters_catalog SET image_url = $2,
        enrichment_data = jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{image_evidence}', $3::jsonb) WHERE sku = $1 AND catalog_active`,
      [sku, cdnUrl, JSON.stringify(evidence)]);
    report.written.push({ sku, key: pick.key, approved: pick.approved, replaced: row.image_url || null });
  }
  if (execute && Number(args['confirm-count']) !== report.written.length) {
    throw new Error(`--confirm-count must equal the dry-run written count (${report.written.length}); nothing committed`);
  }
  await db.query(execute ? 'COMMIT' : 'ROLLBACK');
  report.transaction = execute ? 'COMMIT' : 'ROLLBACK';
} catch (e) {
  await db.query('ROLLBACK').catch(() => {});
  report.transaction = 'ROLLBACK_ERROR'; report.error = e.message; process.exitCode = 1;
} finally { await db.end(); }
const outDir = path.resolve('out', 'r2-image-link'); fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `link-${execute ? 'execute' : 'dryrun'}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(out, JSON.stringify(report, null, 2));
const reasons = report.held.reduce((m, h) => { m[h.reason] = (m[h.reason] || 0) + 1; return m; }, {});
console.log(JSON.stringify({ mode: report.mode, objects: report.inventory_objects, images: report.image_objects, skus_in_bucket: bySku.size,
  written: report.written.length, written_approved: report.written.filter((w) => w.approved).length, unchanged: report.unchanged.length,
  held: report.held.length, held_reasons: reasons, unparsed_names: unparsed.length,
  sample: report.written.slice(0, 6).map((w) => `${w.sku} <- ${w.key}`),
  held_sample: Object.keys(reasons).flatMap((k) => report.held.filter((h) => h.reason === k).slice(0, 3).map((h) => `${h.sku} ${h.reason} ${h.keys.join(' | ')}`)),
  unparsed_sample: unparsed.slice(0, 6), transaction: report.transaction, error: report.error, file: out }, null, 2));
