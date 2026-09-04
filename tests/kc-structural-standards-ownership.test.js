const fs = require('fs');

const structural = fs.readFileSync('frontend/src/lib/knowledge-center-data/canonical-structural-standards-registry.ts', 'utf8');
const ids = fs.readFileSync('frontend/src/lib/knowledge-center-data/canonical-standard-ids.ts', 'utf8');
const barrel = fs.readFileSync('frontend/src/lib/knowledge-center-data/index.ts', 'utf8');
const relationships = fs.readFileSync('frontend/src/lib/canonical-relationships.ts', 'utf8');

describe('hydraulic structural standard ownership', () => {
  test('ISO 3723 owns end-load and axial-load only', () => {
    expect(structural).toContain("year: '2015 (2nd edition; confirmed 2026)'");
    expect(structural).toContain('end-load rating');
    expect(structural).toContain('designated axial loading');
    expect(structural).toContain('ISO 3723 is not the collapse/burst pressure test');
  });

  test('ISO 2941 owns collapse/burst pressure verification', () => {
    expect(structural).toContain("slug: 'iso-2941'");
    expect(structural).toContain("entityId: 'STD-ISO-2941'");
    expect(structural).toContain('verification of the collapse/burst pressure rating');
    expect(structural).toContain("year: '2009 (2nd edition; confirmed 2025)'");
  });

  test('public standard IDs reserve a permanent ISO 2941 identifier', () => {
    expect(ids).toContain("'iso-2941': 'STD-ISO-2941'");
    expect(barrel).toContain("from './canonical-standard-ids';");
    expect(barrel).toContain("export { KC_STANDARDS } from './canonical-structural-standards-registry';");
  });

  test('hydraulic canonical relationships use ISO 2941 instead of NFPA T2.14', () => {
    expect(relationships).toContain("standards: ['ISO 16889', 'ISO 4406', 'ISO 2941', 'DIN 51524']");
    expect(relationships).toContain("standards: ['iso-4406', 'iso-16889', 'iso-2941', 'din-51524']");
    expect(relationships).not.toContain("'NFPA T2.14'");
    expect(relationships).not.toContain("'nfpa-t2-14'");
  });
});
