const test = require('node:test');
const assert = require('node:assert/strict');

const { extractReferences, normalizeReference } = require('../lib/bot-protocol-catalog');

test('extracts P552100 without treating 2007 as a filter reference', () => {
  assert.deepEqual(extractReferences('Es modelo 2007. El filtro es Donaldson P552100.'), ['P552100']);
});

test('extracts and normalizes multiple filter references', () => {
  assert.deepEqual(extractReferences('Donaldson P55-2100 y Baldwin B4951'), ['P552100', 'B4951']);
});

test('normalizeReference strips spaces and dashes and uppercases', () => {
  assert.equal(normalizeReference('p55-2100'), 'P552100');
  assert.equal(normalizeReference('p55 2100'), 'P552100');
});

test('does not extract a bare 4-digit year as a reference', () => {
  assert.deepEqual(extractReferences('Mack 2024 agua en el sistema'), []);
});
