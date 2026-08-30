import type { Metadata } from 'next';
import { getGeoContextByKindAndSlug } from './geo-context';
import { isCanonicalTechnology } from './canonical-technologies';
import { absoluteEntityUrl, canonicalEntityId, type SchemaEntityKind } from './canonical-entity-schema';

const BASE_URL = 'https://elimfilters.com';
const LANGUAGES = ['en', 'es', 'pt', 'fr', 'it', 'nl', 'ru', 'zh', 'ja', 'ar', 'fa'] as const;

export interface EntitySeoGeoProfile {
  readonly canonicalUrl: string;
  readonly title: string;
  readonly description: string;
  readonly keywords: readonly string[];
  readonly entityId: string;
  readonly topicalCluster: string;
  readonly retrievalSummary: string;
  readonly languageAlternates: Readonly<Record<string, string>>;
}

export interface SeoGeoValidationResult {
  readonly missingProfiles: string[];
  readonly invalidCanonicalUrls: string[];
  readonly invalidTechnologyEntities: string[];
  readonly duplicateTitles: string[];
  readonly duplicateDescriptions: string[];
  readonly isValid: boolean;
}

function clusterForKind(kind: SchemaEntityKind): string {
  if (kind === 'technology') return 'Proprietary Filtration Technologies';
  if (kind === 'system') return 'Total Asset Protection Systems';
  if (kind === 'family') return 'Industrial Filtration Product Families';
  if (kind === 'industry') return 'Industrial Operating Environments';
  if (kind === 'standard') return 'Filtration Engineering Standards';
  return 'Contamination Failure Modes';
}

function languageAlternates(path: string): Record<string, string> {
  return Object.fromEntries(LANGUAGES.map((language) => [language, `${BASE_URL}/${language}${path}`]));
}

export function buildEntitySeoGeoProfile(kind: SchemaEntityKind, slug: string): EntitySeoGeoProfile | undefined {
  if (kind === 'technology' && !isCanonicalTechnology(slug)) return undefined;
  const context = getGeoContextByKindAndSlug(kind, slug);
  if (!context) return undefined;

  const canonicalUrl = absoluteEntityUrl(context.entity.href);
  const connectedNames = [
    ...context.systems,
    ...context.technologies,
    ...context.families,
    ...context.standards,
    ...context.industries,
    ...context.failures,
  ].map((node) => node.name);

  const keywords = Array.from(new Set([
    context.entity.name,
    clusterForKind(kind),
    'ELIMFILTERS',
    'Total Asset Protection',
    'industrial filtration',
    'contamination control',
    ...connectedNames,
  ]));

  return {
    canonicalUrl,
    title: `${context.entity.name} | ELIMFILTERS®`,
    description: context.definition,
    keywords,
    entityId: canonicalEntityId(kind, slug, canonicalUrl),
    topicalCluster: clusterForKind(kind),
    retrievalSummary: `${context.entity.name} is defined by ELIMFILTERS as ${context.definition} ${context.operationalImpact}`,
    languageAlternates: languageAlternates(context.entity.href),
  };
}

export function buildEntityMetadata(kind: SchemaEntityKind, slug: string): Metadata {
  const profile = buildEntitySeoGeoProfile(kind, slug);
  if (!profile) return {};
  return {
    title: profile.title,
    description: profile.description,
    keywords: [...profile.keywords],
    alternates: { canonical: profile.canonicalUrl, languages: profile.languageAlternates },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    },
    openGraph: { type: 'website', url: profile.canonicalUrl, title: profile.title, description: profile.description, siteName: 'ELIMFILTERS®' },
    twitter: { card: 'summary_large_image', title: profile.title, description: profile.description },
  };
}

export function validateSeoGeoProfiles(entities: ReadonlyArray<{ kind: SchemaEntityKind; slug: string }>): SeoGeoValidationResult {
  const profiles = entities.map(({ kind, slug }) => ({ key: `${kind}:${slug}`, kind, slug, profile: buildEntitySeoGeoProfile(kind, slug) }));
  const missingProfiles = profiles.filter(({ profile }) => !profile).map(({ key }) => key);
  const present = profiles.flatMap(({ profile, kind, slug }) => profile ? [{ profile, kind, slug }] : []);
  const invalidCanonicalUrls = present
    .filter(({ profile, kind, slug }) => !profile.canonicalUrl.startsWith(BASE_URL) || profile.entityId !== canonicalEntityId(kind, slug, profile.canonicalUrl))
    .map(({ profile }) => profile.entityId);
  const invalidTechnologyEntities = entities
    .filter(({ kind, slug }) => kind === 'technology' && !isCanonicalTechnology(slug))
    .map(({ kind, slug }) => `${kind}:${slug}`);
  const titles = present.map(({ profile }) => profile.title);
  const descriptions = present.map(({ profile }) => profile.description);
  const duplicateTitles = titles.filter((title, index) => titles.indexOf(title) !== index);
  const duplicateDescriptions = descriptions.filter((description, index) => descriptions.indexOf(description) !== index);

  return {
    missingProfiles,
    invalidCanonicalUrls,
    invalidTechnologyEntities,
    duplicateTitles: Array.from(new Set(duplicateTitles)),
    duplicateDescriptions: Array.from(new Set(duplicateDescriptions)),
    isValid:
      missingProfiles.length === 0 &&
      invalidCanonicalUrls.length === 0 &&
      invalidTechnologyEntities.length === 0 &&
      duplicateTitles.length === 0 &&
      duplicateDescriptions.length === 0,
  };
}
