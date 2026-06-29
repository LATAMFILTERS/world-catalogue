/**
 * quality-engine.ts
 * ELIMFILTERS — Data Ingestion Framework v1.0
 *
 * Quality Scoring Engine.
 * Every record in the pipeline receives a 0–100 quality score.
 *
 * Scoring Model:
 *   Required Fields Present      30 pts
 *   No Validation Errors         25 pts
 *   No Validation Warnings       10 pts
 *   Relationships Resolved       20 pts
 *   Optional Enrichment Fields   15 pts
 *   ─────────────────────────────────
 *   TOTAL                       100 pts
 *
 * Assessment Thresholds:
 *   100          → COMPLETE
 *   90–99        → NEAR_COMPLETE
 *   75–89        → GOOD
 *   50–74        → NEEDS_REVIEW
 *   25–49        → INCOMPLETE
 *   0–24         → REJECTED
 */

import type {
  NormalizedRecord,
  ValidationResult,
  RelationshipMap,
  QualityScore,
  QualityComponent,
  QualityAssessment,
  PipelineDecision,
  IngestionDomain,
} from './ingestion-types';

// ============================================================================
// OPTIONAL ENRICHMENT FIELDS — bonus points if present
// ============================================================================

const OPTIONAL_FIELDS: Record<IngestionDomain, string[]> = {
  OEM:             ['country', 'website', 'description', 'product_categories'],
  OEM_PART:        ['applications', 'equipment', 'dimensions', 'thread', 'pressure'],
  CROSS_REFERENCE: ['validation_status', 'notes'],
  EQUIPMENT:       ['series', 'year_from', 'year_to', 'applications'],
  ENGINE:          ['displacement', 'power_kw', 'torque_nm', 'applications'],
  APPLICATION:     ['description', 'industries'],
  PRODUCT:         ['technology', 'protection_system', 'platform', 'dimensions', 'micron_rating'],
};

const REQUIRED_FIELDS_COUNT: Record<IngestionDomain, number> = {
  OEM:             3,
  OEM_PART:        3,
  CROSS_REFERENCE: 2,
  EQUIPMENT:       4,
  ENGINE:          4,
  APPLICATION:     3,
  PRODUCT:         3,
};

// ============================================================================
// SCORING DIMENSIONS
// ============================================================================

function scoreRequiredFields(record: NormalizedRecord, errorCount: number): QualityComponent {
  const required = REQUIRED_FIELDS_COUNT[record.domain] ?? 3;
  // Estimate fields present: if no missing-field errors, all required are present
  const missingCount = errorCount; // approximation
  const present = Math.max(0, required - missingCount);
  const earned = Math.round((present / required) * 30);
  return {
    dimension: 'Required Fields',
    maxPoints: 30,
    earned,
    notes: `${present}/${required} required fields populated`,
  };
}

function scoreValidationErrors(errorCount: number): QualityComponent {
  const earned = errorCount === 0 ? 25 : Math.max(0, 25 - errorCount * 8);
  return {
    dimension: 'Validation Errors',
    maxPoints: 25,
    earned,
    notes: errorCount === 0 ? 'No errors' : `${errorCount} error(s) found`,
  };
}

function scoreValidationWarnings(warningCount: number): QualityComponent {
  const earned = warningCount === 0 ? 10 : Math.max(0, 10 - warningCount * 3);
  return {
    dimension: 'Validation Warnings',
    maxPoints: 10,
    earned,
    notes: warningCount === 0 ? 'No warnings' : `${warningCount} warning(s) found`,
  };
}

function scoreRelationships(relationship: RelationshipMap): QualityComponent {
  const unresolvedCount = relationship.unresolved?.length ?? 0;
  const earned = unresolvedCount === 0 ? 20 : Math.max(0, 20 - unresolvedCount * 5);
  return {
    dimension: 'Relationship Resolution',
    maxPoints: 20,
    earned,
    notes: unresolvedCount === 0
      ? 'All relationships resolved'
      : `${unresolvedCount} unresolved relationship(s)`,
  };
}

function scoreEnrichment(record: NormalizedRecord): QualityComponent {
  const optional = OPTIONAL_FIELDS[record.domain] ?? [];
  if (optional.length === 0) {
    return { dimension: 'Optional Enrichment', maxPoints: 15, earned: 15, notes: 'No optional fields for domain' };
  }
  const present = optional.filter((f) => {
    const v = record.fields[f];
    return v !== null && v !== undefined && v !== '';
  }).length;
  const earned = Math.round((present / optional.length) * 15);
  return {
    dimension: 'Optional Enrichment',
    maxPoints: 15,
    earned,
    notes: `${present}/${optional.length} optional fields populated`,
  };
}

function assessmentFromScore(score: number): QualityAssessment {
  if (score >= 100) return 'COMPLETE';
  if (score >= 90)  return 'NEAR_COMPLETE';
  if (score >= 75)  return 'GOOD';
  if (score >= 50)  return 'NEEDS_REVIEW';
  if (score >= 25)  return 'INCOMPLETE';
  return 'REJECTED';
}

export function decisionFromScore(score: number, errorCount = 0): PipelineDecision {
  if (errorCount > 0) return 'REJECTED';
  if (score >= 75) return 'APPROVED';
  if (score >= 50) return 'PENDING_REVIEW';
  return 'REJECTED';
}

// ============================================================================
// MAIN QUALITY SCORER
// ============================================================================

export function scoreRecord(
  record: NormalizedRecord,
  validation: ValidationResult,
  relationship: RelationshipMap
): QualityScore {
  const components: QualityComponent[] = [
    scoreRequiredFields(record, validation.errorCount),
    scoreValidationErrors(validation.errorCount),
    scoreValidationWarnings(validation.warningCount),
    scoreRelationships(relationship),
    scoreEnrichment(record),
  ];

  const totalScore = Math.min(100, components.reduce((sum, c) => sum + c.earned, 0));

  return {
    sourceId: record.sourceId,
    score: totalScore,
    components,
    assessment: assessmentFromScore(totalScore),
  };
}

export function scoreRecords(
  records: NormalizedRecord[],
  validations: ValidationResult[],
  relationships: RelationshipMap[]
): QualityScore[] {
  return records.map((r, i) => scoreRecord(r, validations[i], relationships[i]));
}
