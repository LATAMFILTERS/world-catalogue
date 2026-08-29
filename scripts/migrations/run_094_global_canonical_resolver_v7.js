'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '094_GLOBAL_CANONICAL_RESOLVER_V7';
const POLICY_VERSION = '2026-08-29-global-cert-v1.1';

async function applyGlobalCanonicalResolverV7() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();
  const report = {
    migration: MIGRATION,
    policy_version: POLICY_VERSION,
    mutations: { catalog: 0, sku: 0, codigo_base: 0, canonical_identity: 0, applications: 0 },
    resolver: {},
    certification: {}
  };

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE OR REPLACE VIEW public.v_api_resolver_v7 AS
      WITH canonical_ld AS (
        SELECT
          ld_catalog.norm_part(i.canonical_part_number) AS code,
          i.elimfilters_sku::text AS sku,
          i.canonical_brand::text AS manufacturer,
          1000::numeric AS score,
          'RESOLVED_CANONICAL'::text AS status
        FROM ld_catalog.ld_canonical_product_identity i
        WHERE i.status='ACTIVE'
      ),
      catalog_base_raw AS (
        SELECT
          ld_catalog.norm_part(c.codigo_base::text) AS code,
          c.sku::text AS sku,
          nullif(trim(c.enrichment_data->'codigo_base_governance'->>'approved_manufacturer'),'') AS manufacturer,
          coalesce(
            c.enrichment_data->'codigo_base_governance'->>'state',
            c.enrichment_data->'codigo_base_governance'->>'governance_state',
            ''
          ) AS governance_state,
          coalesce((c.enrichment_data->'codigo_base_governance'->>'primary_manufacturer_verified')::boolean,false) AS manufacturer_verified
        FROM public.elimfilters_catalog c
        WHERE nullif(trim(c.codigo_base::text),'') IS NOT NULL
      ),
      catalog_base_unique AS (
        SELECT
          r.code,
          min(r.sku) AS sku,
          min(r.manufacturer) FILTER (WHERE r.manufacturer IS NOT NULL) AS manufacturer
        FROM catalog_base_raw r
        WHERE r.code<>''
          AND r.governance_state='CANONICAL_VERIFIED'
          AND r.manufacturer_verified
        GROUP BY r.code
        HAVING count(DISTINCT r.sku)=1
      ),
      canonical_catalog AS (
        SELECT
          b.code,
          b.sku,
          coalesce(b.manufacturer,'CATALOG_CANONICAL')::text AS manufacturer,
          950::numeric AS score,
          'RESOLVED_CANONICAL_BASE'::text AS status
        FROM catalog_base_unique b
        WHERE NOT EXISTS (
          SELECT 1 FROM canonical_ld c WHERE c.code=b.code
        )
      ),
      safe_ld_xref AS (
        SELECT
          ld_catalog.norm_part(x.competitor_part_number::text) AS code,
          x.elimfilters_sku::text AS sku,
          x.competitor_brand::text AS manufacturer,
          900::numeric AS score,
          'RESOLVED_SINGLE'::text AS status
        FROM ld_catalog.ld_competitor_cross_references_safe_v x
        WHERE NOT EXISTS (
          SELECT 1 FROM canonical_ld c
          WHERE c.code=ld_catalog.norm_part(x.competitor_part_number::text)
        )
          AND NOT EXISTS (
          SELECT 1 FROM canonical_catalog c
          WHERE c.code=ld_catalog.norm_part(x.competitor_part_number::text)
        )
      ),
      legacy_single AS (
        SELECT
          ld_catalog.norm_part(v.code) AS code,
          min(v.sku)::text AS sku,
          min(v.manufacturer)::text AS manufacturer,
          max(v.score) AS score,
          'RESOLVED_SINGLE'::text AS status
        FROM public.v_api_resolver_v5 v
        WHERE NOT EXISTS (
          SELECT 1 FROM canonical_ld c WHERE c.code=ld_catalog.norm_part(v.code)
        )
          AND NOT EXISTS (
          SELECT 1 FROM canonical_catalog c WHERE c.code=ld_catalog.norm_part(v.code)
        )
          AND NOT EXISTS (
          SELECT 1 FROM safe_ld_xref s WHERE s.code=ld_catalog.norm_part(v.code)
        )
        GROUP BY ld_catalog.norm_part(v.code)
        HAVING min(v.sku)=max(v.sku)
      )
      SELECT * FROM canonical_ld
      UNION ALL
      SELECT * FROM canonical_catalog
      UNION ALL
      SELECT * FROM safe_ld_xref
      UNION ALL
      SELECT * FROM legacy_single
    `);

    const resolverAudit = await client.query(`
      WITH collisions AS (
        SELECT code, count(DISTINCT sku)::int AS sku_count
        FROM public.v_api_resolver_v7
        GROUP BY code
        HAVING count(DISTINCT sku)>1
      )
      SELECT
        (SELECT count(*) FROM public.v_api_resolver_v7)::int AS resolver_rows,
        (SELECT count(DISTINCT code) FROM public.v_api_resolver_v7)::int AS distinct_codes,
        (SELECT count(*) FROM collisions)::int AS multi_sku_codes,
        (SELECT count(*) FROM public.v_api_resolver_v7 WHERE status='RESOLVED_CANONICAL')::int AS ld_canonical_rows,
        (SELECT count(*) FROM public.v_api_resolver_v7 WHERE status='RESOLVED_CANONICAL_BASE')::int AS catalog_canonical_base_rows
    `);
    report.resolver = resolverAudit.rows[0];
    if (report.resolver.multi_sku_codes !== 0) {
      throw new Error(`V7_MULTI_SKU_CODE_COLLISION count=${report.resolver.multi_sku_codes}`);
    }

    await client.query(`
      WITH resolver_counts AS (
        SELECT
          ld_catalog.norm_part(code) AS code_key,
          count(DISTINCT sku)::int AS sku_count,
          min(sku)::text AS only_sku
        FROM public.v_api_resolver_v7
        GROUP BY ld_catalog.norm_part(code)
      ), resolved AS (
        SELECT
          c.sku,
          rc.sku_count,
          rc.only_sku,
          (rc.sku_count=1 AND rc.only_sku=c.sku) AS resolver_ok
        FROM public.catalog_sku_certification c
        LEFT JOIN resolver_counts rc
          ON rc.code_key=ld_catalog.norm_part(c.codigo_base)
      )
      UPDATE public.catalog_sku_certification c
      SET
        resolver_unique=r.resolver_ok,
        blockers=CASE
          WHEN r.resolver_ok THEN array_remove(c.blockers,'BASE_CODE_NOT_UNIQUELY_RESOLVED')
          WHEN 'BASE_CODE_NOT_UNIQUELY_RESOLVED'=ANY(c.blockers) THEN c.blockers
          ELSE array_append(c.blockers,'BASE_CODE_NOT_UNIQUELY_RESOLVED')
        END,
        evidence=jsonb_set(
          jsonb_set(c.evidence,'{resolver_v7_sku_count}',to_jsonb(coalesce(r.sku_count,0)),true),
          '{resolver_v7_only_sku}',
          to_jsonb(r.only_sku),
          true
        ),
        policy_version='${POLICY_VERSION}',
        audited_at=now()
      FROM resolved r
      WHERE c.sku=r.sku
    `);

    await client.query(`
      UPDATE public.catalog_sku_certification
      SET
        blocker_count=cardinality(blockers),
        certification_state=CASE WHEN cardinality(blockers)=0 THEN 'CERTIFIED' ELSE 'BLOCKED' END,
        certified_at=CASE WHEN cardinality(blockers)=0 THEN coalesce(certified_at,now()) ELSE NULL END,
        audited_at=now()
    `);

    const certification = await client.query(`
      SELECT
        count(*)::int AS total_skus,
        count(*) FILTER (WHERE certification_state='CERTIFIED')::int AS certified,
        count(*) FILTER (WHERE certification_state='BLOCKED')::int AS blocked,
        count(*) FILTER (WHERE duty='HEAVY_DUTY' AND certification_state='CERTIFIED')::int AS hd_certified,
        count(*) FILTER (WHERE duty='LIGHT_DUTY' AND certification_state='CERTIFIED')::int AS ld_certified,
        count(*) FILTER (WHERE NOT resolver_unique)::int AS resolver_blocked
      FROM public.catalog_sku_certification
    `);
    report.certification = certification.rows[0];

    const cardinality = await client.query(`
      SELECT
        (SELECT count(*) FROM public.elimfilters_catalog)::int AS catalog_rows,
        (SELECT count(*) FROM public.catalog_sku_certification)::int AS certification_rows
    `);
    if (cardinality.rows[0].catalog_rows !== cardinality.rows[0].certification_rows) {
      throw new Error(`GLOBAL_CERTIFICATION_CARDINALITY_MISMATCH catalog=${cardinality.rows[0].catalog_rows} certification=${cardinality.rows[0].certification_rows}`);
    }

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
  applyGlobalCanonicalResolverV7()
    .then(report=>console.log('[global-canonical-resolver-v7]',JSON.stringify(report)))
    .catch(error=>{
      console.error('[global-canonical-resolver-v7] failed',JSON.stringify(error.migrationReport || { error:error.message }));
      process.exit(1);
    });
}

module.exports={ MIGRATION, POLICY_VERSION, applyGlobalCanonicalResolverV7 };
