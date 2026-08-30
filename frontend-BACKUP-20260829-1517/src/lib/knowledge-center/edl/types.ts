/**
 * edl/types.ts
 * Engineering Data Layer — Shared Entity Types
 *
 * Every EDL entity carries governance metadata regardless of content completeness.
 * Engineering content fields are optional at draft status; required at published status.
 * Relationship arrays use permanent identifiers (STD-xxx, TECH-xxx, etc.) exclusively.
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
  // Relationships — permanent IDs
  readonly addressedByTechnologies: string[];   // TECH-xxx
  readonly measuredByStandards: string[];       // STD-xxx
  // Engineering content — populated in Phase 4
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
  // Relationships — permanent IDs
  readonly implementedByTechnologies: string[];  // TECH-xxx
  readonly addressesProblems: string[];          // PROB-xxx
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
  // Relationships — permanent IDs
  readonly implementsStandards: string[];  // STD-xxx
  readonly addressesProblems: string[];   // PROB-xxx
  readonly usedInSystems: string[];       // SYS-xxx
  // Engineering content — populated as available
  readonly tagline?: string;
  readonly engineeringPrinciple?: string;
}

// ── System EDL Entity ──────────────────────────────────────────────────────

export interface EDLSystemEntity extends EDLEntityMeta {
  readonly name: string;           // e.g. "Air Intake Protection"
  readonly slug: string;           // e.g. "air-intake"
  readonly description: string;
  // Relationships — permanent IDs
  readonly primaryTechnologies: string[];    // TECH-xxx
  readonly supportingTechnologies: string[]; // TECH-xxx
  readonly standards: string[];              // STD-xxx
  readonly productFamilies: string[];        // FAM-xxx
  readonly industries: string[];             // IND-xxx
  // HD/LD prefix data
  readonly hdPrefix: string | null;
  readonly ldPrefix: string | null;
}

// ── Family EDL Entity ──────────────────────────────────────────────────────

export interface EDLFamilyEntity extends EDLEntityMeta {
  readonly name: string;           // e.g. "Primary Air Filters"
  readonly slug: string;           // e.g. "primary-air"
  // Relationships — permanent IDs
  readonly system: string;                // SYS-xxx (single parent system)
  readonly primaryTechnology: string;     // TECH-xxx
  readonly standards: string[];           // STD-xxx
  // HD/LD prefix data
  readonly hdPrefix: string | null;
  readonly ldPrefix: string | null;
  readonly dutyClass: 'HD' | 'LD' | 'HD+LD';
}

// ── Industry EDL Entity ────────────────────────────────────────────────────

export type ContaminationSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface EDLIndustryEntity extends EDLEntityMeta {
  readonly name: string;           // e.g. "Mining"
  readonly slug: string;           // e.g. "mining"
  readonly contaminationSeverity: ContaminationSeverity;
  // Relationships — permanent IDs
  readonly systems: string[];       // SYS-xxx
  readonly technologies: string[];  // TECH-xxx
  readonly standards: string[];     // STD-xxx
}

// ── Terminology EDL Entity ─────────────────────────────────────────────────

export interface EDLTerminologyEntity extends EDLEntityMeta {
  readonly term: string;           // e.g. "Beta Ratio"
  readonly slug: string;           // e.g. "beta-ratio"
  // Relationships — permanent IDs
  readonly relatedTerms: string[];        // TERM-xxx
  readonly relatedStandards: string[];    // STD-xxx
  // Content (canonical definition — required even at draft for terminology)
  readonly definition: string;
  readonly aliases: string[];
}

// ── Registries ─────────────────────────────────────────────────────────────

export type EDLProblemRegistry    = Record<string, EDLProblemEntity>;
export type EDLStandardRegistry   = Record<string, EDLStandardEntity>;
export type EDLTechnologyRegistry = Record<string, EDLTechnologyEntity>;
export type EDLSystemRegistry     = Record<string, EDLSystemEntity>;
export type EDLFamilyRegistry     = Record<string, EDLFamilyEntity>;
export type EDLIndustryRegistry   = Record<string, EDLIndustryEntity>;
export type EDLTerminologyRegistry = Record<string, EDLTerminologyEntity>;
