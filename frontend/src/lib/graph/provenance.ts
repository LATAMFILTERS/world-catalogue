/**
 * Phase 2 — Knowledge Graph Core: Provenance Layer
 *
 * Every graph node and relationship exposes full governance metadata:
 * source registry, version, Engineering Memory, EDR evidence, maturity, deprecation.
 */

import type { KnowledgeGraph, GraphNode, GraphRelationship, NodeProvenance } from './graph-types';

export interface EntityProvenance {
  readonly nodeId: string;
  readonly entityId: string;
  readonly entityType: string;
  readonly label: string;
  readonly provenance: NodeProvenance;
}

export interface RelationshipProvenance {
  readonly relationshipId: string;
  readonly type: string;
  readonly sourceEntityId: string;
  readonly targetEntityId: string;
  readonly derivedFrom: string;
  readonly bidirectional: boolean;
}

/**
 * Get full provenance for a node by nodeId.
 */
export function getNodeProvenance(
  graph: KnowledgeGraph,
  nodeId: string,
): EntityProvenance | null {
  const node = graph.nodes.get(nodeId);
  if (!node) return null;
  return {
    nodeId: node.nodeId,
    entityId: node.entityId,
    entityType: node.entityType,
    label: node.label,
    provenance: node.provenance,
  };
}

/**
 * Get provenance for a relationship by relationshipId.
 */
export function getRelationshipProvenance(
  graph: KnowledgeGraph,
  relationshipId: string,
): RelationshipProvenance | null {
  const rel = graph.relationships.get(relationshipId);
  if (!rel) return null;
  const sourceNode = graph.nodes.get(rel.sourceNodeId);
  const targetNode = graph.nodes.get(rel.targetNodeId);
  return {
    relationshipId: rel.relationshipId,
    type: rel.type,
    sourceEntityId: sourceNode?.entityId ?? rel.sourceNodeId,
    targetEntityId: targetNode?.entityId ?? rel.targetNodeId,
    derivedFrom: rel.derivedFrom,
    bidirectional: rel.bidirectional,
  };
}

/**
 * Get all Engineering Memory entries for a node's entity.
 */
export function getMemoryForNode(graph: KnowledgeGraph, nodeId: string): GraphNode[] {
  const node = graph.nodes.get(nodeId);
  if (!node) return [];
  return node.provenance.memoryEntryIds
    .map((memId) => graph.nodes.get(`NODE-${memId}`))
    .filter((n): n is GraphNode => n !== undefined);
}

/**
 * Get the full provenance audit trail for an entity:
 * provenance + Engineering Memory chain + EDR references.
 */
export function getAuditTrail(
  graph: KnowledgeGraph,
  entityId: string,
): {
  entityProvenance: EntityProvenance | null;
  memoryChain: GraphNode[];
  edrRefs: readonly string[];
} {
  const nid = `NODE-${entityId}`;
  const prov = getNodeProvenance(graph, nid);
  const memoryChain = prov ? getMemoryForNode(graph, nid) : [];
  return {
    entityProvenance: prov,
    memoryChain,
    edrRefs: prov?.provenance.edrRefs ?? [],
  };
}

/**
 * List all deprecated nodes in the graph.
 */
export function getDeprecatedNodes(graph: KnowledgeGraph): GraphNode[] {
  return Array.from(graph.nodes.values()).filter((n) => n.provenance.isDeprecated);
}

/**
 * List all alias nodes.
 */
export function getAliasNodes(graph: KnowledgeGraph): GraphNode[] {
  return Array.from(graph.nodes.values()).filter(
    (n) => n.provenance.governanceStatus === 'ALIAS',
  );
}
