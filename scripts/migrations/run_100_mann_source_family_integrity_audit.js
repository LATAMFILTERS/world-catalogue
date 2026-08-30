'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '100_MANN_SOURCE_FAMILY_INTEGRITY_AUDIT';
const BLOCKER = 'MANN_SOURCE_FAMILY_INTEGRITY_CONFLICT';

async function applyMannSourceFamilyIntegrityAudit() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();
  const report = {
    migration: MIGRATION,
    audit_only_catalog: true,
    mutations: { catalog: 0, sku: 0, codigo_base: 0, canonical_identity: 0, applications: 0, cross_references: 0 },
    summary: {},
    conflicts: []
  };

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS ld_catalog.ld_mann_source_family_integrity_audit (
        public_sku text PRIMARY KEY,
        normalized_sku text NOT NULL,
        canonical_part_number text NOT NULL,
        evidence_source text NOT NULL,
        product_catalog_source_match boolean NOT NULL,
        specification_row_count integer NOT NULL DEFAULT 0,
        specification_source_codes text[] NOT NULL DEFAULT ARRAY[]::text[],
        off_canonical_specification_rows integer NOT NULL DEFAULT 0,
        audit_state text NOT NULL,
        audited_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await client.query('TRUNCATE ld_catalog.ld_mann_source_family_integrity_audit');

    await client.query(`
      WITH promoted AS (
        SELECT
          i.elimfilters_sku::text AS public_sku,
          m.normalized_sku::text AS normalized_sku,
          i.canonical_part_number::text AS canonical_part_number,
          i.evidence_source::text AS evidence_source
        FROM ld_catalog.ld_canonical_product_identity i
        JOIN ld_catalog.ld_european_mann_public_match_candidates m
          ON m.public_sku=i.elimfilters_sku
         AND ld_catalog.norm_part(m.mann_part_number)=ld_catalog.norm_part(i.canonical_part_number)
        WHERE i.status='ACTIVE'
          AND i.canonical_brand='MANN-FILTER'
          AND i.evidence_source='MIGRATION_088_EXACT_APPLICATION_UNIQUE'

        UNION ALL

        SELECT
          i.elimfilters_sku::text,
          r.normalized_sku::text,
          i.canonical_part_number::text,
          i.evidence_source::text
        FROM ld_catalog.ld_canonical_product_identity i
        JOIN ld_catalog.ld_european_mann_match_reconciliation r
          ON r.only_full_public_sku=i.elimfilters_sku
         AND ld_catalog.norm_part(r.mann_part_number)=ld_catalog.norm_part(i.canonical_part_number)
        WHERE i.status='ACTIVE'
          AND i.canonical_brand='MANN-FILTER'
          AND i.evidence_source='MIGRATION_097_RECONCILED_SINGLE_FULL_SAFE'
      ),
      audited AS (
        SELECT
          p.public_sku,
          p.normalized_sku,
          p.canonical_part_number,
          p.evidence_source,
          EXISTS (
            SELECT 1
            FROM ld_catalog.ld_product_catalog pc
            WHERE pc.elimfilters_sku=p.normalized_sku
              AND ld_catalog.norm_part(pc.source_sku)=ld_catalog.norm_part(p.canonical_part_number)
          ) AS product_catalog_source_match,
          count(s.*)::int AS specification_row_count,
          coalesce(array_agg(DISTINCT s.source_sku) FILTER (WHERE s.source_sku IS NOT NULL),ARRAY[]::text[]) AS specification_source_codes,
          count(*) FILTER (
            WHERE s.source_sku IS NOT NULL
              AND ld_catalog.norm_part(s.source_sku)<>ld_catalog.norm_part(p.canonical_part_number)
          )::int AS off_canonical_specification_rows
        FROM promoted p
        LEFT JOIN ld_catalog.ld_product_specifications s
          ON s.elimfilters_sku=p.normalized_sku
        GROUP BY p.public_sku,p.normalized_sku,p.canonical_part_number,p.evidence_source
      )
      INSERT INTO ld_catalog.ld_mann_source_family_integrity_audit(
        public_sku,normalized_sku,canonical_part_number,evidence_source,
        product_catalog_source_match,specification_row_count,specification_source_codes,
        off_canonical_specification_rows,audit_state,audited_at
      )
      SELECT
        a.public_sku,a.normalized_sku,a.canonical_part_number,a.evidence_source,
        a.product_catalog_source_match,a.specification_row_count,a.specification_source_codes,
        a.off_canonical_specification_rows,
        CASE
          WHEN NOT a.product_catalog_source_match THEN 'CANONICAL_SOURCE_NOT_IN_PRODUCT_CATALOG'
          WHEN a.off_canonical_specification_rows>0 THEN 'SPECIFICATION_SOURCE_CONFLICT'
          ELSE 'SOURCE_FAMILY_CONSISTENT'
        END,
        now()
      FROM audited a
    `);

    const completeness = await client.query(`
      SELECT
        (SELECT count(*)::int
         FROM ld_catalog.ld_canonical_product_identity
         WHERE status='ACTIVE'
           AND canonical_brand='MANN-FILTER'
           AND evidence_source IN ('MIGRATION_088_EXACT_APPLICATION_UNIQUE','MIGRATION_097_RECONCILED_SINGLE_FULL_SAFE')) AS promoted_identities,
        (SELECT count(*)::int FROM ld_catalog.ld_mann_source_family_integrity_audit) AS audit_rows
    `);
    report.summary.completeness = completeness.rows[0];
    if (completeness.rows[0].promoted_identities !== completeness.rows[0].audit_rows) {
      throw new Error(`MANN_SOURCE_FAMILY_AUDIT_CARDINALITY_MISMATCH promoted=${completeness.rows[0].promoted_identities} audit=${completeness.rows[0].audit_rows}`);
    }

    const states = await client.query(`
      SELECT audit_state,count(*)::int AS n
      FROM ld_catalog.ld_mann_source_family_integrity_audit
      GROUP BY audit_state ORDER BY audit_state
    `);
    report.summary.states = states.rows;

    const conflicts = await client.query(`
      SELECT public_sku,normalized_sku,canonical_part_number,evidence_source,
             product_catalog_source_match,specification_row_count,
             specification_source_codes,off_canonical_specification_rows,audit_state
      FROM ld_catalog.ld_mann_source_family_integrity_audit
      WHERE audit_state<>'SOURCE_FAMILY_CONSISTENT'
      ORDER BY public_sku
    `);
    report.conflicts = conflicts.rows;

    await client.query(`
      UPDATE public.catalog_sku_certification
      SET blockers=array_remove(blockers,'${BLOCKER}'), audited_at=now()
      WHERE '${BLOCKER}'=ANY(blockers)
    `);

    await client.query(`
      UPDATE public.catalog_sku_certification c
      SET
        blockers=CASE WHEN '${BLOCKER}'=ANY(c.blockers) THEN c.blockers ELSE array_append(c.blockers,'${BLOCKER}') END,
        evidence=jsonb_set(c.evidence,'{mann_source_family_integrity_state}',to_jsonb(a.audit_state),true),
        audited_at=now()
      FROM ld_catalog.ld_mann_source_family_integrity_audit a
      WHERE a.public_sku=c.sku
        AND a.audit_state<>'SOURCE_FAMILY_CONSISTENT'
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
             count(*) FILTER (WHERE '${BLOCKER}'=ANY(blockers))::int AS source_family_conflicts_blocked
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
  applyMannSourceFamilyIntegrityAudit()
    .then(report=>console.log('[mann-source-family-integrity-audit]',JSON.stringify(report)))
    .catch(error=>{
      console.error('[mann-source-family-integrity-audit] failed',JSON.stringify(error.migrationReport || { error:error.message }));
      process.exit(1);
    });
}

module.exports={ MIGRATION, BLOCKER, applyMannSourceFamilyIntegrityAudit };
