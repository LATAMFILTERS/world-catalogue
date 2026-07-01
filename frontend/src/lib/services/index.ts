/**
 * Phase 3 — Engineering Services: Barrel Exports
 *
 * Single import point for all Phase 3 services.
 * Internal use only — not a public API.
 */

// Knowledge Service (graph lifecycle)
export {
  loadGraph,
  reloadGraph,
  getGraph,
  getGraphVersion,
  getKnowledgeGraphSummary,
} from './knowledge-service';

// Search Service
export type { SearchResult, SearchOptions, SearchEntityType } from './search-service';
export { search, searchByType, findById } from './search-service';

// Recommendation Service
export type { Recommendation, RecommendationStep } from './recommendation-service';
export {
  recommendFromPrinciple,
  recommendFromFailureMode,
  recommendFromContamination,
  recommendFromTechnology,
  resetRecommendationCounter,
} from './recommendation-service';

// Citation Service
export {
  citeEntity,
  citeTraversal,
  citeRecommendation,
  formatCitation,
  getEntityAuditTrail,
} from './citation-service';

// Provenance Service
export type {
  EntityProvenance,
  RelationshipProvenance,
  VersionHistoryEntry,
  GovernanceSummary,
} from './provenance-service';
export {
  getEntityProvenance,
  getRelProvenance,
  getMemoryFor,
  getFullAuditTrail,
  listDeprecatedEntities,
  listAliasEntities,
  getVersionHistory,
  getGovernanceSummary,
  listEntitiesWithProvenance,
} from './provenance-service';

// AI Context Builder
export type {
  AIContextNode,
  AIContextRelationship,
  AIContextCitation,
  AIContextPackage,
} from './ai-context-builder';
export {
  buildAIContext,
  buildAIContextBatch,
  resetAIContextCounter,
} from './ai-context-builder';
