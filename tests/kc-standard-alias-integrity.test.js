'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const route = fs.readFileSync(path.join(root, 'frontend/src/app/knowledge-center/standards/[standard]/page.tsx'), 'utf8');

test('only exact semantic standards aliases are generated', () => {
  assert.match(route, /'iso-11155': 'iso-11155-1'/);
  assert.doesNotMatch(route, /'astm-d6210':/);
  assert.doesNotMatch(route, /'eu-dir-2019-130':/);
  assert.doesNotMatch(route, /'iso-3724':/);
  assert.doesNotMatch(route, /'iso-4405':/);
  assert.doesNotMatch(route, /'din-71220':/);
});

test('standard aliases retain canonical trailing-slash targets', () => {
  assert.match(route, /https:\/\/elimfilters\.com\/knowledge-center\/standards\/\$\{resolvedSlug\}\//);
  assert.match(route, /destination = `\/knowledge-center\/standards\/\$\{resolvedSlug\}\//);
});
