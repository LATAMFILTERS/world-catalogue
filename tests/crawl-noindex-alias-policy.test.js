const fs = require('fs');

const crawl = fs.readFileSync('frontend/src/lib/crawl-optimization.ts', 'utf8');

describe('crawl policy for canonical aliases', () => {
  test('semantic and Engineering aliases are prohibited from sitemap discovery', () => {
    for (const route of [
      '/knowledge-center/standards/iso-11155',
      '/knowledge-center/engineering/iso-16889',
      '/knowledge-center/engineering/iso-4406',
      '/knowledge-center/engineering/filter-media-science',
      '/knowledge-center/engineering-reference/engineering-glossary',
    ]) {
      expect(crawl).toContain(`'${route}'`);
    }
  });

  test('validation checks prohibited public routes against sitemap output', () => {
    expect(crawl).toContain('const noindexUrlsInSitemap = NOINDEX_PUBLIC_ROUTES');
    expect(crawl).toContain('noindexUrlsInSitemap.length === 0');
  });
});
