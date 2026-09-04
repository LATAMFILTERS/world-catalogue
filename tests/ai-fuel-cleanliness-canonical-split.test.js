const fs = require('fs');

const intelligence = fs.readFileSync('frontend/src/lib/enterprise-content-intelligence.ts', 'utf8');

describe('AI/GEO Fuel Cleanliness canonical split', () => {
  test('Fuel Cleanliness retrieval includes all three canonical technologies', () => {
    expect(intelligence).toContain("'technology:syntapore', 'technology:hydrocore', 'technology:turbocore'");
    expect(intelligence).toContain("'family:fuel-turbine'");
    expect(intelligence).toContain("answer: 'SYNTAPORE™, HYDROCORE™, and TURBOCORE™.'");
  });

  test('HYDROCORE is restricted to standard non-turbine separators', () => {
    expect(intelligence).toContain('HYDROCORE™ governs standard non-turbine spin-on and cartridge fuel/water separator applications');
    expect(intelligence).not.toContain('HYDROCORE™ provides fuel/water separation across standard spin-on/cartridge separator applications and approved Turbine Series FH/FG');
  });

  test('TURBOCORE owns FH/FG and dedicated replacement configurations', () => {
    expect(intelligence).toContain('TURBOCORE™ governs applicable FH/FG turbine-style fuel/water separation housings');
    expect(intelligence).toContain('2010, 2020, and 2040-series replacement configurations');
  });
});
