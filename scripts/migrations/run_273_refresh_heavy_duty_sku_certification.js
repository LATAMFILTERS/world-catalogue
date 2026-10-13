'use strict';

/**
 * Recalculate the SKU certification ledger for Heavy Duty products.
 *
 * public.catalog_sku_certification was last calculated on 2026-09-13
 * (run_093, resolver check moved to v_api_resolver_v7 by run_095). Part Search
 * reads it: a BLOCKED row shows "SKU blocked in the recorded audit" on the
 * product page, and strict part-number mode resolves only CERTIFIED SKUs.
 * Since then thousands of bases were verified, products were renumbered and
 * references were corrected, so the ledger describes a catalogue that no
 * longer exists (EH64310: blocked for an unverified base that has been
 * CANONICAL_VERIFIED since 2026-10-04).
 *
 * Same checks, same blocker names as run_093 + run_095, evaluated on today's
 * data, for duty = HEAVY_DUTY only. Light Duty rows are not touched: their
 * state also depends on the regional-policy and MANN audits (run_099,
 * run_100), which this script does not re-run.
 *
 * Left as they are:
 *  - rows held by hand (HERMES_RESEARCH_REQUIRED, REFERENCE_RECONCILIATION_REQUIRED);
 *  - ledger rows whose SKU is no longer in the catalogue.
 * Heavy Duty products without a ledger row get one.
 *
 * Writes only catalog_sku_certification. Dry-run by default (everything runs,
 * then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const POLICY_VERSION = '2026-10-12-hd-cert-refresh-v1';
const MANUAL_HOLDS = ['HERMES_RESEARCH_REQUIRED', 'REFERENCE_RECONCILIATION_REQUIRED'];

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

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', policy_version: POLICY_VERSION };
  const states = () => db.query(
    `SELECT c.certification_state AS state, count(*)::int AS n
     FROM public.catalog_sku_certification c JOIN public.elimfilters_catalog e ON e.sku=c.sku
     WHERE e.duty='HEAVY_DUTY' AND e.catalog_active GROUP BY 1 ORDER BY 1`).then(r => r.rows);

  try {
    await db.query('BEGIN');
    await db.query('LOCK TABLE public.catalog_sku_certification IN SHARE ROW EXCLUSIVE MODE');
    report.active_heavy_duty_before = await states();
    const ld = () => db.query(`SELECT md5(string_agg(c::text, '|' ORDER BY sku)) AS h FROM public.catalog_sku_certification c WHERE duty<>'HEAVY_DUTY'`).then(r => r.rows[0].h);
    const ldBefore = await ld();

    await db.query(`CREATE TEMP TABLE hd_eval ON COMMIT DROP AS ${EVALUATE}`);
    await db.query(`CREATE TEMP TABLE hd_before ON COMMIT DROP AS SELECT sku, certification_state FROM public.catalog_sku_certification`);

    const written = await db.query(`
      INSERT INTO public.catalog_sku_certification AS t (
        sku,duty,filter_type,codigo_base,certification_state,policy_version,
        canonical_governance_ok,regional_policy_ok,canonical_identity_ok,
        base_code_unique,resolver_unique,exact_reference_conflict_free,
        classification_conflict_free,quarantine_free,application_domain_consistent,
        blocker_count,blockers,evidence,certified_at,audited_at
      )
      SELECT
        f.sku,f.duty,f.filter_type,f.codigo_base,
        CASE WHEN cardinality(f.blockers)=0 THEN 'CERTIFIED' ELSE 'BLOCKED' END,
        $1,
        f.canonical_governance_ok,true,true,
        f.base_code_unique,f.resolver_unique,f.exact_reference_conflict_free,
        f.classification_conflict_free,f.quarantine_free,f.application_domain_consistent,
        cardinality(f.blockers),f.blockers,
        jsonb_build_object(
          'governance_state',f.governance_state,
          'base_sku_count',f.base_sku_count,
          'resolver_v7_sku_count',f.resolver_sku_count,
          'resolver_v7_only_sku',f.resolver_only_sku,
          'classification_conflict_count',f.classification_conflict_count,
          'quarantine_count',f.quarantine_count,
          'vehicle_application_count',f.vehicle_app_count,
          'equipment_application_count',f.equipment_app_count
        ),
        CASE WHEN cardinality(f.blockers)=0 THEN now() ELSE NULL END,
        now()
      FROM hd_eval f
      ON CONFLICT (sku) DO UPDATE SET
        duty=EXCLUDED.duty, filter_type=EXCLUDED.filter_type, codigo_base=EXCLUDED.codigo_base,
        certification_state=EXCLUDED.certification_state, policy_version=EXCLUDED.policy_version,
        canonical_governance_ok=EXCLUDED.canonical_governance_ok, regional_policy_ok=EXCLUDED.regional_policy_ok,
        canonical_identity_ok=EXCLUDED.canonical_identity_ok, base_code_unique=EXCLUDED.base_code_unique,
        resolver_unique=EXCLUDED.resolver_unique, exact_reference_conflict_free=EXCLUDED.exact_reference_conflict_free,
        classification_conflict_free=EXCLUDED.classification_conflict_free, quarantine_free=EXCLUDED.quarantine_free,
        application_domain_consistent=EXCLUDED.application_domain_consistent,
        blocker_count=EXCLUDED.blocker_count, blockers=EXCLUDED.blockers, evidence=EXCLUDED.evidence,
        certified_at=CASE WHEN EXCLUDED.certification_state='CERTIFIED' THEN coalesce(t.certified_at, now()) ELSE NULL END,
        audited_at=now()
      WHERE NOT (t.blockers && $2::text[])
    `, [POLICY_VERSION, MANUAL_HOLDS]);
    report.rows_written = written.rowCount;

    if (await ld() !== ldBefore) throw new Error('NON_HEAVY_DUTY_ROWS_CHANGED');
    const missing = await db.query(
      `SELECT count(*)::int AS n FROM public.elimfilters_catalog e
       WHERE e.duty='HEAVY_DUTY' AND NOT EXISTS (SELECT 1 FROM public.catalog_sku_certification c WHERE c.sku=e.sku)`);
    if (missing.rows[0].n !== 0) throw new Error(`HEAVY_DUTY_WITHOUT_LEDGER_ROW ${missing.rows[0].n}`);

    report.active_heavy_duty_after = await states();
    report.transitions = (await db.query(
      `SELECT coalesce(b.certification_state,'NO_ROW') AS before, c.certification_state AS after, count(*)::int AS n
       FROM public.catalog_sku_certification c JOIN public.elimfilters_catalog e ON e.sku=c.sku
       LEFT JOIN hd_before b ON b.sku=c.sku
       WHERE e.duty='HEAVY_DUTY' AND e.catalog_active GROUP BY 1,2 ORDER BY 3 DESC`)).rows;
    report.blockers_after = (await db.query(
      `SELECT blocker, count(*)::int AS n
       FROM public.catalog_sku_certification c JOIN public.elimfilters_catalog e ON e.sku=c.sku
       CROSS JOIN LATERAL unnest(c.blockers) blocker
       WHERE e.duty='HEAVY_DUTY' AND e.catalog_active GROUP BY 1 ORDER BY 2 DESC`)).rows;
    report.newly_blocked = (await db.query(
      `SELECT c.sku, array_to_string(c.blockers,';') AS blockers
       FROM public.catalog_sku_certification c JOIN hd_before b ON b.sku=c.sku
       WHERE b.certification_state='CERTIFIED' AND c.certification_state='BLOCKED' ORDER BY c.sku`)).rows;

    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    await db.end();
  }
})().catch(e => { console.error(e.stack || e); process.exit(1); });
