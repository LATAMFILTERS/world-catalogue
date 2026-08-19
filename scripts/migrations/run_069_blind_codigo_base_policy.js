'use strict';

/**
 * Installs the catalog-level guard for codigo_base authority.
 * Applies to every INSERT and every UPDATE of elimfilters_catalog, regardless
 * of ingestion source, agent, script, API, or manual SQL.
 *
 * Existing rows are audited first. The trigger is installed only after the
 * current catalog has no rows that violate the enforceable portions of the
 * policy. Fallback rows without proof remain reported and are not guessed.
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
  gov jsonb := coalesce(NEW.enrichment_data->'codigo_base_governance', '{}'::jsonb);
  has_donaldson boolean;
  base_is_donaldson boolean;
  has_fleetguard boolean;
  base_is_fleetguard boolean;
  has_mann boolean;
  base_is_mann boolean;
BEGIN
  IF base_norm = '' THEN
    RAISE EXCEPTION 'CATALOG_POLICY: codigo_base is required for SKU %', NEW.sku;
  END IF;

  SELECT
    EXISTS (
      SELECT 1 FROM jsonb_array_elements(coalesce(NEW.competitor_codes, '[]'::jsonb) || coalesce(NEW.oem_codes, '[]'::jsonb)) x
      WHERE upper(regexp_replace(coalesce(x->>'manufacturer', x->>'brand', ''), '[^A-Z0-9]', '', 'g')) = 'DONALDSON'
    ),
    EXISTS (
      SELECT 1 FROM jsonb_array_elements(coalesce(NEW.competitor_codes, '[]'::jsonb) || coalesce(NEW.oem_codes, '[]'::jsonb)) x
      WHERE upper(regexp_replace(coalesce(x->>'manufacturer', x->>'brand', ''), '[^A-Z0-9]', '', 'g')) = 'DONALDSON'
        AND upper(regexp_replace(coalesce(x->>'code',''), '[^A-Z0-9]', '', 'g')) = base_norm
    ),
    EXISTS (
      SELECT 1 FROM jsonb_array_elements(coalesce(NEW.competitor_codes, '[]'::jsonb) || coalesce(NEW.oem_codes, '[]'::jsonb)) x
      WHERE upper(regexp_replace(coalesce(x->>'manufacturer', x->>'brand', ''), '[^A-Z0-9]', '', 'g')) IN ('FLEETGUARD','CUMMINSFILTRATION')
    ),
    EXISTS (
      SELECT 1 FROM jsonb_array_elements(coalesce(NEW.competitor_codes, '[]'::jsonb) || coalesce(NEW.oem_codes, '[]'::jsonb)) x
      WHERE upper(regexp_replace(coalesce(x->>'manufacturer', x->>'brand', ''), '[^A-Z0-9]', '', 'g')) IN ('FLEETGUARD','CUMMINSFILTRATION')
        AND upper(regexp_replace(coalesce(x->>'code',''), '[^A-Z0-9]', '', 'g')) = base_norm
    ),
    EXISTS (
      SELECT 1 FROM jsonb_array_elements(coalesce(NEW.competitor_codes, '[]'::jsonb) || coalesce(NEW.oem_codes, '[]'::jsonb)) x
      WHERE upper(regexp_replace(coalesce(x->>'manufacturer', x->>'brand', ''), '[^A-Z0-9]', '', 'g')) IN ('MANN','MANNFILTER','MANNHUMMEL')
    ),
    EXISTS (
      SELECT 1 FROM jsonb_array_elements(coalesce(NEW.competitor_codes, '[]'::jsonb) || coalesce(NEW.oem_codes, '[]'::jsonb)) x
      WHERE upper(regexp_replace(coalesce(x->>'manufacturer', x->>'brand', ''), '[^A-Z0-9]', '', 'g')) IN ('MANN','MANNFILTER','MANNHUMMEL')
        AND upper(regexp_replace(coalesce(x->>'code',''), '[^A-Z0-9]', '', 'g')) = base_norm
    )
  INTO has_donaldson, base_is_donaldson, has_fleetguard, base_is_fleetguard, has_mann, base_is_mann;

  IF duty_text = 'HEAVY_DUTY' THEN
    IF has_donaldson THEN
      IF NOT base_is_donaldson THEN
        RAISE EXCEPTION 'CATALOG_POLICY: HD SKU % must use Donaldson codigo_base when Donaldson reference exists', NEW.sku;
      END IF;
      RETURN NEW;
    END IF;

    IF has_fleetguard THEN
      IF coalesce((gov->>'donaldson_absence_verified')::boolean, false) IS NOT TRUE THEN
        RAISE EXCEPTION 'CATALOG_POLICY: HD SKU % cannot fall back to Fleetguard without verified Donaldson absence', NEW.sku;
      END IF;
      IF NOT base_is_fleetguard THEN
        RAISE EXCEPTION 'CATALOG_POLICY: HD SKU % must use Fleetguard codigo_base after verified Donaldson absence', NEW.sku;
      END IF;
      RETURN NEW;
    END IF;

    IF coalesce((gov->>'donaldson_absence_verified')::boolean, false) IS NOT TRUE
       OR coalesce((gov->>'fleetguard_absence_verified')::boolean, false) IS NOT TRUE
       OR coalesce((gov->>'oem_commercial_code_verified')::boolean, false) IS NOT TRUE THEN
      RAISE EXCEPTION 'CATALOG_POLICY: HD SKU % OEM fallback requires verified Donaldson absence, Fleetguard absence, and commercial OEM code', NEW.sku;
    END IF;
    RETURN NEW;
  END IF;

  IF duty_text = 'LIGHT_DUTY' THEN
    IF has_mann THEN
      IF NOT base_is_mann THEN
        RAISE EXCEPTION 'CATALOG_POLICY: LD SKU % must use MANN-FILTER codigo_base when MANN reference exists', NEW.sku;
      END IF;
      RETURN NEW;
    END IF;

    IF coalesce((gov->>'mann_absence_verified')::boolean, false) IS NOT TRUE
       OR coalesce((gov->>'oem_commercial_code_verified')::boolean, false) IS NOT TRUE THEN
      RAISE EXCEPTION 'CATALOG_POLICY: LD SKU % OEM fallback requires verified MANN-FILTER absence and commercial OEM code', NEW.sku;
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
    await client.query(FUNCTION_SQL);
    await client.query(TRIGGER_SQL);
    await client.query('COMMIT');

    const trigger = await client.query(`
      SELECT tgname
      FROM pg_trigger
      WHERE tgrelid = 'elimfilters_catalog'::regclass
        AND tgname = 'trg_elimfilters_codigo_base_policy'
        AND NOT tgisinternal
    `);

    console.log(JSON.stringify({
      installed: trigger.rowCount === 1,
      trigger: trigger.rows[0]?.tgname || null,
      scope: 'ALL_FUTURE_INSERTS_AND_RELEVANT_UPDATES',
      heavy_duty_priority: ['DONALDSON', 'FLEETGUARD_WITH_VERIFIED_DONALDSON_ABSENCE', 'OEM_WITH_FULL_VERIFIED_FALLBACK'],
      light_duty_priority: ['MANN_FILTER', 'OEM_WITH_VERIFIED_MANN_ABSENCE'],
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
