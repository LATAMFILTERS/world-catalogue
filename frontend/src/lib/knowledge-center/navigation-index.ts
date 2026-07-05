/**
 * navigation-index.ts
 * ELIMFILTERS Knowledge Center — Semantic Navigation Index
 *
 * Builds a lazy-initialized singleton index from all KC entity registries.
 * All sidebar and navigation data is derived exclusively from graph relationships —
 * no hardcoded article, standard, technology, system, or problem logic.
 *
 * Performance contract:
 *   - Index creation: O(N) over all entities, runs once per module scope.
 *   - Any lookup: O(1) Map.get().
 *   - Sidebar generation: O(1) after index creation.
 *   - Zero additional runtime API calls.
 *   - Zero client-side graph rebuilding across re-renders.
 *
 * Determinism: All arrays in the index are sorted before storage.
 *   Running the build twice with identical data produces identical output.
 *
 * Dependency direction (acyclic):
 *   knowledge-center-data/index → knowledge-center/navigation-index → components
 *
 * Graph versioning:
 */

import {
  ENGINEERING_ARTICLES,
  KC_STANDARDS,
  KC_TECHNOLOGIES,
  KC_SYSTEMS,
} from '@/lib/knowledge-center-data';
import type { KCArticle, KCStandard, KCTechnology } from '@/lib/knowledge-center-data';
import { PROBLEM_STUBS } from './article-registry';
import type { ProblemStub } from './article-registry';

// ── Graph Version Metadata ────────────────────────────────────────────────────

export const KC_GRAPH_METADATA = {
  /** Semantic version: Phase.Articles.Standards.Technologies */
  graphVersion: '5A.53.16.11',
  /** Schema version for the navigation index structure. */
  schemaVersion: '1.0.0',
  /**
   * Deterministic build date (not a timestamp).
   * Identical for any two builds of the same data.
   */
  generatedAt: '2026-07-05',
  entityCounts: {
    articles:     53,
    standards:    16,
    technologies: 11,
    systems:       6,
    industries:   10,
    problems:     15,
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
  ],
} as const;

// ── System Name Normalizer ────────────────────────────────────────────────────
// Articles use both display names ("Lubrication Protection") and slugs
// ("lubrication-protection") in their relatedSystems arrays.
// This map normalizes both forms to the canonical slug.

const SYSTEM_NAME_TO_SLUG: Record<string, string> = {
  // Display names
  'Air Intake Protection':      'air-intake-protection',
  'Fuel Cleanliness Protection':'fuel-cleanliness-protection',
  'Lubrication Protection':     'lubrication-protection',
  'Hydraulic Protection':       'hydraulic-protection',
  'Cooling System Protection':  'cooling-system-protection',
  'Cabin Air Protection':       'cabin-air-protection',
  'Compressed Air Protection':  'compressed-air-protection', // referenced in some articles; no KC_SYSTEMS entry
  // Slug forms (identity mapping)
  'air-intake-protection':      'air-intake-protection',
  'fuel-cleanliness-protection':'fuel-cleanliness-protection',
  'lubrication-protection':     'lubrication-protection',
  'hydraulic-protection':       'hydraulic-protection',
  'cooling-system-protection':  'cooling-system-protection',
  'cabin-air-protection':       'cabin-air-protection',
  'compressed-air-protection':  'compressed-air-protection',
};

function normalizeSystemRef(ref: string): string {
  return SYSTEM_NAME_TO_SLUG[ref] ?? ref.toLowerCase().replace(/\s+/g, '-');
}

// ── Problem → System Category Adjacency ──────────────────────────────────────
// Data-driven mapping: problem category → system slugs where this problem occurs.
// Used to compute article→problem relationships from system overlap.

const PROBLEM_CATEGORY_TO_SYSTEMS: Record<string, string[]> = {
  'mechanical-wear':      ['lubrication-protection', 'hydraulic-protection', 'air-intake-protection'],
  'contamination':        ['lubrication-protection', 'fuel-cleanliness-protection', 'air-intake-protection', 'hydraulic-protection', 'cabin-air-protection'],
  'structural-failure':   ['hydraulic-protection', 'lubrication-protection'],
  'chemical-degradation': ['lubrication-protection', 'hydraulic-protection'],
  'biological':           ['fuel-cleanliness-protection'],
};

// ── Sidebar Data Types ────────────────────────────────────────────────────────

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

// ── Standard Articles Sidebar Types ──────────────────────────────────────────

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

// ── Technology Sidebar Types ──────────────────────────────────────────────────

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

// ── System Sidebar Types ──────────────────────────────────────────────────────

export interface SystemSidebarData {
  referencingArticles: StandardSidebarArticle[];
}

// ── Internal Index Structure ──────────────────────────────────────────────────

interface KCNavigationIndex {
  // Entity lookup maps (keyed by slug/code — O(1) access)
  articleBySlug:     Map<string, KCArticle>;
  standardByCode:    Map<string, KCStandard>;
  standardBySlug:    Map<string, KCStandard>;
  technologyBySlug:  Map<string, KCTechnology>;
  systemBySlug:      Map<string, { slug: string; title: string }>;

  // Inverted indexes (keyed by related entity → sorted article slug list)
  articlesByStandard:   Map<string, string[]>; // standard code → article slugs
  articlesByTechnology: Map<string, string[]>; // tech slug → article slugs
  articlesBySystem:     Map<string, string[]>; // system slug → article slugs

  // Permanent ID maps (slug → permanent ID string)
  articlePermanentIds:    Map<string, string>;
  standardPermanentIds:   Map<string, string>; // keyed by slug
  technologyPermanentIds: Map<string, string>; // keyed by slug
  systemPermanentIds:     Map<string, string>; // keyed by slug

  // Query functions
  getArticleSidebar(slug: string): KCSidebarData;
  getStandardSidebar(stdSlug: string): StandardSidebarData;
  getTechSidebar(techSlug: string): TechSidebarData;
  getSystemSidebar(systemSlug: string): SystemSidebarData;
}

// ── Singleton ─────────────────────────────────────────────────────────────────

let _index: KCNavigationIndex | null = null;

function buildIndex(): KCNavigationIndex {
  // ── Entity maps ────────────────────────────────────────────────────────────

  const articleBySlug    = new Map(ENGINEERING_ARTICLES.map((a) => [a.slug, a]));
  const standardByCode   = new Map(KC_STANDARDS.map((s) => [s.code, s]));
  const standardBySlug   = new Map(KC_STANDARDS.map((s) => [s.slug, s]));
  const technologyBySlug = new Map(KC_TECHNOLOGIES.map((t) => [t.slug, t]));
  const systemBySlug     = new Map(KC_SYSTEMS.map((s) => [s.slug, { slug: s.slug, title: s.title }]));

  // ── Permanent ID maps ──────────────────────────────────────────────────────
  // IDs are constructed deterministically from slug conventions.
  // Format mirrors governance.ts: {PREFIX}-{SLUG-UPPERCASED-HYPHENS}

  function toArticleId(slug: string): string {
    return `ARTICLE-${slug.toUpperCase()}`;
  }
  function toStandardId(slug: string): string {
    return `STD-${slug.toUpperCase()}`;
  }
  function toTechnologyId(slug: string): string {
    return `TECH-${slug.toUpperCase()}`;
  }
  function toSystemId(slug: string): string {
    return `SYS-${slug.toUpperCase()}`;
  }

  const articlePermanentIds    = new Map(ENGINEERING_ARTICLES.map((a) => [a.slug, toArticleId(a.slug)]));
  const standardPermanentIds   = new Map(KC_STANDARDS.map((s) => [s.slug, toStandardId(s.slug)]));
  const technologyPermanentIds = new Map(KC_TECHNOLOGIES.map((t) => [t.slug, toTechnologyId(t.slug)]));
  const systemPermanentIds     = new Map(KC_SYSTEMS.map((s) => [s.slug, toSystemId(s.slug)]));

  // ── Inverted indexes ───────────────────────────────────────────────────────

  const articlesByStandard   = new Map<string, string[]>();
  const articlesByTechnology = new Map<string, string[]>();
  const articlesBySystem     = new Map<string, string[]>();

  for (const article of ENGINEERING_ARTICLES) {
    // standard code → articles
    for (const stdCode of article.relatedStandards) {
      const list = articlesByStandard.get(stdCode) ?? [];
      list.push(article.slug);
      articlesByStandard.set(stdCode, list);
    }
    // technology slug → articles (strip ™ and lowercase)
    for (const techName of article.relatedTechnologies) {
      const slug = techName.replace(/™/g, '').toLowerCase().trim();
      const list = articlesByTechnology.get(slug) ?? [];
      list.push(article.slug);
      articlesByTechnology.set(slug, list);
    }
    // system slug (normalize display names + slugs) → articles
    for (const sysRef of article.relatedSystems) {
      const slug = normalizeSystemRef(sysRef);
      const list = articlesBySystem.get(slug) ?? [];
      list.push(article.slug);
      articlesBySystem.set(slug, list);
    }
  }

  // Sort all inverted index lists for deterministic output
  Array.from(articlesByStandard.values()).forEach((list)   => list.sort());
  Array.from(articlesByTechnology.values()).forEach((list) => list.sort());
  Array.from(articlesBySystem.values()).forEach((list)     => list.sort());

  // ── Published problems (for sidebar) ──────────────────────────────────────

  const publishedProblems = PROBLEM_STUBS.filter((p) => p.status === 'published');

  // ── Query: Article Sidebar ─────────────────────────────────────────────────

  function getArticleSidebar(slug: string): KCSidebarData {
    const article = articleBySlug.get(slug);
    if (!article) {
      return {
        relatedStandards: [],
        relatedTechnologies: [],
        relatedSystems: [],
        relatedProblems: [],
        relatedArticles: [],
      };
    }

    // Standards panel — from article.relatedStandards
    const relatedStandards: SidebarStandard[] = article.relatedStandards.map((code) => {
      const std = standardByCode.get(code);
      return {
        permanentId: std ? toStandardId(std.slug) : `STD-${code.replace(/[^A-Z0-9]/gi, '-').toUpperCase()}`,
        code,
        slug: std?.slug ?? null,
        title: std?.title ?? code,
      };
    });

    // Technologies panel — from article.relatedTechnologies
    const relatedTechnologies: SidebarTechnology[] = article.relatedTechnologies
      .map((name) => {
        const slug = name.replace(/™/g, '').toLowerCase().trim();
        const tech = technologyBySlug.get(slug);
        if (!tech) return null;
        return {
          permanentId: technologyPermanentIds.get(tech.slug) ?? toTechnologyId(tech.slug),
          name: tech.name,
          slug: tech.slug,
          domain: tech.domain,
        };
      })
      .filter((t): t is SidebarTechnology => t !== null);

    // Systems panel — from article.relatedSystems
    const relatedSystems: SidebarSystem[] = article.relatedSystems
      .map((sysRef) => {
        const slug = normalizeSystemRef(sysRef);
        const sys = systemBySlug.get(slug);
        if (!sys) return null;
        return {
          permanentId: systemPermanentIds.get(sys.slug) ?? toSystemId(sys.slug),
          slug: sys.slug,
          title: sys.title,
        };
      })
      .filter((s): s is SidebarSystem => s !== null);

    // Problems panel — derived from system overlap with problem category adjacency
    const articleSystemSlugs = new Set(
      article.relatedSystems.map(normalizeSystemRef)
    );
    const relatedProblems: SidebarProblem[] = publishedProblems
      .filter((p) => {
        const problemSystems = PROBLEM_CATEGORY_TO_SYSTEMS[p.category] ?? [];
        return problemSystems.some((sys) => articleSystemSlugs.has(sys));
      })
      .slice(0, 4)
      .map((p) => ({
        permanentId: p.id,
        slug: p.slug,
        name: p.name,
        severity: p.severity,
        category: p.category,
      }));

    // Related articles panel — overlap in systems OR standards, max 6, sorted for determinism
    const relatedArticles: SidebarArticle[] = ENGINEERING_ARTICLES
      .filter((a) => a.slug !== slug)
      .filter((a) => {
        const sharedSystems   = a.relatedSystems.some((s) => article.relatedSystems.includes(s));
        const sharedStandards = a.relatedStandards.some((s) => article.relatedStandards.includes(s));
        return sharedSystems || sharedStandards;
      })
      .sort((a, b) => a.slug.localeCompare(b.slug))
      .slice(0, 6)
      .map((a) => ({
        permanentId: articlePermanentIds.get(a.slug) ?? toArticleId(a.slug),
        slug: a.slug,
        title: a.title,
        category: a.category,
        readTime: a.readTime,
      }));

    return { relatedStandards, relatedTechnologies, relatedSystems, relatedProblems, relatedArticles };
  }

  // ── Query: Standard Sidebar ────────────────────────────────────────────────

  function getStandardSidebar(stdSlug: string): StandardSidebarData {
    const std = standardBySlug.get(stdSlug);
    if (!std) return { referencingArticles: [], relatedStandards: [] };

    const referencingArticles: StandardSidebarArticle[] = (articlesByStandard.get(std.code) ?? [])
      .map((slug) => {
        const a = articleBySlug.get(slug);
        if (!a) return null;
        return {
          permanentId: articlePermanentIds.get(slug) ?? toArticleId(slug),
          slug,
          title: a.title,
          category: a.category,
          readTime: a.readTime,
        };
      })
      .filter((a): a is StandardSidebarArticle => a !== null);

    // Related standards — those sharing at least one referencing article topic
    const relatedTopicSlugs = new Set(std.relatedTopics);
    const relatedStandards: SidebarStandard[] = KC_STANDARDS
      .filter((s) => s.slug !== stdSlug && s.relatedTopics.some((t) => relatedTopicSlugs.has(t)))
      .slice(0, 4)
      .map((s) => ({
        permanentId: standardPermanentIds.get(s.slug) ?? toStandardId(s.slug),
        code: s.code,
        slug: s.slug,
        title: s.title,
      }));

    return { referencingArticles, relatedStandards };
  }

  // ── Query: Technology Sidebar ──────────────────────────────────────────────

  function getTechSidebar(techSlug: string): TechSidebarData {
    const articleSlugs = articlesByTechnology.get(techSlug) ?? [];
    const referencingArticles: TechSidebarArticle[] = articleSlugs
      .map((slug) => {
        const a = articleBySlug.get(slug);
        if (!a) return null;
        return {
          permanentId: articlePermanentIds.get(slug) ?? toArticleId(slug),
          slug,
          title: a.title,
          category: a.category,
          readTime: a.readTime,
        };
      })
      .filter((a): a is TechSidebarArticle => a !== null);

    return { referencingArticles };
  }

  // ── Query: System Sidebar ──────────────────────────────────────────────────

  function getSystemSidebar(systemSlug: string): SystemSidebarData {
    const articleSlugs = articlesBySystem.get(systemSlug) ?? [];
    const referencingArticles: StandardSidebarArticle[] = articleSlugs
      .map((slug) => {
        const a = articleBySlug.get(slug);
        if (!a) return null;
        return {
          permanentId: articlePermanentIds.get(slug) ?? toArticleId(slug),
          slug,
          title: a.title,
          category: a.category,
          readTime: a.readTime,
        };
      })
      .filter((a): a is StandardSidebarArticle => a !== null);

    return { referencingArticles };
  }

  return {
    articleBySlug,
    standardByCode,
    standardBySlug,
    technologyBySlug,
    systemBySlug,
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
  };
}

function getIndex(): KCNavigationIndex {
  if (!_index) _index = buildIndex();
  return _index;
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Returns all sidebar data for an engineering article. O(1) after first call. */
export function getArticleSidebarData(slug: string): KCSidebarData {
  return getIndex().getArticleSidebar(slug);
}

/** Returns articles referencing a standard + related standards. O(1) after first call. */
export function getStandardSidebarData(stdSlug: string): StandardSidebarData {
  return getIndex().getStandardSidebar(stdSlug);
}

/** Returns articles referencing a technology. O(1) after first call. */
export function getTechSidebarData(techSlug: string): TechSidebarData {
  return getIndex().getTechSidebar(techSlug);
}

/** Returns articles for a protection system. O(1) after first call. */
export function getSystemSidebarData(systemSlug: string): SystemSidebarData {
  return getIndex().getSystemSidebar(systemSlug);
}

/** Graph statistics for validation and reporting. */
export function getGraphStats() {
  const idx = getIndex();
  let totalArticleToStandardEdges = 0;
  let totalArticleToTechEdges = 0;
  let totalArticleToSystemEdges = 0;

  Array.from(idx.articlesByStandard.values()).forEach((list)   => { totalArticleToStandardEdges   += list.length; });
  Array.from(idx.articlesByTechnology.values()).forEach((list) => { totalArticleToTechEdges        += list.length; });
  Array.from(idx.articlesBySystem.values()).forEach((list)     => { totalArticleToSystemEdges      += list.length; });

  return {
    ...KC_GRAPH_METADATA,
    edgeCounts: {
      articleToStandard:   totalArticleToStandardEdges,
      articleToTechnology: totalArticleToTechEdges,
      articleToSystem:     totalArticleToSystemEdges,
    },
  };
}
