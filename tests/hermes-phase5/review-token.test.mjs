import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildReviewUrl, verifyReviewPayload } = require('../../lib/hermes-review-token');

const secret = 'unit-test-secret-that-is-not-used-in-production';

test('HERMES review URL is signed and verifies before expiry', () => {
  const payload = { candidate: 'HERMES_REAL_123', decision: 'approve', run_id: '123456789', exp: 2_000_000_000 };
  const url = new URL(buildReviewUrl('https://example.com/hermes/review', payload, secret));
  const parsed = {
    candidate: url.searchParams.get('candidate'),
    decision: url.searchParams.get('decision'),
    run_id: url.searchParams.get('run_id'),
    exp: Number(url.searchParams.get('exp')),
  };
  assert.equal(verifyReviewPayload(parsed, url.searchParams.get('sig'), secret, 1_900_000_000_000), true);
});

test('HERMES review signature rejects tampering', () => {
  const payload = { candidate: 'HERMES_REAL_123', decision: 'approve', run_id: '123456789', exp: 2_000_000_000 };
  const url = new URL(buildReviewUrl('https://example.com/hermes/review', payload, secret));
  const tampered = { ...payload, decision: 'reject' };
  assert.equal(verifyReviewPayload(tampered, url.searchParams.get('sig'), secret, 1_900_000_000_000), false);
});

test('HERMES review signature rejects expired links', () => {
  const payload = { candidate: 'HERMES_REAL_123', decision: 'research', run_id: '123456789', exp: 1_800_000_000 };
  const url = new URL(buildReviewUrl('https://example.com/hermes/review', payload, secret));
  assert.equal(verifyReviewPayload(payload, url.searchParams.get('sig'), secret, 1_900_000_000_000), false);
});
