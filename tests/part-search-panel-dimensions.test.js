'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'part-search', 'results.html'), 'utf8');
const server = fs.readFileSync(path.join(root, 'server-original.js'), 'utf8');

test('search API exposes panel length and width', () => {
  assert.match(server, /product_length_mm: row\.product_length_mm \|\| null/);
  assert.match(server, /product_width_mm: row\.product_width_mm \|\| null/);
});

test('results page shows Height, Length and Width for panel filters', () => {
  assert.match(html, /const isPanel = Boolean\(p\.product_length_mm \|\| p\.product_width_mm\)/);
  assert.match(html, /specHTML\(isPanel \? T\.specHeight : T\.specLength, dimFmt\(p\.height_mm\)\)/);
  assert.match(html, /specHTML\(T\.specPanelLength, dimFmt\(p\.product_length_mm\)\), specHTML\(T\.specWidth, dimFmt\(p\.product_width_mm\)\)/);
  for (const label of ["specHeight:        'Alto'", "specPanelLength:   'Largo'", "specWidth:         'Ancho'", "specWidth:         'Width'", "specWidth:         'Largura'"]) {
    assert.ok(html.includes(label), label);
  }
});
