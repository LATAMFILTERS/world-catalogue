const fs = require('fs');

const source = fs.readFileSync('frontend/src/lib/failure-knowledge.ts', 'utf8');

describe('diesel-water failure technology ownership', () => {
  test('standard and turbine separator architectures stay distinct', () => {
    expect(source).toContain('HYDROCORE™ for standard non-turbine separator applications');
    expect(source).toContain('TURBOCORE™ for applicable FH/FG turbine-style systems');
    expect(source).not.toContain('HYDROCORE™ Turbine FH/FG systems');
  });
});
