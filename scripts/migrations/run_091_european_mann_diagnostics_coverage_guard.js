'use strict';

require('dotenv').config();
const { Pool } = require('pg');
const { applyEuropeanMannDiagnosticsNullableCandidate } = require('./run_090_european_mann_diagnostics_nullable_candidate');

const MIGRATION = '091_EUROPEAN_MANN_DIAGNOSTICS_COVERAGE_GUARD';

async function applyEuropeanMannDiagnosticsCoverageGuard() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const baseReport = await applyEuropeanMannDiagnosticsNullableCandidate();
  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();
  const report = {
    migration: MIGRATION,
    staging_only: true,
    mutations: { sku: 0, codigo_base: 0, canonical_identity: 0 },
    base_diagnostics: baseReport,
    summary: {}
  };

  try {
    await client.query('BEGIN');

    await client.query(`
      WITH norm_apps AS (
        SELECT DISTINCT
          d.normalized_sku,
          ld_catalog.normalized_make(v.make) AS make_key,
          upper(trim(coalesce(v.model_family,''))) AS model_family_key,
          upper(trim(coalesce(v.model_type,''))) AS model_type_key,
          upper(trim(coalesce(v.year,''))) AS year_key,
          upper(trim(coalesce(v.engine_code,''))) AS engine_key,
          upper(trim(coalesce(v.ccm,''))) AS ccm_key,
          d.public_sku
        FROM ld_catalog.ld_european_mann_unresolved_diagnostics d
        JOIN ld_catalog.ld_vehicle_applications v
          ON v.elimfilters_sku=d.normalized_sku
        WHERE d.public_sku IS NOT NULL
          AND ld_catalog.normalized_make(v.make)<>''
          AND upper(trim(coalesce(v.model_family,'')))<>''
      ), matched AS (
        SELECT
          n.normalized_sku,
          n.public_sku,
          count(*)::int AS matched_rows
        FROM norm_apps n
        WHERE EXISTS (
          SELECT 1
          FROM ld_catalog.ld_public_vehicle_application_index p
          WHERE p.public_sku=n.public_sku
            AND p.make_key=n.make_key
            AND p.model_family_key=n.model_family_key
            AND (n.model_type_key='' OR p.model_type_key=n.model_type_key)
            AND (n.year_key='' OR p.year_key=n.year_key)
            AND (n.engine_key='' OR p.engine_key=n.engine_key)
            AND (n.ccm_key='' OR p.ccm_key=n.ccm_key)
        )
        GROUP BY n.normalized_sku,n.public_sku
      )
      UPDATE ld_catalog.ld_european_mann_unresolved_diagnostics d
      SET matched_application_rows=coalesce(m.matched_rows,0),
          coverage=CASE
            WHEN d.normalized_application_rows>0
              THEN coalesce(m.matched_rows,0)::numeric/d.normalized_application_rows
            ELSE 0
          END,
          updated_at=now()
      FROM (
        SELECT x.id, m.matched_rows
        FROM ld_catalog.ld_european_mann_unresolved_diagnostics x
        LEFT JOIN matched m
          ON m.normalized_sku=x.normalized_sku
         AND m.public_sku=x.public_sku
        WHERE x.public_sku IS NOT NULL
      ) m
      WHERE d.id=m.id
    `);

    await client.query(`
      WITH ranked AS (
        SELECT
          id,
          row_number() OVER (
            PARTITION BY normalized_sku
            ORDER BY coverage DESC, oem_overlap DESC, public_sku
          ) AS new_rank,
          count(*) FILTER (WHERE public_sku IS NOT NULL) OVER (
            PARTITION BY normalized_sku
          )::int AS new_count
        FROM ld_catalog.ld_european_mann_unresolved_diagnostics
      )
      UPDATE ld_catalog.ld_european_mann_unresolved_diagnostics d
      SET candidate_rank=r.new_rank,
          candidate_count=r.new_count,
          diagnostic_state=CASE
            WHEN d.source_match_state='MULTIPLE_PUBLIC_EXACT_MATCHES' THEN 'MULTIPLE_EXACT_REVIEW'
            WHEN d.source_match_state='NO_PUBLIC_EXACT_MATCH' AND d.public_sku IS NULL THEN 'NO_APPLICATION_OVERLAP'
            WHEN d.source_match_state='NO_PUBLIC_EXACT_MATCH' AND d.coverage>0 THEN 'PARTIAL_APPLICATION_MATCH_REVIEW'
            ELSE 'EVIDENCE_REQUIRED'
          END,
          updated_at=now()
      FROM ranked r
      WHERE d.id=r.id
    `);

    const impossible = await client.query(`
      SELECT count(*)::int AS n, max(coverage) AS max_coverage
      FROM ld_catalog.ld_european_mann_unresolved_diagnostics
      WHERE coverage>1 OR matched_application_rows>normalized_application_rows
    `);
    report.summary.impossible_coverage = impossible.rows[0];
    if (Number(impossible.rows[0].n) !== 0) {
      throw new Error(`Coverage invariant failed: ${impossible.rows[0].n} rows exceed 100%`);
    }

    const states = await client.query(`
      WITH families AS (
        SELECT normalized_sku,
               max(coverage) AS best_coverage,
               max(oem_overlap) AS best_oem_overlap,
               max(candidate_count) AS candidate_count,
               min(diagnostic_state) FILTER (WHERE candidate_rank=1 OR candidate_rank IS NULL) AS diagnostic_state
        FROM ld_catalog.ld_european_mann_unresolved_diagnostics
        GROUP BY normalized_sku
      )
      SELECT diagnostic_state, count(*)::int AS n
      FROM families
      GROUP BY diagnostic_state
      ORDER BY diagnostic_state
    `);
    report.summary.states = states.rows;

    const counts = await client.query(`
      SELECT
        count(DISTINCT normalized_sku)::int AS unresolved_families,
        count(*) FILTER (WHERE public_sku IS NOT NULL)::int AS candidate_pairs,
        count(DISTINCT normalized_sku) FILTER (WHERE coverage=1)::int AS full_match_families,
        count(DISTINCT normalized_sku) FILTER (WHERE coverage>0 AND coverage<1)::int AS partial_match_families,
        count(DISTINCT normalized_sku) FILTER (WHERE oem_overlap>0)::int AS oem_overlap_families
      FROM ld_catalog.ld_european_mann_unresolved_diagnostics
    `);
    report.summary.counts = counts.rows[0];

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
  applyEuropeanMannDiagnosticsCoverageGuard()
    .then(report => console.log('[european-mann-unresolved-diagnostics-v3]', JSON.stringify(report)))
    .catch(error => {
      console.error('[european-mann-unresolved-diagnostics-v3] failed', JSON.stringify(error.migrationReport || { error: error.message }));
      process.exit(1);
    });
}

module.exports = { MIGRATION, applyEuropeanMannDiagnosticsCoverageGuard };
