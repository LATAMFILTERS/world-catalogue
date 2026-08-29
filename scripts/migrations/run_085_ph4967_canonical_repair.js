'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '085_PH4967_CANONICAL_REPAIR';

async function applyPh4967CanonicalRepair() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();
  const report = { migration: MIGRATION, checks: {}, mutations: {} };

  try {
    await client.query('BEGIN');

    const existingTarget = await client.query("SELECT count(*)::int n FROM public.elimfilters_catalog WHERE sku='EL34967'");
    report.checks.target_sku_exists = existingTarget.rows[0].n;

    const source = await client.query(`
      SELECT sku, codigo_base, filter_type, duty, height_mm, outer_diameter_mm, thread_size
      FROM public.elimfilters_catalog
      WHERE sku = 'EL30683'
    `);
    if (source.rowCount !== 1) throw new Error('PH4967_REPAIR_SOURCE_EL30683_NOT_UNIQUE');
    const s = source.rows[0];
    if (s.filter_type !== 'oil' || s.duty !== 'LIGHT_DUTY') throw new Error('PH4967_REPAIR_SOURCE_TYPE_DUTY_MISMATCH');

    const normalizedSource = await client.query(`
      SELECT p.elimfilters_sku, p.source_sku,
             count(v.*)::int AS vehicle_rows,
             count(*) FILTER (WHERE upper(coalesce(v.make,''))='TOYOTA (USA)')::int AS toyota_usa_rows
      FROM ld_catalog.ld_product_catalog p
      LEFT JOIN ld_catalog.ld_vehicle_applications v ON v.elimfilters_sku = p.elimfilters_sku
      WHERE p.elimfilters_sku='EL50683'
      GROUP BY p.elimfilters_sku,p.source_sku
    `);
    if (normalizedSource.rowCount !== 1 || ldNorm(normalizedSource.rows[0].source_sku) !== 'W683') {
      throw new Error('PH4967_REPAIR_MANN_SOURCE_W683_NOT_VERIFIED');
    }
    if (normalizedSource.rows[0].vehicle_rows !== 2 || normalizedSource.rows[0].toyota_usa_rows !== 2) {
      throw new Error('PH4967_REPAIR_NORMALIZED_APPLICATION_EVIDENCE_MISMATCH');
    }

    const legacyAppMatch = await client.query(`
      SELECT count(*)::int n
      FROM jsonb_array_elements(coalesce((SELECT vehicle_applications FROM public.elimfilters_catalog WHERE sku='EL30683'),'[]'::jsonb)) a
      WHERE upper(coalesce(a->>'make',''))='TOYOTA (USA)'
        AND coalesce(a->>'engine_code','')='2ZRFXE'
        AND (coalesce(a->>'model','') ILIKE '%Prius%' OR coalesce(a->>'model_type','') ILIKE '%Prius%')
    `);
    if (legacyAppMatch.rows[0].n < 2) throw new Error('PH4967_REPAIR_LEGACY_APPLICATION_EVIDENCE_MISMATCH');

    const framEvidence = await client.query(`
      SELECT count(*)::int n
      FROM jsonb_array_elements(coalesce((SELECT competitor_codes FROM public.elimfilters_catalog WHERE sku='EL30683'),'[]'::jsonb)) x
      WHERE upper(regexp_replace(coalesce(x->>'manufacturer',x->>'brand',''),'[^A-Z0-9]','','g'))='FRAM'
        AND upper(regexp_replace(coalesce(x->>'code',''),'[^A-Z0-9]','','g'))='PH4967'
    `);
    if (framEvidence.rows[0].n < 1) throw new Error('PH4967_REPAIR_FRAM_PH4967_EVIDENCE_MISSING');

    const cleaned = await client.query(`
      UPDATE public.elimfilters_catalog c
      SET competitor_codes = COALESCE((
        SELECT jsonb_agg(x)
        FROM jsonb_array_elements(coalesce(c.competitor_codes,'[]'::jsonb)) x
        WHERE NOT (
          upper(regexp_replace(coalesce(x->>'manufacturer',x->>'brand',''),'[^A-Z0-9]','','g'))='FRAM'
          AND upper(regexp_replace(coalesce(x->>'code',''),'[^A-Z0-9]','','g'))='PH4967'
        )
      ), '[]'::jsonb)
      WHERE c.sku IN ('EF30683','EL30683','EL36101','EL82015','EL82024')
      RETURNING sku
    `);
    report.mutations.ph4967_alternates_removed_from_rows = cleaned.rowCount;

    const promoted = await client.query(`
      UPDATE public.elimfilters_catalog
      SET sku='EL34967',
          codigo_base='PH4967',
          enrichment_data = jsonb_set(
            coalesce(enrichment_data,'{}'::jsonb),
            '{codigo_base_governance}',
            coalesce(enrichment_data->'codigo_base_governance','{}'::jsonb) || jsonb_build_object(
              'origin_group','NON_EUROPEAN',
              'approved_manufacturer','FRAM',
              'approved_codigo_base','PH4967',
              'approved_source_column','CANONICAL_POLICY',
              'primary_manufacturer_verified',true,
              'governance_state','CANONICAL_VERIFIED',
              'evidence_note','Exact TOYOTA (USA) 2ZRFXE Prius application match to normalized MANN W68/3 family; FRAM PH4967 present in legacy verified cross-reference set.'
            ),
            true
          )
      WHERE sku='EL30683'
      RETURNING sku,codigo_base,filter_type,duty
    `);
    if (promoted.rowCount !== 1) throw new Error('PH4967_REPAIR_PROMOTION_FAILED');
    report.mutations.catalog_promoted = promoted.rows[0];

    // code_mapping is a simple updatable VIEW over elimfilters_catalog. Its sku,
    // elim_code and code columns all project the same underlying sku column, and
    // codigo_base/base_code both project the same underlying codigo_base column.
    // Updating those aliases together makes PostgreSQL reject the statement as
    // multiple assignments to the same base column. The catalog update above is
    // therefore the only write required; assert that the view reflects it.
    const cm = await client.query(`
      SELECT sku, elim_code, code, codigo_base, base_code
      FROM public.code_mapping
      WHERE sku='EL34967'
    `);
    if (cm.rowCount !== 1
        || cm.rows[0].elim_code !== 'EL34967'
        || cm.rows[0].code !== 'EL34967'
        || cm.rows[0].codigo_base !== 'PH4967'
        || cm.rows[0].base_code !== 'PH4967') {
      throw new Error('PH4967_REPAIR_CODE_MAPPING_VIEW_NOT_ALIGNED');
    }
    report.checks.code_mapping_view = cm.rows[0];

    await client.query("UPDATE ld_catalog.ld_product_catalog SET elimfilters_sku='EL34967', updated_at=now() WHERE elimfilters_sku='EL50683'");
    await client.query("UPDATE ld_catalog.ld_vehicle_applications SET elimfilters_sku='EL34967' WHERE elimfilters_sku='EL50683'");
    await client.query("UPDATE ld_catalog.ld_oem_cross_references SET elimfilters_sku='EL34967' WHERE elimfilters_sku='EL50683'");
    await client.query("UPDATE ld_catalog.ld_competitor_cross_references SET elimfilters_sku='EL34967' WHERE elimfilters_sku='EL50683'");

    await client.query(`
      INSERT INTO ld_catalog.ld_competitor_cross_references
        (elimfilters_sku, source_sku, competitor_brand, competitor_part_number, created_at)
      SELECT 'EL34967','W68/3','MANN-FILTER','W68/3',now()
      WHERE NOT EXISTS (
        SELECT 1 FROM ld_catalog.ld_competitor_cross_references
        WHERE elimfilters_sku='EL34967'
          AND upper(regexp_replace(coalesce(competitor_brand,''),'[^A-Z0-9]','','g'))='MANNFILTER'
          AND ld_catalog.norm_part(competitor_part_number)='W683'
      )
    `);

    await client.query(`
      INSERT INTO ld_catalog.ld_canonical_product_identity
        (elimfilters_sku, origin_group, canonical_brand, canonical_part_number, filter_type, status, evidence_source, created_at, updated_at)
      VALUES ('EL34967','NON_EUROPEAN','FRAM','PH4967','oil','ACTIVE','MIGRATION_085_PH4967_EXACT_APP_MATCH',now(),now())
      ON CONFLICT (elimfilters_sku) DO UPDATE SET
        origin_group=excluded.origin_group,
        canonical_brand=excluded.canonical_brand,
        canonical_part_number=excluded.canonical_part_number,
        filter_type=excluded.filter_type,
        status='ACTIVE',
        evidence_source=excluded.evidence_source,
        updated_at=now()
    `);

    const unresolved = await client.query(`
      SELECT count(DISTINCT sku)::int n
      FROM public.v_api_resolver_v5
      WHERE ld_catalog.norm_part(code)='PH4967' AND sku<>'EL34967'
    `);
    report.checks.legacy_v5_other_skus = unresolved.rows[0].n;

    const canonical = await client.query(`
      SELECT code,sku,manufacturer,status
      FROM public.v_api_resolver_v6
      WHERE code='PH4967'
    `);
    if (canonical.rowCount !== 1 || canonical.rows[0].sku !== 'EL34967') {
      throw new Error('PH4967_REPAIR_V6_NOT_CANONICAL_SINGLE_RESULT');
    }
    report.checks.v6 = canonical.rows;

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

function ldNorm(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

if (require.main === module) {
  applyPh4967CanonicalRepair()
    .then(report => console.log('[ph4967-canonical-repair]', JSON.stringify(report)))
    .catch(error => {
      console.error('[ph4967-canonical-repair] failed', JSON.stringify(error.migrationReport || { error: error.message }));
      process.exit(1);
    });
}

module.exports = { MIGRATION, applyPh4967CanonicalRepair };
