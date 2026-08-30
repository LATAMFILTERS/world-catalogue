'use strict';

/**
 * PostgreSQL-compatible LD canonical identity policy.
 * Replaces migration 081 at startup because PostgreSQL does not support
 * COUNT(DISTINCT ...) as a window function.
 */

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '082_LD_CANONICAL_IDENTITY_POLICY_PGFIX';

async function scalar(client, sql) {
  const result = await client.query(sql);
  return Number(result.rows[0]?.n || 0);
}

async function applyLdCanonicalIdentityPolicyPgFix() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();
  const report = { migration: MIGRATION, before: {}, after: {} };

  try {
    await client.query('BEGIN');
    await client.query('CREATE SCHEMA IF NOT EXISTS ld_catalog');

    await client.query(`
      CREATE OR REPLACE FUNCTION ld_catalog.norm_part(value text)
      RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
        SELECT upper(regexp_replace(coalesce(value, ''), '[^A-Z0-9]', '', 'g'))
      $$
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ld_catalog.ld_canonical_source_policy (
        origin_group text PRIMARY KEY,
        canonical_brand text NOT NULL,
        active boolean NOT NULL DEFAULT true,
        description text,
        updated_at timestamptz NOT NULL DEFAULT now(),
        CHECK (origin_group IN ('EUROPEAN','NON_EUROPEAN'))
      )
    `);

    await client.query(`
      INSERT INTO ld_catalog.ld_canonical_source_policy
        (origin_group, canonical_brand, active, description, updated_at)
      VALUES
        ('EUROPEAN', 'MANN-FILTER', true,
         'European LD vehicle-origin families use MANN-FILTER as canonical source.', now()),
        ('NON_EUROPEAN', 'FRAM', true,
         'American, Japanese, Korean and other non-European LD vehicle-origin families use FRAM as canonical source.', now())
      ON CONFLICT (origin_group) DO UPDATE SET
        canonical_brand = excluded.canonical_brand,
        active = excluded.active,
        description = excluded.description,
        updated_at = now()
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ld_catalog.ld_canonical_product_identity (
        elimfilters_sku text PRIMARY KEY,
        origin_group text NOT NULL REFERENCES ld_catalog.ld_canonical_source_policy(origin_group),
        canonical_brand text NOT NULL,
        canonical_part_number text NOT NULL,
        filter_type text NOT NULL,
        status text NOT NULL DEFAULT 'ACTIVE',
        evidence_source text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CHECK (status IN ('ACTIVE','REVIEW_REQUIRED','RETIRED')),
        CHECK (ld_catalog.norm_part(canonical_part_number) <> '')
      )
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_ld_canonical_brand_part
      ON ld_catalog.ld_canonical_product_identity (
        upper(canonical_brand), ld_catalog.norm_part(canonical_part_number)
      ) WHERE status = 'ACTIVE'
    `);

    await client.query(`
      CREATE OR REPLACE FUNCTION ld_catalog.enforce_canonical_source_policy()
      RETURNS trigger LANGUAGE plpgsql AS $fn$
      DECLARE expected_brand text;
      BEGIN
        SELECT canonical_brand INTO expected_brand
        FROM ld_catalog.ld_canonical_source_policy
        WHERE origin_group = NEW.origin_group AND active = true;

        IF expected_brand IS NULL THEN
          RAISE EXCEPTION 'LD_CANONICAL_POLICY: no active source policy for origin_group %', NEW.origin_group;
        END IF;

        IF upper(regexp_replace(NEW.canonical_brand, '[^A-Z0-9]', '', 'g'))
           <> upper(regexp_replace(expected_brand, '[^A-Z0-9]', '', 'g')) THEN
          RAISE EXCEPTION 'LD_CANONICAL_POLICY: origin_group % requires canonical brand %, got %',
            NEW.origin_group, expected_brand, NEW.canonical_brand;
        END IF;

        NEW.updated_at := now();
        RETURN NEW;
      END;
      $fn$;

      DROP TRIGGER IF EXISTS trg_ld_canonical_source_policy ON ld_catalog.ld_canonical_product_identity;
      CREATE TRIGGER trg_ld_canonical_source_policy
      BEFORE INSERT OR UPDATE OF origin_group,canonical_brand,canonical_part_number,status
      ON ld_catalog.ld_canonical_product_identity
      FOR EACH ROW EXECUTE FUNCTION ld_catalog.enforce_canonical_source_policy()
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ld_catalog.ld_reference_governance_queue (
        normalized_brand text NOT NULL,
        normalized_reference text NOT NULL,
        sku_count integer NOT NULL,
        skus jsonb NOT NULL DEFAULT '[]'::jsonb,
        status text NOT NULL DEFAULT 'EVIDENCE_REQUIRED',
        reason text NOT NULL,
        first_seen_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (normalized_brand, normalized_reference),
        CHECK (status IN ('EVIDENCE_REQUIRED','RESOLVED','REJECTED'))
      )
    `);

    await client.query(`
      CREATE OR REPLACE VIEW ld_catalog.ld_cross_reference_conflicts_v AS
      SELECT
        upper(regexp_replace(coalesce(competitor_brand,''), '[^A-Z0-9]', '', 'g')) AS normalized_brand,
        ld_catalog.norm_part(competitor_part_number) AS normalized_reference,
        count(DISTINCT elimfilters_sku)::int AS sku_count,
        to_jsonb(array_agg(DISTINCT elimfilters_sku ORDER BY elimfilters_sku)) AS skus
      FROM ld_catalog.ld_competitor_cross_references
      WHERE ld_catalog.norm_part(competitor_part_number) <> ''
      GROUP BY 1,2
      HAVING count(DISTINCT elimfilters_sku) > 1
    `);

    report.before.conflict_reference_families = await scalar(client,
      'SELECT count(*) n FROM ld_catalog.ld_cross_reference_conflicts_v');

    const queued = await client.query(`
      INSERT INTO ld_catalog.ld_reference_governance_queue
        (normalized_brand, normalized_reference, sku_count, skus, status, reason, updated_at)
      SELECT normalized_brand, normalized_reference, sku_count, skus,
             'EVIDENCE_REQUIRED', 'ONE_REFERENCE_TO_MULTIPLE_SKUS', now()
      FROM ld_catalog.ld_cross_reference_conflicts_v
      ON CONFLICT (normalized_brand, normalized_reference) DO UPDATE SET
        sku_count = excluded.sku_count,
        skus = excluded.skus,
        status = 'EVIDENCE_REQUIRED',
        reason = excluded.reason,
        updated_at = now()
      RETURNING normalized_reference
    `);
    report.conflicts_quarantined = queued.rowCount;

    await client.query(`
      CREATE OR REPLACE VIEW ld_catalog.ld_competitor_cross_references_safe_v AS
      WITH normalized AS (
        SELECT
          x.id,
          x.elimfilters_sku,
          x.source_sku,
          x.competitor_brand,
          x.competitor_part_number,
          x.created_at,
          upper(regexp_replace(coalesce(x.competitor_brand,''), '[^A-Z0-9]', '', 'g')) AS normalized_brand,
          ld_catalog.norm_part(x.competitor_part_number) AS normalized_reference
        FROM ld_catalog.ld_competitor_cross_references x
      ), unique_family AS (
        SELECT normalized_brand, normalized_reference
        FROM normalized
        WHERE normalized_reference <> ''
        GROUP BY normalized_brand, normalized_reference
        HAVING min(elimfilters_sku) = max(elimfilters_sku)
      )
      SELECT n.id, n.elimfilters_sku, n.source_sku, n.competitor_brand, n.competitor_part_number, n.created_at
      FROM normalized n
      JOIN unique_family u USING (normalized_brand, normalized_reference)
    `);

    await client.query(`
      CREATE OR REPLACE FUNCTION ld_catalog.prevent_ambiguous_cross_reference()
      RETURNS trigger LANGUAGE plpgsql AS $fn$
      DECLARE conflicting_sku text;
      BEGIN
        IF ld_catalog.norm_part(NEW.competitor_part_number) = '' THEN
          RAISE EXCEPTION 'LD_REFERENCE_INTEGRITY: empty competitor part number';
        END IF;

        SELECT x.elimfilters_sku INTO conflicting_sku
        FROM ld_catalog.ld_competitor_cross_references x
        WHERE upper(regexp_replace(coalesce(x.competitor_brand,''), '[^A-Z0-9]', '', 'g')) =
              upper(regexp_replace(coalesce(NEW.competitor_brand,''), '[^A-Z0-9]', '', 'g'))
          AND ld_catalog.norm_part(x.competitor_part_number) = ld_catalog.norm_part(NEW.competitor_part_number)
          AND x.elimfilters_sku <> NEW.elimfilters_sku
          AND (TG_OP = 'INSERT' OR x.id <> NEW.id)
        LIMIT 1;

        IF conflicting_sku IS NOT NULL THEN
          RAISE EXCEPTION 'LD_REFERENCE_INTEGRITY: % % already resolves to SKU %, cannot also resolve to %',
            NEW.competitor_brand, NEW.competitor_part_number, conflicting_sku, NEW.elimfilters_sku;
        END IF;
        RETURN NEW;
      END;
      $fn$;

      DROP TRIGGER IF EXISTS trg_ld_prevent_ambiguous_cross_reference ON ld_catalog.ld_competitor_cross_references;
      CREATE TRIGGER trg_ld_prevent_ambiguous_cross_reference
      BEFORE INSERT OR UPDATE OF elimfilters_sku,competitor_brand,competitor_part_number
      ON ld_catalog.ld_competitor_cross_references
      FOR EACH ROW EXECUTE FUNCTION ld_catalog.prevent_ambiguous_cross_reference()
    `);

    await client.query(`
      CREATE OR REPLACE VIEW public.v_api_resolver_v6 AS
      WITH canonical AS (
        SELECT ld_catalog.norm_part(canonical_part_number) AS code,
               elimfilters_sku AS sku,
               canonical_brand AS manufacturer,
               1000::numeric AS score,
               'RESOLVED_CANONICAL'::text AS status
        FROM ld_catalog.ld_canonical_product_identity
        WHERE status = 'ACTIVE'
      ), safe_ld_xref AS (
        SELECT ld_catalog.norm_part(x.competitor_part_number) AS code,
               x.elimfilters_sku AS sku,
               x.competitor_brand AS manufacturer,
               900::numeric AS score,
               'RESOLVED_SINGLE'::text AS status
        FROM ld_catalog.ld_competitor_cross_references_safe_v x
        WHERE NOT EXISTS (
          SELECT 1 FROM canonical c
          WHERE c.code = ld_catalog.norm_part(x.competitor_part_number)
        )
      ), legacy_single AS (
        SELECT ld_catalog.norm_part(v.code) AS code,
               min(v.sku) AS sku,
               min(v.manufacturer) AS manufacturer,
               max(v.score)::numeric AS score,
               'RESOLVED_SINGLE'::text AS status
        FROM public.v_api_resolver_v5 v
        WHERE NOT EXISTS (
          SELECT 1 FROM canonical c WHERE c.code = ld_catalog.norm_part(v.code)
        )
          AND NOT EXISTS (
          SELECT 1 FROM safe_ld_xref s WHERE s.code = ld_catalog.norm_part(v.code)
        )
        GROUP BY ld_catalog.norm_part(v.code)
        HAVING min(v.sku) = max(v.sku)
      )
      SELECT * FROM canonical
      UNION ALL
      SELECT * FROM safe_ld_xref
      UNION ALL
      SELECT * FROM legacy_single
    `);

    report.after.safe_cross_references = await scalar(client,
      'SELECT count(*) n FROM ld_catalog.ld_competitor_cross_references_safe_v');
    report.after.blocked_conflict_reference_families = await scalar(client,
      'SELECT count(*) n FROM ld_catalog.ld_cross_reference_conflicts_v');
    report.after.policy_rows = await scalar(client,
      'SELECT count(*) n FROM ld_catalog.ld_canonical_source_policy WHERE active = true');

    if (report.after.policy_rows !== 2) throw new Error('LD_CANONICAL_POLICY_NOT_INSTALLED');

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
  applyLdCanonicalIdentityPolicyPgFix()
    .then(report => console.log('[ld-canonical-identity-pgfix]', JSON.stringify(report)))
    .catch(error => {
      console.error('[ld-canonical-identity-pgfix] failed', JSON.stringify(error.migrationReport || { error: error.message }));
      process.exit(1);
    });
}

module.exports = { MIGRATION, applyLdCanonicalIdentityPolicyPgFix };
