'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(
  path.join(root, 'frontend/src/app/knowledge-center/engineering/[topic]/page.tsx'),
  'utf8',
).replace(/^\uFEFF/, '');

test('standard entities own canonical ISO 16889 and ISO 4406 URLs', () => {
  assert.match(page, /'iso-16889': 'https:\/\/elimfilters\.com\/knowledge-center\/standards\/iso-16889\/'/);
  assert.match(page, /'iso-4406': 'https:\/\/elimfilters\.com\/knowledge-center\/standards\/iso-4406\/'/);
});

test('duplicate engineering standard articles are noindex but followable', () => {
  assert.match(page, /robots: canonicalStandardUrl \? \{ index: false, follow: true \} : undefined/);
  assert.match(page, /alternates: \{ canonical: canonicalStandardUrl \?\? url \}/);
});
