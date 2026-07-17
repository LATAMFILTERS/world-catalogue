'use strict';

// EBP Phase 4 — Observation Catalog rendering (Decision 06, ADR-0044).
// Hybrid model: comparators.js/rule-engine.js choose a stable
// observation_code + structured observation_params at evaluation time,
// and that pair is what gets stored in ebp_rule_results — never rendered
// text. This module renders human-readable text from (code, params) on
// read, and lets a specific rule_version override the default template
// text for a given code (rule.observation_overrides), all English-only
// for v1.0 (i18n keys reserved via the `en` locale key so future locales
// are additive, not a rewrite).

const DEFAULT_TEMPLATES_EN = {
  OBS_FIELD_MISSING: (p) => `Required field "${p.field}" was not provided.`,
  OBS_EXACT_MATCH_OK: (p) => `Value "${p.actual}" matches the required value "${p.expected}".`,
  OBS_EXACT_MATCH_MISMATCH: (p) => `Value "${p.actual}" does not match the required value "${p.expected}".`,
  OBS_TOLERANCE_OK: (p) => `Value ${p.actual} is within tolerance of target ${p.target} (delta ${p.delta}, allowed ${p.tolerance_abs}).`,
  OBS_TOLERANCE_EXCEEDED: (p) => `Value ${p.actual} exceeds tolerance of target ${p.target} (delta ${p.delta}, allowed ${p.tolerance_abs}).`,
  OBS_RANGE_OK: (p) => `Value ${p.actual} is within the required range [${p.min}, ${p.max}].`,
  OBS_OUT_OF_RANGE: (p) => `Value ${p.actual} is outside the required range [${p.min}, ${p.max}].`,
  OBS_MAXIMUM_OK: (p) => `Value ${p.actual} is at or below the maximum of ${p.max}.`,
  OBS_NUMERIC_ABOVE_MAXIMUM: (p) => `Value ${p.actual} exceeds the maximum of ${p.max}.`,
  OBS_MINIMUM_OK: (p) => `Value ${p.actual} is at or above the minimum of ${p.min}.`,
  OBS_NUMERIC_BELOW_MINIMUM: (p) => `Value ${p.actual} is below the minimum of ${p.min}.`,
  OBS_ENUMERATION_OK: (p) => `Value "${p.actual}" is one of the allowed values.`,
  OBS_VALUE_NOT_IN_ENUMERATION: (p) => `Value "${p.actual}" is not one of the allowed values: ${JSON.stringify(p.allowed)}.`,
  OBS_PATTERN_OK: (p) => `Value "${p.actual}" matches the required pattern.`,
  OBS_PATTERN_MISMATCH: (p) => `Value "${p.actual}" does not match the required pattern ${p.pattern}.`,
  OBS_BOOLEAN_OK: (p) => `Value ${p.actual} matches the required value ${p.expected}.`,
  OBS_BOOLEAN_MISMATCH: (p) => `Value ${p.actual} does not match the required value ${p.expected}.`,
  OBS_REQUIRED_EVIDENCE_PRESENT: (p) => `Required evidence for "${p.field}" is present.`,
  OBS_REQUIRED_EVIDENCE_MISSING: (p) => `Required evidence for "${p.field}" is missing.`,
  OBS_RULE_NOT_APPLICABLE: (p) => `Rule does not apply: ${p.reason || 'applicability conditions not met'}.`,
  OBS_CONDITIONAL_PRECONDITION_NOT_MET: (p) => `Conditional rule precondition not met (${p.precondition_field} ${p.precondition_operator} ${p.precondition_value}); rule not evaluated.`,
  OBS_COMPOSITE_AND_FAILED: (p) => `Composite AND rule failed: operand(s) ${JSON.stringify(p.failing_operands)} did not pass.`,
  OBS_COMPOSITE_OR_FAILED: (p) => `Composite OR rule failed: none of the alternatives ${JSON.stringify(p.operand_rule_ids)} passed.`,
  OBS_COMPOSITE_XOR_FAILED: (p) => `Composite XOR rule failed: expected exactly one satisfied alternative, found ${p.satisfied_count}.`,
  OBS_COMPOSITE_OK: () => 'Composite rule satisfied.',
};

// renderObservation(code, params) -> always returns a string, even for an
// unregistered code (falls back to a generic rendering of the code and
// params so nothing is silently lost).
function renderObservation(code, params) {
  const fn = DEFAULT_TEMPLATES_EN[code];
  if (fn) {
    try {
      return fn(params || {});
    } catch {
      // fall through to generic rendering below
    }
  }
  return `${code}${params && Object.keys(params).length ? ' ' + JSON.stringify(params) : ''}`;
}

// resolveObservationCode(defaultCode, state, overrides) — Decision 06's
// hybrid model: an optional per-rule-version override for a given result
// state takes precedence over the comparator's own default code.
function resolveObservationCode(defaultCode, state, overrides) {
  if (overrides && typeof overrides === 'object' && overrides[state]) return overrides[state];
  return defaultCode;
}

module.exports = { renderObservation, resolveObservationCode, DEFAULT_TEMPLATES_EN };
