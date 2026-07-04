/**
 * edl/types.ts
 * Engineering Data Layer — Shared Entity Types
 *
 * Every EDL entity carries governance metadata regardless of content completeness.
 * Engineering content fields are optional at draft status; required at published status.
 */

import type { PermanentId, EntityStatus } from '../governance';

export interface EDLEntityMeta {
  readonly id: PermanentId;
  readonly status: EntityStatus;
  readonly version: string;
  readonly created: string;        // ISO 8601
  readonly lastModified: string;   // ISO 8601
  readonly contentPhase: number;   // Which phase populates the content (3, 4, etc.)
}

// ── Problem EDL Entity ─────────────────────────────────────────────────────

export type ProblemSeverity = 'critical' | 'high' | 'medium' | 'low';

export type ProblemCategory =
  | 'mechanical-wear'
  | 'contamination'
  | 'structural-failure'
  | 'chemical-degradation'
  | 'biological';

export interface EDLProblemEntity extends EDLEntityMeta {
  readonly name: string;
  readonly slug: string;
  readonly category: ProblemCategory;
  readonly severity: ProblemSeverity;
  // Engineering content — populated in Phase 3
  readonly definition?: string;
  readonly engineeringExplanation?: string;
  readonly minimumCleanlinessTarget?: string;
  readonly particleSizeThreshold?: string;
  readonly aiQueryPatterns?: string[];
}

// ── Standard EDL Entity ────────────────────────────────────────────────────

export interface EDLStandardEntity extends EDLEntityMeta {
  readonly code: string;           // e.g. "ISO 16889"
  readonly slug: string;           // e.g. "iso-16889"
  readonly title: string;
  readonly issuingBody: string;    // e.g. "ISO", "ASTM", "SAE", "NFPA"
  readonly domain: string[];       // e.g. ["hydraulic", "lube-oil"]
  // Engineering content — populated as available
  readonly scope?: string;
  readonly year?: number;
}

// ── Technology EDL Entity ──────────────────────────────────────────────────

export interface EDLTechnologyEntity extends EDLEntityMeta {
  readonly name: string;           // e.g. "MACROCORE"
  readonly slug: string;           // e.g. "macrocore"
  readonly domain: string;         // Primary filtration domain
  readonly contaminationTarget: string[];
  // Engineering content — populated as available
  readonly tagline?: string;
  readonly engineeringPrinciple?: string;
}

// ── Registries ─────────────────────────────────────────────────────────────

export type EDLProblemRegistry = Record<string, EDLProblemEntity>;
export type EDLStandardRegistry = Record<string, EDLStandardEntity>;
export type EDLTechnologyRegistry = Record<string, EDLTechnologyEntity>;
