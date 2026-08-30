'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '088_EUROPEAN_MANN_CANONICAL_BATCH1';

async function applyEuropeanMannCanonicalBatch1() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();
  const report = { migration: MIGRATION, checks: {}, mutations: {} };

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TEMP TABLE tmp_european_mann_safe AS
      SELECT m.*
      FROM ld_catalog.ld_european_mann_public_match_candidates m
      WHERE m.match_state='EXACT_APPLICATION_UNIQUE'
        AND 1 = (
          SELECT count(*)
          FROM ld_catalog.ld_european_mann_public_match_candidates x
          WHERE x.match_state='EXACT_APPLICATION_UNIQUE'
            AND x.public_sku=m.public_sku
        )
    `);

    const counts = await client.query(`
      SELECT count(*)::int AS rows,
             count(DISTINCT mann_part_number)::int AS distinct_mann,
             count(DISTINCT public_sku)::int AS distinct_public
      FROM tmp_european_mann_safe
    `);
    report.checks.safe_candidates = counts.rows[0];
    if (counts.rows[0].rows < 1
        || counts.rows[0].rows !== counts.rows[0].distinct_mann
        || counts.rows[0].rows !== counts.rows[0].distinct_public) {
      throw new Error('EUROPEAN_MANN_BATCH1_SAFE_SET_NOT_ONE_TO_ONE');
    }

    const missingPublic = await client.query(`
      SELECT count(*)::int AS n
      FROM tmp_european_mann_safe s
      LEFT JOIN public.elimfilters_catalog c ON c.sku=s.public_sku
      WHERE c.sku IS NULL OR c.duty<>'LIGHT_DUTY'
    `);
    report.checks.missing_or_non_ld_public = missingPublic.rows[0].n;
    if (missingPublic.rows[0].n !== 0) throw new Error('EUROPEAN_MANN_BATCH1_PUBLIC_TARGET_MISSING_OR_NON_LD');

    const identityConflicts = await client.query(`
      SELECT count(*)::int AS n
      FROM tmp_european_mann_safe s
      JOIN ld_catalog.ld_canonical_product_identity i
        ON i.status='ACTIVE'
       AND ld_catalog.norm_part(i.canonical_brand)=ld_catalog.norm_part('MANN-FILTER')
       AND ld_catalog.norm_part(i.canonical_part_number)=ld_catalog.norm_part(s.mann_part_number)
       AND i.elimfilters_sku<>s.public_sku
    `);
    report.checks.identity_conflicts = identityConflicts.rows[0].n;
    if (identityConflicts.rows[0].n !== 0) throw new Error('EUROPEAN_MANN_BATCH1_CANONICAL_IDENTITY_COLLISION');

    const targetIdentityConflicts = await client.query(`
      SELECT count(*)::int AS n
      FROM tmp_european_mann_safe s
      JOIN ld_catalog.ld_canonical_product_identity i ON i.elimfilters_sku=s.public_sku
      WHERE i.status='ACTIVE'
        AND NOT (
          i.origin_group='EUROPEAN'
          AND ld_catalog.norm_part(i.canonical_brand)=ld_catalog.norm_part('MANN-FILTER')
          AND ld_catalog.norm_part(i.canonical_part_number)=ld_catalog.norm_part(s.mann_part_number)
        )
    `);
    report.checks.target_identity_conflicts = targetIdentityConflicts.rows[0].n;
    if (targetIdentityConflicts.rows[0].n !== 0) throw new Error('EUROPEAN_MANN_BATCH1_TARGET_ALREADY_HAS_DIFFERENT_IDENTITY');

    const baseCollisions = await client.query(`
      SELECT count(*)::int AS n
      FROM tmp_european_mann_safe s
      JOIN public.elimfilters_catalog c
        ON ld_catalog.norm_part(c.codigo_base)=ld_catalog.norm_part(s.mann_part_number)
       AND c.sku<>s.public_sku
    `);
    report.checks.codigo_base_collisions = baseCollisions.rows[0].n;
    if (baseCollisions.rows[0].n !== 0) throw new Error('EUROPEAN_MANN_BATCH1_CODIGO_BASE_COLLISION');

    const updated = await client.query(`
      UPDATE public.elimfilters_catalog c
      SET codigo_base=s.mann_part_number,
          enrichment_data=jsonb_set(
            coalesce(c.enrichment_data,'{}'::jsonb),
            '{codigo_base_governance}',
            coalesce(c.enrichment_data->'codigo_base_governance','{}'::jsonb)
              || jsonb_build_object(
                'origin_group','EUROPEAN',
                'approved_manufacturer','MANN-FILTER',
                'approved_codigo_base',s.mann_part_number,
                'approved_source_column','CANONICAL_POLICY',
                'primary_manufacturer_verified',true,
                'governance_state','CANONICAL_VERIFIED',
                'state','CANONICAL_VERIFIED',
                'current_codigo_base',s.mann_part_number,
                'required_authority','MANN_FILTER_REGIONAL_CANONICAL',
                'policy_version','2026-08-29-v3.2-regional',
                'evidence_note','Normalized MANN family matched exactly one public LIGHT_DUTY SKU by complete vehicle-application coverage and filter type in migration 087.'
              ),
            true
          )
      FROM tmp_european_mann_safe s
      WHERE c.sku=s.public_sku
        AND (
          ld_catalog.norm_part(c.codigo_base) IS DISTINCT FROM ld_catalog.norm_part(s.mann_part_number)
          OR coalesce(c.enrichment_data->'codigo_base_governance'->>'origin_group','')<>'EUROPEAN'
          OR ld_catalog.norm_part(c.enrichment_data->'codigo_base_governance'->>'approved_manufacturer')<>ld_catalog.norm_part('MANN-FILTER')
          OR ld_catalog.norm_part(c.enrichment_data->'codigo_base_governance'->>'approved_codigo_base')<>ld_catalog.norm_part(s.mann_part_number)
          OR coalesce((c.enrichment_data->'codigo_base_governance'->>'primary_manufacturer_verified')::boolean,false) IS NOT TRUE
        )
      RETURNING c.sku,c.codigo_base,c.filter_type
    `);
    report.mutations.catalog_rows_updated = updated.rowCount;

    const identities = await client.query(`
      INSERT INTO ld_catalog.ld_canonical_product_identity
        (elimfilters_sku,origin_group,canonical_brand,canonical_part_number,filter_type,status,evidence_source,created_at,updated_at)
      SELECT s.public_sku,'EUROPEAN','MANN-FILTER',s.mann_part_number,c.filter_type,'ACTIVE',
             'MIGRATION_088_EXACT_APPLICATION_UNIQUE',now(),now()
      FROM tmp_european_mann_safe s
      JOIN public.elimfilters_catalog c ON c.sku=s.public_sku
      ON CONFLICT (elimfilters_sku) DO UPDATE SET
        origin_group=excluded.origin_group,
        canonical_brand=excluded.canonical_brand,
        canonical_part_number=excluded.canonical_part_number,
        filter_type=excluded.filter_type,
        status='ACTIVE',
        evidence_source=excluded.evidence_source,
        updated_at=now()
      RETURNING elimfilters_sku
    `);
    report.mutations.canonical_identities_upserted = identities.rowCount;

    const resolver = await client.query(`
      SELECT count(*)::int AS n
      FROM tmp_european_mann_safe s
      JOIN public.v_api_resolver_v6 v
        ON v.code=ld_catalog.norm_part(s.mann_part_number)
       AND v.sku=s.public_sku
       AND ld_catalog.norm_part(v.manufacturer)=ld_catalog.norm_part('MANN-FILTER')
       AND v.status='RESOLVED_CANONICAL'
    `);
    report.checks.v6_canonical_matches = resolver.rows[0].n;
    if (resolver.rows[0].n !== counts.rows[0].rows) {
      throw new Error('EUROPEAN_MANN_BATCH1_V6_CANONICAL_MATCH_COUNT_MISMATCH');
    }

    const duplicates = await client.query(`
      SELECT count(*)::int AS n
      FROM (
        SELECT v.code
        FROM public.v_api_resolver_v6 v
        JOIN tmp_european_mann_safe s ON v.code=ld_catalog.norm_part(s.mann_part_number)
        GROUP BY v.code
        HAVING count(*)<>1
      ) q
    `);
    report.checks.v6_non_single_codes = duplicates.rows[0].n;
    if (duplicates.rows[0].n !== 0) throw new Error('EUROPEAN_MANN_BATCH1_V6_NOT_SINGLE_RESULT');

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
  applyEuropeanMannCanonicalBatch1()
    .then(report => console.log('[european-mann-canonical-batch1]', JSON.stringify(report)))
    .catch(error => {
      console.error('[european-mann-canonical-batch1] failed', JSON.stringify(error.migrationReport || { error: error.message }));
      process.exit(1);
    });
}

module.exports = { MIGRATION, applyEuropeanMannCanonicalBatch1 };
