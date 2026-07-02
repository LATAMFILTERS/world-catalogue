/**
 * Phase 2 — Knowledge Graph Core: Citation Engine
 *
 * Every engineering statement traced to its Foundation registry source.
 * Citations are immutable; once created they are not modified.
 */

import type { KnowledgeGraph, GraphNode, CitationObject, NodeEntityType } from './graph-types';

let _citationCounter = 0;

function nextCitationId(): string {
  return `CIT-${String(++_citationCounter).padStart(6, '0')}`;
}

function traceability(
  node: GraphNode,
  supportingRelCount: number,
): CitationObject['traceability'] {
  if (
    node.provenance.sourceRegistry &&
    node.provenance.entityVersion &&
    supportingRelCount > 0
  ) {
    return 'FULL';
  }
  if (node.provenance.sourceRegistry) return 'PARTIAL';
  return 'NONE';
}

/**
 * Create a CitationObject for a claim about a specific graph node.
 *
 * @param graph - the live KnowledgeGraph
 * @param nodeId - the node the claim is about
 * @param claim - the engineering statement being cited
 * @param supportingRelationshipIds - relationship ids that evidence the claim
 */
export function cite(
  graph: KnowledgeGraph,
  nodeId: string,
  claim: string,
  supportingRelationshipIds: string[] = [],
): CitationObject {
  const node = graph.nodes.get(nodeId);
  if (!node) {
    throw new Error(`Citation error: node ${nodeId} not found in graph`);
  }

  return {
    citationId: nextCitationId(),
    claim,
    sourceNodeId: node.nodeId,
    sourceEntityType: node.entityType as NodeEntityType,
    sourceEntityId: node.entityId,
    sourceRegistry: node.provenance.sourceRegistry,
    sourceVersion: node.provenance.entityVersion,
    supportingRelationshipIds,
    memoryEntryIds: [...node.provenance.memoryEntryIds],
    edrRefs: [...node.provenance.edrRefs],
    citedAt: new Date().toISOString().split('T')[0],
    traceability: traceability(node, supportingRelationshipIds.length),
  };
}

/**
 * Batch-cite: create citations for multiple (nodeId, claim) pairs.
 */
export function citeAll(
  graph: KnowledgeGraph,
  entries: Array<{ nodeId: string; claim: string; supportingRelationshipIds?: string[] }>,
): CitationObject[] {
  return entries.map((e) =>
    cite(graph, e.nodeId, e.claim, e.supportingRelationshipIds ?? []),
  );
}

/**
 * Format a CitationObject as a human-readable reference string.
 *
 * Example:
 *   [TECH-MACROCORE v1.0.1 | technology-architectures.ts]
 *   "Air intake contamination is controlled by MACROCORE using centrifugal pre-separation and depth filtration."
 */
export function formatCitation(citation: CitationObject): string {
  return (
    `[${citation.sourceEntityId} v${citation.sourceVersion} | ${citation.sourceRegistry}]\n` +
    `"${citation.claim}"\n` +
    `Traceability: ${citation.traceability}` +
    (citation.edrRefs.length > 0 ? ` | EDR: ${citation.edrRefs.join(', ')}` : '') +
    (citation.memoryEntryIds.length > 0 ? ` | MEM: ${citation.memoryEntryIds.join(', ')}` : '')
  );
}

/**
 * Reset citation counter (for test isolation).
 */
export function resetCitationCounter(): void {
  _citationCounter = 0;
}
