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
  'HYDROCORE',
  'SYNTRAX',
  'NANOFORCE',
  'THERMACORE',
];

const EXPECTED_SYSTEMS = {
  MACROCORE: 'Air Intake & Airflow Protection',
  MICROKAPPA: 'Air Intake & Airflow Protection',
  DRYCORE: 'Air Intake & Airflow Protection',
  INTEKCORE: 'Air Intake & Airflow Protection',
  SYNTAPORE: 'Fuel Cleanliness Protection',
  TURBOCORE: 'Fuel Cleanliness Protection',
  HYDROCORE: 'Fuel Cleanliness Protection',
  SYNTRAX: 'Lubrication Protection',
  NANOFORCE: 'Hydraulic Protection',
  THERMACORE: 'Cooling System Protection',
};

function canonicalSource() {
  return fs.readFileSync(path.join(ROOT, 'frontend/src/lib/canonical-technologies.ts'), 'utf8');
}

function extractNames() {
  const src = canonicalSource();
  return Array.from(src.matchAll(/name:\s*'([A-Z0-9]+)™'/g), (m) => m[1]);
}

function technologyRegistry() {
  // Normalize CRLF -> LF: the doc is saved with Windows line endings, and
  // every regex below matches against a literal '\n' -- without this, the
  // '\r' left dangling before each '\n' silently breaks every match.
  return fs.readFileSync(path.join(ROOT, 'docs/brand/TECHNOLOGY_REGISTRY.md'), 'utf8').replace(/\r\n/g, '\n');
}

test('canonical registry contains exactly the ten approved core technologies', () => {
  assert.deepEqual(extractNames().sort(), [...APPROVED].sort());
});

test('fuel technologies resolve only to the approved fuel-cleanliness architecture', () => {
  const src = canonicalSource();
  for (const key of ['SYNTAPORE', 'TURBOCORE', 'HYDROCORE']) {
    const block = src.match(new RegExp(`${key.toLowerCase()}: \\{[\\s\\S]*?\\n  \\},`));
    assert.ok(block, `${key} block missing`);
    assert.match(block[0], /domain:\s*'fuel-cleanliness'/);
  }
});

test('technology governance assigns all ten core technologies to the five canonical systems', () => {
  const registry = technologyRegistry();
  const declaredSystems = new Set();

  for (const [key, expectedSystem] of Object.entries(EXPECTED_SYSTEMS)) {
    const block = registry.match(new RegExp(`## ${key}™\\n([\\s\\S]*?)(?=\\n## |\\n# SPECIALIZED SOLUTIONS)`));
    assert.ok(block, `${key} governance block missing`);
    const system = block[1].match(/^System:\s*(.+)$/m)?.[1]?.trim();
    assert.equal(system, expectedSystem, `${key} must belong to ${expectedSystem}`);
    declaredSystems.add(system);
  }

  assert.deepEqual(
    [...declaredSystems].sort(),
    [
      'Air Intake & Airflow Protection',
      'Fuel Cleanliness Protection',
      'Lubrication Protection',
      'Hydraulic Protection',
      'Cooling System Protection',
    ].sort(),
  );
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
