'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const DATABASE_URL = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

function sslForDatabaseUrl(connectionString) {
  const parsed = new URL(connectionString);
  return parsed.searchParams.get('sslmode') === 'disable'
    ? false
    : { rejectUnauthorized: false };
}

const EXPECTED_POLICY = '2026-08-19-v3.1';
const EXPECTED_APPLICATION_POLICY = '2026-08-19-app-v1';
const KNOWN_CONTAMINATION_BASELINE = 1344;
const KNOWN_HISTORICAL_LD_EQUIPMENT_BASELINE = 5;
const COMPLETENESS_MODE = process.argv.includes('--completeness');
const EXPECTED_CATALOG_SKUS = 13320;

const fs = require('fs');
const path = require('path');

function loadPublishedSkus() {
  const file = path.resolve(__dirname, '../config/product-pages/live-rows.json');
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  return (parsed.rows || []).map((row) => String(row.sku || '').trim()).filter(Boolean);
}

async function completenessReport(client) {
  const publishedSkus = loadPublishedSkus();

  const { rows: totals } = await client.query(`
    WITH base AS (
      SELECT
        c.sku,
        coalesce(c.oem_codes, '[]'::jsonb) AS oem_codes,
        coalesce(c.competitor_codes, '[]'::jsonb) AS competitor_codes,
        coalesce(c.equipment_applications, '[]'::jsonb) AS equipment_applications,
        coalesce(c.vehicle_applications, '[]'::jsonb) AS vehicle_applications,
        c.duty,
        c.duty_validation_status,

        coalesce(jsonb_array_length(coalesce(c.oem_codes, '[]'::jsonb)), 0) AS oem_n,
        coalesce(jsonb_array_length(coalesce(c.competitor_codes, '[]'::jsonb)), 0) AS competitor_n,
        coalesce(jsonb_array_length(coalesce(c.equipment_applications, '[]'::jsonb)), 0) AS equipment_n,
        coalesce(jsonb_array_length(coalesce(c.vehicle_applications, '[]'::jsonb)), 0) AS vehicle_n,

        NOT EXISTS (
          SELECT 1
          FROM jsonb_array_elements(coalesce(c.oem_codes, '[]'::jsonb)) x
          WHERE upper(coalesce(x->>'classification', '')) <> 'OEM'
             OR upper(coalesce(x->>'classification', '')) = 'REVIEW_REQUIRED'
             OR NOT EXISTS (
               SELECT 1
               FROM exact_part_reference e
               WHERE e.sku = c.sku
                 AND upper(e.reference_type) = 'OEM'
                 AND regexp_replace(upper(coalesce(e.brand,'')), '[^A-Z0-9]', '', 'g') =
                     regexp_replace(upper(coalesce(x->>'manufacturer','')), '[^A-Z0-9]', '', 'g')
                 AND regexp_replace(upper(coalesce(e.part_number,'')), '[^A-Z0-9]', '', 'g') =
                     regexp_replace(upper(coalesce(x->>'code','')), '[^A-Z0-9]', '', 'g')
             )
        ) AS all_oem_verified,

        NOT EXISTS (
          SELECT 1
          FROM jsonb_array_elements(coalesce(c.competitor_codes, '[]'::jsonb)) x
          WHERE upper(coalesce(x->>'classification', '')) NOT IN ('AFTERMARKET','CROSS_REFERENCE')
             OR upper(coalesce(x->>'classification', '')) = 'REVIEW_REQUIRED'
             OR NOT EXISTS (
               SELECT 1
               FROM exact_part_reference e
               WHERE e.sku = c.sku
                 AND upper(e.reference_type) = 'COMPETITOR'
                 AND regexp_replace(upper(coalesce(e.brand,'')), '[^A-Z0-9]', '', 'g') =
                     regexp_replace(upper(coalesce(x->>'manufacturer','')), '[^A-Z0-9]', '', 'g')
                 AND regexp_replace(upper(coalesce(e.part_number,'')), '[^A-Z0-9]', '', 'g') =
                     regexp_replace(upper(coalesce(x->>'code','')), '[^A-Z0-9]', '', 'g')
             )
        ) AS all_competitor_verified,

        CASE
          WHEN jsonb_array_length(coalesce(c.equipment_applications,'[]'::jsonb)) = 0 THEN true
          ELSE EXISTS (
            SELECT 1
            FROM catalog_application_evidence cae
            WHERE cae.sku = c.sku
              AND cae.application_kind = 'EQUIPMENT'
              AND cae.verified IS TRUE
              AND cae.payload_hash = md5(coalesce(c.equipment_applications,'[]'::jsonb)::text)
          )
        END AS equipment_verified,

        CASE
          WHEN jsonb_array_length(coalesce(c.vehicle_applications,'[]'::jsonb)) = 0 THEN true
          ELSE EXISTS (
            SELECT 1
            FROM catalog_application_evidence cae
            WHERE cae.sku = c.sku
              AND cae.application_kind = 'VEHICLE'
              AND cae.verified IS TRUE
              AND cae.payload_hash = md5(coalesce(c.vehicle_applications,'[]'::jsonb)::text)
          )
        END AS vehicle_verified
      FROM public.elimfilters_catalog c
    ), status AS (
      SELECT *,
        CASE
          WHEN oem_n = 0 THEN 'EMPTY'
          WHEN all_oem_verified THEN 'COMPLETE'
          ELSE 'PARTIAL'
        END AS oem_status,
        CASE
          WHEN competitor_n = 0 THEN 'EMPTY'
          WHEN all_competitor_verified THEN 'COMPLETE'
          ELSE 'PARTIAL'
        END AS competitor_status,
        CASE
          WHEN equipment_n + vehicle_n = 0 THEN 'EMPTY'
          WHEN equipment_verified AND vehicle_verified THEN 'COMPLETE'
          ELSE 'PARTIAL'
        END AS applications_status,
        CASE
          WHEN coalesce(btrim(duty),'') = '' THEN 'EMPTY'
          WHEN duty_validation_status = 'VERIFIED' THEN 'COMPLETE'
          ELSE 'PARTIAL'
        END AS duty_status
      FROM base
    )
    SELECT
      count(*)::int AS total_skus,

      count(*) FILTER (WHERE oem_status='COMPLETE')::int AS oem_complete,
      count(*) FILTER (WHERE oem_status='PARTIAL')::int AS oem_partial,
      count(*) FILTER (WHERE oem_status='EMPTY')::int AS oem_empty,

      count(*) FILTER (WHERE competitor_status='COMPLETE')::int AS competitor_complete,
      count(*) FILTER (WHERE competitor_status='PARTIAL')::int AS competitor_partial,
      count(*) FILTER (WHERE competitor_status='EMPTY')::int AS competitor_empty,

      count(*) FILTER (WHERE applications_status='COMPLETE')::int AS applications_complete,
      count(*) FILTER (WHERE applications_status='PARTIAL')::int AS applications_partial,
      count(*) FILTER (WHERE applications_status='EMPTY')::int AS applications_empty,

      count(*) FILTER (WHERE duty_status='COMPLETE')::int AS duty_complete,
      count(*) FILTER (WHERE duty_status='PARTIAL')::int AS duty_partial,
      count(*) FILTER (WHERE duty_status='EMPTY')::int AS duty_empty
    FROM status
  `);

  const { rows: published } = await client.query(`
    WITH base AS (
      SELECT
        c.sku,
        coalesce(c.oem_codes, '[]'::jsonb) AS oem_codes,
        coalesce(c.competitor_codes, '[]'::jsonb) AS competitor_codes,
        coalesce(c.equipment_applications, '[]'::jsonb) AS equipment_applications,
        coalesce(c.vehicle_applications, '[]'::jsonb) AS vehicle_applications,
        c.duty,
        c.duty_validation_status,

        coalesce(jsonb_array_length(coalesce(c.oem_codes, '[]'::jsonb)), 0) AS oem_n,
        coalesce(jsonb_array_length(coalesce(c.competitor_codes, '[]'::jsonb)), 0) AS competitor_n,
        coalesce(jsonb_array_length(coalesce(c.equipment_applications, '[]'::jsonb)), 0) AS equipment_n,
        coalesce(jsonb_array_length(coalesce(c.vehicle_applications, '[]'::jsonb)), 0) AS vehicle_n,

        NOT EXISTS (
          SELECT 1
          FROM jsonb_array_elements(coalesce(c.oem_codes, '[]'::jsonb)) x
          WHERE upper(coalesce(x->>'classification', '')) <> 'OEM'
             OR NOT EXISTS (
               SELECT 1 FROM exact_part_reference e
               WHERE e.sku=c.sku
                 AND upper(e.reference_type)='OEM'
                 AND regexp_replace(upper(coalesce(e.brand,'')), '[^A-Z0-9]', '', 'g') =
                     regexp_replace(upper(coalesce(x->>'manufacturer','')), '[^A-Z0-9]', '', 'g')
                 AND regexp_replace(upper(coalesce(e.part_number,'')), '[^A-Z0-9]', '', 'g') =
                     regexp_replace(upper(coalesce(x->>'code','')), '[^A-Z0-9]', '', 'g')
             )
        ) AS all_oem_verified,

        NOT EXISTS (
          SELECT 1
          FROM jsonb_array_elements(coalesce(c.competitor_codes, '[]'::jsonb)) x
          WHERE upper(coalesce(x->>'classification', '')) NOT IN ('AFTERMARKET','CROSS_REFERENCE')
             OR NOT EXISTS (
               SELECT 1 FROM exact_part_reference e
               WHERE e.sku=c.sku
                 AND upper(e.reference_type)='COMPETITOR'
                 AND regexp_replace(upper(coalesce(e.brand,'')), '[^A-Z0-9]', '', 'g') =
                     regexp_replace(upper(coalesce(x->>'manufacturer','')), '[^A-Z0-9]', '', 'g')
                 AND regexp_replace(upper(coalesce(e.part_number,'')), '[^A-Z0-9]', '', 'g') =
                     regexp_replace(upper(coalesce(x->>'code','')), '[^A-Z0-9]', '', 'g')
             )
        ) AS all_competitor_verified,

        CASE
          WHEN jsonb_array_length(coalesce(c.equipment_applications,'[]'::jsonb)) = 0 THEN true
          ELSE EXISTS (
            SELECT 1 FROM catalog_application_evidence cae
            WHERE cae.sku=c.sku
              AND cae.application_kind='EQUIPMENT'
              AND cae.verified IS TRUE
              AND cae.payload_hash=md5(coalesce(c.equipment_applications,'[]'::jsonb)::text)
          )
        END AS equipment_verified,

        CASE
          WHEN jsonb_array_length(coalesce(c.vehicle_applications,'[]'::jsonb)) = 0 THEN true
          ELSE EXISTS (
            SELECT 1 FROM catalog_application_evidence cae
            WHERE cae.sku=c.sku
              AND cae.application_kind='VEHICLE'
              AND cae.verified IS TRUE
              AND cae.payload_hash=md5(coalesce(c.vehicle_applications,'[]'::jsonb)::text)
          )
        END AS vehicle_verified
      FROM public.elimfilters_catalog c
      WHERE c.sku = ANY($1::text[])
    )
    SELECT
      sku,
      oem_n,
      CASE WHEN oem_n=0 THEN 'EMPTY' WHEN all_oem_verified THEN 'COMPLETE' ELSE 'PARTIAL' END AS oem_status,
      competitor_n,
      CASE WHEN competitor_n=0 THEN 'EMPTY' WHEN all_competitor_verified THEN 'COMPLETE' ELSE 'PARTIAL' END AS competitor_status,
      equipment_n,
      vehicle_n,
      CASE WHEN equipment_n+vehicle_n=0 THEN 'EMPTY'
           WHEN equipment_verified AND vehicle_verified THEN 'COMPLETE'
           ELSE 'PARTIAL' END AS applications_status,
      duty,
      duty_validation_status,
      CASE WHEN coalesce(btrim(duty),'')='' THEN 'EMPTY'
           WHEN duty_validation_status='VERIFIED' THEN 'COMPLETE'
           ELSE 'PARTIAL' END AS duty_status
    FROM base
    ORDER BY array_position($1::text[], sku)
  `, [publishedSkus]);

  const t = totals[0];
  const sumsOk = [
    t.oem_complete + t.oem_partial + t.oem_empty,
    t.competitor_complete + t.competitor_partial + t.competitor_empty,
    t.applications_complete + t.applications_partial + t.applications_empty,
    t.duty_complete + t.duty_partial + t.duty_empty,
  ].every((n) => n === t.total_skus);

  return {
    audit: 'CATALOG_COMPLETENESS_READONLY_V1',
    expected_catalog_skus: EXPECTED_CATALOG_SKUS,
    total_skus: t.total_skus,
    total_matches_expected: t.total_skus === EXPECTED_CATALOG_SKUS,
    family_totals_reconcile: sumsOk,
    families: {
      OEM: { complete: t.oem_complete, partial: t.oem_partial, empty: t.oem_empty },
      COMPETITORS: { complete: t.competitor_complete, partial: t.competitor_partial, empty: t.competitor_empty },
      APPLICATIONS: { complete: t.applications_complete, partial: t.applications_partial, empty: t.applications_empty },
      DUTY: { complete: t.duty_complete, partial: t.duty_partial, empty: t.duty_empty },
    },
    published_skus_expected: publishedSkus.length,
    published_skus_found: published.length,
    published,
    mutation_count: 0,
  };
}

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL, ssl: sslForDatabaseUrl(DATABASE_URL), max: 1 });
  const client = await pool.connect();
  try {
    await client.query('BEGIN TRANSACTION READ ONLY');
    if (COMPLETENESS_MODE) {
      const report = await completenessReport(client);
      console.log(JSON.stringify(report, null, 2));
      if (!report.total_matches_expected || !report.family_totals_reconcile || report.published_skus_found !== report.published_skus_expected) {
        process.exitCode = 1;
      }
      return;
    }

    const { rows } = await client.query(`
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
    if (report.ld_equipment_model_violations > KNOWN_HISTORICAL_LD_EQUIPMENT_BASELINE) failures.push('LD_EQUIPMENT_APPLICATION_MODEL_VIOLATION_INCREASED');
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
      known_historical_ld_equipment_baseline: KNOWN_HISTORICAL_LD_EQUIPMENT_BASELINE,
      ...report,
      status: failures.length ? 'FAIL' : 'PASS',
      failures,
      mutation_count: 0,
    };
    console.log(JSON.stringify(output));
    if (failures.length) process.exitCode = 1;
  } finally {
    try { await client.query('ROLLBACK'); } catch (_) {}
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[catalog-governance-daily] failed', error);
  process.exit(1);
});
