const fs = require('fs');

const systems = fs.readFileSync('frontend/src/lib/protection-systems-data.ts', 'utf8');

describe('Fuel Cleanliness technology responsibility split', () => {
  test('Fuel Cleanliness assigns distinct canonical responsibilities', () => {
    expect(systems).toContain('SYNTAPORE™ controls particulate contamination.');
    expect(systems).toContain('HYDROCORE™ governs standard non-turbine spin-on and cartridge fuel/water separator applications');
    expect(systems).toContain('TURBOCORE™ governs applicable FH/FG turbine-style fuel/water separation housings');
    expect(systems).toContain('dedicated 2010/2020/2040-series replacement configurations');
  });

  test('legacy HYDROCORE turbine ownership wording cannot return', () => {
    expect(systems).not.toContain('HYDROCORE™ provides fuel/water separation across standard spin-on/cartridge separators and Turbine Series FH/FG');
  });
});
