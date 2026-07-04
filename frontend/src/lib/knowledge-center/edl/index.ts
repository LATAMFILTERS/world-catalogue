/**
 * edl/index.ts
 * Engineering Data Layer — Barrel Export
 *
 * The EDL provides governed entity shells for all KC content types.
 * Import from '@/lib/knowledge-center/edl' in any component or data file.
 */

export type {
  EDLEntityMeta,
  EDLProblemEntity,
  EDLStandardEntity,
  EDLTechnologyEntity,
  EDLProblemRegistry,
  EDLStandardRegistry,
  EDLTechnologyRegistry,
  ProblemSeverity,
  ProblemCategory,
} from './types';

export { EDL_PROBLEMS } from './problem-registry';
export { EDL_STANDARDS } from './standard-registry';
export { EDL_TECHNOLOGIES } from './technology-registry';

// ── Registry Summary ──────────────────────────────────────────────────────────
// Used by the coverage dashboard and governance tooling.

import { EDL_PROBLEMS } from './problem-registry';
import { EDL_STANDARDS } from './standard-registry';
import { EDL_TECHNOLOGIES } from './technology-registry';
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
    publishedCount: entities.filter((e) => e.status === 'published' || e.status === 'engineering-approved').length,
    draftCount: entities.filter((e) => e.status === 'draft').length,
  };
}

export const EDL_SUMMARY = {
  problems: summarize(EDL_PROBLEMS),
  standards: summarize(EDL_STANDARDS),
  technologies: summarize(EDL_TECHNOLOGIES),
} as const;
