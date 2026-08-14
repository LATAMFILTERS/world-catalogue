'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/^\uFEFF/, '');
}

test('global layout does not emit unverified aggregate rating schema', () => {
  const layout = read('frontend/src/app/layout.tsx');
  assert.doesNotMatch(layout, /AggregateRatingSchema/);
  assert.doesNotMatch(layout, /aggregateRating/);
});

test('unverified ratings metadata sources are absent from active frontend code', () => {
  assert.equal(fs.existsSync(path.join(root, 'frontend/src/lib/ratings-metadata.ts')), false);
  assert.equal(fs.existsSync(path.join(root, 'frontend/src/components/AggregateRatingSchema.tsx')), false);
});
