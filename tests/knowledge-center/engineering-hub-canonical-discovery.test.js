const fs = require('fs');

const hub = fs.readFileSync(
  'frontend/src/app/knowledge-center/engineering/page.tsx',
  'utf8',
);

const ownership = fs.readFileSync(
  'frontend/src/lib/knowledge-center/canonical-article-ownership.ts',
  'utf8',
);

describe('Engineering hub canonical discovery', () => {
  test('hub filters consolidated engineering topics through the canonical ownership helper', () => {
    expect(hub).toContain("isConsolidatedEngineeringTopic");
    expect(hub).toContain("canonicalEngineeringArticles");
    expect(hub).toContain("!isConsolidatedEngineeringTopic(article.slug)");
  });

  test('hub uses canonical article collection for cards and JSON-LD', () => {
    expect(hub).toContain("canonicalEngineeringArticles.map((article, i)");
    expect(hub).toContain("...canonicalEngineeringArticles.map((a) => ({");
    expect(hub).toContain("url: `https://elimfilters.com/knowledge-center/engineering/${a.slug}/`");
  });

  test('known consolidated topics remain governed centrally', () => {
    expect(ownership).toContain("'iso-16889'");
    expect(ownership).toContain("'iso-4406'");
    expect(ownership).toContain("'filter-media-science'");
  });
});
