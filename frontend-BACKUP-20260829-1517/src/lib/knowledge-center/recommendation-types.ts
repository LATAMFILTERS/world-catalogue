/**
 * recommendation-types.ts
 * ELIMFILTERS Knowledge Center — Recommendation Engine Types
 *
 * Phase 6D: Engineering Recommendation Engine
 *
 * All types for the BFS-based deterministic recommendation engine.
 * No imports from KC registries — this file is the type root for Phase 6D.
 *
 * Dependency: none
 */

// ── Node Types ────────────────────────────────────────────────────────────────

export type KCNodeType =
  | 'article'
  | 'standard'
  | 'technology'
  | 'term'
  | 'system'
  | 'diagram'
  | 'calculator'
  | 'comparison';

/** Unified node key: `${type}:${slug}` — e.g. "standard:iso-16889" */
export type KCNodeKey = string;

// ── Reason Types ─────────────────────────────────────────────────────────────

/**
 * Why a recommendation was produced.
 *
 * Depth-1 ("related-*"): entity is a direct graph neighbour of the source.
 * Depth-2 ("shared-*"):  entity shares a common intermediate node with the source.
 *
 * The intermediate node type determines the "shared-*" reason:
 *   shared-standard  → both entities reference the same standard
 *   shared-technology → both entities reference the same technology
 *   etc.
 */
export type KCReasonType =
  | 'related-standard'
  | 'related-technology'
  | 'related-system'
  | 'related-term'
  | 'related-article'
  | 'related-diagram'
  | 'related-calculator'
  | 'related-comparison'
  | 'shared-standard'
  | 'shared-technology'
  | 'shared-system'
  | 'shared-term'
  | 'shared-article'
  | 'shared-diagram'
  | 'shared-calculator'
  | 'shared-comparison';

// ── Graph ─────────────────────────────────────────────────────────────────────

export interface KCGraphNode {
  key:   KCNodeKey;
  type:  KCNodeType;
  slug:  string;    // URL-safe identifier
  label: string;    // human-readable display name
  href:  string;    // URL path within /knowledge-center/
}

/**
 * Undirected adjacency graph.
 * Every edge A→B implies B→A. Both directions are stored explicitly.
 */
export interface KCGraph {
  nodes: Map<KCNodeKey, KCGraphNode>;
  edges: Map<KCNodeKey, Set<KCNodeKey>>;
}

// ── Recommendations ───────────────────────────────────────────────────────────

export interface KCRecommendation {
  nodeKey:    KCNodeKey;
  type:       KCNodeType;
  slug:       string;
  label:      string;
  href:       string;
  /** 2.0 = direct neighbour (depth 1) | 1.0 = two hops away (depth 2) */
  score:      number;
  depth:      1 | 2;
  reasonType: KCReasonType;
  /** Label of the intermediate node that connects source → this (depth 2 only). */
  viaLabel?:  string;
  /** Type of the intermediate node (depth 2 only). */
  viaType?:   KCNodeType;
}

export interface KCRecommendationOptions {
  maxDepth?:     number;      // default 2
  maxResults?:   number;      // default 12
  excludeTypes?: KCNodeType[];
}
