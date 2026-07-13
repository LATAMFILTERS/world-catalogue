'use strict';

// EBP Phase 4 — the Rule Engine: orchestrates the ten Comparison Types
// (comparators.js) plus Composite and Conditional aggregation (Decision 04,
// ADR-0042) and the fixed Severity -> gating mapping (Decision 03,
// ADR-0041; Decision 02, ADR-0040 for FAIL -> REQUIRES_EXCEPTION
// promotion). Pure/orchestration only — no database access. Callers
// (service.js) supply the already-fetched rule versions and input context.
//
// `context` shape:
//   {
//     offeredFields: { [field_name]: { offered_value, evidence_document_id, completeness_status } },
//     passportSpec: { ...ebp_passport_engineering columns },
//     product_category, product_subtype, duty, technology_code,
//   }
//
// Rule shape (a row from ebp_rule_versions):
//   { rule_id, rule_version, comparison_type, severity, exception_policy,
//     rule_applicability, default_behavior, operands, observation_overrides }

const { evaluateBase } = require('./comparators');
const { isBlockingSeverity, highestSeverity } = require('./severity');
const { resolveObservationCode } = require('./observations');

const CONDITION_OPERATORS = {
  EQUALS: (a, b) => a === b,
  NOT_EQUALS: (a, b) => a !== b,
  EXISTS: (a) => a !== undefined && a !== null && a !== '',
  NOT_EXISTS: (a) => a === undefined || a === null || a === '',
  GREATER_THAN: (a, b) => typeof a === 'number' && a > b,
  LESS_THAN: (a, b) => typeof a === 'number' && a < b,
  IN: (a, b) => Array.isArray(b) && b.includes(a),
};

// Resolves the field value a rule's default_behavior points at. A rule may
// read either the Manufacturer's offered value (source: 'OFFERED_FIELD',
// the default) or, for REQUIRED_EVIDENCE, the evidence_document_id on that
// same technical field row.
function resolveFieldValue(context, fieldName, { evidence } = {}) {
  const field = (context.offeredFields || {})[fieldName];
  if (!field) return undefined;
  if (evidence) return field.evidence_document_id;
  return field.offered_value;
}

function resolveConfigTarget(context, config) {
  // A rule's numeric/enum/pattern target may be a fixed value in the rule
  // itself (target_source omitted or 'FIXED'), or dynamically resolved
  // from the Passport's own engineering specification (Decision 11 —
  // Rule Applicability/behavior may depend on Passport data without being
  // limited to a single field).
  if (config.target_source === 'PASSPORT_FIELD' && config.target_field) {
    return (context.passportSpec || {})[config.target_field];
  }
  return config.target;
}

function evaluatePrecondition(context, precondition) {
  if (!precondition) return true;
  const opFn = CONDITION_OPERATORS[precondition.operator];
  if (!opFn) return true;
  const actual = resolveFieldValue(context, precondition.field);
  return opFn(actual, precondition.value);
}

// Declarative applicability check (Decision 11, ADR-0049). Every key
// present in rule_applicability must match the context; an absent key is
// a wildcard (always matches). Returns { applicable, reason }.
function checkApplicability(context, ruleApplicability) {
  const ra = ruleApplicability || {};
  const checks = [
    ['product_category', ra.product_category, context.product_category],
    ['product_subtype', ra.product_subtype, context.product_subtype],
    ['duty', ra.duty, context.duty],
    ['technology_code', ra.technology_code, context.technology_code],
  ];
  for (const [name, allowedList, actualValue] of checks) {
    if (allowedList && allowedList.length && !allowedList.includes(actualValue)) {
      return { applicable: false, reason: `${name} "${actualValue}" not in ${JSON.stringify(allowedList)}` };
    }
  }
  if (ra.requires_field_present) {
    const value = resolveFieldValue(context, ra.requires_field_present);
    if (value === undefined || value === null || value === '') {
      return { applicable: false, reason: `required field "${ra.requires_field_present}" not present` };
    }
  }
  if (ra.requires_field_value) {
    const { field, equals } = ra.requires_field_value;
    const value = resolveFieldValue(context, field);
    if (value !== equals) {
      return { applicable: false, reason: `field "${field}" value "${value}" does not equal required "${equals}"` };
    }
  }
  return { applicable: true, reason: null };
}

// Maps a base comparator result + rule severity/exception_policy into a
// six-state Rule Result (Decisions 02/03, ADR-0040/ADR-0041).
function escalate(rule, comparatorResult) {
  if (comparatorResult.passed) {
    return {
      state: 'PASS',
      severity: rule.severity,
      observation_code: resolveObservationCode(comparatorResult.observation_code, 'PASS', rule.observation_overrides),
      observation_params: comparatorResult.observation_params,
    };
  }
  const hardened = Boolean(rule.default_behavior && rule.default_behavior.hardened_to_block);
  const blocking = isBlockingSeverity(rule.severity, hardened);
  let state;
  if (!blocking) {
    state = 'WARNING';
  } else if (rule.exception_policy === 'NON_WAIVABLE') {
    state = 'FAIL';
  } else {
    state = 'REQUIRES_EXCEPTION';
  }
  return {
    state,
    severity: rule.severity,
    observation_code: resolveObservationCode(comparatorResult.observation_code, state, rule.observation_overrides),
    observation_params: comparatorResult.observation_params,
  };
}

function evaluateSimpleRule(rule, context) {
  const applicability = checkApplicability(context, rule.rule_applicability);
  if (!applicability.applicable) {
    return {
      rule_id: rule.rule_id,
      rule_version: rule.rule_version,
      state: 'NOT_APPLICABLE',
      severity: rule.severity,
      observation_code: 'OBS_RULE_NOT_APPLICABLE',
      observation_params: { reason: applicability.reason },
    };
  }

  const config = rule.default_behavior || {};
  const target = resolveConfigTarget(context, config);
  const configWithTarget = { ...config, target };
  const evidenceLookup = rule.comparison_type === 'REQUIRED_EVIDENCE';
  const actual = resolveFieldValue(context, config.field_name, { evidence: evidenceLookup });
  const comparatorResult = evaluateBase(rule.comparison_type, actual, configWithTarget);
  const escalated = escalate(rule, comparatorResult);
  return { rule_id: rule.rule_id, rule_version: rule.rule_version, ...escalated };
}

function evaluateConditionalRule(rule, context) {
  const applicability = checkApplicability(context, rule.rule_applicability);
  if (!applicability.applicable) {
    return {
      rule_id: rule.rule_id,
      rule_version: rule.rule_version,
      state: 'NOT_APPLICABLE',
      severity: rule.severity,
      observation_code: 'OBS_RULE_NOT_APPLICABLE',
      observation_params: { reason: applicability.reason },
    };
  }

  const config = rule.default_behavior || {};
  const preconditionMet = evaluatePrecondition(context, config.precondition);
  if (!preconditionMet) {
    // Decision 04: when the precondition is false, result is NOT_APPLICABLE
    // and severity does not participate in gating, but the evaluation is
    // still recorded for traceability.
    return {
      rule_id: rule.rule_id,
      rule_version: rule.rule_version,
      state: 'NOT_APPLICABLE',
      severity: rule.severity,
      observation_code: 'OBS_CONDITIONAL_PRECONDITION_NOT_MET',
      observation_params: {
        precondition_field: config.precondition && config.precondition.field,
        precondition_operator: config.precondition && config.precondition.operator,
        precondition_value: config.precondition && config.precondition.value,
      },
    };
  }

  const thenConfig = config.then || {};
  const target = resolveConfigTarget(context, thenConfig);
  const thenConfigWithTarget = { ...thenConfig, target };
  const evidenceLookup = thenConfig.comparison_type === 'REQUIRED_EVIDENCE';
  const actual = resolveFieldValue(context, thenConfig.field_name, { evidence: evidenceLookup });
  const comparatorResult = evaluateBase(thenConfig.comparison_type, actual, thenConfigWithTarget);
  const escalated = escalate(rule, comparatorResult);
  return { rule_id: rule.rule_id, rule_version: rule.rule_version, ...escalated };
}

// Composite aggregation (Decision 04). `resultsByRuleId` must already
// contain every operand referenced in rule.operands.rule_ids.
function evaluateCompositeRule(rule, resultsByRuleId) {
  const applicability = checkApplicability({}, rule.rule_applicability);
  if (!applicability.applicable) {
    return {
      rule_id: rule.rule_id,
      rule_version: rule.rule_version,
      state: 'NOT_APPLICABLE',
      severity: rule.severity,
      observation_code: 'OBS_RULE_NOT_APPLICABLE',
      observation_params: { reason: applicability.reason },
    };
  }

  const operands = rule.operands || {};
  const operandIds = operands.rule_ids || [];
  const operandResults = operandIds
    .map((id) => resultsByRuleId[id])
    .filter((r) => r && r.state !== 'NOT_APPLICABLE');

  const failingStates = new Set(['FAIL', 'REQUIRES_EXCEPTION']);
  const failing = operandResults.filter((r) => failingStates.has(r.state));
  const satisfied = operandResults.filter((r) => !failingStates.has(r.state));

  let passed;
  let observationCode;
  let observationParams;
  const operator = operands.operator || 'AND';

  if (operator === 'AND') {
    passed = failing.length === 0;
    observationCode = passed ? 'OBS_COMPOSITE_OK' : 'OBS_COMPOSITE_AND_FAILED';
    observationParams = passed ? {} : { failing_operands: failing.map((r) => r.rule_id) };
  } else if (operator === 'OR') {
    passed = satisfied.length > 0 || operandResults.length === 0;
    observationCode = passed ? 'OBS_COMPOSITE_OK' : 'OBS_COMPOSITE_OR_FAILED';
    observationParams = passed ? {} : { operand_rule_ids: operandIds };
  } else if (operator === 'XOR') {
    passed = satisfied.length === 1;
    observationCode = passed ? 'OBS_COMPOSITE_OK' : 'OBS_COMPOSITE_XOR_FAILED';
    observationParams = passed ? {} : { satisfied_count: satisfied.length };
  } else {
    passed = false;
    observationCode = 'OBS_COMPOSITE_AND_FAILED';
    observationParams = { failing_operands: [], reason: `unknown operator ${operator}` };
  }

  const effectiveSeverity = passed
    ? rule.severity
    : highestSeverity(rule.severity, failing.map((r) => r.severity));

  const escalated = escalate(
    { ...rule, severity: effectiveSeverity },
    { passed, observation_code: observationCode, observation_params: observationParams }
  );
  return { rule_id: rule.rule_id, rule_version: rule.rule_version, ...escalated };
}

// evaluateRuleSet(rules, context) -> array of Rule Results, one per rule,
// in the same order rules were given (composites are internally evaluated
// after their operands regardless of input order).
function evaluateRuleSet(rules, context) {
  const composites = rules.filter((r) => r.comparison_type === 'COMPOSITE');
  const nonComposites = rules.filter((r) => r.comparison_type !== 'COMPOSITE');

  const resultsByRuleId = {};
  const orderedNonComposite = nonComposites.map((rule) => {
    const result = rule.comparison_type === 'CONDITIONAL' ? evaluateConditionalRule(rule, context) : evaluateSimpleRule(rule, context);
    resultsByRuleId[rule.rule_id] = result;
    return result;
  });

  const orderedComposite = composites.map((rule) => {
    const result = evaluateCompositeRule(rule, resultsByRuleId);
    resultsByRuleId[rule.rule_id] = result;
    return result;
  });

  const byRuleId = new Map(rules.map((r) => [r.rule_id, r]));
  const allResults = [...orderedNonComposite, ...orderedComposite];
  allResults.sort((a, b) => rules.findIndex((r) => r.rule_id === a.rule_id) - rules.findIndex((r) => r.rule_id === b.rule_id));
  void byRuleId;
  return allResults;
}

// Global Result Model (ADR-0051): computes the Mechanical Compliance
// Result from a set of Rule Results. Never itself an Engineering Decision
// (Decision 09, ADR-0047) — mechanically_eligible_for_approval is
// informational only.
function computeMechanicalResult(ruleResults) {
  const hasFail = ruleResults.some((r) => r.state === 'FAIL');
  if (hasFail) return { mechanical_result: 'MECHANICALLY_FAIL', mechanically_eligible_for_approval: false };

  const hasReview = ruleResults.some((r) => r.state === 'REQUIRES_EXCEPTION' || r.state === 'REQUIRES_REVIEW');
  if (hasReview) return { mechanical_result: 'REQUIRES_ENGINEERING_REVIEW', mechanically_eligible_for_approval: false };

  return { mechanical_result: 'MECHANICALLY_PASS', mechanically_eligible_for_approval: true };
}

module.exports = {
  evaluateRuleSet,
  computeMechanicalResult,
  checkApplicability,
  evaluatePrecondition,
  resolveFieldValue,
  CONDITION_OPERATORS,
};
