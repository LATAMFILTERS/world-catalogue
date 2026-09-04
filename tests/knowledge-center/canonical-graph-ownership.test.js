const fs = require('fs');

const graph = fs.readFileSync(
  'frontend/src/lib/knowledge-center/recommendation-graph.ts',
  'utf8',
);
const navigation = fs.readFileSync(
  'frontend/src/lib/knowledge-center/navigation-index.ts',
  'utf8',
);

describe('Knowledge Center canonical graph ownership', () => {
  test('recommendation graph excludes consolidated Engineering aliases as article nodes', () => {
    expect(graph).toContain('isConsolidatedEngineeringTopic');
    expect(graph).toContain('canonicalArticleTarget');
    expect(graph).toContain('addArticleRelationship');
  });

  test('Cabin and Compressed Air normalize into Air Intake Protection', () => {
    expect(graph).toContain("'Cabin Air Protection':        'air-intake-protection'");
    expect(graph).toContain("'Compressed Air Protection':   'air-intake-protection'");
    expect(graph).toContain("'cabin-air-protection':        'air-intake-protection'");
    expect(graph).toContain("'compressed-air-protection':   'air-intake-protection'");

    expect(navigation).toContain("'Cabin Air Protection': 'air-intake-protection'");
    expect(navigation).toContain("'Compressed Air Protection': 'air-intake-protection'");
    expect(navigation).toContain("'cabin-air-protection': 'air-intake-protection'");
    expect(navigation).toContain("'compressed-air-protection': 'air-intake-protection'");
  });

  test('navigation metadata derives counts from canonical registries', () => {
    expect(navigation).toContain('articles: CANONICAL_ARTICLES.length');
    expect(navigation).toContain('technologies: KC_TECHNOLOGIES.length');
    expect(navigation).toContain('systems: KC_SYSTEMS.length');
    expect(navigation).toContain('industries: KC_INDUSTRIES.length');
  });

  test('navigation excludes consolidated articles from first-class article maps', () => {
    expect(navigation).toContain('const CANONICAL_ARTICLES = ENGINEERING_ARTICLES.filter(');
    expect(navigation).toContain('new Map(CANONICAL_ARTICLES.map((a) => [a.slug, a]))');
    expect(navigation).toContain('canonicalArticleSlugs(entry.relatedArticles ?? [])');
  });
});
