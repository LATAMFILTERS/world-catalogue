/**
 * index.ts
 * ELIMFILTERS Engineering Knowledge Platform — KC Module Barrel Export
 *
 * Single import point for all KC-00 governance types, registries, and utilities.
 * Import from '@/lib/knowledge-center' in any component or data file.
 */

// KC-00: Governance types
export type {
  EntityPrefix,
  PermanentId,
  EntityStatus,
  EntityVersion,
  EvidenceAuthorityLevel,
  EvidenceConfidence,
  EvidenceGovernance,
  TerminologyEntry,
  ReviewFrequency,
  KnowledgeLifecycle,
  EngineeringQualityScore,
  Audience,
  Visibility,
  EnterpriseConfig,
  HierarchyLevel,
  ValidationStatus,
} from './governance';

export {
  HIERARCHY_LABELS,
  AUTHORITY_THRESHOLDS,
} from './governance';

// Terminology Registry
export {
  TERMINOLOGY_REGISTRY,
  getTerm,
  getPublishedTerms,
  resolveTerms,
} from './terminology-registry';

// Problem Types (KC-11)
export type {
  ProblemCategory,
  FailureProgressionStage,
  ProblemTechnologyRecommendation,
  Component,
  ContaminationType,
  Problem,
  ProblemRegistry,
  CanonicalProblemId,
} from './problem-types';

export { CANONICAL_PROBLEM_IDS } from './problem-types';
