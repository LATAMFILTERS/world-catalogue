const fs = require('fs');

const source = fs.readFileSync('frontend/src/lib/knowledge-center-data/canonical-diagram-registry.ts', 'utf8');

describe('canonical public engineering diagrams', () => {
  test('cabin standard and compressed-air system ownership are canonical', () => {
    expect(source).toContain("'STD-ISO-11155': 'STD-ISO-11155-1'");
    expect(source).toContain("applicableSystems: ['air-intake-protection']");
    expect(source).toContain('DRYCORE™ remains an Air Intake & Airflow Protection function');
  });

  test('legacy universal engineering values are not repeated in the canonical layer', () => {
    expect(source).not.toContain('30–60%');
    expect(source).not.toContain('1.5–3.5 bar');
    expect(source).not.toContain('Class 1.1.1');
    expect(source).not.toContain('≤−40°C');
    expect(source).not.toContain('≤6µm filtration efficiency');
  });

  test('fuel diagram preserves HYDROCORE and TURBOCORE responsibility boundaries', () => {
    expect(source).toContain('HYDROCORE™ governs approved standard non-turbine fuel/water separators');
    expect(source).toContain('FH/FG turbine-style systems are governed separately by TURBOCORE™');
  });
});
