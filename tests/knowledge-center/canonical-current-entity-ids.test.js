const fs = require('fs');

const ids = fs.readFileSync('frontend/src/lib/knowledge-center-data/canonical-entity-ids.ts', 'utf8');
const barrel = fs.readFileSync('frontend/src/lib/knowledge-center-data/index.ts', 'utf8');

describe('current Knowledge Center entity IDs', () => {
  test('public technology IDs expose the ten canonical core technologies', () => {
    for (const slug of ['macrocore','microkappa','drycore','intekcore','syntapore','hydrocore','turbocore','syntrax','nanoforce','thermacore']) {
      expect(ids).toContain(`${slug}:`);
    }
    expect(ids).not.toContain('duratech:');
    expect(ids).not.toContain('marineclean:');
  });

  test('public system IDs expose five systems and no standalone cabin system', () => {
    expect(ids).toContain("'air-intake-protection'");
    expect(ids).toContain("'fuel-cleanliness-protection'");
    expect(ids).toContain("'lubrication-protection'");
    expect(ids).toContain("'hydraulic-protection'");
    expect(ids).toContain("'cooling-system-protection'");
    expect(ids).not.toContain("'cabin-air-protection'");
  });

  test('public industry IDs expose Automotive, Bus & Coach and canonical trucks slug', () => {
    expect(ids).toContain("'trucks-fleets': 'IND-TRUCK-FLEETS'");
    expect(ids).toContain("'bus-coach': 'IND-BUS-COACH'");
    expect(ids).toContain("automotive: 'IND-AUTOMOTIVE-LIGHT-DUTY'");
  });

  test('barrel exports Technology, System and Industry IDs from canonical layer', () => {
    expect(barrel).toContain("} from './canonical-entity-ids';");
    expect(barrel).toContain('TECHNOLOGY_IDS,');
    expect(barrel).toContain('SYSTEM_IDS,');
    expect(barrel).toContain('INDUSTRY_IDS,');
  });
});
