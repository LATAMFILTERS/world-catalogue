'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/^\uFEFF/, '');
}

test('canonical technology routes do not consume legacy claim-heavy detail data', () => {
  const source = read('frontend/src/app/technologies/[slug]/page.tsx');

  assert.doesNotMatch(source, /techPagesData/);
  assert.doesNotMatch(source, /TECH_PAGES/);
  assert.doesNotMatch(source, /TechDetailPage/);
  assert.doesNotMatch(source, /getItemBySlug\('technologies'/);

  assert.match(source, /getCanonicalTechnology/);
  assert.match(source, /getTechnologyEngineering/);
  assert.match(source, /engineering\.engineeringPrinciple/);
  assert.match(source, /engineering\.controlStrategy/);
  assert.match(source, /engineering\.operationalImpact/);
});

test('canonical technology routes do not publish unsupported quantitative marketing claims inline', () => {
  const source = read('frontend/src/app/technologies/[slug]/page.tsx');

  const forbidden = [
    /99\.9/i,
    /99\.98/i,
    /100%/i,
    /500,000\+/i,
    /25\+ years/i,
    /AI-engineered/i,
    /guaranteed/i,
    /testimonial/i,
    /ratingCount/i,
    /reviewCount/i,
  ];

  for (const pattern of forbidden) {
    assert.doesNotMatch(source, pattern);
  }
});
