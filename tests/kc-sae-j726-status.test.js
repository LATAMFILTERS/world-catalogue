const fs = require('fs');

const registry = fs.readFileSync('frontend/src/lib/knowledge-center-data/canonical-standards-registry.ts', 'utf8');

describe('SAE J726 public status', () => {
  test('J726 is treated as canceled legacy guidance', () => {
    expect(registry).toContain("year: '2002 (canceled)'");
    expect(registry).toContain("revisionStatus: 'withdrawn'");
    expect(registry).toContain('Canceled by SAE in 2002');
  });

  test('J726 is not presented as an active ISO 5011 equivalent', () => {
    expect(registry).toContain('must not be presented as an active North American equivalent to ISO 5011');
    expect(registry).toContain('Historical SAE J726 data and ISO 5011 data should not be treated as automatically interchangeable');
  });

  test('legacy service-life claims are rejected in the public override', () => {
    expect(registry).toContain('Turning dust-capacity data into a universal field service interval');
    expect(registry).toContain('generic efficiency improvements, restriction thresholds or service-life multipliers');
  });
});
