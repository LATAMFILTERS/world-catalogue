const fs = require('fs');

const page = fs.readFileSync('frontend/src/app/families/[slug]/page.tsx', 'utf8');

describe('TURBOCORE family guidance', () => {
  test('fuel-turbine receives protected components and selection questions', () => {
    expect(page).toContain("turbocore: ['FH/FG turbine housing'");
    expect(page).toContain("'fuel-turbine': ['Which approved FH or FG housing is installed?'");
  });

  test('TURBOCORE has turbine-specific service discipline', () => {
    expect(page).toContain('Service the FH/FG housing and dedicated element as one approved turbine-specific architecture.');
    expect(page).toContain('Do not substitute standard non-turbine separator elements solely by dimensions or appearance.');
  });

  test('ISO 16332 resolves to its canonical standard page', () => {
    expect(page).toContain("if (key.includes('iso 16332')) return '/knowledge-center/standards/iso-16332/';");
  });
});
