/**
 * edl/knowledge-graph.ts
 * Engineering Data Layer — Knowledge Graph
 *
 * Data-driven directed graph of all entity relationships.
 * Edges are derived from registry relationship arrays, not authored separately.
 * Provides typed query API for traversing the graph.
 */

import { EDL_STANDARDS } from './standard-registry';
import { EDL_TECHNOLOGIES } from './technology-registry';
import { EDL_PROBLEMS } from './problem-registry';
import { EDL_SYSTEMS } from './system-registry';
import { EDL_FAMILIES } from './family-registry';
import { EDL_INDUSTRIES } from './industry-registry';
import { EDL_TERMINOLOGY } from './terminology-edl';
import { ENGINEERING_ARTICLES } from '@/lib/knowledge-center-data';

// ── Edge Types ──────────────────────────────────────────────────────────────

export type EdgeType =
  | 'TECHNOLOGY_IMPLEMENTS_STANDARD'     // TECH → STD
  | 'TECHNOLOGY_ADDRESSES_PROBLEM'       // TECH → PROB
  | 'TECHNOLOGY_USED_IN_SYSTEM'          // TECH → SYS
  | 'PROBLEM_ADDRESSED_BY_TECHNOLOGY'    // PROB → TECH (inverse)
  | 'PROBLEM_MEASURED_BY_STANDARD'       // PROB → STD
  | 'STANDARD_IMPLEMENTED_BY_TECHNOLOGY' // STD → TECH (inverse)
  | 'STANDARD_ADDRESSES_PROBLEM'         // STD → PROB (inverse)
  | 'STANDARD_REFERENCED_BY_ARTICLE'     // STD → ARTICLE
  | 'SYSTEM_USES_TECHNOLOGY'             // SYS → TECH
  | 'SYSTEM_REQUIRES_STANDARD'           // SYS → STD
  | 'SYSTEM_INCLUDES_FAMILY'             // SYS → FAM
  | 'SYSTEM_SERVES_INDUSTRY'             // SYS → IND (inverse)
  | 'FAMILY_BELONGS_TO_SYSTEM'           // FAM → SYS
  | 'FAMILY_USES_TECHNOLOGY'             // FAM → TECH
  | 'INDUSTRY_USES_SYSTEM'              // IND → SYS
  | 'INDUSTRY_APPLIES_TECHNOLOGY'        // IND → TECH
  | 'INDUSTRY_REFERENCES_STANDARD'       // IND → STD
  | 'TERMINOLOGY_DEFINED_BY_STANDARD'    // TERM → STD
  | 'TERMINOLOGY_RELATED_TO_TERM';       // TERM → TERM

export interface GraphEdge {
  readonly source: string;      // permanent ID
  readonly target: string;      // permanent ID
  readonly type: EdgeType;
  readonly confidence: 'confirmed' | 'inferred';
}

// ── Article ID helper ───────────────────────────────────────────────────────

function articleId(slug: string): string {
  return `ARTICLE-${slug.toUpperCase().replace(/-/g, '-')}`;
}

// ── Edge derivation ─────────────────────────────────────────────────────────

function buildEdges(): GraphEdge[] {
  const edges: GraphEdge[] = [];

  function add(source: string, target: string, type: EdgeType, confidence: 'confirmed' | 'inferred' = 'confirmed'): void {
    edges.push({ source, target, type, confidence });
  }

  // Technology → Standard / Problem / System
  for (const tech of Object.values(EDL_TECHNOLOGIES)) {
    for (const stdId of tech.implementsStandards) {
      add(tech.id, stdId, 'TECHNOLOGY_IMPLEMENTS_STANDARD');
      add(stdId, tech.id, 'STANDARD_IMPLEMENTED_BY_TECHNOLOGY');
    }
    for (const probId of tech.addressesProblems) {
      add(tech.id, probId, 'TECHNOLOGY_ADDRESSES_PROBLEM');
      add(probId, tech.id, 'PROBLEM_ADDRESSED_BY_TECHNOLOGY');
    }
    for (const sysId of tech.usedInSystems) {
      add(tech.id, sysId, 'TECHNOLOGY_USED_IN_SYSTEM');
    }
  }

  // Problem → Standard
  for (const prob of Object.values(EDL_PROBLEMS)) {
    for (const stdId of prob.measuredByStandards) {
      add(prob.id, stdId, 'PROBLEM_MEASURED_BY_STANDARD');
      add(stdId, prob.id, 'STANDARD_ADDRESSES_PROBLEM');
    }
  }

  // System → Technology / Standard / Family / Industry
  for (const sys of Object.values(EDL_SYSTEMS)) {
    for (const techId of [...sys.primaryTechnologies, ...sys.supportingTechnologies]) {
      add(sys.id, techId, 'SYSTEM_USES_TECHNOLOGY');
    }
    for (const stdId of sys.standards) {
      add(sys.id, stdId, 'SYSTEM_REQUIRES_STANDARD');
    }
    for (const famId of sys.productFamilies) {
      add(sys.id, famId, 'SYSTEM_INCLUDES_FAMILY');
    }
    for (const indId of sys.industries) {
      add(sys.id, indId, 'SYSTEM_SERVES_INDUSTRY');
    }
  }

  // Family → System / Technology
  for (const fam of Object.values(EDL_FAMILIES)) {
    add(fam.id, fam.system, 'FAMILY_BELONGS_TO_SYSTEM');
    add(fam.id, fam.primaryTechnology, 'FAMILY_USES_TECHNOLOGY');
  }

  // Industry → System / Technology / Standard
  for (const ind of Object.values(EDL_INDUSTRIES)) {
    for (const sysId of ind.systems) {
      add(ind.id, sysId, 'INDUSTRY_USES_SYSTEM');
    }
    for (const techId of ind.technologies) {
      add(ind.id, techId, 'INDUSTRY_APPLIES_TECHNOLOGY');
    }
    for (const stdId of ind.standards) {
      add(ind.id, stdId, 'INDUSTRY_REFERENCES_STANDARD');
    }
  }

  // Standard → Article (from ENGINEERING_ARTICLES.relatedStandards)
  // Map KC standard codes to permanent IDs
  const codeToId = new Map<string, string>(
    Object.values(EDL_STANDARDS).map(s => [s.code, s.id])
  );
  for (const article of ENGINEERING_ARTICLES) {
    const artId = articleId(article.slug);
    for (const code of article.relatedStandards) {
      const stdId = codeToId.get(code);
      if (stdId) {
        add(stdId, artId, 'STANDARD_REFERENCED_BY_ARTICLE', 'confirmed');
      }
    }
  }

  // Terminology → Standard / Terminology
  for (const term of Object.values(EDL_TERMINOLOGY)) {
    for (const stdId of term.relatedStandards) {
      add(term.id, stdId, 'TERMINOLOGY_DEFINED_BY_STANDARD');
    }
    for (const relTermId of term.relatedTerms) {
      add(term.id, relTermId, 'TERMINOLOGY_RELATED_TO_TERM');
    }
  }

  return edges;
}

// ── Lazy-initialised graph ──────────────────────────────────────────────────

let _edges: GraphEdge[] | null = null;

function getEdges(): GraphEdge[] {
  if (!_edges) _edges = buildEdges();
  return _edges;
}

// ── Query API ───────────────────────────────────────────────────────────────

/** Return all edges of a given type. */
export function edgesByType(type: EdgeType): GraphEdge[] {
  return getEdges().filter(e => e.type === type);
}

/** Return all edges originating from a given entity. */
export function edgesFrom(sourceId: string): GraphEdge[] {
  return getEdges().filter(e => e.source === sourceId);
}

/** Return all edges terminating at a given entity. */
export function edgesTo(targetId: string): GraphEdge[] {
  return getEdges().filter(e => e.target === targetId);
}

/** Return target IDs reachable from a source ID via a given edge type. */
export function traverse(sourceId: string, type: EdgeType): string[] {
  return getEdges()
    .filter(e => e.source === sourceId && e.type === type)
    .map(e => e.target);
}

/** Technology → Standards it implements. */
export function technologyStandards(techId: string): string[] {
  return traverse(techId, 'TECHNOLOGY_IMPLEMENTS_STANDARD');
}

/** Technology → Problems it addresses. */
export function technologyProblems(techId: string): string[] {
  return traverse(techId, 'TECHNOLOGY_ADDRESSES_PROBLEM');
}

/** Problem → Technologies that address it. */
export function problemTechnologies(probId: string): string[] {
  return traverse(probId, 'PROBLEM_ADDRESSED_BY_TECHNOLOGY');
}

/** Problem → Standards that measure it. */
export function problemStandards(probId: string): string[] {
  return traverse(probId, 'PROBLEM_MEASURED_BY_STANDARD');
}

/** Industry → Systems it uses. */
export function industrySystems(indId: string): string[] {
  return traverse(indId, 'INDUSTRY_USES_SYSTEM');
}

/** Industry → Technologies it applies. */
export function industryTechnologies(indId: string): string[] {
  return traverse(indId, 'INDUSTRY_APPLIES_TECHNOLOGY');
}

/** Family → Technology it uses. */
export function familyTechnology(famId: string): string[] {
  return traverse(famId, 'FAMILY_USES_TECHNOLOGY');
}

/** Standard → Articles that reference it. */
export function standardArticles(stdId: string): string[] {
  return traverse(stdId, 'STANDARD_REFERENCED_BY_ARTICLE');
}

/** Standard → Technologies that implement it. */
export function standardTechnologies(stdId: string): string[] {
  return traverse(stdId, 'STANDARD_IMPLEMENTED_BY_TECHNOLOGY');
}

/** System → Technologies it uses. */
export function systemTechnologies(sysId: string): string[] {
  return traverse(sysId, 'SYSTEM_USES_TECHNOLOGY');
}

/** System → Families it contains. */
export function systemFamilies(sysId: string): string[] {
  return traverse(sysId, 'SYSTEM_INCLUDES_FAMILY');
}

/** Return the complete edge list. */
export function getAllEdges(): GraphEdge[] {
  return [...getEdges()];
}

/** Return total edge count. */
export function edgeCount(): number {
  return getEdges().length;
}

/** Return count by edge type. */
export function edgeCountByType(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const edge of getEdges()) {
    counts[edge.type] = (counts[edge.type] ?? 0) + 1;
  }
  return counts;
}
