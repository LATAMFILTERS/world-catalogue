import type { MetadataRoute } from 'next';
import { getCrawlProfiles } from '@/lib/crawl-optimization';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const generatedAt = new Date();

  return getCrawlProfiles().map((profile) => ({
    url: profile.url,
    lastModified: generatedAt,
    changeFrequency: profile.changeFrequency,
    priority: profile.priority,
  }));
}
