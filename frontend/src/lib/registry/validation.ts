/**
 * validation.ts
 * ELIMFILTERS Engineering Intelligence Platform — Phase 1: Engineering Foundation
 *
 * Registry Validation Module — all compliance checks for the governed Knowledge
 * Graph registries. This module is the executable form of the Foundation
 * Compliance Checklist (FOUNDATION_COMPLIANCE_CHECKLIST v1.0).
 *
 * Checks implemented:
 *   1. Orphan Detection — no dangling entity references
 *   2. Technology-Domain Mapping Validation — constitutional mapping enforced
 *   3. Eight-Component Completeness — all PUBLISHED tech architectures complete
 *   4. Prohibited Language Scan — no marketing language in governed text fields
 *   5. Bidirectional Relationship Integrity — forward/back refs consistent
 *   6. Engineering Memory Coverage — all PUBLISHED entities in memory
 *   7. Protection Media Coverage — all PUBLISHED techs have media registered
 *   8. Foundation Gate — Phase 1 readiness criteria
 */

import { MATURITY } from './registry-types';
import { ENGINEERING_PRINCIPLES } from './engineering-principles';
import { TECHNOLOGY_ARCHITECTURES } from './technology-architectures';
import { STANDARDS_REGISTRY } from './standards-registry';
import { FAILURE_MODES_REGISTRY } from './failure-modes-registry';
import { CONTAMINATION_REGISTRY } from './contamination-registry';
import { PROTECTION_MEDIA_REGISTRY } from './protection-media-registry';
import { ENGINEERING_MEMORY } from './engineering-memory';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ValidationResult {
  readonly checkName: string;
  readonly passed: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export interface ValidationReport {
  readonly timestamp: string;
  readonly overallPassed: boolean;
  readonly results: readonly ValidationResult[];
  readonly summary: {
    readonly totalChecks: number;
    readonly passed: number;
    readonly failed: number;
    readonly totalErrors: number;
    readonly totalWarnings: number;
  };
}

// ── Constitutional Technology-Domain Map ─────────────────────────────────────

const CONSTITUTIONAL_DOMAIN_MAP: Record<string, string> = {
  'TECH-MACROCORE':   'Air Intake',
  'TECH-SYNTRAX':     'Engine Lube Oil',
  'TECH-NANOFORCE':   'Hydraulic',
  'TECH-SYNTEPORE':   'Fuel HPCR',
  'TECH-HYDROCORE':   'Fuel Water Separation',
  'TECH-TURBOCORE':   'Fuel 3-Stage',
  'TECH-THERMACORE':  'Cooling System',
  'TECH-DRYCORE':     'Compressed Air',
  'TECH-INTEKCORE':   'Filter Housing Systems',
  'TECH-DURATECH':    'Fleet Maintenance',
  'TECH-MARINECLEAN': 'Marine Diesel & Hydraulic',
  'TECH-MICROKAPPA':  'Cabin Air',
};

// ── Prohibited Language Patterns ─────────────────────────────────────────────

const PROHIBITED_PATTERNS: readonly RegExp[] = [
  /\bbetter than\b/i,
  /\boutperform/i,
  /\bleading provider/i,
  /\bindustry.leading/i,
  /\bsuperior filtration\b/i,
  /\bsuperior performance\b/i,
  /\bcutting.edge\b/i,
  /\bstate.of.the.art\b/i,
  /\binnovative\b/i,
  /\bpremium quality\b/i,
  /\bworld.class\b/i,
  /\bbest.in.class\b/i,
  /\bunmatched\b/i,
  /\bunsurpassed\b/i,
  /\brevolutionary\b/i,
  /\bsaves money\b/i,
  /\bcheaper than\b/i,
  /\badvanced technology\b/i,
];

function scanForProhibitedLanguage(text: string, context: string): string[] {
  const hits: string[] = [];
  for (const pattern of PROHIBITED_PATTERNS) {
    if (pattern.test(text)) {
      const match = text.match(pattern)?.[0] ?? '';
      hits.push(`[${context}] Prohibited term "${match}" found`);
    }
  }
  return hits;
}

// ── Check 1: Orphan Detection ────────────────────────────────────────────────

export function checkOrphanedReferences(): ValidationResult {
  const errors: string[] = [];
  const principleIds = new Set(Object.keys(ENGINEERING_PRINCIPLES));
  const techIds = new Set(Object.keys(TECHNOLOGY_ARCHITECTURES));
  const failureModeIds = new Set(Object.keys(FAILURE_MODES_REGISTRY));
  const mediaIds = new Set(Object.keys(PROTECTION_MEDIA_REGISTRY));

  // TechnologyArchitecture → engineeringPrincipleIds
  for (const [techId, tech] of Object.entries(TECHNOLOGY_ARCHITECTURES)) {
    for (const pid of tech.engineeringPrincipleIds) {
      if (!principleIds.has(pid)) {
        errors.push(`TECH[${techId}].engineeringPrincipleIds references unknown principle "${pid}"`);
      }
    }
  }

  // EngineeringPrinciple → implementedByTechnologies
  for (const [pid, principle] of Object.entries(ENGINEERING_PRINCIPLES)) {
    for (const tid of principle.implementedByTechnologies) {
      if (!techIds.has(tid)) {
        errors.push(`PRINCIPLE[${pid}].implementedByTechnologies references unknown tech "${tid}"`);
      }
    }
  }

  // StandardRecord → applicableTechnologyIds
  for (const [sid, std] of Object.entries(STANDARDS_REGISTRY)) {
    for (const tid of std.applicableTechnologyIds) {
      if (!techIds.has(tid)) {
        errors.push(`STANDARD[${sid}].applicableTechnologyIds references unknown tech "${tid}"`);
      }
    }
    for (const pid of std.applicableEngineeringPrincipleIds) {
      if (!principleIds.has(pid)) {
        errors.push(`STANDARD[${sid}].applicableEngineeringPrincipleIds references unknown principle "${pid}"`);
      }
    }
  }

  // FailureModeRecord → controlledByTechnologyIds
  for (const [fid, fm] of Object.entries(FAILURE_MODES_REGISTRY)) {
    for (const tid of fm.controlledByTechnologyIds) {
      if (!techIds.has(tid)) {
        errors.push(`FAILURE_MODE[${fid}].controlledByTechnologyIds references unknown tech "${tid}"`);
      }
    }
  }

  // ContaminationRecord → initiatedFailureModeIds
  for (const [cid, cont] of Object.entries(CONTAMINATION_REGISTRY)) {
    for (const fid of cont.initiatedFailureModeIds) {
      if (!failureModeIds.has(fid)) {
        errors.push(`CONTAMINATION[${cid}].initiatedFailureModeIds references unknown failure mode "${fid}"`);
      }
    }
  }

  // ProtectionMediaRecord → employedByTechnologyIds
  for (const [mid, media] of Object.entries(PROTECTION_MEDIA_REGISTRY)) {
    for (const tid of media.employedByTechnologyIds) {
      if (!techIds.has(tid)) {
        errors.push(`PROTECTION_MEDIA[${mid}].employedByTechnologyIds references unknown tech "${tid}"`);
      }
    }
    for (const pid of media.implementsPrincipleIds) {
      if (!principleIds.has(pid)) {
        errors.push(`PROTECTION_MEDIA[${mid}].implementsPrincipleIds references unknown principle "${pid}"`);
      }
    }
  }

  // Check media IDs referenced by techs exist in PROTECTION_MEDIA_REGISTRY
  // (We do this by checking the reverse: for each tech, verify its media types
  //  are covered in the protection media registry)
  for (const [techId] of Object.entries(TECHNOLOGY_ARCHITECTURES)) {
    const coveringMedia = Object.values(PROTECTION_MEDIA_REGISTRY).filter((m) =>
      m.employedByTechnologyIds.includes(techId)
    );
    if (coveringMedia.length === 0 && techId !== 'TECH-INTEKCORE' && techId !== 'TECH-DURATECH') {
      // INTEKCORE and DURATECH are kit/housing systems — protection media coverage is N/A by design
      errors.push(`TECH[${techId}] has no Protection Media Registry entries (all techs must have coverage)`);
    }
  }

  // Suppress unused variable
  void mediaIds;

  return {
    checkName: 'Orphan Detection',
    passed: errors.length === 0,
    errors,
    warnings: [],
  };
}

// ── Check 2: Technology-Domain Mapping Validation ────────────────────────────

export function checkTechnologyDomainMapping(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // All 12 constitutional techs must be present
  for (const [techId, expectedDomain] of Object.entries(CONSTITUTIONAL_DOMAIN_MAP)) {
    const tech = TECHNOLOGY_ARCHITECTURES[techId];
    if (!tech) {
      errors.push(`Constitutional technology "${techId}" is missing from TECHNOLOGY_ARCHITECTURES`);
      continue;
    }
    if (tech.systemDomain !== expectedDomain) {
      errors.push(
        `TECH[${techId}].systemDomain is "${tech.systemDomain}" but constitutional mapping requires "${expectedDomain}"`
      );
    }
  }

  // No extra techs with domains that collide with constitutional mappings
  const constitutionalDomains = new Set(Object.values(CONSTITUTIONAL_DOMAIN_MAP));
  for (const [techId, tech] of Object.entries(TECHNOLOGY_ARCHITECTURES)) {
    if (!CONSTITUTIONAL_DOMAIN_MAP[techId]) {
      if (constitutionalDomains.has(tech.systemDomain)) {
        warnings.push(
          `Non-constitutional TECH[${techId}] uses domain "${tech.systemDomain}" which is reserved by the constitutional mapping`
        );
      }
    }
  }

  return {
    checkName: 'Technology-Domain Mapping Validation',
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

// ── Check 3: Eight-Component Completeness ────────────────────────────────────

export function checkEightComponentCompleteness(): ValidationResult {
  const errors: string[] = [];

  for (const [techId, tech] of Object.entries(TECHNOLOGY_ARCHITECTURES)) {
    if (tech.maturity !== MATURITY.PUBLISHED) continue;

    const required = [
      { name: 'protectionMedia', value: tech.protectionMedia },
      { name: 'engineeringPrincipleIds', value: tech.engineeringPrincipleIds },
      { name: 'materials', value: tech.materials },
      { name: 'construction', value: tech.construction },
      { name: 'flowDynamics', value: tech.flowDynamics },
      { name: 'captureMechanisms', value: tech.captureMechanisms },
      { name: 'performanceProfile', value: tech.performanceProfile },
      { name: 'failureModes', value: tech.failureModes },
    ] as const;

    for (const { name, value } of required) {
      if (!value || value.length === 0) {
        errors.push(`TECH[${techId}] PUBLISHED but component class "${name}" is empty — all 8 components required at Level 3`);
      }
    }

    // canonicalDefinition, systemContext, industrialRole must be non-empty
    for (const field of ['canonicalDefinition', 'systemContext', 'industrialRole'] as const) {
      if (!tech[field] || tech[field].trim().length < 50) {
        errors.push(`TECH[${techId}].${field} is missing or too short (minimum 50 characters)`);
      }
    }
  }

  return {
    checkName: 'Eight-Component Completeness',
    passed: errors.length === 0,
    errors,
    warnings: [],
  };
}

// ── Check 4: Prohibited Language Scan ───────────────────────────────────────

export function checkProhibitedLanguage(): ValidationResult {
  const errors: string[] = [];

  // Scan TechnologyArchitecture text fields
  for (const [techId, tech] of Object.entries(TECHNOLOGY_ARCHITECTURES)) {
    for (const field of ['canonicalDefinition', 'systemContext', 'industrialRole'] as const) {
      errors.push(...scanForProhibitedLanguage(tech[field], `TECH[${techId}].${field}`));
    }
    for (const pm of tech.protectionMedia) {
      errors.push(...scanForProhibitedLanguage(pm.description, `TECH[${techId}].protectionMedia[${pm.type}]`));
    }
  }

  // Scan EngineeringPrinciple text fields
  for (const [pid, principle] of Object.entries(ENGINEERING_PRINCIPLES)) {
    errors.push(...scanForProhibitedLanguage(principle.definition, `PRINCIPLE[${pid}].definition`));
    errors.push(...scanForProhibitedLanguage(principle.phenomenonDescription, `PRINCIPLE[${pid}].phenomenonDescription`));
  }

  // Scan ProtectionMediaRecord text fields
  for (const [mid, media] of Object.entries(PROTECTION_MEDIA_REGISTRY)) {
    errors.push(...scanForProhibitedLanguage(media.definition, `PROTECTION_MEDIA[${mid}].definition`));
  }

  // Scan FailureMode text fields
  for (const [fid, fm] of Object.entries(FAILURE_MODES_REGISTRY)) {
    errors.push(...scanForProhibitedLanguage(fm.causeChain, `FAILURE_MODE[${fid}].causeChain`));
    errors.push(...scanForProhibitedLanguage(fm.industrialImpact, `FAILURE_MODE[${fid}].industrialImpact`));
  }

  return {
    checkName: 'Prohibited Language Scan',
    passed: errors.length === 0,
    errors,
    warnings: [],
  };
}

// ── Check 5: Bidirectional Relationship Integrity ────────────────────────────

export function checkBidirectionalIntegrity(): ValidationResult {
  const errors: string[] = [];

  // EngineeringPrinciple.implementedByTechnologies ↔ TechnologyArchitecture.engineeringPrincipleIds
  for (const [pid, principle] of Object.entries(ENGINEERING_PRINCIPLES)) {
    for (const techId of principle.implementedByTechnologies) {
      const tech = TECHNOLOGY_ARCHITECTURES[techId];
      if (tech && !tech.engineeringPrincipleIds.includes(pid)) {
        errors.push(
          `Bidirectional mismatch: PRINCIPLE[${pid}].implementedByTechnologies includes "${techId}" but TECH[${techId}].engineeringPrincipleIds does not include "${pid}"`
        );
      }
    }
  }

  // TechnologyArchitecture.engineeringPrincipleIds → check reverse
  for (const [techId, tech] of Object.entries(TECHNOLOGY_ARCHITECTURES)) {
    for (const pid of tech.engineeringPrincipleIds) {
      const principle = ENGINEERING_PRINCIPLES[pid];
      if (principle && !principle.implementedByTechnologies.includes(techId)) {
        errors.push(
          `Bidirectional mismatch: TECH[${techId}].engineeringPrincipleIds includes "${pid}" but PRINCIPLE[${pid}].implementedByTechnologies does not include "${techId}"`
        );
      }
    }
  }

  return {
    checkName: 'Bidirectional Relationship Integrity',
    passed: errors.length === 0,
    errors,
    warnings: [],
  };
}

// ── Check 6: Engineering Memory Coverage ────────────────────────────────────

export function checkEngineeringMemoryCoverage(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const memorizedEntityIds = new Set(ENGINEERING_MEMORY.map((e) => e.entityId));

  // All PUBLISHED Engineering Principles must have a memory entry
  for (const [pid, principle] of Object.entries(ENGINEERING_PRINCIPLES)) {
    if (principle.maturity === MATURITY.PUBLISHED && !memorizedEntityIds.has(pid)) {
      errors.push(`PRINCIPLE[${pid}] is PUBLISHED but has no Engineering Memory entry`);
    }
  }

  // All PUBLISHED Technology Architectures must have a memory entry
  for (const [techId, tech] of Object.entries(TECHNOLOGY_ARCHITECTURES)) {
    if (tech.maturity === MATURITY.PUBLISHED && !memorizedEntityIds.has(techId)) {
      errors.push(`TECH[${techId}] is PUBLISHED but has no Engineering Memory entry`);
    }
  }

  // Warnings for other entity types not yet in memory (acceptable in Phase 1)
  for (const [sid] of Object.entries(STANDARDS_REGISTRY)) {
    if (!memorizedEntityIds.has(sid)) {
      warnings.push(`STANDARD[${sid}] has no Engineering Memory entry (acceptable in Phase 1)`);
    }
  }

  return {
    checkName: 'Engineering Memory Coverage',
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

// ── Check 7: Protection Media Coverage ──────────────────────────────────────

export function checkProtectionMediaCoverage(): ValidationResult {
  const errors: string[] = [];

  for (const [techId, tech] of Object.entries(TECHNOLOGY_ARCHITECTURES)) {
    if (tech.maturity !== MATURITY.PUBLISHED) continue;

    // Each PUBLISHED tech must declare at least one protectionMedia entry
    if (tech.protectionMedia.length === 0) {
      errors.push(`TECH[${techId}] PUBLISHED but protectionMedia array is empty`);
    }
  }

  // Each ProtectionMediaRecord must reference at least one existing technology
  for (const [mid, media] of Object.entries(PROTECTION_MEDIA_REGISTRY)) {
    if (media.employedByTechnologyIds.length === 0) {
      errors.push(`PROTECTION_MEDIA[${mid}] has no employedByTechnologyIds — all media must be used`);
    }
  }

  return {
    checkName: 'Protection Media Coverage',
    passed: errors.length === 0,
    errors,
    warnings: [],
  };
}

// ── Check 8: Foundation Gate ─────────────────────────────────────────────────

export function checkFoundationGate(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const technologies = Object.values(TECHNOLOGY_ARCHITECTURES);
  const principles = Object.values(ENGINEERING_PRINCIPLES);

  const publishedTechs = technologies.filter((t) => t.maturity === MATURITY.PUBLISHED);
  const publishedPrinciples = principles.filter((p) => p.maturity === MATURITY.PUBLISHED);

  if (publishedTechs.length < 12) {
    errors.push(
      `Foundation Gate: ${publishedTechs.length}/12 Technology Architectures are PUBLISHED. All 12 required.`
    );
  }

  if (publishedPrinciples.length < 11) {
    errors.push(
      `Foundation Gate: ${publishedPrinciples.length}/11 Engineering Principles are PUBLISHED. Minimum 11 required.`
    );
  }

  // All 12 constitutional technology IDs must be present
  for (const techId of Object.keys(CONSTITUTIONAL_DOMAIN_MAP)) {
    if (!TECHNOLOGY_ARCHITECTURES[techId]) {
      errors.push(`Foundation Gate: Constitutional technology "${techId}" missing`);
    }
  }

  // Version history must be non-empty for all PUBLISHED entities
  for (const tech of publishedTechs) {
    if (tech.versionHistory.length === 0) {
      errors.push(`Foundation Gate: TECH[${tech.id}] PUBLISHED but has no version history`);
    }
  }

  if (errors.length === 0) {
    warnings.push(
      `Foundation Gate PASSED — ${publishedTechs.length} technologies, ${publishedPrinciples.length} principles at PUBLISHED`
    );
  }

  return {
    checkName: 'Foundation Gate (Phase 1 Readiness)',
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

// ── Run All Checks ────────────────────────────────────────────────────────────

export function runAllValidations(): ValidationReport {
  const results: ValidationResult[] = [
    checkOrphanedReferences(),
    checkTechnologyDomainMapping(),
    checkEightComponentCompleteness(),
    checkProhibitedLanguage(),
    checkBidirectionalIntegrity(),
    checkEngineeringMemoryCoverage(),
    checkProtectionMediaCoverage(),
    checkFoundationGate(),
  ];

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const totalErrors = results.reduce((n, r) => n + r.errors.length, 0);
  const totalWarnings = results.reduce((n, r) => n + r.warnings.length, 0);

  return {
    timestamp: new Date().toISOString(),
    overallPassed: failed === 0,
    results,
    summary: {
      totalChecks: results.length,
      passed,
      failed,
      totalErrors,
      totalWarnings,
    },
  };
}
