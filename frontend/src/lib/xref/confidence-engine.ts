/**
 * confidence-engine.ts
 * ELIMFILTERS — Cross Reference Intelligence Engine v1.0
 *
 * Confidence Scoring Engine.
 * Every cross-reference mapping receives a 0–100 confidence score
 * before it can be approved for the Master Data Platform.
 *
 * Scoring Model:
 *   Multi-source agreement    → +40 pts
 *   Engineering review        → +25 pts
 *   Dimension match           → +20 pts
 *   Specification match       → +10 pts
 *   Source count bonus        → +5 pts max
 *   ────────────────────────────────────
 *   TOTAL                       100 pts
 *
 * Approval Threshold: 70 pts minimum.
 */

import type {
  ConfidenceInput,
  ConfidenceResult,
  ConfidenceLevel,
  ConfidenceBreakdown,
  ValidationSource,
} from './xref-types';

// ============================================================================
// SCORE THRESHOLDS
// ============================================================================

export const CONFIDENCE_THRESHOLDS = {
  VERIFIED_MULTI_SOURCE:    100,
  VERIFIED_OEM_ENGINEERING:  95,
  VERIFIED_DIMENSIONS:       90,
  DIMENSIONS_ONLY:           80,
  CROSS_REF_ONLY:            70,
  NEEDS_REVIEW:               0,
  APPROVAL_MINIMUM:          70,
} as const;

// ============================================================================
// SOURCE WEIGHTS
// ============================================================================

const SOURCE_WEIGHTS: Record<ValidationSource, number> = {
  OEM_CATALOG:        15,
  ENGINEERING_REVIEW: 10,
  DIMENSION_MATCH:    10,
  MULTI_OEM_AGREEMENT: 5,
  AI_SUGGESTED:        3,
  MANUAL_ENTRY:        2,
};

// ============================================================================
// CONFIDENCE CALCULATOR
// ============================================================================

function scoreMultiSource(sources: ValidationSource[], sourceCount: number): ConfidenceBreakdown {
  const hasMultiple = sourceCount >= 2;
  const hasOem = sources.includes('OEM_CATALOG');
  const hasMoa = sources.includes('MULTI_OEM_AGREEMENT');

  let points = 0;
  if (hasMoa && hasMultiple) points = 40;
  else if (hasOem && hasMultiple) points = 30;
  else if (hasOem) points = 20;
  else if (sources.length > 0) points = 10;

  return {
    dimension: 'Multi-Source Agreement',
    points,
    maxPoints: 40,
    reason: hasMoa
      ? 'Multiple OEM catalogs independently agree'
      : hasOem && hasMultiple
        ? 'OEM catalog + additional source'
        : hasOem
          ? 'OEM catalog only'
          : 'Non-OEM sources only',
  };
}

function scoreEngineeringReview(engineeringReview: boolean, sources: ValidationSource[]): ConfidenceBreakdown {
  const hasEng = engineeringReview || sources.includes('ENGINEERING_REVIEW');
  return {
    dimension: 'Engineering Review',
    points: hasEng ? 25 : 0,
    maxPoints: 25,
    reason: hasEng ? 'Engineering review confirmed' : 'No engineering review performed',
  };
}

function scoreDimensionMatch(dimensionMatch: boolean): ConfidenceBreakdown {
  return {
    dimension: 'Dimension Match',
    points: dimensionMatch ? 20 : 0,
    maxPoints: 20,
    reason: dimensionMatch ? 'Physical dimensions verified' : 'Dimensions not verified',
  };
}

function scoreSpecMatch(specMatch: boolean): ConfidenceBreakdown {
  return {
    dimension: 'Specification Match',
    points: specMatch ? 10 : 0,
    maxPoints: 10,
    reason: specMatch ? 'Technical specifications match' : 'Specifications not verified',
  };
}

function scoreSourceCount(sourceCount: number): ConfidenceBreakdown {
  const points = Math.min(5, sourceCount);
  return {
    dimension: 'Source Count Bonus',
    points,
    maxPoints: 5,
    reason: `${sourceCount} independent source(s)`,
  };
}

// ============================================================================
// LEVEL DETERMINATION
// ============================================================================

export function levelFromScore(score: number): ConfidenceLevel {
  if (score >= 100) return 'VERIFIED_MULTI_SOURCE';
  if (score >= 95)  return 'VERIFIED_OEM_ENGINEERING';
  if (score >= 90)  return 'VERIFIED_DIMENSIONS';
  if (score >= 80)  return 'DIMENSIONS_ONLY';
  if (score >= 70)  return 'CROSS_REF_ONLY';
  return 'NEEDS_REVIEW';
}

// ============================================================================
// MAIN CONFIDENCE SCORER
// ============================================================================

export function scoreConfidence(input: ConfidenceInput): ConfidenceResult {
  const breakdown: ConfidenceBreakdown[] = [
    scoreMultiSource(input.sources, input.sourceCount),
    scoreEngineeringReview(input.engineeringReview, input.sources),
    scoreDimensionMatch(input.dimensionMatch),
    scoreSpecMatch(input.specMatch),
    scoreSourceCount(input.sourceCount),
  ];

  const rawScore = breakdown.reduce((sum, b) => sum + b.points, 0);
  const score = Math.min(100, rawScore);
  const level = levelFromScore(score);

  return {
    score,
    level,
    approved: score >= CONFIDENCE_THRESHOLDS.APPROVAL_MINIMUM,
    breakdown,
  };
}

// ============================================================================
// CONVENIENCE: Score from source list only (minimal input)
// ============================================================================

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
