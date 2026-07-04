/**
 * article-registry.ts
 * ELIMFILTERS Engineering Knowledge Platform — Article Registry
 *
 * KC-00 Governance: Master registry mapping all KC content entities to their
 * permanent identifiers, URL slugs, and section routing.
 *
 * This file is the single source of truth for:
 *   - Section definitions (key → route prefix, ID prefix)
 *   - Problem Graph stubs (PROB-xxx → slug → display metadata)
 *   - Glossary slug utilities (TERM-xxx ↔ URL slug)
 *
 * Engineering content (definitions, failure progressions, evidence) is
 * populated in Phase 3 (Engineering Data Layer). This registry provides
 * structural metadata only.
 */

import type { EntityStatus } from './governance';
import type { ProblemCategory, CanonicalProblemId } from './problem-types';
import { CANONICAL_PROBLEM_IDS } from './problem-types';

// ── Section Definitions ───────────────────────────────────────────────────────

export type KCSectionKey =
  | 'engineering'
  | 'engineering-reference'
  | 'standards'
  | 'systems'
  | 'technologies'
  | 'industries'
  | 'problems'
  | 'glossary';

export interface KCSectionDefinition {
  key: KCSectionKey;
  title: string;
  navLabel: string;
  description: string;
  routePrefix: string;
  idPrefix: 'ARTICLE' | 'STD' | 'SYS' | 'TECH' | 'IND' | 'PROB' | 'TERM';
}

export const KC_SECTION_DEFINITIONS: Record<KCSectionKey, KCSectionDefinition> = {
  engineering: {
    key: 'engineering',
    title: 'Engineering Articles',
    navLabel: 'Engineering',
    description: 'Technical articles on filtration engineering principles and applications.',
    routePrefix: '/knowledge-center/engineering',
    idPrefix: 'ARTICLE',
  },
  'engineering-reference': {
    key: 'engineering-reference',
    title: 'Engineering Reference Library',
    navLabel: 'Reference',
    description: 'Structured reference sections covering filtration science fundamentals.',
    routePrefix: '/knowledge-center/engineering-reference',
    idPrefix: 'ARTICLE',
  },
  standards: {
    key: 'standards',
    title: 'Industrial Standards',
    navLabel: 'Standards',
    description: 'ISO, ASTM, SAE, and NAS filtration standards with test methodology and application context.',
    routePrefix: '/knowledge-center/standards',
    idPrefix: 'STD',
  },
  systems: {
    key: 'systems',
    title: 'Protection Systems',
    navLabel: 'Systems',
    description: 'Asset protection system domains covering all major fluid and air filtration circuits.',
    routePrefix: '/knowledge-center/systems',
    idPrefix: 'SYS',
  },
  technologies: {
    key: 'technologies',
    title: 'Filtration Technologies',
    navLabel: 'Technologies',
    description: 'ELIMFILTERS proprietary filtration technology architectures and performance specifications.',
    routePrefix: '/knowledge-center/technologies',
    idPrefix: 'TECH',
  },
  industries: {
    key: 'industries',
    title: 'Industry Profiles',
    navLabel: 'Industries',
    description: 'Contamination exposure profiles and filtration requirements by industrial sector.',
    routePrefix: '/knowledge-center/industries',
    idPrefix: 'IND',
  },
  problems: {
    key: 'problems',
    title: 'Problem Graph',
    navLabel: 'Problems',
    description: 'Knowledge Graph of 15 canonical industrial equipment failure problems caused by contamination.',
    routePrefix: '/knowledge-center/problems',
    idPrefix: 'PROB',
  },
  glossary: {
    key: 'glossary',
    title: 'Terminology Glossary',
    navLabel: 'Glossary',
    description: 'Canonical definitions for engineering terms referenced across all Knowledge Center content.',
    routePrefix: '/knowledge-center/glossary',
    idPrefix: 'TERM',
  },
};

export function buildRoute(section: KCSectionKey, slug: string): string {
  return `${KC_SECTION_DEFINITIONS[section].routePrefix}/${slug}`;
}

// ── Problem Stub Registry ─────────────────────────────────────────────────────
// Structural metadata for all 15 canonical Problem entities (KC-11).
// Name, category, severity are KC-00 governance metadata — not engineering content.
// Full Problem entity data (definition, failureProgression, etc.) is Phase 3.

export interface ProblemStub {
  id: CanonicalProblemId;
  slug: string;
  name: string;
  category: ProblemCategory;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: EntityStatus;
}

export const PROBLEM_STUBS: ProblemStub[] = [
  // Mechanical Wear (4)
  {
    id: CANONICAL_PROBLEM_IDS.ABRASIVE_WEAR,
    slug: 'abrasive-wear',
    name: 'Abrasive Wear',
    category: 'mechanical-wear',
    severity: 'critical',
    status: 'draft',
  },
  {
    id: CANONICAL_PROBLEM_IDS.ADHESIVE_WEAR,
    slug: 'adhesive-wear',
    name: 'Adhesive Wear',
    category: 'mechanical-wear',
    severity: 'high',
    status: 'draft',
  },
  {
    id: CANONICAL_PROBLEM_IDS.BEARING_WEAR,
    slug: 'bearing-wear',
    name: 'Bearing Wear',
    category: 'mechanical-wear',
    severity: 'critical',
    status: 'draft',
  },
  {
    id: CANONICAL_PROBLEM_IDS.INJECTOR_WEAR,
    slug: 'injector-wear',
    name: 'Injector Wear',
    category: 'mechanical-wear',
    severity: 'high',
    status: 'draft',
  },
  // Contamination (4)
  {
    id: CANONICAL_PROBLEM_IDS.SILICON_DUST,
    slug: 'silicon-dust-ingestion',
    name: 'Silicon Dust Ingestion',
    category: 'contamination',
    severity: 'critical',
    status: 'draft',
  },
  {
    id: CANONICAL_PROBLEM_IDS.WATER_INGRESS,
    slug: 'water-ingress',
    name: 'Water Ingress',
    category: 'contamination',
    severity: 'high',
    status: 'draft',
  },
  {
    id: CANONICAL_PROBLEM_IDS.FUEL_CONTAMINATION,
    slug: 'fuel-contamination',
    name: 'Fuel Contamination',
    category: 'contamination',
    severity: 'high',
    status: 'draft',
  },
  {
    id: CANONICAL_PROBLEM_IDS.AIR_RESTRICTION,
    slug: 'air-restriction',
    name: 'Air Restriction',
    category: 'contamination',
    severity: 'high',
    status: 'draft',
  },
  // Structural Failure (4)
  {
    id: CANONICAL_PROBLEM_IDS.CAVITATION,
    slug: 'cavitation',
    name: 'Cavitation',
    category: 'structural-failure',
    severity: 'critical',
    status: 'draft',
  },
  {
    id: CANONICAL_PROBLEM_IDS.PUMP_FAILURE,
    slug: 'pump-failure',
    name: 'Pump Failure',
    category: 'structural-failure',
    severity: 'critical',
    status: 'draft',
  },
  {
    id: CANONICAL_PROBLEM_IDS.FILTER_COLLAPSE,
    slug: 'filter-collapse',
    name: 'Filter Collapse',
    category: 'structural-failure',
    severity: 'high',
    status: 'draft',
  },
  {
    id: CANONICAL_PROBLEM_IDS.MEDIA_FATIGUE,
    slug: 'media-fatigue',
    name: 'Filter Media Fatigue',
    category: 'structural-failure',
    severity: 'medium',
    status: 'draft',
  },
  // Chemical Degradation (2)
  {
    id: CANONICAL_PROBLEM_IDS.VARNISH_FORMATION,
    slug: 'varnish-formation',
    name: 'Varnish Formation',
    category: 'chemical-degradation',
    severity: 'high',
    status: 'draft',
  },
  {
    id: CANONICAL_PROBLEM_IDS.OXIDATION,
    slug: 'oxidation',
    name: 'Oxidative Degradation',
    category: 'chemical-degradation',
    severity: 'medium',
    status: 'draft',
  },
  // Biological (1)
  {
    id: CANONICAL_PROBLEM_IDS.MICROBIAL_GROWTH,
    slug: 'microbial-growth',
    name: 'Microbial Growth',
    category: 'biological',
    severity: 'medium',
    status: 'draft',
  },
];

export const PROBLEM_STUBS_BY_SLUG: Record<string, ProblemStub> = Object.fromEntries(
  PROBLEM_STUBS.map((p) => [p.slug, p])
);

// ── Glossary Slug Utilities ───────────────────────────────────────────────────
// Slug convention: TERM-BETA-RATIO → 'beta-ratio' (strip TERM- prefix, lowercase)

export function termIdToSlug(id: string): string {
  return id.replace(/^TERM-/, '').toLowerCase();
}

export function slugToTermId(slug: string): string {
  return `TERM-${slug.toUpperCase()}`;
}

// ── Category Labels ───────────────────────────────────────────────────────────

export const PROBLEM_CATEGORY_LABELS: Record<ProblemCategory, string> = {
  'mechanical-wear': 'Mechanical Wear',
  'contamination': 'Contamination',
  'structural-failure': 'Structural Failure',
  'chemical-degradation': 'Chemical Degradation',
  'biological': 'Biological',
};

export const PROBLEM_SEVERITY_COLORS: Record<ProblemStub['severity'], string> = {
  critical: '#ff4444',
  high: '#ff8c00',
  medium: '#FFF12D',
  low: '#44ff88',
};
