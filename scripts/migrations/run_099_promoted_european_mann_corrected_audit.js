'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '099_PROMOTED_EUROPEAN_MANN_CORRECTED_AUDIT';
const BLOCKER = 'EUROPEAN_MANN_PROMOTION_INVALID';

async function applyPromotedEuropeanMannCorrectedAudit() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();
  const report = {
    migration: MIGRATION,
    audit_only_catalog: true,
    mutations: { catalog: 0, sku: 0, codigo_base: 0, canonical_identity: 0, applications: 0 },
    summary: {},
    invalid: []
  };

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS ld_catalog.ld_promoted_european_mann_corrected_audit (
        public_sku text PRIMARY KEY,
        normalized_sku text NOT NULL,
        mann_part_number text NOT NULL,
        evidence_source text NOT NULL,
        normalized_application_rows integer NOT NULL,
        full_candidate_count integer NOT NULL,
        promoted_target_is_full boolean NOT NULL,
        full_candidate_skus text[] NOT NULL DEFAULT ARRAY[]::text[],
        audit_state text NOT NULL,
        audited_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await client.query('TRUNCATE ld_catalog.ld_promoted_european_mann_corrected_audit');

    await client.query(`
      WITH promoted AS (
        SELECT
          i.elimfilters_sku::text AS public_sku,
          s.normalized_sku::text AS normalized_sku,
          i.canonical_part_number::text AS mann_part_number,
          s.expected_filter_type::text AS expected_filter_type,
          i.evidence_source::text AS evidence_source
        FROM ld_catalog.ld_canonical_product_identity i
        JOIN ld_catalog.ld_european_mann_public_match_candidates s
          ON s.public_sku=i.elimfilters_sku
         AND ld_catalog.norm_part(s.mann_part_number)=ld_catalog.norm_part(i.canonical_part_number)
        WHERE i.status='ACTIVE'
          AND i.evidence_source='MIGRATION_088_EXACT_APPLICATION_UNIQUE'

        UNION ALL

        SELECT
          i.elimfilters_sku::text,
          r.normalized_sku::text,
          i.canonical_part_number::text,
          CASE p.segment
            WHEN 'Air Filter' THEN 'air'
            WHEN 'Oil Filter' THEN 'oil'
            WHEN 'Fuel Filter' THEN 'fuel'
            WHEN 'Cabin Filter' THEN 'cabin'
            ELSE NULL
          END,
          i.evidence_source::text
        FROM ld_catalog.ld_canonical_product_identity i
        JOIN ld_catalog.ld_european_mann_match_reconciliation r
          ON r.only_full_public_sku=i.elimfilters_sku
         AND ld_catalog.norm_part(r.mann_part_number)=ld_catalog.norm_part(i.canonical_part_number)
        JOIN ld_catalog.ld_product_catalog p ON p.elimfilters_sku=r.normalized_sku
        WHERE i.status='ACTIVE'
          AND i.evidence_source='MIGRATION_097_RECONCILED_SINGLE_FULL_SAFE'
      ),
      norm_apps AS (
        SELECT DISTINCT
          pr.public_sku AS promoted_public_sku,
          pr.normalized_sku,
          pr.mann_part_number,
          pr.expected_filter_type,
          pr.evidence_source,
          ld_catalog.normalized_make(v.make) AS make_key,
          upper(trim(coalesce(v.model_family,''))) AS model_family_key,
          upper(trim(coalesce(v.model_type,''))) AS model_type_key,
          upper(trim(coalesce(v.year,''))) AS year_key,
          upper(trim(coalesce(v.engine_code,''))) AS engine_key,
          upper(trim(coalesce(v.ccm,''))) AS ccm_key
        FROM promoted pr
        JOIN ld_catalog.ld_vehicle_applications v ON v.elimfilters_sku=pr.normalized_sku
        WHERE ld_catalog.normalized_make(v.make)<>''
          AND upper(trim(coalesce(v.model_family,'')))<>''
      ),
      app_totals AS (
        SELECT promoted_public_sku, normalized_sku, count(*)::int AS normalized_application_rows
        FROM norm_apps
        GROUP BY promoted_public_sku, normalized_sku
      ),
      candidates AS (
        SELECT DISTINCT
          n.promoted_public_sku,
          n.normalized_sku,
          p.public_sku::text AS candidate_public_sku
        FROM norm_apps n
        JOIN ld_catalog.ld_public_vehicle_application_index p
          ON p.make_key=n.make_key
         AND p.model_family_key=n.model_family_key
         AND p.filter_type=n.expected_filter_type
      ),
      full_candidates AS (
        SELECT c.promoted_public_sku,c.normalized_sku,c.candidate_public_sku
        FROM candidates c
        WHERE NOT EXISTS (
          SELECT 1
          FROM norm_apps n
          WHERE n.promoted_public_sku=c.promoted_public_sku
            AND n.normalized_sku=c.normalized_sku
            AND NOT EXISTS (
              SELECT 1
              FROM ld_catalog.ld_public_vehicle_application_index p
              WHERE p.public_sku=c.candidate_public_sku
                AND p.filter_type=n.expected_filter_type
                AND p.make_key=n.make_key
                AND p.model_family_key=n.model_family_key
                AND (n.model_type_key='' OR p.model_type_key=n.model_type_key)
                AND (n.year_key='' OR p.year_key=n.year_key)
                AND (n.engine_key='' OR p.engine_key=n.engine_key)
                AND (n.ccm_key='' OR p.ccm_key=n.ccm_key)
            )
        )
      ),
      aggregated AS (
        SELECT
          pr.public_sku,
          pr.normalized_sku,
          pr.mann_part_number,
          pr.evidence_source,
          coalesce(t.normalized_application_rows,0)::int AS normalized_application_rows,
          count(DISTINCT fc.candidate_public_sku)::int AS full_candidate_count,
          coalesce(bool_or(fc.candidate_public_sku=pr.public_sku),false) AS promoted_target_is_full,
          coalesce(array_agg(DISTINCT fc.candidate_public_sku) FILTER (WHERE fc.candidate_public_sku IS NOT NULL),ARRAY[]::text[]) AS full_candidate_skus
        FROM promoted pr
        LEFT JOIN app_totals t ON t.promoted_public_sku=pr.public_sku AND t.normalized_sku=pr.normalized_sku
        LEFT JOIN full_candidates fc ON fc.promoted_public_sku=pr.public_sku AND fc.normalized_sku=pr.normalized_sku
        GROUP BY pr.public_sku,pr.normalized_sku,pr.mann_part_number,pr.evidence_source,t.normalized_application_rows
      )
      INSERT INTO ld_catalog.ld_promoted_european_mann_corrected_audit(
        public_sku,normalized_sku,mann_part_number,evidence_source,
        normalized_application_rows,full_candidate_count,promoted_target_is_full,
        full_candidate_skus,audit_state,audited_at
      )
      SELECT
        a.public_sku,a.normalized_sku,a.mann_part_number,a.evidence_source,
        a.normalized_application_rows,a.full_candidate_count,a.promoted_target_is_full,
        a.full_candidate_skus,
        CASE
          WHEN a.normalized_application_rows=0 THEN 'NO_NORMALIZED_APPLICATION_EVIDENCE'
          WHEN a.promoted_target_is_full AND a.full_candidate_count=1 THEN 'VALID_UNIQUE'
          WHEN NOT a.promoted_target_is_full AND a.full_candidate_count=1 THEN 'TARGET_MISMATCH_UNIQUE'
          WHEN NOT a.promoted_target_is_full AND a.full_candidate_count>1 THEN 'TARGET_MISMATCH_MULTIPLE'
          WHEN a.promoted_target_is_full AND a.full_candidate_count>1 THEN 'PROMOTED_TARGET_NOT_UNIQUE'
          ELSE 'NO_FULL_CANDIDATE'
        END,
        now()
      FROM aggregated a
    `);

    const completeness = await client.query(`
      SELECT
        (SELECT count(*)::int FROM ld_catalog.ld_canonical_product_identity
          WHERE status='ACTIVE' AND evidence_source IN ('MIGRATION_088_EXACT_APPLICATION_UNIQUE','MIGRATION_097_RECONCILED_SINGLE_FULL_SAFE')) AS promoted_identities,
        (SELECT count(*)::int FROM ld_catalog.ld_promoted_european_mann_corrected_audit) AS audit_rows
    `);
    report.summary.completeness = completeness.rows[0];
    if (completeness.rows[0].promoted_identities !== completeness.rows[0].audit_rows) {
      throw new Error(`PROMOTED_MANN_AUDIT_CARDINALITY_MISMATCH promoted=${completeness.rows[0].promoted_identities} audit=${completeness.rows[0].audit_rows}`);
    }

    const states = await client.query(`
      SELECT audit_state,count(*)::int AS n
      FROM ld_catalog.ld_promoted_european_mann_corrected_audit
      GROUP BY audit_state ORDER BY audit_state
    `);
    report.summary.states = states.rows;

    const invalid = await client.query(`
      SELECT public_sku,normalized_sku,mann_part_number,evidence_source,
             normalized_application_rows,full_candidate_count,promoted_target_is_full,
             full_candidate_skus,audit_state
      FROM ld_catalog.ld_promoted_european_mann_corrected_audit
      WHERE audit_state<>'VALID_UNIQUE'
      ORDER BY public_sku
    `);
    report.invalid = invalid.rows;

    // The global certification ledger must never certify a promoted European
    // MANN identity that fails corrected per-application EXISTS semantics.
    await client.query(`
      UPDATE public.catalog_sku_certification
      SET blockers=array_remove(blockers,'${BLOCKER}'), audited_at=now()
      WHERE '${BLOCKER}'=ANY(blockers)
    `);

    await client.query(`
      UPDATE public.catalog_sku_certification c
      SET
        blockers=CASE WHEN '${BLOCKER}'=ANY(c.blockers) THEN c.blockers ELSE array_append(c.blockers,'${BLOCKER}') END,
        evidence=jsonb_set(c.evidence,'{promoted_mann_corrected_audit_state}',to_jsonb(a.audit_state),true),
        audited_at=now()
      FROM ld_catalog.ld_promoted_european_mann_corrected_audit a
      WHERE a.public_sku=c.sku AND a.audit_state<>'VALID_UNIQUE'
    `);

    await client.query(`
      UPDATE public.catalog_sku_certification
      SET blocker_count=cardinality(blockers),
          certification_state=CASE WHEN cardinality(blockers)=0 THEN 'CERTIFIED' ELSE 'BLOCKED' END,
          certified_at=CASE WHEN cardinality(blockers)=0 THEN coalesce(certified_at,now()) ELSE NULL END,
          audited_at=now()
    `);

    const ledger = await client.query(`
      SELECT count(*)::int AS total_skus,
             count(*) FILTER (WHERE certification_state='CERTIFIED')::int AS certified,
             count(*) FILTER (WHERE certification_state='BLOCKED')::int AS blocked,
             count(*) FILTER (WHERE '${BLOCKER}'=ANY(blockers))::int AS invalid_promoted_mann_blocked
      FROM public.catalog_sku_certification
    `);
    report.summary.ledger = ledger.rows[0];

    await client.query('COMMIT');
    return report;
  } catch (error) {
    await client.query('ROLLBACK');
    throw Object.assign(error,{ migrationReport: report });
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main===module) {
  applyPromotedEuropeanMannCorrectedAudit()
    .then(report=>console.log('[promoted-european-mann-corrected-audit]',JSON.stringify(report)))
    .catch(error=>{
      console.error('[promoted-european-mann-corrected-audit] failed',JSON.stringify(error.migrationReport || { error:error.message }));
      process.exit(1);
    });
}

module.exports={ MIGRATION, BLOCKER, applyPromotedEuropeanMannCorrectedAudit };
