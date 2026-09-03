'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8').replace(/^\uFEFF/, '');

test('Knowledge Center industry hub distinguishes 12 markets from 10 mature technical profiles', () => {
  const page = read('frontend/src/app/knowledge-center/industries/page.tsx');

  assert.match(page, /serves 12 operating markets/);
  assert.match(page, /publishes 10 evidence-backed technical industry profiles/);
  assert.match(page, /Bus &amp; Coach and Automotive &amp; Light Duty remain part of the canonical 12-market portfolio/);
  assert.match(page, /Ten evidence-backed technical industry profiles within the canonical ELIMFILTERS portfolio of 12 operating markets/);
  assert.doesNotMatch(page, /8 industrial verticals/);
});

test('Knowledge Center industry hub keeps thin-market routes on commercial guides', () => {
  const page = read('frontend/src/app/knowledge-center/industries/page.tsx');

  assert.match(page, /href="\/industries\/bus-coach\/"/);
  assert.match(page, /href="\/industries\/automotive\/"/);
  assert.doesNotMatch(page, /knowledge-center\/industries\/bus-coach/);
  assert.doesNotMatch(page, /knowledge-center\/industries\/automotive/);
});

test('Knowledge Center industry hub uses canonical trailing-slash URLs', () => {
  const page = read('frontend/src/app/knowledge-center/industries/page.tsx');

  assert.match(page, /href={`\/knowledge-center\/industries\/\$\{industry\.slug\}\/`}/);
  assert.match(page, /url: 'https:\/\/elimfilters\.com\/knowledge-center\/industries\/'/);
});
