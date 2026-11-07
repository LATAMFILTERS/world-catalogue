'use strict';

/**
 * Refreshes the stored codigo_base_governance of active HD products whose record
 * went stale: the owner-rule trace (verified_by owner_rule_sku_suffix_last4_plus_donaldson_page,
 * 2026-11-02/03) moved codigo_base to the approved Donaldson code and set
 * primary_manufacturer_verified=true, but `state` stayed VERIFY_PRIMARY_ABSENCE, so
 * run_273 and v_api_resolver_v7 keep treating the base as unverified.
 *
 * Only products where deriveCodigoBaseGovernance() itself returns CANONICAL_VERIFIED
 * are touched, and only when the stored record already carries the approval
 * (approved_manufacturer DONALDSON, approved_codigo_base == codigo_base,
 * primary_manufacturer_verified true, verified_at, source_url). The new record is
 * { ...stored, ...derived } (same merge as run_073), so the trace fields are kept.
 * Nothing but enrichment_data.codigo_base_governance changes (asserted).
 *
 * Dry-run by default (everything runs, then ROLLBACK). --execute commits.
 * --snapshot <file.json> writes the stored records (source for the revert).
 */

require('dotenv').config();
const { Client } = require('pg');
const { deriveCodigoBaseGovernance } = require('../../lib/catalog-codigo-base-governance');

const APPLY = process.argv.includes('--execute');
const si = process.argv.indexOf('--snapshot');
const SNAPSHOT = si > 0 ? process.argv[si + 1] : null;
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

// Pure selection rule, exported-by-shape for the self-check.
function eligible(row, derived) {
  const g = (row.enrichment_data && row.enrichment_data.codigo_base_governance) || {};
  return row.duty === 'HEAVY_DUTY' && row.catalog_active
    && g.state !== 'CANONICAL_VERIFIED'
    && derived.state === 'CANONICAL_VERIFIED'
    && g.primary_manufacturer_verified === true
    && norm(g.approved_manufacturer) === 'DONALDSON'
    && norm(g.approved_codigo_base) !== '' && norm(g.approved_codigo_base) === norm(row.codigo_base)
    && Boolean(g.verified_at) && Boolean(g.source_url || g.evidence_url);
}

if (process.argv.includes('--self-check')) {
  const row = { duty: 'HEAVY_DUTY', catalog_active: true, codigo_base: 'P130772',
    enrichment_data: { codigo_base_governance: { state: 'VERIFY_PRIMARY_ABSENCE', primary_manufacturer_verified: true,
      approved_manufacturer: 'DONALDSON', approved_codigo_base: 'P130772', verified_at: 'x', source_url: 'u' } } };
  const ok = eligible(row, { state: 'CANONICAL_VERIFIED' });
  const noPmv = eligible({ ...row, enrichment_data: { codigo_base_governance: { ...row.enrichment_data.codigo_base_governance, primary_manufacturer_verified: false } } }, { state: 'CANONICAL_VERIFIED' });
  const ld = eligible({ ...row, duty: 'LIGHT_DUTY' }, { state: 'CANONICAL_VERIFIED' });
  const notDerived = eligible(row, { state: 'VERIFY_PRIMARY_ABSENCE' });
  if (!ok || noPmv || ld || notDerived) throw new Error('SELF_CHECK_FAILED');
  console.log('self-check ok');
  return;
}

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', selected: 0, updated: 0, skus: [] };
  const snap = [];
  try {
    await db.query('BEGIN');
    const others = () => db.query(
      `SELECT md5(string_agg(md5(c.sku || coalesce(c.codigo_base,'') || (c.enrichment_data - 'codigo_base_governance')::text || coalesce(c.oem_codes::text,'') || coalesce(c.competitor_codes::text,'')), '|' ORDER BY c.sku)) AS h
       FROM public.elimfilters_catalog c`).then((r) => r.rows[0].h);
    const ld = () => db.query(`SELECT md5(string_agg(c::text, '|' ORDER BY c.sku)) AS h FROM public.elimfilters_catalog c WHERE duty<>'HEAVY_DUTY'`).then((r) => r.rows[0].h);
    const [h0, ld0] = [await others(), await ld()];

    const rows = (await db.query(
      `SELECT sku,duty,catalog_active,codigo_base,oem_codes,competitor_codes,enrichment_data FROM public.elimfilters_catalog
       WHERE duty='HEAVY_DUTY' AND catalog_active AND enrichment_data->'codigo_base_governance'->>'state' IS DISTINCT FROM 'CANONICAL_VERIFIED'
       ORDER BY sku FOR UPDATE`)).rows;
    for (const row of rows) {
      const derived = deriveCodigoBaseGovernance(row);
      if (!eligible(row, derived)) continue;
      const stored = row.enrichment_data.codigo_base_governance;
      const next = { ...stored, ...derived };
      report.selected += 1; report.skus.push(row.sku);
      snap.push({ sku: row.sku, before: stored });
      const r = await db.query(
        `UPDATE public.elimfilters_catalog SET enrichment_data = jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{codigo_base_governance}', $2::jsonb, true) WHERE sku=$1`,
        [row.sku, JSON.stringify(next)]);
      report.updated += r.rowCount;
    }
    if (SNAPSHOT) require('fs').writeFileSync(SNAPSHOT, JSON.stringify(snap, null, 1));
    if (await others() !== h0) throw new Error('NON_GOVERNANCE_COLUMNS_CHANGED');
    if (await ld() !== ld0) throw new Error('NON_HEAVY_DUTY_ROWS_CHANGED');
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    await db.end();
  }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
