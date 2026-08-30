'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '084_LD_ORIGIN_CANDIDATE_BACKFILL';

async function applyLdOriginCandidateBackfill() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();
  const report = { migration: MIGRATION, origin: {}, candidates: {} };

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS ld_catalog.ld_vehicle_make_origin_policy (
        make_key text PRIMARY KEY,
        origin_group text NOT NULL,
        canonical_brand text NOT NULL,
        active boolean NOT NULL DEFAULT true,
        source text NOT NULL DEFAULT 'CURATED_MANUFACTURER_ORIGIN',
        updated_at timestamptz NOT NULL DEFAULT now(),
        CHECK (origin_group IN ('EUROPEAN','NON_EUROPEAN'))
      )
    `);

    await client.query(`
      INSERT INTO ld_catalog.ld_vehicle_make_origin_policy(make_key, origin_group, canonical_brand)
      VALUES
        ('AUDI','EUROPEAN','MANN-FILTER'),('BMW','EUROPEAN','MANN-FILTER'),('MERCEDES-BENZ','EUROPEAN','MANN-FILTER'),
        ('MINI','EUROPEAN','MANN-FILTER'),('OPEL','EUROPEAN','MANN-FILTER'),('VAUXHALL','EUROPEAN','MANN-FILTER'),
        ('PORSCHE','EUROPEAN','MANN-FILTER'),('VW','EUROPEAN','MANN-FILTER'),('VOLKSWAGEN','EUROPEAN','MANN-FILTER'),
        ('SEAT','EUROPEAN','MANN-FILTER'),('SKODA','EUROPEAN','MANN-FILTER'),('FIAT','EUROPEAN','MANN-FILTER'),
        ('ALFA ROMEO','EUROPEAN','MANN-FILTER'),('LANCIA','EUROPEAN','MANN-FILTER'),('PEUGEOT','EUROPEAN','MANN-FILTER'),
        ('CITROEN','EUROPEAN','MANN-FILTER'),('RENAULT','EUROPEAN','MANN-FILTER'),('VOLVO CARS','EUROPEAN','MANN-FILTER'),
        ('JAGUAR','EUROPEAN','MANN-FILTER'),('LAND ROVER','EUROPEAN','MANN-FILTER'),('SAAB','EUROPEAN','MANN-FILTER'),
        ('FORD','NON_EUROPEAN','FRAM'),('CHEVROLET','NON_EUROPEAN','FRAM'),('GMC','NON_EUROPEAN','FRAM'),
        ('CADILLAC','NON_EUROPEAN','FRAM'),('BUICK','NON_EUROPEAN','FRAM'),('CHRYSLER','NON_EUROPEAN','FRAM'),
        ('DODGE','NON_EUROPEAN','FRAM'),('JEEP','NON_EUROPEAN','FRAM'),('LINCOLN','NON_EUROPEAN','FRAM'),
        ('MERCURY','NON_EUROPEAN','FRAM'),('TESLA','NON_EUROPEAN','FRAM'),('TOYOTA','NON_EUROPEAN','FRAM'),
        ('LEXUS','NON_EUROPEAN','FRAM'),('HONDA','NON_EUROPEAN','FRAM'),('ACURA','NON_EUROPEAN','FRAM'),
        ('NISSAN','NON_EUROPEAN','FRAM'),('INFINITI','NON_EUROPEAN','FRAM'),('MAZDA','NON_EUROPEAN','FRAM'),
        ('MITSUBISHI','NON_EUROPEAN','FRAM'),('SUBARU','NON_EUROPEAN','FRAM'),('SUZUKI','NON_EUROPEAN','FRAM'),
        ('ISUZU','NON_EUROPEAN','FRAM'),('HYUNDAI','NON_EUROPEAN','FRAM'),('KIA','NON_EUROPEAN','FRAM'),
        ('GENESIS','NON_EUROPEAN','FRAM'),('DAEWOO','NON_EUROPEAN','FRAM'),('SSANGYONG','NON_EUROPEAN','FRAM')
      ON CONFLICT (make_key) DO UPDATE SET
        origin_group = excluded.origin_group,
        canonical_brand = excluded.canonical_brand,
        active = true,
        updated_at = now()
    `);

    await client.query(`
      CREATE OR REPLACE FUNCTION ld_catalog.normalized_make(value text)
      RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
        SELECT trim(upper(regexp_replace(regexp_replace(coalesce(value,''), '\\s*\\(USA\\).*$', '', 'i'), '\\s+', ' ', 'g')))
      $$
    `);

    await client.query(`
      CREATE OR REPLACE VIEW ld_catalog.ld_sku_origin_evidence_v AS
      WITH matched AS (
        SELECT DISTINCT
          v.elimfilters_sku,
          p.origin_group,
          p.canonical_brand
        FROM ld_catalog.ld_vehicle_applications v
        JOIN ld_catalog.ld_vehicle_make_origin_policy p
          ON p.active = true
         AND (
           ld_catalog.normalized_make(v.make) = p.make_key
           OR ld_catalog.normalized_make(v.make) LIKE p.make_key || ' %'
         )
      ), agg AS (
        SELECT
          elimfilters_sku,
          count(DISTINCT origin_group)::int AS origin_count,
          min(origin_group) AS min_origin,
          max(origin_group) AS max_origin,
          min(canonical_brand) FILTER (WHERE origin_group='EUROPEAN') AS european_brand,
          min(canonical_brand) FILTER (WHERE origin_group='NON_EUROPEAN') AS non_european_brand
        FROM matched
        GROUP BY elimfilters_sku
      )
      SELECT
        p.elimfilters_sku,
        p.source_sku,
        p.segment,
        CASE
          WHEN a.elimfilters_sku IS NULL THEN 'UNKNOWN'
          WHEN a.origin_count = 1 THEN a.min_origin
          ELSE 'MIXED'
        END AS inferred_origin_group,
        CASE
          WHEN a.origin_count = 1 AND a.min_origin='EUROPEAN' THEN 'MANN-FILTER'
          WHEN a.origin_count = 1 AND a.min_origin='NON_EUROPEAN' THEN 'FRAM'
          ELSE NULL
        END AS expected_canonical_brand
      FROM ld_catalog.ld_product_catalog p
      LEFT JOIN agg a USING (elimfilters_sku)
    `);

    await client.query(`
      CREATE OR REPLACE VIEW ld_catalog.ld_canonical_candidate_refs_v AS
      WITH base AS (
        SELECT
          o.elimfilters_sku,
          o.source_sku,
          o.segment,
          o.inferred_origin_group,
          o.expected_canonical_brand,
          c.filter_type,
          c.duty,
          c.competitor_codes
        FROM ld_catalog.ld_sku_origin_evidence_v o
        LEFT JOIN public.elimfilters_catalog c ON c.sku = o.elimfilters_sku
      ), fram_refs AS (
        SELECT
          b.elimfilters_sku,
          upper(regexp_replace(coalesce(x->>'code',''), '[^A-Z0-9]', '', 'g')) AS ref
        FROM base b
        CROSS JOIN LATERAL jsonb_array_elements(coalesce(b.competitor_codes,'[]'::jsonb)) x
        WHERE upper(regexp_replace(coalesce(x->>'manufacturer',''), '[^A-Z0-9]', '', 'g')) = 'FRAM'
          AND upper(regexp_replace(coalesce(x->>'code',''), '[^A-Z0-9]', '', 'g')) <> ''
      ), fram_agg AS (
        SELECT elimfilters_sku, count(DISTINCT ref)::int AS ref_count, min(ref) AS only_ref
        FROM fram_refs GROUP BY elimfilters_sku
      )
      SELECT
        b.elimfilters_sku,
        b.segment,
        b.filter_type,
        b.duty,
        b.inferred_origin_group,
        b.expected_canonical_brand,
        CASE
          WHEN b.inferred_origin_group='EUROPEAN' THEN ld_catalog.norm_part(b.source_sku)
          WHEN b.inferred_origin_group='NON_EUROPEAN' AND coalesce(f.ref_count,0)=1 THEN f.only_ref
          ELSE NULL
        END AS proposed_canonical_part_number,
        CASE
          WHEN b.inferred_origin_group='UNKNOWN' THEN 'ORIGIN_EVIDENCE_REQUIRED'
          WHEN b.inferred_origin_group='MIXED' THEN 'MIXED_ORIGIN_REVIEW_REQUIRED'
          WHEN b.inferred_origin_group='EUROPEAN' AND ld_catalog.norm_part(b.source_sku)<>'' THEN 'READY_SOURCE_MANN'
          WHEN b.inferred_origin_group='NON_EUROPEAN' AND coalesce(f.ref_count,0)=1 THEN 'READY_SINGLE_FRAM'
          WHEN b.inferred_origin_group='NON_EUROPEAN' AND coalesce(f.ref_count,0)=0 THEN 'FRAM_REFERENCE_REQUIRED'
          WHEN b.inferred_origin_group='NON_EUROPEAN' AND f.ref_count>1 THEN 'MULTIPLE_FRAM_REFERENCES_REVIEW'
          ELSE 'REVIEW_REQUIRED'
        END AS candidate_state,
        coalesce(f.ref_count,0)::int AS fram_reference_count
      FROM base b
      LEFT JOIN fram_agg f USING (elimfilters_sku)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ld_catalog.ld_canonical_backfill_candidates (
        elimfilters_sku text PRIMARY KEY,
        segment text,
        filter_type text,
        duty text,
        origin_group text,
        canonical_brand text,
        canonical_part_number text,
        candidate_state text NOT NULL,
        fram_reference_count integer NOT NULL DEFAULT 0,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      INSERT INTO ld_catalog.ld_canonical_backfill_candidates(
        elimfilters_sku, segment, filter_type, duty, origin_group,
        canonical_brand, canonical_part_number, candidate_state,
        fram_reference_count, updated_at
      )
      SELECT
        elimfilters_sku, segment, filter_type, duty,
        NULLIF(inferred_origin_group,'UNKNOWN'), expected_canonical_brand,
        proposed_canonical_part_number, candidate_state,
        fram_reference_count, now()
      FROM ld_catalog.ld_canonical_candidate_refs_v
      ON CONFLICT (elimfilters_sku) DO UPDATE SET
        segment=excluded.segment,
        filter_type=excluded.filter_type,
        duty=excluded.duty,
        origin_group=excluded.origin_group,
        canonical_brand=excluded.canonical_brand,
        canonical_part_number=excluded.canonical_part_number,
        candidate_state=excluded.candidate_state,
        fram_reference_count=excluded.fram_reference_count,
        updated_at=now()
    `);

    const origin = await client.query(`
      SELECT inferred_origin_group, count(*)::int AS n
      FROM ld_catalog.ld_sku_origin_evidence_v
      GROUP BY inferred_origin_group
      ORDER BY inferred_origin_group
    `);
    report.origin.states = origin.rows;

    const candidates = await client.query(`
      SELECT candidate_state, count(*)::int AS n
      FROM ld_catalog.ld_canonical_backfill_candidates
      GROUP BY candidate_state
      ORDER BY candidate_state
    `);
    report.candidates.states = candidates.rows;

    const ph4967 = await client.query(`
      SELECT elimfilters_sku, origin_group, canonical_brand, canonical_part_number,
             candidate_state, fram_reference_count
      FROM ld_catalog.ld_canonical_backfill_candidates
      WHERE elimfilters_sku IN ('EL30683','EL36101','EF30683')
      ORDER BY elimfilters_sku
    `);
    report.candidates.ph4967_related = ph4967.rows;

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
  applyLdOriginCandidateBackfill()
    .then(report => console.log('[ld-origin-candidate-backfill]', JSON.stringify(report)))
    .catch(error => {
      console.error('[ld-origin-candidate-backfill] failed', JSON.stringify(error.migrationReport || { error: error.message }));
      process.exit(1);
    });
}

module.exports = { MIGRATION, applyLdOriginCandidateBackfill };
