'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '083_REGIONAL_LD_CODIGO_BASE_POLICY';

async function applyRegionalLdCodigoBasePolicy() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();
  const report = { migration: MIGRATION, policy: {}, audit: {} };

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE OR REPLACE FUNCTION public.enforce_elimfilters_codigo_base_policy()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $function$
      DECLARE
        duty_text text := upper(coalesce(NEW.duty, ''));
        base_norm text := upper(regexp_replace(coalesce(NEW.codigo_base, ''), '[^A-Z0-9]', '', 'g'));
        old_base_norm text := CASE WHEN TG_OP = 'UPDATE' THEN upper(regexp_replace(coalesce(OLD.codigo_base, ''), '[^A-Z0-9]', '', 'g')) ELSE NULL END;
        gov jsonb := coalesce(NEW.enrichment_data->'codigo_base_governance', '{}'::jsonb);
        approved_code text := coalesce(gov->>'approved_codigo_base', '');
        approved_code_norm text := upper(regexp_replace(coalesce(gov->>'approved_codigo_base', ''), '[^A-Z0-9]', '', 'g'));
        approved_manufacturer text := upper(regexp_replace(coalesce(gov->>'approved_manufacturer', ''), '[^A-Z0-9]', '', 'g'));
        approved_source text := upper(coalesce(gov->>'approved_source_column', ''));
        origin_group_value text := upper(coalesce(gov->>'origin_group', ''));
        expected_ld_brand text;
        strict_validation boolean := false;
        code_digits text;
        sku_digits text;
        expected_suffix text;
      BEGIN
        IF base_norm = '' THEN
          RAISE EXCEPTION 'CATALOG_POLICY_V32: codigo_base is required for SKU %', NEW.sku;
        END IF;

        strict_validation := TG_OP = 'INSERT'
          OR (TG_OP = 'UPDATE' AND (
            base_norm IS DISTINCT FROM old_base_norm
            OR NEW.duty IS DISTINCT FROM OLD.duty
          ));

        IF NOT strict_validation THEN
          RETURN NEW;
        END IF;

        IF duty_text = 'HEAVY_DUTY' THEN
          IF coalesce((gov->>'primary_manufacturer_verified')::boolean, false) IS TRUE
             AND approved_manufacturer = 'DONALDSON'
             AND approved_code_norm = base_norm THEN
            RETURN NEW;
          END IF;

          IF coalesce((gov->>'donaldson_absence_verified')::boolean, false) IS NOT TRUE THEN
            RAISE EXCEPTION 'CATALOG_POLICY_V32: HD SKU % requires verified Donaldson authority or verified Donaldson manufacturing absence', NEW.sku;
          END IF;
          IF coalesce((gov->>'fallback_manufacturer_verified')::boolean, false) IS NOT TRUE
             OR coalesce((gov->>'fallback_commercial_code_verified')::boolean, false) IS NOT TRUE THEN
            RAISE EXCEPTION 'CATALOG_POLICY_V32: HD SKU % fallback manufacturer and commercial code require verification', NEW.sku;
          END IF;
          IF approved_code_norm = '' OR approved_code_norm <> base_norm THEN
            RAISE EXCEPTION 'CATALOG_POLICY_V32: HD SKU % codigo_base must equal approved_codigo_base', NEW.sku;
          END IF;
          IF approved_source NOT IN ('OEM_CODES','COMPETITOR_CODES') THEN
            RAISE EXCEPTION 'CATALOG_POLICY_V32: HD SKU % fallback manufacturer must be classified as OEM_CODES or COMPETITOR_CODES', NEW.sku;
          END IF;

          code_digits := regexp_replace(approved_code, '[^0-9]', '', 'g');
          IF length(code_digits) < 4 THEN
            RAISE EXCEPTION 'CATALOG_POLICY_V32: HD SKU % approved fallback code needs at least four numeric digits', NEW.sku;
          END IF;
          expected_suffix := right(code_digits, 4);
          sku_digits := regexp_replace(coalesce(NEW.sku,''), '[^0-9]', '', 'g');
          IF right(sku_digits, 4) <> expected_suffix THEN
            RAISE EXCEPTION 'CATALOG_POLICY_V32: HD SKU % must end in % from approved commercial code %', NEW.sku, expected_suffix, approved_code;
          END IF;
          RETURN NEW;
        END IF;

        IF duty_text = 'LIGHT_DUTY' THEN
          IF origin_group_value NOT IN ('EUROPEAN','NON_EUROPEAN') THEN
            RAISE EXCEPTION 'CATALOG_POLICY_V32: LD SKU % requires explicit origin_group EUROPEAN or NON_EUROPEAN', NEW.sku;
          END IF;

          SELECT upper(regexp_replace(p.canonical_brand, '[^A-Z0-9]', '', 'g'))
          INTO expected_ld_brand
          FROM ld_catalog.ld_canonical_source_policy p
          WHERE upper(p.origin_group) = origin_group_value
            AND p.active = true;

          IF expected_ld_brand IS NULL THEN
            RAISE EXCEPTION 'CATALOG_POLICY_V32: no active LD canonical source policy for origin_group %', origin_group_value;
          END IF;

          IF coalesce((gov->>'primary_manufacturer_verified')::boolean, false) IS NOT TRUE THEN
            RAISE EXCEPTION 'CATALOG_POLICY_V32: LD SKU % requires verified canonical manufacturer authority', NEW.sku;
          END IF;
          IF approved_manufacturer <> expected_ld_brand THEN
            RAISE EXCEPTION 'CATALOG_POLICY_V32: LD SKU % origin_group % requires canonical manufacturer %, got %', NEW.sku, origin_group_value, expected_ld_brand, approved_manufacturer;
          END IF;
          IF approved_code_norm = '' OR approved_code_norm <> base_norm THEN
            RAISE EXCEPTION 'CATALOG_POLICY_V32: LD SKU % codigo_base must equal approved_codigo_base', NEW.sku;
          END IF;
          RETURN NEW;
        END IF;

        RAISE EXCEPTION 'CATALOG_POLICY_V32: unsupported duty % for SKU %', NEW.duty, NEW.sku;
      END;
      $function$;
    `);

    await client.query(`
      CREATE OR REPLACE VIEW public.catalog_ld_regional_policy_audit_v AS
      SELECT
        c.sku,
        c.codigo_base,
        c.filter_type,
        c.duty,
        coalesce(c.enrichment_data->'codigo_base_governance'->>'origin_group','') AS origin_group,
        coalesce(c.enrichment_data->'codigo_base_governance'->>'approved_manufacturer','') AS approved_manufacturer,
        coalesce(c.enrichment_data->'codigo_base_governance'->>'approved_codigo_base','') AS approved_codigo_base,
        CASE
          WHEN coalesce(c.enrichment_data->'codigo_base_governance'->>'origin_group','') NOT IN ('EUROPEAN','NON_EUROPEAN') THEN 'ORIGIN_REQUIRED'
          WHEN coalesce(c.enrichment_data->'codigo_base_governance'->>'origin_group','') = 'EUROPEAN'
               AND upper(regexp_replace(coalesce(c.enrichment_data->'codigo_base_governance'->>'approved_manufacturer',''),'[^A-Z0-9]','','g')) <> 'MANNFILTER' THEN 'MANN_REQUIRED'
          WHEN coalesce(c.enrichment_data->'codigo_base_governance'->>'origin_group','') = 'NON_EUROPEAN'
               AND upper(regexp_replace(coalesce(c.enrichment_data->'codigo_base_governance'->>'approved_manufacturer',''),'[^A-Z0-9]','','g')) <> 'FRAM' THEN 'FRAM_REQUIRED'
          ELSE 'POLICY_ALIGNED'
        END AS regional_policy_state
      FROM public.elimfilters_catalog c
      WHERE c.duty = 'LIGHT_DUTY'
    `);

    const policyRows = await client.query(`
      SELECT origin_group, canonical_brand, active
      FROM ld_catalog.ld_canonical_source_policy
      WHERE active = true
      ORDER BY origin_group
    `);
    report.policy.rows = policyRows.rows;

    const audit = await client.query(`
      SELECT regional_policy_state, count(*)::int AS n
      FROM public.catalog_ld_regional_policy_audit_v
      GROUP BY regional_policy_state
      ORDER BY regional_policy_state
    `);
    report.audit.states = audit.rows;

    if (policyRows.rowCount !== 2) throw new Error('REGIONAL_LD_POLICY_EXPECTED_TWO_ACTIVE_ROWS');

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
  applyRegionalLdCodigoBasePolicy()
    .then(report => console.log('[regional-ld-codigo-base-v32]', JSON.stringify(report)))
    .catch(error => {
      console.error('[regional-ld-codigo-base-v32] failed', JSON.stringify(error.migrationReport || { error: error.message }));
      process.exit(1);
    });
}

module.exports = { MIGRATION, applyRegionalLdCodigoBasePolicy };
