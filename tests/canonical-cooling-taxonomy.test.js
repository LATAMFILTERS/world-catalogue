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

test('canonical taxonomy guard retires COOLTECH but not THERMACORE', () => {
  const guard = read('scripts/validate-canonical-taxonomy.mjs');
  assert.match(guard, /434f4f4c54454348/i, 'COOLTECH must remain in the retired-identifier guard');
  assert.doesNotMatch(guard, /544845524d41434f5245/i, 'THERMACORE must never be encoded as a retired identifier');
});

test('citation repair enforces THERMACORE active and COOLTECH retired', () => {
  const repair = read('scripts/repair-canonical-citation-index.mjs');
  assert.match(repair, /THERMACORE/);
  assert.match(repair, /COOLTECH/);
  assert.match(repair, /Canonical technology cannot be retired/);
});

test('legacy citation compiler must not classify THERMACORE as retired', () => {
  const compiler = read('scripts/build-citation-index.js');
  const retiredBlock = compiler.match(/const RETIRED_ENTITY_KEYS = new Set\(\[([\s\S]*?)\]\);/);
  assert.ok(retiredBlock, 'RETIRED_ENTITY_KEYS declaration must exist');
  assert.doesNotMatch(retiredBlock[1], /THERMACORE/, 'THERMACORE is active; COOLTECH is the retired predecessor');
});
