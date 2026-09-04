const fs = require('fs');

const page = fs.readFileSync('frontend/src/app/families/[slug]/page.tsx', 'utf8');

describe('family standard routing', () => {
  const governedRoutes = {
    'astm d6304': '/knowledge-center/standards/astm-d6304/',
    'iso 12937': '/knowledge-center/standards/iso-12937/',
    'nfpa t2.14': '/knowledge-center/standards/nfpa-t2-14/',
    'din 51524': '/knowledge-center/standards/din-51524/',
    'iso 11155-1': '/knowledge-center/standards/iso-11155-1/',
    'iso 8573-1': '/knowledge-center/standards/iso-8573-1/',
    'iso 16332': '/knowledge-center/standards/iso-16332/',
  };

  test('governed family standards route to their canonical entity pages', () => {
    for (const [key, route] of Object.entries(governedRoutes)) {
      expect(page).toContain(`if (key.includes('${key}')) return '${route}';`);
    }
  });

  test('ASTM D6210 is not assigned an invented canonical route', () => {
    expect(page).not.toContain("astm-d6210/");
  });
});
