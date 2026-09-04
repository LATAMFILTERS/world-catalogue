const fs = require('fs');
const path = require('path');

describe('Hydraulic topology comparison governance', () => {
  const registryPath = path.join(process.cwd(), 'frontend/src/lib/knowledge-center-data/canonical-public-comparisons-registry.ts');
  const registry = fs.readFileSync(registryPath, 'utf8');

  test('makes online vs offline topology application-dependent', () => {
    expect(registry).toContain("comparison.slug !== 'online-vs-offline-hydraulic'");
    expect(registry).toContain('Neither topology is universally mandatory or sufficient by itself');
    expect(registry).toContain('Do not state that every hydraulic system must use online filtration');
    expect(registry).toContain('Do not state that a kidney loop automatically replaces in-circuit filtration');
  });

  test('does not turn ISO 4406 cleanliness codes into topology requirements', () => {
    expect(registry).toContain('ISO 4406 cleanliness codes describe fluid contamination levels; they do not prescribe one universal filtration topology.');
  });
});
