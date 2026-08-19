const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  extractReferences,
  normalizeReference,
  codesFromJsonArray,
  codesFromJsonObject,
  productReferenceSet,
  exactReferenceMatch,
  referenceContainmentPayloads
} = require('../lib/bot-protocol-catalog');

test('extracts P552100 without treating 2007 as a filter reference', () => {
  assert.deepEqual(extractReferences('Es modelo 2007. El filtro es Donaldson P552100.'), ['P552100']);
});

test('extracts and normalizes multiple filter references', () => {
  assert.deepEqual(extractReferences('Donaldson P55-2100 y Baldwin B4951'), ['P552100', 'B4951']);
});

test('extracts numeric OEM and competitor references but excludes years', () => {
  assert.deepEqual(extractReferences('Mack 2024 usa OEM 3315476 y WIX 51516'), ['3315476', '51516']);
});

test('extracts numeric references containing separators', () => {
  assert.deepEqual(extractReferences('Komatsu 600-211-1231'), ['6002111231']);
});

test('extracts references containing slash separators', () => {
  assert.deepEqual(extractReferences('MANN W940/25'), ['W94025']);
});

test('normalizeReference strips spaces, punctuation and uppercases', () => {
  assert.equal(normalizeReference('p55-2100'), 'P552100');
  assert.equal(normalizeReference('p55 2100'), 'P552100');
  assert.equal(normalizeReference('W940/25'), 'W94025');
});

test('does not extract a bare 4-digit year as a reference', () => {
  assert.deepEqual(extractReferences('Mack 2024 agua en el sistema'), []);
});

test('reads standard OEM and competitor JSON objects', () => {
  assert.deepEqual(codesFromJsonArray([
    { manufacturer: 'CUMMINS', code: '3315476' },
    { manufacturer: 'MANN', partNumber: 'W940/25' }
  ]), ['3315476', 'W940/25']);
});

test('reads legacy manufacturer-pipe-code strings', () => {
  assert.deepEqual(codesFromJsonArray(['CUMMINS | 3315476', 'CAT | 1R0716']), ['3315476', '1R0716']);
});

test('reads brand_crossrefs arrays instead of silently discarding them', () => {
  assert.deepEqual(codesFromJsonObject({
    DONALDSON: ['P552100'],
    FLEETGUARD: ['LF3620', 'AF25139M'],
    MANN: ['W940/25']
  }), ['P552100', 'LF3620', 'AF25139M', 'W940/25']);
});

test('reference set combines SKU, base, OEM, competitor and brand_crossrefs', () => {
  const refs = productReferenceSet({
    sku: 'EL82100',
    codigo_base: '82100',
    oem_codes: [{ manufacturer: 'CUMMINS', code: '3315476' }],
    competitor_codes: [{ manufacturer: 'DONALDSON', code: 'P55-2100' }],
    brand_crossrefs: { FLEETGUARD: ['LF3620'], MANN: ['W940/25'] }
  });

  for (const expected of ['EL82100', '82100', '3315476', 'P552100', 'LF3620', 'W94025']) {
    assert.equal(refs.has(expected), true, `${expected} should be available`);
  }
});

test('exact matching supports references from every authority field', () => {
  const product = {
    sku: 'EL82100',
    codigo_base: '82100',
    oem_codes: ['CUMMINS | 3315476'],
    competitor_codes: [{ manufacturer: 'DONALDSON', code: 'P55-2100' }],
    brand_crossrefs: { FLEETGUARD: ['AF25139M'], MANN: ['W940/25'] }
  };

  assert.equal(exactReferenceMatch(product, ['3315476']), true);
  assert.equal(exactReferenceMatch(product, ['P552100']), true);
  assert.equal(exactReferenceMatch(product, ['AF25139M']), true);
  assert.equal(exactReferenceMatch(product, ['W94025']), true);
  assert.equal(exactReferenceMatch(product, ['NOTREAL']), false);
});

test('builds JSONB containment payloads for known cross-reference key variants', () => {
  const payloads = referenceContainmentPayloads('RE52987').map(JSON.parse);
  assert.ok(payloads.some(value => value[0].code === 'RE52987'));
  assert.ok(payloads.some(value => value[0].partNumber === 'RE52987'));
  assert.ok(payloads.some(value => value[0].oem_code === 'RE52987'));
});

test('PostgreSQL cross-reference query avoids regexp full-table scans', () => {
  const source = fs.readFileSync(path.join(__dirname, '../lib/bot-protocol-catalog.js'), 'utf8');
  assert.equal(source.includes('$1[1]'), false);
  assert.equal(source.includes("regexp_replace(upper(coalesce(c.oem_codes::text"), false);
  assert.match(source, /c\.oem_codes @> ANY\(\$1::jsonb\[\]\)/);
  assert.match(source, /c\.competitor_codes @> ANY\(\$1::jsonb\[\]\)/);
});
