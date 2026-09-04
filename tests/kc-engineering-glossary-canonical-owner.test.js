const fs = require('fs');
const path = require('path');

describe('Engineering Reference glossary canonical ownership', () => {
  const validatorPath = path.join(process.cwd(), 'scripts/validate-kc-canonical-overlap.mjs');
  const validator = fs.readFileSync(validatorPath, 'utf8');

  test('accepts the canonical Glossary hub as the explicit owner', () => {
    expect(validator).toContain("'engineering-reference/engineering-glossary'");
    expect(validator).toContain("'https://elimfilters.com/knowledge-center/glossary/'");
  });

  test('keeps dynamic routes self-canonical by default', () => {
    expect(validator).toContain('intentionalCanonicalOwners.get(routeKey)');
    expect(validator).toContain('`https://elimfilters.com/knowledge-center/${family}/${entry.name}/`');
  });

  test('does not introduce a blanket engineering-reference canonical override', () => {
    expect(validator).not.toContain("['engineering-reference', 'https://elimfilters.com/knowledge-center/glossary/']");
  });
});
