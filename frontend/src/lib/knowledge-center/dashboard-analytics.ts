/**
 * dashboard-analytics.ts
 * ELIMFILTERS Knowledge Center — Engineering Intelligence Dashboard Analytics
 *
 * Phase 6F: Engineering Intelligence Dashboard
 *
 * Dashboard analytics are intentionally independent from the public search index.
 * Search remains canonical-only; dashboard census and rankings come from the
 * recommendation graph and governed entity registries.
 *
 * Zero runtime APIs. Static export compatible.
 */

import {
  KC_STANDARDS,
  KC_CALCULATORS,
  KC_INDUSTRIES,
} from '@/lib/knowledge-center-data';
import { ENGINEERING_DIAGRAMS } from '@/lib/knowledge-center-data/diagram-registry';
import { PROBLEM_STUBS } from './article-registry';
import { KC_GRAPH_METADATA } from './navigation-index';
import { getKCRecommendationGraph } from './recommendation-graph';
import type {
  KCDashboardData,
  KCGraphSummary,
  KCRankedNode,
  KCRecentStandard,
  KCTypeConnectivity,
} from './dashboard-types';

// ── Internal helpers ──────────────────────────────────────────────────────────

const ENTITY_TYPES_IN_GRAPH = [
  'article', 'standard', 'technology', 'term',
  'system', 'diagram', 'calculator', 'comparison',
] as const;

/** Returns edgeCount for a node key from the recommendation graph. */
function edgesFor(key: string): number {
  const graph = getKCRecommendationGraph();
  return graph.edges.get(key)?.size ?? 0;
}

// ── Graph-level summary ───────────────────────────────────────────────────────

function buildGraphSummary(): KCGraphSummary {
  const graph = getKCRecommendationGraph();
  const totalNodes = graph.nodes.size;

  let directedSum = 0;
  for (const edgeSet of Array.from(graph.edges.values())) {
    directedSum += edgeSet.size;
  }
  const totalEdges = Math.floor(directedSum / 2);

  let connectedNodes = 0;
  let isolatedNodes = 0;
  for (const [key] of Array.from(graph.nodes.entries())) {
    const count = edgesFor(key);
    if (count > 0) connectedNodes++;
    else isolatedNodes++;
  }

  const avgConnections = totalNodes > 0
    ? Math.round((directedSum / totalNodes) * 10) / 10
    : 0;

  const connectivityPct = totalNodes > 0
    ? Math.round((connectedNodes / totalNodes) * 1000) / 10
    : 0;

  return { totalNodes, totalEdges, connectedNodes, isolatedNodes, avgConnections, connectivityPct };
}

// ── Entity census ─────────────────────────────────────────────────────────────

function buildEntityCounts(): Record<string, number> {
  const graph = getKCRecommendationGraph();
  const counts: Record<string, number> = {};

  for (const node of Array.from(graph.nodes.values())) {
    counts[node.type] = (counts[node.type] ?? 0) + 1;
  }

  // Industries and problem guides are public governed entities but are not
  // recommendation-graph node types, so count them from their source registries.
  counts.industry = KC_INDUSTRIES.length;
  counts.problem = PROBLEM_STUBS.length;

  return counts;
}

// ── Per-type connectivity ─────────────────────────────────────────────────────

function buildTypeConnectivity(): KCTypeConnectivity[] {
  const graph = getKCRecommendationGraph();
  const perType: Record<string, number[]> = {};

  for (const [key, node] of Array.from(graph.nodes.entries())) {
    const type = node.type;
    if (!perType[type]) perType[type] = [];
    perType[type].push(edgesFor(key));
  }

  return ENTITY_TYPES_IN_GRAPH.map(type => {
    const counts = perType[type] ?? [];
    const nodeCount = counts.length;
    const sum = counts.reduce((a, b) => a + b, 0);
    const max = counts.length > 0 ? Math.max(...counts) : 0;
    const avg = nodeCount > 0 ? Math.round((sum / nodeCount) * 10) / 10 : 0;
    const isolated = counts.filter(c => c === 0).length;
    return { type, nodeCount, avg, max, isolated };
  });
}

// ── Top-N by edge count per graph type ───────────────────────────────────────

function topByType(type: string, n: number): KCRankedNode[] {
  const graph = getKCRecommendationGraph();

  return Array.from(graph.nodes.values())
    .filter(node => node.type === type)
    .map(node => ({
      key:       node.key,
      type:      node.type,
      slug:      node.slug,
      label:     node.label,
      href:      node.href,
      edgeCount: edgesFor(node.key),
      code:      node.type === 'standard' ? node.label : undefined,
    }))
    .sort((a, b) => b.edgeCount - a.edgeCount || a.label.localeCompare(b.label))
    .slice(0, n);
}

// ── Recently added standards (sorted by year DESC) ───────────────────────────

function buildRecentStandards(n: number): KCRecentStandard[] {
  return KC_STANDARDS
    .slice()
    .sort((a, b) => {
      const yearDiff = parseInt(b.year, 10) - parseInt(a.year, 10);
      if (yearDiff !== 0) return yearDiff;
      return a.code.localeCompare(b.code);
    })
    .slice(0, n)
    .map(s => ({
      code:      s.code,
      title:     s.title,
      year:      s.year,
      slug:      s.slug,
      href:      `/knowledge-center/standards/${s.slug}`,
      edgeCount: edgesFor(`standard:${s.slug}`),
    }));
}

// ── All calculators ranked ────────────────────────────────────────────────────

function buildCalculatorNodes(): KCRankedNode[] {
  return KC_CALCULATORS
    .map(c => ({
      key:       `calculator:${c.slug}`,
      type:      'calculator' as const,
      slug:      c.slug,
      label:     c.title,
      href:      `/knowledge-center/calculators/${c.slug}`,
      edgeCount: edgesFor(`calculator:${c.slug}`),
      code:      c.governingStandard,
      meta:      c.category,
    }))
    .sort((a, b) => b.edgeCount - a.edgeCount || a.label.localeCompare(b.label));
}

// ── Diagram nodes ranked ──────────────────────────────────────────────────────

function buildDiagramNodes(n: number): KCRankedNode[] {
  return ENGINEERING_DIAGRAMS
    .map(d => ({
      key:       `diagram:${d.slug}`,
      type:      'diagram' as const,
      slug:      d.slug,
      label:     d.title,
      href:      `/knowledge-center/diagrams/${d.slug}`,
      edgeCount: edgesFor(`diagram:${d.slug}`),
      meta:      d.diagramType,
    }))
    .sort((a, b) => b.edgeCount - a.edgeCount || a.label.localeCompare(b.label))
    .slice(0, n);
}

// ── Singleton dashboard payload ───────────────────────────────────────────────

/**
 * Complete dashboard analytics — computed once at module load.
 * Deterministic: identical graph + registry state → identical output.
 */
export const KC_DASHBOARD_DATA: KCDashboardData = {
  graphSummary:     buildGraphSummary(),
  entityCounts:     buildEntityCounts(),
  typeConnectivity: buildTypeConnectivity(),
  topStandards:     topByType('standard',    6),
  topTechnologies:  topByType('technology',  6),
  topArticles:      topByType('article',     6),
  topTerms:         topByType('term',        6),
  topDiagrams:      buildDiagramNodes(6),
  topCalculators:   buildCalculatorNodes(),
  topComparisons:   topByType('comparison',  6),
  recentStandards:  buildRecentStandards(6),
  graphVersion:     KC_GRAPH_METADATA.graphVersion,
};
