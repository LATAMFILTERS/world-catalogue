/**
 * coverage-analyzer.ts
 * ELIMFILTERS — Cross Reference Intelligence Engine v1.0
 *
 * Coverage Analysis Engine.
 * Generates automatic coverage metrics across all dimensions.
 */

import type { CoverageReport, CoverageByDimension } from './xref-types';
import { XREF_GRAPH } from './xref-resolver';

// ============================================================================
// DIMENSION BUILDERS
// ============================================================================

function buildByOem(): CoverageByDimension[] {
  const oemStats = new Map<string, { oemParts: number; edges: number; confidence: number[] }>();

  for (const node of XREF_GRAPH.getNodesByType('OEM_PART')) {
    if (!oemStats.has(node.oemId)) {
      oemStats.set(node.oemId, { oemParts: 0, edges: 0, confidence: [] });
    }
    oemStats.get(node.oemId)!.oemParts++;
  }

  for (const edge of XREF_GRAPH.getActiveEdges()) {
    const from = XREF_GRAPH.getNode(edge.fromNodeId);
    if (!from || from.type !== 'OEM_PART') continue;
    const stats = oemStats.get(from.oemId);
    if (stats) {
      stats.edges++;
      stats.confidence.push(edge.confidenceScore);
    }
  }

  const results: CoverageByDimension[] = [];
  for (const [oemId, stats] of Array.from(oemStats.entries())) {
    const avgConf = stats.confidence.length
      ? Math.round(stats.confidence.reduce((s, c) => s + c, 0) / stats.confidence.length)
      : 0;
    const coverage = stats.oemParts > 0
      ? Math.round((stats.edges / stats.oemParts) * 100)
      : 0;

    results.push({
      dimension: 'OEM',
      key: oemId,
      oemParts: stats.oemParts,
      elimParts: stats.edges,
      mappings: stats.edges,
      coveragePercent: Math.min(100, coverage),
      averageConfidence: avgConf,
    });
  }
  return results.sort((a, b) => b.mappings - a.mappings);
}

function buildByDutyClass(): CoverageByDimension[] {
  const stats: Record<string, { oemParts: number; edges: number; confidence: number[] }> = {
    HD: { oemParts: 0, edges: 0, confidence: [] },
    LD: { oemParts: 0, edges: 0, confidence: [] },
    UNKNOWN: { oemParts: 0, edges: 0, confidence: [] },
  };

  for (const node of XREF_GRAPH.getNodesByType('OEM_PART')) {
    stats[node.duty].oemParts++;
  }

  for (const edge of XREF_GRAPH.getActiveEdges()) {
    const from = XREF_GRAPH.getNode(edge.fromNodeId);
    if (!from || from.type !== 'OEM_PART') continue;
    stats[from.duty].edges++;
    stats[from.duty].confidence.push(edge.confidenceScore);
  }

  return Array.from(Object.entries(stats)).map(([duty, s]) => ({
    dimension: 'Duty Class',
    key: duty,
    oemParts: s.oemParts,
    elimParts: s.edges,
    mappings: s.edges,
    coveragePercent: s.oemParts > 0 ? Math.min(100, Math.round((s.edges / s.oemParts) * 100)) : 0,
    averageConfidence: s.confidence.length
      ? Math.round(s.confidence.reduce((a, b) => a + b, 0) / s.confidence.length)
      : 0,
  }));
}

function buildByCategory(): CoverageByDimension[] {
  const stats = new Map<string, { oemParts: number; edges: number; confidence: number[] }>();

  for (const node of XREF_GRAPH.getNodesByType('OEM_PART')) {
    const cat = node.category || 'UNKNOWN';
    if (!stats.has(cat)) stats.set(cat, { oemParts: 0, edges: 0, confidence: [] });
    stats.get(cat)!.oemParts++;
  }

  for (const edge of XREF_GRAPH.getActiveEdges()) {
    const from = XREF_GRAPH.getNode(edge.fromNodeId);
    if (!from || from.type !== 'OEM_PART') continue;
    const cat = from.category || 'UNKNOWN';
    if (!stats.has(cat)) stats.set(cat, { oemParts: 0, edges: 0, confidence: [] });
    stats.get(cat)!.edges++;
    stats.get(cat)!.confidence.push(edge.confidenceScore);
  }

  return Array.from(stats.entries()).map(([cat, s]) => ({
    dimension: 'Category',
    key: cat,
    oemParts: s.oemParts,
    elimParts: s.edges,
    mappings: s.edges,
    coveragePercent: s.oemParts > 0 ? Math.min(100, Math.round((s.edges / s.oemParts) * 100)) : 0,
    averageConfidence: s.confidence.length
      ? Math.round(s.confidence.reduce((a, b) => a + b, 0) / s.confidence.length)
      : 0,
  }));
}

// ============================================================================
// MAIN COVERAGE REPORT
// ============================================================================

export function analyzeCoverage(): CoverageReport {
  const allEdges  = XREF_GRAPH.getAllEdges();
  const activeEdges = XREF_GRAPH.getActiveEdges();
  const totalOemParts  = XREF_GRAPH.getNodesByType('OEM_PART').length;
  const totalElimParts = XREF_GRAPH.getNodesByType('ELIMFILTERS').length;

  const allConfidences = activeEdges.map(e => e.confidenceScore);
  const avgConf = allConfidences.length
    ? Math.round(allConfidences.reduce((s, c) => s + c, 0) / allConfidences.length)
    : 0;

  return {
    generatedAt: new Date().toISOString(),
    totalOemParts,
    totalElimParts,
    totalEdges: allEdges.length,
    totalActiveEdges: activeEdges.length,
    averageConfidence: avgConf,
    byOem: buildByOem(),
    byTechnology: [], // Populated when technology registry is linked
    byProtectionSystem: [], // Populated when system registry is linked
    byDutyClass: buildByDutyClass(),
    byCategory: buildByCategory(),
  };
}
