#!/usr/bin/env node
// Register the MANN base code as canonical source for LD SKUs whose applications are already
// verified against the official MANN page (VEHICLE evidence MANN_OFFICIAL_CATALOG on the current
// payload, same cached page by SHA-256). Same shape as the 579 rows already CANONICAL_VERIFIED
// (migration 087): codigo_base = normalized MANN code, canonical_source_* MANN-FILTER/VERIFIED and
// enrichment_data.codigo_base_governance with approved_* fields, origin_group EUROPEAN.
//
// Policy (Victor 2026-10-04): European vehicles -> MANN base; non-European -> FRAM base.
// So a SKU is only eligible when its applications are mostly European makes. Held otherwise:
//   NON_EUROPEAN_ORIGIN             -> base must be FRAM (review)
//   CANONICAL_SOURCE_OTHER_BRAND    -> already verified with another brand (FRAM etc.)
//   SKU_DIGITS_MISMATCH / CODIGO_BASE_COLLISION / IDENTITY_COLLISION / GATEWAY_BLOCKED
// Every row passes lib/catalog-write-gateway.js assertCanonicalWrite before the UPDATE; the LD
// canonical identity row (ld_catalog.ld_canonical_product_identity) is created when missing.
//
// DRY RUN by default (ROLLBACK). Execute: --execute --confirm-count <written in the dry run>.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import pg from 'pg';
import { originGroupOf } from './ld-origin-group.mjs';

const require = createRequire(import.meta.url);
const { verifyProductIdentity, normalizePart } = require('../../lib/mann-official-spec-verifier.js');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway.js');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, cur, i, arr) => {
  if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return acc;
}, []));
const execute = args.execute === 'true';
const NOTE = 'MANN base verified 2026-10-25: official MANN product page (exact title identity) reproduces the SKU applications (make/model or shared OE numbers); applications rewritten from that page with evidence.';

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

const last4 = (v) => String(v || '').replace(/\D/g, '').slice(-4).padStart(4, '0');
const report = { mode: execute ? 'EXECUTE' : 'DRY_RUN_ROLLBACK', written: [], held: [] };
try {
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  const { rows: targets } = await db.query(`
    SELECT to_jsonb(c) AS row, e.source_url, e.evidence_hash, e.metadata->>'mann_code' AS mann_code
    FROM public.elimfilters_catalog c
    JOIN public.catalog_application_evidence e
      ON e.sku = c.sku AND e.application_kind = 'VEHICLE' AND e.verified
     AND e.evidence_authority = 'MANN_OFFICIAL_CATALOG' AND e.payload_hash = md5(c.vehicle_applications::text)
    WHERE c.catalog_active AND c.duty = 'LIGHT_DUTY'
      AND upper(coalesce(c.canonical_source_status,'')) NOT IN ('VERIFIED','EXCEPTION_CONFIRMED')
    ORDER BY c.sku`);
  report.candidates = targets.length;
  const { rows: bases } = await db.query(`SELECT upper(regexp_replace(codigo_base,'[^A-Za-z0-9]','','g')) b, sku FROM public.elimfilters_catalog WHERE catalog_active`);
  const baseOwner = new Map(); for (const r of bases) { if (!baseOwner.has(r.b)) baseOwner.set(r.b, new Set()); baseOwner.get(r.b).add(r.sku); }

  for (const t of targets) {
    const row = t.row; const sku = row.sku;
    const hold = (reason, extra = {}) => report.held.push({ sku, mann_code: t.mann_code, reason, ...extra });
    if (row.canonical_source_brand && !/^MANN/i.test(row.canonical_source_brand)) { hold('CANONICAL_SOURCE_OTHER_BRAND', { brand: row.canonical_source_brand }); continue; }
    if (!t.mann_code) { hold('NO_MANN_CODE_IN_EVIDENCE'); continue; }
    const file = pageBySha.get(t.evidence_hash);
    if (!file || !verifyProductIdentity(fs.readFileSync(file, 'utf8'), t.mann_code).valid) { hold('NO_CACHED_PAGE_OR_IDENTITY'); continue; }
    if (last4(t.mann_code) !== last4(sku)) { hold('SKU_DIGITS_MISMATCH'); continue; }
    const origin = originGroupOf(row.vehicle_applications);
    if (origin.group !== 'EUROPEAN') { hold('NON_EUROPEAN_ORIGIN', { european_share: origin.european_share }); continue; }
    const base = normalizePart(t.mann_code);
    const others = [...(baseOwner.get(base) || [])].filter((s) => s !== sku);
    if (others.length) { hold('CODIGO_BASE_COLLISION', { others }); continue; }

    const oldData = row.enrichment_data && typeof row.enrichment_data === 'object' ? row.enrichment_data : {};
    const gov = {
      ...(oldData.codigo_base_governance || {}),
      state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', origin_group: 'EUROPEAN',
      policy_version: '2026-08-19-v3.1', required_authority: 'VERIFIED_MANN_FILTER',
      previous_codigo_base: row.codigo_base, current_codigo_base: base, approved_codigo_base: base,
      approved_manufacturer: 'MANN-FILTER', approved_source_column: 'CANONICAL_POLICY',
      primary_manufacturer_verified: true, alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY',
      evidence_note: NOTE, evidence_url: t.source_url, evidence_page_sha256: t.evidence_hash,
      vehicle_origin: origin, decided_by: 'OPERATOR', decided_at: '2026-10-25',
    };
    // The gateway needs arrays; the new base must not stay listed as its own alternate (the MANN code
    // usually sat in competitor_codes before becoming the base): it is removed from both lists.
    const codeOf = (e) => normalizePart(e && typeof e === 'object' ? e.code || e.reference || e.part_number : e);
    const oem = (Array.isArray(row.oem_codes) ? row.oem_codes : []).filter((e) => codeOf(e) !== base);
    const comp = (Array.isArray(row.competitor_codes) ? row.competitor_codes : []).filter((e) => codeOf(e) !== base);
    const removedAlternates = (Array.isArray(row.oem_codes) ? row.oem_codes.length : 0) + (Array.isArray(row.competitor_codes) ? row.competitor_codes.length : 0) - oem.length - comp.length;
    gov.base_removed_from_alternates = removedAlternates;
    const nextRow = { ...row, oem_codes: oem, competitor_codes: comp, codigo_base: base, enrichment_data: { ...oldData, codigo_base_governance: gov } };
    try { assertCanonicalWrite(nextRow, { validateApplications: false }); }
    catch (e) { hold('GATEWAY_BLOCKED', { error: e.message }); continue; }

    await db.query('SAVEPOINT s');
    try {
      await db.query(
        `UPDATE public.elimfilters_catalog SET codigo_base=$2::text, canonical_source_brand='MANN-FILTER', canonical_source_code=$2::text,
           canonical_source_url=$3, canonical_source_status='VERIFIED', canonical_verified_at=now(),
           canonical_evidence=$4::jsonb, enrichment_data=$5::jsonb, oem_codes=$6::jsonb, competitor_codes=$7::jsonb
         WHERE sku=$1 AND catalog_active`,
        [sku, base, t.source_url, JSON.stringify({ authority: 'MANN_OFFICIAL_CATALOG', source_url: t.source_url, page_sha256: t.evidence_hash, mann_code: t.mann_code, note: NOTE }),
         JSON.stringify(nextRow.enrichment_data), JSON.stringify(oem), JSON.stringify(comp)]);
      const ident = await db.query(`SELECT 1 FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=$1 AND status='ACTIVE'`, [sku]);
      if (!ident.rowCount) {
        await db.query(
          `INSERT INTO ld_catalog.ld_canonical_product_identity(elimfilters_sku, origin_group, canonical_brand, canonical_part_number, filter_type, status, evidence_source, created_at, updated_at)
           VALUES ($1,'EUROPEAN','MANN-FILTER',$2,$3,'ACTIVE','MANN_OFFICIAL_PAGE_VERIFIED_APPLICATIONS_20261025',now(),now())
           ON CONFLICT (elimfilters_sku) DO UPDATE SET origin_group='EUROPEAN', canonical_brand='MANN-FILTER', canonical_part_number=EXCLUDED.canonical_part_number,
             status='ACTIVE', evidence_source=EXCLUDED.evidence_source, updated_at=now()`,
          [sku, t.mann_code, row.filter_type || 'unknown']);
      }
      await db.query('RELEASE SAVEPOINT s');
      report.written.push({ sku, from: row.codigo_base, to: base, alternates_removed: removedAlternates });
    } catch (e) {
      await db.query('ROLLBACK TO SAVEPOINT s');
      hold(/uq_ld_canonical_brand_part|duplicate key/i.test(e.message) ? 'IDENTITY_COLLISION' : 'DB_REJECTED', { error: e.message.slice(0, 200) });
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
const outDir = path.resolve('out', 'mann-canonical-source'); fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `source-${execute ? 'execute' : 'dryrun'}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(out, JSON.stringify(report, null, 2));
const reasons = report.held.reduce((m, h) => { m[h.reason] = (m[h.reason] || 0) + 1; return m; }, {});
console.log(JSON.stringify({ mode: report.mode, candidates: report.candidates, written: report.written.length, held: report.held.length, held_reasons: reasons,
  sample: report.written.slice(0, 6).map((w) => `${w.sku}: ${w.from} -> ${w.to}`),
  held_sample: Object.keys(reasons).flatMap((reason) => report.held.filter((h) => h.reason === reason).slice(0, 3)
    .map((h) => `${h.sku} ${h.mann_code} ${h.reason} ${h.error || h.others || h.brand || (h.european_share != null ? 'eu=' + h.european_share : '')}`)),
  transaction: report.transaction, error: report.error, file: out }, null, 2));
