'use strict';

// EBP Phase 4 — the ten Comparison Type evaluators from
// docs/ebp/ENGINEERING_RULE_ENGINE.md §2. Every function is pure: given a
// resolved `actual` value and a `config` object (the rule version's
// `default_behavior`, or the nested `then` config for a CONDITIONAL rule),
// it returns { passed, observation_code, observation_params } and never
// touches the database or any other rule. COMPOSITE and CONDITIONAL are
// deliberately absent here — they require access to sibling rule results
// or a precondition check and are orchestrated by rule-engine.js instead.

function missing(actual) {
  return actual === undefined || actual === null || actual === '';
}

function exactMatch(actual, config) {
  if (missing(actual)) {
    return { passed: false, observation_code: 'OBS_FIELD_MISSING', observation_params: { field: config.field_name } };
  }
  const passed = actual === config.target;
  return {
    passed,
    observation_code: passed ? 'OBS_EXACT_MATCH_OK' : 'OBS_EXACT_MATCH_MISMATCH',
    observation_params: { actual, expected: config.target },
  };
}

function numericTolerance(actual, config) {
  if (missing(actual) || typeof actual !== 'number' || Number.isNaN(actual)) {
    return { passed: false, observation_code: 'OBS_FIELD_MISSING', observation_params: { field: config.field_name } };
  }
  const target = config.target;
  const toleranceAbs = config.tolerance_abs != null ? config.tolerance_abs : Math.abs(target) * (config.tolerance_pct || 0) / 100;
  const delta = Math.abs(actual - target);
  const passed = delta <= toleranceAbs;
  return {
    passed,
    observation_code: passed ? 'OBS_TOLERANCE_OK' : 'OBS_TOLERANCE_EXCEEDED',
    observation_params: { actual, target, tolerance_abs: toleranceAbs, delta },
  };
}

function range(actual, config) {
  if (missing(actual) || typeof actual !== 'number' || Number.isNaN(actual)) {
    return { passed: false, observation_code: 'OBS_FIELD_MISSING', observation_params: { field: config.field_name } };
  }
  const passed = actual >= config.min && actual <= config.max;
  return {
    passed,
    observation_code: passed ? 'OBS_RANGE_OK' : 'OBS_OUT_OF_RANGE',
    observation_params: { actual, min: config.min, max: config.max },
  };
}

function maximum(actual, config) {
  if (missing(actual) || typeof actual !== 'number' || Number.isNaN(actual)) {
    return { passed: false, observation_code: 'OBS_FIELD_MISSING', observation_params: { field: config.field_name } };
  }
  const passed = actual <= config.max;
  return {
    passed,
    observation_code: passed ? 'OBS_MAXIMUM_OK' : 'OBS_NUMERIC_ABOVE_MAXIMUM',
    observation_params: { actual, max: config.max },
  };
}

function minimum(actual, config) {
  if (missing(actual) || typeof actual !== 'number' || Number.isNaN(actual)) {
    return { passed: false, observation_code: 'OBS_FIELD_MISSING', observation_params: { field: config.field_name } };
  }
  const passed = actual >= config.min;
  return {
    passed,
    observation_code: passed ? 'OBS_MINIMUM_OK' : 'OBS_NUMERIC_BELOW_MINIMUM',
    observation_params: { actual, min: config.min },
  };
}

function enumeration(actual, config) {
  if (missing(actual)) {
    return { passed: false, observation_code: 'OBS_FIELD_MISSING', observation_params: { field: config.field_name } };
  }
  const allowed = config.allowed || [];
  const passed = allowed.includes(actual);
  return {
    passed,
    observation_code: passed ? 'OBS_ENUMERATION_OK' : 'OBS_VALUE_NOT_IN_ENUMERATION',
    observation_params: { actual, allowed },
  };
}

function pattern(actual, config) {
  if (missing(actual)) {
    return { passed: false, observation_code: 'OBS_FIELD_MISSING', observation_params: { field: config.field_name } };
  }
  let passed;
  try {
    passed = new RegExp(config.pattern).test(String(actual));
  } catch {
    passed = false;
  }
  return {
    passed,
    observation_code: passed ? 'OBS_PATTERN_OK' : 'OBS_PATTERN_MISMATCH',
    observation_params: { actual, pattern: config.pattern },
  };
}

function booleanMatch(actual, config) {
  if (missing(actual)) {
    return { passed: false, observation_code: 'OBS_FIELD_MISSING', observation_params: { field: config.field_name } };
  }
  const passed = Boolean(actual) === Boolean(config.expected);
  return {
    passed,
    observation_code: passed ? 'OBS_BOOLEAN_OK' : 'OBS_BOOLEAN_MISMATCH',
    observation_params: { actual: Boolean(actual), expected: Boolean(config.expected) },
  };
}

// `actual` here is the evidence reference itself (e.g. evidence_document_id),
// not a numeric/text field value.
function requiredEvidence(actual, config) {
  const passed = !missing(actual);
  return {
    passed,
    observation_code: passed ? 'OBS_REQUIRED_EVIDENCE_PRESENT' : 'OBS_REQUIRED_EVIDENCE_MISSING',
    observation_params: { field: config.field_name },
  };
}

const COMPARATORS = {
  EXACT_MATCH: exactMatch,
  NUMERIC_TOLERANCE: numericTolerance,
  RANGE: range,
  MAXIMUM: maximum,
  MINIMUM: minimum,
  ENUMERATION: enumeration,
  PATTERN: pattern,
  BOOLEAN: booleanMatch,
  REQUIRED_EVIDENCE: requiredEvidence,
};

// evaluateBase(comparisonType, actual, config) -> { passed, observation_code, observation_params }
// Throws if comparisonType is COMPOSITE/CONDITIONAL or unknown — those are
// engine-level concerns, never dispatched here.
function evaluateBase(comparisonType, actual, config) {
  const fn = COMPARATORS[comparisonType];
  if (!fn) throw new Error(`comparators.js cannot evaluate comparison_type ${comparisonType} directly`);
  return fn(actual, config || {});
}

module.exports = { evaluateBase, COMPARATORS };
