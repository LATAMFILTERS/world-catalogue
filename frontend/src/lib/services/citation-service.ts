/**
 * Phase 3 — Engineering Services: Citation Service
 *
 * Wraps the Phase 2 Citation Engine with service-level operations.
 * Every engineering statement remains traceable to its Foundation source.
 */

import { getGraph } from './knowledge-service';
import { cite, citeAll, formatCitation } from '@/lib/graph/citation-engine';
import { getAuditTrail } from '@/lib/graph/provenance';
import type { CitationObject } from '@/lib/graph/graph-types';
import type { Recommendation, RecommendationStep } from './recommendation-service';
import type { TraversalResult } from '@/lib/graph/graph-types';

// ─── Entity Citation ──────────────────────────────────────────────────────────

/**
 * Cite a single entity by entity ID.
 * The claim is the engineering statement being made about it.
 */
export function citeEntity(entityId: string, claim: string): CitationObject {
  const graph = getGraph();
  const nid = graph.nodesByEntityId.get(entityId);
  if (!nid) {
    throw new Error(`Citation error: entity ${entityId} not found in Knowledge Graph`);
  }
  return cite(graph, nid, claim);
}

// ─── Traversal Citation ───────────────────────────────────────────────────────

/**
 * Cite all nodes visited during a traversal.
 * Returns one CitationObject per visited node.
 */
export function citeTraversal(
  result: TraversalResult,
  claimTemplate: (entityId: string, entityType: string) => string,
): CitationObject[] {
  const graph = getGraph();
  return citeAll(
    graph,
    result.visitedNodes.map((node) => ({
      nodeId: node.nodeId,
      claim: claimTemplate(node.entityId, node.entityType),
      supportingRelationshipIds: result.relationships
        .filter((r) => r.sourceNodeId === node.nodeId || r.targetNodeId === node.nodeId)
        .map((r) => r.relationshipId),
    })),
  );
}

// ─── Recommendation Citation ──────────────────────────────────────────────────

/**
 * Cite a recommendation — produces one CitationObject for the target entity,
 * with supporting relationship ids from every step.
 */
export function citeRecommendation(recommendation: Recommendation): CitationObject {
  const graph = getGraph();
  const targetNid = graph.nodesByEntityId.get(recommendation.targetEntityId);
  if (!targetNid) {
    throw new Error(
      `Citation error: recommendation target ${recommendation.targetEntityId} not found`,
    );
  }

  // Collect all relationship ids referenced across steps
  const supportingRelIds = recommendation.steps.flatMap((s: RecommendationStep) => {
    const fromNid = graph.nodesByEntityId.get(s.fromEntityId);
    const toNid = graph.nodesByEntityId.get(s.toEntityId);
    if (!fromNid || !toNid) return [];
    const relId = `REL-${s.fromEntityId}-${s.relationshipType}-${s.toEntityId}`;
    return graph.relationships.has(relId) ? [relId] : [];
  });

  return cite(graph, targetNid, recommendation.explanation, supportingRelIds);
}

// ─── Formatted Output ─────────────────────────────────────────────────────────

/**
 * Format a citation as a human-readable reference string.
 */
export { formatCitation };

/**
 * Get the full audit trail for an entity as a structured object.
 */
export function getEntityAuditTrail(entityId: string) {
  return getAuditTrail(getGraph(), entityId);
}
