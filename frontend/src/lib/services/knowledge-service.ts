/**
 * Phase 3 — Engineering Services: Knowledge Service
 *
 * Responsible for lifecycle management of the Knowledge Graph.
 * All other services consume the graph through this service.
 */

import { buildKnowledgeGraph, invalidateGraphCache } from '@/lib/graph/graph-builder';
import { getGraphSummary } from '@/lib/graph/graph-api';
import type { KnowledgeGraph } from '@/lib/graph/graph-types';

let _graph: KnowledgeGraph | null = null;

/**
 * Load the Knowledge Graph (idempotent — returns cached instance if already loaded).
 */
export function loadGraph(): KnowledgeGraph {
  if (!_graph) {
    _graph = buildKnowledgeGraph();
  }
  return _graph;
}

/**
 * Reload the Knowledge Graph from Foundation registries.
 * Invalidates the cache and rebuilds.
 */
export function reloadGraph(): KnowledgeGraph {
  invalidateGraphCache();
  _graph = null;
  return loadGraph();
}

/**
 * Get the current graph instance (throws if not loaded).
 */
export function getGraph(): KnowledgeGraph {
  if (!_graph) {
    return loadGraph();
  }
  return _graph;
}

/**
 * Get the graph version string.
 */
export function getGraphVersion(): string {
  return getGraph().version;
}

/**
 * Get a structural summary of the current graph.
 */
export function getKnowledgeGraphSummary(): ReturnType<typeof getGraphSummary> {
  return getGraphSummary(getGraph());
}
