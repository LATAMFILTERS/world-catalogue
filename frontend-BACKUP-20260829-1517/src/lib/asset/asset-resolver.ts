/**
 * asset-resolver.ts
 * ELIMFILTERS — Asset Intelligence Engine v1.0
 *
 * Asset Graph Resolver.
 * Maintains the in-memory graph of all Asset nodes and relationships.
 * Supports multi-hop traversals and bidirectional queries.
 */

import type { AssetNode, AssetEdge, AssetNodeType, AssetEdgeDirection } from './asset-types';

class AssetGraph {
  private nodes = new Map<string, AssetNode>();
  private edges = new Map<string, AssetEdge>();
  private outEdges = new Map<string, Set<string>>();
  private inEdges = new Map<string, Set<string>>();

  // --- NODES ---

  addNode(node: AssetNode): void {
    this.nodes.set(node.id, node);
    if (!this.outEdges.has(node.id)) this.outEdges.set(node.id, new Set());
    if (!this.inEdges.has(node.id)) this.inEdges.set(node.id, new Set());
  }

  getNode(id: string): AssetNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): AssetNode[] {
    return Array.from(this.nodes.values());
  }

  getNodesByType(type: AssetNodeType): AssetNode[] {
    return Array.from(this.nodes.values()).filter(n => n.type === type);
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  // --- EDGES ---

  addEdge(edge: AssetEdge): void {
    this.edges.set(edge.id, edge);
    this.outEdges.get(edge.fromNodeId)?.add(edge.id);
    this.inEdges.get(edge.toNodeId)?.add(edge.id);
  }

  getEdge(id: string): AssetEdge | undefined {
    return this.edges.get(id);
  }

  getEdgesFrom(nodeId: string): AssetEdge[] {
    const ids = this.outEdges.get(nodeId);
    if (!ids) return [];
    return Array.from(ids).map(id => this.edges.get(id)!).filter(Boolean);
  }

  getEdgesTo(nodeId: string): AssetEdge[] {
    const ids = this.inEdges.get(nodeId);
    if (!ids) return [];
    return Array.from(ids).map(id => this.edges.get(id)!).filter(Boolean);
  }

  // --- STATS ---
  
  get nodeCount(): number { return this.nodes.size; }
  get edgeCount(): number { return this.edges.size; }

  clear(): void {
    this.nodes.clear();
    this.edges.clear();
    this.outEdges.clear();
    this.inEdges.clear();
  }
}

export const ASSET_GRAPH = new AssetGraph();

// ============================================================================
// ID GENERATORS
// ============================================================================

export function buildNodeId(type: AssetNodeType, label: string): string {
  return `${type.toLowerCase()}::${label.toUpperCase().replace(/\s+/g, '-')}`;
}

export function buildEdgeId(fromNodeId: string, toNodeId: string, direction: AssetEdgeDirection): string {
  return `${direction}::${fromNodeId}→${toNodeId}`;
}

// ============================================================================
// RESOLVERS
// ============================================================================

/**
 * Perform a Breadth-First Search (BFS) to find all nodes of a specific targetType
 * reachable from the startNodeId.
 */
export function resolveReachableNodes(startNodeId: string, targetType: AssetNodeType, maxDepth = 5): AssetNode[] {
  const reachable = new Set<string>();
  const queue: Array<{ id: string; depth: number }> = [{ id: startNodeId, depth: 0 }];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.depth > maxDepth) continue;
    if (visited.has(current.id)) continue;
    visited.add(current.id);

    const node = ASSET_GRAPH.getNode(current.id);
    if (!node) continue;

    if (node.type === targetType && current.id !== startNodeId) {
      reachable.add(node.id);
    }

    // Traverse outgoing edges
    const outgoing = ASSET_GRAPH.getEdgesFrom(current.id);
    for (const edge of outgoing) {
      queue.push({ id: edge.toNodeId, depth: current.depth + 1 });
    }

    // Traverse incoming edges (bidirectional support for shared components)
    const incoming = ASSET_GRAPH.getEdgesTo(current.id);
    for (const edge of incoming) {
      queue.push({ id: edge.fromNodeId, depth: current.depth + 1 });
    }
  }

  return Array.from(reachable).map(id => ASSET_GRAPH.getNode(id)!);
}
