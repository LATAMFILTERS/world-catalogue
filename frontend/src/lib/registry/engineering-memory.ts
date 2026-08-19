/**
 * engineering-memory.ts
 * ELIMFILTERS Engineering Intelligence Platform — Phase 1: Engineering Foundation
 *
 * Engineering Memory Archive — append-only record of all governed entity states.
 *
 * Constitutional basis: Platform Invariant XI — Engineering Memory is permanent.
 * Implementation Rules, Rule 15: Engineering Memory is built into the stack, not bolted on.
 *
 * This module:
 * 1. Provides the append-only archive type definitions
 * 2. Records the founding engineering decisions as the first Engineering Memory entries
 * 3. Exposes query functions for governance teams
 *
 * Storage note: In Phase 1, Engineering Memory is maintained in this module as a
 * typed TypeScript record. Phase 2 (Knowledge Graph Core) will move it to
 * append-only persistent storage. This interim approach satisfies the constitutional
 * requirement that Engineering Memory exists before any entity reaches Level 3.
 *
 * The current file IS the first Engineering Memory deposit.
 */

import type { EngineeringMemoryEntry } from './registry-types';

// ============================================================================
// ENGINEERING MEMORY ARCHIVE
// This array is append-only. Entries are never removed. Mutations are a
// governance violation. New entries are added at the END only.
// ============================================================================

export const ENGINEERING_MEMORY: readonly EngineeringMemoryEntry[] = [

  // ── Founding Document Deposits ────────────────────────────────────────────
  // The governance documents themselves are the first Engineering Memory entries.
  // They establish that the Memory was operational before any entity reached Level 3.

  {
    memoryId: 'MEM-2026-07-01-001',
    entityType: 'GOVERNANCE_DOCUMENT',
    entityId: 'CONSTITUTION_v1.1',
    entityVersion: '1.1',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      document: 'ELIMFILTERS Engineering Intelligence Platform Constitution v1.1',
      status: 'FROZEN',
      platformInvariants: 11,
      constitutionalArticles: 15,
      frozenDate: '2026-07-01',
    },
    edrRef: 'EDR-H-001-v1.0',
  },

  {
    memoryId: 'MEM-2026-07-01-002',
    entityType: 'GOVERNANCE_DOCUMENT',
    entityId: 'ENGINEERING_EVOLUTION_GOVERNANCE_v1.0',
    entityVersion: '1.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      document: 'Engineering Evolution Governance v1.0',
      status: 'ACTIVE',
      evolutionLayers: 8,
      governanceAuthorities: 6,
    },
    edrRef: undefined,
  },

  {
    memoryId: 'MEM-2026-07-01-003',
    entityType: 'GOVERNANCE_DOCUMENT',
    entityId: 'EDR_FRAMEWORK_v1.0',
    entityVersion: '1.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      document: 'Engineering Decision Records Framework v1.0',
      status: 'ACTIVE',
      edrCategories: 8,
      mandatoryTemplateSections: 15,
    },
    edrRef: undefined,
  },

  {
    memoryId: 'MEM-2026-07-01-004',
    entityType: 'GOVERNANCE_DOCUMENT',
    entityId: 'IMPLEMENTATION_STRATEGY_v1.0',
    entityVersion: '1.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      document: 'Implementation Strategy v1.0',
      status: 'ACTIVE',
      phases: 7,
      deliveryPrinciples: 12,
    },
    edrRef: undefined,
  },

  {
    memoryId: 'MEM-2026-07-01-005',
    entityType: 'GOVERNANCE_DOCUMENT',
    entityId: 'FOUNDATION_FREEZE_v1.0',
    entityVersion: '1.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      document: 'Foundation Freeze & Implementation Transition v1.0',
      status: 'ACTIVE',
      architecturePhase: 'CLOSED',
      implementationPhase: 'OPEN',
      frozenBoundaries: 7,
      platformInvariants: 11,
    },
    edrRef: undefined,
  },

  // ── Phase 1 Engineering Foundation Deposits ───────────────────────────────
  // Version snapshots of all entities published at Level 3 in Phase 1.

  {
    memoryId: 'MEM-2026-07-01-006',
    entityType: 'ENGINEERING_PRINCIPLE',
    entityId: 'EP-SEP-001',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'EP-SEP-001',
      name: 'Mechanical Filtration — Depth',
      scienceDomain: 'Separation Science',
      standardRefs: ['ISO 16889', 'ISO 4406', 'SAE J1858'],
      maturity: 3,
    },
    edrRef: 'EDR-B-001-v1.0',
  },

  {
    memoryId: 'MEM-2026-07-01-007',
    entityType: 'ENGINEERING_PRINCIPLE',
    entityId: 'EP-SEP-002',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'EP-SEP-002',
      name: 'Mechanical Filtration — Surface',
      scienceDomain: 'Separation Science',
      standardRefs: ['ISO 2941', 'ISO 3723', 'ISO 3724'],
      maturity: 3,
    },
    edrRef: 'EDR-B-001-v1.0',
  },

  {
    memoryId: 'MEM-2026-07-01-008',
    entityType: 'ENGINEERING_PRINCIPLE',
    entityId: 'EP-SEP-003',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'EP-SEP-003',
      name: 'Inertial Separation',
      scienceDomain: 'Separation Science',
      standardRefs: ['ISO 16332', 'SAE J905'],
      maturity: 3,
    },
    edrRef: 'EDR-B-001-v1.0',
  },

  {
    memoryId: 'MEM-2026-07-01-009',
    entityType: 'ENGINEERING_PRINCIPLE',
    entityId: 'EP-SEP-004',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'EP-SEP-004',
      name: 'Progressive Density Architecture',
      scienceDomain: 'Separation Science',
      standardRefs: ['ISO 16889', 'ISO 19438', 'SAE J1858'],
      maturity: 3,
    },
    edrRef: 'EDR-B-001-v1.0',
  },

  {
    memoryId: 'MEM-2026-07-01-010',
    entityType: 'ENGINEERING_PRINCIPLE',
    entityId: 'EP-PHS-001',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'EP-PHS-001',
      name: 'Coalescence',
      scienceDomain: 'Phase Science',
      standardRefs: ['ASTM D6304', 'ISO 12937', 'ISO 16332'],
      maturity: 3,
    },
    edrRef: 'EDR-B-001-v1.0',
  },

  {
    memoryId: 'MEM-2026-07-01-011',
    entityType: 'ENGINEERING_PRINCIPLE',
    entityId: 'EP-PHS-002',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'EP-PHS-002',
      name: 'Hydrophobic Repulsion',
      scienceDomain: 'Phase Science',
      standardRefs: ['ASTM D6304', 'ISO 16332'],
      maturity: 3,
    },
    edrRef: 'EDR-B-001-v1.0',
  },

  {
    memoryId: 'MEM-2026-07-01-012',
    entityType: 'ENGINEERING_PRINCIPLE',
    entityId: 'EP-CHE-001',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'EP-CHE-001',
      name: 'Adsorption',
      scienceDomain: 'Chemical Engineering',
      standardRefs: ['ISO 8573-1', 'ISO 8573-2', 'ISO 8573-3'],
      maturity: 3,
    },
    edrRef: 'EDR-B-001-v1.0',
  },

  {
    memoryId: 'MEM-2026-07-01-013',
    entityType: 'ENGINEERING_PRINCIPLE',
    entityId: 'EP-CHE-002',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'EP-CHE-002',
      name: 'Filtration Media Chemistry — Synthetic Fiber Engineering',
      scienceDomain: 'Chemical Engineering',
      standardRefs: ['ISO 16889', 'ISO 3968', 'ISO 3724'],
      maturity: 3,
    },
    edrRef: 'EDR-B-001-v1.0',
  },

  {
    memoryId: 'MEM-2026-07-01-014',
    entityType: 'ENGINEERING_PRINCIPLE',
    entityId: 'EP-INS-001',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'EP-INS-001',
      name: 'Particle Counting — Cleanliness Code Classification',
      scienceDomain: 'Instrumentation Science',
      standardRefs: ['ISO 4406', 'ISO 11500', 'ISO 16889'],
      maturity: 3,
    },
    edrRef: 'EDR-B-001-v1.0',
  },

  {
    memoryId: 'MEM-2026-07-01-015',
    entityType: 'ENGINEERING_PRINCIPLE',
    entityId: 'EP-TRB-001',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'EP-TRB-001',
      name: 'Abrasive Wear Mechanism',
      scienceDomain: 'Tribochemistry',
      standardRefs: ['ISO 4406', 'ASTM G40', 'ISO 15243'],
      maturity: 3,
    },
    edrRef: 'EDR-B-001-v1.0',
  },

  {
    memoryId: 'MEM-2026-07-01-016',
    entityType: 'ENGINEERING_PRINCIPLE',
    entityId: 'EP-TRB-002',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'EP-TRB-002',
      name: 'Cabin Air Filtration — Particulate and Chemical Protection',
      scienceDomain: 'Separation Science',
      standardRefs: ['ISO 11155-1', 'ISO 11155-2', 'DIN 71220', 'EN 779'],
      maturity: 3,
    },
    edrRef: 'EDR-B-001-v1.0',
  },

  {
    memoryId: 'MEM-2026-07-01-017',
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    entityId: 'TECH-MACROCORE',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'TECH-MACROCORE',
      name: 'MACROCORE',
      systemDomain: 'Air Intake',
      primaryStandards: ['ISO 5011', 'SAE J726', 'ASTM D2986'],
      engineeringPrincipleIds: ['EP-SEP-004', 'EP-SEP-001'],
      componentClasses: 8,
      maturity: 3,
    },
    edrRef: 'EDR-C-001-v1.0',
  },

  {
    memoryId: 'MEM-2026-07-01-018',
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    entityId: 'TECH-SYNTRAX',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'TECH-SYNTRAX',
      name: 'SYNTRAX',
      systemDomain: 'Engine Lube Oil',
      primaryStandards: ['ISO 16889', 'ISO 4406', 'SAE J1858'],
      engineeringPrincipleIds: ['EP-SEP-004', 'EP-SEP-001', 'EP-CHE-002', 'EP-TRB-001'],
      componentClasses: 8,
      maturity: 3,
    },
    edrRef: 'EDR-C-003-v1.0',
  },

  {
    memoryId: 'MEM-2026-07-01-019',
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    entityId: 'TECH-NANOFORCE',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'TECH-NANOFORCE',
      name: 'NANOFORCE',
      systemDomain: 'Hydraulic',
      primaryStandards: ['ISO 16889', 'NFPA T2.14.1', 'DIN 51524', 'ISO 4406'],
      engineeringPrincipleIds: ['EP-SEP-001', 'EP-SEP-002', 'EP-CHE-002', 'EP-INS-001', 'EP-TRB-001'],
      componentClasses: 8,
      maturity: 3,
    },
    edrRef: 'EDR-C-004-v1.0',
  },

  {
    memoryId: 'MEM-2026-07-01-020',
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    entityId: 'TECH-HYDROCORE',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'TECH-HYDROCORE',
      name: 'HYDROCORE',
      systemDomain: 'Fuel Water Separation',
      primaryStandards: ['ASTM D6304', 'ISO 12937', 'ISO 16332'],
      engineeringPrincipleIds: ['EP-PHS-001', 'EP-PHS-002', 'EP-SEP-001'],
      componentClasses: 8,
      maturity: 3,
    },
    edrRef: 'EDR-C-002-v1.0',
  },

  {
    memoryId: 'MEM-2026-07-01-021',
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    entityId: 'TECH-MICROKAPPA',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'TECH-MICROKAPPA',
      name: 'MICROKAPPA',
      systemDomain: 'Cabin Air',
      primaryStandards: ['ISO 11155-1', 'ISO 11155-2', 'DIN 71220', 'EN 779'],
      engineeringPrincipleIds: ['EP-TRB-002', 'EP-CHE-001', 'EP-SEP-001'],
      componentClasses: 8,
      maturity: 3,
    },
    edrRef: 'EDR-B-002-v1.0',
  },

  {
    memoryId: 'MEM-2026-07-01-022',
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    entityId: 'TECH-SYNTAPORE',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'TECH-SYNTAPORE',
      name: 'SYNTAPORE',
      systemDomain: 'Fuel HPCR',
      primaryStandards: ['ASTM D6304', 'ISO 12937', 'ISO 16889'],
      engineeringPrincipleIds: ['EP-SEP-001', 'EP-SEP-002', 'EP-PHS-001', 'EP-INS-001', 'EP-CHE-002'],
      componentClasses: 8,
      maturity: 3,
    },
    edrRef: 'EDR-C-005-v1.0',
  },



  {
    memoryId: 'MEM-2026-07-01-024',
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    entityId: 'TECH-THERMACORE',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'TECH-THERMACORE',
      name: 'THERMACORE',
      systemDomain: 'Cooling System',
      primaryStandards: ['ASTM D3306', 'ASTM D6210', 'SAE J1034'],
      engineeringPrincipleIds: ['EP-CHE-001'],
      componentClasses: 8,
      maturity: 3,
    },
    edrRef: 'EDR-C-007-v1.0',
  },

  {
    memoryId: 'MEM-2026-07-01-025',
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    entityId: 'TECH-DRYCORE',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'TECH-DRYCORE',
      name: 'DRYCORE',
      systemDomain: 'Compressed Air',
      primaryStandards: ['ISO 8573-1', 'ISO 8573-2', 'ISO 8573-3'],
      engineeringPrincipleIds: ['EP-SEP-001', 'EP-PHS-001', 'EP-CHE-001'],
      componentClasses: 8,
      maturity: 3,
    },
    edrRef: 'EDR-C-008-v1.0',
  },

  {
    memoryId: 'MEM-2026-07-01-026',
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    entityId: 'TECH-INTEKCORE',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'TECH-INTEKCORE',
      name: 'INTEKCORE',
      systemDomain: 'Filter Housing Systems',
      primaryStandards: ['ISO 16889', 'ISO 4406', 'SAE J1858'],
      engineeringPrincipleIds: ['EP-SEP-001'],
      componentClasses: 8,
      maturity: 3,
    },
    edrRef: 'EDR-C-009-v1.0',
  },

  {
    memoryId: 'MEM-2026-07-01-027',
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    entityId: 'TECH-DURATECH',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'TECH-DURATECH',
      name: 'DURATECH',
      systemDomain: 'Fleet Maintenance',
      primaryStandards: ['ISO 16889', 'ISO 4406', 'ISO 5011'],
      engineeringPrincipleIds: ['EP-INS-001'],
      componentClasses: 8,
      maturity: 3,
    },
    edrRef: 'EDR-C-010-v1.0',
  },

  {
    memoryId: 'MEM-2026-07-01-028',
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    entityId: 'TECH-MARINECLEAN',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'TECH-MARINECLEAN',
      name: 'MARINECLEAN',
      systemDomain: 'Marine Diesel & Hydraulic',
      primaryStandards: ['ISO 16889', 'ISO 4406', 'IMO MARPOL 73/78'],
      engineeringPrincipleIds: ['EP-SEP-001', 'EP-SEP-003', 'EP-PHS-001', 'EP-CHE-001', 'EP-TRB-001'],
      componentClasses: 8,
      maturity: 3,
    },
    edrRef: 'EDR-C-011-v1.0',
  },

  // ── Queue A Foundation Patch Entries (2026-07-01) ─────────────────────────

  {
    memoryId: 'MEM-2026-07-01-029',
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    entityId: 'TECH-MACROCORE',
    entityVersion: '1.0.1',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_UPDATE',
    snapshot: {
      id: 'TECH-MACROCORE',
      name: 'MACROCORE',
      systemDomain: 'Air Intake',
      primaryStandards: ['ISO 5011', 'SAE J726', 'ASTM D2986'],
      engineeringPrincipleIds: ['EP-SEP-004', 'EP-SEP-001', 'EP-TRB-001'],
      componentClasses: 8,
      maturity: 3,
      changeContext:
        'EP-TRB-001 (Abrasive Wear Mechanism) added during Phase 1 bidirectional integrity correction. MACROCORE addresses abrasive wear via cylinder bore protection — the Tribochemistry principle applies to the failure mode the technology prevents, consistent with the eight-component class schema requirement that engineeringPrincipleIds covers both filtration mechanism principles and the failure mechanism principles the technology controls.',
    },
    edrRef: 'EDR-C-001-v1.1',
  },

  {
    memoryId: 'MEM-2026-07-01-030',
    entityType: 'ENGINEERING_PRINCIPLE',
    entityId: 'EP-TRB-002',
    entityVersion: '1.0.1',
    archivedDate: '2026-07-01',
    archivedReason: 'ALIAS_CREATED',
    snapshot: {
      id: 'EP-TRB-002',
      aliasId: 'EP-SEP-005',
      name: 'Cabin Air Filtration — Particulate and Chemical Protection',
      scienceDomain: 'Separation Science',
      maturity: 3,
      governanceDecision:
        'Queue A-01 Foundation Patch: EP-TRB-002 was classified under the TRB (Tribochemistry) prefix at initial registration due to a classification error — the scienceDomain field was already correctly set to Separation Science at publication. Per Foundation identity preservation rule (user instruction 2026-07-01), entity identifiers are permanent and may not be renamed or deleted. Resolution: EP-SEP-005 created as canonical preferred identifier; EP-TRB-002 preserved as permanent backward-compatible identifier. Technology relationships tracked under EP-TRB-002. EP-SEP-005 carries no independent technology relationships. Both IDs are valid and resolve to the same principle.',
    },
    edrRef: 'EDR-B-001-v1.1',
  },

  {
    memoryId: 'MEM-2026-07-01-031',
    entityType: 'ENGINEERING_PRINCIPLE',
    entityId: 'EP-SEP-005',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-01',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'EP-SEP-005',
      name: 'Cabin Air Filtration — Particulate and Chemical Protection (Canonical Alias)',
      scienceDomain: 'Separation Science',
      aliasFor: 'EP-TRB-002',
      implementedByTechnologies: [],
      maturity: 3,
      governanceNote:
        'Alias entry only. Technology relationships tracked under EP-TRB-002. See MEM-2026-07-01-030.',
    },
    edrRef: 'EDR-B-001-v1.1',
  },

  // ── Phase 5B Hardening Deposit (2026-07-05) ───────────────────────────────

  {
    memoryId: 'MEM-2026-07-05-001',
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    entityId: 'TECH-HYDROCORE',
    entityVersion: '1.0.0',
    archivedDate: '2026-07-05',
    archivedReason: 'VERSION_SNAPSHOT',
    snapshot: {
      id: 'TECH-HYDROCORE',
      name: 'HYDROCORE',
      systemDomain: 'Fuel 3-Stage',
      primaryStandards: ['ISO 16332', 'ASTM D6304'],
      engineeringPrincipleIds: ['EP-SEP-003', 'EP-PHS-001', 'EP-PHS-002', 'EP-SEP-001'],
      componentClasses: 8,
      maturity: 3,
    },
    edrRef: 'EDR-C-012-v1.0',
  },

] as const;

// ============================================================================
// ENGINEERING MEMORY QUERY FUNCTIONS
// Read-only access for governance teams and platform services.
// These functions never mutate ENGINEERING_MEMORY.
// ============================================================================

/**
 * Returns all Engineering Memory entries for a given entity ID.
 * Returns all version snapshots in chronological order.
 */
export function getMemoryByEntity(entityId: string): EngineeringMemoryEntry[] {
  return [...ENGINEERING_MEMORY].filter((e) => e.entityId === entityId);
}

/**
 * Returns all Engineering Memory entries for a given entity type.
 */
export function getMemoryByEntityType(entityType: string): EngineeringMemoryEntry[] {
  return [...ENGINEERING_MEMORY].filter((e) => e.entityType === entityType);
}

/**
 * Returns the Engineering Memory entry for a specific entity version.
 */
export function getMemoryByVersion(
  entityId: string,
  version: string
): EngineeringMemoryEntry | undefined {
  return ENGINEERING_MEMORY.find(
    (e) => e.entityId === entityId && e.entityVersion === version
  );
}

/**
 * Returns all Engineering Memory entries governed by a specific EDR.
 */
export function getMemoryByEdr(edrRef: string): EngineeringMemoryEntry[] {
  return [...ENGINEERING_MEMORY].filter((e) => e.edrRef === edrRef);
}

/**
 * Returns a summary of the Engineering Memory state:
 * total entries, entity types covered, date range.
 */
export function getMemorySummary(): {
  totalEntries: number;
  entityTypes: string[];
  earliestEntry: string;
  latestEntry: string;
} {
  const dates = ENGINEERING_MEMORY.map((e) => e.archivedDate).sort();
  const types = Array.from(new Set(ENGINEERING_MEMORY.map((e) => e.entityType)));
  return {
    totalEntries: ENGINEERING_MEMORY.length,
    entityTypes: types,
    earliestEntry: dates[0] ?? 'none',
    latestEntry: dates[dates.length - 1] ?? 'none',
  };
}
