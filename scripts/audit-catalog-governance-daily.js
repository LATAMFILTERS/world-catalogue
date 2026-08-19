'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const DATABASE_URL = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

const EXPECTED_POLICY = '2026-08-19-v3.1';
const EXPECTED_APPLICATION_POLICY = '2026-08-19-app-v1';
const KNOWN_CONTAMINATION_BASELINE = 1344;

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 1 });
  try {
    const { rows } = await pool.query(`
      WITH base AS (
        SELECT
          count(*)::int AS total_rows,
          count(DISTINCT sku)::int AS unique_skus,
          count(*) FILTER (WHERE coalesce(trim(codigo_base),'')='')::int AS missing_codigo_base,
          count(*) FILTER (WHERE duty NOT IN ('HEAVY_DUTY','LIGHT_DUTY') OR duty IS NULL)::int AS invalid_duty,
          count(*) FILTER (WHERE jsonb_typeof(oem_codes) <> 'array')::int AS malformed_oem_codes,
          count(*) FILTER (WHERE jsonb_typeof(competitor_codes) <> 'array')::int AS malformed_competitor_codes,
          count(*) FILTER (WHERE equipment_applications IS NOT NULL AND jsonb_typeof(equipment_applications) <> 'array')::int AS malformed_equipment_applications,
          count(*) FILTER (WHERE vehicle_applications IS NOT NULL AND jsonb_typeof(vehicle_applications) <> 'array')::int AS malformed_vehicle_applications,
          count(*) FILTER (
            WHERE duty='HEAVY_DUTY'
              AND jsonb_typeof(coalesce(vehicle_applications,'[]'::jsonb))='array'
              AND jsonb_array_length(coalesce(vehicle_applications,'[]'::jsonb))>0
          )::int AS hd_vehicle_model_violations,
          count(*) FILTER (
            WHERE duty='LIGHT_DUTY'
              AND jsonb_typeof(coalesce(equipment_applications,'[]'::jsonb))='array'
              AND jsonb_array_length(coalesce(equipment_applications,'[]'::jsonb))>0
          )::int AS ld_equipment_model_violations,
          count(*) FILTER (WHERE enrichment_data->'codigo_base_governance'->>'policy_version' <> $1 OR enrichment_data->'codigo_base_governance'->>'policy_version' IS NULL)::int AS wrong_policy_version,
          count(*) FILTER (
            WHERE jsonb_array_length(coalesce(oem_codes,'[]'::jsonb)) > 100
               OR jsonb_array_length(coalesce(competitor_codes,'[]'::jsonb)) > 100
          )::int AS contamination_flagged,
          count(*) FILTER (
            WHERE enrichment_data->'application_governance'->>'evidence_recorded'='true'
              AND enrichment_data->'application_governance'->>'policy_version' IS DISTINCT FROM $2
          )::int AS wrong_application_policy_version
        FROM elimfilters_catalog
      ), trig AS (
        SELECT
          count(*) FILTER (WHERE tgname='trg_elimfilters_codigo_base_policy' AND NOT tgisinternal)::int AS codigo_trigger_count,
          count(*) FILTER (WHERE tgname='trg_elimfilters_application_evidence_policy' AND NOT tgisinternal)::int AS application_trigger_count
        FROM pg_trigger
      ), sanitation AS (
        SELECT
          count(*) FILTER (WHERE status='RESOLVED')::int AS resolved_rows,
          count(*) FILTER (WHERE status='PENDING')::int AS pending_rows
        FROM catalog_codigo_base_sanitation_queue
      ), app_evidence AS (
        SELECT
          count(*)::int AS application_evidence_rows,
          count(*) FILTER (WHERE verified IS TRUE)::int AS verified_application_evidence_rows,
          count(*) FILTER (WHERE verified IS NOT TRUE)::int AS unverified_application_evidence_rows
        FROM catalog_application_evidence
      )
      SELECT base.*, trig.*, sanitation.*, app_evidence.*
      FROM base, trig, sanitation, app_evidence
    `, [EXPECTED_POLICY, EXPECTED_APPLICATION_POLICY]);

    const report = rows[0];
    const failures = [];
    if (report.total_rows !== report.unique_skus) failures.push('DUPLICATE_SKU');
    if (report.missing_codigo_base !== 0) failures.push('MISSING_CODIGO_BASE');
    if (report.invalid_duty !== 0) failures.push('INVALID_DUTY');
    if (report.malformed_oem_codes !== 0) failures.push('MALFORMED_OEM_CODES');
    if (report.malformed_competitor_codes !== 0) failures.push('MALFORMED_COMPETITOR_CODES');
    if (report.malformed_equipment_applications !== 0) failures.push('MALFORMED_EQUIPMENT_APPLICATIONS');
    if (report.malformed_vehicle_applications !== 0) failures.push('MALFORMED_VEHICLE_APPLICATIONS');
    if (report.hd_vehicle_model_violations !== 0) failures.push('HD_VEHICLE_APPLICATION_MODEL_VIOLATION');
    if (report.ld_equipment_model_violations !== 0) failures.push('LD_EQUIPMENT_APPLICATION_MODEL_VIOLATION');
    if (report.wrong_policy_version !== 0) failures.push('WRONG_POLICY_VERSION');
    if (report.wrong_application_policy_version !== 0) failures.push('WRONG_APPLICATION_POLICY_VERSION');
    if (report.codigo_trigger_count !== 1) failures.push('GOVERNANCE_TRIGGER_MISSING_OR_DUPLICATED');
    if (report.application_trigger_count !== 1) failures.push('APPLICATION_TRIGGER_MISSING_OR_DUPLICATED');
    if (report.contamination_flagged > KNOWN_CONTAMINATION_BASELINE) failures.push('REFERENCE_CONTAMINATION_INCREASED');
    if (report.unverified_application_evidence_rows !== 0) failures.push('UNVERIFIED_APPLICATION_EVIDENCE_ROWS');

    const output = {
      audit: 'CATALOG_GOVERNANCE_DAILY_V2',
      expected_policy: EXPECTED_POLICY,
      expected_application_policy: EXPECTED_APPLICATION_POLICY,
      known_contamination_baseline: KNOWN_CONTAMINATION_BASELINE,
      ...report,
      status: failures.length ? 'FAIL' : 'PASS',
      failures,
      mutation_count: 0,
    };
    console.log(JSON.stringify(output));
    if (failures.length) process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[catalog-governance-daily] failed', error);
  process.exit(1);
});
