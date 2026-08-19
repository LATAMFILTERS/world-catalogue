'use strict';

/**
 * Structures EVERY elimfilters_catalog row under the canonical codigo_base policy
 * without changing codigo_base values by inference.
 *
 * Existing rows:
 *   - receive enrichment_data.codigo_base_governance metadata
 *   - keep their current codigo_base unless separately approved by governance
 *
 * Future writes:
 *   - every INSERT/UPDATE is automatically re-structured
 *   - INSERTS and codigo_base/duty changes are strictly enforced
 *   - evidence enrichment may be added without forcing an unapproved mutation
 */

require('dotenv').config();
const { Pool } = require('pg');
const { deriveCodigoBaseGovernance, POLICY_VERSION } = require('../../lib/catalog-codigo-base-governance');

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
  refs jsonb :=
    (CASE WHEN jsonb_typeof(NEW.competitor_codes) = 'array' THEN NEW.competitor_codes ELSE '[]'::jsonb END)
    ||
    (CASE WHEN jsonb_typeof(NEW.oem_codes) = 'array' THEN NEW.oem_codes ELSE '[]'::jsonb END);
  has_donaldson boolean := false;
  base_is_donaldson boolean := false;
  has_fleetguard boolean := false;
  base_is_fleetguard boolean := false;
  has_mann boolean := false;
  base_is_mann boolean := false;
  donaldson_codes jsonb := '[]'::jsonb;
  fleetguard_codes jsonb := '[]'::jsonb;
  mann_codes jsonb := '[]'::jsonb;
  derived_state text;
  required_authority text;
  preferred_candidates jsonb := '[]'::jsonb;
  fallback_candidates jsonb := '[]'::jsonb;
  strict_validation boolean := false;
BEGIN
  IF base_norm = '' THEN
    RAISE EXCEPTION 'CATALOG_POLICY: codigo_base is required for SKU %', NEW.sku;
  END IF;

  SELECT
    coalesce(jsonb_agg(DISTINCT x->>'code') FILTER (
      WHERE upper(regexp_replace(coalesce(x->>'manufacturer', x->>'brand', x->>'oem', ''), '[^A-Z0-9]', '', 'g')) = 'DONALDSON'
        AND coalesce(x->>'code','') <> ''
    ), '[]'::jsonb),
    coalesce(jsonb_agg(DISTINCT x->>'code') FILTER (
      WHERE upper(regexp_replace(coalesce(x->>'manufacturer', x->>'brand', x->>'oem', ''), '[^A-Z0-9]', '', 'g')) IN ('FLEETGUARD','CUMMINSFILTRATION')
        AND coalesce(x->>'code','') <> ''
    ), '[]'::jsonb),
    coalesce(jsonb_agg(DISTINCT x->>'code') FILTER (
      WHERE upper(regexp_replace(coalesce(x->>'manufacturer', x->>'brand', x->>'oem', ''), '[^A-Z0-9]', '', 'g')) IN ('MANN','MANNFILTER','MANNHUMMEL')
        AND coalesce(x->>'code','') <> ''
    ), '[]'::jsonb)
  INTO donaldson_codes, fleetguard_codes, mann_codes
  FROM jsonb_array_elements(refs) x;

  has_donaldson := jsonb_array_length(donaldson_codes) > 0;
  has_fleetguard := jsonb_array_length(fleetguard_codes) > 0;
  has_mann := jsonb_array_length(mann_codes) > 0;

  SELECT EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(donaldson_codes) code
    WHERE upper(regexp_replace(code, '[^A-Z0-9]', '', 'g')) = base_norm
  ) INTO base_is_donaldson;

  SELECT EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(fleetguard_codes) code
    WHERE upper(regexp_replace(code, '[^A-Z0-9]', '', 'g')) = base_norm
  ) INTO base_is_fleetguard;

  SELECT EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(mann_codes) code
    WHERE upper(regexp_replace(code, '[^A-Z0-9]', '', 'g')) = base_norm
  ) INTO base_is_mann;

  IF duty_text = 'HEAVY_DUTY' THEN
    IF base_is_donaldson THEN
      derived_state := 'CANONICAL_EVIDENCED';
      required_authority := 'DONALDSON';
      preferred_candidates := donaldson_codes;
      fallback_candidates := fleetguard_codes;
    ELSIF has_donaldson THEN
      derived_state := 'REVIEW_DONALDSON_CANDIDATE';
      required_authority := 'DONALDSON';
      preferred_candidates := donaldson_codes;
      fallback_candidates := fleetguard_codes;
    ELSIF has_fleetguard THEN
      derived_state := 'REVIEW_DONALDSON_ABSENCE';
      required_authority := 'DONALDSON_THEN_FLEETGUARD';
      preferred_candidates := '[]'::jsonb;
      fallback_candidates := fleetguard_codes;
    ELSE
      derived_state := 'REVIEW_DONALDSON_AND_FLEETGUARD_ABSENCE';
      required_authority := 'DONALDSON_THEN_FLEETGUARD_THEN_OEM';
    END IF;
  ELSIF duty_text = 'LIGHT_DUTY' THEN
    IF base_is_mann THEN
      derived_state := 'CANONICAL_EVIDENCED';
      required_authority := 'MANN_FILTER';
      preferred_candidates := mann_codes;
    ELSIF has_mann THEN
      derived_state := 'REVIEW_MANN_CANDIDATE';
      required_authority := 'MANN_FILTER';
      preferred_candidates := mann_codes;
    ELSE
      derived_state := 'REVIEW_MANN_ABSENCE';
      required_authority := 'MANN_FILTER_THEN_OEM';
    END IF;
  ELSE
    derived_state := 'REVIEW_UNSUPPORTED_DUTY';
    required_authority := 'UNSUPPORTED_DUTY';
  END IF;

  gov := gov || jsonb_build_object(
    'policy_version', '2026-08-18-v1',
    'state', derived_state,
    'required_authority', required_authority,
    'current_codigo_base', NEW.codigo_base,
    'observed_preferred_candidates', preferred_candidates,
    'observed_fallback_candidates', fallback_candidates
  );

  NEW.enrichment_data := jsonb_set(
    coalesce(NEW.enrichment_data, '{}'::jsonb),
    '{codigo_base_governance}',
    gov,
    true
  );

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
        RAISE EXCEPTION 'CATALOG_POLICY: HD SKU % must use Donaldson codigo_base when Donaldson evidence exists', NEW.sku;
      END IF;
      RETURN NEW;
    END IF;

    IF has_fleetguard THEN
      IF coalesce((gov->>'donaldson_absence_verified')::boolean, false) IS NOT TRUE THEN
        RAISE EXCEPTION 'CATALOG_POLICY: HD SKU % cannot use Fleetguard fallback without verified Donaldson absence', NEW.sku;
      END IF;
      IF NOT base_is_fleetguard THEN
        RAISE EXCEPTION 'CATALOG_POLICY: HD SKU % must use evidenced Fleetguard codigo_base after verified Donaldson absence', NEW.sku;
      END IF;
      RETURN NEW;
    END IF;

    IF coalesce((gov->>'donaldson_absence_verified')::boolean, false) IS NOT TRUE
       OR coalesce((gov->>'fleetguard_absence_verified')::boolean, false) IS NOT TRUE
       OR coalesce((gov->>'oem_commercial_code_verified')::boolean, false) IS NOT TRUE THEN
      RAISE EXCEPTION 'CATALOG_POLICY: HD SKU % OEM fallback requires verified Donaldson absence, Fleetguard absence, and verified OEM code', NEW.sku;
    END IF;
    RETURN NEW;
  END IF;

  IF duty_text = 'LIGHT_DUTY' THEN
    IF has_mann THEN
      IF NOT base_is_mann THEN
        RAISE EXCEPTION 'CATALOG_POLICY: LD SKU % must use MANN-FILTER codigo_base when MANN-FILTER evidence exists', NEW.sku;
      END IF;
      RETURN NEW;
    END IF;

    IF coalesce((gov->>'mann_absence_verified')::boolean, false) IS NOT TRUE
       OR coalesce((gov->>'oem_commercial_code_verified')::boolean, false) IS NOT TRUE THEN
      RAISE EXCEPTION 'CATALOG_POLICY: LD SKU % OEM fallback requires verified MANN-FILTER absence and verified OEM code', NEW.sku;
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'CATALOG_POLICY: unsupported duty % for SKU %', NEW.duty, NEW.sku;
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

    // Existing trigger is intentionally disabled only inside this transaction so
    // metadata can be backfilled without forcing unapproved codigo_base changes.
    await client.query('ALTER TABLE elimfilters_catalog DISABLE TRIGGER trg_elimfilters_codigo_base_policy');

    const { rows } = await client.query(`
      SELECT sku, codigo_base, duty, competitor_codes, oem_codes, enrichment_data
      FROM elimfilters_catalog
      ORDER BY sku
    `);

    const counts = {};
    for (const row of rows) {
      const derived = deriveCodigoBaseGovernance(row);
      counts[derived.state] = (counts[derived.state] || 0) + 1;

      const existingData = row.enrichment_data && typeof row.enrichment_data === 'object' && !Array.isArray(row.enrichment_data)
        ? row.enrichment_data
        : {};
      const existingGov = existingData.codigo_base_governance && typeof existingData.codigo_base_governance === 'object' && !Array.isArray(existingData.codigo_base_governance)
        ? existingData.codigo_base_governance
        : {};
      const governance = { ...existingGov, ...derived };

      await client.query(
        `UPDATE elimfilters_catalog
         SET enrichment_data = jsonb_set(coalesce(enrichment_data, '{}'::jsonb), '{codigo_base_governance}', $1::jsonb, true)
         WHERE sku = $2`,
        [JSON.stringify(governance), row.sku]
      );
    }

    await client.query(FUNCTION_SQL);
    await client.query(TRIGGER_SQL);
    await client.query('ALTER TABLE elimfilters_catalog ENABLE TRIGGER trg_elimfilters_codigo_base_policy');

    const verify = await client.query(`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE enrichment_data->'codigo_base_governance'->>'policy_version' = $1)::int AS structured,
        count(*) FILTER (WHERE enrichment_data->'codigo_base_governance'->>'state' IS NULL)::int AS missing_state,
        count(*) FILTER (WHERE enrichment_data->'codigo_base_governance'->>'required_authority' IS NULL)::int AS missing_required_authority
      FROM elimfilters_catalog
    `, [POLICY_VERSION]);

    if (verify.rows[0].total !== verify.rows[0].structured || verify.rows[0].missing_state !== 0 || verify.rows[0].missing_required_authority !== 0) {
      throw new Error(`Governance verification failed: ${JSON.stringify(verify.rows[0])}`);
    }

    await client.query('COMMIT');

    console.log(JSON.stringify({
      policy_version: POLICY_VERSION,
      total_rows: verify.rows[0].total,
      structured_rows: verify.rows[0].structured,
      missing_state: verify.rows[0].missing_state,
      missing_required_authority: verify.rows[0].missing_required_authority,
      states: counts,
      codigo_base_mutations: 0,
      trigger: 'trg_elimfilters_codigo_base_policy',
      future_writes: 'AUTO_STRUCTURED_AND_STRICT_ON_INSERT_OR_CODIGO_BASE_DUTY_CHANGE'
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
