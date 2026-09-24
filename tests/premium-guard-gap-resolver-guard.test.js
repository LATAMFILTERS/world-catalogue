'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {
  buildPreflightFingerprint,
  collisionSignature,
} = require('../scripts/hermes/premium-guard-gap-resolver');

function ctx(rows = [{ elimfilters_sku: 'EL30075', canonical_brand: 'MANN-FILTER', canonical_part_number: 'MW75', match_source: 'CANONICAL_IDENTITY' }]) {
  return {
    canonicalIndex: new Map([['MANNFILTER|MW75', rows]]),
    makePolicies: [{ make_key: 'BMW', origin_group: 'EUROPEAN', canonical_brand: 'MANN-FILTER' }],
  };
}

test('preflight fingerprint is stable and changes when governed DB context changes', () => {
  const queue = [{ premium_guard_code: 'PG164EX', part_types: ['Oil Filter'] }];
  assert.equal(buildPreflightFingerprint(queue, ctx()), buildPreflightFingerprint(queue, ctx()));
  assert.notEqual(buildPreflightFingerprint(queue, ctx()), buildPreflightFingerprint(queue, ctx([{ elimfilters_sku: 'EL30077', canonical_brand: 'MANN-FILTER', canonical_part_number: 'MW75', match_source: 'CANONICAL_IDENTITY' }])));
});

test('collision signature is order-independent for the same material evidence', () => {
  const a = [{ premium_guard_code: 'PG164EX', state: 'CONFLICT_EXISTING_REFERENCE', target_sku: null, existing_canonical_matches: [{ elimfilters_sku: 'EL30075', canonical_brand: 'MANN-FILTER', canonical_part_number: 'MW75', match_source: 'CANONICAL_IDENTITY' }], reasons: ['A','B'] }];
  const b = [{ ...a[0], reasons: ['B','A'] }];
  assert.equal(collisionSignature(a), collisionSignature(b));
});

test('resolver contains DB advisory lock and cached-preflight exit', () => {
  const source = fs.readFileSync(path.join(__dirname, '../scripts/hermes/premium-guard-gap-resolver.js'), 'utf8');
  assert.match(source, /pg_try_advisory_xact_lock/);
  assert.match(source, /REUSED_PREVIOUS_PREFLIGHT/);
  assert.match(source, /BLOCKED_WITH_REASON/);
});