import test from 'node:test';
import assert from 'node:assert/strict';
import { createResilientFetch } from '../../scripts/hermes/industry-sweep-reliable.mjs';

test('resilient Groq fetch retries 429 using retry-after and eventually succeeds', async () => {
  let calls = 0;
  const sleeps = [];
  const baseFetch = async () => {
    calls += 1;
    if (calls === 1) {
      return {
        ok: false,
        status: 429,
        headers: { get: (name) => name === 'retry-after' ? '0.01' : null },
        text: async () => '{"error":{"message":"rate limit"}}'
      };
    }
    return { ok: true, status: 200 };
  };
  const resilient = createResilientFetch(baseFetch, async (ms) => { sleeps.push(ms); });
  const response = await resilient('https://api.groq.com/openai/v1/chat/completions', { method: 'POST' });
  assert.equal(response.ok, true);
  assert.equal(calls, 2);
  assert.ok(sleeps.some((ms) => ms >= 500));
});

test('non-Groq fetches pass through without retry machinery', async () => {
  let calls = 0;
  const baseFetch = async () => { calls += 1; return { ok: true, status: 200 }; };
  const resilient = createResilientFetch(baseFetch, async () => {});
  const response = await resilient('https://example.com/evidence');
  assert.equal(response.ok, true);
  assert.equal(calls, 1);
});
