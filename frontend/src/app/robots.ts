import type { MetadataRoute } from 'next';

const BASE_URL = 'https://elimfilters.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/search?',
        ],
      },
    ],
    sitemap: [
      `${BASE_URL}/sitemap.xml`,
      `${BASE_URL}/video-sitemap.xml`,
    ],
    host: BASE_URL,
  };
}
