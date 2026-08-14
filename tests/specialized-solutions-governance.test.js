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

test('specialized-solution metadata stays evidence-neutral', () => {
  const source = read('frontend/src/app/commercial-lines/layout.tsx');
  assert.doesNotMatch(source, /IMO certified/i);
  assert.doesNotMatch(source, /salt resistant/i);
  assert.doesNotMatch(source, /@elimfilters/i);
  assert.match(source, /siteName: 'ELIMFILTERS'/);
});
