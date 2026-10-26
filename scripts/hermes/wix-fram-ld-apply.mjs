#!/usr/bin/env node
// PHASE B - write the ELIGIBLE rows of a wix-fram-ld-fetch.mjs summary (LD non-European, FRAM base, WIX evidence).
// Rule approved by Victor 2026-10-25: FRAM stays the base code for non-European LD; WIX (Mann+Hummel official
// catalogue, published FRAM -> WIX interchange) is the evidence for applications, dimensions and the cross.
// All-or-nothing per SKU (savepoint): if any step fails, that SKU is left exactly as it was.
//   1. vehicle_applications <- WIX automotive applications (make/model/years/engine) through
//      lib/catalog-application-write-service.js applyVerifiedApplications, authority WIX_OFFICIAL_CATALOG.
//      Previous (unverified) rows are kept in enrichment_data.replaced_vehicle_applications.
//   2. dimensions from the WIX detail page (mm values), only when not already verified; previous values kept
//      in dimension_evidence.replaced
//   3. exact_part_reference COMPETITOR FRAM <base> and COMPETITOR WIX <wix part>; WIX also added to competitor_codes
//      (codes registered for another active SKU are skipped)
//   4. canonical source FRAM (codigo_base, canonical_source_*, codigo_base_governance NON_EUROPEAN) through
//      lib/catalog-write-gateway.js assertCanonicalWrite, plus LD canonical identity when missing
// Guards re-checked here: active LD row, not MANN-verified (canonical or current application evidence), payload
// unchanged since the fetch, evidence file hash unchanged, origin NON_EUROPEAN, FRAM base not used by another SKU.
//
// DRY RUN by default (ROLLBACK). Execute: --summary <file> --execute --confirm-count <written in dry run>.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import pg from 'pg';
import { originGroupOf } from './ld-origin-group.mjs';
import { norm, codeOf, yearSet } from './lib/ld-fram-base.mjs';

const require = createRequire(import.meta.url);
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service.js');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway.js');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, cur, i, arr) => {
  if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return acc;
}, []));
if (!args.summary) throw new Error('--summary <out/wix-batch/<run>/summary.json> is required');
const execute = args.execute === 'true';
const summary = JSON.parse(fs.readFileSync(args.summary, 'utf8'));
const SOURCE = 'WIX_OFFICIAL_CATALOG_FRAM_CROSS_20261025';
const AUTHORITY = 'WIX_OFFICIAL_CATALOG';
const mmOf = (v) => { const m = /\(([\d.]+)\)/.exec(String(v || '')); return m ? Number(m[1]) : null; };

// WIX spec label -> catalogue column (mm). Top/Bottom diameters only when both are equal.
function dimsFrom(details) {
  const sp = details.specs || {};
  const mm = (k) => (sp[k] && sp[k].mm != null ? sp[k].mm : null);
  const out = {};
  const set = (col, v) => { if (v != null && Number.isFinite(v) && v > 0 && v < 2000) out[col] = v; };
  set('product_length_mm', mm('Length'));
  set('product_width_mm', mm('Width'));
  set('height_mm', mm('Height'));
  set('outer_diameter_mm', mm('Outer Diameter') ?? (mm('Outer Diameter Top') != null && mm('Outer Diameter Top') === mm('Outer Diameter Bottom') ? mm('Outer Diameter Top') : null));
  set('inner_diameter_mm', mm('Inside Diameter') ?? (mm('Inside Diameter Top') != null && mm('Inside Diameter Top') === mm('Inside Diameter Bottom') ? mm('Inside Diameter Top') : null));
  set('inlet_mm', mm('Inlet'));
  set('outlet_mm', mm('Outlet'));
  if (sp['Thread Size']?.text) out.thread_size = sp['Thread Size'].text;
  const g = Array.isArray(details.gaskets) ? details.gaskets : [];
  if (g.length === 1) { set('gasket_od_mm', mmOf(g[0][1])); set('gasket_id_mm', mmOf(g[0][2])); }
  return out;
}

function appsFrom(evidence) {
  const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined && v !== ''));
  return evidence.applications.map((x) => {
    const ys = [...yearSet(x.year_text)].map(Number).sort((a, b) => a - b);
    return clean({ make: x.make, model: x.model, year_from: ys[0] ?? null, year_to: ys.length ? ys[ys.length - 1] : null,
      production_period: x.year_text || null, engine: x.engine });
  });
}

const url = process.env.CATALOG_DATABASE_URL;
if (!url) throw new Error('CATALOG_DATABASE_URL is required');
if (!/@(127\.0\.0\.1|localhost)[:/]/.test(url)) throw new Error('database is not local');
const db = new pg.Client({ connectionString: url });
await db.connect();

const report = { mode: execute ? 'EXECUTE' : 'DRY_RUN_ROLLBACK', written: [], held: [] };
try {
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  const { rows: colRows } = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='elimfilters_catalog'`);
  const columns = new Set(colRows.map((r) => r.column_name));
  const { rows: baseRows } = await db.query(`SELECT upper(regexp_replace(codigo_base,'[^A-Za-z0-9]','','g')) b, sku FROM public.elimfilters_catalog WHERE catalog_active`);
  const baseOwner = new Map(); for (const r of baseRows) { if (!baseOwner.has(r.b)) baseOwner.set(r.b, new Set()); baseOwner.get(r.b).add(r.sku); }
  const { rows: refRows } = await db.query(`SELECT x.reference_type t, upper(regexp_replace(x.brand,'[^A-Za-z0-9]','','g')) b, upper(regexp_replace(x.part_number,'[^A-Za-z0-9]','','g')) n, x.sku
    FROM public.exact_part_reference x JOIN public.elimfilters_catalog c ON c.sku=x.sku AND c.catalog_active`);
  const refOwner = new Map(); for (const r of refRows) { const k = `${r.t}|${r.b}|${r.n}`; if (!refOwner.has(k)) refOwner.set(k, new Set()); refOwner.get(k).add(r.sku); }

  for (const s of summary.rows.filter((r) => r.eligible)) {
    const hold = (reason, extra = {}) => report.held.push({ sku: s.sku, fram_code: s.fram_code, wix_part: s.wix_part, reason, ...extra });
    const file = path.join(s.dir, 'wix-evidence.json');
    if (!fs.existsSync(file)) { hold('EVIDENCE_MISSING'); continue; }
    const raw = fs.readFileSync(file, 'utf8');
    if (crypto.createHash('sha256').update(raw).digest('hex') !== s.evidence_sha256) { hold('EVIDENCE_HASH_CHANGED'); continue; }
    const ev = JSON.parse(raw);
    if (norm(ev.fram_code) !== norm(s.fram_code) || norm(ev.wix_part) !== norm(s.wix_part)) { hold('EVIDENCE_IDENTITY_MISMATCH'); continue; }
    const apps = appsFrom(ev);
    if (!apps.length) { hold('NO_APPLICATIONS'); continue; }
    if (originGroupOf(apps).group !== 'NON_EUROPEAN') { hold('ORIGIN_NOT_NON_EUROPEAN'); continue; }
    const base = norm(s.fram_code);
    const others = [...(baseOwner.get(base) || [])].filter((x) => x !== s.sku);
    if (others.length) { hold('CODIGO_BASE_COLLISION', { others }); continue; }
    const sourceUrl = ev.pages.applications.url;

    await db.query('SAVEPOINT sku');
    try {
      const { rows: [row] } = await db.query(`SELECT to_jsonb(c) r, md5(c.vehicle_applications::text) h,
          EXISTS (SELECT 1 FROM public.catalog_application_evidence e WHERE e.sku=c.sku AND e.application_kind='VEHICLE' AND e.verified
                  AND e.evidence_authority='MANN_OFFICIAL_CATALOG' AND e.payload_hash=md5(c.vehicle_applications::text)) mann_apps
        FROM public.elimfilters_catalog c WHERE sku=$1 FOR UPDATE`, [s.sku]);
      const r = row?.r;
      if (!r || !r.catalog_active || r.duty !== 'LIGHT_DUTY') throw new Error('STOP:ROW_NOT_ACTIVE_LD');
      if (['VERIFIED', 'EXCEPTION_CONFIRMED'].includes(String(r.canonical_source_status || '').toUpperCase())) throw new Error(`STOP:CANONICAL_ALREADY_VERIFIED ${r.canonical_source_brand}`);
      if (row.mann_apps) throw new Error('STOP:MANN_VERIFIED_APPLICATIONS');
      if (row.h !== s.vehicle_db_hash) throw new Error('STOP:PAYLOAD_CHANGED_SINCE_FETCH');
      const previousApps = Array.isArray(r.vehicle_applications) ? r.vehicle_applications : [];

      // 1. applications (+ previous unverified rows preserved)
      await applyVerifiedApplications(db, { sku: s.sku, vehicle_applications: apps, evidence: {
        authority: AUTHORITY, source_url: sourceUrl, evidence_hash: ev.pages.applications.sha256,
        metadata: { fram_code: ev.fram_code, wix_part: ev.wix_part, cross_url: ev.pages.exactmatch.url, cross_sha256: ev.pages.exactmatch.sha256,
          details_url: ev.pages.details.url, details_sha256: ev.pages.details.sha256, evidence_sha256: s.evidence_sha256,
          mode: s.mode, rows: apps.length, captured_at: ev.captured_at, rule: 'FRAM_BASE_WIX_CROSS_20261025' } } });
      if (previousApps.length) {
        await db.query(`UPDATE public.elimfilters_catalog SET enrichment_data = jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{replaced_vehicle_applications}', $2::jsonb) WHERE sku=$1`,
          [s.sku, JSON.stringify({ replaced_at: new Date().toISOString(), reason: s.mode === 'MATCHED' ? 'SUPERSEDED_BY_WIX_OFFICIAL_FRAM_CROSS' : 'CONTRADICTED_BY_WIX_OFFICIAL_FRAM_CROSS',
            authority: AUTHORITY, fram_code: ev.fram_code, wix_part: ev.wix_part, rows: previousApps })]);
      }

      // 2. dimensions
      const vals = Object.fromEntries(Object.entries(dimsFrom(ev.details)).filter(([k]) => columns.has(k)));
      let dims = 0;
      const dimsVerified = ['VERIFIED', 'FULL_PRODUCT_DIMENSIONS_OFFICIAL'].includes(String(r.product_dimensions_validation_status || '').toUpperCase());
      if (Object.keys(vals).length && !dimsVerified) {
        const keys = Object.keys(vals);
        const replaced = Object.fromEntries(keys.filter((k) => r[k] != null && String(r[k]) !== String(vals[k]) && Number(r[k]) !== Number(vals[k])).map((k) => [k, r[k]]));
        await db.query(`UPDATE public.elimfilters_catalog SET ${keys.map((k, i) => `${k}=$${i + 2}`).join(', ')},
            product_dimensions_source='OFFICIAL_WIX_CATALOG', product_dimensions_validation_status='FULL_PRODUCT_DIMENSIONS_OFFICIAL',
            enrichment_data = jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{dimension_evidence}', $${keys.length + 2}::jsonb)
          WHERE sku=$1`, [s.sku, ...keys.map((k) => vals[k]), JSON.stringify({ authority: AUTHORITY, source_url: ev.pages.details.url,
            page_sha256: ev.pages.details.sha256, wix_part: ev.wix_part, fram_code: ev.fram_code, values: vals,
            replaced: Object.keys(replaced).length ? replaced : undefined, unit_source: 'WIX metric value (mm)', recorded_at: new Date().toISOString() })]);
        dims = keys.length;
      }

      // 3. exact references (FRAM base + WIX)
      let added = 0, refConflicts = 0;
      for (const x of [{ t: 'COMPETITOR', b: 'FRAM', n: ev.fram_code }, { t: 'COMPETITOR', b: 'WIX', n: ev.wix_part }]) {
        if (norm(x.n).length < 3) continue;
        const owners = [...(refOwner.get(`${x.t}|${norm(x.b)}|${norm(x.n)}`) || [])].filter((o) => o !== s.sku);
        if (owners.length) { refConflicts++; continue; }
        for (const value of [...new Set([x.n, norm(x.n)])]) {
          await db.query('SAVEPOINT ref');
          try {
            added += (await db.query(`INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) VALUES ($1,$2,$3,$4,$5)
              ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`, [x.t, x.b, value, s.sku, SOURCE])).rowCount;
            await db.query('RELEASE SAVEPOINT ref'); break;
          } catch (e) { await db.query('ROLLBACK TO SAVEPOINT ref'); if (!/check constraint/i.test(e.message)) throw e; }
        }
      }

      // 4. canonical source FRAM (+ WIX as competitor code)
      const { rows: [after] } = await db.query('SELECT to_jsonb(c) r FROM public.elimfilters_catalog c WHERE sku=$1', [s.sku]);
      const a = after.r;
      const oldData = a.enrichment_data && typeof a.enrichment_data === 'object' ? a.enrichment_data : {};
      const oem = (Array.isArray(a.oem_codes) ? a.oem_codes : []).filter((e) => norm(codeOf(e)) !== base);
      const comp = (Array.isArray(a.competitor_codes) ? a.competitor_codes : []).filter((e) => norm(codeOf(e)) !== base);
      if (!comp.some((e) => norm(codeOf(e)) === norm(ev.wix_part))) {
        comp.push({ code: ev.wix_part, manufacturer: 'WIX', classification: 'AFTERMARKET', classification_source: SOURCE });
      }
      const gov = { ...(oldData.codigo_base_governance || {}), state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', origin_group: 'NON_EUROPEAN',
        policy_version: '2026-08-19-v3.1', required_authority: 'VERIFIED_FRAM', previous_codigo_base: a.codigo_base, current_codigo_base: base,
        approved_codigo_base: base, approved_manufacturer: 'FRAM', approved_source_column: 'CANONICAL_POLICY', primary_manufacturer_verified: true,
        alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY', vehicle_origin: originGroupOf(apps),
        evidence_note: 'FRAM base verified 2026-10-25 through the official WIX catalogue (Mann+Hummel): published FRAM -> WIX interchange with a single WIX part; WIX applications are non-European. Rule approved by the operator.',
        evidence_url: ev.pages.exactmatch.url, evidence_page_sha256: ev.pages.exactmatch.sha256, wix_part: ev.wix_part, decided_by: 'OPERATOR', decided_at: '2026-10-25' };
      const nextRow = { ...a, oem_codes: oem, competitor_codes: comp, codigo_base: base, enrichment_data: { ...oldData, codigo_base_governance: gov } };
      assertCanonicalWrite(nextRow, { validateApplications: false });
      await db.query(`UPDATE public.elimfilters_catalog SET codigo_base=$2::text, canonical_source_brand='FRAM', canonical_source_code=$2::text,
          canonical_source_url=$3, canonical_source_status='VERIFIED', canonical_verified_at=now(), canonical_evidence=$4::jsonb,
          enrichment_data=$5::jsonb, oem_codes=$6::jsonb, competitor_codes=$7::jsonb WHERE sku=$1`,
        [s.sku, base, ev.pages.exactmatch.url, JSON.stringify({ authority: AUTHORITY, source_url: ev.pages.exactmatch.url, page_sha256: ev.pages.exactmatch.sha256,
          fram_code: ev.fram_code, wix_part: ev.wix_part, evidence_sha256: s.evidence_sha256 }),
         JSON.stringify(nextRow.enrichment_data), JSON.stringify(oem), JSON.stringify(comp)]);
      const ident = await db.query(`SELECT 1 FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=$1 AND status='ACTIVE'`, [s.sku]);
      if (!ident.rowCount) {
        await db.query(`INSERT INTO ld_catalog.ld_canonical_product_identity(elimfilters_sku, origin_group, canonical_brand, canonical_part_number, filter_type, status, evidence_source, created_at, updated_at)
          VALUES ($1,'NON_EUROPEAN','FRAM',$2,$3,'ACTIVE',$4,now(),now())
          ON CONFLICT (elimfilters_sku) DO UPDATE SET origin_group='NON_EUROPEAN', canonical_brand='FRAM', canonical_part_number=EXCLUDED.canonical_part_number,
            status='ACTIVE', evidence_source=EXCLUDED.evidence_source, updated_at=now()`, [s.sku, ev.fram_code, a.filter_type || 'unknown', SOURCE]);
      }
      await db.query('RELEASE SAVEPOINT sku');
      report.written.push({ sku: s.sku, base: `${a.codigo_base} -> ${base}`, wix: ev.wix_part, mode: s.mode, apps: apps.length, replaced_apps: previousApps.length, dims, refs: added, ref_conflicts: refConflicts });
    } catch (e) {
      await db.query('ROLLBACK TO SAVEPOINT sku');
      hold(e.message.startsWith('STOP:') ? e.message.slice(5).split(' ')[0] : /GATEWAY/.test(e.message) ? 'GATEWAY_BLOCKED' : /duplicate key|uq_ld/i.test(e.message) ? 'IDENTITY_COLLISION' : 'DB_REJECTED',
        { error: e.message.slice(0, 220) });
    }
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
const out = path.join(path.dirname(args.summary), `apply-${execute ? 'execute' : 'dryrun'}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(out, JSON.stringify(report, null, 2));
const reasons = report.held.reduce((m, h) => { m[h.reason] = (m[h.reason] || 0) + 1; return m; }, {});
console.log(JSON.stringify({ mode: report.mode, written: report.written.length, held: report.held.length, held_reasons: reasons,
  modes: report.written.reduce((m, w) => { m[w.mode] = (m[w.mode] || 0) + 1; return m; }, {}),
  totals: report.written.reduce((m, w) => ({ apps: m.apps + w.apps, replaced_apps: m.replaced_apps + w.replaced_apps, dims: m.dims + (w.dims ? 1 : 0), refs: m.refs + w.refs }), { apps: 0, replaced_apps: 0, dims: 0, refs: 0 }),
  sample: report.written.slice(0, 8).map((w) => `${w.sku} ${w.base} WIX ${w.wix} ${w.mode} apps=${w.apps} (antes ${w.replaced_apps}) dims=${w.dims} refs=${w.refs}`),
  held_sample: Object.keys(reasons).flatMap((k) => report.held.filter((h) => h.reason === k).slice(0, 2).map((h) => `${h.sku} ${h.fram_code} ${h.reason} ${h.error || h.others || ''}`)),
  transaction: report.transaction, error: report.error, file: out }, null, 2));
