'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/^\uFEFF/, '');
}

test('dynamic industry routes no longer contain the legacy quantitative GEO dataset', () => {
  const source = read('frontend/src/app/industries/[slug]/page.tsx');

  assert.doesNotMatch(source, /industryGeoData/);
  assert.doesNotMatch(source, /500,000\+/);
  assert.doesNotMatch(source, /\bppm\b/i);
  assert.doesNotMatch(source, /\bbar\b/i);
  assert.doesNotMatch(source, /HEPA-grade/i);
  assert.doesNotMatch(source, /\$\d/);
  assert.doesNotMatch(source, /ISO 4406 cleanliness target/i);
  assert.doesNotMatch(source, /service intervals? of \d/i);
});

test('dynamic industry routes isolate public copy from legacy catalogue benefits and stats', () => {
  const source = read('frontend/src/app/industries/[slug]/page.tsx');

  assert.match(source, /const governedItem = \{/);
  assert.match(source, /stats: \{\}/);
  assert.match(source, /Application-specific contamination assessment/);
  assert.match(source, /documented application evidence/);
  assert.match(source, /item=\{governedItem\}/);
});

test('dynamic industry metadata and schema use canonical trailing-slash URLs and ELIMFILTERS identity', () => {
  const source = read('frontend/src/app/industries/[slug]/page.tsx');

  assert.match(source, /const url = `\$\{BASE_URL\}\/industries\/\$\{params\.slug\}\/`/);
  assert.match(source, /siteName: 'ELIMFILTERS'/);
  assert.match(source, /publisher: \{ '@id': `\$\{BASE_URL\}\/#organization` \}/);
  assert.doesNotMatch(source, /ELIMFILTERS World Catalogue/);
  assert.doesNotMatch(source, /languages:\s*\{/);
});
