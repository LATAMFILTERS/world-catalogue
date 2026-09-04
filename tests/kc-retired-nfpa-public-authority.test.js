const fs = require('fs');

const publicStandards = fs.readFileSync('frontend/src/lib/knowledge-center-data/canonical-public-standards-registry.ts', 'utf8');
const publicArticles = fs.readFileSync('frontend/src/lib/knowledge-center-data/canonical-public-articles-registry.ts', 'utf8');
const standardIds = fs.readFileSync('frontend/src/lib/knowledge-center-data/canonical-standard-ids.ts', 'utf8');
const articleIds = fs.readFileSync('frontend/src/lib/knowledge-center-data/canonical-article-ids.ts', 'utf8');
const barrel = fs.readFileSync('frontend/src/lib/knowledge-center-data/index.ts', 'utf8');
const relationships = fs.readFileSync('frontend/src/lib/canonical-relationships.ts', 'utf8');

describe('retired NFPA T2.14 public authority', () => {
  test('NFPA standard is excluded from the public standards registry', () => {
    expect(publicStandards).toContain("'nfpa-t2-14'");
    expect(barrel).toContain("export { KC_STANDARDS } from './canonical-public-standards-registry';");
  });

  test('NFPA engineering article is excluded from the public engineering registry', () => {
    expect(publicArticles).toContain("'nfpa-t2-14-hydraulic-cleanliness'");
    expect(barrel).toContain("export { ENGINEERING_ARTICLES } from './canonical-public-articles-registry';");
  });

  test('retired NFPA entities are not exposed by public ID helpers', () => {
    expect(standardIds).toContain("['nfpa-t2-14']: _retiredNfpaStandard");
    expect(articleIds).toContain("['nfpa-t2-14-hydraulic-cleanliness']: _retiredNfpaArticle");
  });

  test('ISO 2941 remains the canonical hydraulic structural-pressure owner', () => {
    expect(relationships).toContain("'ISO 2941'");
    expect(relationships).toContain("'iso-2941'");
    expect(relationships).not.toContain("standards: ['ISO 16889', 'ISO 4406', 'NFPA T2.14'");
  });
});
