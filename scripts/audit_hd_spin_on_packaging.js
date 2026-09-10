'use strict';

require('dotenv').config();
const { Pool } = require('pg');
const {
  policyFromEnv,
  selectCase,
  requiredPackagingFields,
  isProtectedPackaging,
} = require('./lib/hd_packaging_policy');

const POLICY = policyFromEnv();

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function looksSpinOn(row) {
  const haystack = [
    row.style,
    row.filter_style,
    row.product_style,
    row.form_factor,
    row.packaging_type,
    row.description,
    row.product_name,
  ].filter(Boolean).map(normalize).join(' | ');

  if (/spin[- ]?on/.test(haystack)) return true;

  const family = normalize(row.filter_type);
  const knownSpinOnFamilies = new Set([
    'oil', 'oil_filter', 'lube', 'lube_filter',
    'fuel', 'fuel_filter', 'fuel_water_separator', 'separator',
    'coolant', 'coolant_filter',
    'hydraulic', 'hydraulic_filter',
    'air_dryer',
  ]);

  const hasThread = [row.thread_size, row.thread, row.thread_spec].some((v) => String(v || '').trim());
  return knownSpinOnFamilies.has(family) && hasThread;
}

(async () => {
  const pool = new Pool({
    connectionString: process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const columnsResult = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'elimfilters_catalog'
    `);
    const columns = new Set(columnsResult.rows.map((r) => r.column_name));

    const optional = [
      'style','filter_style','product_style','form_factor','description','product_name',
      'thread_size','thread','thread_spec'
    ].filter((name) => columns.has(name));

    const selectColumns = [
      'sku','codigo_base','duty','filter_type','technology',
      'unit_packaged_length_cm','unit_packaged_width_cm','unit_packaged_height_cm',
      'unit_packaged_weight_kg','unit_packaged_volume_m3','units_per_case',
      'master_carton_length_cm','master_carton_width_cm','master_carton_height_cm',
      'master_carton_net_weight_kg','master_carton_gross_weight_kg','master_carton_volume_m3',
      'packaging_type','packaging_source','packaging_validation_status','packaging_notes',
      ...optional,
    ].filter((name) => columns.has(name));

    const result = await pool.query(`
      SELECT ${selectColumns.map((c) => `"${c}"`).join(', ')}
      FROM elimfilters_catalog
      WHERE duty = 'HEAVY_DUTY'
      ORDER BY filter_type NULLS LAST, sku
    `);

    const report = {
      policy: POLICY,
      total_heavy_duty_rows: result.rowCount,
      spin_on_candidates: 0,
      protected: [],
      eligible: [],
      incomplete: [],
      no_valid_case: [],
      excluded_not_spin_on: [],
    };

    for (const row of result.rows) {
      if (!looksSpinOn(row)) {
        report.excluded_not_spin_on.push({ sku: row.sku, filter_type: row.filter_type });
        continue;
      }

      report.spin_on_candidates += 1;

      if (isProtectedPackaging(row)) {
        report.protected.push({
          sku: row.sku,
          filter_type: row.filter_type,
          packaging_source: row.packaging_source,
          validation_status: row.packaging_validation_status,
        });
        continue;
      }

      const missing = requiredPackagingFields(row);
      if (missing.length) {
        report.incomplete.push({
          sku: row.sku,
          filter_type: row.filter_type,
          missing,
        });
        continue;
      }

      const calculation = selectCase(row, POLICY);
      if (!calculation.selected) {
        report.no_valid_case.push({
          sku: row.sku,
          filter_type: row.filter_type,
          reason: calculation.reason,
          evaluations: calculation.evaluations,
        });
        continue;
      }

      const selected = calculation.selected;
      report.eligible.push({
        sku: row.sku,
        codigo_base: row.codigo_base,
        filter_type: row.filter_type,
        technology: row.technology,
        packaging_source_before: row.packaging_source,
        validation_status_before: row.packaging_validation_status,
        units_per_case_before: row.units_per_case,
        units_per_case_proposed: selected.qty,
        unit_packaged_dimensions_cm: [
          Number(row.unit_packaged_length_cm),
          Number(row.unit_packaged_width_cm),
          Number(row.unit_packaged_height_cm),
        ],
        unit_packaged_weight_kg: Number(row.unit_packaged_weight_kg),
        master_carton_proposed: selected.selected_arrangement,
        master_carton_net_weight_kg_proposed: selected.estimated_net_weight_kg,
      });
    }

    report.summary = {
      total_heavy_duty_rows: report.total_heavy_duty_rows,
      spin_on_candidates: report.spin_on_candidates,
      eligible: report.eligible.length,
      protected: report.protected.length,
      incomplete: report.incomplete.length,
      no_valid_case: report.no_valid_case.length,
      excluded_not_spin_on: report.excluded_not_spin_on.length,
    };

    console.log(JSON.stringify(report, null, 2));
  } finally {
    await pool.end();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
