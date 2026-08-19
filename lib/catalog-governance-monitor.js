'use strict';

const { Pool } = require('pg');

const EXPECTED_POLICY = '2026-08-19-v3.1';
const KNOWN_CONTAMINATION_BASELINE = 1344;

async function auditCatalogGovernance({ databaseUrl } = {}) {
  const url = databaseUrl || process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false }, max: 1 });
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
          count(*) FILTER (WHERE enrichment_data->'codigo_base_governance'->>'policy_version' <> $1 OR enrichment_data->'codigo_base_governance'->>'policy_version' IS NULL)::int AS wrong_policy_version,
          count(*) FILTER (
            WHERE jsonb_array_length(coalesce(oem_codes,'[]'::jsonb)) > 100
               OR jsonb_array_length(coalesce(competitor_codes,'[]'::jsonb)) > 100
          )::int AS contamination_flagged
        FROM elimfilters_catalog
      ), trig AS (
        SELECT count(*)::int AS trigger_count
        FROM pg_trigger
        WHERE tgname='trg_elimfilters_codigo_base_policy' AND NOT tgisinternal
      ), queue AS (
        SELECT
          count(*) FILTER (WHERE status='RESOLVED')::int AS resolved_rows,
          count(*) FILTER (WHERE status='PENDING')::int AS pending_rows
        FROM catalog_codigo_base_sanitation_queue
      ), evidence AS (
        SELECT count(*)::int AS evidence_rows FROM catalog_codigo_base_evidence
      )
      SELECT base.*, trig.trigger_count, queue.resolved_rows, queue.pending_rows, evidence.evidence_rows
      FROM base, trig, queue, evidence
    `, [EXPECTED_POLICY]);

    const report = rows[0];
    const failures = [];
    if (report.total_rows !== report.unique_skus) failures.push('DUPLICATE_SKU');
    if (report.missing_codigo_base !== 0) failures.push('MISSING_CODIGO_BASE');
    if (report.invalid_duty !== 0) failures.push('INVALID_DUTY');
    if (report.malformed_oem_codes !== 0) failures.push('MALFORMED_OEM_CODES');
    if (report.malformed_competitor_codes !== 0) failures.push('MALFORMED_COMPETITOR_CODES');
    if (report.wrong_policy_version !== 0) failures.push('WRONG_POLICY_VERSION');
    if (report.trigger_count !== 1) failures.push('GOVERNANCE_TRIGGER_MISSING_OR_DUPLICATED');
    if (report.contamination_flagged > KNOWN_CONTAMINATION_BASELINE) failures.push('REFERENCE_CONTAMINATION_INCREASED');

    return {
      audit: 'CATALOG_GOVERNANCE_DAILY_V1',
      expected_policy: EXPECTED_POLICY,
      known_contamination_baseline: KNOWN_CONTAMINATION_BASELINE,
      ...report,
      status: failures.length ? 'FAIL' : 'PASS',
      failures,
      mutation_count: 0,
    };
  } finally {
    await pool.end();
  }
}

async function runAndLogCatalogGovernanceAudit() {
  const report = await auditCatalogGovernance();
  const prefix = report.status === 'PASS' ? '[catalog-governance-monitor]' : '[catalog-governance-monitor][ALERT]';
  console.log(prefix, JSON.stringify(report));
  return report;
}

module.exports = { auditCatalogGovernance, runAndLogCatalogGovernanceAudit, EXPECTED_POLICY, KNOWN_CONTAMINATION_BASELINE };
