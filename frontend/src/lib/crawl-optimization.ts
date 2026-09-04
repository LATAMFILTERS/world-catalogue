import type { MetadataRoute } from 'next';
import { ENTITY_NODES, getConnectedEntities, type EntityKind } from './entity-graph';
import { getEntityAuthorityScore } from './entity-authority';

const BASE_URL = 'https://elimfilters.com';

// Only canonical, index-worthy public destinations belong in the generated sitemap.
export const STATIC_CRAWL_ROUTES = [
  '/',
  '/systems',
  '/technologies',
  '/families',
  '/industries',
  '/knowledge-center',
  '/knowledge-center/faq',
  '/videos',
  '/videos/moleculas',
  '/videos/agriculture',
  '/videos/automotive',
  '/videos/mining',
  '/videos/construction',
  '/videos/trucks-fleets',
  '/videos/railway',
  '/videos/marine',
  '/videos/manufacturing',
  '/videos/power-generation',
  '/videos/oil-gas',
  '/videos/bus-coach',
  '/about',
  '/contact',
  '/distributors',
  '/commercial-lines',
  '/commercial-lines/duratech',
  '/commercial-lines/marineclean',
  '/engineering/dust-ingestion',
  '/distributor-application',
  '/warranty',
] as const;

/**
 * Public routes that may resolve for compatibility or internal utility, but must
 * never be emitted as canonical sitemap destinations.
 */
export const NOINDEX_PUBLIC_ROUTES = [
  '/search',
  '/customer-intelligence',
  '/knowledge-center/standards/iso-11155',
  '/knowledge-center/engineering/iso-16889',
  '/knowledge-center/engineering/iso-4406',
  '/knowledge-center/engineering/filter-media-science',
  '/knowledge-center/engineering-reference/engineering-glossary',
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
  readonly noindexUrlsInSitemap: string[];
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

function canonicalUrl(path: string): string {
  const normalized = path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}/`;
  return `${BASE_URL}${normalized}`;
}

function clampPriority(value: number): number {
  return Math.max(0.1, Math.min(1, Number(value.toFixed(2))));
}

function frequencyForTier(tier: CrawlProfile['crawlTier']): CrawlProfile['changeFrequency'] {
  if (tier === 1) return 'weekly';
  if (tier === 2) return 'monthly';
  return 'monthly';
}

function staticProfile(path: (typeof STATIC_CRAWL_ROUTES)[number]): CrawlProfile {
  const isSpecializedSolution = path === '/commercial-lines/duratech' || path === '/commercial-lines/marineclean';
  const isVideoRoute = path === '/videos' || path.startsWith('/videos/');
  const tier: CrawlProfile['crawlTier'] = path === '/' ? 1 : path === '/contact' || path === '/about' ? 4 : isSpecializedSolution ? 2 : isVideoRoute ? 2 : 1;
  return {
    path,
    url: canonicalUrl(path),
    priority: path === '/' ? 1 : isSpecializedSolution ? 0.84 : isVideoRoute ? 0.78 : tier === 1 ? 0.92 : 0.55,
    changeFrequency: path === '/' ? 'weekly' : isSpecializedSolution || isVideoRoute ? 'monthly' : 'monthly',
    crawlTier: tier,
    authority: path === '/' ? 100 : isSpecializedSolution ? 85 : isVideoRoute ? 72 : 80,
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
    url: canonicalUrl(entity.href),
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
    .map((node) => canonicalUrl(node.href));
  const missingEntityUrls = entityUrls.filter((url) => !profileUrlSet.has(url));
  const invalidCanonicalUrls = urls.filter((url) => {
    if (!url.startsWith(BASE_URL)) return true;
    const pathname = url.slice(BASE_URL.length);
    return pathname !== '/' && !pathname.endsWith('/');
  });
  const invalidPriorities = profiles
    .filter((profile) => profile.priority < 0.1 || profile.priority > 1)
    .map((profile) => profile.url);
  const isolatedEntityUrls = ENTITY_NODES
    .filter((node) => node.kind !== 'organization')
    .filter((node) => getConnectedEntities(node.id).length === 0)
    .map((node) => canonicalUrl(node.href));
  const noindexUrlsInSitemap = NOINDEX_PUBLIC_ROUTES
    .map(canonicalUrl)
    .filter((url) => profileUrlSet.has(url));

  return {
    duplicateUrls: Array.from(new Set(duplicateUrls)),
    missingEntityUrls,
    invalidCanonicalUrls,
    invalidPriorities,
    isolatedEntityUrls,
    noindexUrlsInSitemap,
    isValid:
      duplicateUrls.length === 0 &&
      missingEntityUrls.length === 0 &&
      invalidCanonicalUrls.length === 0 &&
      invalidPriorities.length === 0 &&
      isolatedEntityUrls.length === 0 &&
      noindexUrlsInSitemap.length === 0,
  };
}
