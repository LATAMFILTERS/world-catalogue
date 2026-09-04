const fs = require('fs');
const path = require('path');

describe('Canonical public comparison semantics', () => {
  const comparisonPath = path.join(process.cwd(), 'frontend/src/lib/knowledge-center-data/canonical-comparisons-registry.ts');
  const indexPath = path.join(process.cwd(), 'frontend/src/lib/knowledge-center-data/index.ts');
  const keywordPath = path.join(process.cwd(), 'frontend/src/lib/knowledge-center/canonical-keyword-intent-governance.ts');

  const comparisons = fs.readFileSync(comparisonPath, 'utf8');
  const index = fs.readFileSync(indexPath, 'utf8');
  const keywords = fs.readFileSync(keywordPath, 'utf8');

  test('routes public comparison consumers through the canonical layer', () => {
    expect(index).toContain("from './canonical-comparisons-registry'");
  });

  test('removes retired NFPA T2.14 authority from the ISO 4406 comparison output', () => {
    expect(comparisons).toContain('stripRetiredNfpa');
    expect(comparisons).toContain("comparison.slug === 'iso4406-vs-nas1638'");
  });

  test('treats SAE J726 only as withdrawn legacy context', () => {
    expect(comparisons).toContain('ISO 5011 vs. Legacy SAE J726 Air Cleaner Test Reference');
    expect(comparisons).toContain('canceled on 27 June 2002');
    expect(comparisons).toContain('Canceled document; not a current ELIMFILTERS governing standard');
    expect(comparisons).toContain('Do not present SAE J726 as a current equivalent or alternative governing standard to ISO 5011.');
  });

  test('does not use ISO 3724 as an air-filter service-interval authority', () => {
    expect(comparisons).toContain('Do not use ISO 3724 as an air-filter service-interval authority');
    expect(comparisons).toContain('it belongs to hydraulic filter-element fatigue testing');
  });

  test('removes universal diesel architecture mandates from the public fuel comparison', () => {
    expect(comparisons).toContain('It does not establish a universal stage count, rail-pressure threshold, micron rating, service interval, cost outcome or OEM mandate.');
    expect(comparisons).toContain('Do not describe ISO 16332 as mandating a three-stage architecture');
    expect(comparisons).toContain('Cost and service-life outcomes require application-specific evidence');
    expect(comparisons).toContain("relatedTechnologies: ['SYNTAPORE', 'HYDROCORE', 'TURBOCORE']");
  });

  test('assigns diesel filter comparison to the governed existing comparison owner', () => {
    const start = keywords.indexOf("'diesel filter comparison':");
    const window = keywords.slice(start, start + 700);
    expect(window).toContain("ownerKind: 'comparison'");
    expect(window).toContain("ownerPath: '/knowledge-center/comparisons/single-stage-vs-multi-stage-fuel/'");
    expect(window).toContain("publishingState: 'reinforce-existing'");
  });

  test('keeps OEM vs aftermarket comparison queries as unresolved governed gaps', () => {
    expect(keywords).not.toContain("'oem vs aftermarket oil filter': {");
    expect(keywords).not.toContain("'aftermarket filter quality': {");
  });
});
