const fs = require('fs');
const path = require('path');

describe('ISO 3724 comparison-domain governance', () => {
  const registryPath = path.join(process.cwd(), 'frontend/src/lib/knowledge-center-data/canonical-public-comparisons-registry.ts');
  const registry = fs.readFileSync(registryPath, 'utf8');

  test('removes ISO 3724 as governing authority from cellulose-vs-synthetic media selection', () => {
    expect(registry).toContain("comparison.slug !== 'cellulose-vs-synthetic-media' || !isIso3724(standard)");
  });

  test('does not retire ISO 3724 globally from valid hydraulic contexts', () => {
    expect(registry).not.toContain("relatedStandards: comparison.relatedStandards.filter((standard) => !isIso3724(standard))");
    expect(registry).not.toContain("governingStandards: comparison.governingStandards.filter((standard) => !isIso3724(standard))");
  });
});
