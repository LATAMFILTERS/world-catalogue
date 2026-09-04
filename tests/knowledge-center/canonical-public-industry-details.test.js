const fs = require('fs');

const registry = fs.readFileSync('frontend/src/lib/knowledge-center-data/canonical-industries-registry.ts', 'utf8');
const details = fs.readFileSync('frontend/src/lib/knowledge-center-data/canonical-industry-details.ts', 'utf8');

describe('canonical public industry ontology and evidence boundaries', () => {
  test('commercial truck fleet uses the canonical trucks-fleets slug and current names', () => {
    expect(registry).toContain("'truck-fleets': 'trucks-fleets'");
    expect(registry).toContain("title: 'Commercial Truck Fleets'");
    expect(registry).toContain("title: 'Waste & Municipal Fleets'");
    expect(details).toContain("'truck-fleets': 'trucks-fleets'");
    expect(details).toContain("'trucks-fleets': {");
  });

  test('marine public detail does not claim blanket IMO certification', () => {
    expect(details).toContain("{ label: 'MARINECLEAN™', value: 'Specialized marine solution' }");
    expect(details).toContain('Any certification or compliance claim requires verified product- and application-specific evidence');
    expect(details).not.toContain('IMO-certified ecosystem');
  });

  test('public industry service guidance is application-specific', () => {
    expect(details).toContain('Mining service intervals must be set from measured restriction');
    expect(details).toContain('Agricultural service must be based on actual restriction');
    expect(details).toContain('Fleet intervals must be established from the validated engine and vehicle application');
    expect(details).toContain('Manufacturing maintenance intervals should follow machine condition');
    expect(details).toContain('Rail service intervals should follow route environment');
  });

  test('legacy universal performance examples are not reproduced in the canonical layer', () => {
    expect(details).not.toContain('3–5× primary element');
    expect(details).not.toContain('ISO 8573-1 Class 1:4:1');
    expect(details).not.toContain('50–100 hrs');
    expect(details).not.toContain('60,000–150,000 km');
    expect(details).not.toContain('250+ bar');
  });
});
