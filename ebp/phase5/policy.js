'use strict';

// EBP Phase 5 — pure Selection Policy scoring functions: normalization,
// per-category aggregation, and composite score. No weight, normalization
// limit, or gate is hardcoded here — every number this module uses comes
// from the Selection Policy row passed in (Decision 01/07, ADR-0062/0068).
// This module is deliberately side-effect-free (no DB, no I/O) so it can
// be unit tested in isolation and so a ranking is always reproducible
// given identical inputs (Principle 7).

const CATEGORIES = ['ENGINEERING', 'COMMERCIAL', 'OPERATIONAL', 'STRATEGIC'];

function defaultSelectionPolicyFields({ policyCode = 'SELPOL-0001', scopeType = 'PLATFORM', scopeValue = null } = {}) {
  return {
    policy_code: policyCode,
    name: 'Selection Policy v1.0 — Default',
    description: 'Initial Selection Policy per Decision 01/ADR-0062: Technical Quality 40%, Commercial Competitiveness 25%, Operational Capability 20%, Strategic Resilience 15%.',
    scope_type: scopeType,
    scope_value: scopeValue,
    weights: { ENGINEERING: 0.40, COMMERCIAL: 0.25, OPERATIONAL: 0.20, STRATEGIC: 0.15 },
    criteria: {},
    normalization: {},
    gates: {},
    penalties: { approved_exception_penalty: 10 },
    diversification_rules: { required: [], preferred: ['country_code'], exceptions: 'insufficient_alternatives' },
    concentration_thresholds: { low_max: 1500, moderate_max: 2500 },
    preferred_manufacturer_bonus: { bonus_points: 5 },
  };
}

function validateWeights(weights) {
  const errors = [];
  for (const cat of CATEGORIES) {
    if (typeof weights[cat] !== 'number' || weights[cat] < 0) {
      errors.push(`weights.${cat} must be a non-negative number`);
    }
  }
  const sum = CATEGORIES.reduce((acc, c) => acc + (Number(weights[c]) || 0), 0);
  if (Math.abs(sum - 1) > 0.0001) {
    errors.push(`weights must sum to 1.0 (100%) — got ${sum}`);
  }
  return errors;
}

// normalizeLinear: maps `value` linearly onto [0, 100] given the observed
// pool [min, max]. `lowerIsBetter` inverts the scale (e.g. FOB, lead time).
function normalizeLinear(value, min, max, lowerIsBetter = false) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return null;
  if (min === max) return 100; // only one observed value in the pool — no spread to normalize against
  const v = Number(value);
  const clamped = Math.min(Math.max(v, min), max);
  let score = ((clamped - min) / (max - min)) * 100;
  if (lowerIsBetter) score = 100 - score;
  return Math.round(score * 100) / 100;
}

// computeCategoryScore: unweighted average of a category's normalized
// factor scores (Selection Policy v1.0's default aggregation — itself
// replaceable by a future Selection Policy version, ADR-0062 §3A).
function computeCategoryScore(factorScoresForCategory) {
  const withValues = factorScoresForCategory.filter((f) => f.normalized_value !== null && f.normalized_value !== undefined);
  if (!withValues.length) return null;
  const sum = withValues.reduce((acc, f) => acc + Number(f.normalized_value), 0);
  return Math.round((sum / withValues.length) * 100) / 100;
}

// computeCompositeScore: the fixed formula (ADR-0062) — weights come from
// the policy, never hardcoded here beyond the arithmetic combinator itself.
function computeCompositeScore(categoryScores, weights) {
  let total = 0;
  for (const cat of CATEGORIES) {
    const score = categoryScores[cat];
    const weight = Number(weights[cat]) || 0;
    total += (score || 0) * weight;
  }
  return Math.round(total * 100) / 100;
}

// applyExceptionPenalty: Decision 01's Technical Priority Rule — an Offer
// carrying APPROVED Exceptions competes but must be explicitly penalized,
// never scored as if it had zero Exceptions. Penalty magnitude is a
// policy parameter (`penalties.approved_exception_penalty`), applied once
// per approved exception, subtracted from the Engineering category score.
function applyExceptionPenalty(engineeringScore, approvedExceptionCount, penalties) {
  const perException = Number(penalties?.approved_exception_penalty) || 0;
  const penalty = perException * approvedExceptionCount;
  const penalized = Math.max(0, (engineeringScore || 0) - penalty);
  return { penalized_score: Math.round(penalized * 100) / 100, penalty_applied: Math.round(penalty * 100) / 100 };
}

// applyPreferredManufacturerBonus: applied strictly AFTER the composite
// score (Decision 10/ADR-0071) — the ranking must retain all three values.
function applyPreferredManufacturerBonus(compositeScorePreBonus, isPreferred, bonusConfig) {
  const bonus = isPreferred ? (Number(bonusConfig?.bonus_points) || 0) : 0;
  const final = Math.min(100, compositeScorePreBonus + bonus);
  return { composite_score_final: Math.round(final * 100) / 100, bonus_applied: bonus };
}

module.exports = {
  CATEGORIES,
  defaultSelectionPolicyFields,
  validateWeights,
  normalizeLinear,
  computeCategoryScore,
  computeCompositeScore,
  applyExceptionPenalty,
  applyPreferredManufacturerBonus,
};
