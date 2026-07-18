'use strict';

// EBP Phase 5 — unit tests for pure functions (no DB, no network).
// Run: node --test tests/ebp-phase5/unit.test.js

const test = require('node:test');
const assert = require('node:assert/strict');

const policy = require('../../ebp/phase5/policy');
const ranking = require('../../ebp/phase5/ranking');

// ─── policy.js ───────────────────────────────────────────────────────────

test('validateWeights accepts weights summing to 1.0', () => {
  const errors = policy.validateWeights({ ENGINEERING: 0.40, COMMERCIAL: 0.25, OPERATIONAL: 0.20, STRATEGIC: 0.15 });
  assert.deepEqual(errors, []);
});

test('validateWeights rejects weights not summing to 1.0', () => {
  const errors = policy.validateWeights({ ENGINEERING: 0.40, COMMERCIAL: 0.25, OPERATIONAL: 0.20, STRATEGIC: 0.10 });
  assert.equal(errors.length > 0, true);
});

test('normalizeLinear: higher-is-better scales correctly', () => {
  assert.equal(policy.normalizeLinear(100, 0, 100, false), 100);
  assert.equal(policy.normalizeLinear(0, 0, 100, false), 0);
  assert.equal(policy.normalizeLinear(50, 0, 100, false), 50);
});

test('normalizeLinear: lower-is-better inverts the scale (FOB, lead time)', () => {
  assert.equal(policy.normalizeLinear(0, 0, 100, true), 100);
  assert.equal(policy.normalizeLinear(100, 0, 100, true), 0);
});

test('normalizeLinear: single-value pool (min === max) always returns 100', () => {
  assert.equal(policy.normalizeLinear(42, 42, 42, false), 100);
  assert.equal(policy.normalizeLinear(42, 42, 42, true), 100);
});

test('computeCategoryScore averages normalized factor values', () => {
  const score = policy.computeCategoryScore([{ normalized_value: 80 }, { normalized_value: 60 }]);
  assert.equal(score, 70);
});

test('computeCompositeScore applies the fixed 40/25/20/15 weights', () => {
  const weights = { ENGINEERING: 0.40, COMMERCIAL: 0.25, OPERATIONAL: 0.20, STRATEGIC: 0.15 };
  const score = policy.computeCompositeScore({ ENGINEERING: 100, COMMERCIAL: 100, OPERATIONAL: 100, STRATEGIC: 100 }, weights);
  assert.equal(score, 100);
  const zeroScore = policy.computeCompositeScore({ ENGINEERING: 0, COMMERCIAL: 0, OPERATIONAL: 0, STRATEGIC: 0 }, weights);
  assert.equal(zeroScore, 0);
});

test('applyExceptionPenalty: an Offer with APPROVED Exceptions scores lower than one with zero (Technical Priority Rule)', () => {
  const clean = policy.applyExceptionPenalty(100, 0, { approved_exception_penalty: 10 });
  const withException = policy.applyExceptionPenalty(100, 1, { approved_exception_penalty: 10 });
  assert.equal(clean.penalized_score, 100);
  assert.equal(withException.penalized_score, 90);
  assert.equal(withException.penalty_applied, 10);
  assert.ok(withException.penalized_score < clean.penalized_score);
});

test('applyPreferredManufacturerBonus: retains pre-bonus, bonus, and final as three distinct values', () => {
  const result = policy.applyPreferredManufacturerBonus(90, true, { bonus_points: 5 });
  assert.equal(result.composite_score_final, 95);
  assert.equal(result.bonus_applied, 5);
  const notPreferred = policy.applyPreferredManufacturerBonus(90, false, { bonus_points: 5 });
  assert.equal(notPreferred.composite_score_final, 90);
  assert.equal(notPreferred.bonus_applied, 0);
});

test('applyPreferredManufacturerBonus never pushes the final score above 100', () => {
  const result = policy.applyPreferredManufacturerBonus(98, true, { bonus_points: 10 });
  assert.equal(result.composite_score_final, 100);
});

// ─── ranking.js ──────────────────────────────────────────────────────────

test('rankCandidates orders by composite_score_final descending', () => {
  const { ranked } = ranking.rankCandidates([
    { offer_id: 'a', composite_score_final: 70 },
    { offer_id: 'b', composite_score_final: 90 },
    { offer_id: 'c', composite_score_final: 80 },
  ]);
  assert.deepEqual(ranked.map((c) => c.offer_id), ['b', 'c', 'a']);
});

test('rankCandidates tie-break: higher technical_quality_score wins on identical composite score', () => {
  const { ranked, tied } = ranking.rankCandidates([
    { offer_id: 'a', composite_score_final: 80, technical_quality_score: 70 },
    { offer_id: 'b', composite_score_final: 80, technical_quality_score: 90 },
  ]);
  assert.equal(ranked[0].offer_id, 'b');
  assert.deepEqual(tied, []);
});

test('rankCandidates: identical candidates on every tie-break step produce a tied pair (TIE_REQUIRES_HUMAN_REVIEW territory)', () => {
  const identical = { composite_score_final: 80, technical_quality_score: 70, fewer_exceptions_score: 100, normalized_fob_score: 60, lead_time_score: 60, capacity_score: 60, diversification_score: 50, remaining_validity_score: 50 };
  const { tied } = ranking.rankCandidates([{ offer_id: 'a', ...identical }, { offer_id: 'b', ...identical }]);
  assert.equal(tied.length, 1);
});

test('computeHHI: a single-manufacturer pool (monopoly) produces the maximum index', () => {
  const { normalized_hhi } = ranking.computeHHI([1.0]);
  assert.equal(normalized_hhi, 10000);
});

test('computeHHI: an evenly split pool produces a lower index than a concentrated one', () => {
  const even = ranking.computeHHI([0.25, 0.25, 0.25, 0.25]);
  const concentrated = ranking.computeHHI([0.7, 0.1, 0.1, 0.1]);
  assert.ok(even.normalized_hhi < concentrated.normalized_hhi);
});

test('interpretConcentration: thresholds are policy parameters, not fixed constants', () => {
  const thresholds = { low_max: 1500, moderate_max: 2500 };
  assert.equal(ranking.interpretConcentration(1000, thresholds), 'LOW');
  assert.equal(ranking.interpretConcentration(2000, thresholds), 'MODERATE');
  assert.equal(ranking.interpretConcentration(3000, thresholds), 'HIGH');
  const customThresholds = { low_max: 500, moderate_max: 1000 };
  assert.equal(ranking.interpretConcentration(1000, customThresholds), 'MODERATE');
});
