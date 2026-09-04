const fs = require('fs');
const path = require('path');

describe('Public comparison relationship hygiene', () => {
  const registryPath = path.join(process.cwd(), 'frontend/src/lib/knowledge-center-data/canonical-public-comparisons-registry.ts');
  const indexPath = path.join(process.cwd(), 'frontend/src/lib/knowledge-center-data/index.ts');
  const registry = fs.readFileSync(registryPath, 'utf8');
  const index = fs.readFileSync(indexPath, 'utf8');

  test('removes retired NFPA T2.14 from all public standard relationships', () => {
    expect(registry).toContain('governingStandards: comparison.governingStandards.filter');
    expect(registry).toContain('relatedStandards: comparison.relatedStandards.filter');
    expect(registry).toContain('isRetiredNfpaStandard');
  });

  test('removes consolidated Engineering aliases from all comparison article relationships', () => {
    expect(registry).toContain('isConsolidatedEngineeringTopic');
    expect(registry).toContain('relatedArticles: comparison.relatedArticles.filter');
  });

  test('keeps relationship sanitization out of the historical comparison registry', () => {
    expect(registry).toContain("from './canonical-comparisons-registry'");
    expect(index).toContain("from './canonical-public-comparisons-registry'");
  });
});
