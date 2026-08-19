'use strict';

/**
 * Updates the production codigo_base trigger to policy 2026-08-19-v2.
 * This migration does NOT mutate existing codigo_base, SKU, OEM codes, or
 * competitor codes. It only replaces the enforcement function/trigger used for
 * future INSERTS and relevant UPDATEs.
 */

require('dotenv').config();
const { Pool } = require('pg');

const DATABASE_URL = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

const FUNCTION_SQL = String.raw`
CREATE OR REPLACE FUNCTION enforce_elimfilters_codigo_base_policy()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  duty_text text := upper(coalesce(NEW.duty, ''));
  base_norm text := upper(regexp_replace(coalesce(NEW.codigo_base, ''), '[^A-Z0-9]', '', 'g'));
  old_base_norm text := CASE WHEN TG_OP = 'UPDATE' THEN upper(regexp_replace(coalesce(OLD.codigo_base, ''), '[^A-Z0-9]', '', 'g')) ELSE NULL END;
  gov jsonb := coalesce(NEW.enrichment_data->'codigo_base_governance', '{}'::jsonb);
  donaldson_codes jsonb := '[]'::jsonb;
  mann_codes jsonb := '[]'::jsonb;
  has_donaldson boolean := false;
  has_mann boolean := false;
  base_is_donaldson boolean := false;
  base_is_mann boolean := false;
  approved_code text := coalesce(gov->>'approved_codigo_base', '');
  approved_source text := upper(coalesce(gov->>'approved_source_column', ''));
  approved_manufacturer text := upper(regexp_replace(coalesce(gov->>'approved_manufacturer', ''), '[^A-Z0-9]', '', 'g'));
  approved_exists boolean := false;
  code_digits text;
  sku_digits text;
  expected_suffix text;
  strict_validation boolean := false;
BEGIN
  IF base_norm = '' THEN
    RAISE EXCEPTION 'CATALOG_POLICY: codigo_base is required for SKU %', NEW.sku;
  END IF;

  SELECT coalesce(jsonb_agg(DISTINCT x->>'code') FILTER (
      WHERE upper(regexp_replace(coalesce(x->>'manufacturer', x->>'brand', x->>'oem', ''), '[^A-Z0-9]', '', 'g')) = 'DONALDSON'
        AND coalesce(x->>'code','') <> ''
    ), '[]'::jsonb)
  INTO donaldson_codes
  FROM jsonb_array_elements(
    (CASE WHEN jsonb_typeof(NEW.competitor_codes) = 'array' THEN NEW.competitor_codes ELSE '[]'::jsonb END)
    || (CASE WHEN jsonb_typeof(NEW.oem_codes) = 'array' THEN NEW.oem_codes ELSE '[]'::jsonb END)
  ) x;

  SELECT coalesce(jsonb_agg(DISTINCT x->>'code') FILTER (
      WHERE upper(regexp_replace(coalesce(x->>'manufacturer', x->>'brand', x->>'oem', ''), '[^A-Z0-9]', '', 'g')) IN ('MANN','MANNFILTER','MANNHUMMEL')
        AND coalesce(x->>'code','') <> ''
    ), '[]'::jsonb)
  INTO mann_codes
  FROM jsonb_array_elements(
    (CASE WHEN jsonb_typeof(NEW.competitor_codes) = 'array' THEN NEW.competitor_codes ELSE '[]'::jsonb END)
    || (CASE WHEN jsonb_typeof(NEW.oem_codes) = 'array' THEN NEW.oem_codes ELSE '[]'::jsonb END)
  ) x;

  has_donaldson := jsonb_array_length(donaldson_codes) > 0;
  has_mann := jsonb_array_length(mann_codes) > 0;

  SELECT EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(donaldson_codes) code
    WHERE upper(regexp_replace(code, '[^A-Z0-9]', '', 'g')) = base_norm
  ) INTO base_is_donaldson;

  SELECT EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(mann_codes) code
    WHERE upper(regexp_replace(code, '[^A-Z0-9]', '', 'g')) = base_norm
  ) INTO base_is_mann;

  strict_validation := TG_OP = 'INSERT'
    OR (TG_OP = 'UPDATE' AND (
      base_norm IS DISTINCT FROM old_base_norm
      OR NEW.duty IS DISTINCT FROM OLD.duty
    ));

  IF NOT strict_validation THEN
    RETURN NEW;
  END IF;

  IF duty_text = 'HEAVY_DUTY' THEN
    IF has_donaldson THEN
      IF NOT base_is_donaldson THEN
        RAISE EXCEPTION 'CATALOG_POLICY_V2: HD SKU % must use a verified Donaldson codigo_base when Donaldson manufacturing evidence exists', NEW.sku;
      END IF;
      RETURN NEW;
    END IF;

    IF coalesce((gov->>'donaldson_absence_verified')::boolean, false) IS NOT TRUE THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V2: HD SKU % fallback requires verified Donaldson manufacturing absence', NEW.sku;
    END IF;
    IF coalesce((gov->>'fallback_manufacturer_verified')::boolean, false) IS NOT TRUE THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V2: HD SKU % fallback manufacturer must be verified', NEW.sku;
    END IF;
    IF coalesce((gov->>'fallback_commercial_code_verified')::boolean, false) IS NOT TRUE THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V2: HD SKU % fallback commercial code must be verified', NEW.sku;
    END IF;
    IF upper(regexp_replace(approved_code, '[^A-Z0-9]', '', 'g')) <> base_norm THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V2: HD SKU % codigo_base must equal approved_codigo_base', NEW.sku;
    END IF;
    IF approved_source NOT IN ('OEM_CODES','COMPETITOR_CODES') THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V2: HD SKU % approved_source_column must be OEM_CODES or COMPETITOR_CODES', NEW.sku;
    END IF;

    IF approved_source = 'OEM_CODES' THEN
      SELECT EXISTS (
        SELECT 1
        FROM jsonb_array_elements(CASE WHEN jsonb_typeof(NEW.oem_codes) = 'array' THEN NEW.oem_codes ELSE '[]'::jsonb END) x
        WHERE upper(regexp_replace(coalesce(x->>'code',''), '[^A-Z0-9]', '', 'g')) = base_norm
          AND (approved_manufacturer = '' OR upper(regexp_replace(coalesce(x->>'manufacturer', x->>'brand', x->>'oem', ''), '[^A-Z0-9]', '', 'g')) = approved_manufacturer)
      ) INTO approved_exists;
    ELSE
      SELECT EXISTS (
        SELECT 1
        FROM jsonb_array_elements(CASE WHEN jsonb_typeof(NEW.competitor_codes) = 'array' THEN NEW.competitor_codes ELSE '[]'::jsonb END) x
        WHERE upper(regexp_replace(coalesce(x->>'code',''), '[^A-Z0-9]', '', 'g')) = base_norm
          AND (approved_manufacturer = '' OR upper(regexp_replace(coalesce(x->>'manufacturer', x->>'brand', x->>'oem', ''), '[^A-Z0-9]', '', 'g')) = approved_manufacturer)
      ) INTO approved_exists;
    END IF;

    IF NOT approved_exists THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V2: HD SKU % approved codigo_base must exist in its declared OEM/competitor source column', NEW.sku;
    END IF;

    code_digits := regexp_replace(approved_code, '[^0-9]', '', 'g');
    IF length(code_digits) < 4 THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V2: HD SKU % approved commercial code needs at least four numeric digits', NEW.sku;
    END IF;
    expected_suffix := right(code_digits, 4);
    sku_digits := regexp_replace(coalesce(NEW.sku,''), '[^0-9]', '', 'g');
    IF right(sku_digits, 4) <> expected_suffix THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V2: HD SKU % must end with last four numeric digits % from approved commercial code %', NEW.sku, expected_suffix, approved_code;
    END IF;
    RETURN NEW;
  END IF;

  IF duty_text = 'LIGHT_DUTY' THEN
    IF has_mann THEN
      IF NOT base_is_mann THEN
        RAISE EXCEPTION 'CATALOG_POLICY_V2: LD SKU % must use MANN-FILTER codigo_base when MANN-FILTER manufacturing evidence exists', NEW.sku;
      END IF;
      RETURN NEW;
    END IF;

    IF coalesce((gov->>'mann_absence_verified')::boolean, false) IS NOT TRUE
       OR coalesce((gov->>'fallback_manufacturer_verified')::boolean, false) IS NOT TRUE
       OR coalesce((gov->>'fallback_commercial_code_verified')::boolean, false) IS NOT TRUE THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V2: LD SKU % fallback requires verified MANN absence, manufacturer, and commercial OEM code', NEW.sku;
    END IF;
    IF approved_source <> 'OEM_CODES' THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V2: LD SKU % fallback must be stored in OEM_CODES', NEW.sku;
    END IF;
    IF upper(regexp_replace(approved_code, '[^A-Z0-9]', '', 'g')) <> base_norm THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V2: LD SKU % codigo_base must equal approved_codigo_base', NEW.sku;
    END IF;

    SELECT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(CASE WHEN jsonb_typeof(NEW.oem_codes) = 'array' THEN NEW.oem_codes ELSE '[]'::jsonb END) x
      WHERE upper(regexp_replace(coalesce(x->>'code',''), '[^A-Z0-9]', '', 'g')) = base_norm
        AND (approved_manufacturer = '' OR upper(regexp_replace(coalesce(x->>'manufacturer', x->>'brand', x->>'oem', ''), '[^A-Z0-9]', '', 'g')) = approved_manufacturer)
    ) INTO approved_exists;

    IF NOT approved_exists THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V2: LD SKU % approved OEM codigo_base must exist in OEM_CODES', NEW.sku;
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'CATALOG_POLICY_V2: unsupported duty % for SKU %', NEW.duty, NEW.sku;
END;
$fn$;
`;

const TRIGGER_SQL = `
DROP TRIGGER IF EXISTS trg_elimfilters_codigo_base_policy ON elimfilters_catalog;
CREATE TRIGGER trg_elimfilters_codigo_base_policy
BEFORE INSERT OR UPDATE OF codigo_base, duty, competitor_codes, oem_codes, enrichment_data
ON elimfilters_catalog
FOR EACH ROW
EXECUTE FUNCTION enforce_elimfilters_codigo_base_policy();
`;

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(FUNCTION_SQL);
    await client.query(TRIGGER_SQL);
    await client.query('COMMIT');
    console.log(JSON.stringify({
      policy_version: '2026-08-19-v2',
      trigger: 'trg_elimfilters_codigo_base_policy',
      existing_catalog_mutations: 0,
      future_writes: 'DONALDSON_THEN_VERIFIED_MANUFACTURER_WITH_SOURCE_COLUMN_AND_LAST4_SUFFIX'
    }, null, 2));
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
