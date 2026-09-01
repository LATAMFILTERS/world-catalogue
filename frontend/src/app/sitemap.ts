import type { MetadataRoute } from 'next';
import { getCrawlProfiles } from '@/lib/crawl-optimization';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return getCrawlProfiles().map((profile) => ({
    url: profile.url,
    changeFrequency: profile.changeFrequency,
    priority: profile.priority,
  }));
}
