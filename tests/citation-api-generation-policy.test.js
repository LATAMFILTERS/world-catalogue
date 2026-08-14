'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/^\uFEFF/, '');
}

test('Citation API generation starts from a clean output directory', () => {
  const generator = read('scripts/generate-citation-api.js');
  assert.match(generator, /fs\.rmSync\(OUT_DIR,\s*\{\s*recursive:\s*true,\s*force:\s*true\s*\}\)/);
  assert.match(generator, /ensureDir\(OUT_DIR\)/);
});

test('frontend prebuild validates canonical citation coverage before and after generation', () => {
  const pkg = JSON.parse(read('frontend/package.json'));
  const prebuild = pkg.scripts?.prebuild || '';
  const indexValidation = 'validate-canonical-citation-index.mjs';
  const generator = 'generate-citation-api.js';
  const outputValidation = 'validate-citation-api-output.mjs';

  assert.ok(prebuild.includes(indexValidation), 'prebuild must validate the canonical citation index');
  assert.ok(prebuild.includes(generator), 'prebuild must generate the Citation API');
  assert.ok(prebuild.includes(outputValidation), 'prebuild must validate generated Citation API output');
  assert.ok(prebuild.indexOf(indexValidation) < prebuild.indexOf(generator), 'index validation must run before generation');
  assert.ok(prebuild.indexOf(generator) < prebuild.indexOf(outputValidation), 'output validation must run after generation');
});
