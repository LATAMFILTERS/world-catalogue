'use strict';

/**
 * ET9 Parker Racor turbines and elements: close CANONICAL_VERIFIED.
 *
 * Parker publishes no product web page for its turbine assemblies and their
 * cartridges. Its only official source is the Parker Racor filtration catalog
 * (RacorCatalog.pdf, Turbine Series, printed pages A253-A261 / PDF pages 275-283),
 * already recorded in each SKU's codigo_base_governance.evidence_note
 * (operator rulings 2026-10-11 and 2026-10-12, run_263 / run_265). Those rows
 * stay in state VERIFY_PRIMARY_ABSENCE with canonical_source_status UNVERIFIED,
 * so the certification ledger blocks them (CANONICAL_GOVERNANCE_NOT_VERIFIED)
 * and the sitemap does not list them.
 *
 * This script closes that point for the SKUs whose governance already holds
 * every ET9 requirement (approvedEt9ManufacturerBaseReady): Parker as
 * approved manufacturer, COMPETITOR_CODES as source column, fallback
 * manufacturer and commercial code verified, and a catalog citation.
 *
 * A SKU is held, not written, when its base code also resolves to another SKU
 * in v_api_resolver_v7 (the certification would stay
 * BASE_CODE_NOT_UNIQUELY_RESOLVED). After all updates the resolver is checked
 * again inside the transaction: every written SKU must resolve to itself only.
 *
 * Dry-run by default (ROLLBACK). --execute needs --snapshot <file>,
 * --confirm-count <written count of the dry run> and --evidence-url <PR URL>.
 */

const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { normalizeCode, evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const CONFIRM = arg('--confirm-count');
const EVIDENCE_URL = arg('--evidence-url') || 'https://github.com/LATAMFILTERS/world-catalogue/pulls';
const AT = '2026-11-24';
const CATALOG = 'Parker Racor filtration catalog (RacorCatalog.pdf), Turbine Series';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

if (require.main === module) (async () => {
  if (APPLY && (!SNAPSHOT || CONFIRM == null || !arg('--evidence-url'))) throw new Error('SNAPSHOT_CONFIRM_COUNT_AND_EVIDENCE_URL_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB_URL_MISSING');
  if (!/(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url)) throw new Error('DATABASE_IS_NOT_LOCAL');
  const db = new Client({ connectionString: url });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', candidates: 0, written: [], held: [] };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const rows = (await db.query(
      `SELECT * FROM public.elimfilters_catalog
        WHERE sku LIKE 'ET9%' AND catalog_active AND canonical_source_status = 'UNVERIFIED'
          AND enrichment_data->'codigo_base_governance'->>'state' = 'VERIFY_PRIMARY_ABSENCE'
          AND upper(coalesce(enrichment_data->'codigo_base_governance'->>'approved_manufacturer','')) = 'PARKER'
          AND enrichment_data->'codigo_base_governance'->>'evidence_note' ILIKE '%Parker Racor filtration catalog%'
        ORDER BY sku FOR UPDATE`)).rows;
    report.candidates = rows.length;
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows, row_sha256: sha(rows) }, null, 2));

    const resolver = (await db.query('SELECT ld_catalog.norm_part(code) AS k, sku FROM public.v_api_resolver_v7')).rows;
    const byKey = new Map();
    for (const r of resolver) { if (!byKey.has(r.k)) byKey.set(r.k, new Set()); byKey.get(r.k).add(r.sku); }
    const norm = async (code) => (await db.query('SELECT ld_catalog.norm_part($1::text) AS k', [code])).rows[0].k;

    const baseOwners = (await db.query(`SELECT sku, upper(regexp_replace(codigo_base,'[^A-Za-z0-9]','','g')) b FROM public.elimfilters_catalog WHERE catalog_active`)).rows;
    const owners = new Map();
    for (const o of baseOwners) { if (!owners.has(o.b)) owners.set(o.b, new Set()); owners.get(o.b).add(o.sku); }

    for (const row of rows) {
      const hold = (reason, extra = {}) => report.held.push({ sku: row.sku, base: row.codigo_base, reason, ...extra });
      const old = row.enrichment_data || {};
      const g = old.codigo_base_governance || {};
      const base = normalizeCode(row.codigo_base);
      if (normalizeCode(g.approved_codigo_base) !== base) { hold('APPROVED_BASE_DIFFERS'); continue; }
      if (g.fallback_manufacturer_verified !== true || g.fallback_commercial_code_verified !== true || String(g.approved_source_column || '').toUpperCase() !== 'COMPETITOR_CODES') { hold('ET9_GOVERNANCE_INCOMPLETE'); continue; }
      const others = [...(owners.get(base) || [])].filter((s) => s !== row.sku);
      if (others.length) { hold('CODIGO_BASE_COLLISION', { others }); continue; }
      const key = await norm(row.codigo_base);
      const holders = [...(byKey.get(key) || [])].filter((s) => s !== row.sku);
      if (holders.length) { hold('BASE_CODE_ALSO_RESOLVES_TO_OTHER_SKU', { resolves_to: holders }); continue; }

      const gov = {
        ...g,
        state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', previous_state: g.state,
        verified_at: AT + 'T00:00:00.000Z',
        evidence_authority: 'RACOR_PRODUCT_CATALOG', evidence_kind: 'MANUFACTURER_PRODUCT_CATALOG_PDF',
        evidence_url: EVIDENCE_URL, evidence_hash: sha({ sku: row.sku, base, note: g.evidence_note }),
        verification_method: 'PARKER_RACOR_CATALOG_PLUS_OPERATOR_RULING_20261124',
        required_authority: 'VERIFIED_ET9_MANUFACTURER_BASE',
        // Parker Racor is the manufacturer of these turbines and elements (its own catalog is the source).
        // v_api_resolver_v7 counts a canonical base only when primary_manufacturer_verified is true
        // or Donaldson absence is verified; ET9 policy claims no Donaldson absence, so the first one is set.
        primary_manufacturer_verified: true,
        primary_manufacturer_note: 'Parker Racor is the direct manufacturer of this ET9 product line (operator rulings 2026-10-11, 2026-10-12, 2026-11-24); no Donaldson or Fleetguard absence is claimed.',
      };
      const next = {
        ...row, canonical_source_brand: 'PARKER', canonical_source_code: row.codigo_base, canonical_source_status: 'VERIFIED',
        canonical_source_url: EVIDENCE_URL, enrichment_data: { ...old, codigo_base_governance: gov },
      };
      const ev = evaluateCodigoBase(next);
      if (!ev.valid || ev.authority !== 'VERIFIED_ET9_MANUFACTURER_BASE') { hold('POLICY_REJECTED', { reason_detail: ev.reason || ev.authority }); continue; }
      try { assertCanonicalWrite(next, { validateApplications: false }); }
      catch (e) { hold('GATEWAY_BLOCKED', { error: e.message.replace('CATALOG_GATEWAY_BLOCKED: ', '') }); continue; }

      await db.query('SAVEPOINT s');
      try {
        const u = await db.query(
          `UPDATE public.elimfilters_catalog SET canonical_source_brand='PARKER', canonical_source_code=$2::text, canonical_source_url=$3,
             canonical_source_status='VERIFIED', canonical_verified_at=now(), canonical_evidence=$4::jsonb, enrichment_data=$5::jsonb
           WHERE sku=$1 AND catalog_active AND canonical_source_status='UNVERIFIED'`,
          [row.sku, row.codigo_base, EVIDENCE_URL,
           JSON.stringify({ authority: 'RACOR_PRODUCT_CATALOG', method: 'manufacturer-catalog-pdf', catalog: CATALOG, citation: g.evidence_note, source_url: EVIDENCE_URL, note: 'Parker publishes no product web page for turbines and cartridges; the catalog PDF is its only official source.', evidence_hash: gov.evidence_hash }),
           JSON.stringify(next.enrichment_data)]);
        if (u.rowCount !== 1) throw new Error('UPDATE_COUNT_' + u.rowCount);
        await db.query('RELEASE SAVEPOINT s');
        report.written.push({ sku: row.sku, base: row.codigo_base });
      } catch (e) { await db.query('ROLLBACK TO SAVEPOINT s'); hold('DB_REJECTED', { error: String(e.message).slice(0, 160) }); }
    }

    // Resolver check after the updates, inside the same transaction.
    const after = (await db.query('SELECT ld_catalog.norm_part(code) AS k, sku FROM public.v_api_resolver_v7')).rows;
    const afterKey = new Map();
    for (const r of after) { if (!afterKey.has(r.k)) afterKey.set(r.k, new Set()); afterKey.get(r.k).add(r.sku); }
    report.resolver_check = [];
    for (const w of report.written) {
      const k = await norm(w.base);
      const s = [...(afterKey.get(k) || [])];
      const ok = s.length === 1 && s[0] === w.sku;
      report.resolver_check.push({ sku: w.sku, resolves_to: s, unique: ok });
    }
    const bad = report.resolver_check.filter((r) => !r.unique);
    if (bad.length) throw new Error('RESOLVER_NOT_UNIQUE_AFTER_UPDATE ' + JSON.stringify(bad));
    if (APPLY && Number(CONFIRM) !== report.written.length) throw new Error(`CONFIRM_COUNT_MISMATCH expected ${report.written.length}; nothing committed`);
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} report.transaction = 'ROLLBACK_ERROR'; report.error = e.message; process.exitCode = 1; }
  finally { await db.end(); }
  const reasons = report.held.reduce((m, h) => { m[h.reason] = (m[h.reason] || 0) + 1; return m; }, {});
  console.log(JSON.stringify({ mode: report.mode, candidates: report.candidates, written: report.written.length, held: report.held.length, held_reasons: reasons, written_rows: report.written, held_rows: report.held, resolver_check: report.resolver_check, transaction: report.transaction, error: report.error }, null, 2));
})();
