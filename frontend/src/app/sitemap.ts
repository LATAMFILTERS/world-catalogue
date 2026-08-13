import type { MetadataRoute } from 'next';
import { getCrawlProfiles } from '@/lib/crawl-optimization';

export default function sitemap(): MetadataRoute.Sitemap {
  const generatedAt = new Date();
  return getCrawlProfiles()
    .filter((profile) => !profile.url.includes('/premium-preview') && !profile.url.includes('/knowledge-system') && !profile.url.includes('/knowledge-center/problems'))
    .map((profile) => ({ url: profile.url, lastModified: generatedAt, changeFrequency: profile.changeFrequency, priority: profile.priority }));
}
