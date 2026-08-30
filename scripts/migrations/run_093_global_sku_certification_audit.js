'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '093_GLOBAL_SKU_CERTIFICATION_AUDIT';
const POLICY_VERSION = '2026-08-29-global-cert-v1';

async function applyGlobalSkuCertificationAudit() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();
  const report = {
    migration: MIGRATION,
    policy_version: POLICY_VERSION,
    audit_only: true,
    mutations: { catalog: 0, sku: 0, codigo_base: 0, canonical_identity: 0, applications: 0 },
    summary: {},
    top_blockers: [],
    sample_blocked: []
  };

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.catalog_sku_certification (
        sku text PRIMARY KEY,
        duty text NOT NULL,
        filter_type text,
        codigo_base text,
        certification_state text NOT NULL,
        policy_version text NOT NULL,
        canonical_governance_ok boolean NOT NULL DEFAULT false,
        regional_policy_ok boolean NOT NULL DEFAULT false,
        canonical_identity_ok boolean NOT NULL DEFAULT false,
        base_code_unique boolean NOT NULL DEFAULT false,
        resolver_unique boolean NOT NULL DEFAULT false,
        exact_reference_conflict_free boolean NOT NULL DEFAULT false,
        classification_conflict_free boolean NOT NULL DEFAULT false,
        quarantine_free boolean NOT NULL DEFAULT false,
        application_domain_consistent boolean NOT NULL DEFAULT false,
        blocker_count integer NOT NULL DEFAULT 0,
        blockers text[] NOT NULL DEFAULT ARRAY[]::text[],
        evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
        certified_at timestamptz,
        audited_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS catalog_sku_certification_state_idx ON public.catalog_sku_certification(certification_state)`);
    await client.query(`CREATE INDEX IF NOT EXISTS catalog_sku_certification_duty_idx ON public.catalog_sku_certification(duty)`);
    await client.query('TRUNCATE public.catalog_sku_certification');

    await client.query(`
      WITH catalog AS (
        SELECT
          c.sku::text AS sku,
          coalesce(c.duty,'UNKNOWN')::text AS duty,
          c.filter_type::text AS filter_type,
          nullif(trim(c.codigo_base::text),'') AS codigo_base,
          upper(regexp_replace(coalesce(c.codigo_base::text,''), '[^A-Za-z0-9]', '', 'g')) AS base_key,
          coalesce(c.enrichment_data->'codigo_base_governance'->>'state', c.enrichment_data->'codigo_base_governance'->>'governance_state', '') AS governance_state,
          CASE WHEN jsonb_typeof(coalesce(c.vehicle_applications,'[]'::jsonb))='array' THEN jsonb_array_length(coalesce(c.vehicle_applications,'[]'::jsonb)) ELSE 0 END AS vehicle_app_count,
          CASE WHEN jsonb_typeof(coalesce(c.equipment_applications,'[]'::jsonb))='array' THEN jsonb_array_length(coalesce(c.equipment_applications,'[]'::jsonb)) ELSE 0 END AS equipment_app_count
        FROM public.elimfilters_catalog c
      ),
      base_dupes AS (
        SELECT base_key, count(DISTINCT sku)::int AS sku_count
        FROM catalog
        WHERE base_key<>''
        GROUP BY base_key
      ),
      ld_policy AS (
        SELECT sku::text, regional_policy_state, origin_group, approved_manufacturer, approved_codigo_base
        FROM public.catalog_ld_regional_policy_audit_v
      ),
      ld_identity AS (
        SELECT
          elimfilters_sku::text AS sku,
          count(*) FILTER (WHERE status='ACTIVE')::int AS active_identity_count,
          max(origin_group) FILTER (WHERE status='ACTIVE') AS identity_origin_group,
          max(canonical_brand) FILTER (WHERE status='ACTIVE') AS identity_brand,
          max(canonical_part_number) FILTER (WHERE status='ACTIVE') AS identity_part_number
        FROM ld_catalog.ld_canonical_product_identity
        GROUP BY elimfilters_sku
      ),
      resolver_code_counts AS (
        SELECT upper(regexp_replace(coalesce(code,''), '[^A-Za-z0-9]', '', 'g')) AS code_key,
               count(DISTINCT sku)::int AS sku_count,
               min(sku) AS only_sku
        FROM public.v_api_resolver_v6
        GROUP BY upper(regexp_replace(coalesce(code,''), '[^A-Za-z0-9]', '', 'g'))
      ),
      exact_conflict_skus AS (
        SELECT DISTINCT unnest(skus)::text AS sku
        FROM public.exact_part_conflicts
      ),
      classification_conflicts AS (
        SELECT sku::text, count(*)::int AS conflict_count
        FROM public.catalog_reference_classification_conflicts_v
        GROUP BY sku
      ),
      quarantined AS (
        SELECT source_sku::text AS sku, count(*)::int AS quarantine_count
        FROM public.bad_crossref_quarantine
        WHERE source_sku IS NOT NULL
        GROUP BY source_sku
      ),
      checks AS (
        SELECT
          c.*,
          coalesce(bd.sku_count,0) AS base_sku_count,
          lp.regional_policy_state,
          lp.origin_group,
          lp.approved_manufacturer,
          lp.approved_codigo_base,
          coalesce(li.active_identity_count,0) AS active_identity_count,
          li.identity_origin_group,
          li.identity_brand,
          li.identity_part_number,
          coalesce(rc.sku_count,0) AS resolver_sku_count,
          rc.only_sku AS resolver_only_sku,
          (ecs.sku IS NULL) AS exact_reference_conflict_free,
          coalesce(cc.conflict_count,0) AS classification_conflict_count,
          coalesce(q.quarantine_count,0) AS quarantine_count
        FROM catalog c
        LEFT JOIN base_dupes bd ON bd.base_key=c.base_key
        LEFT JOIN ld_policy lp ON lp.sku=c.sku
        LEFT JOIN ld_identity li ON li.sku=c.sku
        LEFT JOIN resolver_code_counts rc ON rc.code_key=c.base_key
        LEFT JOIN exact_conflict_skus ecs ON ecs.sku=c.sku
        LEFT JOIN classification_conflicts cc ON cc.sku=c.sku
        LEFT JOIN quarantined q ON q.sku=c.sku
      ),
      evaluated AS (
        SELECT
          x.*,
          (x.codigo_base IS NOT NULL AND x.governance_state='CANONICAL_VERIFIED') AS canonical_governance_ok,
          CASE WHEN x.duty='LIGHT_DUTY' THEN x.regional_policy_state='POLICY_ALIGNED' ELSE true END AS regional_policy_ok,
          CASE
            WHEN x.duty='LIGHT_DUTY' THEN
              x.active_identity_count=1
              AND upper(regexp_replace(coalesce(x.identity_part_number,''), '[^A-Za-z0-9]', '', 'g'))=x.base_key
              AND (
                (x.origin_group='EUROPEAN' AND upper(coalesce(x.identity_brand,'')) IN ('MANN-FILTER','MANN FILTER','MANN'))
                OR (x.origin_group='NON_EUROPEAN' AND upper(coalesce(x.identity_brand,''))='FRAM')
              )
            ELSE true
          END AS canonical_identity_ok,
          (x.codigo_base IS NOT NULL AND x.base_key<>'' AND x.base_sku_count=1) AS base_code_unique,
          (x.codigo_base IS NOT NULL AND x.resolver_sku_count=1 AND x.resolver_only_sku=x.sku) AS resolver_unique,
          x.exact_reference_conflict_free AS exact_reference_conflict_free_ok,
          (x.classification_conflict_count=0) AS classification_conflict_free,
          (x.quarantine_count=0) AS quarantine_free,
          CASE
            WHEN x.duty='LIGHT_DUTY' THEN x.equipment_app_count=0
            WHEN x.duty='HEAVY_DUTY' THEN x.vehicle_app_count=0
            ELSE false
          END AS application_domain_consistent
        FROM checks x
      ),
      final AS (
        SELECT
          e.*,
          array_remove(ARRAY[
            CASE WHEN e.codigo_base IS NULL THEN 'MISSING_CODIGO_BASE' END,
            CASE WHEN NOT e.canonical_governance_ok THEN 'CANONICAL_GOVERNANCE_NOT_VERIFIED' END,
            CASE WHEN NOT e.regional_policy_ok THEN 'LD_REGIONAL_POLICY_NOT_ALIGNED' END,
            CASE WHEN NOT e.canonical_identity_ok THEN 'LD_CANONICAL_IDENTITY_INVALID' END,
            CASE WHEN NOT e.base_code_unique THEN 'CODIGO_BASE_NOT_UNIQUE' END,
            CASE WHEN NOT e.resolver_unique THEN 'BASE_CODE_NOT_UNIQUELY_RESOLVED' END,
            CASE WHEN NOT e.exact_reference_conflict_free_ok THEN 'EXACT_PART_REFERENCE_CONFLICT' END,
            CASE WHEN NOT e.classification_conflict_free THEN 'REFERENCE_CLASSIFICATION_CONFLICT' END,
            CASE WHEN NOT e.quarantine_free THEN 'QUARANTINED_REFERENCE_PRESENT' END,
            CASE WHEN NOT e.application_domain_consistent THEN 'APPLICATION_DOMAIN_CONFLICT' END,
            CASE WHEN e.duty NOT IN ('LIGHT_DUTY','HEAVY_DUTY') THEN 'INVALID_DUTY' END,
            CASE WHEN nullif(trim(coalesce(e.filter_type,'')),'') IS NULL THEN 'MISSING_FILTER_TYPE' END
          ]::text[], NULL) AS blockers
        FROM evaluated e
      )
      INSERT INTO public.catalog_sku_certification (
        sku,duty,filter_type,codigo_base,certification_state,policy_version,
        canonical_governance_ok,regional_policy_ok,canonical_identity_ok,
        base_code_unique,resolver_unique,exact_reference_conflict_free,
        classification_conflict_free,quarantine_free,application_domain_consistent,
        blocker_count,blockers,evidence,certified_at,audited_at
      )
      SELECT
        f.sku,f.duty,f.filter_type,f.codigo_base,
        CASE WHEN cardinality(f.blockers)=0 THEN 'CERTIFIED' ELSE 'BLOCKED' END,
        '${POLICY_VERSION}',
        f.canonical_governance_ok,f.regional_policy_ok,f.canonical_identity_ok,
        f.base_code_unique,f.resolver_unique,f.exact_reference_conflict_free_ok,
        f.classification_conflict_free,f.quarantine_free,f.application_domain_consistent,
        cardinality(f.blockers),f.blockers,
        jsonb_build_object(
          'governance_state',f.governance_state,
          'regional_policy_state',f.regional_policy_state,
          'origin_group',f.origin_group,
          'approved_manufacturer',f.approved_manufacturer,
          'approved_codigo_base',f.approved_codigo_base,
          'active_identity_count',f.active_identity_count,
          'identity_brand',f.identity_brand,
          'identity_part_number',f.identity_part_number,
          'base_sku_count',f.base_sku_count,
          'resolver_sku_count',f.resolver_sku_count,
          'resolver_only_sku',f.resolver_only_sku,
          'classification_conflict_count',f.classification_conflict_count,
          'quarantine_count',f.quarantine_count,
          'vehicle_application_count',f.vehicle_app_count,
          'equipment_application_count',f.equipment_app_count
        ),
        CASE WHEN cardinality(f.blockers)=0 THEN now() ELSE NULL END,
        now()
      FROM final f
    `);

    const totals = await client.query(`
      SELECT duty, certification_state, count(*)::int AS n
      FROM public.catalog_sku_certification
      GROUP BY duty, certification_state
      ORDER BY duty, certification_state
    `);
    report.summary.states = totals.rows;

    const overall = await client.query(`
      SELECT
        count(*)::int AS total_skus,
        count(*) FILTER (WHERE certification_state='CERTIFIED')::int AS certified,
        count(*) FILTER (WHERE certification_state='BLOCKED')::int AS blocked,
        count(*) FILTER (WHERE certification_state='CERTIFIED') = count(*) AS all_certified
      FROM public.catalog_sku_certification
    `);
    report.summary.overall = overall.rows[0];

    const blockers = await client.query(`
      SELECT blocker, count(*)::int AS n
      FROM public.catalog_sku_certification c
      CROSS JOIN LATERAL unnest(c.blockers) blocker
      GROUP BY blocker
      ORDER BY n DESC, blocker
      LIMIT 20
    `);
    report.top_blockers = blockers.rows;

    const sample = await client.query(`
      SELECT sku,duty,filter_type,codigo_base,blocker_count,blockers,evidence
      FROM public.catalog_sku_certification
      WHERE certification_state='BLOCKED'
      ORDER BY blocker_count DESC, sku
      LIMIT 20
    `);
    report.sample_blocked = sample.rows;

    const cardinalityCheck = await client.query(`
      SELECT
        (SELECT count(*) FROM public.elimfilters_catalog)::int AS catalog_rows,
        (SELECT count(*) FROM public.catalog_sku_certification)::int AS certification_rows
    `);
    if (cardinalityCheck.rows[0].catalog_rows !== cardinalityCheck.rows[0].certification_rows) {
      throw new Error(`GLOBAL_CERTIFICATION_CARDINALITY_MISMATCH catalog=${cardinalityCheck.rows[0].catalog_rows} certification=${cardinalityCheck.rows[0].certification_rows}`);
    }

    await client.query('COMMIT');
    return report;
  } catch (error) {
    await client.query('ROLLBACK');
    throw Object.assign(error, { migrationReport: report });
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  applyGlobalSkuCertificationAudit()
    .then(report => console.log('[global-sku-certification-audit]', JSON.stringify(report)))
    .catch(error => {
      console.error('[global-sku-certification-audit] failed', JSON.stringify(error.migrationReport || { error: error.message }));
      process.exit(1);
    });
}

module.exports = { MIGRATION, POLICY_VERSION, applyGlobalSkuCertificationAudit };
