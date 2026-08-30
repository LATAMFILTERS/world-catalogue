'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '089_EUROPEAN_MANN_UNRESOLVED_DIAGNOSTICS';

async function applyEuropeanMannUnresolvedDiagnostics() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();
  const report = { migration: MIGRATION, staging_only: true, mutations: { sku: 0, codigo_base: 0, canonical_identity: 0 }, summary: {}, sample: [] };

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS ld_catalog.ld_european_mann_unresolved_diagnostics (
        normalized_sku text NOT NULL,
        mann_part_number text NOT NULL,
        segment text,
        source_match_state text NOT NULL,
        public_sku text,
        normalized_application_rows integer NOT NULL DEFAULT 0,
        matched_application_rows integer NOT NULL DEFAULT 0,
        coverage numeric(8,5) NOT NULL DEFAULT 0,
        candidate_rank integer,
        candidate_count integer NOT NULL DEFAULT 0,
        normalized_oem_count integer NOT NULL DEFAULT 0,
        oem_overlap integer NOT NULL DEFAULT 0,
        diagnostic_state text NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (normalized_sku, public_sku)
      )
    `);

    await client.query('TRUNCATE ld_catalog.ld_european_mann_unresolved_diagnostics');

    await client.query(`
      WITH unresolved AS (
        SELECT *
        FROM ld_catalog.ld_european_mann_public_match_candidates
        WHERE match_state IN ('MULTIPLE_PUBLIC_EXACT_MATCHES','NO_PUBLIC_EXACT_MATCH')
      ), norm_apps AS (
        SELECT DISTINCT
          u.normalized_sku,
          u.mann_part_number,
          u.segment,
          u.expected_filter_type,
          u.match_state AS source_match_state,
          ld_catalog.normalized_make(v.make) AS make_key,
          upper(trim(coalesce(v.model_family,''))) AS model_family_key,
          upper(trim(coalesce(v.model_type,''))) AS model_type_key,
          upper(trim(coalesce(v.year,''))) AS year_key,
          upper(trim(coalesce(v.engine_code,''))) AS engine_key,
          upper(trim(coalesce(v.ccm,''))) AS ccm_key
        FROM unresolved u
        JOIN ld_catalog.ld_vehicle_applications v ON v.elimfilters_sku=u.normalized_sku
        WHERE ld_catalog.normalized_make(v.make)<>''
          AND upper(trim(coalesce(v.model_family,'')))<>''
      ), totals AS (
        SELECT normalized_sku, mann_part_number, segment, expected_filter_type, source_match_state, count(*)::int AS app_rows
        FROM norm_apps
        GROUP BY normalized_sku, mann_part_number, segment, expected_filter_type, source_match_state
      ), candidate_match AS (
        SELECT
          n.normalized_sku,
          p.public_sku,
          count(*)::int AS matched_rows
        FROM norm_apps n
        JOIN ld_catalog.ld_public_vehicle_application_index p
          ON p.make_key=n.make_key
         AND p.model_family_key=n.model_family_key
         AND (n.model_type_key='' OR p.model_type_key=n.model_type_key)
         AND (n.year_key='' OR p.year_key=n.year_key)
         AND (n.engine_key='' OR p.engine_key=n.engine_key)
         AND (n.ccm_key='' OR p.ccm_key=n.ccm_key)
         AND p.filter_type=n.expected_filter_type
        GROUP BY n.normalized_sku, p.public_sku
      ), norm_oem AS (
        SELECT DISTINCT elimfilters_sku AS normalized_sku, ld_catalog.norm_part(oem_part_number) AS code
        FROM ld_catalog.ld_oem_cross_references
        WHERE ld_catalog.norm_part(oem_part_number)<>''
      ), norm_oem_counts AS (
        SELECT normalized_sku, count(*)::int AS normalized_oem_count
        FROM norm_oem GROUP BY normalized_sku
      ), pub_oem AS (
        SELECT c.sku AS public_sku,
               ld_catalog.norm_part(CASE WHEN jsonb_typeof(x)='string' THEN x#>>'{}' ELSE coalesce(x->>'code',x->>'part_number',x->>'part') END) AS code
        FROM public.elimfilters_catalog c
        CROSS JOIN LATERAL jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb)) x
        WHERE c.duty='LIGHT_DUTY'
      ), scored AS (
        SELECT
          t.normalized_sku,
          t.mann_part_number,
          t.segment,
          t.source_match_state,
          cm.public_sku,
          t.app_rows,
          coalesce(cm.matched_rows,0)::int AS matched_rows,
          CASE WHEN t.app_rows>0 THEN coalesce(cm.matched_rows,0)::numeric/t.app_rows ELSE 0 END AS coverage,
          coalesce(nc.normalized_oem_count,0)::int AS normalized_oem_count,
          count(DISTINCT no.code) FILTER (WHERE po.code IS NOT NULL)::int AS oem_overlap
        FROM totals t
        LEFT JOIN candidate_match cm ON cm.normalized_sku=t.normalized_sku
        LEFT JOIN norm_oem_counts nc ON nc.normalized_sku=t.normalized_sku
        LEFT JOIN norm_oem no ON no.normalized_sku=t.normalized_sku
        LEFT JOIN pub_oem po ON po.public_sku=cm.public_sku AND po.code=no.code
        GROUP BY t.normalized_sku,t.mann_part_number,t.segment,t.source_match_state,cm.public_sku,t.app_rows,cm.matched_rows,nc.normalized_oem_count
      ), ranked AS (
        SELECT s.*,
          row_number() OVER (PARTITION BY normalized_sku ORDER BY coverage DESC, oem_overlap DESC, public_sku) AS candidate_rank,
          count(*) FILTER (WHERE public_sku IS NOT NULL) OVER (PARTITION BY normalized_sku)::int AS candidate_count,
          max(coverage) OVER (PARTITION BY normalized_sku) AS best_coverage,
          count(*) FILTER (WHERE coverage=1) OVER (PARTITION BY normalized_sku)::int AS full_match_count,
          max(oem_overlap) OVER (PARTITION BY normalized_sku)::int AS best_oem_overlap,
          count(*) FILTER (WHERE oem_overlap>0) OVER (PARTITION BY normalized_sku)::int AS positive_oem_candidates
        FROM scored s
      )
      INSERT INTO ld_catalog.ld_european_mann_unresolved_diagnostics(
        normalized_sku, mann_part_number, segment, source_match_state, public_sku,
        normalized_application_rows, matched_application_rows, coverage,
        candidate_rank, candidate_count, normalized_oem_count, oem_overlap,
        diagnostic_state, updated_at
      )
      SELECT
        normalized_sku, mann_part_number, segment, source_match_state, public_sku,
        app_rows, matched_rows, coverage,
        candidate_rank, candidate_count, normalized_oem_count, oem_overlap,
        CASE
          WHEN source_match_state='MULTIPLE_PUBLIC_EXACT_MATCHES' THEN 'MULTIPLE_EXACT_REVIEW'
          WHEN source_match_state='NO_PUBLIC_EXACT_MATCH' AND public_sku IS NULL THEN 'NO_APPLICATION_OVERLAP'
          WHEN source_match_state='NO_PUBLIC_EXACT_MATCH' AND best_coverage>0 THEN 'PARTIAL_APPLICATION_MATCH_REVIEW'
          ELSE 'EVIDENCE_REQUIRED'
        END,
        now()
      FROM ranked
      WHERE public_sku IS NOT NULL OR source_match_state='NO_PUBLIC_EXACT_MATCH'
    `);

    const summary = await client.query(`
      WITH families AS (
        SELECT normalized_sku,
               min(source_match_state) AS source_match_state,
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
    report.summary.states = summary.rows;

    const counts = await client.query(`
      SELECT
        count(DISTINCT normalized_sku)::int AS unresolved_families,
        count(*) FILTER (WHERE public_sku IS NOT NULL)::int AS candidate_pairs,
        count(DISTINCT normalized_sku) FILTER (WHERE coverage=1)::int AS multiple_exact_families,
        count(DISTINCT normalized_sku) FILTER (WHERE coverage>0 AND coverage<1)::int AS partial_match_families,
        count(DISTINCT normalized_sku) FILTER (WHERE oem_overlap>0)::int AS oem_overlap_families
      FROM ld_catalog.ld_european_mann_unresolved_diagnostics
    `);
    report.summary.counts = counts.rows[0];

    const sample = await client.query(`
      SELECT normalized_sku, mann_part_number, segment, source_match_state, public_sku,
             normalized_application_rows, matched_application_rows, coverage,
             candidate_rank, candidate_count, normalized_oem_count, oem_overlap, diagnostic_state
      FROM ld_catalog.ld_european_mann_unresolved_diagnostics
      WHERE candidate_rank=1 OR candidate_rank IS NULL
      ORDER BY source_match_state, normalized_sku
      LIMIT 20
    `);
    report.sample = sample.rows;

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
  applyEuropeanMannUnresolvedDiagnostics()
    .then(report => console.log('[european-mann-unresolved-diagnostics]', JSON.stringify(report)))
    .catch(error => {
      console.error('[european-mann-unresolved-diagnostics] failed', JSON.stringify(error.migrationReport || { error: error.message }));
      process.exit(1);
    });
}

module.exports = { MIGRATION, applyEuropeanMannUnresolvedDiagnostics };
