'use strict';

const { Pool } = require('pg');
const { classifyReferenceFamily, isPartNumberLike } = require('./reference-family-audit-policy');

const SQL = `
WITH refs AS (
  SELECT
    c.sku,
    c.codigo_base,
    c.duty,
    c.filter_type,
    c.thread_size,
    c.height_mm,
    c.outer_diameter_mm,
    coalesce(c.enrichment_data->'codigo_base_governance'->>'state','MISSING') AS governance_state,
    upper(regexp_replace(
      coalesce(x->>'code', x->>'reference', x->>'part_number', x->>'partNumber', x->>'partno', x->>'oem_code', x->>'oemCode', x->>'cross_reference', x->>'crossReference', ''),
      '[^A-Z0-9]', '', 'g'
    )) AS reference
  FROM elimfilters_catalog c
  CROSS JOIN LATERAL jsonb_array_elements(
    (CASE WHEN jsonb_typeof(c.oem_codes) = 'array' THEN c.oem_codes ELSE '[]'::jsonb END)
    ||
    (CASE WHEN jsonb_typeof(c.competitor_codes) = 'array' THEN c.competitor_codes ELSE '[]'::jsonb END)
  ) x
), families AS (
  SELECT
    reference,
    count(DISTINCT sku)::int AS sku_count,
    array_agg(DISTINCT sku ORDER BY sku) AS skus,
    array_agg(DISTINCT codigo_base ORDER BY codigo_base) FILTER (WHERE codigo_base IS NOT NULL) AS codigo_bases,
    array_agg(DISTINCT duty ORDER BY duty) FILTER (WHERE duty IS NOT NULL) AS duties,
    array_agg(DISTINCT filter_type ORDER BY filter_type) FILTER (WHERE filter_type IS NOT NULL) AS filter_types,
    array_agg(DISTINCT thread_size ORDER BY thread_size) FILTER (WHERE thread_size IS NOT NULL AND thread_size <> '') AS thread_sizes,
    array_agg(DISTINCT governance_state ORDER BY governance_state) AS governance_states,
    min(height_mm) FILTER (WHERE height_mm > 0) AS min_height_mm,
    max(height_mm) FILTER (WHERE height_mm > 0) AS max_height_mm,
    min(outer_diameter_mm) FILTER (WHERE outer_diameter_mm > 0) AS min_outer_diameter_mm,
    max(outer_diameter_mm) FILTER (WHERE outer_diameter_mm > 0) AS max_outer_diameter_mm
  FROM refs
  WHERE reference <> ''
  GROUP BY reference
  HAVING count(DISTINCT sku) > 1
)
SELECT * FROM families ORDER BY sku_count DESC, reference ASC;
`;

function summarize(rows) {
  const metadataContamination = rows.filter(row => !isPartNumberLike(row.reference));
  const audited = rows
    .filter(row => isPartNumberLike(row.reference))
    .map(row => ({ ...row, ...classifyReferenceFamily(row) }));

  const severity = { HIGH: 0, MEDIUM: 0, REVIEW: 0, LOW: 0 };
  const flags = {};
  for (const row of audited) {
    severity[row.severity] = (severity[row.severity] || 0) + 1;
    for (const flag of row.flags) flags[flag] = (flags[flag] || 0) + 1;
  }

  const highRiskSample = audited
    .filter(row => row.severity === 'HIGH')
    .slice(0, 25)
    .map(row => ({
      reference: row.reference,
      sku_count: row.sku_count,
      skus: row.skus,
      codigo_bases: row.codigo_bases,
      duties: row.duties,
      filter_types: row.filter_types,
      thread_sizes: row.thread_sizes,
      governance_states: row.governance_states,
      flags: row.flags
    }));

  return {
    audit: 'CATALOG_REFERENCE_FAMILY_GOVERNANCE_V2',
    mode: 'READ_ONLY',
    all_shared_tokens: rows.length,
    metadata_contamination_tokens: metadataContamination.length,
    ambiguous_part_number_families: audited.length,
    severity,
    flags,
    high_risk_sample: highRiskSample,
    mutation_count: 0
  };
}

async function runStartupReferenceAudit() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn('[reference-family-audit-v2] skipped: database URL missing');
    return null;
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 1,
    statement_timeout: 60000
  });

  try {
    const { rows } = await pool.query(SQL);
    const report = summarize(rows);
    console.log('[reference-family-audit-v2] ' + JSON.stringify(report));
    return report;
  } finally {
    await pool.end();
  }
}

module.exports = { SQL, summarize, runStartupReferenceAudit };
