/**
 * index.ts — Cross Reference Intelligence Engine Barrel Export
 * ELIMFILTERS — Cross Reference Intelligence Engine v1.0
 */

// Types
export * from './xref-types';

// Resolver
export { XREF_GRAPH, buildNodeId, buildElimNodeId, buildEdgeId,
         resolvePathsToElim, resolveOemToElim, resolveElimToOem } from './xref-resolver';

// Confidence
export { scoreConfidence, scoreFromSources, levelFromScore, CONFIDENCE_THRESHOLDS } from './confidence-engine';

// Conflict
export { detectAllConflicts } from './conflict-detector';

// Bidirectional
export { buildBidirectionalIndex, lookupElimFromOem, lookupOemFromElim,
         lookupEquivalents, getBidirectionalStats } from './bidirectional-map';

// OEM Equivalence
export { buildEquivalenceGroups, areEquivalent, getEquivalenceStats } from './oem-equivalence';

// Duplicates
export { findDuplicateNodes, findDuplicateEdges, resolveAllDuplicates } from './duplicate-resolver';

// Consistency
export { verifyConsistency } from './consistency-verifier';

// Coverage
export { analyzeCoverage } from './coverage-analyzer';

// Gaps
export { detectGaps } from './gap-detector';

// Main Orchestrator
export { registerOemPart, registerElimPart, registerMapping,
         getBidirectionalIndex, getEquivalenceGroups,
         runFullAudit, getGraphStats } from './graph-engine';
