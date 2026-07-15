'use strict';

const POLICIES = {
  LIGHT_DUTY: {
    required: ['engine_air', 'engine_oil', 'cabin_air'],
    conditional: ['fuel'],
  },
  HEAVY_DUTY: {
    required: ['engine_air', 'engine_oil', 'fuel'],
    conditional: ['cabin_air', 'hydraulic', 'coolant'],
  },
  INDUSTRIAL: {
    required: [],
    conditional: ['engine_air', 'engine_oil', 'fuel', 'hydraulic', 'coolant'],
  },
  UNKNOWN: {
    required: [],
    conditional: [],
  },
};

function evaluateCoverage(unit) {
  const policy = POLICIES[unit.segment] || POLICIES.UNKNOWN;
  const categories = new Set(unit.categories);
  const missingRequired = policy.required.filter((category) => !categories.has(category));

  let status = 'complete';
  if (unit.segment === 'UNKNOWN') status = 'unresolved_segment';
  else if (!unit.make || !unit.model) status = 'invalid_identity';
  else if (unit.yearFrom === null && unit.segment === 'LIGHT_DUTY') status = 'needs_year';
  else if (unit.fuel === 'unknown' || unit.market === 'unknown') status = 'needs_context';
  else if (missingRequired.length === policy.required.length && policy.required.length) status = 'no_core_coverage';
  else if (missingRequired.length) status = 'partial';

  const priorityScore =
    (unit.segment === 'UNKNOWN' ? 100 : 0) +
    (!unit.make || !unit.model ? 100 : 0) +
    (unit.yearFrom === null && unit.segment === 'LIGHT_DUTY' ? 50 : 0) +
    (unit.fuel === 'unknown' ? 30 : 0) +
    (unit.market === 'unknown' ? 20 : 0) +
    (missingRequired.length * 20);

  return {
    ...unit,
    status,
    priority_score: priorityScore,
    required_categories: policy.required,
    conditional_categories: policy.conditional,
    missing_required_categories: missingRequired,
  };
}

module.exports = { POLICIES, evaluateCoverage };
