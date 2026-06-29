/**
 * xref-resolver.ts
 * ELIMFILTERS — Cross Reference Intelligence Engine v1.0
 *
 * Cross Reference Resolver.
 * Maintains the in-memory graph of all XrefNodes and XrefEdges.
 * Supports multi-hop path traversal (OEM → OEM → ELIMFILTERS chains).
 */

import type {
  XrefNode,
  XrefEdge,
  GraphPath,
  XrefNodeType,
} from './xref-types';

// ============================================================================
// IN-MEMORY GRAPH STORE
// ============================================================================

class XrefGraph {
  private nodes = new Map<string, XrefNode>();
  private edges = new Map<string, XrefEdge>();
  /** Adjacency list: nodeId → set of edge IDs leaving this node */
  private adjacency = new Map<string, Set<string>>();

  // --- NODE OPERATIONS ---

  addNode(node: XrefNode): void {
    this.nodes.set(node.id, node);
    if (!this.adjacency.has(node.id)) {
      this.adjacency.set(node.id, new Set());
    }
  }

  getNode(id: string): XrefNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): XrefNode[] {
    return Array.from(this.nodes.values());
  }

  getNodesByType(type: XrefNodeType): XrefNode[] {
    return Array.from(this.nodes.values()).filter(n => n.type === type);
  }

  getNodesByOem(oemId: string): XrefNode[] {
    return Array.from(this.nodes.values()).filter(n => n.oemId === oemId);
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  // --- EDGE OPERATIONS ---

  addEdge(edge: XrefEdge): void {
    this.edges.set(edge.id, edge);
    if (!this.adjacency.has(edge.fromNodeId)) {
      this.adjacency.set(edge.fromNodeId, new Set());
    }
    this.adjacency.get(edge.fromNodeId)!.add(edge.id);
  }

  getEdge(id: string): XrefEdge | undefined {
    return this.edges.get(id);
  }

  getAllEdges(): XrefEdge[] {
    return Array.from(this.edges.values());
  }

  getActiveEdges(): XrefEdge[] {
    return Array.from(this.edges.values()).filter(e => e.status === 'ACTIVE');
  }

  getEdgesFrom(nodeId: string): XrefEdge[] {
    const edgeIds = this.adjacency.get(nodeId) ?? new Set();
    return Array.from(edgeIds)
      .map(id => this.edges.get(id))
      .filter((e): e is XrefEdge => e !== undefined && e.status === 'ACTIVE');
  }

  getEdgesTo(nodeId: string): XrefEdge[] {
    return Array.from(this.edges.values()).filter(
      e => e.toNodeId === nodeId && e.status === 'ACTIVE'
    );
  }

  hasEdge(id: string): boolean {
    return this.edges.has(id);
  }

  // --- STATS ---

  get nodeCount(): number { return this.nodes.size; }
  get edgeCount(): number { return this.edges.size; }
  get activeEdgeCount(): number { return this.getActiveEdges().length; }

  clear(): void {
    this.nodes.clear();
    this.edges.clear();
    this.adjacency.clear();
  }
}

// ============================================================================
// SINGLETON GRAPH INSTANCE
// ============================================================================

export const XREF_GRAPH = new XrefGraph();

// ============================================================================
// NODE ID GENERATOR
// ============================================================================

export function buildNodeId(oemId: string, partNumber: string): string {
  return `${oemId.toLowerCase()}::${partNumber.toUpperCase().replace(/\s+/g, '-')}`;
}

export function buildElimNodeId(partNumber: string): string {
  return `elimfilters::${partNumber.toUpperCase()}`;
}

// ============================================================================
// EDGE ID GENERATOR
// ============================================================================

export function buildEdgeId(fromNodeId: string, toNodeId: string): string {
  return `edge::${fromNodeId}→${toNodeId}`;
}

// ============================================================================
// GRAPH PATH RESOLVER — Multi-hop BFS
// ============================================================================

const MAX_HOPS = 6;
const MIN_CONFIDENCE_PER_EDGE = 70;

export function resolvePathsToElim(
  startNodeId: string,
  maxHops = MAX_HOPS
): GraphPath[] {
  const paths: GraphPath[] = [];
  const queue: Array<{ nodeId: string; chain: string[]; confidence: number; weakest: number }> = [
    { nodeId: startNodeId, chain: [startNodeId], confidence: 100, weakest: 100 },
  ];

  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.chain.length > maxHops + 1) continue;
    if (visited.has(current.nodeId + ':' + current.chain.length)) continue;
    visited.add(current.nodeId + ':' + current.chain.length);

    const node = XREF_GRAPH.getNode(current.nodeId);
    if (!node) continue;

    // If we've reached an ELIMFILTERS node, record this path
    if (node.type === 'ELIMFILTERS' && current.chain.length > 1) {
      const pathId = `path::${current.chain.join('→')}`;
      paths.push({
        pathId,
        nodeChain: [...current.chain],
        pathConfidence: current.confidence,
        weakestLink: current.weakest,
        hops: current.chain.length - 1,
        valid: current.weakest >= MIN_CONFIDENCE_PER_EDGE,
      });
      continue; // Don't traverse past ELIMFILTERS nodes
    }

    // Traverse outgoing edges
    const outEdges = XREF_GRAPH.getEdgesFrom(current.nodeId);
    for (const edge of outEdges) {
      if (current.chain.includes(edge.toNodeId)) continue; // Prevent cycles

      const edgeConf = edge.confidenceScore;
      const newConf = Math.min(current.confidence, edgeConf);
      const newWeak = Math.min(current.weakest, edgeConf);

      queue.push({
        nodeId: edge.toNodeId,
        chain: [...current.chain, edge.toNodeId],
        confidence: newConf,
        weakest: newWeak,
      });
    }
  }

  return paths.sort((a, b) => b.pathConfidence - a.pathConfidence);
}

// ============================================================================
// RESOLVE: Given an OEM part number, find all ELIMFILTERS mappings
// ============================================================================

export function resolveOemToElim(oemId: string, oemPartNumber: string): GraphPath[] {
  const nodeId = buildNodeId(oemId, oemPartNumber);
  if (!XREF_GRAPH.hasNode(nodeId)) return [];
  return resolvePathsToElim(nodeId);
}

// ============================================================================
// RESOLVE: Given an ELIMFILTERS part, find all OEM equivalents
// ============================================================================

export function resolveElimToOem(elimPartNumber: string): XrefNode[] {
  const nodeId = buildElimNodeId(elimPartNumber);
  const inEdges = XREF_GRAPH.getEdgesTo(nodeId);
  return inEdges
    .map(e => XREF_GRAPH.getNode(e.fromNodeId))
    .filter((n): n is XrefNode => n !== undefined);
}
