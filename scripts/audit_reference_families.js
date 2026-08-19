'use strict';

require('dotenv').config();
const { Pool } = require('pg');
const { classifyReferenceFamily } = require('../lib/reference-family-audit-policy');

const DATABASE_URL = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

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

async function main() {
  const { rows } = await pool.query(SQL);
  const audited = rows.map(row => ({ ...row, ...classifyReferenceFamily(row) }));
  const high = audited.filter(row => row.severity === 'HIGH');
  const medium = audited.filter(row => row.severity === 'MEDIUM');
  const review = audited.filter(row => row.severity === 'REVIEW');
  const low = audited.filter(row => row.severity === 'LOW');

  const flagCounts = {};
  for (const row of audited) {
    for (const flag of row.flags) flagCounts[flag] = (flagCounts[flag] || 0) + 1;
  }

  console.log(JSON.stringify({
    audit: 'CATALOG_REFERENCE_FAMILY_GOVERNANCE',
    mode: 'READ_ONLY',
    ambiguous_reference_families: audited.length,
    severity: { HIGH: high.length, MEDIUM: medium.length, REVIEW: review.length, LOW: low.length },
    flags: flagCounts,
    high_risk_sample: high.slice(0, 100).map(row => ({
      reference: row.reference,
      sku_count: row.sku_count,
      skus: row.skus,
      codigo_bases: row.codigo_bases,
      duties: row.duties,
      filter_types: row.filter_types,
      thread_sizes: row.thread_sizes,
      governance_states: row.governance_states,
      flags: row.flags
    })),
    mutation_count: 0
  }, null, 2));
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
