import type { MetadataRoute } from 'next';
import { ENTITY_NODES, getConnectedEntities, type EntityKind } from './entity-graph';
import { getEntityAuthorityScore } from './entity-authority';

const BASE_URL = 'https://elimfilters.com';

export const STATIC_CRAWL_ROUTES = [
  '/',
  '/systems',
  '/technologies',
  '/families',
  '/industries',
  '/knowledge-center',
  '/knowledge-center/standards',
  '/engineering',
  '/about',
  '/contact',
] as const;

export interface CrawlProfile {
  readonly path: string;
  readonly url: string;
  readonly priority: number;
  readonly changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  readonly crawlTier: 1 | 2 | 3 | 4;
  readonly authority: number;
  readonly connectionCount: number;
}

export interface CrawlValidationResult {
  readonly duplicateUrls: string[];
  readonly missingEntityUrls: string[];
  readonly invalidCanonicalUrls: string[];
  readonly invalidPriorities: string[];
  readonly isolatedEntityUrls: string[];
  readonly isValid: boolean;
}

const BASE_PRIORITY_BY_KIND: Record<Exclude<EntityKind, 'organization'>, number> = {
  technology: 0.9,
  system: 0.9,
  industry: 0.84,
  standard: 0.82,
  family: 0.8,
  failure: 0.78,
};

const CRAWL_TIER_BY_KIND: Record<Exclude<EntityKind, 'organization'>, 1 | 2 | 3 | 4> = {
  technology: 1,
  system: 1,
  industry: 2,
  standard: 2,
  family: 3,
  failure: 3,
};

function clampPriority(value: number): number {
  return Math.max(0.1, Math.min(1, Number(value.toFixed(2))));
}

function frequencyForTier(tier: CrawlProfile['crawlTier']): CrawlProfile['changeFrequency'] {
  if (tier === 1) return 'weekly';
  if (tier === 2) return 'monthly';
  return 'monthly';
}

function staticProfile(path: (typeof STATIC_CRAWL_ROUTES)[number]): CrawlProfile {
  const tier: CrawlProfile['crawlTier'] = path === '/' ? 1 : path === '/contact' || path === '/about' ? 4 : 1;
  return {
    path,
    url: `${BASE_URL}${path}`,
    priority: path === '/' ? 1 : tier === 1 ? 0.92 : 0.55,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    crawlTier: tier,
    authority: path === '/' ? 100 : 80,
    connectionCount: 0,
  };
}

export function getEntityCrawlProfile(entityId: string): CrawlProfile | undefined {
  const entity = ENTITY_NODES.find((node) => node.id === entityId);
  if (!entity || entity.kind === 'organization') return undefined;

  const authority = getEntityAuthorityScore(entity.id)?.score || 0;
  const connectionCount = getConnectedEntities(entity.id).length;
  const kind = entity.kind as Exclude<EntityKind, 'organization'>;
  const relationshipBoost = Math.min(0.05, connectionCount * 0.005);
  const authorityBoost = Math.min(0.05, authority / 2000);
  const priority = clampPriority(BASE_PRIORITY_BY_KIND[kind] + relationshipBoost + authorityBoost);
  const crawlTier = CRAWL_TIER_BY_KIND[kind];

  return {
    path: entity.href,
    url: `${BASE_URL}${entity.href}`,
    priority,
    changeFrequency: frequencyForTier(crawlTier),
    crawlTier,
    authority,
    connectionCount,
  };
}

export function getCrawlProfiles(): CrawlProfile[] {
  const staticProfiles = STATIC_CRAWL_ROUTES.map(staticProfile);
  const entityProfiles = ENTITY_NODES
    .filter((node) => node.kind !== 'organization')
    .flatMap((node) => {
      const profile = getEntityCrawlProfile(node.id);
      return profile ? [profile] : [];
    });

  return Array.from(
    new Map([...staticProfiles, ...entityProfiles].map((profile) => [profile.url, profile])).values(),
  ).sort((a, b) => a.crawlTier - b.crawlTier || b.priority - a.priority || a.url.localeCompare(b.url));
}

export function validateCrawlOptimization(): CrawlValidationResult {
  const profiles = getCrawlProfiles();
  const urls = profiles.map((profile) => profile.url);
  const duplicateUrls = urls.filter((url, index) => urls.indexOf(url) !== index);
  const profileUrlSet = new Set(urls);
  const entityUrls = ENTITY_NODES
    .filter((node) => node.kind !== 'organization')
    .map((node) => `${BASE_URL}${node.href}`);
  const missingEntityUrls = entityUrls.filter((url) => !profileUrlSet.has(url));
  const invalidCanonicalUrls = urls.filter((url) => !url.startsWith(BASE_URL));
  const invalidPriorities = profiles
    .filter((profile) => profile.priority < 0.1 || profile.priority > 1)
    .map((profile) => profile.url);
  const isolatedEntityUrls = ENTITY_NODES
    .filter((node) => node.kind !== 'organization')
    .filter((node) => getConnectedEntities(node.id).length === 0)
    .map((node) => `${BASE_URL}${node.href}`);

  return {
    duplicateUrls: Array.from(new Set(duplicateUrls)),
    missingEntityUrls,
    invalidCanonicalUrls,
    invalidPriorities,
    isolatedEntityUrls,
    isValid:
      duplicateUrls.length === 0 &&
      missingEntityUrls.length === 0 &&
      invalidCanonicalUrls.length === 0 &&
      invalidPriorities.length === 0 &&
      isolatedEntityUrls.length === 0,
  };
}
