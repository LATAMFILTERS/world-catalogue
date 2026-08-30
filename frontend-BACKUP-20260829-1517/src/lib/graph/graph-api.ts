/**
 * Phase 2 — Knowledge Graph Core: Internal Graph API
 *
 * Internal-only services for querying the Knowledge Graph.
 * Not a public API, not a REST API, not a frontend interface.
 *
 * All functions are pure: they consume the graph and return results.
 * The graph itself is never mutated by these functions.
 */

import type {
  KnowledgeGraph,
  GraphNode,
  GraphRelationship,
  TraversalOptions,
  TraversalResult,
  TraversalPath,
  NodeEntityType,
} from './graph-types';
import { traverse, findPath } from './graph-traversal';

// ─── Node Queries ─────────────────────────────────────────────────────────────

/**
 * Get a single graph node by its nodeId (NODE-{entityId}).
 */
export function getNode(graph: KnowledgeGraph, nodeId: string): GraphNode | null {
  return graph.nodes.get(nodeId) ?? null;
}

/**
 * Get a graph node by the original entity ID (e.g. 'TECH-MACROCORE').
 */
export function getNodeByEntityId(graph: KnowledgeGraph, entityId: string): GraphNode | null {
  const nid = graph.nodesByEntityId.get(entityId);
  if (!nid) return null;
  return graph.nodes.get(nid) ?? null;
}

/**
 * Get all nodes of a given entity type.
 */
export function getNodesByType(graph: KnowledgeGraph, type: NodeEntityType): GraphNode[] {
  const ids = graph.nodesByEntityType.get(type) ?? [];
  return ids.map((id) => graph.nodes.get(id)).filter((n): n is GraphNode => n !== undefined);
}

// ─── Relationship Queries ────────────────────────────────────────────────────

/**
 * Get all relationships (outbound and inbound) for a node.
 */
export function getRelationships(
  graph: KnowledgeGraph,
  nodeId: string,
): { outbound: GraphRelationship[]; inbound: GraphRelationship[] } {
  const outRelIds = graph.adjacency.get(nodeId) ?? [];
  const inRelIds = graph.reverseAdjacency.get(nodeId) ?? [];

  const outbound = outRelIds
    .map((id) => graph.relationships.get(id))
    .filter((r): r is GraphRelationship => r !== undefined);

  const inbound = inRelIds
    .map((id) => graph.relationships.get(id))
    .filter((r): r is GraphRelationship => r !== undefined);

  return { outbound, inbound };
}

// ─── Traversal ───────────────────────────────────────────────────────────────

export { traverse, findPath };

// ─── Domain-Specific Queries ─────────────────────────────────────────────────

/**
 * Find all products (ProtectionMedia) that implement a given EngineeringPrinciple.
 *
 * Traverses: EngineeringPrinciple ← REALIZES — ProtectionMedia
 */
export function findProductsByPrinciple(
  graph: KnowledgeGraph,
  principleEntityId: string,
): GraphNode[] {
  const principleNid = graph.nodesByEntityId.get(principleEntityId);
  if (!principleNid) return [];

  const inRelIds = graph.reverseAdjacency.get(principleNid) ?? [];
  return inRelIds
    .map((relId) => graph.relationships.get(relId))
    .filter((rel) => rel?.type === 'REALIZES')
    .map((rel) => graph.nodes.get(rel!.sourceNodeId))
    .filter((n): n is GraphNode => n !== undefined && n.entityType === 'PROTECTION_MEDIA');
}

/**
 * Find all technologies that control a given failure mode (by entityId).
 *
 * Traverses: FailureMode ← PREVENTS — Technology
 */
export function findTechnologiesByFailureMode(
  graph: KnowledgeGraph,
  failureModeEntityId: string,
): GraphNode[] {
  const fmNid = graph.nodesByEntityId.get(failureModeEntityId);
  if (!fmNid) return [];

  const inRelIds = graph.reverseAdjacency.get(fmNid) ?? [];
  return inRelIds
    .map((relId) => graph.relationships.get(relId))
    .filter((rel) => rel?.type === 'PREVENTS')
    .map((rel) => graph.nodes.get(rel!.sourceNodeId))
    .filter((n): n is GraphNode => n !== undefined && n.entityType === 'TECHNOLOGY_ARCHITECTURE');
}

/**
 * Find all standards applicable to a technology or engineering principle.
 *
 * Traverses: Standard → VALIDATES → {Technology|EngineeringPrinciple}
 */
export function findStandards(
  graph: KnowledgeGraph,
  entityId: string,
): GraphNode[] {
  const targetNid = graph.nodesByEntityId.get(entityId);
  if (!targetNid) return [];

  const inRelIds = graph.reverseAdjacency.get(targetNid) ?? [];
  return inRelIds
    .map((relId) => graph.relationships.get(relId))
    .filter((rel) => rel?.type === 'VALIDATES')
    .map((rel) => graph.nodes.get(rel!.sourceNodeId))
    .filter((n): n is GraphNode => n !== undefined && n.entityType === 'STANDARD');
}

/**
 * Find all Engineering Memory entries for an entity.
 *
 * Traverses: entity → HAS_MEMORY → EngineeringMemory
 */
export function findEngineeringMemory(
  graph: KnowledgeGraph,
  entityId: string,
): GraphNode[] {
  const sourceNid = graph.nodesByEntityId.get(entityId);
  if (!sourceNid) return [];

  const outRelIds = graph.adjacency.get(sourceNid) ?? [];
  return outRelIds
    .map((relId) => graph.relationships.get(relId))
    .filter((rel) => rel?.type === 'HAS_MEMORY')
    .map((rel) => graph.nodes.get(rel!.targetNodeId))
    .filter((n): n is GraphNode => n !== undefined && n.entityType === 'ENGINEERING_MEMORY');
}

/**
 * Find all technologies that address a contamination type.
 *
 * Traverses: Contamination → GENERATES → FailureMode ← PREVENTS — Technology
 */
export function findTechnologiesByContamination(
  graph: KnowledgeGraph,
  contaminationEntityId: string,
): GraphNode[] {
  const contNid = graph.nodesByEntityId.get(contaminationEntityId);
  if (!contNid) return [];

  // Step 1: Find failure modes generated by this contamination
  const generatesRels = (graph.adjacency.get(contNid) ?? [])
    .map((relId) => graph.relationships.get(relId))
    .filter((rel) => rel?.type === 'GENERATES');

  const techSet = new Map<string, GraphNode>();

  for (const genRel of generatesRels) {
    if (!genRel) continue;
    const fmNid = genRel.targetNodeId;
    // Step 2: Find technologies that PREVENT this failure mode
    const preventsRels = (graph.reverseAdjacency.get(fmNid) ?? [])
      .map((relId) => graph.relationships.get(relId))
      .filter((rel) => rel?.type === 'PREVENTS');

    for (const prevRel of preventsRels) {
      if (!prevRel) continue;
      const techNode = graph.nodes.get(prevRel.sourceNodeId);
      if (techNode && techNode.entityType === 'TECHNOLOGY_ARCHITECTURE') {
        techSet.set(techNode.nodeId, techNode);
      }
    }
  }

  return Array.from(techSet.values());
}

/**
 * Summarize the Knowledge Graph structure.
 */
export function getGraphSummary(graph: KnowledgeGraph): {
  version: string;
  builtAt: string;
  totalNodes: number;
  totalRelationships: number;
  nodesByType: Record<string, number>;
  relationshipsByType: Record<string, number>;
} {
  const nodesByType: Record<string, number> = {};
  for (const [type, ids] of Array.from(graph.nodesByEntityType)) {
    nodesByType[type] = ids.length;
  }

  const relationshipsByType: Record<string, number> = {};
  for (const rel of Array.from(graph.relationships.values())) {
    relationshipsByType[rel.type] = (relationshipsByType[rel.type] ?? 0) + 1;
  }

  return {
    version: graph.version,
    builtAt: graph.builtAt,
    totalNodes: graph.totalNodes,
    totalRelationships: graph.totalRelationships,
    nodesByType,
    relationshipsByType,
  };
}
