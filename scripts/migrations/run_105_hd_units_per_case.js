'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const DRY_RUN = !process.argv.includes('--apply');

const POLICY = {
  allowed_case_qty: [24, 12, 6],
  max_case_net_weight_kg: Number(process.env.HD_MAX_CASE_NET_WEIGHT_KG || 20),
  max_case_length_cm: Number(process.env.HD_MAX_CASE_LENGTH_CM || 60),
  max_case_width_cm: Number(process.env.HD_MAX_CASE_WIDTH_CM || 50),
  max_case_height_cm: Number(process.env.HD_MAX_CASE_HEIGHT_CM || 40),
  max_case_volume_m3: Number(process.env.HD_MAX_CASE_VOLUME_M3 || 0.06),
  carton_allowance_cm: Number(process.env.HD_CARTON_ALLOWANCE_CM || 1.5),
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

function permutations(values) {
  const out = new Map();

  function visit(prefix, remaining) {
    if (!remaining.length) {
      const key = prefix.join('|');
      if (!out.has(key)) out.set(key, prefix);
      return;
    }

    for (let i = 0; i < remaining.length; i++) {
      visit(
        [...prefix, remaining[i]],
        [...remaining.slice(0, i), ...remaining.slice(i + 1)]
      );
    }
  }

  visit([], values);
  return [...out.values()];
}

function factorTriples(qty) {
  const triples = [];
  for (let x = 1; x <= qty; x++) {
    if (qty % x !== 0) continue;
    const yz = qty / x;
    for (let y = 1; y <= yz; y++) {
      if (yz % y !== 0) continue;
      const z = yz / y;
      triples.push([x, y, z]);
    }
  }
  return triples;
}

function canonicalBoxDimensions(rawDims) {
  const sorted = [...rawDims].sort((a, b) => b - a);
  return {
    length_cm: sorted[0],
    width_cm: sorted[1],
    height_cm: sorted[2],
  };
}

function boxVolumeM3(box) {
  return (box.length_cm * box.width_cm * box.height_cm) / 1e6;
}

function dimensionsWithinPolicy(box) {
  return (
    box.length_cm <= POLICY.max_case_length_cm &&
    box.width_cm <= POLICY.max_case_width_cm &&
    box.height_cm <= POLICY.max_case_height_cm
  );
}

function bestArrangement(unitDims, qty) {
  const orientations = permutations(unitDims);
  const grids = factorTriples(qty);
  const candidates = [];

  for (const orientation of orientations) {
    for (const grid of grids) {
      const raw = [
        orientation[0] * grid[0] + POLICY.carton_allowance_cm,
        orientation[1] * grid[1] + POLICY.carton_allowance_cm,
        orientation[2] * grid[2] + POLICY.carton_allowance_cm,
      ];

      const box = canonicalBoxDimensions(raw);
      const volume = boxVolumeM3(box);

      candidates.push({
        orientation_cm: orientation,
        grid,
        box,
        volume_m3: volume,
        dimensions_ok: dimensionsWithinPolicy(box),
        volume_ok: volume <= POLICY.max_case_volume_m3,
      });
    }
  }

  const valid = candidates
    .filter((x) => x.dimensions_ok && x.volume_ok)
    .sort((a, b) => {
      if (a.volume_m3 !== b.volume_m3) return a.volume_m3 - b.volume_m3;
      if (a.box.length_cm !== b.box.length_cm) return a.box.length_cm - b.box.length_cm;
      if (a.box.width_cm !== b.box.width_cm) return a.box.width_cm - b.box.width_cm;
      return a.box.height_cm - b.box.height_cm;
    });

  return {
    best: valid[0] || null,
    candidates_checked: candidates.length,
    valid_candidates: valid.length,
  };
}

function evaluateQuantity(row, qty) {
  const unitWeightKg = Number(row.unit_packaged_weight_kg);
  const unitLengthCm = Number(row.unit_packaged_length_cm);
  const unitWidthCm = Number(row.unit_packaged_width_cm);
  const unitHeightCm = Number(row.unit_packaged_height_cm);

  const netWeightKg = unitWeightKg * qty;
  const weightOk = netWeightKg <= POLICY.max_case_net_weight_kg;

  const arrangement = bestArrangement(
    [unitLengthCm, unitWidthCm, unitHeightCm],
    qty
  );

  const accepted = Boolean(weightOk && arrangement.best);

  return {
    qty,
    accepted,
    weight_ok: weightOk,
    estimated_net_weight_kg: round(netWeightKg, 3),
    arrangement_found: Boolean(arrangement.best),
    arrangements_checked: arrangement.candidates_checked,
    valid_arrangements: arrangement.valid_candidates,
    selected_arrangement: arrangement.best
      ? {
          unit_orientation_cm: arrangement.best.orientation_cm.map((v) => round(v, 3)),
          grid: arrangement.best.grid,
          master_carton_length_cm: round(arrangement.best.box.length_cm, 3),
          master_carton_width_cm: round(arrangement.best.box.width_cm, 3),
          master_carton_height_cm: round(arrangement.best.box.height_cm, 3),
          master_carton_volume_m3: round(arrangement.best.volume_m3, 6),
        }
      : null,
  };
}

function selectCase(row) {
  const required = [
    'unit_packaged_weight_kg',
    'unit_packaged_length_cm',
    'unit_packaged_width_cm',
    'unit_packaged_height_cm',
  ];

  const missing = required.filter((field) => {
    const value = Number(row[field]);
    return !Number.isFinite(value) || value <= 0;
  });

  if (missing.length) {
    return {
      selected: null,
      evaluations: [],
      reason: `Missing/invalid fields: ${missing.join(', ')}`,
    };
  }

  const evaluations = POLICY.allowed_case_qty.map((qty) => evaluateQuantity(row, qty));
  const selected = evaluations.find((x) => x.accepted) || null;

  return {
    selected,
    evaluations,
    reason: selected ? null : 'No allowed quantity satisfies weight + dimension + volume policy',
  };
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
        unit_packaged_length_cm,
        unit_packaged_width_cm,
        unit_packaged_height_cm,
        unit_packaged_weight_kg,
        unit_packaged_volume_m3,
        units_per_case,
        master_carton_length_cm,
        master_carton_width_cm,
        master_carton_height_cm,
        master_carton_net_weight_kg,
        master_carton_gross_weight_kg,
        master_carton_volume_m3,
        packaging_type,
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

      const calculation = selectCase(row);
      if (!calculation.selected) {
        throw new Error(`${row.sku}: ${calculation.reason}`);
      }

      const selected = calculation.selected;
      const box = selected.selected_arrangement;

      report.push({
        sku: row.sku,
        codigo_base: row.codigo_base,
        unit_dimensions_cm: [
          Number(row.unit_packaged_length_cm),
          Number(row.unit_packaged_width_cm),
          Number(row.unit_packaged_height_cm),
        ],
        unit_weight_kg: Number(row.unit_packaged_weight_kg),
        unit_packaged_volume_m3: Number(row.unit_packaged_volume_m3),
        units_per_case_before: row.units_per_case,
        units_per_case_after: selected.qty,
        master_carton_length_cm: box.master_carton_length_cm,
        master_carton_width_cm: box.master_carton_width_cm,
        master_carton_height_cm: box.master_carton_height_cm,
        master_carton_net_weight_kg: selected.estimated_net_weight_kg,
        master_carton_volume_m3: box.master_carton_volume_m3,
        selected_grid: box.grid,
        selected_unit_orientation_cm: box.unit_orientation_cm,
        candidate_evaluations: calculation.evaluations,
      });

      if (!DRY_RUN) {
        const policyNote = [
          'ELIMFILTERS HD case calculation',
          `allowed_qty=${POLICY.allowed_case_qty.join('/')}`,
          `max_net_weight_kg=${POLICY.max_case_net_weight_kg}`,
          `max_box_cm=${POLICY.max_case_length_cm}x${POLICY.max_case_width_cm}x${POLICY.max_case_height_cm}`,
          `max_volume_m3=${POLICY.max_case_volume_m3}`,
          `carton_allowance_cm=${POLICY.carton_allowance_cm}`,
          `selected_grid=${box.grid.join('x')}`,
          'factory confirmation required before production release',
        ].join('; ');

        const update = await pool.query(`
          UPDATE elimfilters_catalog
          SET
            units_per_case = $1,
            master_carton_length_cm = $2,
            master_carton_width_cm = $3,
            master_carton_height_cm = $4,
            master_carton_net_weight_kg = $5,
            master_carton_volume_m3 = $6,
            packaging_type = 'HD_SHRINK_WRAPPED_MASTER_CARTON',
            packaging_source = 'ELIMFILTERS_INTERNAL_CALCULATION',
            packaging_validation_status = 'CALCULATED_PENDING_FACTORY_CONFIRMATION',
            packaging_notes = CASE
              WHEN COALESCE(packaging_notes, '') = '' THEN $7
              WHEN packaging_notes LIKE '%' || $7 || '%' THEN packaging_notes
              ELSE packaging_notes || ' | ' || $7
            END
          WHERE sku = $8
        `, [
          selected.qty,
          box.master_carton_length_cm,
          box.master_carton_width_cm,
          box.master_carton_height_cm,
          selected.estimated_net_weight_kg,
          box.master_carton_volume_m3,
          policyNote,
          row.sku,
        ]);

        updatedRows += update.rowCount;
      }
    }

    console.log(JSON.stringify({
      migration: '105_HD_UNITS_PER_CASE_WEIGHT_DIMENSION_VOLUME',
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