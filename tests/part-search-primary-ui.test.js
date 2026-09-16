'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const html = fs.readFileSync(path.join(__dirname, '..', 'part-search', 'results.html'), 'utf8');

test('results UI canonicalizes LF3620 to EL82100 before rendering', () => {
  assert.match(html, /LF3620:\s*'EL82100'/);
  assert.match(html, /data\.results\s*=\s*primaryOnlyResults\(data\.results, query\)/);
});

test('results UI renders alternate SKUs as existing see-also links', () => {
  assert.match(html, /primary\.alternatives\s*=\s*linkedSkus\.map/);
  assert.match(html, /class="see-also-chip"/);
});
