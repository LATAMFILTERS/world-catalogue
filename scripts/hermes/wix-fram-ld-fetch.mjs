#!/usr/bin/env node
// PHASE A (read-only on the DB) - WIX official catalogue as SECONDARY evidence for NON-EUROPEAN LD SKUs
// whose base must be FRAM (policy Victor 2026-10-04) while the FRAM official data endpoint is blocked (Incapsula 403).
// The FRAM code stays the base; WIX (Mann+Hummel) supplies the published FRAM -> WIX interchange, the
// WIX product specs/dimensions and vehicle applications. Nothing is written to the database.
//
// Per SKU:
//   1. resolve the FRAM base code (lib/ld-fram-base.mjs, same rules as fram-ld-fetch.mjs);
//   2. WIX Exactmatch for that code; keep only rows Manufacturer=FRAM with the exact (normalized) FRAM code;
//   3. per distinct WIX part: detail page (style, dimensions) + applications page;
//   4. pick the WIX part by identity, never by order:
//        family gate (WIX style vs SKU prefix) AND >=1 WIX application matching the SKU payload (make/model/year);
//      exactly one passing part -> ELIGIBLE; several -> AMBIGUOUS_WIX_PARTS (held).
// Held reasons: NO_FRAM_BASE_CODE | MULTIPLE_FRAM_CODES | DIGITS_MISMATCH | WIX_NO_FRAM_CROSS | FAMILY_MISMATCH |
//   NO_WIX_APPLICATIONS | EUROPEAN_ORIGIN | NO_CURRENT_APPLICATIONS | NO_IDENTITY_PROOF | AMBIGUOUS_WIX_PARTS |
//   WIX_APPS_PAGINATED | FETCH_FAILED
// Evidence (raw HTML of the 3 pages + sha256) is saved per SKU under out/wix-batch/<run>/<sku>/.
//
// Usage: node scripts/hermes/wix-fram-ld-fetch.mjs [--prefix EA3] [--after EA30000] [--limit 5000] [--delay-ms 600]

import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { originGroupOf } from './ld-origin-group.mjs';
import { norm, last4, framBase, currentParts, matchesCurrent } from './lib/ld-fram-base.mjs';
import { WIX_BASE, wixGet, sha256, parseExactMatch, parsePartDetails, parsePartApplications } from './lib/wix-catalog-client.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, cur, i, arr) => {
  if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return acc;
}, []));
const limit = Number(args.limit || 5000);
const delayMs = Number(args['delay-ms'] || 600);
const prefix = args.prefix ? String(args.prefix).toUpperCase() : null;
const after = args.after ? String(args.after).toUpperCase() : null;
const FAMILY = {
  EA3: (s) => /air/i.test(s) && !/cabin/i.test(s),
  EC3: (s) => /cabin/i.test(s),
  EL3: (s) => /oil|lube/i.test(s),
  EF3: (s) => /fuel/i.test(s),
};

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
    SELECT c.sku, c.canonical_source_brand, c.canonical_source_code, c.canonical_source_status,
           i.canonical_part_number AS identity_fram, rel.code AS rel_code, rel.k AS rel_k,
           c.competitor_codes, c.oem_codes, c.vehicle_applications, md5(c.vehicle_applications::text) AS vehicle_db_hash,
           (SELECT e.evidence_authority FROM public.catalog_application_evidence e WHERE e.sku=c.sku AND e.application_kind='VEHICLE'
              AND e.verified AND e.payload_hash=md5(c.vehicle_applications::text) ORDER BY e.created_at DESC LIMIT 1) AS current_vehicle_authority
    FROM public.elimfilters_catalog c
    LEFT JOIN ld_catalog.ld_canonical_product_identity i ON i.elimfilters_sku=c.sku AND i.status='ACTIVE' AND i.canonical_brand='FRAM'
    LEFT JOIN rel ON rel.sku=c.sku
    WHERE c.catalog_active AND c.duty='LIGHT_DUTY'
      AND upper(coalesce(c.canonical_source_status,'')) NOT IN ('VERIFIED','EXCEPTION_CONFIRMED')
      AND ($1::text IS NULL OR c.sku LIKE $1::text || '%')
      AND ($2::text IS NULL OR c.sku > $2::text)
    ORDER BY c.sku LIMIT $3`, [prefix, after, limit]));
} finally { await db.query('ROLLBACK').catch(() => {}); await db.end(); }

const runId = new Date().toISOString().replace(/[:.]/g, '-');
const runDir = path.resolve('out', 'wix-batch', runId);
fs.mkdirSync(runDir, { recursive: true });
const rows = [];
const save = () => fs.writeFileSync(path.join(runDir, 'summary.json'), JSON.stringify({ run_id: runId, prefix, after, limit, source: WIX_BASE, rows }, null, 2));
const stylesSeen = {}; const specLabels = {};

for (const [i, t] of targets.entries()) {
  const [code, baseSource] = framBase(t);
  const fam = t.sku.slice(0, 3);
  const row = { sku: t.sku, fram_code: code, base_source: baseSource, vehicle_db_hash: t.vehicle_db_hash,
    current_vehicle_authority: t.current_vehicle_authority || null, eligible: false, reason: null };
  const done = () => { rows.push(row); console.log(`[${i + 1}/${targets.length}] ${t.sku} ${code || '-'} -> ${row.wix_part || '-'}\t${row.eligible ? 'ELIGIBLE' : 'HOLD'}\t${row.reason}`); if ((i + 1) % 25 === 0) save(); };
  if (!code) { row.reason = baseSource === 'MULTIPLE_FRAM_CODES' ? 'MULTIPLE_FRAM_CODES' : 'NO_FRAM_BASE_CODE'; done(); continue; }
  if (last4(code) !== last4(t.sku)) { row.reason = 'DIGITS_MISMATCH'; done(); continue; }
  try {
    const em = await wixGet(`${WIX_BASE}Exactmatch.aspx?PartNo=${encodeURIComponent(code)}`, { delayMs });
    const cross = parseExactMatch(em.html).filter((r) => /^FRAM$/i.test(r.manufacturer) && norm(r.code) === norm(code) && r.detail_id);
    const parts = [...new Map(cross.map((r) => [norm(r.wix_part), r])).values()];
    row.wix_candidates = parts.map((p) => p.wix_part);
    if (!parts.length) { row.reason = 'WIX_NO_FRAM_CROSS'; done(); continue; }
    const cur = (Array.isArray(t.vehicle_applications) ? t.vehicle_applications : []).map(currentParts);
    row.current_rows = cur.length;
    const evaluated = [];
    for (const p of parts) {
      const det = await wixGet(`${WIX_BASE}PartDetails.aspx?Part=${p.detail_id}`, { delayMs });
      const d = parsePartDetails(det.html);
      const appsPart = d.apps_link_part || p.wix_part;
      const ap = await wixGet(`${WIX_BASE}PartApplications.aspx?Part=${encodeURIComponent(appsPart)}`, { delayMs });
      const a = parsePartApplications(ap.html);
      stylesSeen[d.style || '-'] = (stylesSeen[d.style || '-'] || 0) + 1;
      for (const k of Object.keys(d.specs)) specLabels[k] = (specLabels[k] || 0) + 1;
      const styleText = `${d.style || ''} ${d.service || ''}`;
      evaluated.push({ p, d, a, em, det, ap,
        family_ok: FAMILY[fam] ? FAMILY[fam](styleText) : true,
        identity_ok: d.part_number ? norm(d.part_number) === norm(p.wix_part) : false,
        matched: a.apps.filter((x) => matchesCurrent(x, cur)).length,
        origin: originGroupOf(a.apps) });
    }
    row.candidates = evaluated.map((e) => ({ wix_part: e.p.wix_part, style: e.d.style, family_ok: e.family_ok, identity_ok: e.identity_ok,
      wix_apps: e.a.apps.length, matched_apps: e.matched, origin: e.origin.group, paginated: e.a.paginated }));
    const passing = evaluated.filter((e) => e.family_ok && e.identity_ok && e.matched >= 1);
    const famOk = evaluated.filter((e) => e.family_ok && e.identity_ok);
    if (!famOk.length) row.reason = `FAMILY_MISMATCH: ${evaluated.map((e) => e.d.style).join(' / ')}`;
    else if (!famOk.some((e) => e.a.apps.length)) row.reason = 'NO_WIX_APPLICATIONS';
    else if (!cur.length) row.reason = 'NO_CURRENT_APPLICATIONS';
    else if (passing.length > 1) row.reason = 'AMBIGUOUS_WIX_PARTS';
    else if (!passing.length) row.reason = 'NO_IDENTITY_PROOF';
    else {
      const e = passing[0];
      row.wix_part = e.p.wix_part; row.wix_detail_id = e.p.detail_id; row.origin = e.origin; row.matched_apps = e.matched; row.wix_apps = e.a.apps.length;
      if (e.a.paginated) row.reason = 'WIX_APPS_PAGINATED';
      else if (e.origin.group === 'EUROPEAN') row.reason = 'EUROPEAN_ORIGIN';
      else {
        const dir = path.join(runDir, t.sku); fs.mkdirSync(dir, { recursive: true });
        const pages = { exactmatch: e.em, details: e.det, applications: e.ap };
        row.pages = {};
        for (const [k, v] of Object.entries(pages)) { fs.writeFileSync(path.join(dir, `wix-${k}.html`), v.html); row.pages[k] = { url: v.url, sha256: sha256(v.html) }; }
        const evidence = { captured_at: new Date().toISOString(), authority: 'WIX_OFFICIAL_CATALOG', fram_code: code, wix_part: e.p.wix_part,
          cross_rows: cross.filter((r) => norm(r.wix_part) === norm(e.p.wix_part)), details: e.d,
          applications: e.a.apps.map((x) => ({ make: x.make, model: x.model, year_text: x.year_text, engine: x.engine })), pages: row.pages };
        fs.writeFileSync(path.join(dir, 'wix-evidence.json'), JSON.stringify(evidence, null, 2));
        row.dir = dir; row.style = e.d.style;
        row.dims_mm = Object.fromEntries(Object.entries(e.d.specs).filter(([, v]) => v.mm != null).map(([k, v]) => [k, v.mm]));
        row.eligible = true; row.reason = 'OK';
      }
    }
  } catch (e) { row.reason = `FETCH_FAILED: ${e.message}`.slice(0, 160); }
  done();
}
save();
const eligible = rows.filter((r) => r.eligible);
console.log(JSON.stringify({ run_dir: runDir, processed: rows.length, eligible: eligible.length, hold: rows.length - eligible.length,
  hold_reasons: rows.filter((r) => !r.eligible).reduce((m, r) => { const k = String(r.reason).split(':')[0]; m[k] = (m[k] || 0) + 1; return m; }, {}),
  eligible_with_current_mann_evidence: eligible.filter((r) => r.current_vehicle_authority === 'MANN_OFFICIAL_CATALOG').length,
  wix_styles: stylesSeen, spec_labels: specLabels, summary: path.join(runDir, 'summary.json') }, null, 2));
