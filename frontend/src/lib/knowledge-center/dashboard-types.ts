/**
 * dashboard-types.ts
 * ELIMFILTERS Knowledge Center — Engineering Intelligence Dashboard Types
 *
 * Phase 6F: Engineering Intelligence Dashboard
 *
 * All types consumed by dashboard-analytics.ts and the dashboard page.
 * Zero KC registry imports.
 */

// ── Node ranking entry (any entity type) ──────────────────────────────────────

export interface KCRankedNode {
  key:       string;
  type:      string;
  slug:      string;
  label:     string;
  href:      string;
  edgeCount: number;
  /** Machine-readable code, present for standards and calculators. */
  code?:     string;
  /** Contextual descriptor: domain, category, diagramType, etc. */
  meta?:     string;
}

// ── Graph-level statistics ────────────────────────────────────────────────────

export interface KCGraphSummary {
  /** Total nodes registered in the recommendation graph. */
  totalNodes:        number;
  /**
   * Total undirected edge pairs.
   * Each bidirectional pair counted once: sum(edgeSets.size) / 2.
   */
  totalEdges:        number;
  /** Nodes with at least one edge. */
  connectedNodes:    number;
  /** Nodes with zero edges (not in any graph edge set). */
  isolatedNodes:     number;
  /** Average edge count per node (1 decimal). */
  avgConnections:    number;
  /** connectedNodes / totalNodes × 100 (1 decimal). */
  connectivityPct:   number;
}

// ── Per-type connectivity summary ─────────────────────────────────────────────

export interface KCTypeConnectivity {
  type:         string;
  nodeCount:    number;
  /** Average edge count across all nodes of this type (1 decimal). */
  avg:          number;
  /** Highest edge count for a single node in this type. */
  max:          number;
  /** Nodes of this type with zero edges. */
  isolated:     number;
}

// ── Recently added standards (derived from `year` field) ─────────────────────

export interface KCRecentStandard {
  code:  string;
  title: string;
  year:  string;
  slug:  string;
  href:  string;
  edgeCount: number;
}

// ── Complete dashboard payload ────────────────────────────────────────────────

export interface KCDashboardData {
  graphSummary:       KCGraphSummary;
  entityCounts:       Record<string, number>;
  typeConnectivity:   KCTypeConnectivity[];
  topStandards:       KCRankedNode[];
  topTechnologies:    KCRankedNode[];
  topArticles:        KCRankedNode[];
  topTerms:           KCRankedNode[];
  topDiagrams:        KCRankedNode[];
  topCalculators:     KCRankedNode[];
  topComparisons:     KCRankedNode[];
  recentStandards:    KCRecentStandard[];
  /** graphVersion string from navigation-index KC_GRAPH_METADATA. */
  graphVersion:       string;
}
