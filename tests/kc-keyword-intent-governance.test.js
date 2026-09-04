const fs = require('fs');
const path = require('path');

describe('AnswerThePublic keyword intent governance', () => {
  const researchPath = path.join(process.cwd(), 'frontend/src/lib/knowledge-center/keyword-intent-governance.ts');
  const canonicalPath = path.join(process.cwd(), 'frontend/src/lib/knowledge-center/canonical-keyword-intent-governance.ts');
  const barrelPath = path.join(process.cwd(), 'frontend/src/lib/knowledge-center/index.ts');

  const research = fs.readFileSync(researchPath, 'utf8');
  const canonical = fs.readFileSync(canonicalPath, 'utf8');
  const barrel = fs.readFileSync(barrelPath, 'utf8');

  test('contains exactly the 30 researched keyword demand signals', () => {
    const keywords = [...research.matchAll(/keyword: '([^']+)'/g)].map((match) => match[1]);
    expect(keywords).toHaveLength(30);
    expect(new Set(keywords).size).toBe(30);
  });

  test('governs keywords as demand signals rather than automatic pages', () => {
    expect(canonical).toContain('keywordIsNotPage: true');
    expect(canonical).toContain('singleIntentOwner: true');
    expect(canonical).toContain('noAutomaticIndexableRouteCreation: true');
  });

  test('keeps ISO demand on canonical Standards owners', () => {
    expect(research).toContain("keyword: 'iso 5011 air filter'");
    expect(research).toContain("ownerPath: '/knowledge-center/standards/iso-5011/'");
    expect(research).toContain("keyword: 'iso 16889 filter standard'");
    expect(research).toContain("ownerPath: '/knowledge-center/standards/iso-16889/'");
    expect(research).toContain("keyword: 'filtration cleanliness codes'");
    expect(research).toContain("ownerPath: '/knowledge-center/standards/iso-4406/'");
  });

  test('keeps distributor intent on the commercial conversion owner', () => {
    for (const keyword of ['filtration distributor program', 'industrial filter reseller', 'aftermarket filter dealer']) {
      const start = research.indexOf(`keyword: '${keyword}'`);
      const window = research.slice(start, start + 650);
      expect(window).toContain("ownerKind: 'commercial'");
      expect(window).toContain("ownerPath: '/distributor-application/'");
    }
  });

  test('comparison queries remain governed gaps until a dedicated comparison owner exists', () => {
    for (const keyword of ['diesel filter comparison', 'oem vs aftermarket oil filter', 'aftermarket filter quality']) {
      const start = research.indexOf(`keyword: '${keyword}'`);
      const window = research.slice(start, start + 850);
      expect(window).toContain("ownerKind: 'comparison'");
      expect(window).toContain("publishingState: 'owner-gap-review'");
      expect(window).not.toContain("allowedSurfaces: ['metadata', 'body'");
    }
    expect(canonical).toContain('comparisonQueriesStayOutOfEngineeringMetadata: true');
  });

  test('maps internal failure relation names to real public Problem owners', () => {
    expect(canonical).toContain("'diesel fuel water contamination':");
    expect(canonical).toContain("ownerPath: '/knowledge-center/problems/water-ingress/'");
    expect(canonical).toContain("'fuel system contamination':");
    expect(canonical).toContain("ownerPath: '/knowledge-center/problems/fuel-contamination/'");
    expect(canonical).toContain("'engine wear causes':");
    expect(canonical).toContain("ownerPath: '/knowledge-center/problems/abrasive-wear/'");
    expect(canonical).not.toContain("ownerPath: '/knowledge-center/problems/diesel-water/'");
    expect(canonical).not.toContain("ownerPath: '/knowledge-center/problems/particle-wear/'");
  });

  test('uses the Air Intake system as owner for broad industrial air filtration intent', () => {
    expect(canonical).toContain("'industrial air filtration':");
    expect(canonical).toContain("ownerKind: 'system'");
    expect(canonical).toContain("ownerPath: '/knowledge-center/systems/air-intake-protection/'");
  });

  test('exports the canonical keyword governance contract', () => {
    expect(barrel).toContain("from './canonical-keyword-intent-governance'");
    expect(barrel).toContain('ANSWER_THE_PUBLIC_KEYWORD_NODES');
    expect(barrel).toContain('KEYWORD_OWNER_GAPS');
  });
});
