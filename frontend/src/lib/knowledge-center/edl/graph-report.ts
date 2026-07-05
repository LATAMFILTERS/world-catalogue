/**
 * edl/graph-report.ts
 * Engineering Data Layer — Graph Statistics Report
 *
 * Computes entity counts, edge counts, coverage metrics, orphan detection,
 * and graph density. Used for developer tooling and governance dashboards.
 */

import { EDL_STANDARDS } from './standard-registry';
import { EDL_TECHNOLOGIES } from './technology-registry';
import { EDL_PROBLEMS } from './problem-registry';
import { EDL_SYSTEMS } from './system-registry';
import { EDL_FAMILIES } from './family-registry';
import { EDL_INDUSTRIES } from './industry-registry';
import { EDL_TERMINOLOGY } from './terminology-edl';
import { edgeCountByType, getAllEdges } from './knowledge-graph';
import { validateRegistries, ValidationIssue } from './validation';
import { ENGINEERING_ARTICLES } from '@/lib/knowledge-center-data';
import type { EntityStatus } from '../governance';

// ── Entity count helpers ────────────────────────────────────────────────────

function countByStatus(registry: Record<string, { status: EntityStatus }>): Record<EntityStatus, number> {
  const counts = {} as Record<EntityStatus, number>;
  for (const entity of Object.values(registry)) {
    counts[entity.status] = (counts[entity.status] ?? 0) + 1;
  }
  return counts;
}

// ── Report types ────────────────────────────────────────────────────────────

export interface EntityCounts {
  readonly standards: number;
  readonly technologies: number;
  readonly problems: number;
  readonly systems: number;
  readonly families: number;
  readonly industries: number;
  readonly terminology: number;
  readonly articles: number;
  readonly total: number;
}

export interface EntityStatusBreakdown {
  readonly standards: Record<EntityStatus, number>;
  readonly technologies: Record<EntityStatus, number>;
  readonly problems: Record<EntityStatus, number>;
  readonly systems: Record<EntityStatus, number>;
  readonly families: Record<EntityStatus, number>;
  readonly industries: Record<EntityStatus, number>;
  readonly terminology: Record<EntityStatus, number>;
}

export interface CoverageMetrics {
  /** Technologies that implement at least one standard. */
  readonly technologiesWithStandards: number;
  readonly technologiesWithStandardsPct: number;
  /** Technologies that address at least one problem. */
  readonly technologiesWithProblems: number;
  readonly technologiesWithProblemsPct: number;
  /** Problems addressed by at least one technology. */
  readonly problemsWithTechnologies: number;
  readonly problemsWithTechnologiesPct: number;
  /** Industries linked to at least one system. */
  readonly industriesWithSystems: number;
  readonly industriesWithSystemsPct: number;
  /** Families linked to a technology. */
  readonly familiesWithTechnology: number;
  readonly familiesWithTechnologyPct: number;
  /** Standards referenced by at least one article. */
  readonly standardsWithArticles: number;
  readonly standardsWithArticlesPct: number;
}

export interface OrphanReport {
  readonly ids: string[];
  readonly count: number;
}

export interface GraphReport {
  readonly generatedAt: string;
  readonly entities: EntityCounts;
  readonly statusBreakdown: EntityStatusBreakdown;
  readonly edges: {
    readonly total: number;
    readonly byType: Record<string, number>;
  };
  readonly coverage: CoverageMetrics;
  readonly orphans: OrphanReport;
  readonly graphDensity: number;
  readonly validation: {
    readonly errorCount: number;
    readonly warningCount: number;
    readonly passed: boolean;
    readonly issues: ValidationIssue[];
  };
}

// ── Report computation ──────────────────────────────────────────────────────

export function buildGraphReport(): GraphReport {
  const stdCount    = Object.keys(EDL_STANDARDS).length;
  const techCount   = Object.keys(EDL_TECHNOLOGIES).length;
  const probCount   = Object.keys(EDL_PROBLEMS).length;
  const sysCount    = Object.keys(EDL_SYSTEMS).length;
  const famCount    = Object.keys(EDL_FAMILIES).length;
  const indCount    = Object.keys(EDL_INDUSTRIES).length;
  const termCount   = Object.keys(EDL_TERMINOLOGY).length;
  const artCount    = ENGINEERING_ARTICLES.length;
  const totalNodes  = stdCount + techCount + probCount + sysCount + famCount + indCount + termCount + artCount;

  const edges = getAllEdges();
  const totalEdges = edges.length;

  // Graph density: actual edges / max possible edges in a directed graph
  // Max directed edges = n * (n - 1)
  const graphDensity = totalNodes > 1
    ? parseFloat((totalEdges / (totalNodes * (totalNodes - 1))).toFixed(4))
    : 0;

  // Coverage
  const techsWithStds = Object.values(EDL_TECHNOLOGIES).filter(t => t.implementsStandards.length > 0).length;
  const techsWithProbs = Object.values(EDL_TECHNOLOGIES).filter(t => t.addressesProblems.length > 0).length;
  const probsWithTechs = Object.values(EDL_PROBLEMS).filter(p => p.addressedByTechnologies.length > 0).length;
  const indsWithSys = Object.values(EDL_INDUSTRIES).filter(i => i.systems.length > 0).length;
  const famsWithTech = Object.values(EDL_FAMILIES).filter(f => f.primaryTechnology !== '').length;

  // Standards with articles: count unique STD IDs that appear as edge sources for STANDARD_REFERENCED_BY_ARTICLE
  const stdsWithArticles = new Set(
    edges.filter(e => e.type === 'STANDARD_REFERENCED_BY_ARTICLE').map(e => e.source)
  ).size;

  const pct = (n: number, total: number): number =>
    total > 0 ? parseFloat(((n / total) * 100).toFixed(1)) : 0;

  // Orphans: entities with no graph connections
  const connected = new Set<string>();
  for (const edge of edges) {
    connected.add(edge.source);
    connected.add(edge.target);
  }
  const allIds = [
    ...Object.keys(EDL_STANDARDS),
    ...Object.keys(EDL_TECHNOLOGIES),
    ...Object.keys(EDL_PROBLEMS),
    ...Object.keys(EDL_SYSTEMS),
    ...Object.keys(EDL_FAMILIES),
    ...Object.keys(EDL_INDUSTRIES),
    ...Object.keys(EDL_TERMINOLOGY),
  ];
  const orphanIds = allIds.filter(id => !connected.has(id));

  const validation = validateRegistries();

  return {
    generatedAt: '2026-07-04',
    entities: {
      standards: stdCount,
      technologies: techCount,
      problems: probCount,
      systems: sysCount,
      families: famCount,
      industries: indCount,
      terminology: termCount,
      articles: artCount,
      total: totalNodes,
    },
    statusBreakdown: {
      standards: countByStatus(EDL_STANDARDS),
      technologies: countByStatus(EDL_TECHNOLOGIES),
      problems: countByStatus(EDL_PROBLEMS),
      systems: countByStatus(EDL_SYSTEMS),
      families: countByStatus(EDL_FAMILIES),
      industries: countByStatus(EDL_INDUSTRIES),
      terminology: countByStatus(EDL_TERMINOLOGY),
    },
    edges: {
      total: totalEdges,
      byType: edgeCountByType(),
    },
    coverage: {
      technologiesWithStandards: techsWithStds,
      technologiesWithStandardsPct: pct(techsWithStds, techCount),
      technologiesWithProblems: techsWithProbs,
      technologiesWithProblemsPct: pct(techsWithProbs, techCount),
      problemsWithTechnologies: probsWithTechs,
      problemsWithTechnologiesPct: pct(probsWithTechs, probCount),
      industriesWithSystems: indsWithSys,
      industriesWithSystemsPct: pct(indsWithSys, indCount),
      familiesWithTechnology: famsWithTech,
      familiesWithTechnologyPct: pct(famsWithTech, famCount),
      standardsWithArticles: stdsWithArticles,
      standardsWithArticlesPct: pct(stdsWithArticles, stdCount),
    },
    orphans: {
      ids: orphanIds,
      count: orphanIds.length,
    },
    graphDensity,
    validation: {
      errorCount: validation.errorCount,
      warningCount: validation.warningCount,
      passed: validation.passed,
      issues: validation.issues,
    },
  };
}

/** Render a plain-text graph report for console/log output. */
export function formatGraphReport(report: GraphReport): string {
  const lines: string[] = [
    '══════════════════════════════════════════════════════',
    ' ELIMFILTERS KNOWLEDGE GRAPH — DEVELOPER REPORT',
    `  Generated: ${report.generatedAt}`,
    '══════════════════════════════════════════════════════',
    '',
    '── ENTITY COUNTS ─────────────────────────────────────',
    `  Standards    : ${report.entities.standards}`,
    `  Technologies : ${report.entities.technologies}`,
    `  Problems     : ${report.entities.problems}`,
    `  Systems      : ${report.entities.systems}`,
    `  Families     : ${report.entities.families}`,
    `  Industries   : ${report.entities.industries}`,
    `  Terminology  : ${report.entities.terminology}`,
    `  Articles     : ${report.entities.articles}`,
    `  ─────────────────────────────────────────────────`,
    `  Total Nodes  : ${report.entities.total}`,
    '',
    '── EDGE COUNTS ───────────────────────────────────────',
    `  Total Edges  : ${report.edges.total}`,
    ...Object.entries(report.edges.byType).map(
      ([type, count]) => `  ${type.padEnd(42)}: ${count}`
    ),
    '',
    '── COVERAGE ──────────────────────────────────────────',
    `  Technologies with standards  : ${report.coverage.technologiesWithStandards}/${report.entities.technologies} (${report.coverage.technologiesWithStandardsPct}%)`,
    `  Technologies with problems   : ${report.coverage.technologiesWithProblems}/${report.entities.technologies} (${report.coverage.technologiesWithProblemsPct}%)`,
    `  Problems with technologies   : ${report.coverage.problemsWithTechnologies}/${report.entities.problems} (${report.coverage.problemsWithTechnologiesPct}%)`,
    `  Industries with systems      : ${report.coverage.industriesWithSystems}/${report.entities.industries} (${report.coverage.industriesWithSystemsPct}%)`,
    `  Families with technology     : ${report.coverage.familiesWithTechnology}/${report.entities.families} (${report.coverage.familiesWithTechnologyPct}%)`,
    `  Standards with articles      : ${report.coverage.standardsWithArticles}/${report.entities.standards} (${report.coverage.standardsWithArticlesPct}%)`,
    '',
    '── GRAPH DENSITY ─────────────────────────────────────',
    `  Density: ${report.graphDensity} (${report.edges.total} edges / ${report.entities.total} × ${report.entities.total - 1} max)`,
    '',
    '── ORPHAN ENTITIES ───────────────────────────────────',
    report.orphans.count === 0
      ? '  None — all entities have graph connections.'
      : `  ${report.orphans.count} orphan(s): ${report.orphans.ids.join(', ')}`,
    '',
    '── VALIDATION ────────────────────────────────────────',
    `  Status  : ${report.validation.passed ? 'PASSED' : 'FAILED'}`,
    `  Errors  : ${report.validation.errorCount}`,
    `  Warnings: ${report.validation.warningCount}`,
    ...(report.validation.issues.length > 0
      ? report.validation.issues.map(
          i => `  [${i.severity.toUpperCase()}] ${i.entityId} — ${i.message}`
        )
      : ['  No issues.']),
    '',
    '══════════════════════════════════════════════════════',
  ];
  return lines.join('\n');
}
