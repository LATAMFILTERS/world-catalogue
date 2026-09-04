import type { MetadataRoute } from 'next';
import { ENTITY_NODES, getConnectedEntities } from './entity-graph';
import { getEntityAuthorityScore } from './entity-authority';
import { getRecrawlConfig, RECRAWL_EXCLUDED_PATHS } from './recrawl-priority';

const BASE_URL = 'https://elimfilters.com';

export const STATIC_CRAWL_ROUTES = [
  '/', '/systems', '/technologies', '/families', '/industries', '/knowledge-center',
  '/knowledge-center/faq', '/videos', '/videos/moleculas', '/videos/agriculture',
  '/videos/automotive', '/videos/mining', '/videos/construction', '/videos/trucks-fleets',
  '/videos/railway', '/videos/marine', '/videos/manufacturing', '/videos/power-generation',
  '/videos/oil-gas', '/videos/bus-coach', '/about', '/contact', '/distributors',
  '/commercial-lines', '/commercial-lines/duratech', '/commercial-lines/marineclean',
  '/engineering/dust-ingestion', '/distributor-application', '/warranty',
] as const;

export const NOINDEX_PUBLIC_ROUTES = RECRAWL_EXCLUDED_PATHS;

export interface CrawlProfile {
  readonly path: string;
  readonly url: string;
  readonly priority: number;
  readonly changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  readonly crawlTier: 1 | 2 | 3;
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

function canonicalUrl(path: string): string {
  const normalized = path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}/`;
  return `${BASE_URL}${normalized}`;
}

function crawlTierFor(path: string): CrawlProfile['crawlTier'] | undefined {
  const config = getRecrawlConfig(path);
  if (!config) return undefined;
  return config.tier === 'P0' ? 1 : config.tier === 'P1' ? 2 : 3;
}

function profileFor(path: string, authority: number, connectionCount: number): CrawlProfile | undefined {
  const config = getRecrawlConfig(path);
  const crawlTier = crawlTierFor(path);
  if (!config || !crawlTier) return undefined;
  return {
    path,
    url: canonicalUrl(path),
    priority: config.priority,
    changeFrequency: config.changeFrequency,
    crawlTier,
    authority,
    connectionCount,
  };
}

function staticProfile(path: (typeof STATIC_CRAWL_ROUTES)[number]): CrawlProfile | undefined {
  return profileFor(path, path === '/' ? 100 : 80, 0);
}

export function getEntityCrawlProfile(entityId: string): CrawlProfile | undefined {
  const entity = ENTITY_NODES.find((node) => node.id === entityId);
  if (!entity || entity.kind === 'organization') return undefined;
  return profileFor(
    entity.href,
    getEntityAuthorityScore(entity.id)?.score || 0,
    getConnectedEntities(entity.id).length,
  );
}

export function getCrawlProfiles(): CrawlProfile[] {
  const staticProfiles = STATIC_CRAWL_ROUTES.flatMap((path) => {
    const profile = staticProfile(path);
    return profile ? [profile] : [];
  });
  const entityProfiles = ENTITY_NODES
    .filter((node) => node.kind !== 'organization')
    .flatMap((node) => {
      const profile = getEntityCrawlProfile(node.id);
      return profile ? [profile] : [];
    });

  return Array.from(
    new Map([...staticProfiles, ...entityProfiles].map((profile) => [profile.url, profile])).values(),
  ).sort((a, b) => a.crawlTier - b.crawlTier || b.authority - a.authority || a.url.localeCompare(b.url));
}

export function validateCrawlOptimization(): CrawlValidationResult {
  const profiles = getCrawlProfiles();
  const urls = profiles.map((profile) => profile.url);
  const duplicateUrls = urls.filter((url, index) => urls.indexOf(url) !== index);
  const profileUrlSet = new Set(urls);
  const entityUrls = ENTITY_NODES
    .filter((node) => node.kind !== 'organization')
    .filter((node) => getRecrawlConfig(node.href) !== undefined)
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
    .filter((node) => getRecrawlConfig(node.href) !== undefined)
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
