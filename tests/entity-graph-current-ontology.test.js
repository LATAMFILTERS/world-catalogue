const fs = require('fs');

const relationships = fs.readFileSync('frontend/src/lib/canonical-relationships.ts', 'utf8');
const entityGraph = fs.readFileSync('frontend/src/lib/entity-graph.ts', 'utf8');

describe('current entity graph ontology', () => {
  test('all twelve corporate industries exist independently of relationship coverage', () => {
    expect(entityGraph).toContain("automotive: 'Automotive & Light Duty'");
    expect(entityGraph).toContain("'bus-coach': 'Bus & Coach'");
    expect(entityGraph).toContain("'trucks-fleets': 'Commercial Truck Fleets'");
    expect(entityGraph).toContain('const industrySlugs = Object.keys(INDUSTRY_NAMES)');
  });

  test('Automotive participates in relevant canonical protection relationships', () => {
    const automotiveMentions = (relationships.match(/'automotive'/g) || []).length;
    expect(automotiveMentions).toBeGreaterThanOrEqual(3);
  });

  test('cabin filters use ISO 11155-1 as the canonical governed standard', () => {
    expect(relationships).toContain("'cabin-filters': { system: 'air-intake', technology: 'microkappa', standards: ['ISO 11155-1'] }");
    expect(relationships).not.toContain('EU Dir. 2019/130');
    expect(relationships).not.toContain("standards: ['ISO 11155',");
  });
});
