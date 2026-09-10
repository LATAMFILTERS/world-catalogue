'use strict';

const DEFAULT_POLICY = Object.freeze({
  allowed_case_qty: [24, 12, 6],
  max_case_net_weight_kg: 20,
  max_case_length_cm: 60,
  max_case_width_cm: 50,
  max_case_height_cm: 40,
  max_case_volume_m3: 0.06,
  carton_allowance_cm: 1.5,
});

function policyFromEnv(env = process.env) {
  return {
    allowed_case_qty: [...DEFAULT_POLICY.allowed_case_qty],
    max_case_net_weight_kg: Number(env.HD_MAX_CASE_NET_WEIGHT_KG || DEFAULT_POLICY.max_case_net_weight_kg),
    max_case_length_cm: Number(env.HD_MAX_CASE_LENGTH_CM || DEFAULT_POLICY.max_case_length_cm),
    max_case_width_cm: Number(env.HD_MAX_CASE_WIDTH_CM || DEFAULT_POLICY.max_case_width_cm),
    max_case_height_cm: Number(env.HD_MAX_CASE_HEIGHT_CM || DEFAULT_POLICY.max_case_height_cm),
    max_case_volume_m3: Number(env.HD_MAX_CASE_VOLUME_M3 || DEFAULT_POLICY.max_case_volume_m3),
    carton_allowance_cm: Number(env.HD_CARTON_ALLOWANCE_CM || DEFAULT_POLICY.carton_allowance_cm),
  };
}

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
      visit([...prefix, remaining[i]], [...remaining.slice(0, i), ...remaining.slice(i + 1)]);
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
      triples.push([x, y, yz / y]);
    }
  }
  return triples;
}

function canonicalBoxDimensions(rawDims) {
  const [length_cm, width_cm, height_cm] = [...rawDims].sort((a, b) => b - a);
  return { length_cm, width_cm, height_cm };
}

function boxVolumeM3(box) {
  return (box.length_cm * box.width_cm * box.height_cm) / 1e6;
}

function dimensionsWithinPolicy(box, policy) {
  return box.length_cm <= policy.max_case_length_cm &&
    box.width_cm <= policy.max_case_width_cm &&
    box.height_cm <= policy.max_case_height_cm;
}

function bestArrangement(unitDims, qty, policy) {
  const candidates = [];
  for (const orientation of permutations(unitDims)) {
    for (const grid of factorTriples(qty)) {
      const box = canonicalBoxDimensions([
        orientation[0] * grid[0] + policy.carton_allowance_cm,
        orientation[1] * grid[1] + policy.carton_allowance_cm,
        orientation[2] * grid[2] + policy.carton_allowance_cm,
      ]);
      const volume_m3 = boxVolumeM3(box);
      candidates.push({
        orientation_cm: orientation,
        grid,
        box,
        volume_m3,
        dimensions_ok: dimensionsWithinPolicy(box, policy),
        volume_ok: volume_m3 <= policy.max_case_volume_m3,
      });
    }
  }

  const valid = candidates
    .filter((x) => x.dimensions_ok && x.volume_ok)
    .sort((a, b) =>
      a.volume_m3 - b.volume_m3 ||
      a.box.length_cm - b.box.length_cm ||
      a.box.width_cm - b.box.width_cm ||
      a.box.height_cm - b.box.height_cm
    );

  return { best: valid[0] || null, candidates_checked: candidates.length, valid_candidates: valid.length };
}

function requiredPackagingFields(row) {
  return ['unit_packaged_weight_kg', 'unit_packaged_length_cm', 'unit_packaged_width_cm', 'unit_packaged_height_cm']
    .filter((field) => !Number.isFinite(Number(row[field])) || Number(row[field]) <= 0);
}

function evaluateQuantity(row, qty, policy) {
  const netWeightKg = Number(row.unit_packaged_weight_kg) * qty;
  const arrangement = bestArrangement([
    Number(row.unit_packaged_length_cm),
    Number(row.unit_packaged_width_cm),
    Number(row.unit_packaged_height_cm),
  ], qty, policy);
  const weightOk = netWeightKg <= policy.max_case_net_weight_kg;
  const accepted = Boolean(weightOk && arrangement.best);

  return {
    qty,
    accepted,
    weight_ok: weightOk,
    estimated_net_weight_kg: round(netWeightKg, 3),
    arrangement_found: Boolean(arrangement.best),
    arrangements_checked: arrangement.candidates_checked,
    valid_arrangements: arrangement.valid_candidates,
    selected_arrangement: arrangement.best ? {
      unit_orientation_cm: arrangement.best.orientation_cm.map((v) => round(v, 3)),
      grid: arrangement.best.grid,
      master_carton_length_cm: round(arrangement.best.box.length_cm, 3),
      master_carton_width_cm: round(arrangement.best.box.width_cm, 3),
      master_carton_height_cm: round(arrangement.best.box.height_cm, 3),
      master_carton_volume_m3: round(arrangement.best.volume_m3, 6),
    } : null,
  };
}

function selectCase(row, policy = policyFromEnv()) {
  const missing = requiredPackagingFields(row);
  if (missing.length) return { selected: null, evaluations: [], reason: `Missing/invalid fields: ${missing.join(', ')}` };

  const evaluations = policy.allowed_case_qty.map((qty) => evaluateQuantity(row, qty, policy));
  const selected = evaluations.find((x) => x.accepted) || null;
  return {
    selected,
    evaluations,
    reason: selected ? null : 'No allowed quantity satisfies weight + dimension + volume policy',
  };
}

function isProtectedPackaging(row) {
  return row.packaging_source === 'PLANT_CONFIRMED' ||
    row.packaging_source === 'MANUFACTURER_DOCUMENTATION';
}

module.exports = {
  DEFAULT_POLICY,
  policyFromEnv,
  round,
  selectCase,
  evaluateQuantity,
  requiredPackagingFields,
  isProtectedPackaging,
};
