import type { MetadataRoute } from 'next';
import { ENTITY_NODES } from '@/lib/entity-graph';
import { getEntityAuthorityScore } from '@/lib/entity-authority';

const BASE_URL = 'https://elimfilters.com';

const STATIC_ROUTES = [
  '/',
  '/systems',
  '/technologies',
  '/families',
  '/industries',
  '/knowledge-system',
  '/knowledge-system/standards',
  '/knowledge-system/contamination',
  '/contact',
  '/about',
] as const;

function priorityFor(path: string, authority?: number): number {
  if (path === '/') return 1;
  if (STATIC_ROUTES.includes(path as (typeof STATIC_ROUTES)[number])) return 0.9;
  if (path.startsWith('/technologies/') || path.startsWith('/systems/')) return 0.86;
  if (path.startsWith('/knowledge-system/')) return 0.82;
  if (path.startsWith('/families/') || path.startsWith('/industries/')) return 0.78;
  return Math.min(0.75, 0.55 + (authority || 0) / 500);
}

function frequencyFor(path: string): MetadataRoute.Sitemap[number]['changeFrequency'] {
  if (path === '/') return 'weekly';
  if (path.startsWith('/knowledge-system/')) return 'monthly';
  return 'monthly';
}

export default function sitemap(): MetadataRoute.Sitemap {
  const generatedAt = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: generatedAt,
    changeFrequency: frequencyFor(path),
    priority: priorityFor(path),
  }));

  const entityEntries: MetadataRoute.Sitemap = ENTITY_NODES
    .filter((node) => node.kind !== 'organization')
    .map((node) => {
      const authority = getEntityAuthorityScore(node.id)?.score;
      return {
        url: `${BASE_URL}${node.href}`,
        lastModified: generatedAt,
        changeFrequency: frequencyFor(node.href),
        priority: priorityFor(node.href, authority),
      };
    });

  return Array.from(
    new Map([...staticEntries, ...entityEntries].map((entry) => [entry.url, entry])).values(),
  );
}
