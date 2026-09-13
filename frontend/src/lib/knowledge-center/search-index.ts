/**
 * search-index.ts
 * ELIMFILTERS Knowledge Center — Static Search Index
 *
 * Phase 6E: Engineering Search
 *
 * Builds a flat array of KCSearchDocument from all KC entity registries.
 * Computed once at module scope — O(N) over all entities on first import.
 */

import {
  ENGINEERING_ARTICLES,
  KC_STANDARDS,
  KC_TECHNOLOGIES,
  KC_SYSTEMS,
  KC_INDUSTRIES,
  GLOSSARY_REGISTRY,
  KC_CALCULATORS,
  KC_COMPARISONS,
} from '@/lib/knowledge-center-data';
import { ENGINEERING_DIAGRAMS } from '@/lib/knowledge-center-data/diagram-registry';
import { PROBLEM_STUBS, PROBLEM_CATEGORY_LABELS, termIdToSlug } from './article-registry';
import { getKCRecommendationGraph } from './recommendation-graph';
import { isConsolidatedEngineeringTopic } from './canonical-article-ownership';
import type { KCSearchDocument } from './search-types';
import { listCanonicalKnowledge } from '@/lib/services/canonical-knowledge-service';

function edgeCountFor(nodeKey: string): number {
  const graph = getKCRecommendationGraph();
  return graph.edges.get(nodeKey)?.size ?? 0;
}

function nk(type: string, slug: string): string {
  return `${type}:${slug}`;
}

function cap(text: string, max = 200): string {
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

function buildArticleDocs(): KCSearchDocument[] {
  return ENGINEERING_ARTICLES
    .filter(a => !isConsolidatedEngineeringTopic(a.slug))
    .map(a => ({
      id:        nk('article', a.slug),
      type:      'article' as const,
      slug:      a.slug,
      label:     a.title,
      subtitle:  a.subtitle,
      domain:    a.category,
      keywords:  [
        ...a.keywords,
        ...a.relatedStandards,
        ...a.relatedTechnologies,
        a.category,
        a.subtitle,
      ],
      href:      `/knowledge-center/engineering/${a.slug}/`,
      edgeCount: edgeCountFor(nk('article', a.slug)),
    }));
}

function buildCanonicalKnowledgeDocs(): KCSearchDocument[] {
  return listCanonicalKnowledge().map(record => ({
    id: nk('article', `canonical-${record.slug}`), type: 'article' as const,
    slug: `canonical-${record.slug}`, label: record.title,
    subtitle: `${record.contentType} — approved ELIMFILTERS canonical knowledge`,
    domain: record.systems[0] ?? record.domain, keywords: record.keywords,
    href: `/knowledge-center/canonical/${record.slug}/`, edgeCount: record.sharedEngineering.length,
  }));
}

function buildStandardDocs(): KCSearchDocument[] {
  return KC_STANDARDS.map(s => ({
    id:        nk('standard', s.slug),
    type:      'standard' as const,
    slug:      s.slug,
    label:     s.code,
    code:      s.code,
    subtitle:  cap(s.scope),
    domain:    s.issuingOrganization,
    keywords:  [
      s.title,
      s.code,
      ...s.relatedTopics,
      ...s.relatedTechnologies,
      s.issuingOrganization,
      s.revisionStatus,
    ],
    href:      `/knowledge-center/standards/${s.slug}/`,
    edgeCount: edgeCountFor(nk('standard', s.slug)),
  }));
}

function buildTechnologyDocs(): KCSearchDocument[] {
  return KC_TECHNOLOGIES.map(t => ({
    id:        nk('technology', t.slug),
    type:      'technology' as const,
    slug:      t.slug,
    label:     t.name,
    subtitle:  t.tagline,
    domain:    t.domain,
    keywords:  [
      t.name,
      t.name.replace('™', ''),
      t.domain,
      t.tagline,
      ...t.contamination,
      ...t.standards,
      ...t.relatedSystems,
    ],
    href:      `/knowledge-center/technologies/${t.slug}/`,
    edgeCount: edgeCountFor(nk('technology', t.slug)),
  }));
}

function buildTermDocs(): KCSearchDocument[] {
  return Object.entries(GLOSSARY_REGISTRY).map(([termId, entry]) => {
    const slug = termIdToSlug(termId);
    return {
      id:        nk('term', slug),
      type:      'term' as const,
      slug,
      label:     entry.term,
      subtitle:  cap(entry.definition, 160),
      domain:    entry.category,
      keywords:  [
        entry.term,
        ...entry.aliases,
        ...(entry.abbreviations ?? []),
        ...entry.applicableStandards,
        ...(entry.relatedTechnologies ?? []),
        entry.category,
      ],
      href:      `/knowledge-center/glossary/${slug}/`,
      edgeCount: edgeCountFor(nk('term', slug)),
    };
  });
}

function buildSystemDocs(): KCSearchDocument[] {
  return KC_SYSTEMS.map(sys => {
    const s = sys as {
      slug: string; title: string; description: string;
      technologies: string[]; standards: string[]; challenges: string[];
    };
    return {
      id:        nk('system', s.slug),
      type:      'system' as const,
      slug:      s.slug,
      label:     s.title,
      subtitle:  cap(s.description),
      keywords:  [
        s.title,
        ...s.technologies,
        ...s.standards,
        ...s.challenges,
      ],
      href:      `/knowledge-center/systems/${s.slug}/`,
      edgeCount: edgeCountFor(nk('system', s.slug)),
    };
  });
}

function buildDiagramDocs(): KCSearchDocument[] {
  return ENGINEERING_DIAGRAMS.map(d => ({
    id:        nk('diagram', d.slug),
    type:      'diagram' as const,
    slug:      d.slug,
    label:     d.title,
    subtitle:  cap(d.engineeringPurpose, 180),
    domain:    d.diagramType,
    keywords:  [
      d.title,
      d.diagramType,
      ...d.relatedTechnologies,
      ...d.relatedArticles,
      ...d.governingStandards,
    ],
    href:      `/knowledge-center/diagrams/${d.slug}/`,
    edgeCount: edgeCountFor(nk('diagram', d.slug)),
  }));
}

function buildCalculatorDocs(): KCSearchDocument[] {
  return KC_CALCULATORS.map(c => ({
    id:        nk('calculator', c.slug),
    type:      'calculator' as const,
    slug:      c.slug,
    label:     c.title,
    code:      c.governingStandard,
    subtitle:  cap(c.description),
    domain:    c.category,
    keywords:  [
      c.title,
      c.governingStandard,
      c.category,
      c.description,
      ...c.relatedStandards,
      ...c.relatedTechnologies,
    ],
    href:      `/knowledge-center/calculators/${c.slug}/`,
    edgeCount: edgeCountFor(nk('calculator', c.slug)),
  }));
}

function buildComparisonDocs(): KCSearchDocument[] {
  return KC_COMPARISONS.map(comp => ({
    id:        nk('comparison', comp.slug),
    type:      'comparison' as const,
    slug:      comp.slug,
    label:     comp.title,
    subtitle:  comp.subtitle,
    domain:    comp.category,
    keywords:  [
      comp.title,
      comp.subtitle,
      comp.category,
      comp.optionA.label,
      comp.optionB.label,
      ...comp.governingStandards,
      ...comp.relatedStandards,
      ...comp.relatedTechnologies,
    ],
    href:      `/knowledge-center/comparisons/${comp.slug}/`,
    edgeCount: edgeCountFor(nk('comparison', comp.slug)),
  }));
}

function buildIndustryDocs(): KCSearchDocument[] {
  return KC_INDUSTRIES.map(ind => {
    const i = ind as { slug: string; title: string; description: string; dust: string };
    return {
      id:        nk('industry', i.slug),
      type:      'industry' as const,
      slug:      i.slug,
      label:     i.title,
      subtitle:  cap(i.description),
      domain:    `${i.dust} dust concentration`,
      keywords:  [i.title, i.dust, 'industry', 'sector'],
      href:      `/knowledge-center/industries/${i.slug}/`,
      edgeCount: 0,
    };
  });
}

function buildProblemDocs(): KCSearchDocument[] {
  return PROBLEM_STUBS.map(p => ({
    id:        nk('problem', p.slug),
    type:      'problem' as const,
    slug:      p.slug,
    label:     p.name,
    subtitle:  `${PROBLEM_CATEGORY_LABELS[p.category]} — ${p.severity} severity`,
    domain:    PROBLEM_CATEGORY_LABELS[p.category],
    keywords:  [p.name, p.category, p.severity, 'contamination', 'failure', 'wear'],
    href:      `/knowledge-center/problems/${p.slug}/`,
    edgeCount: 0,
  }));
}

export const KC_SEARCH_INDEX: KCSearchDocument[] = [
  ...buildArticleDocs(),
  ...buildCanonicalKnowledgeDocs(),
  ...buildStandardDocs(),
  ...buildTechnologyDocs(),
  ...buildTermDocs(),
  ...buildSystemDocs(),
  ...buildDiagramDocs(),
  ...buildCalculatorDocs(),
  ...buildComparisonDocs(),
  ...buildIndustryDocs(),
  ...buildProblemDocs(),
];

export const KC_SEARCH_TYPE_COUNTS: Record<string, number> = KC_SEARCH_INDEX.reduce(
  (acc, doc) => ({ ...acc, [doc.type]: (acc[doc.type] ?? 0) + 1 }),
  {} as Record<string, number>,
);
