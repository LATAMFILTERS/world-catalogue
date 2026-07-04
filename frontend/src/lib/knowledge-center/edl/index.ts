/**
 * edl/index.ts
 * Engineering Data Layer — Barrel Export
 *
 * Single import point for all EDL registries, the Knowledge Graph,
 * validation tooling, and the graph report.
 *
 * Import from '@/lib/knowledge-center/edl' in any component or data file.
 */

// ── Types ─────────────────────────────────────────────────────────────────

export type {
  EDLEntityMeta,
  // Entity types
  EDLProblemEntity,
  EDLStandardEntity,
  EDLTechnologyEntity,
  EDLSystemEntity,
  EDLFamilyEntity,
  EDLIndustryEntity,
  EDLTerminologyEntity,
  // Registry types
  EDLProblemRegistry,
  EDLStandardRegistry,
  EDLTechnologyRegistry,
  EDLSystemRegistry,
  EDLFamilyRegistry,
  EDLIndustryRegistry,
  EDLTerminologyRegistry,
  // Enums
  ProblemSeverity,
  ProblemCategory,
  ContaminationSeverity,
} from './types';

// ── Registries ────────────────────────────────────────────────────────────

export { EDL_PROBLEMS }     from './problem-registry';
export { EDL_STANDARDS }    from './standard-registry';
export { EDL_TECHNOLOGIES } from './technology-registry';
export { EDL_SYSTEMS }      from './system-registry';
export { EDL_FAMILIES }     from './family-registry';
export { EDL_INDUSTRIES }   from './industry-registry';
export { EDL_TERMINOLOGY }  from './terminology-edl';

// ── Knowledge Graph ───────────────────────────────────────────────────────

export type { GraphEdge, EdgeType } from './knowledge-graph';

export {
  // Core
  getAllEdges,
  edgeCount,
  edgeCountByType,
  edgesByType,
  edgesFrom,
  edgesTo,
  traverse,
  // Typed queries
  technologyStandards,
  technologyProblems,
  problemTechnologies,
  problemStandards,
  industrySystems,
  industryTechnologies,
  familyTechnology,
  standardArticles,
  standardTechnologies,
  systemTechnologies,
  systemFamilies,
} from './knowledge-graph';

// ── Validation ────────────────────────────────────────────────────────────

export type { ValidationIssue, ValidationSeverity, ValidationReport } from './validation';

export {
  validateRegistries,
  getErrors,
  getWarnings,
} from './validation';

// ── Graph Report ──────────────────────────────────────────────────────────

export type {
  EntityCounts,
  EntityStatusBreakdown,
  CoverageMetrics,
  OrphanReport,
  GraphReport,
} from './graph-report';

export {
  buildGraphReport,
  formatGraphReport,
} from './graph-report';

// ── Registry Summary ──────────────────────────────────────────────────────
// Backward-compatible summary object for coverage dashboard.

import { EDL_PROBLEMS }     from './problem-registry';
import { EDL_STANDARDS }    from './standard-registry';
import { EDL_TECHNOLOGIES } from './technology-registry';
import { EDL_SYSTEMS }      from './system-registry';
import { EDL_FAMILIES }     from './family-registry';
import { EDL_INDUSTRIES }   from './industry-registry';
import { EDL_TERMINOLOGY }  from './terminology-edl';
import type { EntityStatus } from '../governance';

export interface EDLEntitySummary {
  total: number;
  byStatus: Record<EntityStatus, number>;
  publishedCount: number;
  draftCount: number;
}

function summarize(registry: Record<string, { status: EntityStatus }>): EDLEntitySummary {
  const entities = Object.values(registry);
  const byStatus = entities.reduce<Partial<Record<EntityStatus, number>>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1;
    return acc;
  }, {});
  return {
    total: entities.length,
    byStatus: byStatus as Record<EntityStatus, number>,
    publishedCount: entities.filter(e => e.status === 'published' || e.status === 'engineering-approved').length,
    draftCount: entities.filter(e => e.status === 'draft').length,
  };
}

export const EDL_SUMMARY = {
  problems:     summarize(EDL_PROBLEMS),
  standards:    summarize(EDL_STANDARDS),
  technologies: summarize(EDL_TECHNOLOGIES),
  systems:      summarize(EDL_SYSTEMS),
  families:     summarize(EDL_FAMILIES),
  industries:   summarize(EDL_INDUSTRIES),
  terminology:  summarize(EDL_TERMINOLOGY),
} as const;
