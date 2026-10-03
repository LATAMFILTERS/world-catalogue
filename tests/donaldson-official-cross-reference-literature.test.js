'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  findOfficialLiteratureCrossReference,
} = require('../lib/donaldson-official-cross-reference-literature');

test('official Donaldson literature validates exact P166254 to HF8273 cross reference', () => {
  const result = findOfficialLiteratureCrossReference('P166254', 'HF8273');
  assert.ok(result);
  assert.equal(result.ok, true);
  assert.equal(result.evidenceAuthority, 'OFFICIAL_DONALDSON_LITERATURE');
  assert.equal(result.evidenceDocumentId, 'F111330-ENG');
  assert.equal(result.manufacturer, 'FLEETGUARD');
  assert.equal(result.evidenceHashKind, 'CURATED_ROW_FINGERPRINT_SHA256');
  assert.match(result.evidenceHash, /^[a-f0-9]{64}$/);
  assert.match(result.evidenceUrl, /^https:\/\/www\.donaldson\.com\/content\/dam\/donaldson\//);
});

test('official literature covers the governed transmission Fleetguard matrix', () => {
  for (const [donaldson, fleetguard] of [
    ['P166135', 'HF8318'],
    ['P166135', 'HF8320'],
    ['P166136', 'HF7119F'],
    ['P166136', 'HF8319'],
    ['P166254', 'HF7072F'],
    ['P166254', 'HF8277'],
    ['P166255', 'HF7074F'],
    ['P166255', 'HF8074'],
    ['P166255', 'HF8274'],
  ]) {
    const result = findOfficialLiteratureCrossReference(donaldson, fleetguard);
    assert.ok(result, `${donaldson} -> ${fleetguard}`);
    assert.equal(result.manufacturer, 'FLEETGUARD');
    assert.equal(result.evidenceDocumentId, 'F111330-ENG');
  }
});

test('official literature covers additional exact Fleetguard rows from F111330-ENG', () => {
  for (const [donaldson, fleetguard] of [
    ['P560972', 'HF35153'],
    ['P560972', 'HF28936'],
    ['P560972', 'HF28944'],
    ['P550637', 'LF637'],
  ]) {
    const result = findOfficialLiteratureCrossReference(donaldson, fleetguard);
    assert.ok(result, `${donaldson} -> ${fleetguard}`);
    assert.equal(result.evidenceDocumentId, 'F111330-ENG');
    assert.equal(result.manufacturer, 'FLEETGUARD');
  }
});

test('official literature matcher is exact and fail-closed', () => {
  assert.equal(findOfficialLiteratureCrossReference('P166254', 'HF999999'), null);
  assert.equal(findOfficialLiteratureCrossReference('P999999', 'HF8273'), null);
});
