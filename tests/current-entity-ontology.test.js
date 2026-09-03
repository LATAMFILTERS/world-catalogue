'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8').replace(/^\uFEFF/, '');

test('public technologies collection exposes ten governed technologies across five systems', () => {
  const source = read('frontend/src/app/technologies/page.tsx');

  const technologies = [
    'MACROCORE™', 'MICROKAPPA™', 'DRYCORE™', 'INTEKCORE™', 'SYNTAPORE™',
    'HYDROCORE™', 'TURBOCORE™', 'SYNTRAX™', 'NANOFORCE™', 'THERMACORE™',
  ];

  for (const technology of technologies) {
    assert.ok(source.includes(technology), `missing public technology ${technology}`);
  }

  assert.match(source, /Ten technologies organized inside five protection systems\./);
  assert.match(source, /technologies: \['SYNTAPORE™', 'HYDROCORE™', 'TURBOCORE™'\]/);
  assert.doesNotMatch(source, /Nine technologies/);
  assert.doesNotMatch(source, /Explore nine ELIMFILTERS filtration technologies/);
});

test('fuel cleanliness keeps HYDROCORE and TURBOCORE scopes distinct', () => {
  const source = read('frontend/src/app/technologies/page.tsx');

  assert.match(source, /HYDROCORE™.*standard non-turbine/s);
  assert.match(source, /TURBOCORE™.*FH and FG turbine-style/s);
});
