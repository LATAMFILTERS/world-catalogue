'use strict';
// Recertification of a LIST of Heavy Duty SKUs (--skus <json array file>) after their reference conflicts were cleared (2026-11-25).
// Same evaluator as run_273 (HD), same per-SKU rules as recertify_el82043_only.js: a SKU becomes CERTIFIED only when every check passes, no manual/research hold exists and it is currently BLOCKED.
// SKUs that still have blockers are left untouched and reported. Dry-run by default (ROLLBACK). --execute needs --snapshot <file>. Never runs the global run_273.
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const { manualLedgerRow } = require('./run_093_global_sku_certification_audit');
const APPLY = process.argv.includes('--execute');
const arg = (n) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const POLICY_VERSION = '2026-11-06-hd-cert-refresh-v2';
const EVALUATE = `
  WITH catalog AS (
    SELECT
      c.sku::text AS sku,
      c.duty::text AS duty,
      c.filter_type::text AS filter_type,
      nullif(trim(c.codigo_base::text),'') AS codigo_base,
      upper(regexp_replace(coalesce(c.codigo_base::text,''), '[^A-Za-z0-9]', '', 'g')) AS base_key,
      coalesce(c.enrichment_data->'codigo_base_governance'->>'state', c.enrichment_data->'codigo_base_governance'->>'governance_state', '') AS governance_state,
      CASE WHEN jsonb_typeof(coalesce(c.vehicle_applications,'[]'::jsonb))='array' THEN jsonb_array_length(coalesce(c.vehicle_applications,'[]'::jsonb)) ELSE 0 END AS vehicle_app_count,
      CASE WHEN jsonb_typeof(coalesce(c.equipment_applications,'[]'::jsonb))='array' THEN jsonb_array_length(coalesce(c.equipment_applications,'[]'::jsonb)) ELSE 0 END AS equipment_app_count
    FROM public.elimfilters_catalog c
  ),
  base_dupes AS (
    SELECT base_key, count(DISTINCT sku)::int AS sku_count FROM catalog WHERE base_key<>'' GROUP BY base_key
  ),
  resolver_counts AS (
    SELECT ld_catalog.norm_part(code) AS code_key, count(DISTINCT sku)::int AS sku_count, min(sku)::text AS only_sku
    FROM public.v_api_resolver_v7 GROUP BY ld_catalog.norm_part(code)
  ),
  exact_conflict_skus AS (
    SELECT DISTINCT unnest(skus)::text AS sku FROM public.exact_part_conflicts
  ),
  classification_conflicts AS (
    SELECT sku::text, count(*)::int AS conflict_count FROM public.catalog_reference_classification_conflicts_v GROUP BY sku
  ),
  quarantined AS (
    SELECT source_sku::text AS sku, count(*)::int AS quarantine_count
    FROM public.bad_crossref_quarantine WHERE source_sku IS NOT NULL GROUP BY source_sku
  ),
  evaluated AS (
    SELECT
      c.*,
      coalesce(bd.sku_count,0) AS base_sku_count,
      coalesce(rc.sku_count,0) AS resolver_sku_count,
      rc.only_sku AS resolver_only_sku,
      coalesce(cc.conflict_count,0) AS classification_conflict_count,
      coalesce(q.quarantine_count,0) AS quarantine_count,
      (c.codigo_base IS NOT NULL AND c.governance_state='CANONICAL_VERIFIED') AS canonical_governance_ok,
      (c.codigo_base IS NOT NULL AND c.base_key<>'' AND coalesce(bd.sku_count,0)=1) AS base_code_unique,
      (c.codigo_base IS NOT NULL AND coalesce(rc.sku_count,0)=1 AND rc.only_sku=c.sku) AS resolver_unique,
      (ecs.sku IS NULL) AS exact_reference_conflict_free,
      (coalesce(cc.conflict_count,0)=0) AS classification_conflict_free,
      (coalesce(q.quarantine_count,0)=0) AS quarantine_free,
      (c.vehicle_app_count=0) AS application_domain_consistent
    FROM catalog c
    LEFT JOIN base_dupes bd ON bd.base_key=c.base_key
    LEFT JOIN resolver_counts rc ON rc.code_key=ld_catalog.norm_part(c.codigo_base)
    LEFT JOIN exact_conflict_skus ecs ON ecs.sku=c.sku
    LEFT JOIN classification_conflicts cc ON cc.sku=c.sku
    LEFT JOIN quarantined q ON q.sku=c.sku
    WHERE c.duty='HEAVY_DUTY'
  )
  SELECT
    e.*,
    array_remove(ARRAY[
      CASE WHEN e.codigo_base IS NULL THEN 'MISSING_CODIGO_BASE' END,
      CASE WHEN NOT e.canonical_governance_ok THEN 'CANONICAL_GOVERNANCE_NOT_VERIFIED' END,
      CASE WHEN NOT e.base_code_unique THEN 'CODIGO_BASE_NOT_UNIQUE' END,
      CASE WHEN NOT e.resolver_unique THEN 'BASE_CODE_NOT_UNIQUELY_RESOLVED' END,
      CASE WHEN NOT e.exact_reference_conflict_free THEN 'EXACT_PART_REFERENCE_CONFLICT' END,
      CASE WHEN NOT e.classification_conflict_free THEN 'REFERENCE_CLASSIFICATION_CONFLICT' END,
      CASE WHEN NOT e.quarantine_free THEN 'QUARANTINED_REFERENCE_PRESENT' END,
      CASE WHEN NOT e.application_domain_consistent THEN 'APPLICATION_DOMAIN_CONFLICT' END,
      CASE WHEN nullif(trim(coalesce(e.filter_type,'')),'') IS NULL THEN 'MISSING_FILTER_TYPE' END
    ]::text[], NULL) AS blockers
  FROM evaluated e
`;
const fail = (msg) => { throw new Error('BLOCKED: ' + msg); };
(async () => {
  if (APPLY && !SNAPSHOT) fail('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  if (!arg('--skus')) fail('--skus <json array file> is required');
  const list = JSON.parse(fs.readFileSync(arg('--skus'), 'utf8'));
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'EXECUTE' : 'DRY_RUN', requested: list.length, certified: [], still_blocked: {}, skipped: [] };
  const checks = ['canonical_governance_ok', 'base_code_unique', 'resolver_unique', 'exact_reference_conflict_free', 'classification_conflict_free', 'quarantine_free', 'application_domain_consistent'];
  try {
    await db.query('BEGIN');
    const before = (await db.query('SELECT * FROM public.catalog_sku_certification WHERE sku = ANY($1) FOR UPDATE', [list])).rows;
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows: before }, null, 2));
    const byOld = new Map(before.map((r) => [r.sku, r]));
    const audit = (await db.query('SELECT * FROM (' + EVALUATE + ') AS audit WHERE audit.sku = ANY($1)', [list])).rows;
    const byAudit = new Map(audit.map((r) => [r.sku, r]));
    for (const sku of list) {
      const existing = byOld.get(sku), f = byAudit.get(sku);
      if (!existing || !f) { report.skipped.push(sku + ' (sin fila de registro o no es HD)'); continue; }
      if (existing.certification_state === 'CERTIFIED') { report.skipped.push(sku + ' (ya certificado)'); continue; }
      if (existing.certification_state !== 'BLOCKED') { report.skipped.push(sku + ' (estado ' + existing.certification_state + ')'); continue; }
      const held = (await db.query(`SELECT ${manualLedgerRow('c')} AS held FROM public.catalog_sku_certification c WHERE c.sku=$1`, [sku])).rows[0].held;
      if (held) { report.skipped.push(sku + ' (retención manual)'); continue; }
      const failed = checks.filter((k) => f[k] !== true);
      if (failed.length || !f.filter_type || f.blockers.length || f.resolver_only_sku !== sku || f.resolver_sku_count !== 1) { report.still_blocked[sku] = f.blockers.length ? f.blockers : ['V7_IDENTITY']; continue; }
      const u = await db.query(`UPDATE public.catalog_sku_certification c SET
        duty=$2, filter_type=$3, codigo_base=$4, certification_state='CERTIFIED', policy_version=$5,
        canonical_governance_ok=$6, regional_policy_ok=true, canonical_identity_ok=true,
        base_code_unique=$7, resolver_unique=$8, exact_reference_conflict_free=$9,
        classification_conflict_free=$10, quarantine_free=$11, application_domain_consistent=$12,
        blocker_count=0, blockers=ARRAY[]::text[], evidence=$13::jsonb, certified_at=coalesce(c.certified_at,now()), audited_at=now()
        WHERE c.sku=$1 AND c.certification_state='BLOCKED' RETURNING sku`,
        [sku, f.duty, f.filter_type, f.codigo_base, POLICY_VERSION, f.canonical_governance_ok, f.base_code_unique, f.resolver_unique,
         f.exact_reference_conflict_free, f.classification_conflict_free, f.quarantine_free, f.application_domain_consistent,
         JSON.stringify({ governance_state: f.governance_state, base_sku_count: f.base_sku_count, resolver_v7_sku_count: f.resolver_sku_count, resolver_v7_only_sku: f.resolver_only_sku,
           classification_conflict_count: f.classification_conflict_count, quarantine_count: f.quarantine_count, vehicle_application_count: f.vehicle_app_count, equipment_application_count: f.equipment_app_count })]);
      if (u.rowCount !== 1) fail('row not updated ' + sku);
      report.certified.push(sku);
    }
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} console.error(e.message); process.exitCode = 1; } finally { await db.end(); }
})().catch((e) => { console.error(e.message); process.exitCode = 1; });
