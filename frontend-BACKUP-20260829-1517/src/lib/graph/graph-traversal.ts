/**
 * Phase 2 — Knowledge Graph Core: Graph Traversal Engine
 *
 * Deterministic BFS traversal over the in-memory KnowledgeGraph.
 * Preserves provenance and Engineering Memory at every step.
 */

import type {
  KnowledgeGraph,
  GraphNode,
  GraphRelationship,
  TraversalOptions,
  TraversalResult,
  TraversalPath,
  TraversalStep,
  RelationshipType,
} from './graph-types';

const DEFAULT_MAX_DEPTH = 6;

function matchesRelType(
  rel: GraphRelationship,
  filter: readonly RelationshipType[] | undefined,
): boolean {
  if (!filter || filter.length === 0) return true;
  return filter.includes(rel.type);
}

function pathId(startNodeId: string, steps: TraversalStep[]): string {
  const seg = steps.map((s) => `${s.relationship.type}:${s.toNodeId}`).join('→');
  return `PATH-${startNodeId}→${seg || 'self'}`;
}

/**
 * BFS traversal from a starting node.
 * Returns all reachable nodes, relationships, and paths up to maxDepth.
 */
export function traverse(
  graph: KnowledgeGraph,
  startNodeId: string,
  options: TraversalOptions = {},
): TraversalResult {
  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
  const direction = options.direction ?? 'OUTBOUND';
  const includeDeprecated = options.includeDeprecated ?? false;

  const startNode = graph.nodes.get(startNodeId);
  if (!startNode) {
    return {
      startNodeId,
      visitedNodes: [],
      paths: [],
      relationships: [],
      depthReached: 0,
    };
  }

  const visitedNodeIds = new Set<string>([startNodeId]);
  const visitedRelIds = new Set<string>();
  const resultNodes: GraphNode[] = [startNode];
  const resultRels: GraphRelationship[] = [];
  const resultPaths: TraversalPath[] = [];

  // BFS queue: [nodeId, currentPath steps, depth]
  const queue: Array<[string, TraversalStep[], number]> = [[startNodeId, [], 0]];

  while (queue.length > 0) {
    const [currentNodeId, currentSteps, depth] = queue.shift()!;
    if (depth >= maxDepth) continue;

    // Collect candidate relationship ids
    const candidateRelIds: string[] = [];
    if (direction === 'OUTBOUND' || direction === 'BOTH') {
      const outRels = graph.adjacency.get(currentNodeId) ?? [];
      candidateRelIds.push(...outRels);
    }
    if (direction === 'INBOUND' || direction === 'BOTH') {
      const inRels = graph.reverseAdjacency.get(currentNodeId) ?? [];
      candidateRelIds.push(...inRels);
    }

    for (const relId of candidateRelIds) {
      const rel = graph.relationships.get(relId);
      if (!rel) continue;
      if (!matchesRelType(rel, options.relationshipTypes)) continue;

      // Determine the neighbor node
      const neighborId =
        rel.sourceNodeId === currentNodeId ? rel.targetNodeId : rel.sourceNodeId;
      const neighborNode = graph.nodes.get(neighborId);
      if (!neighborNode) continue;

      if (!includeDeprecated && neighborNode.provenance.isDeprecated) continue;

      // Add relationship to results (once)
      if (!visitedRelIds.has(relId)) {
        visitedRelIds.add(relId);
        resultRels.push(rel);
      }

      const step: TraversalStep = {
        fromNodeId: currentNodeId,
        relationship: rel,
        toNodeId: neighborId,
        depth: depth + 1,
      };
      const newSteps = [...currentSteps, step];

      // Record path to this node
      const path: TraversalPath = {
        pathId: pathId(startNodeId, newSteps),
        startNodeId,
        endNodeId: neighborId,
        steps: newSteps,
        totalDepth: newSteps.length,
        relationshipTypes: newSteps.map((s) => s.relationship.type),
      };
      resultPaths.push(path);

      // Visit neighbor
      if (!visitedNodeIds.has(neighborId)) {
        visitedNodeIds.add(neighborId);
        resultNodes.push(neighborNode);
        queue.push([neighborId, newSteps, depth + 1]);
      }
    }
  }

  return {
    startNodeId,
    visitedNodes: resultNodes,
    paths: resultPaths,
    relationships: resultRels,
    depthReached: Math.max(0, ...resultPaths.map((p) => p.totalDepth)),
  };
}

/**
 * Find shortest path between two nodes using BFS.
 * Returns the first path found or null if no path exists.
 */
export function findPath(
  graph: KnowledgeGraph,
  fromNodeId: string,
  toNodeId: string,
  options: TraversalOptions = {},
): TraversalPath | null {
  if (fromNodeId === toNodeId) {
    return {
      pathId: `PATH-${fromNodeId}→self`,
      startNodeId: fromNodeId,
      endNodeId: toNodeId,
      steps: [],
      totalDepth: 0,
      relationshipTypes: [],
    };
  }

  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
  const direction = options.direction ?? 'BOTH';

  const visited = new Set<string>([fromNodeId]);
  // queue: [nodeId, steps so far]
  const queue: Array<[string, TraversalStep[]]> = [[fromNodeId, []]];

  while (queue.length > 0) {
    const [currentNodeId, steps] = queue.shift()!;
    if (steps.length >= maxDepth) continue;

    const candidateRelIds: string[] = [];
    if (direction === 'OUTBOUND' || direction === 'BOTH') {
      candidateRelIds.push(...(graph.adjacency.get(currentNodeId) ?? []));
    }
    if (direction === 'INBOUND' || direction === 'BOTH') {
      candidateRelIds.push(...(graph.reverseAdjacency.get(currentNodeId) ?? []));
    }

    for (const relId of candidateRelIds) {
      const rel = graph.relationships.get(relId);
      if (!rel) continue;
      if (!matchesRelType(rel, options.relationshipTypes)) continue;

      const neighborId = rel.sourceNodeId === currentNodeId ? rel.targetNodeId : rel.sourceNodeId;
      if (visited.has(neighborId)) continue;

      const step: TraversalStep = {
        fromNodeId: currentNodeId,
        relationship: rel,
        toNodeId: neighborId,
        depth: steps.length + 1,
      };
      const newSteps = [...steps, step];

      if (neighborId === toNodeId) {
        return {
          pathId: pathId(fromNodeId, newSteps),
          startNodeId: fromNodeId,
          endNodeId: toNodeId,
          steps: newSteps,
          totalDepth: newSteps.length,
          relationshipTypes: newSteps.map((s) => s.relationship.type),
        };
      }

      visited.add(neighborId);
      queue.push([neighborId, newSteps]);
    }
  }

  return null;
}
