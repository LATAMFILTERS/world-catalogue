'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(
  path.join(root, 'frontend/src/app/knowledge-center/problems/[slug]/page.tsx'),
  'utf8',
).replace(/^\uFEFF/, '');

test('published Problem pages use governed content metadata instead of placeholder language', () => {
  assert.match(page, /problem\.metaDescription/);
  assert.match(page, /Filtration Failure Analysis/);
  assert.doesNotMatch(page, /scheduled for Phase 3/);
});

test('Problem pages index only when approved content is actually present', () => {
  assert.match(page, /problem\.metaDescription && problem\.definition && problem\.sections\?\.length/);
  assert.match(page, /index: shouldIndex/);
});

test('silicon dust alias remains consolidated to the canonical engineering page', () => {
  assert.match(page, /slug === 'silicon-dust-ingestion'/);
  assert.match(page, /https:\/\/elimfilters\.com\/engineering\/dust-ingestion\//);
});
