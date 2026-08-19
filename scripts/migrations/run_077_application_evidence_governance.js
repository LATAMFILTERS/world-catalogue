'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const APPLICATION_POLICY_VERSION = '2026-08-19-app-v1';

const TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_application_evidence (
  id bigserial PRIMARY KEY,
  sku text NOT NULL,
  application_kind text NOT NULL CHECK (application_kind IN ('EQUIPMENT','VEHICLE','ENGINE')),
  payload_hash text NOT NULL,
  evidence_authority text NOT NULL,
  source_url text,
  evidence_hash text,
  verified boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sku, application_kind, payload_hash, evidence_authority)
);
CREATE INDEX IF NOT EXISTS idx_catalog_application_evidence_lookup
  ON catalog_application_evidence (sku, application_kind, payload_hash, verified);
`;

const FUNCTION_SQL = String.raw`
CREATE OR REPLACE FUNCTION enforce_elimfilters_application_evidence_policy()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  duty_text text := upper(coalesce(NEW.duty, ''));
  gov jsonb := coalesce(NEW.enrichment_data->'application_governance', '{}'::jsonb);
  equipment_changed boolean := false;
  vehicle_changed boolean := false;
  equipment_count int := 0;
  vehicle_count int := 0;
  equipment_hash text;
  vehicle_hash text;
  equipment_has_engine boolean := false;
  vehicle_has_engine boolean := false;
BEGIN
  IF NEW.equipment_applications IS NOT NULL AND jsonb_typeof(NEW.equipment_applications) <> 'array' THEN
    RAISE EXCEPTION 'APPLICATION_POLICY_V1: equipment_applications must be a JSON array for SKU %', NEW.sku;
  END IF;
  IF NEW.vehicle_applications IS NOT NULL AND jsonb_typeof(NEW.vehicle_applications) <> 'array' THEN
    RAISE EXCEPTION 'APPLICATION_POLICY_V1: vehicle_applications must be a JSON array for SKU %', NEW.sku;
  END IF;

  equipment_count := CASE WHEN jsonb_typeof(coalesce(NEW.equipment_applications, '[]'::jsonb))='array' THEN jsonb_array_length(coalesce(NEW.equipment_applications, '[]'::jsonb)) ELSE 0 END;
  vehicle_count := CASE WHEN jsonb_typeof(coalesce(NEW.vehicle_applications, '[]'::jsonb))='array' THEN jsonb_array_length(coalesce(NEW.vehicle_applications, '[]'::jsonb)) ELSE 0 END;

  IF duty_text = 'HEAVY_DUTY' AND vehicle_count > 0 THEN
    RAISE EXCEPTION 'APPLICATION_POLICY_V1: HD SKU % must store applications in equipment_applications, not vehicle_applications', NEW.sku;
  END IF;
  IF duty_text = 'LIGHT_DUTY' AND equipment_count > 0 THEN
    RAISE EXCEPTION 'APPLICATION_POLICY_V1: LD SKU % must store applications in vehicle_applications, not equipment_applications', NEW.sku;
  END IF;

  equipment_changed := TG_OP = 'INSERT' AND equipment_count > 0
    OR TG_OP = 'UPDATE' AND coalesce(NEW.equipment_applications, '[]'::jsonb) IS DISTINCT FROM coalesce(OLD.equipment_applications, '[]'::jsonb);
  vehicle_changed := TG_OP = 'INSERT' AND vehicle_count > 0
    OR TG_OP = 'UPDATE' AND coalesce(NEW.vehicle_applications, '[]'::jsonb) IS DISTINCT FROM coalesce(OLD.vehicle_applications, '[]'::jsonb);

  IF NOT equipment_changed AND NOT vehicle_changed THEN
    RETURN NEW;
  END IF;

  IF coalesce(gov->>'policy_version','') <> '${APPLICATION_POLICY_VERSION}' THEN
    RAISE EXCEPTION 'APPLICATION_POLICY_V1: SKU % application governance version missing or invalid', NEW.sku;
  END IF;
  IF coalesce((gov->>'evidence_recorded')::boolean, false) IS NOT TRUE THEN
    RAISE EXCEPTION 'APPLICATION_POLICY_V1: SKU % application evidence must be recorded before write', NEW.sku;
  END IF;
  IF btrim(coalesce(gov->>'evidence_authority','')) = '' THEN
    RAISE EXCEPTION 'APPLICATION_POLICY_V1: SKU % evidence authority is required', NEW.sku;
  END IF;

  IF equipment_changed THEN
    equipment_hash := md5(coalesce(NEW.equipment_applications, '[]'::jsonb)::text);
    IF coalesce((gov->>'equipment_verified')::boolean, false) IS NOT TRUE
       OR coalesce(gov->>'equipment_db_payload_hash','') <> equipment_hash THEN
      RAISE EXCEPTION 'APPLICATION_POLICY_V1: SKU % equipment payload is not verified', NEW.sku;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM catalog_application_evidence e
      WHERE e.sku = NEW.sku
        AND e.application_kind = 'EQUIPMENT'
        AND e.payload_hash = equipment_hash
        AND e.verified IS TRUE
    ) THEN
      RAISE EXCEPTION 'APPLICATION_POLICY_V1: SKU % has no verified EQUIPMENT evidence for payload %', NEW.sku, equipment_hash;
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM jsonb_array_elements(coalesce(NEW.equipment_applications, '[]'::jsonb)) x
      WHERE btrim(coalesce(x->>'engine', x->>'engine_model', x->>'motor', '')) <> ''
    ) INTO equipment_has_engine;

    IF equipment_has_engine THEN
      IF coalesce((gov->>'engine_verified')::boolean, false) IS NOT TRUE
         OR coalesce(gov->>'engine_db_payload_hash','') <> equipment_hash THEN
        RAISE EXCEPTION 'APPLICATION_POLICY_V1: SKU % engine relationships in equipment payload are not verified', NEW.sku;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM catalog_application_evidence e
        WHERE e.sku = NEW.sku
          AND e.application_kind = 'ENGINE'
          AND e.payload_hash = equipment_hash
          AND e.verified IS TRUE
      ) THEN
        RAISE EXCEPTION 'APPLICATION_POLICY_V1: SKU % has no verified ENGINE evidence for equipment payload %', NEW.sku, equipment_hash;
      END IF;
    END IF;
  END IF;

  IF vehicle_changed THEN
    vehicle_hash := md5(coalesce(NEW.vehicle_applications, '[]'::jsonb)::text);
    IF coalesce((gov->>'vehicle_verified')::boolean, false) IS NOT TRUE
       OR coalesce(gov->>'vehicle_db_payload_hash','') <> vehicle_hash THEN
      RAISE EXCEPTION 'APPLICATION_POLICY_V1: SKU % vehicle payload is not verified', NEW.sku;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM catalog_application_evidence e
      WHERE e.sku = NEW.sku
        AND e.application_kind = 'VEHICLE'
        AND e.payload_hash = vehicle_hash
        AND e.verified IS TRUE
    ) THEN
      RAISE EXCEPTION 'APPLICATION_POLICY_V1: SKU % has no verified VEHICLE evidence for payload %', NEW.sku, vehicle_hash;
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM jsonb_array_elements(coalesce(NEW.vehicle_applications, '[]'::jsonb)) x
      WHERE btrim(coalesce(x->>'engine', x->>'engine_model', x->>'motor', '')) <> ''
    ) INTO vehicle_has_engine;

    IF vehicle_has_engine THEN
      IF coalesce((gov->>'engine_verified')::boolean, false) IS NOT TRUE
         OR coalesce(gov->>'engine_db_payload_hash','') <> vehicle_hash THEN
        RAISE EXCEPTION 'APPLICATION_POLICY_V1: SKU % engine relationships in vehicle payload are not verified', NEW.sku;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM catalog_application_evidence e
        WHERE e.sku = NEW.sku
          AND e.application_kind = 'ENGINE'
          AND e.payload_hash = vehicle_hash
          AND e.verified IS TRUE
      ) THEN
        RAISE EXCEPTION 'APPLICATION_POLICY_V1: SKU % has no verified ENGINE evidence for vehicle payload %', NEW.sku, vehicle_hash;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$fn$;
`;

const TRIGGER_SQL = `
DROP TRIGGER IF EXISTS trg_elimfilters_application_evidence_policy ON elimfilters_catalog;
CREATE TRIGGER trg_elimfilters_application_evidence_policy
BEFORE INSERT OR UPDATE OF equipment_applications, vehicle_applications, duty
ON elimfilters_catalog
FOR EACH ROW
EXECUTE FUNCTION enforce_elimfilters_application_evidence_policy();
`;

async function installApplicationEvidenceGovernance() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(TABLE_SQL);
    await client.query(FUNCTION_SQL);
    await client.query(TRIGGER_SQL);
    const verify = await client.query(`
      SELECT
        EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_elimfilters_application_evidence_policy' AND NOT tgisinternal) AS trigger_exists,
        (SELECT count(*)::int FROM catalog_application_evidence) AS evidence_rows,
        count(*) FILTER (WHERE duty='HEAVY_DUTY' AND jsonb_typeof(coalesce(vehicle_applications,'[]'::jsonb))='array' AND jsonb_array_length(coalesce(vehicle_applications,'[]'::jsonb))>0)::int AS historical_hd_vehicle_rows,
        count(*) FILTER (WHERE duty='LIGHT_DUTY' AND jsonb_typeof(coalesce(equipment_applications,'[]'::jsonb))='array' AND jsonb_array_length(coalesce(equipment_applications,'[]'::jsonb))>0)::int AS historical_ld_equipment_rows
      FROM elimfilters_catalog
    `);
    await client.query('COMMIT');
    return {
      application_policy_version: APPLICATION_POLICY_VERSION,
      ...verify.rows[0],
      historical_rows_mutated: 0,
      future_application_writes: 'VERIFIED_EVIDENCE_LEDGER_REQUIRED',
      engines: 'EXPLICITLY_GOVERNED_INSIDE_EQUIPMENT_OR_VEHICLE_PAYLOADS',
    };
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  installApplicationEvidenceGovernance()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => { console.error(error); process.exit(1); });
}

module.exports = {
  APPLICATION_POLICY_VERSION,
  TABLE_SQL,
  FUNCTION_SQL,
  TRIGGER_SQL,
  installApplicationEvidenceGovernance,
};
