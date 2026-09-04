/**
 * ELIMFILTERS Knowledge Center — Recommendation Graph Builder
 *
 * Public graph rules:
 * - only canonical Engineering article owners become article nodes;
 * - relationships to consolidated Engineering aliases are transferred to their owner;
 * - Cabin Air and Compressed Air references resolve into Air Intake & Airflow Protection;
 * - all public hrefs use trailing-slash canonical form.
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
import {
  getEngineeringTopicCanonicalOwner,
  isConsolidatedEngineeringTopic,
} from './canonical-article-ownership';
import type { KCGraph, KCGraphNode, KCNodeKey, KCNodeType } from './recommendation-types';

function techDisplayToSlug(displayName: string): string {
  return displayName.replace(/™/g, '').trim().toLowerCase();
}

function stdCodeToSlug(code: string): string {
  return code
    .replace(/:\d{4}.*$/, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

function stdEntityIdToSlug(entityId: string): string {
  return entityId.replace(/^STD-/, '').toLowerCase();
}

function termIdToSlug(id: string): string {
  return id.replace(/^TERM-/, '').toLowerCase();
}

function termSlugToId(slug: string): string {
  return `TERM-${slug.toUpperCase()}`;
}

const SYSTEM_REF_MAP: Record<string, string> = {
  'Air Intake Protection':       'air-intake-protection',
  'Air Intake & Airflow Protection': 'air-intake-protection',
  'Fuel Cleanliness Protection': 'fuel-cleanliness-protection',
  'Lubrication Protection':      'lubrication-protection',
  'Hydraulic Protection':        'hydraulic-protection',
  'Cooling System Protection':   'cooling-system-protection',
  'Cabin Air Protection':        'air-intake-protection',
  'Compressed Air Protection':   'air-intake-protection',

  'air-intake-protection':       'air-intake-protection',
  'fuel-cleanliness-protection': 'fuel-cleanliness-protection',
  'lubrication-protection':      'lubrication-protection',
  'hydraulic-protection':        'hydraulic-protection',
  'cooling-system-protection':   'cooling-system-protection',
  'cabin-air-protection':        'air-intake-protection',
  'compressed-air-protection':   'air-intake-protection',

  hydraulic:                     'hydraulic-protection',
  'lube-oil':                    'lubrication-protection',
  lubrication:                   'lubrication-protection',
  'air-intake':                  'air-intake-protection',
  fuel:                          'fuel-cleanliness-protection',
  'fuel-cleanliness':            'fuel-cleanliness-protection',
  cabin:                         'air-intake-protection',
  'cabin-air':                   'air-intake-protection',
  cooling:                       'cooling-system-protection',
  'compressed-air':              'air-intake-protection',
};

function systemRefToSlug(ref: string): string | null {
  return SYSTEM_REF_MAP[ref] ?? null;
}

function makeKey(type: KCNodeType, slug: string): KCNodeKey {
  return `${type}:${slug}`;
}

function addNode(graph: KCGraph, node: KCGraphNode): void {
  if (!graph.nodes.has(node.key)) graph.nodes.set(node.key, node);
}

function addEdge(graph: KCGraph, keyA: KCNodeKey, keyB: KCNodeKey): void {
  if (keyA === keyB) return;
  if (!graph.nodes.has(keyA) || !graph.nodes.has(keyB)) return;
  if (!graph.edges.has(keyA)) graph.edges.set(keyA, new Set());
  if (!graph.edges.has(keyB)) graph.edges.set(keyB, new Set());
  graph.edges.get(keyA)!.add(keyB);
  graph.edges.get(keyB)!.add(keyA);
}

function canonicalArticleTarget(slug: string): KCNodeKey {
  const owner = getEngineeringTopicCanonicalOwner(slug);
  if (!owner) return makeKey('article', slug);

  const parsed = new URL(owner);
  const parts = parsed.pathname.split('/').filter(Boolean);
  const section = parts.at(-2);
  const ownerSlug = parts.at(-1) ?? slug;

  if (section === 'standards') return makeKey('standard', ownerSlug);
  return makeKey('article', ownerSlug);
}

function addArticleRelationship(graph: KCGraph, source: KCNodeKey, articleSlug: string): void {
  addEdge(graph, source, canonicalArticleTarget(articleSlug));
}

function addSystemRelationship(graph: KCGraph, source: KCNodeKey, systemRef: string): void {
  const slug = systemRefToSlug(systemRef);
  if (slug) addEdge(graph, source, makeKey('system', slug));
}

function buildGraph(): KCGraph {
  const graph: KCGraph = { nodes: new Map(), edges: new Map() };
  const canonicalArticles = ENGINEERING_ARTICLES.filter(
    (article) => !isConsolidatedEngineeringTopic(article.slug),
  );

  for (const a of canonicalArticles) {
    addNode(graph, {
      key: makeKey('article', a.slug),
      type: 'article',
      slug: a.slug,
      label: a.title,
      href: `/knowledge-center/engineering/${a.slug}/`,
    });
  }

  for (const s of KC_STANDARDS) {
    addNode(graph, {
      key: makeKey('standard', s.slug),
      type: 'standard',
      slug: s.slug,
      label: s.code,
      href: `/knowledge-center/standards/${s.slug}/`,
    });
  }

  for (const t of KC_TECHNOLOGIES) {
    addNode(graph, {
      key: makeKey('technology', t.slug),
      type: 'technology',
      slug: t.slug,
      label: t.name,
      href: `/knowledge-center/technologies/${t.slug}/`,
    });
  }

  for (const sys of KC_SYSTEMS) {
    addNode(graph, {
      key: makeKey('system', sys.slug),
      type: 'system',
      slug: sys.slug,
      label: (sys as { title: string }).title,
      href: `/knowledge-center/systems/${sys.slug}/`,
    });
  }

  for (const [termId, entry] of Object.entries(GLOSSARY_REGISTRY)) {
    const slug = termIdToSlug(termId);
    addNode(graph, {
      key: makeKey('term', slug),
      type: 'term',
      slug,
      label: entry.term,
      href: `/knowledge-center/glossary/${slug}/`,
    });
  }

  for (const d of ENGINEERING_DIAGRAMS) {
    addNode(graph, {
      key: makeKey('diagram', d.slug),
      type: 'diagram',
      slug: d.slug,
      label: d.title,
      href: `/knowledge-center/diagrams/${d.slug}/`,
    });
  }

  for (const c of KC_CALCULATORS) {
    addNode(graph, {
      key: makeKey('calculator', c.slug),
      type: 'calculator',
      slug: c.slug,
      label: c.title,
      href: `/knowledge-center/calculators/${c.slug}/`,
    });
  }

  for (const comp of KC_COMPARISONS) {
    addNode(graph, {
      key: makeKey('comparison', comp.slug),
      type: 'comparison',
      slug: comp.slug,
      label: comp.title,
      href: `/knowledge-center/comparisons/${comp.slug}/`,
    });
  }

  for (const a of canonicalArticles) {
    const aKey = makeKey('article', a.slug);
    for (const stdCode of a.relatedStandards) {
      addEdge(graph, aKey, makeKey('standard', stdCodeToSlug(stdCode)));
    }
    for (const techName of a.relatedTechnologies) {
      addEdge(graph, aKey, makeKey('technology', techDisplayToSlug(techName)));
    }
    for (const sysRef of a.relatedSystems) {
      addSystemRelationship(graph, aKey, sysRef);
    }
  }

  for (const s of KC_STANDARDS) {
    const sKey = makeKey('standard', s.slug);
    for (const techName of s.relatedTechnologies) {
      addEdge(graph, sKey, makeKey('technology', techDisplayToSlug(techName)));
    }
    for (const sysRef of s.applicableSystems) {
      addSystemRelationship(graph, sKey, sysRef);
    }
    for (const termId of s.relatedGlossaryTerms) {
      addEdge(graph, sKey, makeKey('term', termIdToSlug(termId)));
    }
    for (const artSlug of s.relatedArticles) {
      addArticleRelationship(graph, sKey, artSlug);
    }
  }

  for (const t of KC_TECHNOLOGIES) {
    const tKey = makeKey('technology', t.slug);
    for (const stdCode of t.standards) {
      addEdge(graph, tKey, makeKey('standard', stdCodeToSlug(stdCode)));
    }
    for (const sysRef of t.relatedSystems) {
      addSystemRelationship(graph, tKey, sysRef);
    }
    for (const peerName of t.worksWith) {
      addEdge(graph, tKey, makeKey('technology', techDisplayToSlug(peerName)));
    }
  }

  for (const [termId, entry] of Object.entries(GLOSSARY_REGISTRY)) {
    const tSlug = termIdToSlug(termId);
    const tKey = makeKey('term', tSlug);
    for (const stdEntityId of entry.applicableStandards ?? []) {
      addEdge(graph, tKey, makeKey('standard', stdEntityIdToSlug(stdEntityId)));
    }
    for (const techSlug of entry.relatedTechnologies ?? []) {
      addEdge(graph, tKey, makeKey('technology', techSlug));
    }
    for (const sysRef of entry.relatedSystems ?? []) {
      addSystemRelationship(graph, tKey, sysRef);
    }
    for (const artSlug of entry.relatedArticles ?? []) {
      addArticleRelationship(graph, tKey, artSlug);
    }
    for (const relTermId of entry.relatedTerms ?? []) {
      addEdge(graph, tKey, makeKey('term', termIdToSlug(relTermId)));
    }
  }

  for (const d of ENGINEERING_DIAGRAMS) {
    const dKey = makeKey('diagram', d.slug);
    for (const stdEntityId of d.governingStandards) {
      addEdge(graph, dKey, makeKey('standard', stdEntityIdToSlug(stdEntityId)));
    }
    for (const techName of d.relatedTechnologies) {
      addEdge(graph, dKey, makeKey('technology', techDisplayToSlug(techName)));
    }
    for (const sysRef of d.applicableSystems) {
      addSystemRelationship(graph, dKey, sysRef);
    }
    for (const artSlug of d.relatedArticles) {
      addArticleRelationship(graph, dKey, artSlug);
    }
    for (const termId of d.relatedGlossaryTerms) {
      addEdge(graph, dKey, makeKey('term', termIdToSlug(termId)));
    }
  }

  for (const c of KC_CALCULATORS) {
    const cKey = makeKey('calculator', c.slug);
    for (const stdSlug of c.relatedStandards) {
      addEdge(graph, cKey, makeKey('standard', stdSlug));
    }
    for (const artSlug of c.relatedArticles) {
      addArticleRelationship(graph, cKey, artSlug);
    }
    for (const techName of c.relatedTechnologies) {
      addEdge(graph, cKey, makeKey('technology', techDisplayToSlug(techName)));
    }
  }

  for (const comp of KC_COMPARISONS) {
    const compKey = makeKey('comparison', comp.slug);
    for (const stdSlug of comp.relatedStandards) {
      addEdge(graph, compKey, makeKey('standard', stdSlug));
    }
    for (const techName of comp.relatedTechnologies) {
      addEdge(graph, compKey, makeKey('technology', techDisplayToSlug(techName)));
    }
    for (const sysRef of comp.relatedSystems) {
      addSystemRelationship(graph, compKey, sysRef);
    }
    for (const termSlug of comp.relatedTerms) {
      const termId = termSlugToId(termSlug);
      if (GLOSSARY_REGISTRY[termId]) {
        addEdge(graph, compKey, makeKey('term', termSlug));
      }
    }
    for (const artSlug of comp.relatedArticles) {
      addArticleRelationship(graph, compKey, artSlug);
    }
  }

  return graph;
}

let _graph: KCGraph | null = null;

export function getKCRecommendationGraph(): KCGraph {
  if (!_graph) _graph = buildGraph();
  return _graph;
}

export { makeKey };
