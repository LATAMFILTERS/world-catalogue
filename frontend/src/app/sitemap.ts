import type { MetadataRoute } from 'next';
import { getCrawlProfiles } from '@/lib/crawl-optimization';
import { SPANISH_ROUTES, spanishPath } from '@/lib/spanish-routes';

export const dynamic = 'force-static';

const BASE_URL = 'https://elimfilters.com';
const spanishRoutes = new Set(SPANISH_ROUTES);

export default function sitemap(): MetadataRoute.Sitemap {
  return getCrawlProfiles().flatMap((profile) => {
    const entry = {
      url: profile.url,
      changeFrequency: profile.changeFrequency,
      priority: profile.priority,
    };
    const path = profile.path === '/' ? '/' : profile.path.replace(/\/+$/, '');
    if (!spanishRoutes.has(path)) return [entry];
    const languages = { en: profile.url, es: `${BASE_URL}${spanishPath(path)}` };
    return [
      { ...entry, alternates: { languages } },
      { ...entry, url: languages.es, alternates: { languages } },
    ];
  });
}
