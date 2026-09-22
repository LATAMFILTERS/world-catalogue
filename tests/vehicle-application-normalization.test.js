'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeAlphaNum,
  findPlatform,
  parseVehicleSearchText,
} = require('../lib/vehicle-application-normalizer');

test('normalizes punctuation and spaces consistently', () => {
  assert.equal(normalizeAlphaNum('NPR-HD'), 'NPRHD');
  assert.equal(normalizeAlphaNum('NPR HD'), 'NPRHD');
});

test('resolves US Isuzu NPR-HD aliases to one canonical model', () => {
  for (const alias of ['NPR-HD', 'NPR HD', 'NPRHD']) {
    const result = findPlatform({ make: 'Isuzu', model: alias, market: 'US' });
    assert.equal(result.matched, true);
    assert.equal(result.make, 'ISUZU');
    assert.equal(result.platform, 'N-SERIES');
    assert.equal(result.model, 'NPR-HD');
  }
});

test('keeps NQR and NRR as distinct canonical models', () => {
  assert.equal(findPlatform({ make: 'ISUZU', model: 'NQR' }).model, 'NQR');
  assert.equal(findPlatform({ make: 'ISUZU', model: 'NRR' }).model, 'NRR');
});

test('does not infer Chevrolet as Isuzu', () => {
  const result = findPlatform({ make: 'Chevrolet', model: '4500 HD', market: 'US' });
  assert.equal(result.matched, false);
  assert.equal(result.make, 'Chevrolet');
});

test('extracts a conversational Isuzu NPR-HD lookup', () => {
  const result = parseVehicleSearchText('air filter for a 2022 Isuzu NPR HD 5.2L');
  assert.equal(result.matched, true);
  assert.equal(result.model, 'NPR-HD');
  assert.equal(result.year, 2022);
  assert.equal(result.engine, '5.2L');
});
