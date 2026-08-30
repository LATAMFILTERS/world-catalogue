/**
 * recommendation-engine.ts
 * ELIMFILTERS Knowledge Center — BFS Recommendation Engine
 *
 * Phase 6D: Engineering Recommendation Engine
 *
 * CONSTRAINTS (verbatim from specification):
 *   - Use only graph relationships.
 *   - Use deterministic breadth-first traversal.
 *   - Maximum traversal depth: 2.
 *   - Never invoke an LLM.
 *   - Never infer relationships not explicitly in the graph.
 *   - Produce identical recommendations for identical graph states.
 *
 * This module has ZERO imports from KC data registries — it is a pure function
 * that operates on a pre-built KCGraph passed as a parameter.
 * This guarantees full testability without any registry dependency.
 *
 * Dependency: ./recommendation-types (types only)
 */

import type {
  KCGraph,
  KCGraphNode,
  KCNodeKey,
  KCNodeType,
  KCReasonType,
  KCRecommendation,
  KCRecommendationOptions,
} from './recommendation-types';

// ── Reason mapping ─────────────────────────────────────────────────────────────

/** Reason type when the recommendation is a direct (depth-1) neighbour. */
function directReasonFor(neighborType: KCNodeType): KCReasonType {
  switch (neighborType) {
    case 'standard':   return 'related-standard';
    case 'technology': return 'related-technology';
    case 'system':     return 'related-system';
    case 'term':       return 'related-term';
    case 'article':    return 'related-article';
    case 'diagram':    return 'related-diagram';
    case 'calculator': return 'related-calculator';
    case 'comparison': return 'related-comparison';
  }
}

/** Reason type when the recommendation shares a common intermediate node (depth-2). */
function sharedReasonFor(viaType: KCNodeType): KCReasonType {
  switch (viaType) {
    case 'standard':   return 'shared-standard';
    case 'technology': return 'shared-technology';
    case 'system':     return 'shared-system';
    case 'term':       return 'shared-term';
    case 'article':    return 'shared-article';
    case 'diagram':    return 'shared-diagram';
    case 'calculator': return 'shared-calculator';
    case 'comparison': return 'shared-comparison';
  }
}

// ── BFS engine ────────────────────────────────────────────────────────────────

/**
 * Deterministic BFS recommendation engine.
 *
 * Given a source node key and an undirected KC graph, returns recommendations
 * sorted by: score DESC, type ASC, slug ASC — producing identical output
 * for identical graph states and source keys.
 *
 * Score schema:
 *   2.0 — direct graph neighbour (depth 1)
 *   1.0 — two hops away via an intermediate node (depth 2)
 *
 * Every recommendation includes an explanation (reasonType + optional viaLabel).
 */
export function getRecommendations(
  graph:     KCGraph,
  sourceKey: KCNodeKey,
  options?:  KCRecommendationOptions,
): KCRecommendation[] {
  const maxDepth    = options?.maxDepth    ?? 2;
  const maxResults  = options?.maxResults  ?? 12;
  const excludeSet  = new Set<KCNodeType>(options?.excludeTypes ?? []);

  if (!graph.nodes.has(sourceKey)) return [];

  const results  = new Map<KCNodeKey, KCRecommendation>();
  const visited  = new Set<KCNodeKey>([sourceKey]);

  // ── Depth 1: direct neighbours ──────────────────────────────────────────────
  const d1Edges = graph.edges.get(sourceKey) ?? new Set<KCNodeKey>();

  // Deterministic iteration order: sort keys before visiting
  const d1Keys = Array.from(d1Edges).sort();

  for (const neighborKey of d1Keys) {
    if (visited.has(neighborKey)) continue;
    visited.add(neighborKey);

    const node: KCGraphNode | undefined = graph.nodes.get(neighborKey);
    if (!node) continue;
    if (excludeSet.has(node.type)) continue;

    results.set(neighborKey, {
      nodeKey:    neighborKey,
      type:       node.type,
      slug:       node.slug,
      label:      node.label,
      href:       node.href,
      score:      2.0,
      depth:      1,
      reasonType: directReasonFor(node.type),
    });
  }

  // ── Depth 2: neighbours of neighbours ──────────────────────────────────────
  if (maxDepth >= 2) {
    // Deterministic: iterate d1 nodes in sorted key order
    const d1VisitOrder = d1Keys.filter(k => {
      const n = graph.nodes.get(k);
      return n && !excludeSet.has(n.type);
    });

    for (const d1Key of d1VisitOrder) {
      const d1Node: KCGraphNode | undefined = graph.nodes.get(d1Key);
      if (!d1Node) continue;

      const d2Edges = graph.edges.get(d1Key) ?? new Set<KCNodeKey>();
      const d2Keys  = Array.from(d2Edges).sort();

      for (const neighborKey of d2Keys) {
        if (visited.has(neighborKey)) continue;
        visited.add(neighborKey);

        const node: KCGraphNode | undefined = graph.nodes.get(neighborKey);
        if (!node) continue;
        if (excludeSet.has(node.type)) continue;

        results.set(neighborKey, {
          nodeKey:    neighborKey,
          type:       node.type,
          slug:       node.slug,
          label:      node.label,
          href:       node.href,
          score:      1.0,
          depth:      2,
          reasonType: sharedReasonFor(d1Node.type),
          viaLabel:   d1Node.label,
          viaType:    d1Node.type,
        });
      }
    }
  }

  // ── Sort deterministically ──────────────────────────────────────────────────
  // Primary: score DESC (direct before indirect)
  // Secondary: type ASC (alphabetical, consistent grouping)
  // Tertiary: slug ASC (stable within type)
  return Array.from(results.values())
    .sort((a, b) =>
      b.score - a.score ||
      a.type.localeCompare(b.type) ||
      a.slug.localeCompare(b.slug),
    )
    .slice(0, maxResults);
}
