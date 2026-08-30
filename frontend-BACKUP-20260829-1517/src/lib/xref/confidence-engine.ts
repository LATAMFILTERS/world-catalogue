/**
 * confidence-engine.ts
 * ELIMFILTERS — Cross Reference Intelligence Engine v1.0
 *
 * Confidence Scoring Engine.
 * Every cross-reference mapping receives a 0–100 confidence score
 * before it can be approved for the Master Data Platform.
 */

import type {
  ConfidenceInput,
  ConfidenceResult,
  ConfidenceLevel,
  ConfidenceBreakdown,
  ValidationSource,
} from './xref-types';

export const CONFIDENCE_THRESHOLDS = {
  VERIFIED_MULTI_SOURCE:    100,
  VERIFIED_OEM_ENGINEERING:  95,
  VERIFIED_DIMENSIONS:       90,
  DIMENSIONS_ONLY:           80,
  CROSS_REF_ONLY:            70,
  NEEDS_REVIEW:               0,
  APPROVAL_MINIMUM:          70,
} as const;

export function levelFromScore(score: number): ConfidenceLevel {
  if (score >= 100) return 'VERIFIED_MULTI_SOURCE';
  if (score >= 95)  return 'VERIFIED_OEM_ENGINEERING';
  if (score >= 90)  return 'VERIFIED_DIMENSIONS';
  if (score >= 80)  return 'DIMENSIONS_ONLY';
  if (score >= 70)  return 'CROSS_REF_ONLY';
  return 'NEEDS_REVIEW';
}

export function scoreConfidence(input: ConfidenceInput): ConfidenceResult {
  const sources = input.sources;
  let score = 0;
  let reason = '';

  const hasMultiple = input.sourceCount >= 2;
  const hasOem = sources.includes('OEM_CATALOG');
  const hasEng = input.engineeringReview || sources.includes('ENGINEERING_REVIEW');
  const hasDim = input.dimensionMatch;
  const hasSpec = input.specMatch;
  const hasMoa = input.multiOemAgreement || sources.includes('MULTI_OEM_AGREEMENT');

  if (hasMultiple && (hasMoa || (hasOem && hasEng) || input.sourceCount >= 3)) {
    score = 100;
    reason = 'Verified from multiple independent sources.';
  } else if (hasOem && hasEng) {
    score = 95;
    reason = 'Verified OEM + engineering match.';
  } else if (hasDim && hasSpec) {
    score = 90;
    reason = 'Verified dimensions + specifications.';
  } else if (hasDim) {
    score = 80;
    reason = 'Verified dimensions only.';
  } else if (hasOem || sources.length > 0) {
    score = 70;
    reason = 'Cross reference only.';
  } else {
    score = 0;
    reason = 'Needs engineering review.';
  }

  const breakdown: ConfidenceBreakdown[] = [{
    dimension: 'Overall Confidence',
    points: score,
    maxPoints: 100,
    reason,
  }];

  return {
    score,
    level: levelFromScore(score),
    approved: score >= CONFIDENCE_THRESHOLDS.APPROVAL_MINIMUM,
    breakdown,
  };
}

export function scoreFromSources(sources: ValidationSource[]): ConfidenceResult {
  return scoreConfidence({
    sources,
    dimensionMatch: sources.includes('DIMENSION_MATCH'),
    specMatch: false,
    multiOemAgreement: sources.includes('MULTI_OEM_AGREEMENT'),
    engineeringReview: sources.includes('ENGINEERING_REVIEW'),
    sourceCount: sources.length,
  });
}
