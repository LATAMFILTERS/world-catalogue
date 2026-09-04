/**
 * ELIMFILTERS Knowledge Center — Semantic Navigation Index
 *
 * Canonical navigation rules:
 * - consolidated Engineering aliases are not first-class navigation entities;
 * - Cabin Air / Compressed Air references resolve to Air Intake & Airflow Protection;
 * - graph counts are derived from current canonical registries, never hardcoded.
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
import type { KCArticle, KCStandard, KCTechnology } from '@/lib/knowledge-center-data';
import { PROBLEM_STUBS } from './article-registry';
import type { ProblemStub } from './article-registry';
import type { TerminologyEntry } from './governance';
import {
  getEngineeringTopicCanonicalOwner,
  isConsolidatedEngineeringTopic,
} from './canonical-article-ownership';

const CANONICAL_ARTICLES = ENGINEERING_ARTICLES.filter(
  (article) => !isConsolidatedEngineeringTopic(article.slug),
);

export const KC_GRAPH_METADATA = {
  graphVersion: '6G.canonical',
  schemaVersion: '1.2.0',
  generatedAt: '2026-09-03',
  entityCounts: {
    articles: CANONICAL_ARTICLES.length,
    standards: KC_STANDARDS.length,
    technologies: KC_TECHNOLOGIES.length,
    systems: KC_SYSTEMS.length,
    industries: KC_INDUSTRIES.length,
    problems: PROBLEM_STUBS.length,
    terms: Object.keys(GLOSSARY_REGISTRY).length,
    diagrams: ENGINEERING_DIAGRAMS.length,
    calculators: KC_CALCULATORS.length,
    comparisons: KC_COMPARISONS.length,
  },
  edgeTypes: [
    'ARTICLE_TO_STANDARD',
    'ARTICLE_TO_TECHNOLOGY',
    'ARTICLE_TO_SYSTEM',
    'ARTICLE_TO_ARTICLE',
    'STANDARD_TO_ARTICLE',
    'TECHNOLOGY_TO_ARTICLE',
    'SYSTEM_TO_ARTICLE',
    'PROBLEM_TO_ARTICLE',
    'ARTICLE_TO_PROBLEM',
    'TERM_TO_STANDARD',
    'TERM_TO_TECHNOLOGY',
    'TERM_TO_SYSTEM',
    'TERM_TO_ARTICLE',
    'TERM_TO_TERM',
    'ARTICLE_TO_TERM',
    'CALCULATOR_TO_STANDARD',
    'CALCULATOR_TO_ARTICLE',
    'CALCULATOR_TO_TECHNOLOGY',
    'COMPARISON_TO_STANDARD',
    'COMPARISON_TO_TECHNOLOGY',
    'COMPARISON_TO_SYSTEM',
    'COMPARISON_TO_ARTICLE',
    'COMPARISON_TO_TERM',
  ],
} as const;

const SYSTEM_NAME_TO_SLUG: Record<string, string> = {
  'Air Intake Protection': 'air-intake-protection',
  'Air Intake & Airflow Protection': 'air-intake-protection',
  'Fuel Cleanliness Protection': 'fuel-cleanliness-protection',
  'Lubrication Protection': 'lubrication-protection',
  'Hydraulic Protection': 'hydraulic-protection',
  'Cooling System Protection': 'cooling-system-protection',
  'Cabin Air Protection': 'air-intake-protection',
  'Compressed Air Protection': 'air-intake-protection',
  'air-intake-protection': 'air-intake-protection',
  'fuel-cleanliness-protection': 'fuel-cleanliness-protection',
  'lubrication-protection': 'lubrication-protection',
  'hydraulic-protection': 'hydraulic-protection',
  'cooling-system-protection': 'cooling-system-protection',
  'cabin-air-protection': 'air-intake-protection',
  'compressed-air-protection': 'air-intake-protection',
  cabin: 'air-intake-protection',
  'cabin-air': 'air-intake-protection',
  'compressed-air': 'air-intake-protection',
};

function normalizeSystemRef(ref: string): string {
  return SYSTEM_NAME_TO_SLUG[ref] ?? ref.toLowerCase().replace(/\s+/g, '-');
}

function canonicalArticleSlug(slug: string): string | null {
  const owner = getEngineeringTopicCanonicalOwner(slug);
  if (!owner) return slug;
  const parsed = new URL(owner);
  const parts = parsed.pathname.split('/').filter(Boolean);
  const section = parts.at(-2);
  return section === 'engineering' ? (parts.at(-1) ?? null) : null;
}

function canonicalArticleSlugs(slugs: string[]): string[] {
  return Array.from(
    new Set(slugs.flatMap((slug) => {
      const canonical = canonicalArticleSlug(slug);
      return canonical ? [canonical] : [];
    })),
  );
}

const PROBLEM_CATEGORY_TO_SYSTEMS: Record<string, string[]> = {
  'mechanical-wear': ['lubrication-protection', 'hydraulic-protection', 'air-intake-protection'],
  contamination: ['lubrication-protection', 'fuel-cleanliness-protection', 'air-intake-protection', 'hydraulic-protection'],
  'structural-failure': ['hydraulic-protection', 'lubrication-protection'],
  'chemical-degradation': ['lubrication-protection', 'hydraulic-protection'],
  biological: ['fuel-cleanliness-protection'],
};

export interface SidebarStandard {
  permanentId: string;
  code: string;
  slug: string | null;
  title: string;
}

export interface SidebarTechnology {
  permanentId: string;
  name: string;
  slug: string;
  domain: string;
}

export interface SidebarSystem {
  permanentId: string;
  slug: string;
  title: string;
}

export interface SidebarProblem {
  permanentId: string;
  slug: string;
  name: string;
  severity: ProblemStub['severity'];
  category: string;
}

export interface SidebarArticle {
  permanentId: string;
  slug: string;
  title: string;
  category: string;
  readTime: string;
}

export interface KCSidebarData {
  relatedStandards: SidebarStandard[];
  relatedTechnologies: SidebarTechnology[];
  relatedSystems: SidebarSystem[];
  relatedProblems: SidebarProblem[];
  relatedArticles: SidebarArticle[];
}

export interface StandardSidebarArticle {
  permanentId: string;
  slug: string;
  title: string;
  category: string;
  readTime: string;
}

export interface StandardSidebarData {
  referencingArticles: StandardSidebarArticle[];
  relatedStandards: SidebarStandard[];
}

export interface TechSidebarArticle {
  permanentId: string;
  slug: string;
  title: string;
  category: string;
  readTime: string;
}

export interface TechSidebarData {
  referencingArticles: TechSidebarArticle[];
}

export interface SystemSidebarData {
  referencingArticles: StandardSidebarArticle[];
}

export interface SidebarTerm {
  permanentId: string;
  slug: string;
  term: string;
  category: string;
}

export interface GlossarySidebarData {
  relatedStandards: SidebarStandard[];
  relatedTechnologies: SidebarTechnology[];
  relatedSystems: SidebarSystem[];
  relatedArticles: SidebarArticle[];
  relatedTerms: SidebarTerm[];
}

interface KCNavigationIndex {
  articleBySlug: Map<string, KCArticle>;
  standardByCode: Map<string, KCStandard>;
  standardBySlug: Map<string, KCStandard>;
  technologyBySlug: Map<string, KCTechnology>;
  systemBySlug: Map<string, { slug: string; title: string }>;
  termBySlug: Map<string, TerminologyEntry>;
  articlesByStandard: Map<string, string[]>;
  articlesByTechnology: Map<string, string[]>;
  articlesBySystem: Map<string, string[]>;
  articlePermanentIds: Map<string, string>;
  standardPermanentIds: Map<string, string>;
  technologyPermanentIds: Map<string, string>;
  systemPermanentIds: Map<string, string>;
  getArticleSidebar(slug: string): KCSidebarData;
  getStandardSidebar(stdSlug: string): StandardSidebarData;
  getTechSidebar(techSlug: string): TechSidebarData;
  getSystemSidebar(systemSlug: string): SystemSidebarData;
  getGlossarySidebar(termSlug: string): GlossarySidebarData;
}

let _index: KCNavigationIndex | null = null;

function buildIndex(): KCNavigationIndex {
  const articleBySlug = new Map(CANONICAL_ARTICLES.map((a) => [a.slug, a]));
  const standardByCode = new Map(KC_STANDARDS.map((s) => [s.code, s]));
  const standardBySlug = new Map(KC_STANDARDS.map((s) => [s.slug, s]));
  const technologyBySlug = new Map(KC_TECHNOLOGIES.map((t) => [t.slug, t]));
  const systemBySlug = new Map(KC_SYSTEMS.map((s) => [s.slug, { slug: s.slug, title: s.title }]));

  function termIdToSlug(id: string): string {
    return id.replace(/^TERM-/, '').toLowerCase();
  }

  const termBySlug = new Map<string, TerminologyEntry>(
    Object.values(GLOSSARY_REGISTRY).map((t) => [termIdToSlug(t.id), t]),
  );

  const toArticleId = (slug: string) => `ARTICLE-${slug.toUpperCase()}`;
  const toStandardId = (slug: string) => `STD-${slug.toUpperCase()}`;
  const toTechnologyId = (slug: string) => `TECH-${slug.toUpperCase()}`;
  const toSystemId = (slug: string) => `SYS-${slug.toUpperCase()}`;

  const articlePermanentIds = new Map(CANONICAL_ARTICLES.map((a) => [a.slug, toArticleId(a.slug)]));
  const standardPermanentIds = new Map(KC_STANDARDS.map((s) => [s.slug, toStandardId(s.slug)]));
  const technologyPermanentIds = new Map(KC_TECHNOLOGIES.map((t) => [t.slug, toTechnologyId(t.slug)]));
  const systemPermanentIds = new Map(KC_SYSTEMS.map((s) => [s.slug, toSystemId(s.slug)]));

  const articlesByStandard = new Map<string, string[]>();
  const articlesByTechnology = new Map<string, string[]>();
  const articlesBySystem = new Map<string, string[]>();

  for (const article of CANONICAL_ARTICLES) {
    for (const stdCode of article.relatedStandards) {
      articlesByStandard.set(stdCode, [...(articlesByStandard.get(stdCode) ?? []), article.slug]);
    }
    for (const techName of article.relatedTechnologies) {
      const slug = techName.replace(/™/g, '').toLowerCase().trim();
      articlesByTechnology.set(slug, [...(articlesByTechnology.get(slug) ?? []), article.slug]);
    }
    for (const sysRef of article.relatedSystems) {
      const slug = normalizeSystemRef(sysRef);
      articlesBySystem.set(slug, [...(articlesBySystem.get(slug) ?? []), article.slug]);
    }
  }

  Array.from(articlesByStandard.values()).forEach((list) => list.sort());
  Array.from(articlesByTechnology.values()).forEach((list) => list.sort());
  Array.from(articlesBySystem.values()).forEach((list) => list.sort());

  const publishedProblems = PROBLEM_STUBS.filter((p) => p.status === 'published');

  function articleItem(slug: string): SidebarArticle | null {
    const a = articleBySlug.get(slug);
    if (!a) return null;
    return {
      permanentId: articlePermanentIds.get(slug) ?? toArticleId(slug),
      slug,
      title: a.title,
      category: a.category,
      readTime: a.readTime,
    };
  }

  function getArticleSidebar(slug: string): KCSidebarData {
    const canonicalSlug = canonicalArticleSlug(slug);
    const article = canonicalSlug ? articleBySlug.get(canonicalSlug) : undefined;
    if (!article) {
      return {
        relatedStandards: [], relatedTechnologies: [], relatedSystems: [], relatedProblems: [], relatedArticles: [],
      };
    }

    const relatedStandards: SidebarStandard[] = article.relatedStandards.map((code) => {
      const std = standardByCode.get(code);
      return {
        permanentId: std ? toStandardId(std.slug) : `STD-${code.replace(/[^A-Z0-9]/gi, '-').toUpperCase()}`,
        code,
        slug: std?.slug ?? null,
        title: std?.title ?? code,
      };
    });

    const relatedTechnologies = article.relatedTechnologies
      .map((name) => technologyBySlug.get(name.replace(/™/g, '').toLowerCase().trim()))
      .flatMap((tech): SidebarTechnology[] => tech ? [{
        permanentId: technologyPermanentIds.get(tech.slug) ?? toTechnologyId(tech.slug),
        name: tech.name,
        slug: tech.slug,
        domain: tech.domain,
      }] : []);

    const seenSystems = new Set<string>();
    const relatedSystems = article.relatedSystems.flatMap((sysRef): SidebarSystem[] => {
      const systemSlug = normalizeSystemRef(sysRef);
      if (seenSystems.has(systemSlug)) return [];
      seenSystems.add(systemSlug);
      const sys = systemBySlug.get(systemSlug);
      return sys ? [{
        permanentId: systemPermanentIds.get(sys.slug) ?? toSystemId(sys.slug),
        slug: sys.slug,
        title: sys.title,
      }] : [];
    });

    const articleSystemSlugs = new Set(article.relatedSystems.map(normalizeSystemRef));
    const relatedProblems = publishedProblems
      .filter((p) => (PROBLEM_CATEGORY_TO_SYSTEMS[p.category] ?? []).some((sys) => articleSystemSlugs.has(sys)))
      .slice(0, 4)
      .map((p): SidebarProblem => ({
        permanentId: p.id,
        slug: p.slug,
        name: p.name,
        severity: p.severity,
        category: p.category,
      }));

    const relatedArticles = CANONICAL_ARTICLES
      .filter((a) => a.slug !== canonicalSlug)
      .filter((a) => {
        const candidateSystems = new Set(a.relatedSystems.map(normalizeSystemRef));
        const sharedSystems = [...candidateSystems].some((system) => articleSystemSlugs.has(system));
        const sharedStandards = a.relatedStandards.some((standard) => article.relatedStandards.includes(standard));
        return sharedSystems || sharedStandards;
      })
      .sort((a, b) => a.slug.localeCompare(b.slug))
      .slice(0, 6)
      .map((a) => articleItem(a.slug))
      .filter((a): a is SidebarArticle => a !== null);

    return { relatedStandards, relatedTechnologies, relatedSystems, relatedProblems, relatedArticles };
  }

  function getStandardSidebar(stdSlug: string): StandardSidebarData {
    const std = standardBySlug.get(stdSlug);
    if (!std) return { referencingArticles: [], relatedStandards: [] };

    const referencingArticles = canonicalArticleSlugs(articlesByStandard.get(std.code) ?? [])
      .map(articleItem)
      .filter((a): a is SidebarArticle => a !== null);

    const relatedTopicSlugs = new Set(std.relatedTopics);
    const relatedStandards = KC_STANDARDS
      .filter((s) => s.slug !== stdSlug && s.relatedTopics.some((t) => relatedTopicSlugs.has(t)))
      .slice(0, 4)
      .map((s): SidebarStandard => ({
        permanentId: standardPermanentIds.get(s.slug) ?? toStandardId(s.slug),
        code: s.code,
        slug: s.slug,
        title: s.title,
      }));

    return { referencingArticles, relatedStandards };
  }

  function getTechSidebar(techSlug: string): TechSidebarData {
    const referencingArticles = canonicalArticleSlugs(articlesByTechnology.get(techSlug) ?? [])
      .map(articleItem)
      .filter((a): a is SidebarArticle => a !== null);
    return { referencingArticles };
  }

  function getSystemSidebar(systemSlug: string): SystemSidebarData {
    const canonicalSystemSlug = normalizeSystemRef(systemSlug);
    const referencingArticles = canonicalArticleSlugs(articlesBySystem.get(canonicalSystemSlug) ?? [])
      .map(articleItem)
      .filter((a): a is SidebarArticle => a !== null);
    return { referencingArticles };
  }

  function getGlossarySidebar(termSlug: string): GlossarySidebarData {
    const entry = termBySlug.get(termSlug);
    if (!entry) {
      return { relatedStandards: [], relatedTechnologies: [], relatedSystems: [], relatedArticles: [], relatedTerms: [] };
    }

    const relatedStandards = (entry.applicableStandards ?? []).map((stdId): SidebarStandard => {
      const slug = stdId.replace(/^STD-/, '').toLowerCase();
      const std = standardBySlug.get(slug);
      return {
        permanentId: stdId,
        code: std?.code ?? stdId.replace(/^STD-/, '').replace(/-/g, ' '),
        slug: std?.slug ?? null,
        title: std?.title ?? stdId,
      };
    });

    const relatedTechnologies = (entry.relatedTechnologies ?? [])
      .map((slug) => technologyBySlug.get(slug))
      .flatMap((tech): SidebarTechnology[] => tech ? [{
        permanentId: technologyPermanentIds.get(tech.slug) ?? toTechnologyId(tech.slug),
        name: tech.name,
        slug: tech.slug,
        domain: tech.domain,
      }] : []);

    const seenSystems = new Set<string>();
    const relatedSystems = (entry.relatedSystems ?? []).flatMap((sysRef): SidebarSystem[] => {
      const slug = normalizeSystemRef(sysRef);
      if (seenSystems.has(slug)) return [];
      seenSystems.add(slug);
      const sys = systemBySlug.get(slug);
      return sys ? [{
        permanentId: systemPermanentIds.get(sys.slug) ?? toSystemId(sys.slug),
        slug: sys.slug,
        title: sys.title,
      }] : [];
    });

    const relatedArticles = canonicalArticleSlugs(entry.relatedArticles ?? [])
      .map(articleItem)
      .filter((a): a is SidebarArticle => a !== null)
      .slice(0, 6);

    const relatedTerms = (entry.relatedTerms ?? [])
      .flatMap((termId): SidebarTerm[] => {
        const slug = termIdToSlug(termId);
        const t = termBySlug.get(slug);
        return t ? [{ permanentId: termId, slug, term: t.term, category: String(t.category) }] : [];
      });

    return { relatedStandards, relatedTechnologies, relatedSystems, relatedArticles, relatedTerms };
  }

  return {
    articleBySlug,
    standardByCode,
    standardBySlug,
    technologyBySlug,
    systemBySlug,
    termBySlug,
    articlesByStandard,
    articlesByTechnology,
    articlesBySystem,
    articlePermanentIds,
    standardPermanentIds,
    technologyPermanentIds,
    systemPermanentIds,
    getArticleSidebar,
    getStandardSidebar,
    getTechSidebar,
    getSystemSidebar,
    getGlossarySidebar,
  };
}

function getIndex(): KCNavigationIndex {
  if (!_index) _index = buildIndex();
  return _index;
}

export function getArticleSidebarData(slug: string): KCSidebarData {
  return getIndex().getArticleSidebar(slug);
}

export function getStandardSidebarData(stdSlug: string): StandardSidebarData {
  return getIndex().getStandardSidebar(stdSlug);
}

export function getTechSidebarData(techSlug: string): TechSidebarData {
  return getIndex().getTechSidebar(techSlug);
}

export function getSystemSidebarData(systemSlug: string): SystemSidebarData {
  return getIndex().getSystemSidebar(systemSlug);
}

export function getGlossarySidebarData(termSlug: string): GlossarySidebarData {
  return getIndex().getGlossarySidebar(termSlug);
}

export function getGraphStats() {
  const idx = getIndex();
  let totalArticleToStandardEdges = 0;
  let totalArticleToTechEdges = 0;
  let totalArticleToSystemEdges = 0;

  Array.from(idx.articlesByStandard.values()).forEach((list) => { totalArticleToStandardEdges += list.length; });
  Array.from(idx.articlesByTechnology.values()).forEach((list) => { totalArticleToTechEdges += list.length; });
  Array.from(idx.articlesBySystem.values()).forEach((list) => { totalArticleToSystemEdges += list.length; });

  const terms = Object.values(GLOSSARY_REGISTRY);
  let totalTermToStandard = 0;
  let totalTermToTechnology = 0;
  let totalTermToSystem = 0;
  let totalTermToArticle = 0;
  let totalTermToTerm = 0;

  terms.forEach((t) => {
    totalTermToStandard += (t.applicableStandards ?? []).length;
    totalTermToTechnology += (t.relatedTechnologies ?? []).length;
    totalTermToSystem += new Set((t.relatedSystems ?? []).map(normalizeSystemRef)).size;
    totalTermToArticle += canonicalArticleSlugs(t.relatedArticles ?? []).length;
    totalTermToTerm += (t.relatedTerms ?? []).length;
  });

  return {
    ...KC_GRAPH_METADATA,
    edgeCounts: {
      articleToStandard: totalArticleToStandardEdges,
      articleToTechnology: totalArticleToTechEdges,
      articleToSystem: totalArticleToSystemEdges,
      termToStandard: totalTermToStandard,
      termToTechnology: totalTermToTechnology,
      termToSystem: totalTermToSystem,
      termToArticle: totalTermToArticle,
      termToTerm: totalTermToTerm,
    },
  };
}
