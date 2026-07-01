/**
 * Phase 2 — Knowledge Graph Core: Barrel Exports
 *
 * Single import point for all graph services.
 * Internal use only — not a public API.
 */

// Type definitions
export type {
  NodeEntityType,
  RelationshipType,
  GovernanceStatus,
  NodeProvenance,
  GraphNode,
  GraphRelationship,
  CitationObject,
  TraversalStep,
  TraversalPath,
  TraversalOptions,
  TraversalResult,
  KnowledgeGraph,
  GraphValidationIssue,
  GraphValidationReport,
} from './graph-types';

// Graph lifecycle
export { buildKnowledgeGraph, invalidateGraphCache } from './graph-builder';

// Traversal
export { traverse, findPath } from './graph-traversal';

// Citation
export { cite, citeAll, formatCitation, resetCitationCounter } from './citation-engine';

// Provenance
export {
  getNodeProvenance,
  getRelationshipProvenance,
  getMemoryForNode,
  getAuditTrail,
  getDeprecatedNodes,
  getAliasNodes,
} from './provenance';

// Validation
export { validateGraph } from './graph-validation';

// Graph API (internal query services)
export {
  getNode,
  getNodeByEntityId,
  getNodesByType,
  getRelationships,
  findProductsByPrinciple,
  findTechnologiesByFailureMode,
  findStandards,
  findEngineeringMemory,
  findTechnologiesByContamination,
  getGraphSummary,
} from './graph-api';
