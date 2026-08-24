'use strict';
// Fase 2 — core resolver logic tests. Not multichannel (WhatsApp/IG/etc. are
// thin HTTP adapters over the central protocol per
// docs/CONVERSATION_ENGINE_ARCHITECTURE.md, so testing the shared resolver
// covers them once it's actually wired in -- channel-level integration
// tests are follow-up work, not done here).
const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeCode, resolveWithFallback, FEATURE_FLAG_ENV } = require('../lib/normalized-code-resolver');

test('normalizeCode strips -, space, / and uppercases; preserves nothing else', () => {
  assert.equal(normalizeCode('C33920/3'), 'C339203');
  assert.equal(normalizeCode('c 339-20 3'), 'C339203');
  assert.equal(normalizeCode(''), '');
});

test('exact match (Tier 1) resolves without ever calling the fallback', async () => {
  const exact = async () => [{ sku: 'EA10006' }];
  const fallback = async () => { throw new Error('should not be called'); };
  const r = await resolveWithFallback('C33920/3', exact, fallback);
  assert.deepEqual(r, { status: 'RESOLVED_EXACT', sku: 'EA10006' });
});

test('typographic variant resolves via fallback when flag is on and unique', async () => {
  process.env[FEATURE_FLAG_ENV] = 'true';
  try {
    const exact = async () => [];
    const fallback = async () => [{ sku: 'EA10006', display_code: 'C33920/3' }];
    const r = await resolveWithFallback('C339203', exact, fallback);
    assert.equal(r.status, 'RESOLVED_FALLBACK');
    assert.equal(r.sku, 'EA10006');
  } finally {
    delete process.env[FEATURE_FLAG_ENV];
  }
});

test('fallback is a no-op when the feature flag is off (default)', async () => {
  delete process.env[FEATURE_FLAG_ENV];
  const exact = async () => [];
  const fallback = async () => { throw new Error('should not be called when flag is off'); };
  const r = await resolveWithFallback('C339203', exact, fallback);
  assert.equal(r.status, 'NOT_FOUND');
});

test('multiple distinct SKUs after normalization -> AMBIGUOUS_CANDIDATES, never auto-picked', async () => {
  process.env[FEATURE_FLAG_ENV] = 'true';
  try {
    const exact = async () => [];
    const fallback = async () => [
      { sku: 'EA10006', display_code: 'C33920/3' },
      { sku: 'EL80047', display_code: 'C-339203' },
    ];
    const r = await resolveWithFallback('C339203', exact, fallback);
    assert.equal(r.status, 'AMBIGUOUS_CANDIDATES');
    assert.equal(r.candidates.length, 2);
  } finally {
    delete process.env[FEATURE_FLAG_ENV];
  }
});

test('same normalized code, same SKU reported by multiple manufacturers collapses to one candidate, not ambiguous', async () => {
  process.env[FEATURE_FLAG_ENV] = 'true';
  try {
    const exact = async () => [];
    const fallback = async () => [
      { sku: 'EA10006', display_code: 'C33920/3' },
      { sku: 'EA10006', display_code: 'C-339203' },
    ];
    const r = await resolveWithFallback('C339203', exact, fallback);
    assert.equal(r.status, 'RESOLVED_FALLBACK');
    assert.equal(r.sku, 'EA10006');
  } finally {
    delete process.env[FEATURE_FLAG_ENV];
  }
});

test('no match anywhere -> NOT_FOUND, not an invented result', async () => {
  process.env[FEATURE_FLAG_ENV] = 'true';
  try {
    const exact = async () => [];
    const fallback = async () => [];
    const r = await resolveWithFallback('ZZZ999NOPE', exact, fallback);
    assert.equal(r.status, 'NOT_FOUND');
  } finally {
    delete process.env[FEATURE_FLAG_ENV];
  }
});
