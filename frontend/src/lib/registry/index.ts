/**
 * registry/index.ts
 * ELIMFILTERS Engineering Intelligence Platform — Phase 1: Engineering Foundation
 *
 * Registry barrel export — single import point for all governed Knowledge Graph registries.
 *
 * Usage:
 *   import { TECHNOLOGY_ARCHITECTURES, getTechArchByDomain } from '@/lib/registry';
 *   import { ENGINEERING_PRINCIPLES, getPrinciplesByDomain } from '@/lib/registry';
 *
 * Constitutional invariants enforced at this layer:
 *   - Only PUBLISHED (Level 3) entities are exported for platform consumption
 *   - All entity relationships are bidirectional (verified by accessor functions)
 *   - Engineering Memory is read-only (append-only archive)
 */

// ── Type system ──────────────────────────────────────────────────────────────
export type {
  MaturityLevel,
  ScienceDomain,
  SystemDomain,
  RelationshipType,
  VersionRecord,
  BaseEntity,
  EngineeringPrinciple,
  TechnologyArchitecture,
  StandardRecord,
  FailureModeRecord,
  ContaminationRecord,
  EngineeringMemoryEntry,
  KnowledgeGraphRelationship,
  ProtectionMedia,
  MaterialSpec,
  ConstructionDetail,
  FlowDynamic,
  CaptureCapability,
  PerformanceClaim,
  FailureModeEntry,
} from './registry-types';

export { MATURITY, MATURITY_LABELS } from './registry-types';

// ── Engineering Principles Registry ─────────────────────────────────────────
export {
  ENGINEERING_PRINCIPLES,
  getPrinciplesByMaturity,
  getPrinciplesByDomain,
  getPrinciplesForTechnology,
} from './engineering-principles';

// ── Technology Architecture Registry ────────────────────────────────────────
export {
  TECHNOLOGY_ARCHITECTURES,
  getTechArchByMaturity,
  getTechArchByDomain,
  getTechArchByPrinciple,
} from './technology-architectures';

// ── Standards Registry ───────────────────────────────────────────────────────
export {
  STANDARDS_REGISTRY,
  getStandardById,
  getStandardsForTechnology,
  getStandardsForPrinciple,
} from './standards-registry';

// ── Failure Modes Registry ───────────────────────────────────────────────────
export {
  FAILURE_MODES_REGISTRY,
  getFailureModesByTechnology,
  getFailureModesBySystem,
} from './failure-modes-registry';

// ── Contamination Registry ───────────────────────────────────────────────────
export {
  CONTAMINATION_REGISTRY,
  getContaminationByClass,
  getContaminationForFailureMode,
} from './contamination-registry';

// ── Engineering Memory ───────────────────────────────────────────────────────
export {
  ENGINEERING_MEMORY,
  getMemoryByEntity,
  getMemoryByEntityType,
  getMemoryByVersion,
  getMemoryByEdr,
  getMemorySummary,
} from './engineering-memory';

// ── Knowledge Graph convenience queries ─────────────────────────────────────

import { TECHNOLOGY_ARCHITECTURES } from './technology-architectures';
import { ENGINEERING_PRINCIPLES } from './engineering-principles';
import { FAILURE_MODES_REGISTRY } from './failure-modes-registry';
import { CONTAMINATION_REGISTRY } from './contamination-registry';
import { STANDARDS_REGISTRY } from './standards-registry';
import { MATURITY } from './registry-types';
import type { TechnologyArchitecture, EngineeringPrinciple } from './registry-types';

/**
 * Returns all PUBLISHED Technology Architectures.
 * Platform-facing — only Level 3 entities exposed.
 */
export function getAllPublishedTechnologies(): TechnologyArchitecture[] {
  return Object.values(TECHNOLOGY_ARCHITECTURES).filter(
    (t) => t.maturity === MATURITY.PUBLISHED
  );
}

/**
 * Returns all PUBLISHED Engineering Principles.
 */
export function getAllPublishedPrinciples(): EngineeringPrinciple[] {
  return Object.values(ENGINEERING_PRINCIPLES).filter(
    (p) => p.maturity === MATURITY.PUBLISHED
  );
}

/**
 * Returns the complete Knowledge Graph summary for platform diagnostics.
 */
export function getKnowledgeGraphSummary() {
  const technologies = Object.values(TECHNOLOGY_ARCHITECTURES);
  const principles = Object.values(ENGINEERING_PRINCIPLES);
  const standards = Object.values(STANDARDS_REGISTRY);
  const failureModes = Object.values(FAILURE_MODES_REGISTRY);
  const contaminations = Object.values(CONTAMINATION_REGISTRY);

  return {
    entityCounts: {
      technologyArchitectures: technologies.length,
      engineeringPrinciples: principles.length,
      standards: standards.length,
      failureModes: failureModes.length,
      contaminationTypes: contaminations.length,
    },
    publishedCounts: {
      technologyArchitectures: technologies.filter((t) => t.maturity === MATURITY.PUBLISHED).length,
      engineeringPrinciples: principles.filter((p) => p.maturity === MATURITY.PUBLISHED).length,
    },
    systemDomainsCovered: Array.from(new Set(technologies.map((t) => t.systemDomain))).sort(),
    scienceDomainsCovered: Array.from(new Set(principles.map((p) => p.scienceDomain))).sort(),
    phase1Complete: technologies.length === 12 && principles.length >= 11,
  };
}
