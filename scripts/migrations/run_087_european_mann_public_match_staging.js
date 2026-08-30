'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '087_EUROPEAN_MANN_PUBLIC_MATCH_STAGING';

async function applyEuropeanMannPublicMatchStaging() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();
  const report = { migration: MIGRATION, staging_only: true, mutations: { canonical_catalog: 0, sku: 0, codigo_base: 0 }, summary: {}, sample: [] };

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS ld_catalog.ld_public_vehicle_application_index (
        public_sku text NOT NULL,
        filter_type text,
        make_key text NOT NULL,
        model_family_key text NOT NULL,
        model_type_key text NOT NULL,
        year_key text NOT NULL,
        engine_key text NOT NULL,
        ccm_key text NOT NULL,
        refreshed_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await client.query('TRUNCATE ld_catalog.ld_public_vehicle_application_index');

    await client.query(`
      INSERT INTO ld_catalog.ld_public_vehicle_application_index(
        public_sku, filter_type, make_key, model_family_key, model_type_key,
        year_key, engine_key, ccm_key, refreshed_at
      )
      SELECT DISTINCT
        c.sku,
        lower(coalesce(c.filter_type,'')),
        ld_catalog.normalized_make(a->>'make'),
        upper(trim(coalesce(nullif(a->>'model_family',''), nullif(a->>'model',''), ''))),
        upper(trim(coalesce(a->>'model_type',''))),
        upper(trim(coalesce(nullif(a->>'year',''), nullif(a->>'year_range',''), ''))),
        upper(trim(coalesce(a->>'engine_code',''))),
        upper(trim(coalesce(a->>'ccm',''))),
        now()
      FROM public.elimfilters_catalog c
      CROSS JOIN LATERAL jsonb_array_elements(coalesce(c.vehicle_applications,'[]'::jsonb)) a
      WHERE c.duty='LIGHT_DUTY'
        AND jsonb_typeof(coalesce(c.vehicle_applications,'[]'::jsonb))='array'
        AND ld_catalog.normalized_make(a->>'make')<>''
        AND upper(trim(coalesce(nullif(a->>'model_family',''), nullif(a->>'model',''), '')))<>''
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_ld_public_vehicle_app_match
      ON ld_catalog.ld_public_vehicle_application_index(make_key, model_family_key, model_type_key, filter_type)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ld_public_vehicle_app_sku
      ON ld_catalog.ld_public_vehicle_application_index(public_sku)`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ld_catalog.ld_european_mann_public_match_candidates (
        normalized_sku text PRIMARY KEY,
        mann_part_number text NOT NULL,
        segment text,
        expected_filter_type text,
        normalized_application_rows integer NOT NULL DEFAULT 0,
        public_sku text,
        matched_application_rows integer NOT NULL DEFAULT 0,
        public_candidate_count integer NOT NULL DEFAULT 0,
        match_state text NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await client.query('TRUNCATE ld_catalog.ld_european_mann_public_match_candidates');

    await client.query(`
      WITH ready AS (
        SELECT
          b.elimfilters_sku AS normalized_sku,
          b.canonical_part_number AS mann_part_number,
          b.segment,
          CASE b.segment
            WHEN 'Air Filter' THEN 'air'
            WHEN 'Oil Filter' THEN 'oil'
            WHEN 'Fuel Filter' THEN 'fuel'
            WHEN 'Cabin Filter' THEN 'cabin'
            ELSE NULL
          END AS expected_filter_type
        FROM ld_catalog.ld_canonical_backfill_candidates b
        WHERE b.candidate_state='READY_SOURCE_MANN'
          AND b.origin_group='EUROPEAN'
          AND b.canonical_brand='MANN-FILTER'
      ), norm_apps AS (
        SELECT DISTINCT
          r.normalized_sku,
          r.mann_part_number,
          r.segment,
          r.expected_filter_type,
          ld_catalog.normalized_make(v.make) AS make_key,
          upper(trim(coalesce(v.model_family,''))) AS model_family_key,
          upper(trim(coalesce(v.model_type,''))) AS model_type_key,
          upper(trim(coalesce(v.year,''))) AS year_key,
          upper(trim(coalesce(v.engine_code,''))) AS engine_key,
          upper(trim(coalesce(v.ccm,''))) AS ccm_key
        FROM ready r
        JOIN ld_catalog.ld_vehicle_applications v ON v.elimfilters_sku=r.normalized_sku
        WHERE ld_catalog.normalized_make(v.make)<>''
          AND upper(trim(coalesce(v.model_family,'')))<>''
      ), totals AS (
        SELECT normalized_sku, mann_part_number, segment, expected_filter_type, count(*)::int AS app_rows
        FROM norm_apps
        GROUP BY normalized_sku, mann_part_number, segment, expected_filter_type
      ), matched AS (
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
      ), full_matches AS (
        SELECT m.normalized_sku, m.public_sku, m.matched_rows
        FROM matched m
        JOIN totals t USING (normalized_sku)
        WHERE m.matched_rows=t.app_rows
      ), ranked AS (
        SELECT
          f.normalized_sku,
          min(f.public_sku) AS only_public_sku,
          max(f.matched_rows)::int AS matched_rows,
          count(DISTINCT f.public_sku)::int AS candidate_count
        FROM full_matches f
        GROUP BY f.normalized_sku
      )
      INSERT INTO ld_catalog.ld_european_mann_public_match_candidates(
        normalized_sku, mann_part_number, segment, expected_filter_type,
        normalized_application_rows, public_sku, matched_application_rows,
        public_candidate_count, match_state, updated_at
      )
      SELECT
        r.normalized_sku,
        r.mann_part_number,
        r.segment,
        r.expected_filter_type,
        coalesce(t.app_rows,0),
        CASE WHEN coalesce(k.candidate_count,0)=1 THEN k.only_public_sku ELSE NULL END,
        coalesce(k.matched_rows,0),
        coalesce(k.candidate_count,0),
        CASE
          WHEN coalesce(t.app_rows,0)=0 THEN 'APPLICATION_EVIDENCE_REQUIRED'
          WHEN r.expected_filter_type IS NULL THEN 'FILTER_TYPE_MAPPING_REQUIRED'
          WHEN coalesce(k.candidate_count,0)=1 THEN 'EXACT_APPLICATION_UNIQUE'
          WHEN coalesce(k.candidate_count,0)=0 THEN 'NO_PUBLIC_EXACT_MATCH'
          ELSE 'MULTIPLE_PUBLIC_EXACT_MATCHES'
        END,
        now()
      FROM ready r
      LEFT JOIN totals t USING (normalized_sku)
      LEFT JOIN ranked k USING (normalized_sku)
    `);

    const summary = await client.query(`
      SELECT match_state, count(*)::int AS n
      FROM ld_catalog.ld_european_mann_public_match_candidates
      GROUP BY match_state
      ORDER BY match_state
    `);
    report.summary.states = summary.rows;

    const sample = await client.query(`
      SELECT normalized_sku, mann_part_number, segment, public_sku,
             normalized_application_rows, matched_application_rows, public_candidate_count, match_state
      FROM ld_catalog.ld_european_mann_public_match_candidates
      WHERE match_state='EXACT_APPLICATION_UNIQUE'
      ORDER BY normalized_sku
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
  applyEuropeanMannPublicMatchStaging()
    .then(report => console.log('[european-mann-public-match-staging]', JSON.stringify(report)))
    .catch(error => {
      console.error('[european-mann-public-match-staging] failed', JSON.stringify(error.migrationReport || { error: error.message }));
      process.exit(1);
    });
}

module.exports = { MIGRATION, applyEuropeanMannPublicMatchStaging };
