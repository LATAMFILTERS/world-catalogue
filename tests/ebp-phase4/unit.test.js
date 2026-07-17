'use strict';

// EBP Phase 4 — unit tests for pure functions (no DB, no network).
// Run: node --test tests/ebp-phase4/unit.test.js

const test = require('node:test');
const assert = require('node:assert/strict');

const comparators = require('../../ebp/phase4/comparators');
const severity = require('../../ebp/phase4/severity');
const observations = require('../../ebp/phase4/observations');
const ruleEngine = require('../../ebp/phase4/rule-engine');

// ─── comparators.js — the ten Comparison Types ──────────────────────────────

test('EXACT_MATCH passes/fails correctly', () => {
  assert.equal(comparators.evaluateBase('EXACT_MATCH', 'M18x1.5', { target: 'M18x1.5' }).passed, true);
  assert.equal(comparators.evaluateBase('EXACT_MATCH', 'M20x1.5', { target: 'M18x1.5' }).passed, false);
});

test('NUMERIC_TOLERANCE passes within tolerance, fails outside', () => {
  const okResult = comparators.evaluateBase('NUMERIC_TOLERANCE', 103, { target: 100, tolerance_pct: 5 });
  assert.equal(okResult.passed, true);
  const failResult = comparators.evaluateBase('NUMERIC_TOLERANCE', 110, { target: 100, tolerance_pct: 5 });
  assert.equal(failResult.passed, false);
  assert.equal(failResult.observation_code, 'OBS_TOLERANCE_EXCEEDED');
});

test('RANGE passes inside inclusive bounds, fails outside', () => {
  assert.equal(comparators.evaluateBase('RANGE', 50, { min: 40, max: 60 }).passed, true);
  assert.equal(comparators.evaluateBase('RANGE', 40, { min: 40, max: 60 }).passed, true);
  assert.equal(comparators.evaluateBase('RANGE', 61, { min: 40, max: 60 }).passed, false);
});

test('MAXIMUM and MINIMUM', () => {
  assert.equal(comparators.evaluateBase('MAXIMUM', 10, { max: 10 }).passed, true);
  assert.equal(comparators.evaluateBase('MAXIMUM', 11, { max: 10 }).passed, false);
  assert.equal(comparators.evaluateBase('MINIMUM', 10, { min: 10 }).passed, true);
  assert.equal(comparators.evaluateBase('MINIMUM', 9, { min: 10 }).passed, false);
});

test('ENUMERATION passes for allowed value, fails otherwise', () => {
  assert.equal(comparators.evaluateBase('ENUMERATION', 'NBR', { allowed: ['NBR', 'FKM'] }).passed, true);
  assert.equal(comparators.evaluateBase('ENUMERATION', 'EPDM', { allowed: ['NBR', 'FKM'] }).passed, false);
});

test('PATTERN matches a regex', () => {
  assert.equal(comparators.evaluateBase('PATTERN', 'EL80047', { pattern: '^EL8\\d{4}$' }).passed, true);
  assert.equal(comparators.evaluateBase('PATTERN', 'EA10695', { pattern: '^EL8\\d{4}$' }).passed, false);
});

test('BOOLEAN compares truthiness', () => {
  assert.equal(comparators.evaluateBase('BOOLEAN', true, { expected: true }).passed, true);
  assert.equal(comparators.evaluateBase('BOOLEAN', false, { expected: true }).passed, false);
});

test('REQUIRED_EVIDENCE passes when a reference is present, fails when missing', () => {
  assert.equal(comparators.evaluateBase('REQUIRED_EVIDENCE', 'doc-uuid', {}).passed, true);
  assert.equal(comparators.evaluateBase('REQUIRED_EVIDENCE', undefined, {}).passed, false);
});

test('missing field is always a failure, never a silent pass', () => {
  const result = comparators.evaluateBase('MINIMUM', undefined, { min: 10 });
  assert.equal(result.passed, false);
  assert.equal(result.observation_code, 'OBS_FIELD_MISSING');
});

test('evaluateBase throws for COMPOSITE/CONDITIONAL — those are engine-level concerns', () => {
  assert.throws(() => comparators.evaluateBase('COMPOSITE', 1, {}));
  assert.throws(() => comparators.evaluateBase('CONDITIONAL', 1, {}));
});

// ─── severity.js — Decision 03/04 ────────────────────────────────────────────

test('CRITICAL and HIGH are always blocking', () => {
  assert.equal(severity.isBlockingSeverity('CRITICAL', false), true);
  assert.equal(severity.isBlockingSeverity('HIGH', false), true);
});

test('MEDIUM blocks only when hardened_to_block, LOW/INFO never block', () => {
  assert.equal(severity.isBlockingSeverity('MEDIUM', false), false);
  assert.equal(severity.isBlockingSeverity('MEDIUM', true), true);
  assert.equal(severity.isBlockingSeverity('LOW', true), false);
  assert.equal(severity.isBlockingSeverity('INFO', true), false);
});

test('highestSeverity picks the highest-ranked severity among operands (Decision 04)', () => {
  assert.equal(severity.highestSeverity('LOW', ['MEDIUM', 'HIGH']), 'HIGH');
  assert.equal(severity.highestSeverity('CRITICAL', ['LOW']), 'CRITICAL');
  assert.equal(severity.highestSeverity('MEDIUM', []), 'MEDIUM');
});

// ─── observations.js — Decision 06 ───────────────────────────────────────────

test('renderObservation renders a registered code with its params', () => {
  const text = observations.renderObservation('OBS_NUMERIC_BELOW_MINIMUM', { actual: 5, min: 10 });
  assert.match(text, /5/);
  assert.match(text, /10/);
});

test('renderObservation falls back to a generic rendering for an unregistered code', () => {
  const text = observations.renderObservation('OBS_SOME_UNKNOWN_CODE', { foo: 'bar' });
  assert.match(text, /OBS_SOME_UNKNOWN_CODE/);
  assert.match(text, /foo/);
});

test('resolveObservationCode: a rule-version override wins over the default code', () => {
  const resolved = observations.resolveObservationCode('OBS_NUMERIC_BELOW_MINIMUM', 'FAIL', { FAIL: 'OBS_CUSTOM_OVERRIDE' });
  assert.equal(resolved, 'OBS_CUSTOM_OVERRIDE');
});

test('resolveObservationCode: no override present falls back to the default code', () => {
  const resolved = observations.resolveObservationCode('OBS_NUMERIC_BELOW_MINIMUM', 'FAIL', null);
  assert.equal(resolved, 'OBS_NUMERIC_BELOW_MINIMUM');
});

// ─── rule-engine.js — orchestration ──────────────────────────────────────────

function makeRule(overrides) {
  return {
    rule_id: 'RULE-TEST',
    rule_version: 1,
    comparison_type: 'MINIMUM',
    severity: 'HIGH',
    exception_policy: 'NON_WAIVABLE',
    rule_applicability: {},
    default_behavior: { field_name: 'burst_pressure_kpa', min: 500 },
    observation_overrides: null,
    ...overrides,
  };
}

test('evaluateRuleSet: a CRITICAL/HIGH NON_WAIVABLE failing rule produces state FAIL', () => {
  const context = { offeredFields: { burst_pressure_kpa: { offered_value: 400 } }, passportSpec: {} };
  const [result] = ruleEngine.evaluateRuleSet([makeRule()], context);
  assert.equal(result.state, 'FAIL');
});

test('evaluateRuleSet: a HIGH WAIVABLE failing rule produces state REQUIRES_EXCEPTION', () => {
  const rule = makeRule({ exception_policy: 'WAIVABLE_WITH_ENGINEERING_APPROVAL' });
  const context = { offeredFields: { burst_pressure_kpa: { offered_value: 400 } }, passportSpec: {} };
  const [result] = ruleEngine.evaluateRuleSet([rule], context);
  assert.equal(result.state, 'REQUIRES_EXCEPTION');
});

test('evaluateRuleSet: a MEDIUM failing rule (not hardened) produces state WARNING, never blocks', () => {
  const rule = makeRule({ severity: 'MEDIUM', exception_policy: 'WAIVABLE_WITH_CONDITIONS' });
  const context = { offeredFields: { burst_pressure_kpa: { offered_value: 400 } }, passportSpec: {} };
  const [result] = ruleEngine.evaluateRuleSet([rule], context);
  assert.equal(result.state, 'WARNING');
});

test('evaluateRuleSet: a hardened MEDIUM failing rule becomes blocking (Decision 03 harden-only)', () => {
  const rule = makeRule({ severity: 'MEDIUM', default_behavior: { field_name: 'burst_pressure_kpa', min: 500, hardened_to_block: true } });
  const context = { offeredFields: { burst_pressure_kpa: { offered_value: 400 } }, passportSpec: {} };
  const [result] = ruleEngine.evaluateRuleSet([rule], context);
  assert.equal(result.state, 'FAIL');
});

test('evaluateRuleSet: a passing rule produces state PASS', () => {
  const context = { offeredFields: { burst_pressure_kpa: { offered_value: 600 } }, passportSpec: {} };
  const [result] = ruleEngine.evaluateRuleSet([makeRule()], context);
  assert.equal(result.state, 'PASS');
});

test('evaluateRuleSet: rule_applicability mismatch produces NOT_APPLICABLE, never blocks', () => {
  const rule = makeRule({ rule_applicability: { product_category: ['FUEL'] } });
  const context = { product_category: 'OIL', offeredFields: { burst_pressure_kpa: { offered_value: 400 } }, passportSpec: {} };
  const [result] = ruleEngine.evaluateRuleSet([rule], context);
  assert.equal(result.state, 'NOT_APPLICABLE');
});

test('evaluateRuleSet: target_source PASSPORT_FIELD reads the target dynamically from the Passport spec', () => {
  const rule = makeRule({ default_behavior: { field_name: 'burst_pressure_kpa', target_source: 'PASSPORT_FIELD', target_field: 'burst_pressure_kpa' }, comparison_type: 'MINIMUM' });
  rule.default_behavior.min = undefined;
  // MINIMUM needs `min`, not `target` — use EXACT_MATCH instead to exercise target resolution cleanly.
  const exactRule = makeRule({
    comparison_type: 'EXACT_MATCH',
    default_behavior: { field_name: 'thread_spec', target_source: 'PASSPORT_FIELD', target_field: 'thread_spec' },
  });
  const context = {
    offeredFields: { thread_spec: { offered_value: 'M18x1.5' } },
    passportSpec: { thread_spec: 'M18x1.5' },
  };
  const [result] = ruleEngine.evaluateRuleSet([exactRule], context);
  assert.equal(result.state, 'PASS');
});

test('evaluateRuleSet: CONDITIONAL rule with false precondition is NOT_APPLICABLE and severity does not gate', () => {
  const rule = {
    rule_id: 'RULE-COND',
    rule_version: 1,
    comparison_type: 'CONDITIONAL',
    severity: 'CRITICAL',
    exception_policy: 'NON_WAIVABLE',
    rule_applicability: {},
    default_behavior: {
      precondition: { field: 'bypass_valve_applicability', operator: 'EQUALS', value: 'REQUIRED' },
      then: { comparison_type: 'MINIMUM', field_name: 'bypass_opening_pressure_kpa', min: 50 },
    },
  };
  const context = {
    offeredFields: {
      bypass_valve_applicability: { offered_value: 'NOT_APPLICABLE' },
      bypass_opening_pressure_kpa: { offered_value: 10 },
    },
    passportSpec: {},
  };
  const [result] = ruleEngine.evaluateRuleSet([rule], context);
  assert.equal(result.state, 'NOT_APPLICABLE');
});

test('evaluateRuleSet: CONDITIONAL rule with true precondition delegates to the nested comparison', () => {
  const rule = {
    rule_id: 'RULE-COND',
    rule_version: 1,
    comparison_type: 'CONDITIONAL',
    severity: 'HIGH',
    exception_policy: 'NON_WAIVABLE',
    rule_applicability: {},
    default_behavior: {
      precondition: { field: 'bypass_valve_applicability', operator: 'EQUALS', value: 'REQUIRED' },
      then: { comparison_type: 'MINIMUM', field_name: 'bypass_opening_pressure_kpa', min: 50 },
    },
  };
  const context = {
    offeredFields: {
      bypass_valve_applicability: { offered_value: 'REQUIRED' },
      bypass_opening_pressure_kpa: { offered_value: 10 },
    },
    passportSpec: {},
  };
  const [result] = ruleEngine.evaluateRuleSet([rule], context);
  assert.equal(result.state, 'FAIL');
});

test('evaluateRuleSet: COMPOSITE AND fails if any operand fails, effective severity is the highest', () => {
  const opA = makeRule({ rule_id: 'OP-A', severity: 'MEDIUM', default_behavior: { field_name: 'field_a', min: 10 } });
  const opB = makeRule({ rule_id: 'OP-B', severity: 'HIGH', default_behavior: { field_name: 'field_b', min: 10 } });
  const composite = {
    rule_id: 'RULE-COMPOSITE',
    rule_version: 1,
    comparison_type: 'COMPOSITE',
    severity: 'LOW',
    exception_policy: 'NON_WAIVABLE',
    rule_applicability: {},
    operands: { operator: 'AND', rule_ids: ['OP-A', 'OP-B'] },
  };
  const context = { offeredFields: { field_a: { offered_value: 20 }, field_b: { offered_value: 5 } }, passportSpec: {} };
  const results = ruleEngine.evaluateRuleSet([opA, opB, composite], context);
  const compositeResult = results.find((r) => r.rule_id === 'RULE-COMPOSITE');
  assert.equal(compositeResult.state, 'FAIL');
  assert.equal(compositeResult.severity, 'HIGH');
});

test('evaluateRuleSet: COMPOSITE OR passes if at least one operand passes', () => {
  const opA = makeRule({ rule_id: 'OP-A', severity: 'HIGH', default_behavior: { field_name: 'field_a', min: 10 } });
  const opB = makeRule({ rule_id: 'OP-B', severity: 'HIGH', default_behavior: { field_name: 'field_b', min: 10 } });
  const composite = {
    rule_id: 'RULE-COMPOSITE-OR',
    rule_version: 1,
    comparison_type: 'COMPOSITE',
    severity: 'LOW',
    exception_policy: 'NON_WAIVABLE',
    rule_applicability: {},
    operands: { operator: 'OR', rule_ids: ['OP-A', 'OP-B'] },
  };
  const context = { offeredFields: { field_a: { offered_value: 5 }, field_b: { offered_value: 20 } }, passportSpec: {} };
  const results = ruleEngine.evaluateRuleSet([opA, opB, composite], context);
  const compositeResult = results.find((r) => r.rule_id === 'RULE-COMPOSITE-OR');
  assert.equal(compositeResult.state, 'PASS');
});

test('evaluateRuleSet: COMPOSITE XOR fails when zero or more than one alternative is satisfied', () => {
  const opA = makeRule({ rule_id: 'OP-A', severity: 'HIGH', default_behavior: { field_name: 'field_a', min: 10 } });
  const opB = makeRule({ rule_id: 'OP-B', severity: 'HIGH', default_behavior: { field_name: 'field_b', min: 10 } });
  const composite = {
    rule_id: 'RULE-COMPOSITE-XOR',
    rule_version: 1,
    comparison_type: 'COMPOSITE',
    severity: 'HIGH',
    exception_policy: 'NON_WAIVABLE',
    rule_applicability: {},
    operands: { operator: 'XOR', rule_ids: ['OP-A', 'OP-B'] },
  };
  // Both operands independently pass, so the XOR ("exactly one satisfied")
  // still fails, but at the composite rule's own declared severity — Decision
  // 04's "highest among own severity and the severities of operands causing
  // the negative result" finds no failing operand here to elevate from.
  const bothPass = { offeredFields: { field_a: { offered_value: 20 }, field_b: { offered_value: 20 } }, passportSpec: {} };
  const results = ruleEngine.evaluateRuleSet([opA, opB, composite], bothPass);
  const compositeResult = results.find((r) => r.rule_id === 'RULE-COMPOSITE-XOR');
  assert.equal(compositeResult.state, 'FAIL');
});

// ─── Global Result Model (ADR-0051) ──────────────────────────────────────────

test('computeMechanicalResult: any FAIL produces MECHANICALLY_FAIL, never eligible for approval', () => {
  const { mechanical_result, mechanically_eligible_for_approval } = ruleEngine.computeMechanicalResult([
    { state: 'PASS' },
    { state: 'FAIL' },
  ]);
  assert.equal(mechanical_result, 'MECHANICALLY_FAIL');
  assert.equal(mechanically_eligible_for_approval, false);
});

test('computeMechanicalResult: REQUIRES_EXCEPTION with no FAIL produces REQUIRES_ENGINEERING_REVIEW', () => {
  const { mechanical_result, mechanically_eligible_for_approval } = ruleEngine.computeMechanicalResult([
    { state: 'PASS' },
    { state: 'REQUIRES_EXCEPTION' },
  ]);
  assert.equal(mechanical_result, 'REQUIRES_ENGINEERING_REVIEW');
  assert.equal(mechanically_eligible_for_approval, false);
});

test('computeMechanicalResult: all PASS/NOT_APPLICABLE/WARNING produces MECHANICALLY_PASS and eligibility', () => {
  const { mechanical_result, mechanically_eligible_for_approval } = ruleEngine.computeMechanicalResult([
    { state: 'PASS' },
    { state: 'NOT_APPLICABLE' },
    { state: 'WARNING' },
  ]);
  assert.equal(mechanical_result, 'MECHANICALLY_PASS');
  assert.equal(mechanically_eligible_for_approval, true);
});

test('computeMechanicalResult: MECHANICALLY_PASS never itself becomes an Engineering Decision (structural check)', () => {
  const { mechanical_result } = ruleEngine.computeMechanicalResult([{ state: 'PASS' }]);
  assert.ok(['MECHANICALLY_PASS', 'MECHANICALLY_FAIL', 'REQUIRES_ENGINEERING_REVIEW'].includes(mechanical_result));
  assert.ok(!['APPROVED', 'CONDITIONALLY_APPROVED', 'REJECTED', 'PENDING_REVIEW'].includes(mechanical_result));
});
