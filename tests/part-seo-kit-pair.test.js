'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { renderProduct } = require('../lib/install-part-seo-pages');

test('kit pair panel links the companion filter and only appears when set', () => {
  const row = { sku: 'EF37291', filter_type: 'fuel', kit_pair: { sku: 'EF37867', application: '2013-2018 Ram <x>' } };
  for (const lang of ['en', 'es', 'pt']) {
    const html = renderProduct(row, lang);
    assert.match(html, /href="[^"]*\/part\/EF37867\/"/);
    assert.match(html, /2013-2018 Ram &lt;x&gt;/);
  }
  assert.doesNotMatch(renderProduct({ sku: 'EF37291', filter_type: 'fuel' }, 'en'), /Kit application/);
});
