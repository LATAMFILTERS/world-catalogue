/**
 * Phase 3 — Engineering Services: AI Context Builder
 *
 * Assembles structured engineering context for future AI systems.
 * Does NOT generate answers, interpret queries, or interact with any AI.
 * Only prepares traceable structured context from the Knowledge Graph.
 *
 * Output is structured data — not prompts, not chat messages.
 */

import { getGraph } from './knowledge-service';
import { getRelationships, getNodeByEntityId, findStandards } from '@/lib/graph/graph-api';
import { getAuditTrail } from '@/lib/graph/provenance';
import { cite } from '@/lib/graph/citation-engine';
import type {
  GraphNode,
  CitationObject,
  NodeEntityType,
} from '@/lib/graph/graph-types';

// ─── AI Context Types ─────────────────────────────────────────────────────────

export interface AIContextNode {
  readonly entityId: string;
  readonly entityType: NodeEntityType;
  readonly label: string;
  readonly properties: Record<string, unknown>;
  readonly provenance: {
    readonly sourceRegistry: string;
    readonly version: string;
    readonly maturityLevel: string;
    readonly governanceStatus: string;
    readonly edrRefs: readonly string[];
  };
}

export interface AIContextRelationship {
  readonly fromEntityId: string;
  readonly toEntityId: string;
  readonly type: string;
  readonly derivedFrom: string;
}

export interface AIContextCitation {
  readonly citationId: string;
  readonly sourceEntityId: string;
  readonly sourceRegistry: string;
  readonly sourceVersion: string;
  readonly claim: string;
  readonly traceability: string;
}

export interface AIContextPackage {
  readonly packageId: string;
  readonly assembledAt: string;
  readonly graphVersion: string;
  readonly queryEntityId: string;
  readonly queryEntityType: NodeEntityType;
  readonly nodes: readonly AIContextNode[];
  readonly relationships: readonly AIContextRelationship[];
  readonly citations: readonly AIContextCitation[];
  readonly engineeringMemory: readonly AIContextNode[];
  readonly summary: {
    readonly nodeCount: number;
    readonly relationshipCount: number;
    readonly citationCount: number;
    readonly memoryEntryCount: number;
    readonly coverageDepth: number;
  };
}

// ─── Package ID ───────────────────────────────────────────────────────────────

let _pkgCounter = 0;
function pkgId(): string {
  return `AICTX-${String(++_pkgCounter).padStart(5, '0')}`;
}

// ─── Node Serializer ──────────────────────────────────────────────────────────

function serializeNode(node: GraphNode): AIContextNode {
  return {
    entityId: node.entityId,
    entityType: node.entityType,
    label: node.label,
    properties: node.properties as Record<string, unknown>,
    provenance: {
      sourceRegistry: node.provenance.sourceRegistry,
      version: node.provenance.entityVersion,
      maturityLevel: node.provenance.maturityLevel,
      governanceStatus: node.provenance.governanceStatus,
      edrRefs: node.provenance.edrRefs,
    },
  };
}

// ─── Main Builder ─────────────────────────────────────────────────────────────

/**
 * Build a structured AI Context Package for a given entity.
 *
 * The package includes:
 * - The entity itself
 * - All directly related entities (depth 1)
 * - Applicable standards
 * - Engineering Memory entries
 * - Provenance and citations for every included entity
 *
 * @param entityId - The entity ID to build context around
 * @param depth    - Relationship traversal depth (default 1; max 3)
 */
export function buildAIContext(entityId: string, depth = 1): AIContextPackage {
  const graph = getGraph();
  const rootNode = getNodeByEntityId(graph, entityId);
  if (!rootNode) {
    throw new Error(`AI Context Builder: entity ${entityId} not found in Knowledge Graph`);
  }

  const cappedDepth = Math.min(depth, 3);
  const collectedNodes = new Map<string, GraphNode>();
  const collectedRels: AIContextRelationship[] = [];
  const citations: CitationObject[] = [];
  const memoryNodes: GraphNode[] = [];

  // BFS to collect nodes up to cappedDepth
  const queue: Array<[GraphNode, number]> = [[rootNode, 0]];
  const visited = new Set<string>([rootNode.nodeId]);

  while (queue.length > 0) {
    const [current, currentDepth] = queue.shift()!;
    collectedNodes.set(current.entityId, current);

    // Cite this node
    const nid = graph.nodesByEntityId.get(current.entityId);
    if (nid) {
      citations.push(cite(graph, nid, `Engineering context for ${current.entityId} (${current.entityType})`));
    }

    if (currentDepth >= cappedDepth) continue;

    const { outbound, inbound } = getRelationships(graph, current.nodeId);
    const allRels = [...outbound, ...inbound];

    for (const rel of allRels) {
      // Skip memory relationships from depth expansion
      if (rel.type === 'HAS_MEMORY') continue;

      const neighborId = rel.sourceNodeId === current.nodeId ? rel.targetNodeId : rel.sourceNodeId;
      const neighborNode = graph.nodes.get(neighborId);
      if (!neighborNode) continue;
      if (neighborNode.entityType === 'ENGINEERING_MEMORY') continue;

      // Record relationship
      const relEntry: AIContextRelationship = {
        fromEntityId: current.entityId,
        toEntityId: neighborNode.entityId,
        type: rel.type,
        derivedFrom: rel.derivedFrom,
      };
      // Deduplicate
      const already = collectedRels.some(
        (r) => r.fromEntityId === relEntry.fromEntityId &&
               r.toEntityId === relEntry.toEntityId &&
               r.type === relEntry.type,
      );
      if (!already) collectedRels.push(relEntry);

      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push([neighborNode, currentDepth + 1]);
      }
    }
  }

  // Add applicable standards for the root entity
  const stdNodes = findStandards(graph, entityId);
  for (const stdNode of stdNodes) {
    if (!collectedNodes.has(stdNode.entityId)) {
      collectedNodes.set(stdNode.entityId, stdNode);
      collectedRels.push({
        fromEntityId: stdNode.entityId,
        toEntityId: entityId,
        type: 'VALIDATES',
        derivedFrom: 'findStandards()',
      });
      const nid = graph.nodesByEntityId.get(stdNode.entityId);
      if (nid) {
        citations.push(cite(graph, nid, `${stdNode.label} validates ${entityId}`));
      }
    }
  }

  // Collect Engineering Memory for root entity
  const { memoryChain } = getAuditTrail(graph, entityId);
  for (const memNode of memoryChain) {
    memoryNodes.push(memNode);
  }

  // Also collect memory for directly related entities (depth 1 only)
  for (const node of Array.from(collectedNodes.values())) {
    if (node.entityId === entityId) continue;
    const { memoryChain: mc } = getAuditTrail(graph, node.entityId);
    memoryNodes.push(...mc);
  }

  const dedupedMemory = Array.from(
    new Map(memoryNodes.map((n) => [n.entityId, n])).values(),
  );

  return {
    packageId: pkgId(),
    assembledAt: new Date().toISOString(),
    graphVersion: graph.version,
    queryEntityId: entityId,
    queryEntityType: rootNode.entityType,
    nodes: Array.from(collectedNodes.values()).map(serializeNode),
    relationships: collectedRels,
    citations: citations.map((c) => ({
      citationId: c.citationId,
      sourceEntityId: c.sourceEntityId,
      sourceRegistry: c.sourceRegistry,
      sourceVersion: c.sourceVersion,
      claim: c.claim,
      traceability: c.traceability,
    })),
    engineeringMemory: dedupedMemory.map(serializeNode),
    summary: {
      nodeCount: collectedNodes.size,
      relationshipCount: collectedRels.length,
      citationCount: citations.length,
      memoryEntryCount: dedupedMemory.length,
      coverageDepth: cappedDepth,
    },
  };
}

/**
 * Build context for multiple entities (e.g. a set of technologies for a domain).
 * Returns merged, deduplicated context.
 */
export function buildAIContextBatch(entityIds: string[], depth = 1): AIContextPackage {
  if (entityIds.length === 0) {
    throw new Error('AI Context Builder: at least one entity ID required');
  }

  if (entityIds.length === 1) {
    return buildAIContext(entityIds[0], depth);
  }

  // Build each package and merge
  const packages = entityIds.map((id) => buildAIContext(id, depth));

  const mergedNodes = new Map<string, AIContextNode>();
  const mergedRels: AIContextRelationship[] = [];
  const mergedCitations: AIContextCitation[] = [];
  const mergedMemory = new Map<string, AIContextNode>();

  for (const pkg of packages) {
    for (const node of pkg.nodes) mergedNodes.set(node.entityId, node);
    for (const rel of pkg.relationships) {
      const key = `${rel.fromEntityId}|${rel.type}|${rel.toEntityId}`;
      const exists = mergedRels.some(
        (r) => `${r.fromEntityId}|${r.type}|${r.toEntityId}` === key,
      );
      if (!exists) mergedRels.push(rel);
    }
    mergedCitations.push(...pkg.citations);
    for (const mem of pkg.engineeringMemory) mergedMemory.set(mem.entityId, mem);
  }

  const graph = getGraph();
  const firstNode = getNodeByEntityId(graph, entityIds[0]);

  return {
    packageId: pkgId(),
    assembledAt: new Date().toISOString(),
    graphVersion: graph.version,
    queryEntityId: entityIds.join(','),
    queryEntityType: firstNode?.entityType ?? 'TECHNOLOGY_ARCHITECTURE',
    nodes: Array.from(mergedNodes.values()),
    relationships: mergedRels,
    citations: mergedCitations,
    engineeringMemory: Array.from(mergedMemory.values()),
    summary: {
      nodeCount: mergedNodes.size,
      relationshipCount: mergedRels.length,
      citationCount: mergedCitations.length,
      memoryEntryCount: mergedMemory.size,
      coverageDepth: depth,
    },
  };
}

/**
 * Reset package counter (for test isolation).
 */
export function resetAIContextCounter(): void {
  _pkgCounter = 0;
}
