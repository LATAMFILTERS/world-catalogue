'use strict';
// Recertification of a LIST of Light Duty SKUs (--skus <json array file>) with current data (operator 2026-11-25). The Light Duty ledger dates from 2026-09-13 (run_093); run_273 only refreshes Heavy Duty.
// Same checks and blocker names as run_093 (LD branch) evaluated on today's data: governance CANONICAL_VERIFIED, regional policy POLICY_ALIGNED, exactly one ACTIVE canonical identity whose part number
// equals the code base (MANN-FILTER for EUROPEAN, FRAM for NON_EUROPEAN), base unique among ACTIVE SKUs, resolver v7 unique, no exact/classification conflict with an active partner, no quarantine, no equipment applications.
// The two operator-approved Millard exceptions (EL35796, EA17203: per-SKU functions in the database) count as aligned regional policy and valid identity.
// A SKU becomes CERTIFIED only when every check passes, no manual/research hold exists and it is currently BLOCKED. Others are left untouched and reported.
// Dry-run by default (ROLLBACK). --execute needs --snapshot <file>. Never runs the global audit.
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const { manualLedgerRow } = require('./run_093_global_sku_certification_audit');

const APPLY = process.argv.includes('--execute');
const arg = (n) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const POLICY_VERSION = '2026-11-25-ld-cert-refresh-v1';

const EVALUATE = `
  WITH catalog AS (
    SELECT c.sku::text AS sku, c.duty::text AS duty, c.filter_type::text AS filter_type, c.catalog_active AS is_active,
      (public.el35796_millard_exception_approved(c) OR public.ea17203_millard_exception_approved(c)) AS millard_exception,
      -- run_500 (operator 2026-11-27): Mopar diesel pickup kit pair, verified ELIMFILTERS OEM product identity instead of a FRAM / MANN base
      coalesce(c.sku IN ('EF37291','EF37867') AND c.codigo_base=c.sku
        AND c.enrichment_data->'codigo_base_governance'->>'identity_type'='ELIMFILTERS_OEM_PRODUCT'
        AND c.enrichment_data->'codigo_base_governance'->>'internal_product_identity_verified'='true'
        AND c.enrichment_data->'codigo_base_governance'->'approved_manual_exception'->>'approval_id'='LD_MOPAR_KIT_OPERATOR_EXCEPTION_20261127', false) AS mopar_exception,
      nullif(trim(c.codigo_base::text),'') AS codigo_base,
      upper(regexp_replace(coalesce(c.codigo_base::text,''), '[^A-Za-z0-9]', '', 'g')) AS base_key,
      coalesce(c.enrichment_data->'codigo_base_governance'->>'state', c.enrichment_data->'codigo_base_governance'->>'governance_state', '') AS governance_state,
      CASE WHEN jsonb_typeof(coalesce(c.vehicle_applications,'[]'::jsonb))='array' THEN jsonb_array_length(coalesce(c.vehicle_applications,'[]'::jsonb)) ELSE 0 END AS vehicle_app_count,
      CASE WHEN jsonb_typeof(coalesce(c.equipment_applications,'[]'::jsonb))='array' THEN jsonb_array_length(coalesce(c.equipment_applications,'[]'::jsonb)) ELSE 0 END AS equipment_app_count
    FROM public.elimfilters_catalog c
  ),
  base_dupes AS (SELECT base_key, count(DISTINCT sku)::int AS sku_count FROM catalog WHERE base_key<>'' AND is_active GROUP BY base_key),
  ld_policy AS (SELECT sku::text, regional_policy_state, origin_group FROM public.catalog_ld_regional_policy_audit_v),
  ld_identity AS (
    SELECT elimfilters_sku::text AS sku, count(*) FILTER (WHERE status='ACTIVE')::int AS active_identity_count,
      max(origin_group) FILTER (WHERE status='ACTIVE') AS identity_origin_group, max(canonical_brand) FILTER (WHERE status='ACTIVE') AS identity_brand,
      max(canonical_part_number) FILTER (WHERE status='ACTIVE') AS identity_part_number
    FROM ld_catalog.ld_canonical_product_identity GROUP BY elimfilters_sku
  ),
  resolver_counts AS (SELECT ld_catalog.norm_part(code) AS code_key, count(DISTINCT sku)::int AS sku_count, min(sku)::text AS only_sku FROM public.v_api_resolver_v7 GROUP BY ld_catalog.norm_part(code)),
  exact_conflict_skus AS (
    SELECT DISTINCT s AS sku FROM (
      SELECT unnest(p.skus)::text AS s, p.skus FROM public.exact_part_conflicts p
    ) x WHERE (SELECT count(*) FROM catalog c WHERE c.sku = ANY(x.skus) AND c.is_active) >= 2 AND EXISTS (SELECT 1 FROM catalog c WHERE c.sku = x.s AND c.is_active)
  ),
  classification_conflicts AS (SELECT sku::text, count(*)::int AS conflict_count FROM public.catalog_reference_classification_conflicts_v GROUP BY sku),
  quarantined AS (SELECT source_sku::text AS sku, count(*)::int AS quarantine_count FROM public.bad_crossref_quarantine WHERE source_sku IS NOT NULL GROUP BY source_sku),
  checks AS (
    SELECT c.*, coalesce(bd.sku_count,0) AS base_sku_count, lp.regional_policy_state, lp.origin_group,
      coalesce(li.active_identity_count,0) AS active_identity_count, li.identity_origin_group, li.identity_brand, li.identity_part_number,
      coalesce(rc.sku_count,0) AS resolver_sku_count, rc.only_sku AS resolver_only_sku, (ecs.sku IS NULL) AS exact_ok,
      coalesce(cc.conflict_count,0) AS classification_conflict_count, coalesce(q.quarantine_count,0) AS quarantine_count
    FROM catalog c
    LEFT JOIN base_dupes bd ON bd.base_key=c.base_key LEFT JOIN ld_policy lp ON lp.sku=c.sku LEFT JOIN ld_identity li ON li.sku=c.sku
    LEFT JOIN resolver_counts rc ON rc.code_key=c.base_key LEFT JOIN exact_conflict_skus ecs ON ecs.sku=c.sku
    LEFT JOIN classification_conflicts cc ON cc.sku=c.sku LEFT JOIN quarantined q ON q.sku=c.sku
    WHERE c.duty='LIGHT_DUTY'
  ),
  evaluated AS (
    SELECT x.*,
      (x.codigo_base IS NOT NULL AND x.governance_state='CANONICAL_VERIFIED') AS canonical_governance_ok,
      (x.regional_policy_state='POLICY_ALIGNED' OR x.millard_exception OR x.mopar_exception) AS regional_policy_ok,
      (x.millard_exception OR x.mopar_exception OR x.active_identity_count=1 AND upper(regexp_replace(coalesce(x.identity_part_number,''), '[^A-Za-z0-9]', '', 'g'))=x.base_key
        AND ((x.origin_group='EUROPEAN' AND x.identity_origin_group='EUROPEAN' AND upper(coalesce(x.identity_brand,'')) IN ('MANN-FILTER','MANN FILTER','MANN'))
          OR (x.origin_group='NON_EUROPEAN' AND x.identity_origin_group='NON_EUROPEAN' AND upper(coalesce(x.identity_brand,''))='FRAM'))) AS canonical_identity_ok,
      (x.codigo_base IS NOT NULL AND x.base_key<>'' AND x.base_sku_count=1) AS base_code_unique,
      (x.codigo_base IS NOT NULL AND x.resolver_sku_count=1 AND x.resolver_only_sku=x.sku) AS resolver_unique,
      x.exact_ok AS exact_reference_conflict_free, (x.classification_conflict_count=0) AS classification_conflict_free,
      (x.quarantine_count=0) AS quarantine_free, (x.equipment_app_count=0) AS application_domain_consistent
    FROM checks x
  )
  SELECT e.*, array_remove(ARRAY[
      CASE WHEN e.codigo_base IS NULL THEN 'MISSING_CODIGO_BASE' END,
      CASE WHEN NOT e.canonical_governance_ok THEN 'CANONICAL_GOVERNANCE_NOT_VERIFIED' END,
      CASE WHEN NOT e.regional_policy_ok THEN 'LD_REGIONAL_POLICY_NOT_ALIGNED' END,
      CASE WHEN NOT e.canonical_identity_ok THEN 'LD_CANONICAL_IDENTITY_INVALID' END,
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
  try {
    await db.query('BEGIN');
    const before = (await db.query('SELECT * FROM public.catalog_sku_certification WHERE sku = ANY($1) FOR UPDATE', [list])).rows;
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows: before }, null, 2));
    const byOld = new Map(before.map((r) => [r.sku, r]));
    const audit = (await db.query('SELECT * FROM (' + EVALUATE + ') AS audit WHERE audit.sku = ANY($1)', [list])).rows;
    const byAudit = new Map(audit.map((r) => [r.sku, r]));
    for (const sku of list) {
      const existing = byOld.get(sku);
      const f = byAudit.get(sku);
      if (!f) { report.skipped.push(sku + ' (no es Light Duty)'); continue; }
      if (!f.is_active) { report.skipped.push(sku + ' (inactivo)'); continue; }
      if (!existing) {
        if (!process.argv.includes('--create-missing')) { report.still_blocked[sku] = f.blockers.length ? f.blockers : ['SIN_FILA_DE_REGISTRO']; continue; }
        // never audited: create its ledger row from today's evaluation (CERTIFIED only when every check passes, else BLOCKED with the blockers)
        const ok = !f.blockers.length && f.filter_type;
        await db.query(`INSERT INTO public.catalog_sku_certification(sku,duty,filter_type,codigo_base,certification_state,policy_version,canonical_governance_ok,regional_policy_ok,canonical_identity_ok,base_code_unique,resolver_unique,
          exact_reference_conflict_free,classification_conflict_free,quarantine_free,application_domain_consistent,blocker_count,blockers,evidence,certified_at,audited_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17::text[],$18::jsonb,$19,now())`,
          [sku, f.duty, f.filter_type, f.codigo_base, ok ? 'CERTIFIED' : 'BLOCKED', POLICY_VERSION, f.canonical_governance_ok, f.regional_policy_ok, f.canonical_identity_ok, f.base_code_unique, f.resolver_unique, f.exact_reference_conflict_free, f.classification_conflict_free, f.quarantine_free, f.application_domain_consistent,
           f.blockers.length, f.blockers, JSON.stringify({ governance_state: f.governance_state, regional_policy_state: f.regional_policy_state, origin_group: f.origin_group, identity_brand: f.identity_brand, identity_part_number: f.identity_part_number, base_sku_count: f.base_sku_count, resolver_v7_sku_count: f.resolver_sku_count, resolver_v7_only_sku: f.resolver_only_sku, classification_conflict_count: f.classification_conflict_count, quarantine_count: f.quarantine_count, created_by: 'recertify_ld_skus_list --create-missing' }), ok ? new Date() : null]);
        if (ok) report.certified.push(sku + ' (fila creada)'); else report.still_blocked[sku] = f.blockers;
        continue;
      }
      if (existing.certification_state === 'CERTIFIED') { report.skipped.push(sku + ' (ya certificado)'); continue; }
      if (existing.certification_state !== 'BLOCKED') { report.skipped.push(sku + ' (estado ' + existing.certification_state + ')'); continue; }
      const held = (await db.query(`SELECT ${manualLedgerRow('c')} AS held FROM public.catalog_sku_certification c WHERE c.sku=$1`, [sku])).rows[0].held;
      // a row this script itself created (same policy_version) is not a manual hold
      if (held && existing.policy_version !== POLICY_VERSION) { report.skipped.push(sku + ' (retención manual)'); continue; }
      if (f.blockers.length || !f.filter_type) { report.still_blocked[sku] = f.blockers; continue; }
      const u = await db.query(`UPDATE public.catalog_sku_certification c SET
        duty=$2, filter_type=$3, codigo_base=$4, certification_state='CERTIFIED', policy_version=$5,
        canonical_governance_ok=true, regional_policy_ok=true, canonical_identity_ok=true,
        base_code_unique=true, resolver_unique=true, exact_reference_conflict_free=true,
        classification_conflict_free=true, quarantine_free=true, application_domain_consistent=true,
        blocker_count=0, blockers=ARRAY[]::text[], evidence=$6::jsonb, certified_at=coalesce(c.certified_at,now()), audited_at=now()
        WHERE c.sku=$1 AND c.certification_state='BLOCKED' RETURNING sku`,
        [sku, f.duty, f.filter_type, f.codigo_base, POLICY_VERSION,
         JSON.stringify({ governance_state: f.governance_state, regional_policy_state: f.regional_policy_state, origin_group: f.origin_group, identity_brand: f.identity_brand, identity_part_number: f.identity_part_number,
           base_sku_count: f.base_sku_count, resolver_v7_sku_count: f.resolver_sku_count, resolver_v7_only_sku: f.resolver_only_sku, classification_conflict_count: f.classification_conflict_count,
           quarantine_count: f.quarantine_count, vehicle_application_count: f.vehicle_app_count, equipment_application_count: f.equipment_app_count })]);
      if (u.rowCount !== 1) fail('row not updated ' + sku);
      report.certified.push(sku);
    }
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} console.error(e.message); process.exitCode = 1; } finally { await db.end(); }
})().catch((e) => { console.error(e.message); process.exitCode = 1; });
