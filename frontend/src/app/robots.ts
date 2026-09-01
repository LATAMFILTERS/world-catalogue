import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const BASE_URL = 'https://elimfilters.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/api/citation/',
          '/llm.txt',
          '/llms.txt',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/search?',
        ],
      },
    ],
    sitemap: [
      `${BASE_URL}/sitemap-index.xml`,
      `${BASE_URL}/sitemap.xml`,
      `${BASE_URL}/sitemap-ai.xml`,
      `${BASE_URL}/video-sitemap.xml`,
    ],
    host: BASE_URL,
  };
}
