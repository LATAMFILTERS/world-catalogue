'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const DRY_RUN = !process.argv.includes('--apply');

const POLICY = {
  corrugated_board_gsm: Number(process.env.HD_CORRUGATED_BOARD_GSM || 650),
  shrink_wrap_weight_kg: Number(process.env.HD_SHRINK_WRAP_WEIGHT_KG || 0.05),
  packing_allowance_weight_kg: Number(process.env.HD_PACKING_ALLOWANCE_WEIGHT_KG || 0.10),
};

const TARGET_SKUS = [
  'ED41413',
  'ED43571',
  'ED44764',
];

function round(value, decimals = 3) {
  const factor = 10 ** decimals;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
}

function cartonSurfaceAreaM2(lengthCm, widthCm, heightCm) {
  const l = Number(lengthCm) / 100;
  const w = Number(widthCm) / 100;
  const h = Number(heightCm) / 100;
  return 2 * ((l * w) + (l * h) + (w * h));
}

(async () => {
  const pool = new Pool({
    connectionString: process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await pool.query('BEGIN');

    const result = await pool.query(`
      SELECT
        sku,
        codigo_base,
        duty,
        filter_type,
        technology,
        units_per_case,
        master_carton_length_cm,
        master_carton_width_cm,
        master_carton_height_cm,
        master_carton_net_weight_kg,
        master_carton_gross_weight_kg,
        master_carton_volume_m3,
        packaging_source,
        packaging_validation_status,
        packaging_notes
      FROM elimfilters_catalog
      WHERE sku = ANY($1::text[])
      ORDER BY sku
      FOR UPDATE
    `, [TARGET_SKUS]);

    if (result.rowCount !== TARGET_SKUS.length) {
      throw new Error(`Expected ${TARGET_SKUS.length} target rows, found ${result.rowCount}`);
    }

    const report = [];
    let updatedRows = 0;

    for (const row of result.rows) {
      if (row.duty !== 'HEAVY_DUTY') {
        throw new Error(`${row.sku}: expected duty HEAVY_DUTY, found ${row.duty}`);
      }
      if (row.filter_type !== 'air_dryer') {
        throw new Error(`${row.sku}: expected filter_type air_dryer, found ${row.filter_type}`);
      }
      if (row.technology !== 'DRYCORE™') {
        throw new Error(`${row.sku}: expected technology DRYCORE™, found ${row.technology}`);
      }
      if (Number(row.units_per_case) !== 6) {
        throw new Error(`${row.sku}: expected units_per_case=6, found ${row.units_per_case}`);
      }

      const required = [
        'master_carton_length_cm',
        'master_carton_width_cm',
        'master_carton_height_cm',
        'master_carton_net_weight_kg',
        'master_carton_volume_m3',
      ];

      for (const field of required) {
        const value = Number(row[field]);
        if (!Number.isFinite(value) || value <= 0) {
          throw new Error(`${row.sku}: missing/invalid ${field}`);
        }
      }

      const surfaceAreaM2 = cartonSurfaceAreaM2(
        row.master_carton_length_cm,
        row.master_carton_width_cm,
        row.master_carton_height_cm
      );

      const cartonBoardWeightKg = (surfaceAreaM2 * POLICY.corrugated_board_gsm) / 1000;
      const packagingTareKg =
        cartonBoardWeightKg +
        POLICY.shrink_wrap_weight_kg +
        POLICY.packing_allowance_weight_kg;

      const grossWeightKg = Number(row.master_carton_net_weight_kg) + packagingTareKg;

      const values = {
        sku: row.sku,
        codigo_base: row.codigo_base,
        units_per_case: Number(row.units_per_case),
        master_carton_dimensions_cm: [
          Number(row.master_carton_length_cm),
          Number(row.master_carton_width_cm),
          Number(row.master_carton_height_cm),
        ],
        master_carton_volume_m3: Number(row.master_carton_volume_m3),
        master_carton_net_weight_kg: Number(row.master_carton_net_weight_kg),
        carton_surface_area_m2: round(surfaceAreaM2, 6),
        corrugated_board_gsm: POLICY.corrugated_board_gsm,
        estimated_carton_board_weight_kg: round(cartonBoardWeightKg, 3),
        shrink_wrap_weight_kg: round(POLICY.shrink_wrap_weight_kg, 3),
        packing_allowance_weight_kg: round(POLICY.packing_allowance_weight_kg, 3),
        estimated_packaging_tare_kg: round(packagingTareKg, 3),
        master_carton_gross_weight_before_kg:
          row.master_carton_gross_weight_kg == null
            ? null
            : Number(row.master_carton_gross_weight_kg),
        master_carton_gross_weight_after_kg: round(grossWeightKg, 3),
      };

      report.push(values);

      if (!DRY_RUN) {
        const note = [
          'ELIMFILTERS derived master carton gross-weight calculation',
          `corrugated_board_gsm=${POLICY.corrugated_board_gsm}`,
          `carton_surface_area_m2=${round(surfaceAreaM2, 6)}`,
          `estimated_carton_board_weight_kg=${round(cartonBoardWeightKg, 3)}`,
          `shrink_wrap_weight_kg=${round(POLICY.shrink_wrap_weight_kg, 3)}`,
          `packing_allowance_weight_kg=${round(POLICY.packing_allowance_weight_kg, 3)}`,
          `estimated_packaging_tare_kg=${round(packagingTareKg, 3)}`,
          'factory confirmation required before production release',
        ].join('; ');

        const update = await pool.query(`
          UPDATE elimfilters_catalog
          SET
            master_carton_gross_weight_kg = $1,
            packaging_source = 'DERIVED_CALCULATION',
            packaging_validation_status = 'CALCULATED_PENDING_FACTORY_CONFIRMATION',
            packaging_notes = CASE
              WHEN COALESCE(packaging_notes, '') = '' THEN $2
              WHEN packaging_notes LIKE '%' || $2 || '%' THEN packaging_notes
              ELSE packaging_notes || ' | ' || $2
            END
          WHERE sku = $3
        `, [
          round(grossWeightKg, 3),
          note,
          row.sku,
        ]);

        updatedRows += update.rowCount;
      }
    }

    console.log(JSON.stringify({
      migration: '106_AIR_DRYER_MASTER_CARTON_GROSS_WEIGHT',
      dry_run: DRY_RUN,
      policy: POLICY,
      rows: report,
      updated_rows: updatedRows,
    }, null, 2));

    if (DRY_RUN) await pool.query('ROLLBACK');
    else await pool.query('COMMIT');
  } catch (error) {
    await pool.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await pool.end();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
