'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/^\uFEFF/, '');
}

test('master registry defines THERMACORE as active cooling technology', () => {
  const registry = read('docs/brand/TECHNOLOGY_REGISTRY.md');
  assert.match(registry, /## THERMACORE™[\s\S]*?System:\s*Cooling System Protection/);
  assert.match(registry, /## THERMACORE™[\s\S]*?Products:\s*Coolant Filters/);
});

test('canonical taxonomy guard retires the predecessor but not THERMACORE', () => {
  const guard = read('scripts/validate-canonical-taxonomy.mjs');
  assert.match(guard, /434f4f4c54454348/i, 'The retired cooling predecessor must remain forbidden');
  assert.doesNotMatch(guard, /544845524d41434f5245/i, 'THERMACORE must never be encoded as a retired identifier');
});

test('citation compiler does not classify THERMACORE as retired', () => {
  const compiler = read('scripts/build-citation-index.js');
  const retiredBlock = compiler.match(/const RETIRED_ENTITY_KEYS = new Set\(\[([\s\S]*?)\]\);/);
  assert.ok(retiredBlock, 'RETIRED_ENTITY_KEYS declaration must exist');
  assert.doesNotMatch(retiredBlock[1], /THERMACORE/, 'THERMACORE is active and must never be retired');
});

test('citation compiler tolerates UTF-8 BOM before vault frontmatter', () => {
  const compiler = read('scripts/build-citation-index.js');
  assert.match(compiler, /replace\(\/\^\\uFEFF\//, 'Compiler must strip UTF-8 BOM before frontmatter parsing');
});
