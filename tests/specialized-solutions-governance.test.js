'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/^\uFEFF/, '');
}

test('DURATECH exposes only the governed On-Road interval claim', () => {
  const source = read('frontend/src/app/commercial-lines/duratech/page.tsx');
  assert.match(source, /15,000 KM/);
  assert.match(source, /applicable On-Road trucks and commercial vehicles/i);
  assert.match(source, /must not be generalized/i);
  assert.doesNotMatch(source, /OEM-MATCHED/i);
  assert.doesNotMatch(source, /sub-4µm/i);
  assert.doesNotMatch(source, /ISO 4406 cleanliness target/i);
});

test('MARINECLEAN remains a specialized marine solution without unsupported certification or construction claims', () => {
  const source = read('frontend/src/app/commercial-lines/marineclean/page.tsx');
  assert.match(source, /specialized marine asset-protection solution/i);
  assert.match(source, /application-specific/i);
  assert.doesNotMatch(source, /IMO/i);
  assert.doesNotMatch(source, /epoxy/i);
  assert.doesNotMatch(source, /brine rejection/i);
  assert.doesNotMatch(source, /galvanic shield/i);
  assert.doesNotMatch(source, /500-800/i);
});

test('specialized solutions do not expand the canonical core taxonomy', () => {
  const source = read('frontend/src/app/commercial-lines/page.tsx');
  assert.match(source, /9 core technologies\. 5 core systems\. 2 specialized solutions\./);
  assert.match(source, /do not replace or expand the canonical core taxonomy/i);
});

test('specialized-solution metadata stays evidence-neutral and correctly classified', () => {
  const hub = read('frontend/src/app/commercial-lines/layout.tsx');
  const duratech = read('frontend/src/app/commercial-lines/duratech/layout.tsx');
  const marineclean = read('frontend/src/app/commercial-lines/marineclean/layout.tsx');

  assert.doesNotMatch(hub, /IMO certified/i);
  assert.doesNotMatch(hub, /salt resistant/i);
  assert.doesNotMatch(hub, /@elimfilters/i);
  assert.match(hub, /siteName: 'ELIMFILTERS'/);

  assert.match(duratech, /Integrated Filter Kit Program/);
  assert.match(duratech, /not a filtration technology/i);
  assert.doesNotMatch(duratech, /OEM-interchangeable/i);

  assert.match(marineclean, /Specialized Marine Filtration Solution/);
  assert.match(marineclean, /not a filtration technology/i);
  assert.doesNotMatch(marineclean, /IMO certified/i);
  assert.doesNotMatch(marineclean, /epoxy/i);
  assert.doesNotMatch(marineclean, /brine rejection/i);
});

test('SEO and GEO discovery surfaces classify DURATECH and MARINECLEAN outside technologies', () => {
  const sitemap = read('frontend/public/sitemap.xml');
  const aiSitemap = read('frontend/public/sitemap-ai.xml');
  const llm = read('frontend/public/llm.txt');
  const llms = read('frontend/public/llms.txt');
  const brand = read('docs/brand/BRAND_ARCHITECTURE.md');

  for (const source of [sitemap, aiSitemap]) {
    assert.match(source, /commercial-lines\/duratech\//);
    assert.match(source, /commercial-lines\/marineclean\//);
    assert.doesNotMatch(source, /technologies\/duratech/i);
    assert.doesNotMatch(source, /technologies\/marineclean/i);
  }

  for (const source of [llm, llms, brand]) {
    assert.match(source, /DURATECH/i);
    assert.match(source, /MARINECLEAN/i);
    assert.match(source, /not a technology/i);
  }
});

test('legacy knowledge entities cannot classify specialized solutions as technologies', () => {
  assert.equal(fs.existsSync(path.join(root, 'knowledge/entities/technologies/duratech.md')), false);
  assert.equal(fs.existsSync(path.join(root, 'knowledge/entities/technologies/marineclean.md')), false);
});
