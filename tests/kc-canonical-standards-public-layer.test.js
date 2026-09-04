const fs = require('fs');

const registry = fs.readFileSync('frontend/src/lib/knowledge-center-data/canonical-standards-registry.ts', 'utf8');
const barrel = fs.readFileSync('frontend/src/lib/knowledge-center-data/index.ts', 'utf8');

describe('canonical public standards layer', () => {
  test('public barrel exports canonical standards', () => {
    expect(barrel).toContain("export { KC_STANDARDS } from './canonical-standards-registry';");
  });

  test('ISO 16889 stays a filter-element performance standard', () => {
    expect(registry).toContain("year: '2022 (3rd edition)'");
    expect(registry).toContain('It is a filter-element performance standard; it does not prescribe an in-service ISO 4406 cleanliness target');
    expect(registry).toContain("slug !== 'iso-16889'");
  });

  test('ISO 4406 stays a cleanliness coding standard rather than a universal target', () => {
    expect(registry).toContain("year: '2021 (4th edition; confirmed 2026)'");
    expect(registry).toContain('ISO 4406 does not prescribe one universal cleanliness target');
    expect(registry).toContain("slug !== 'iso-4406'");
  });

  test('ISO 16332 does not encode TURBOCORE family micron grade', () => {
    expect(registry).toContain("year: '2018 (1st edition; confirmed 2023)'");
    expect(registry).toContain('2010, 2020 and 2040 identify element families');
    expect(registry).toContain('2, 10 and 30 µm are separate filtration-grade choices');
  });

  test('legacy universal maintenance claims are not copied into canonical overrides', () => {
    expect(registry).not.toContain('quarterly or every 500 operating hours');
    expect(registry).not.toContain('every 250 hours');
    expect(registry).not.toContain('extends valve spool life by 3–5×');
    expect(registry).not.toContain('70–80% of hydraulic system failures');
  });
});
