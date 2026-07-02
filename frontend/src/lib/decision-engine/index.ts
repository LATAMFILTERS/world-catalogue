/**
 * Engineering Decision Engine — Public API
 *
 * Governing authority: ENGINEERING_DECISION_ENGINE v1.1
 * Constitutional basis: ENGINEERING_EXPERIENCE_PRINCIPLES v1.3, Principles 12–13
 *
 * Entry point: evaluate(input)
 *
 * No engineering recommendation may bypass this engine.
 * The platform may reason only after it has earned the right to reason.
 */

export { evaluate } from './EvaluationOrchestrator';
export { buildInventory } from './EvidenceInventory';
export { auditClaims } from './InferenceAudit';
export { calculateConfidence } from './ConfidenceCalculator';
export { compose } from './RecommendationComposer';

export type {
  // Core types
  EvaluationInput,
  EvaluationResult,
  DecisionState,
  ConfidenceLevel,
  IntentClass,
  ContaminationDomain,

  // PROHIBITED gate
  ProhibitedGateResult,
  ProhibitedReason,

  // Evidence
  EvidenceCategory,
  EvidenceInventoryResult,
  EvidenceAvailability,

  // Inference
  ClaimAudit,
  InferenceAuditResult,
  InferenceType,

  // Confidence
  ConfidenceCalculationResult,

  // Composition
  CompositionResult,
  RecommendationComposition,
  ProhibitedComposition,
  InsufficientComposition,
} from './decision-engine-types';
