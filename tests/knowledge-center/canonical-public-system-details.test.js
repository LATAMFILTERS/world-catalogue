const fs = require('fs');

const details = fs.readFileSync('frontend/src/lib/knowledge-center-data/canonical-system-details.ts', 'utf8');
const systems = fs.readFileSync('frontend/src/lib/knowledge-center-data/canonical-systems-registry.ts', 'utf8');
const barrel = fs.readFileSync('frontend/src/lib/knowledge-center-data/index.ts', 'utf8');

describe('canonical public system details', () => {
  test('Fuel Cleanliness public detail uses three-technology architecture', () => {
    expect(details).toContain('Three-Technology Fuel Cleanliness Architecture');
    expect(details).toContain('SYNTAPORE™ controls particulate contamination');
    expect(details).toContain('HYDROCORE™ is restricted to approved standard non-turbine');
    expect(details).toContain('TURBOCORE™ is reserved for applicable FH/FG turbine-style');
    expect(details).not.toContain('Two-Stage Protection Strategy');
  });

  test('Air Intake public detail integrates cabin and compressed-air functions', () => {
    expect(details).toContain('One Airflow Protection System, Multiple Functions');
    expect(details).toContain('Cabin Air Is a Function, Not a Separate Protection System');
    expect(details).toContain('Compressed-Air Drying Function');
  });

  test('Air Intake uses ISO 11155-1 in public system registry', () => {
    expect(systems).toContain("standards: ['ISO 5011', 'ISO 11155-1', 'DIN 71460', 'ISO 8573-1']");
  });

  test('barrel exposes canonical detail layer to public routes', () => {
    expect(barrel).toContain("export { KC_SYSTEM_DETAILS } from './canonical-system-details';");
  });
});
