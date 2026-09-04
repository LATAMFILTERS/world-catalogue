const fs = require('fs');
const path = require('path');

describe('Citation validation covers all ten canonical technologies', () => {
  const canonicalPath = path.join(process.cwd(), 'scripts/validate-canonical-citation-index.mjs');
  const apiPath = path.join(process.cwd(), 'scripts/validate-citation-api-output.mjs');
  const canonical = fs.readFileSync(canonicalPath, 'utf8');
  const api = fs.readFileSync(apiPath, 'utf8');

  test('TURBOCORE is mandatory in the canonical citation index', () => {
    expect(canonical).toContain("['TURBOCORE', 'turbocore']");
  });

  test('TURBOCORE is mandatory in the generated citation API', () => {
    expect(api).toContain("['TURBOCORE', 'turbocore']");
  });

  test('both validators retain the other nine canonical technologies', () => {
    const keys = ['MACROCORE', 'MICROKAPPA', 'DRYCORE', 'INTEKCORE', 'SYNTAPORE', 'HYDROCORE', 'SYNTRAX', 'NANOFORCE', 'THERMACORE'];
    for (const key of keys) {
      expect(canonical).toContain(`['${key}'`);
      expect(api).toContain(`['${key}'`);
    }
  });
});
