import type { MetadataRoute } from 'next';
import { getCrawlProfiles } from '@/lib/crawl-optimization';
import { LOCALIZED_ROUTES, ROUTE_LANGS, languageAlternates } from '@/lib/localized-routes';

export const dynamic = 'force-static';

const localizedRoutes = new Set(LOCALIZED_ROUTES);

export default function sitemap(): MetadataRoute.Sitemap {
  return getCrawlProfiles().flatMap((profile) => {
    const entry = {
      url: profile.url,
      changeFrequency: profile.changeFrequency,
      priority: profile.priority,
    };
    const path = profile.path === '/' ? '/' : profile.path.replace(/\/+$/, '');
    if (!localizedRoutes.has(path)) return [entry];
    const { 'x-default': _default, ...languages } = languageAlternates(path);
    return [
      { ...entry, alternates: { languages } },
      ...ROUTE_LANGS.map((lang) => ({ ...entry, url: languages[lang === 'pt' ? 'pt-BR' : lang], alternates: { languages } })),
    ];
  });
}
