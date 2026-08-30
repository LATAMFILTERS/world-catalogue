/**
 * problem-types.ts
 * ELIMFILTERS Engineering Knowledge Platform — Problem Registry Types
 *
 * Defines the Problem entity — a first-class engineering concept in the
 * Knowledge Graph. Problems are the primary entry point for AI retrieval:
 * when a user asks "what causes X?", the retrieval system resolves to a
 * Problem entity before surfacing standards, technologies, or products.
 *
 * Architecture reference: KC-PLAN-002 v1.1 — KC-11 Problem Graph
 *
 * 15 canonical Problems are defined in this registry across 5 categories.
 * Problem data is populated in Phase 3 (Engineering Data Layer).
 */

import type { PermanentId } from './governance';

// ── Problem Categories ────────────────────────────────────────────────────────

export type ProblemCategory =
  | 'mechanical-wear'    // Abrasive wear, adhesive wear, fatigue wear
  | 'contamination'      // Particle, water, chemical, biological contamination
  | 'structural-failure' // Cavitation, collapse, fatigue fracture
  | 'chemical-degradation' // Varnish, oxidation, acid formation
  | 'biological';        // Microbial growth, biofilm formation

// ── Failure Progression Stage ─────────────────────────────────────────────────

export interface FailureProgressionStage {
  stage: number;           // Sequential stage number (1 = initiating event)
  event: string;           // Engineering description of the stage event
  threshold?: string;      // Measurable threshold at which this stage occurs
  consequence: string;     // What happens if this stage is not interrupted
}

// ── Technology Recommendation within a Problem ────────────────────────────────

export interface ProblemTechnologyRecommendation {
  slug: PermanentId;                           // TECH-xxx permanent ID
  mechanism: string;                           // How this technology controls the problem
  effectiveness: 'primary' | 'supporting';     // Primary = designed for this, Supporting = assists
}

// ── Component Reference ───────────────────────────────────────────────────────

export interface Component {
  id: PermanentId;          // COMP-xxx permanent ID
  name: string;             // Human-readable component name
  criticalClearance?: string; // Operating clearance relevant to this problem
}

// ── Contamination Type Reference ──────────────────────────────────────────────

export interface ContaminationType {
  id: string;
  name: string;
  particleSizeRange?: string;
  contaminantClass: 'SOLID_PARTICLE' | 'LIQUID_PHASE' | 'GASEOUS' | 'BIOLOGICAL' | 'CHEMICAL';
}

// ── Problem Entity ─────────────────────────────────────────────────────────────

export interface Problem {
  id: PermanentId;                             // PROB-xxx permanent ID
  name: string;                                // "Abrasive Wear"
  category: ProblemCategory;
  severity: 'critical' | 'high' | 'medium' | 'low';
  definition: string;                          // Neutral technical definition
  engineeringExplanation: string;              // Root cause mechanics
  failureProgression: FailureProgressionStage[];
  affectedComponents: Component[];
  contaminationSources: ContaminationType[];
  recommendedTechnologies: ProblemTechnologyRecommendation[];
  applicableStandards: PermanentId[];
  relatedProblems: PermanentId[];
  relatedArticles: PermanentId[];
  minimumCleanlinessTarget?: string;           // e.g. "ISO 16/14/11"
  particleSizeThreshold?: string;              // e.g. "≥ 4 µm"
  // AI retrieval: natural language query patterns that resolve to this Problem
  aiQueryPatterns: string[];
  version: string;
  lastReviewed: string;                        // ISO 8601
}

// ── Canonical Problem IDs ─────────────────────────────────────────────────────
// 15 canonical Problems defined in KC-PLAN-002 v1.1 — KC-11 Problem Graph.
// Data populated in Phase 3 (Engineering Data Layer).

export const CANONICAL_PROBLEM_IDS = {
  // Mechanical Wear
  ABRASIVE_WEAR:      'PROB-ABRASIVE-WEAR',
  ADHESIVE_WEAR:      'PROB-ADHESIVE-WEAR',
  BEARING_WEAR:       'PROB-BEARING-WEAR',
  INJECTOR_WEAR:      'PROB-INJECTOR-WEAR',

  // Contamination
  SILICON_DUST:       'PROB-SILICON-DUST-INGESTION',
  WATER_INGRESS:      'PROB-WATER-INGRESS',
  FUEL_CONTAMINATION: 'PROB-FUEL-CONTAMINATION',
  AIR_RESTRICTION:    'PROB-AIR-RESTRICTION',

  // Structural Failure
  CAVITATION:         'PROB-CAVITATION',
  PUMP_FAILURE:       'PROB-PUMP-FAILURE',
  FILTER_COLLAPSE:    'PROB-FILTER-COLLAPSE',
  MEDIA_FATIGUE:      'PROB-MEDIA-FATIGUE',

  // Chemical Degradation
  VARNISH_FORMATION:  'PROB-VARNISH-FORMATION',
  OXIDATION:          'PROB-OXIDATION',

  // Biological
  MICROBIAL_GROWTH:   'PROB-MICROBIAL-GROWTH',

  // Turbine-Specific (FH/FG Series)
  BLADE_EROSION:      'PROB-BLADE-EROSION',
  BEARING_WASH_OUT:   'PROB-BEARING-WASH-OUT',
  SEAL_LEAKAGE:       'PROB-SEAL-LEAKAGE',
  COMPRESSOR_SURGE:   'PROB-COMPRESSOR-SURGE',
} as const;

export type CanonicalProblemId = typeof CANONICAL_PROBLEM_IDS[keyof typeof CANONICAL_PROBLEM_IDS];

// ── Problem Registry (shell — data populated in Phase 3) ─────────────────────
// The registry map is exported so Phase 3 can import and populate it.
// The type constraint ensures all 15 canonical IDs are eventually covered.

export type ProblemRegistry = Partial<Record<CanonicalProblemId, Problem>>;
