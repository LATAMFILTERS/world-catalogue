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
  TermCategory,
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
  TERM_CATEGORY_LABELS,
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

// Article Registry (KC-00 routing and section definitions)
export type { KCSectionKey, KCSectionDefinition, ProblemStub } from './article-registry';

export {
  KC_SECTION_DEFINITIONS,
  PROBLEM_STUBS,
  PROBLEM_STUBS_BY_SLUG,
  PROBLEM_CATEGORY_LABELS,
  PROBLEM_SEVERITY_COLORS,
  buildRoute,
  termIdToSlug,
  slugToTermId,
} from './article-registry';

// Navigation Index (Phase 5A/5B)
export type {
  SidebarStandard,
  SidebarTechnology,
  SidebarSystem,
  SidebarProblem,
  SidebarArticle,
  SidebarTerm,
  KCSidebarData,
  StandardSidebarData,
  StandardSidebarArticle,
  TechSidebarArticle,
  TechSidebarData,
  SystemSidebarData,
  GlossarySidebarData,
} from './navigation-index';

export {
  KC_GRAPH_METADATA,
  getArticleSidebarData,
  getStandardSidebarData,
  getTechSidebarData,
  getSystemSidebarData,
  getGlossarySidebarData,
  getGraphStats,
} from './navigation-index';

// Phase 6D: Recommendation Engine
export type {
  KCNodeType,
  KCNodeKey,
  KCReasonType,
  KCGraphNode,
  KCGraph,
  KCRecommendation,
  KCRecommendationOptions,
} from './recommendation-types';

export { getRecommendations } from './recommendation-engine';
export { getKCRecommendationGraph, makeKey } from './recommendation-graph';

// Phase 6F: Engineering Intelligence Dashboard
export type {
  KCRankedNode,
  KCGraphSummary,
  KCTypeConnectivity,
  KCRecentStandard,
  KCDashboardData,
} from './dashboard-types';

export { KC_DASHBOARD_DATA } from './dashboard-analytics';
