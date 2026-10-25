#!/usr/bin/env node
// PHASE B - write the FRAM evidence of the ELIGIBLE rows of a fram-ld-fetch.mjs summary.
// All-or-nothing per SKU (savepoint): if any step fails, that SKU is left exactly as it was.
//   1. vehicle_applications <- FRAM official applications (year/make/model/engine), through
//      lib/catalog-application-write-service.js applyVerifiedApplications, authority FRAM_OFFICIAL_CATALOG
//   2. dimensions (outer diameter, height, gasket OD/ID, thread) from FRAM attributes (inch -> mm),
//      only when not already verified; previous unverified values kept in dimension_evidence.replaced
//   3. exact_part_reference: COMPETITOR FRAM <base> + OEM <maker> <number> from FRAM cross references
//      (codes registered for another active SKU are skipped)
//   4. canonical source FRAM (codigo_base, canonical_source_*, codigo_base_governance NON_EUROPEAN) through
//      lib/catalog-write-gateway.js assertCanonicalWrite, plus LD canonical identity when missing
// Guards re-checked here: active LD row, not MANN-verified, payload unchanged since the fetch, bundle
// file hash unchanged, origin NON_EUROPEAN, FRAM base not used as codigo_base by another active SKU.
//
// DRY RUN by default (ROLLBACK). Execute: --summary <file> --execute --confirm-count <written in dry run>.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import pg from 'pg';
import { originGroupOf } from './ld-origin-group.mjs';

const require = createRequire(import.meta.url);
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service.js');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway.js');
const { splitCrossReferences, selectAutomotiveApplications, buildPublicTechnicalSpecs } = require('../../lib/knowledge-governance/fram-usa-ld-enrichment');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, cur, i, arr) => {
  if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return acc;
}, []));
if (!args.summary) throw new Error('--summary <out/fram-batch/<run>/summary.json> is required');
const execute = args.execute === 'true';
const summary = JSON.parse(fs.readFileSync(args.summary, 'utf8'));
const norm = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const codeOf = (e) => (e && typeof e === 'object' ? e.code || e.part_number || e.reference : e);
const SOURCE = 'FRAM_OFFICIAL_CATALOG_20261025';
const DIMS = ['outer_diameter_mm', 'height_mm', 'gasket_od_mm', 'gasket_id_mm', 'thread_size'];

const url = process.env.CATALOG_DATABASE_URL;
if (!url) throw new Error('CATALOG_DATABASE_URL is required');
if (!/@(127\.0\.0\.1|localhost)[:/]/.test(url)) throw new Error('database is not local');
const db = new pg.Client({ connectionString: url });
await db.connect();

const report = { mode: execute ? 'EXECUTE' : 'DRY_RUN_ROLLBACK', written: [], held: [] };
try {
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  const { rows: baseRows } = await db.query(`SELECT upper(regexp_replace(codigo_base,'[^A-Za-z0-9]','','g')) b, sku FROM public.elimfilters_catalog WHERE catalog_active`);
  const baseOwner = new Map(); for (const r of baseRows) { if (!baseOwner.has(r.b)) baseOwner.set(r.b, new Set()); baseOwner.get(r.b).add(r.sku); }
  const { rows: refRows } = await db.query(`SELECT x.reference_type t, upper(regexp_replace(x.brand,'[^A-Za-z0-9]','','g')) b, upper(regexp_replace(x.part_number,'[^A-Za-z0-9]','','g')) n, x.sku
    FROM public.exact_part_reference x JOIN public.elimfilters_catalog c ON c.sku=x.sku AND c.catalog_active`);
  const refOwner = new Map(); for (const r of refRows) { const k = `${r.t}|${r.b}|${r.n}`; if (!refOwner.has(k)) refOwner.set(k, new Set()); refOwner.get(k).add(r.sku); }

  for (const s of summary.rows.filter((r) => r.eligible)) {
    const hold = (reason, extra = {}) => report.held.push({ sku: s.sku, fram_code: s.fram_code, reason, ...extra });
    const file = path.join(s.dir, 'fram-bundle.json');
    if (!fs.existsSync(file)) { hold('BUNDLE_MISSING'); continue; }
    const raw = fs.readFileSync(file, 'utf8');
    if (crypto.createHash('sha256').update(raw).digest('hex') !== s.bundle_sha256) { hold('BUNDLE_HASH_CHANGED'); continue; }
    const bundle = JSON.parse(raw);
    const apps = selectAutomotiveApplications(bundle.applications)
      .map((a) => Object.fromEntries(Object.entries({ make: a.make, model: a.model, year: a.year, engine: a.engine }).filter(([, v]) => v != null && v !== '')));
    if (originGroupOf(apps).group !== 'NON_EUROPEAN') { hold('ORIGIN_NOT_NON_EUROPEAN'); continue; }
    const base = norm(s.fram_code);
    const others = [...(baseOwner.get(base) || [])].filter((x) => x !== s.sku);
    if (others.length) { hold('CODIGO_BASE_COLLISION', { others }); continue; }

    await db.query('SAVEPOINT sku');
    try {
      const { rows: [row] } = await db.query('SELECT to_jsonb(c) r, md5(c.vehicle_applications::text) h FROM public.elimfilters_catalog c WHERE sku=$1 FOR UPDATE', [s.sku]);
      const r = row?.r;
      if (!r || !r.catalog_active || r.duty !== 'LIGHT_DUTY') throw new Error('STOP:ROW_NOT_ACTIVE_LD');
      if (['VERIFIED', 'EXCEPTION_CONFIRMED'].includes(String(r.canonical_source_status || '').toUpperCase()) && /^MANN/i.test(r.canonical_source_brand || '')) throw new Error('STOP:MANN_VERIFIED');
      if (row.h !== s.vehicle_db_hash) throw new Error('STOP:PAYLOAD_CHANGED_SINCE_FETCH');
      const sourceUrl = `${bundle.data_url}#fram_part=${encodeURIComponent(bundle.part.part_number)}&part_key=${encodeURIComponent(bundle.part.part_key)}`;

      // 1. applications
      await applyVerifiedApplications(db, { sku: s.sku, vehicle_applications: apps, evidence: {
        authority: 'FRAM_OFFICIAL_CATALOG', source_url: sourceUrl, evidence_hash: s.bundle_sha256,
        metadata: { fram_code: bundle.part.part_number, part_key: bundle.part.part_key, part_type: bundle.part.part_type,
          captured_at: bundle.captured_at, catalog_config: bundle.source, rows: apps.length } } });

      // 2. dimensions
      const specs = buildPublicTechnicalSpecs(bundle.attributes);
      const vals = Object.fromEntries(DIMS.filter((k) => specs[k] != null && specs[k] !== '').map((k) => [k, specs[k]]));
      let dims = 0;
      const dimsVerified = ['VERIFIED', 'FULL_PRODUCT_DIMENSIONS_OFFICIAL'].includes(String(r.product_dimensions_validation_status || '').toUpperCase());
      if (Object.keys(vals).length && !dimsVerified) {
        const keys = Object.keys(vals);
        const replaced = Object.fromEntries(keys.filter((k) => r[k] != null && String(r[k]) !== String(vals[k])).map((k) => [k, r[k]]));
        await db.query(`UPDATE public.elimfilters_catalog SET ${keys.map((k, i) => `${k}=$${i + 2}`).join(', ')},
            product_dimensions_source='OFFICIAL_FRAM_CATALOG', product_dimensions_validation_status='FULL_PRODUCT_DIMENSIONS_OFFICIAL',
            enrichment_data = jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{dimension_evidence}', $${keys.length + 2}::jsonb)
          WHERE sku=$1`, [s.sku, ...keys.map((k) => vals[k]), JSON.stringify({ authority: 'FRAM_OFFICIAL_CATALOG', source_url: sourceUrl,
            bundle_sha256: s.bundle_sha256, values: vals, replaced: Object.keys(replaced).length ? replaced : undefined, unit_source: 'inch', recorded_at: new Date().toISOString() })]);
        dims = keys.length;
      }

      // 3. exact references
      const split = splitCrossReferences(bundle.cross_references, bundle.part.part_number);
      const refs = [{ t: 'COMPETITOR', b: 'FRAM', n: bundle.part.part_number }, ...split.oem_candidates.map((o) => ({ t: 'OEM', b: o.manufacturer, n: o.part_number }))];
      let added = 0, refConflicts = 0;
      for (const x of refs) {
        if (!x.b || norm(x.n).length < 4) continue;
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

      // 4. canonical source FRAM
      const { rows: [after] } = await db.query('SELECT to_jsonb(c) r FROM public.elimfilters_catalog c WHERE sku=$1', [s.sku]);
      const a = after.r;
      const oldData = a.enrichment_data && typeof a.enrichment_data === 'object' ? a.enrichment_data : {};
      const oem = (Array.isArray(a.oem_codes) ? a.oem_codes : []).filter((e) => norm(codeOf(e)) !== base);
      const comp = (Array.isArray(a.competitor_codes) ? a.competitor_codes : []).filter((e) => norm(codeOf(e)) !== base);
      const gov = { ...(oldData.codigo_base_governance || {}), state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', origin_group: 'NON_EUROPEAN',
        policy_version: '2026-08-19-v3.1', required_authority: 'VERIFIED_FRAM', previous_codigo_base: a.codigo_base, current_codigo_base: base,
        approved_codigo_base: base, approved_manufacturer: 'FRAM', approved_source_column: 'CANONICAL_POLICY', primary_manufacturer_verified: true,
        alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY', vehicle_origin: originGroupOf(apps),
        evidence_note: 'FRAM base verified 2026-10-25: official FRAM catalogue reproduces the SKU (applications or shared OE numbers); non-European vehicle origin.',
        evidence_url: sourceUrl, evidence_bundle_sha256: s.bundle_sha256, decided_by: 'OPERATOR', decided_at: '2026-10-25' };
      const nextRow = { ...a, oem_codes: oem, competitor_codes: comp, codigo_base: base, enrichment_data: { ...oldData, codigo_base_governance: gov } };
      assertCanonicalWrite(nextRow, { validateApplications: false });
      await db.query(`UPDATE public.elimfilters_catalog SET codigo_base=$2::text, canonical_source_brand='FRAM', canonical_source_code=$2::text,
          canonical_source_url=$3, canonical_source_status='VERIFIED', canonical_verified_at=now(), canonical_evidence=$4::jsonb,
          enrichment_data=$5::jsonb, oem_codes=$6::jsonb, competitor_codes=$7::jsonb WHERE sku=$1`,
        [s.sku, base, sourceUrl, JSON.stringify({ authority: 'FRAM_OFFICIAL_CATALOG', source_url: sourceUrl, bundle_sha256: s.bundle_sha256, fram_code: bundle.part.part_number }),
         JSON.stringify(nextRow.enrichment_data), JSON.stringify(oem), JSON.stringify(comp)]);
      const ident = await db.query(`SELECT 1 FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=$1 AND status='ACTIVE'`, [s.sku]);
      if (!ident.rowCount) {
        await db.query(`INSERT INTO ld_catalog.ld_canonical_product_identity(elimfilters_sku, origin_group, canonical_brand, canonical_part_number, filter_type, status, evidence_source, created_at, updated_at)
          VALUES ($1,'NON_EUROPEAN','FRAM',$2,$3,'ACTIVE','FRAM_OFFICIAL_CATALOG_20261025',now(),now())
          ON CONFLICT (elimfilters_sku) DO UPDATE SET origin_group='NON_EUROPEAN', canonical_brand='FRAM', canonical_part_number=EXCLUDED.canonical_part_number,
            status='ACTIVE', evidence_source=EXCLUDED.evidence_source, updated_at=now()`, [s.sku, bundle.part.part_number, a.filter_type || 'unknown']);
      }
      await db.query('RELEASE SAVEPOINT sku');
      report.written.push({ sku: s.sku, base: `${a.codigo_base} -> ${base}`, apps: apps.length, dims, refs: added, ref_conflicts: refConflicts });
    } catch (e) {
      await db.query('ROLLBACK TO SAVEPOINT sku');
      hold(e.message.startsWith('STOP:') ? e.message.slice(5) : /GATEWAY/.test(e.message) ? 'GATEWAY_BLOCKED' : 'DB_REJECTED', { error: e.message.slice(0, 220) });
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
  totals: report.written.reduce((m, w) => ({ apps: m.apps + w.apps, dims: m.dims + (w.dims ? 1 : 0), refs: m.refs + w.refs }), { apps: 0, dims: 0, refs: 0 }),
  sample: report.written.slice(0, 6).map((w) => `${w.sku} ${w.base} apps=${w.apps} dims=${w.dims} refs=${w.refs}`),
  held_sample: Object.keys(reasons).flatMap((k) => report.held.filter((h) => h.reason === k).slice(0, 2).map((h) => `${h.sku} ${h.fram_code} ${h.reason} ${h.error || h.others || ''}`)),
  transaction: report.transaction, error: report.error, file: out }, null, 2));
