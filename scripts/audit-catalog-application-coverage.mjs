#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import pg from 'pg';

const { Client } = pg;
const connectionString = process.env.DATABASE_URL_READONLY;
const tableName = process.env.ELIMFILTERS_CATALOG_TABLE || 'elimfilters_catalog';
const outputDir = path.join(process.cwd(), 'knowledge', 'generated', 'digital-brain', 'postgresql');

if (!connectionString) {
  console.error('[catalog-coverage-audit] DATABASE_URL_READONLY is required');
  process.exit(2);
}

if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
  throw new Error(`Unsafe table name: ${tableName}`);
}

const client = new Client({
  connectionString,
  ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
  application_name: 'elimfilters-catalog-coverage-readonly-audit',
});

const hasArray = (column) => `jsonb_typeof(row_json->'${column}') = 'array' AND jsonb_array_length(row_json->'${column}') > 0`;
const noArray = (column) => `NOT (${hasArray(column)})`;

try {
  await client.connect();
  await client.query('BEGIN READ ONLY');
  const readonly = await client.query('SHOW transaction_read_only');
  if (readonly.rows?.[0]?.transaction_read_only !== 'on') {
    throw new Error('PostgreSQL transaction is not read-only');
  }

  await client.query("SET LOCAL statement_timeout = '120000'");

  const summarySql = `
    WITH catalog AS (
      SELECT to_jsonb(c) AS row_json
      FROM ${tableName} c
    ), classified AS (
      SELECT
        COALESCE(row_json->>'sku', row_json->>'part_number', row_json->>'code') AS sku,
        UPPER(CONCAT_WS(' ', row_json->>'filter_type', row_json->>'sub_type', row_json->>'technology')) AS product_text,
        (${hasArray('vehicle_applications')}) AS has_vehicle,
        (${hasArray('equipment_applications')}) AS has_equipment,
        (${hasArray('oem_codes')}) AS has_oem,
        (${hasArray('competitor_codes')}) AS has_competitor
      FROM catalog
    )
    SELECT
      COUNT(*)::int AS total_skus,
      COUNT(*) FILTER (WHERE has_vehicle)::int AS with_vehicle_applications,
      COUNT(*) FILTER (WHERE has_equipment)::int AS with_equipment_applications,
      COUNT(*) FILTER (WHERE has_vehicle AND has_equipment)::int AS with_both_application_types,
      COUNT(*) FILTER (WHERE NOT has_vehicle AND NOT has_equipment)::int AS without_any_application,
      COUNT(*) FILTER (
        WHERE (product_text ~ '\\mHYDRAULIC\\M' OR sku LIKE 'EH%')
          AND NOT has_equipment
      )::int AS hydraulic_without_equipment,
      COUNT(*) FILTER (
        WHERE NOT has_vehicle AND NOT has_equipment AND has_oem
      )::int AS oem_without_application,
      COUNT(*) FILTER (
        WHERE NOT has_vehicle AND NOT has_equipment AND has_competitor
      )::int AS competitor_crossref_without_application,
      COUNT(*) FILTER (
        WHERE NOT has_vehicle AND NOT has_equipment AND NOT has_oem AND NOT has_competitor
      )::int AS no_application_no_reference
    FROM classified
  `;

  const summary = (await client.query(summarySql)).rows[0];

  const samplesSql = `
    WITH catalog AS (
      SELECT to_jsonb(c) AS row_json
      FROM ${tableName} c
    ), classified AS (
      SELECT
        COALESCE(row_json->>'sku', row_json->>'part_number', row_json->>'code') AS sku,
        row_json->>'filter_type' AS filter_type,
        row_json->>'sub_type' AS sub_type,
        row_json->>'technology' AS technology,
        UPPER(CONCAT_WS(' ', row_json->>'filter_type', row_json->>'sub_type', row_json->>'technology')) AS product_text,
        (${hasArray('vehicle_applications')}) AS has_vehicle,
        (${hasArray('equipment_applications')}) AS has_equipment,
        (${hasArray('oem_codes')}) AS has_oem,
        (${hasArray('competitor_codes')}) AS has_competitor
      FROM catalog
    )
    SELECT sku, filter_type, sub_type, technology, has_oem, has_competitor,
      CASE
        WHEN (product_text ~ '\\mHYDRAULIC\\M' OR sku LIKE 'EH%') AND NOT has_equipment THEN 'hydraulic_without_equipment'
        WHEN NOT has_vehicle AND NOT has_equipment AND has_oem THEN 'oem_without_application'
        WHEN NOT has_vehicle AND NOT has_equipment AND has_competitor THEN 'competitor_crossref_without_application'
        WHEN NOT has_vehicle AND NOT has_equipment THEN 'no_application_no_reference'
        ELSE 'other'
      END AS audit_reason
    FROM classified
    WHERE NOT has_vehicle AND NOT has_equipment
    ORDER BY
      CASE WHEN (product_text ~ '\\mHYDRAULIC\\M' OR sku LIKE 'EH%') THEN 0 ELSE 1 END,
      sku
    LIMIT 500
  `;

  const samples = (await client.query(samplesSql)).rows;

  const report = {
    schema_version: '1.0.0',
    generated_at: new Date().toISOString(),
    read_only_verified: true,
    source_table: tableName,
    definitions: {
      application_present: 'JSON array exists and contains at least one element',
      hydraulic_without_equipment: 'Hydraulic classification or EH SKU prefix with no equipment_applications',
      note: 'Absence of an application does not prove obsolete, OEM-only, licensed, or discontinued status.',
    },
    summary,
    sample_review_queue: samples,
  };

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'catalog-application-coverage-audit.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
  fs.writeFileSync(
    path.join(outputDir, 'CATALOG_APPLICATION_COVERAGE_AUDIT.md'),
    `# Catalogue Application Coverage Audit\n\nGenerated: ${report.generated_at}\n\n` +
    Object.entries(summary).map(([key, value]) => `- **${key}:** ${value}`).join('\n') +
    `\n\n## Interpretation\n\nMissing applications are review cases, not proof that a product is obsolete, OEM-only, licensed, or discontinued.\n`,
    'utf8',
  );

  await client.query('ROLLBACK');
  console.log('[catalog-coverage-audit] completed:', JSON.stringify(summary));
} catch (error) {
  try { await client.query('ROLLBACK'); } catch {}
  console.error('[catalog-coverage-audit]', error.stack || error.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
