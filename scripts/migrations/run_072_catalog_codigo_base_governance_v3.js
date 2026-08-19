'use strict';

/**
 * ELIMFILTERS catalog governance V3.
 *
 * Safe migration:
 * - installs the future-write codigo_base trigger
 * - backfills ONLY enrichment_data.codigo_base_governance
 * - does NOT change sku, codigo_base, oem_codes, competitor_codes, duty or product specs
 * - codigo_base is independent from alternate-code columns
 */

require('dotenv').config();
const { Pool } = require('pg');
const { deriveCodigoBaseGovernance, POLICY_VERSION } = require('../../lib/catalog-codigo-base-governance');

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
  approved_code_norm text := upper(regexp_replace(coalesce(gov->>'approved_codigo_base', ''), '[^A-Z0-9]', '', 'g'));
  approved_manufacturer text := upper(regexp_replace(coalesce(gov->>'approved_manufacturer', ''), '[^A-Z0-9]', '', 'g'));
  approved_source text := upper(coalesce(gov->>'approved_source_column', ''));
  refs jsonb :=
    (CASE WHEN jsonb_typeof(NEW.competitor_codes) = 'array' THEN NEW.competitor_codes ELSE '[]'::jsonb END)
    || (CASE WHEN jsonb_typeof(NEW.oem_codes) = 'array' THEN NEW.oem_codes ELSE '[]'::jsonb END);
  observed_donaldson boolean := false;
  observed_mann boolean := false;
  base_in_observed_donaldson boolean := false;
  base_in_observed_mann boolean := false;
  strict_validation boolean := false;
  code_digits text;
  sku_digits text;
  expected_suffix text;
BEGIN
  IF base_norm = '' THEN
    RAISE EXCEPTION 'CATALOG_POLICY_V3: codigo_base is required for SKU %', NEW.sku;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM jsonb_array_elements(refs) x
    WHERE upper(regexp_replace(coalesce(x->>'manufacturer', x->>'brand', x->>'oem', ''), '[^A-Z0-9]', '', 'g')) = 'DONALDSON'
      AND coalesce(x->>'code', x->>'reference', x->>'part_number', x->>'partNumber', x->>'partno', x->>'oem_code', x->>'oemCode', x->>'cross_reference', x->>'crossReference', '') <> ''
  ) INTO observed_donaldson;

  SELECT EXISTS (
    SELECT 1 FROM jsonb_array_elements(refs) x
    WHERE upper(regexp_replace(coalesce(x->>'manufacturer', x->>'brand', x->>'oem', ''), '[^A-Z0-9]', '', 'g')) IN ('MANN','MANNFILTER','MANNHUMMEL')
      AND coalesce(x->>'code', x->>'reference', x->>'part_number', x->>'partNumber', x->>'partno', x->>'oem_code', x->>'oemCode', x->>'cross_reference', x->>'crossReference', '') <> ''
  ) INTO observed_mann;

  SELECT EXISTS (
    SELECT 1 FROM jsonb_array_elements(refs) x
    WHERE upper(regexp_replace(coalesce(x->>'manufacturer', x->>'brand', x->>'oem', ''), '[^A-Z0-9]', '', 'g')) = 'DONALDSON'
      AND upper(regexp_replace(coalesce(x->>'code', x->>'reference', x->>'part_number', x->>'partNumber', x->>'partno', x->>'oem_code', x->>'oemCode', x->>'cross_reference', x->>'crossReference', ''), '[^A-Z0-9]', '', 'g')) = base_norm
  ) INTO base_in_observed_donaldson;

  SELECT EXISTS (
    SELECT 1 FROM jsonb_array_elements(refs) x
    WHERE upper(regexp_replace(coalesce(x->>'manufacturer', x->>'brand', x->>'oem', ''), '[^A-Z0-9]', '', 'g')) IN ('MANN','MANNFILTER','MANNHUMMEL')
      AND upper(regexp_replace(coalesce(x->>'code', x->>'reference', x->>'part_number', x->>'partNumber', x->>'partno', x->>'oem_code', x->>'oemCode', x->>'cross_reference', x->>'crossReference', ''), '[^A-Z0-9]', '', 'g')) = base_norm
  ) INTO base_in_observed_mann;

  strict_validation := TG_OP = 'INSERT'
    OR (TG_OP = 'UPDATE' AND (
      base_norm IS DISTINCT FROM old_base_norm
      OR NEW.duty IS DISTINCT FROM OLD.duty
    ));

  IF NOT strict_validation THEN
    RETURN NEW;
  END IF;

  IF duty_text = 'HEAVY_DUTY' THEN
    -- Primary authority: Donaldson. Canonical code does NOT need duplication in alternates.
    IF approved_manufacturer = 'DONALDSON'
       AND coalesce((gov->>'primary_manufacturer_verified')::boolean, false) IS TRUE
       AND approved_code_norm = base_norm THEN
      RETURN NEW;
    END IF;

    -- If current alternate evidence shows Donaldson, an unverified non-Donaldson base is blocked.
    IF observed_donaldson THEN
      IF base_in_observed_donaldson THEN
        RETURN NEW;
      END IF;
      RAISE EXCEPTION 'CATALOG_POLICY_V3: HD SKU % has Donaldson evidence; codigo_base requires verified Donaldson authority', NEW.sku;
    END IF;

    -- Absence from JSONB is not absence. Fallback requires explicit manufacturing-absence evidence.
    IF coalesce((gov->>'donaldson_absence_verified')::boolean, false) IS NOT TRUE THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V3: HD SKU % fallback requires verified Donaldson manufacturing absence', NEW.sku;
    END IF;
    IF coalesce((gov->>'fallback_manufacturer_verified')::boolean, false) IS NOT TRUE
       OR coalesce((gov->>'fallback_commercial_code_verified')::boolean, false) IS NOT TRUE THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V3: HD SKU % fallback manufacturer and commercial code require verification', NEW.sku;
    END IF;
    IF approved_code_norm = '' OR approved_code_norm <> base_norm THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V3: HD SKU % codigo_base must equal approved_codigo_base', NEW.sku;
    END IF;
    IF approved_source NOT IN ('OEM_CODES','COMPETITOR_CODES') THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V3: HD SKU % fallback source must classify manufacturer as OEM_CODES or COMPETITOR_CODES', NEW.sku;
    END IF;

    code_digits := regexp_replace(coalesce(gov->>'approved_codigo_base',''), '[^0-9]', '', 'g');
    IF length(code_digits) < 4 THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V3: HD SKU % approved fallback code needs at least four numeric digits', NEW.sku;
    END IF;
    expected_suffix := right(code_digits, 4);
    sku_digits := regexp_replace(coalesce(NEW.sku,''), '[^0-9]', '', 'g');
    IF right(sku_digits, 4) <> expected_suffix THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V3: HD SKU % must end in % from approved commercial code %', NEW.sku, expected_suffix, gov->>'approved_codigo_base';
    END IF;
    RETURN NEW;
  END IF;

  IF duty_text = 'LIGHT_DUTY' THEN
    -- Primary authority: MANN-FILTER. Canonical code does NOT need duplication in alternates.
    IF approved_manufacturer IN ('MANN','MANNFILTER','MANNHUMMEL')
       AND coalesce((gov->>'primary_manufacturer_verified')::boolean, false) IS TRUE
       AND approved_code_norm = base_norm THEN
      RETURN NEW;
    END IF;

    IF observed_mann THEN
      IF base_in_observed_mann THEN
        RETURN NEW;
      END IF;
      RAISE EXCEPTION 'CATALOG_POLICY_V3: LD SKU % has MANN-FILTER evidence; codigo_base requires verified MANN-FILTER authority', NEW.sku;
    END IF;

    IF coalesce((gov->>'mann_absence_verified')::boolean, false) IS NOT TRUE THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V3: LD SKU % fallback requires verified MANN-FILTER manufacturing absence', NEW.sku;
    END IF;
    IF coalesce((gov->>'fallback_manufacturer_verified')::boolean, false) IS NOT TRUE
       OR coalesce((gov->>'fallback_commercial_code_verified')::boolean, false) IS NOT TRUE THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V3: LD SKU % fallback OEM manufacturer and commercial code require verification', NEW.sku;
    END IF;
    IF approved_source <> 'OEM_CODES' THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V3: LD SKU % fallback source must be OEM_CODES', NEW.sku;
    END IF;
    IF approved_code_norm = '' OR approved_code_norm <> base_norm THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V3: LD SKU % codigo_base must equal approved_codigo_base', NEW.sku;
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'CATALOG_POLICY_V3: unsupported duty % for SKU %', NEW.duty, NEW.sku;
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

async function installPolicyV3({ backfill = true } = {}) {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(FUNCTION_SQL);
    await client.query(TRIGGER_SQL);

    let backfilled = 0;
    const stateCounts = {};
    if (backfill) {
      const current = await client.query(`
        SELECT count(*)::int AS n
        FROM elimfilters_catalog
        WHERE enrichment_data->'codigo_base_governance'->>'policy_version' = $1
      `, [POLICY_VERSION]);

      if (current.rows[0].n !== 12182) {
        const { rows } = await client.query(`
          SELECT sku, codigo_base, duty, competitor_codes, oem_codes, enrichment_data
          FROM elimfilters_catalog
          ORDER BY sku
        `);
        for (const row of rows) {
          const derived = deriveCodigoBaseGovernance(row);
          stateCounts[derived.state] = (stateCounts[derived.state] || 0) + 1;
          const data = row.enrichment_data && typeof row.enrichment_data === 'object' && !Array.isArray(row.enrichment_data) ? row.enrichment_data : {};
          const existing = data.codigo_base_governance && typeof data.codigo_base_governance === 'object' && !Array.isArray(data.codigo_base_governance) ? data.codigo_base_governance : {};
          const governance = { ...existing, ...derived };
          await client.query(`
            UPDATE elimfilters_catalog
            SET enrichment_data = jsonb_set(coalesce(enrichment_data, '{}'::jsonb), '{codigo_base_governance}', $1::jsonb, true)
            WHERE sku = $2
          `, [JSON.stringify(governance), row.sku]);
          backfilled += 1;
        }
      }
    }

    const verify = await client.query(`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE enrichment_data->'codigo_base_governance'->>'policy_version' = $1)::int AS v3,
        count(*) FILTER (WHERE enrichment_data->'codigo_base_governance'->>'state' IS NULL)::int AS missing_state
      FROM elimfilters_catalog
    `, [POLICY_VERSION]);

    await client.query('COMMIT');
    return {
      policy_version: POLICY_VERSION,
      total_rows: verify.rows[0].total,
      structured_v3_rows: verify.rows[0].v3,
      missing_state: verify.rows[0].missing_state,
      backfilled_rows: backfilled,
      states: stateCounts,
      protected_fields_mutated: 0,
      governance_metadata_only: true,
      trigger: 'trg_elimfilters_codigo_base_policy',
      model: 'CODIGO_BASE_CANONICAL__OEM_AND_COMPETITOR_CODES_ALTERNATES_ONLY'
    };
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function main() {
  const result = await installPolicyV3({ backfill: true });
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { FUNCTION_SQL, TRIGGER_SQL, installPolicyV3 };
