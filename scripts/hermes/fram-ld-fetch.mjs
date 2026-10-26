#!/usr/bin/env node
// PHASE A (read-only on the DB) - FRAM official catalogue evidence for NON-EUROPEAN LD SKUs.
// Policy (Victor 2026-10-04): LD non-European vehicles -> FRAM base; European -> MANN.
//
// Per SKU: resolve the FRAM base code, download the official FRAM catalogue bundle
// (scripts/hermes/lib/fram-usa-smtp-client.mjs: part, attributes, applications, cross references),
// save it as evidence (fram-bundle.json + sha256) and classify:
//   ELIGIBLE | NO_FRAM_BASE_CODE | FRAM_NOT_FOUND | DIGITS_MISMATCH | FAMILY_MISMATCH |
//   EUROPEAN_ORIGIN (MANN base) | NO_IDENTITY_PROOF (0 matching applications and 0 shared OE numbers)
// FRAM base code, in order: canonical source FRAM; LD canonical identity FRAM ACTIVE; single relational
// source_sku from FRAM_LD_MULTI_REGION; exactly one FRAM code in competitor/oem codes with the SKU's
// last four digits. Nothing is written to the database. Writes happen only in fram-ld-apply.mjs.
//
// Usage: node scripts/hermes/fram-ld-fetch.mjs [--prefix EA3] [--after EA30000] [--limit 5000] [--delay-ms 500]

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import pg from 'pg';
import { loadPublicCatalogConfig, fetchFramPartBundle } from './lib/fram-usa-smtp-client.mjs';
import { originGroupOf } from './ld-origin-group.mjs';
import { norm, last4, codeOf, framBase, currentParts, matchesCurrent, yearSet } from './lib/ld-fram-base.mjs';

const require = createRequire(import.meta.url);
const { splitCrossReferences, selectAutomotiveApplications } = require('../../lib/knowledge-governance/fram-usa-ld-enrichment');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, cur, i, arr) => {
  if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return acc;
}, []));
const limit = Number(args.limit || 5000);
const delayMs = Number(args['delay-ms'] || 500);
const prefix = args.prefix ? String(args.prefix).toUpperCase() : null;
const after = args.after ? String(args.after).toUpperCase() : null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FAMILY = { EA3: /air filter/i, EC3: /cabin/i, EL3: /oil filter/i, EF3: /fuel/i };
const notCabin = (fam, t) => fam !== 'EA3' || !/cabin/i.test(t);

const url = process.env.CATALOG_DATABASE_URL;
if (!url) throw new Error('CATALOG_DATABASE_URL is required');
const db = new pg.Client({ connectionString: url });
await db.connect();
let targets;
try {
  await db.query('BEGIN READ ONLY');
  ({ rows: targets } = await db.query(`
    WITH rel AS (
      SELECT elimfilters_sku sku, min(btrim(source_sku)) code, count(DISTINCT upper(regexp_replace(source_sku,'[^A-Za-z0-9]','','g'))) k
      FROM ld_catalog.ld_vehicle_applications WHERE source_origin='FRAM_LD_MULTI_REGION' AND nullif(btrim(source_sku),'') IS NOT NULL GROUP BY 1)
    SELECT c.sku, c.codigo_base, c.canonical_source_brand, c.canonical_source_code, c.canonical_source_status,
           i.canonical_part_number AS identity_fram, rel.code AS rel_code, rel.k AS rel_k,
           c.competitor_codes, c.oem_codes, c.vehicle_applications, md5(c.vehicle_applications::text) AS vehicle_db_hash
    FROM public.elimfilters_catalog c
    LEFT JOIN ld_catalog.ld_canonical_product_identity i ON i.elimfilters_sku=c.sku AND i.status='ACTIVE' AND i.canonical_brand='FRAM'
    LEFT JOIN rel ON rel.sku=c.sku
    WHERE c.catalog_active AND c.duty='LIGHT_DUTY'
      AND NOT (upper(coalesce(c.canonical_source_status,'')) IN ('VERIFIED','EXCEPTION_CONFIRMED') AND coalesce(c.canonical_source_brand,'') ~* '^MANN')
      AND NOT EXISTS (SELECT 1 FROM public.catalog_application_evidence e WHERE e.sku=c.sku AND e.application_kind='VEHICLE' AND e.verified
                      AND e.payload_hash=md5(c.vehicle_applications::text))
      AND ($1::text IS NULL OR c.sku LIKE $1::text || '%')
      AND ($2::text IS NULL OR c.sku > $2::text)
    ORDER BY c.sku LIMIT $3`, [prefix, after, limit]));
} finally { await db.query('ROLLBACK').catch(() => {}); await db.end(); }

const config = await loadPublicCatalogConfig();
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const runDir = path.resolve('out', 'fram-batch', runId);
fs.mkdirSync(runDir, { recursive: true });
const rows = [];
const save = () => fs.writeFileSync(path.join(runDir, 'summary.json'), JSON.stringify({ run_id: runId, prefix, after, limit, data_url: config.dataUrl, rows }, null, 2));

for (const [i, t] of targets.entries()) {
  const [code, baseSource] = framBase(t);
  const row = { sku: t.sku, fram_code: code, base_source: baseSource, vehicle_db_hash: t.vehicle_db_hash, eligible: false, reason: null };
  const done = () => { rows.push(row); console.log(`[${i + 1}/${targets.length}] ${t.sku} ${code || '-'}\t${row.eligible ? 'ELIGIBLE' : 'HOLD'}\t${row.reason}`); if ((i + 1) % 25 === 0) save(); };
  if (!code) { row.reason = baseSource === 'MULTIPLE_FRAM_CODES' ? 'MULTIPLE_FRAM_CODES' : 'NO_FRAM_BASE_CODE'; done(); continue; }
  if (last4(code) !== last4(t.sku)) { row.reason = 'DIGITS_MISMATCH'; done(); continue; }
  let bundle;
  try { bundle = await fetchFramPartBundle(code, { config }); }
  catch (e) { row.reason = `FETCH_FAILED: ${e.message}`.slice(0, 160); done(); await sleep(delayMs); continue; }
  if (!bundle.found) { row.reason = 'FRAM_NOT_FOUND'; done(); await sleep(delayMs); continue; }
  const dir = path.join(runDir, t.sku); fs.mkdirSync(dir, { recursive: true });
  const evidence = { captured_at: new Date().toISOString(), source: config.source, data_url: config.dataUrl, part: bundle.part,
    attributes: bundle.attributes, applications: bundle.applications, cross_references: bundle.cross_references, totals: bundle.totals };
  const raw = JSON.stringify(evidence, null, 2);
  fs.writeFileSync(path.join(dir, 'fram-bundle.json'), raw);
  row.bundle_sha256 = crypto.createHash('sha256').update(raw).digest('hex');
  row.dir = dir; row.part_type = bundle.part.part_type; row.part_key = bundle.part.part_key;

  const fam = t.sku.slice(0, 3);
  const apps = selectAutomotiveApplications(bundle.applications);
  row.fram_apps = apps.length;
  const origin = originGroupOf(apps);
  row.origin = origin;
  const cur = (Array.isArray(t.vehicle_applications) ? t.vehicle_applications : []).map(currentParts);
  row.current_rows = cur.length;
  row.matched_apps = apps.filter((a) => matchesCurrent({ make: a.make, model: a.model, years: yearSet(a.year) }, cur)).length;
  const skuOe = new Set([...(t.oem_codes || [])].map((e) => norm(codeOf(e))).filter((x) => x.length >= 4));
  const split = splitCrossReferences(bundle.cross_references, bundle.part.part_number);
  const pageOe = [...split.oem_candidates, ...split.unresolved_cross_candidates].map((o) => norm(o.part_number)).filter((x) => x.length >= 4);
  row.oe_overlap = [...new Set(pageOe.filter((x) => skuOe.has(x)))].length;

  if (FAMILY[fam] && (!FAMILY[fam].test(row.part_type || '') || !notCabin(fam, row.part_type || ''))) row.reason = `FAMILY_MISMATCH: ${row.part_type}`;
  else if (!apps.length) row.reason = 'NO_FRAM_APPLICATIONS';
  else if (origin.group === 'EUROPEAN') row.reason = 'EUROPEAN_ORIGIN';
  else if (row.matched_apps < 1 && row.oe_overlap < 1) row.reason = 'NO_IDENTITY_PROOF';
  else { row.eligible = true; row.reason = 'OK'; }
  done();
  await sleep(delayMs);
}
save();
const eligible = rows.filter((r) => r.eligible).length;
console.log(JSON.stringify({ run_dir: runDir, processed: rows.length, eligible, hold: rows.length - eligible,
  hold_reasons: rows.filter((r) => !r.eligible).reduce((m, r) => { const k = String(r.reason).split(':')[0]; m[k] = (m[k] || 0) + 1; return m; }, {}),
  summary: path.join(runDir, 'summary.json') }, null, 2));
