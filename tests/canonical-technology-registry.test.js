'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const APPROVED = [
  'MACROCORE',
  'MICROKAPPA',
  'DRYCORE',
  'INTEKCORE',
  'SYNTAPORE',
  'TURBOCORE',
  'SYNTRAX',
  'NANOFORCE',
  'THERMACORE',
];

function canonicalSource() {
  return fs.readFileSync(path.join(ROOT, 'frontend/src/lib/canonical-technologies.ts'), 'utf8');
}

function extractNames() {
  const src = canonicalSource();
  return Array.from(src.matchAll(/name:\s*'([A-Z0-9]+)™'/g), (m) => m[1]);
}

test('canonical registry contains exactly the nine approved core technologies', () => {
  assert.deepEqual(extractNames().sort(), [...APPROVED].sort());
});

test('fuel technologies resolve only to the approved fuel-cleanliness architecture', () => {
  const src = canonicalSource();
  for (const key of ['SYNTAPORE', 'TURBOCORE']) {
    const block = src.match(new RegExp(`${key.toLowerCase()}: \\{[\\s\\S]*?\\n  \\},`));
    assert.ok(block, `${key} block missing`);
    assert.match(block[0], /domain:\s*'fuel-cleanliness'/);
  }
});

test('human governance registries contain every approved technology', () => {
  const files = [
    'docs/brand/TECHNOLOGY_REGISTRY.md',
    'docs/brand/BRAND_ARCHITECTURE.md',
    'knowledge/CANONICAL_ENTITY_INDEX.md',
    'CLAUDE.md',
  ];
  for (const file of files) {
    const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
    for (const key of APPROVED) {
      assert.match(content, new RegExp(`${key}™`), `${file} is missing ${key}™`);
    }
  }
});

test('public LLM reference exposes the approved current taxonomy', () => {
  const llm = fs.readFileSync(path.join(ROOT, 'frontend/public/llm.txt'), 'utf8');
  for (const key of APPROVED) {
    assert.match(llm, new RegExp(`^${key}™$`, 'm'), `llm.txt is missing ${key}™`);
  }
  assert.match(llm, /Industrial Filtration Engineering/);
  assert.match(llm, /Asset Protection Systems/);
});
