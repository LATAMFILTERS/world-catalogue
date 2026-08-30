/**
 * graph-engine.ts
 * ELIMFILTERS — Cross Reference Intelligence Engine v1.0
 *
 * Graph Engine Orchestrator.
 * The single entry point for all graph operations.
 * Provides the full audit pipeline and public API.
 */

import type {
  XrefNode,
  XrefEdge,
  GraphAuditResult,
  ConfidenceInput,
  ConfidenceLevel,
} from './xref-types';

import { XREF_GRAPH, buildNodeId, buildElimNodeId, buildEdgeId,
         resolveOemToElim, resolveElimToOem } from './xref-resolver';
import { scoreConfidence, levelFromScore }   from './confidence-engine';
import { detectAllConflicts }                from './conflict-detector';
import { buildBidirectionalIndex }           from './bidirectional-map';
import { buildEquivalenceGroups }            from './oem-equivalence';
import { resolveAllDuplicates }              from './duplicate-resolver';
import { verifyConsistency }                 from './consistency-verifier';
import { analyzeCoverage }                   from './coverage-analyzer';
import { detectGaps }                        from './gap-detector';

// ============================================================================
// NODE REGISTRATION
// ============================================================================

export function registerOemPart(params: {
  oemId: string;
  partNumber: string;
  duty?: 'HD' | 'LD' | 'UNKNOWN';
  category?: string;
  sourceId?: string;
}): XrefNode {
  const normalized = params.partNumber.toUpperCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '');
  const node: XrefNode = {
    id: buildNodeId(params.oemId, params.partNumber),
    type: 'OEM_PART',
    oemId: params.oemId,
    partNumber: params.partNumber,
    partNumberNormalized: normalized,
    duty: params.duty ?? 'UNKNOWN',
    category: params.category ?? '',
    sourceId: params.sourceId ?? 'manual',
    addedAt: new Date().toISOString(),
  };
  XREF_GRAPH.addNode(node);
  return node;
}

export function registerElimPart(params: {
  partNumber: string;
  duty?: 'HD' | 'LD' | 'UNKNOWN';
  category?: string;
  sourceId?: string;
}): XrefNode {
  const normalized = params.partNumber.toUpperCase();
  const node: XrefNode = {
    id: buildElimNodeId(params.partNumber),
    type: 'ELIMFILTERS',
    oemId: 'elimfilters',
    partNumber: params.partNumber,
    partNumberNormalized: normalized,
    duty: params.duty ?? 'UNKNOWN',
    category: params.category ?? '',
    sourceId: params.sourceId ?? 'manual',
    addedAt: new Date().toISOString(),
  };
  XREF_GRAPH.addNode(node);
  return node;
}

// ============================================================================
// EDGE REGISTRATION (MAPPING)
// ============================================================================

export function registerMapping(params: {
  fromOemId: string;
  fromPartNumber: string;
  toPartNumber: string;
  confidenceInput: ConfidenceInput;
  sourceId?: string;
  notes?: string;
}): XrefEdge {
  const fromNodeId = buildNodeId(params.fromOemId, params.fromPartNumber);
  const toNodeId   = buildElimNodeId(params.toPartNumber);
  const edgeId     = buildEdgeId(fromNodeId, toNodeId);
  const confidence = scoreConfidence(params.confidenceInput);

  const edge: XrefEdge = {
    id: edgeId,
    fromNodeId,
    toNodeId,
    direction: 'OEM_TO_ELIMFILTERS',
    confidenceScore: confidence.score,
    confidenceLevel: confidence.level,
    validationSources: params.confidenceInput.sources,
    status: confidence.approved ? 'ACTIVE' : 'PENDING_REVIEW',
    addedAt: new Date().toISOString(),
    sourceId: params.sourceId ?? 'manual',
    notes: params.notes,
  };

  XREF_GRAPH.addEdge(edge);
  return edge;
}

// ============================================================================
// QUERY API
// ============================================================================

export { resolveOemToElim, resolveElimToOem };

export function getBidirectionalIndex() {
  return buildBidirectionalIndex();
}

export function getEquivalenceGroups() {
  return buildEquivalenceGroups();
}

// ============================================================================
// FULL GRAPH AUDIT
// ============================================================================

let auditCounter = 0;
export function runFullAudit(): GraphAuditResult {
  const auditId = `AUDIT_${String(++auditCounter).padStart(6, '0')}_${Date.now()}`;
  const auditedAt = new Date().toISOString();

  const conflicts  = detectAllConflicts();
  const consistency = verifyConsistency();
  const coverage   = analyzeCoverage();
  const gaps       = detectGaps();
  const { nodeGroups, edgeGroups, totalDuplicates } = resolveAllDuplicates();

  const criticalConflicts = conflicts.filter(c => c.severity === 'CRITICAL').length;
  const criticalConsistency = consistency.failed;
  const passed = criticalConflicts === 0 && criticalConsistency === 0 && totalDuplicates === 0;

  const summaryParts = [
    `${XREF_GRAPH.nodeCount} nodes, ${XREF_GRAPH.edgeCount} edges`,
    `${conflicts.length} conflict(s)`,
    `${consistency.issues.length} consistency issue(s)`,
    `${gaps.totalGaps} gap(s) in work queue`,
    `${totalDuplicates} duplicate(s)`,
    passed ? '✅ AUDIT PASSED' : '⚠️ AUDIT REQUIRES ATTENTION',
  ];

  return {
    auditId,
    auditedAt,
    totalNodes: XREF_GRAPH.nodeCount,
    totalEdges: XREF_GRAPH.edgeCount,
    activeEdges: XREF_GRAPH.activeEdgeCount,
    conflicts,
    coverage,
    gaps,
    consistency,
    duplicates: [...nodeGroups, ...edgeGroups],
    passed,
    summary: summaryParts.join(' | '),
  };
}

// ============================================================================
// GRAPH STATS
// ============================================================================

export function getGraphStats() {
  return {
    totalNodes: XREF_GRAPH.nodeCount,
    totalEdges: XREF_GRAPH.edgeCount,
    activeEdges: XREF_GRAPH.activeEdgeCount,
    oemParts: XREF_GRAPH.getNodesByType('OEM_PART').length,
    elimParts: XREF_GRAPH.getNodesByType('ELIMFILTERS').length,
  };
}
