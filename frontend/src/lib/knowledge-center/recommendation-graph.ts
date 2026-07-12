/**
 * recommendation-graph.ts
 * ELIMFILTERS Knowledge Center — Recommendation Graph Builder
 *
 * Phase 6D: Engineering Recommendation Engine
 *
 * Builds a singleton undirected KCGraph from all KC entity registries.
 * All edges are derived exclusively from explicit relationship fields in the
 * registry data — no inference, no LLM, no heuristics.
 *
 * Edge sources by entity type:
 *   Articles    → relatedStandards (display codes) · relatedTechnologies (display names)
 *                 relatedSystems (display names or slugs)
 *   Standards   → relatedTechnologies (display names) · applicableSystems (slugs)
 *                 relatedGlossaryTerms (TERM-xxx IDs) · relatedArticles (slugs)
 *   Technologies→ standards (display codes) · relatedSystems (slugs)
 *                 worksWith (display names)
 *   Terms       → applicableStandards (STD-xxx IDs) · relatedTechnologies (slugs)
 *                 relatedSystems (slugs) · relatedArticles (slugs)
 *                 relatedTerms (TERM-xxx IDs)
 *   Diagrams    → governingStandards (STD-xxx IDs) · relatedTechnologies (display names)
 *                 applicableSystems (slugs) · relatedArticles (slugs)
 *                 relatedGlossaryTerms (TERM-xxx IDs)
 *   Calculators → relatedStandards (slugs) · relatedArticles (slugs)
 *                 relatedTechnologies (display names with ™)
 *   Comparisons → relatedStandards (slugs) · relatedTechnologies (display names, no ™)
 *                 relatedSystems (slugs or abbreviations) · relatedTerms (term slugs)
 *                 relatedArticles (slugs)
 *
 * Normalisation functions:
 *   techDisplayToSlug  — 'MACROCORE™' / 'NANOFORCE' → 'macrocore' / 'nanoforce'
 *   stdCodeToSlug      — 'ISO 16889' / 'ISO 16889:2022' → 'iso-16889'
 *   stdEntityIdToSlug  — 'STD-ISO-16889' → 'iso-16889'
 *   termIdToSlug       — 'TERM-BETA-RATIO' → 'beta-ratio'
 *   termSlugToId       — 'beta-ratio' → 'TERM-BETA-RATIO'
 *   systemRefToSlug    — 'hydraulic' / 'Hydraulic Protection' → 'hydraulic-protection'
 *
 * Dependency: knowledge-center-data (all registries), ./recommendation-types
 */

import {
  ENGINEERING_ARTICLES,
  KC_STANDARDS,
  KC_TECHNOLOGIES,
  KC_SYSTEMS,
  GLOSSARY_REGISTRY,
  KC_CALCULATORS,
  KC_COMPARISONS,
} from '@/lib/knowledge-center-data';
import { ENGINEERING_DIAGRAMS } from '@/lib/knowledge-center-data/diagram-registry';
import type { KCGraph, KCGraphNode, KCNodeKey, KCNodeType } from './recommendation-types';

// ── Normalisation helpers ──────────────────────────────────────────────────────

/** Strip ™, trim, lowercase: 'MACROCORE™' → 'macrocore', 'NANOFORCE' → 'nanoforce' */
function techDisplayToSlug(displayName: string): string {
  return displayName.replace(/™/g, '').trim().toLowerCase();
}

/**
 * 'ISO 16889' / 'ISO 16889:2022' / 'SAE J1539' → 'iso-16889' / 'sae-j1539'
 * Remove year suffix, lowercase, replace spaces with hyphens.
 */
function stdCodeToSlug(code: string): string {
  return code
    .replace(/:\d{4}.*$/, '') // strip ':2022' or ':2021 §...' suffixes
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

/**
 * 'STD-ISO-16889' → 'iso-16889'
 * Strip 'STD-' prefix, lowercase (hyphens already correct).
 */
function stdEntityIdToSlug(entityId: string): string {
  return entityId.replace(/^STD-/, '').toLowerCase();
}

/**
 * 'TERM-BETA-RATIO' → 'beta-ratio'
 * Mirrors termIdToSlug in article-registry.ts.
 */
function termIdToSlug(id: string): string {
  return id.replace(/^TERM-/, '').toLowerCase();
}

/**
 * 'beta-ratio' → 'TERM-BETA-RATIO'
 * Mirrors slugToTermId in article-registry.ts.
 */
function termSlugToId(slug: string): string {
  return `TERM-${slug.toUpperCase()}`;
}

/**
 * Normalise system references to canonical slugs.
 * Handles: full slugs, display names (navigation-index SYSTEM_NAME_TO_SLUG),
 * and abbreviations introduced in comparisons-registry (e.g. 'hydraulic', 'lube-oil').
 */
const SYSTEM_REF_MAP: Record<string, string> = {
  // Display names
  'Air Intake Protection':       'air-intake-protection',
  'Fuel Cleanliness Protection': 'fuel-cleanliness-protection',
  'Lubrication Protection':      'lubrication-protection',
  'Hydraulic Protection':        'hydraulic-protection',
  'Cooling System Protection':   'cooling-system-protection',
  'Cabin Air Protection':        'cabin-air-protection',
  'Compressed Air Protection':   'compressed-air-protection',
  // Full slugs (identity)
  'air-intake-protection':       'air-intake-protection',
  'fuel-cleanliness-protection': 'fuel-cleanliness-protection',
  'lubrication-protection':      'lubrication-protection',
  'hydraulic-protection':        'hydraulic-protection',
  'cooling-system-protection':   'cooling-system-protection',
  'cabin-air-protection':        'cabin-air-protection',
  'compressed-air-protection':   'compressed-air-protection',
  // Abbreviations used in comparisons-registry
  'hydraulic':                   'hydraulic-protection',
  'lube-oil':                    'lubrication-protection',
  'lubrication':                 'lubrication-protection',
  'air-intake':                  'air-intake-protection',
  'fuel':                        'fuel-cleanliness-protection',
  'fuel-cleanliness':            'fuel-cleanliness-protection',
  'cabin':                       'cabin-air-protection',
  'cabin-air':                   'cabin-air-protection',
  'cooling':                     'cooling-system-protection',
  'compressed-air':              'compressed-air-protection',
};

function systemRefToSlug(ref: string): string | null {
  return SYSTEM_REF_MAP[ref] ?? null;
}

// ── Graph construction helpers ────────────────────────────────────────────────

function makeKey(type: KCNodeType, slug: string): KCNodeKey {
  return `${type}:${slug}`;
}

function addNode(graph: KCGraph, node: KCGraphNode): void {
  if (!graph.nodes.has(node.key)) {
    graph.nodes.set(node.key, node);
  }
}

/**
 * Add an undirected edge between two nodes.
 * Silently skips if either node is not registered — prevents phantom edges
 * from normalisation mismatches.
 */
function addEdge(graph: KCGraph, keyA: KCNodeKey, keyB: KCNodeKey): void {
  if (keyA === keyB) return;
  if (!graph.nodes.has(keyA) || !graph.nodes.has(keyB)) return;

  if (!graph.edges.has(keyA)) graph.edges.set(keyA, new Set());
  if (!graph.edges.has(keyB)) graph.edges.set(keyB, new Set());

  graph.edges.get(keyA)!.add(keyB);
  graph.edges.get(keyB)!.add(keyA);
}

// ── Graph factory ─────────────────────────────────────────────────────────────

function buildGraph(): KCGraph {
  const graph: KCGraph = {
    nodes: new Map(),
    edges: new Map(),
  };

  // ── 1. Register all nodes ────────────────────────────────────────────────────

  // Articles
  for (const a of ENGINEERING_ARTICLES) {
    addNode(graph, {
      key:   makeKey('article', a.slug),
      type:  'article',
      slug:  a.slug,
      label: a.title,
      href:  `/knowledge-center/engineering/${a.slug}`,
    });
  }

  // Standards
  for (const s of KC_STANDARDS) {
    addNode(graph, {
      key:   makeKey('standard', s.slug),
      type:  'standard',
      slug:  s.slug,
      label: s.code,
      href:  `/knowledge-center/standards/${s.slug}`,
    });
  }

  // Technologies
  for (const t of KC_TECHNOLOGIES) {
    addNode(graph, {
      key:   makeKey('technology', t.slug),
      type:  'technology',
      slug:  t.slug,
      label: t.name,
      href:  `/knowledge-center/technologies/${t.slug}`,
    });
  }

  // Systems
  for (const sys of KC_SYSTEMS) {
    addNode(graph, {
      key:   makeKey('system', sys.slug),
      type:  'system',
      slug:  sys.slug,
      label: (sys as { title: string }).title,
      href:  `/knowledge-center/systems/${sys.slug}`,
    });
  }

  // Glossary terms (using term slug as node key slug)
  for (const [termId, entry] of Object.entries(GLOSSARY_REGISTRY)) {
    const slug = termIdToSlug(termId);
    addNode(graph, {
      key:   makeKey('term', slug),
      type:  'term',
      slug,
      label: entry.term,
      href:  `/knowledge-center/glossary/${slug}`,
    });
  }

  // Diagrams
  for (const d of ENGINEERING_DIAGRAMS) {
    addNode(graph, {
      key:   makeKey('diagram', d.slug),
      type:  'diagram',
      slug:  d.slug,
      label: d.title,
      href:  `/knowledge-center/diagrams/${d.slug}`,
    });
  }

  // Calculators
  for (const c of KC_CALCULATORS) {
    addNode(graph, {
      key:   makeKey('calculator', c.slug),
      type:  'calculator',
      slug:  c.slug,
      label: c.title,
      href:  `/knowledge-center/calculators/${c.slug}`,
    });
  }

  // Comparisons
  for (const comp of KC_COMPARISONS) {
    addNode(graph, {
      key:   makeKey('comparison', comp.slug),
      type:  'comparison',
      slug:  comp.slug,
      label: comp.title,
      href:  `/knowledge-center/comparisons/${comp.slug}`,
    });
  }

  // ── 2. Register all edges ────────────────────────────────────────────────────

  // ── Articles ─────────────────────────────────────────────────────────────────
  for (const a of ENGINEERING_ARTICLES) {
    const aKey = makeKey('article', a.slug);

    // article ↔ standard (display code strings → slugs)
    for (const stdCode of a.relatedStandards) {
      addEdge(graph, aKey, makeKey('standard', stdCodeToSlug(stdCode)));
    }

    // article ↔ technology (display names with ™ → slugs)
    for (const techName of a.relatedTechnologies) {
      addEdge(graph, aKey, makeKey('technology', techDisplayToSlug(techName)));
    }

    // article ↔ system (display names or slugs)
    for (const sysRef of a.relatedSystems) {
      const sysSlug = systemRefToSlug(sysRef);
      if (sysSlug) addEdge(graph, aKey, makeKey('system', sysSlug));
    }
  }

  // ── Standards ────────────────────────────────────────────────────────────────
  for (const s of KC_STANDARDS) {
    const sKey = makeKey('standard', s.slug);

    // standard ↔ technology (display names with ™)
    for (const techName of s.relatedTechnologies) {
      addEdge(graph, sKey, makeKey('technology', techDisplayToSlug(techName)));
    }

    // standard ↔ system (slugs)
    for (const sysSlug of s.applicableSystems) {
      addEdge(graph, sKey, makeKey('system', sysSlug));
    }

    // standard ↔ term (TERM-xxx IDs)
    for (const termId of s.relatedGlossaryTerms) {
      addEdge(graph, sKey, makeKey('term', termIdToSlug(termId)));
    }

    // standard ↔ article (slugs)
    for (const artSlug of s.relatedArticles) {
      addEdge(graph, sKey, makeKey('article', artSlug));
    }
  }

  // ── Technologies ─────────────────────────────────────────────────────────────
  for (const t of KC_TECHNOLOGIES) {
    const tKey = makeKey('technology', t.slug);

    // technology ↔ standard (display code strings)
    for (const stdCode of t.standards) {
      addEdge(graph, tKey, makeKey('standard', stdCodeToSlug(stdCode)));
    }

    // technology ↔ system (slugs)
    for (const sysSlug of t.relatedSystems) {
      addEdge(graph, tKey, makeKey('system', sysSlug));
    }

    // technology ↔ technology (worksWith display names)
    for (const peerName of t.worksWith) {
      addEdge(graph, tKey, makeKey('technology', techDisplayToSlug(peerName)));
    }
  }

  // ── Glossary Terms ────────────────────────────────────────────────────────────
  for (const [termId, entry] of Object.entries(GLOSSARY_REGISTRY)) {
    const tSlug = termIdToSlug(termId);
    const tKey  = makeKey('term', tSlug);

    // term ↔ standard (STD-xxx entity IDs → slugs)
    for (const stdEntityId of (entry.applicableStandards ?? [])) {
      addEdge(graph, tKey, makeKey('standard', stdEntityIdToSlug(stdEntityId)));
    }

    // term ↔ technology (already slugs in GLOSSARY_REGISTRY)
    for (const techSlug of (entry.relatedTechnologies ?? [])) {
      addEdge(graph, tKey, makeKey('technology', techSlug));
    }

    // term ↔ system (slugs)
    for (const sysSlug of (entry.relatedSystems ?? [])) {
      addEdge(graph, tKey, makeKey('system', sysSlug));
    }

    // term ↔ article (slugs)
    for (const artSlug of (entry.relatedArticles ?? [])) {
      addEdge(graph, tKey, makeKey('article', artSlug));
    }

    // term ↔ term (TERM-xxx IDs)
    for (const relTermId of (entry.relatedTerms ?? [])) {
      addEdge(graph, tKey, makeKey('term', termIdToSlug(relTermId)));
    }
  }

  // ── Diagrams ─────────────────────────────────────────────────────────────────
  for (const d of ENGINEERING_DIAGRAMS) {
    const dKey = makeKey('diagram', d.slug);

    // diagram ↔ standard (STD-xxx entity IDs → slugs)
    for (const stdEntityId of d.governingStandards) {
      addEdge(graph, dKey, makeKey('standard', stdEntityIdToSlug(stdEntityId)));
    }

    // diagram ↔ technology (display names with ™)
    for (const techName of d.relatedTechnologies) {
      addEdge(graph, dKey, makeKey('technology', techDisplayToSlug(techName)));
    }

    // diagram ↔ system (slugs)
    for (const sysSlug of d.applicableSystems) {
      addEdge(graph, dKey, makeKey('system', sysSlug));
    }

    // diagram ↔ article (slugs)
    for (const artSlug of d.relatedArticles) {
      addEdge(graph, dKey, makeKey('article', artSlug));
    }

    // diagram ↔ term (TERM-xxx IDs)
    for (const termId of d.relatedGlossaryTerms) {
      addEdge(graph, dKey, makeKey('term', termIdToSlug(termId)));
    }
  }

  // ── Calculators ───────────────────────────────────────────────────────────────
  for (const c of KC_CALCULATORS) {
    const cKey = makeKey('calculator', c.slug);

    // calculator ↔ standard (already slugs in calculators-registry)
    for (const stdSlug of c.relatedStandards) {
      addEdge(graph, cKey, makeKey('standard', stdSlug));
    }

    // calculator ↔ article (slugs)
    for (const artSlug of c.relatedArticles) {
      addEdge(graph, cKey, makeKey('article', artSlug));
    }

    // calculator ↔ technology (display names with ™)
    for (const techName of c.relatedTechnologies) {
      addEdge(graph, cKey, makeKey('technology', techDisplayToSlug(techName)));
    }
  }

  // ── Comparisons ───────────────────────────────────────────────────────────────
  for (const comp of KC_COMPARISONS) {
    const compKey = makeKey('comparison', comp.slug);

    // comparison ↔ standard (already slugs in comparisons-registry)
    for (const stdSlug of comp.relatedStandards) {
      addEdge(graph, compKey, makeKey('standard', stdSlug));
    }

    // comparison ↔ technology (display names WITHOUT ™ in comparisons-registry)
    for (const techName of comp.relatedTechnologies) {
      addEdge(graph, compKey, makeKey('technology', techDisplayToSlug(techName)));
    }

    // comparison ↔ system (slugs or abbreviations)
    for (const sysRef of comp.relatedSystems) {
      const sysSlug = systemRefToSlug(sysRef);
      if (sysSlug) addEdge(graph, compKey, makeKey('system', sysSlug));
    }

    // comparison ↔ term (term slugs in comparisons-registry → convert to ID → back to slug for key)
    for (const termSlug of comp.relatedTerms) {
      // Validate: the term slug must exist in GLOSSARY_REGISTRY
      const termId = termSlugToId(termSlug);
      if (GLOSSARY_REGISTRY[termId]) {
        addEdge(graph, compKey, makeKey('term', termSlug));
      }
    }

    // comparison ↔ article (slugs)
    for (const artSlug of comp.relatedArticles) {
      addEdge(graph, compKey, makeKey('article', artSlug));
    }
  }

  return graph;
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/**
 * Lazily-initialised singleton KC recommendation graph.
 * Built once on first access; identical for any two builds of the same data.
 */
let _graph: KCGraph | null = null;

export function getKCRecommendationGraph(): KCGraph {
  if (!_graph) _graph = buildGraph();
  return _graph;
}

export { makeKey };
