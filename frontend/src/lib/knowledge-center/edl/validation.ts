/**
 * edl/validation.ts
 * Engineering Data Layer — Registry Validation
 *
 * Validates all EDL registries for structural integrity.
 * Detects: missing identifiers, broken references, orphan entities,
 * duplicate identifiers, invalid graph edges, missing governance metadata.
 *
 * Safe to run at build time — no side effects, returns a result list.
 */

import { EDL_STANDARDS } from './standard-registry';
import { EDL_TECHNOLOGIES } from './technology-registry';
import { EDL_PROBLEMS } from './problem-registry';
import { EDL_SYSTEMS } from './system-registry';
import { EDL_FAMILIES } from './family-registry';
import { EDL_INDUSTRIES } from './industry-registry';
import { EDL_TERMINOLOGY } from './terminology-edl';
import { getAllEdges } from './knowledge-graph';

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationIssue {
  readonly entityId: string;
  readonly entityType: string;
  readonly rule: string;
  readonly message: string;
  readonly severity: ValidationSeverity;
}

// ── All known IDs ───────────────────────────────────────────────────────────

function buildKnownIds(): Set<string> {
  const ids = new Set<string>();
  for (const r of [EDL_STANDARDS, EDL_TECHNOLOGIES, EDL_PROBLEMS, EDL_SYSTEMS, EDL_FAMILIES, EDL_INDUSTRIES, EDL_TERMINOLOGY]) {
    for (const id of Object.keys(r)) {
      ids.add(id);
    }
  }
  // Article IDs derived from slugs are valid targets — treat as always present
  // (we can't enumerate them here without importing ENGINEERING_ARTICLES, which
  // would create a circular risk; they are validated lightly via graph edges)
  return ids;
}

// ── Validation rules ────────────────────────────────────────────────────────

/** Rule 1: Every registry key must match the entity's id field. */
function checkIdentifierMismatch(issues: ValidationIssue[]): void {
  const registries: [string, Record<string, { id: string }>][] = [
    ['Standard', EDL_STANDARDS],
    ['Technology', EDL_TECHNOLOGIES],
    ['Problem', EDL_PROBLEMS],
    ['System', EDL_SYSTEMS],
    ['Family', EDL_FAMILIES],
    ['Industry', EDL_INDUSTRIES],
    ['Terminology', EDL_TERMINOLOGY],
  ];
  for (const [type, registry] of registries) {
    for (const [key, entity] of Object.entries(registry)) {
      if (key !== entity.id) {
        issues.push({
          entityId: key,
          entityType: type,
          rule: 'IDENTIFIER_MISMATCH',
          message: `Registry key "${key}" does not match entity id "${entity.id}"`,
          severity: 'error',
        });
      }
    }
  }
}

/** Rule 2: Detect duplicate IDs across all registries. */
function checkDuplicateIdentifiers(issues: ValidationIssue[]): void {
  const seen = new Map<string, string>();
  const registries: [string, Record<string, { id: string }>][] = [
    ['Standard', EDL_STANDARDS],
    ['Technology', EDL_TECHNOLOGIES],
    ['Problem', EDL_PROBLEMS],
    ['System', EDL_SYSTEMS],
    ['Family', EDL_FAMILIES],
    ['Industry', EDL_INDUSTRIES],
    ['Terminology', EDL_TERMINOLOGY],
  ];
  for (const [type, registry] of registries) {
    for (const id of Object.keys(registry)) {
      const existing = seen.get(id);
      if (existing) {
        issues.push({
          entityId: id,
          entityType: type,
          rule: 'DUPLICATE_IDENTIFIER',
          message: `ID "${id}" appears in both "${existing}" and "${type}" registries`,
          severity: 'error',
        });
      } else {
        seen.set(id, type);
      }
    }
  }
}

/** Rule 3: Every relationship array reference must resolve to a known permanent ID. */
function checkBrokenReferences(issues: ValidationIssue[], knownIds: Set<string>): void {
  function check(entityId: string, entityType: string, refs: string[]): void {
    for (const ref of refs) {
      // Article IDs (ARTICLE-*) are valid but not in our in-memory registries
      if (ref.startsWith('ARTICLE-')) continue;
      if (!knownIds.has(ref)) {
        issues.push({
          entityId,
          entityType,
          rule: 'BROKEN_REFERENCE',
          message: `References unknown ID "${ref}"`,
          severity: 'error',
        });
      }
    }
  }

  for (const s of Object.values(EDL_STANDARDS)) {
    check(s.id, 'Standard', [...s.implementedByTechnologies, ...s.addressesProblems]);
  }
  for (const t of Object.values(EDL_TECHNOLOGIES)) {
    check(t.id, 'Technology', [...t.implementsStandards, ...t.addressesProblems, ...t.usedInSystems]);
  }
  for (const p of Object.values(EDL_PROBLEMS)) {
    check(p.id, 'Problem', [...p.addressedByTechnologies, ...p.measuredByStandards]);
  }
  for (const sys of Object.values(EDL_SYSTEMS)) {
    check(sys.id, 'System', [
      ...sys.primaryTechnologies,
      ...sys.supportingTechnologies,
      ...sys.standards,
      ...sys.productFamilies,
      ...sys.industries,
    ]);
  }
  for (const fam of Object.values(EDL_FAMILIES)) {
    check(fam.id, 'Family', [fam.system, fam.primaryTechnology, ...fam.standards]);
  }
  for (const ind of Object.values(EDL_INDUSTRIES)) {
    check(ind.id, 'Industry', [...ind.systems, ...ind.technologies, ...ind.standards]);
  }
  for (const term of Object.values(EDL_TERMINOLOGY)) {
    check(term.id, 'Terminology', [...term.relatedTerms, ...term.relatedStandards]);
  }
}

/** Rule 4: Detect orphan entities — entities with zero incoming AND zero outgoing edges. */
function checkOrphanEntities(issues: ValidationIssue[], knownIds: Set<string>): void {
  const edges = getAllEdges();
  const connected = new Set<string>();
  for (const edge of edges) {
    connected.add(edge.source);
    connected.add(edge.target);
  }

  for (const id of Array.from(knownIds)) {
    if (!connected.has(id)) {
      // Determine entity type from prefix
      const prefix = id.split('-')[0];
      const typeMap: Record<string, string> = {
        STD: 'Standard', TECH: 'Technology', PROB: 'Problem',
        SYS: 'System', FAM: 'Family', IND: 'Industry', TERM: 'Terminology',
      };
      issues.push({
        entityId: id,
        entityType: typeMap[prefix] ?? 'Unknown',
        rule: 'ORPHAN_ENTITY',
        message: `Entity "${id}" has no graph edges (zero connectivity)`,
        severity: 'warning',
      });
    }
  }
}

/** Rule 5: Check that graph edges reference valid endpoints. */
function checkInvalidGraphEdges(issues: ValidationIssue[], knownIds: Set<string>): void {
  const edges = getAllEdges();
  for (const edge of edges) {
    const sourceOk = knownIds.has(edge.source) || edge.source.startsWith('ARTICLE-');
    const targetOk = knownIds.has(edge.target) || edge.target.startsWith('ARTICLE-');
    if (!sourceOk) {
      issues.push({
        entityId: edge.source,
        entityType: 'GraphEdge',
        rule: 'INVALID_GRAPH_EDGE',
        message: `Edge source "${edge.source}" is not a registered entity`,
        severity: 'error',
      });
    }
    if (!targetOk) {
      issues.push({
        entityId: edge.target,
        entityType: 'GraphEdge',
        rule: 'INVALID_GRAPH_EDGE',
        message: `Edge target "${edge.target}" is not a registered entity`,
        severity: 'error',
      });
    }
  }
}

/** Rule 6: Detect missing required governance metadata fields. */
function checkGovernanceMetadata(issues: ValidationIssue[]): void {
  const registries: [string, Record<string, { id: string; version: string; created: string; lastModified: string; status: string; contentPhase: number }>][] = [
    ['Standard', EDL_STANDARDS],
    ['Technology', EDL_TECHNOLOGIES],
    ['Problem', EDL_PROBLEMS],
    ['System', EDL_SYSTEMS],
    ['Family', EDL_FAMILIES],
    ['Industry', EDL_INDUSTRIES],
    ['Terminology', EDL_TERMINOLOGY],
  ];

  const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  for (const [type, registry] of registries) {
    for (const entity of Object.values(registry)) {
      const missing: string[] = [];
      if (!entity.version) missing.push('version');
      if (!entity.created || !ISO_DATE_RE.test(entity.created)) missing.push('created');
      if (!entity.lastModified || !ISO_DATE_RE.test(entity.lastModified)) missing.push('lastModified');
      if (!entity.status) missing.push('status');
      if (typeof entity.contentPhase !== 'number') missing.push('contentPhase');

      if (missing.length > 0) {
        issues.push({
          entityId: entity.id,
          entityType: type,
          rule: 'MISSING_GOVERNANCE_METADATA',
          message: `Missing required governance fields: ${missing.join(', ')}`,
          severity: 'error',
        });
      }
    }
  }
}

/** Rule 7: Check relationship symmetry — TECH→STD edges should have STD→TECH inverse. */
function checkRelationshipSymmetry(issues: ValidationIssue[]): void {
  for (const tech of Object.values(EDL_TECHNOLOGIES)) {
    for (const stdId of tech.implementsStandards) {
      const std = EDL_STANDARDS[stdId];
      if (std && !std.implementedByTechnologies.includes(tech.id)) {
        issues.push({
          entityId: tech.id,
          entityType: 'Technology',
          rule: 'ASYMMETRIC_RELATIONSHIP',
          message: `TECH "${tech.id}" claims to implement "${stdId}" but standard does not list this technology in implementedByTechnologies`,
          severity: 'warning',
        });
      }
    }
    for (const probId of tech.addressesProblems) {
      const prob = EDL_PROBLEMS[probId];
      if (prob && !prob.addressedByTechnologies.includes(tech.id)) {
        issues.push({
          entityId: tech.id,
          entityType: 'Technology',
          rule: 'ASYMMETRIC_RELATIONSHIP',
          message: `TECH "${tech.id}" claims to address "${probId}" but problem does not list this technology in addressedByTechnologies`,
          severity: 'warning',
        });
      }
    }
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

export interface ValidationReport {
  readonly issues: ValidationIssue[];
  readonly errorCount: number;
  readonly warningCount: number;
  readonly passed: boolean;
}

export function validateRegistries(): ValidationReport {
  const issues: ValidationIssue[] = [];
  const knownIds = buildKnownIds();

  checkIdentifierMismatch(issues);
  checkDuplicateIdentifiers(issues);
  checkBrokenReferences(issues, knownIds);
  checkOrphanEntities(issues, knownIds);
  checkInvalidGraphEdges(issues, knownIds);
  checkGovernanceMetadata(issues);
  checkRelationshipSymmetry(issues);

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  return {
    issues,
    errorCount,
    warningCount,
    passed: errorCount === 0,
  };
}

/** Convenience: return only errors. */
export function getErrors(): ValidationIssue[] {
  return validateRegistries().issues.filter(i => i.severity === 'error');
}

/** Convenience: return only warnings. */
export function getWarnings(): ValidationIssue[] {
  return validateRegistries().issues.filter(i => i.severity === 'warning');
}
