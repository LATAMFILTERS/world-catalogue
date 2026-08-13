import type { MetadataRoute } from 'next';
import { getCrawlProfiles } from '@/lib/crawl-optimization';

export default function sitemap(): MetadataRoute.Sitemap {
  const generatedAt = new Date();
  return getCrawlProfiles()
    .filter((profile) => {
      if (profile.url.includes('/premium-preview')) return false;
      if (profile.url.includes('/knowledge-system')) return false;
      const path = new URL(profile.url).pathname.replace(/\/$/, '');
      if (path.startsWith('/knowledge-center/problems/') && path !== '/knowledge-center/problems') return false;
      return true;
    })
    .map((profile) => ({
      url: profile.url,
      lastModified: generatedAt,
      changeFrequency: profile.changeFrequency,
      priority: profile.priority,
    }));
}
