import test from 'node:test';
import assert from 'node:assert/strict';
import { createResilientFetch, _resetQuotaStateForTests } from '../../scripts/hermes/industry-sweep-reliable.mjs';

// fatalDailyQuota/quotaState/exhaustedModels are run-scoped (module-level),
// not per-call — each test() below must start from a clean slate.
test.beforeEach(() => _resetQuotaStateForTests());

function headers(values = {}) {
  return { get: (name) => values[name.toLowerCase()] ?? null };
}

const init = { method: 'POST', body: JSON.stringify({ messages: [{ role: 'system', content: 'test' }] }) };
const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

test('429 uses the longest relevant TPM recovery signal and ignores request RPD reset', async () => {
  let calls = 0;
  const sleeps = [];
  const baseFetch = async () => {
    calls += 1;
    if (calls === 1) {
      return {
        ok: false,
        status: 429,
        headers: headers({
          'retry-after': '2',
          'x-ratelimit-remaining-requests': '1000',
          'x-ratelimit-reset-requests': '12h',
          'x-ratelimit-reset-tokens': '7s'
        }),
        text: async () => '{"error":{"message":"rate limit"}}'
      };
    }
    return { ok: true, status: 200, headers: headers({}) };
  };

  const response = await createResilientFetch(baseFetch, async (ms) => { sleeps.push(ms); })(endpoint, init);

  assert.equal(response.ok, true);
  assert.equal(calls, 2);
  assert.ok(sleeps.some((ms) => ms >= 11500 && ms < 120000));
  assert.equal(sleeps.some((ms) => ms >= 12 * 60 * 60 * 1000), false);
});

test('short retry-after cannot override a longer token reset', async () => {
  let calls = 0;
  const sleeps = [];
  const baseFetch = async () => {
    calls += 1;
    if (calls === 1) {
      return {
        ok: false,
        status: 429,
        headers: headers({
          'retry-after': '0.6',
          'x-ratelimit-remaining-requests': '1000',
          'x-ratelimit-reset-tokens': '20s'
        }),
        text: async () => '{"error":{"message":"Please try again in 1.1s"}}'
      };
    }
    return { ok: true, status: 200, headers: headers({}) };
  };

  const response = await createResilientFetch(baseFetch, async (ms) => { sleeps.push(ms); })(endpoint, init);
  assert.equal(response.ok, true);
  assert.equal(calls, 2);
  assert.ok(sleeps.some((ms) => ms >= 21500));
});

test('repeated 429 is capped at three total calls per domain', async () => {
  let calls = 0;
  const sleeps = [];
  const baseFetch = async () => {
    calls += 1;
    return {
      ok: false,
      status: 429,
      headers: headers({
        'retry-after': '1',
        'x-ratelimit-remaining-requests': '1000',
        'x-ratelimit-reset-tokens': '2s'
      }),
      text: async () => '{"error":{"message":"rate limit"}}'
    };
  };

  const response = await createResilientFetch(baseFetch, async (ms) => { sleeps.push(ms); })(endpoint, init);
  assert.equal(response.ok, false);
  assert.equal(calls, 3);
  assert.equal(sleeps.filter((ms) => ms >= 10000).length, 2);
});

test('successful low-token response triggers proactive pacing before next Groq call', async () => {
  const sleeps = [];
  let calls = 0;
  const baseFetch = async () => {
    calls += 1;
    if (calls === 1) {
      return {
        ok: true,
        status: 200,
        headers: headers({
          'x-ratelimit-limit-tokens': '200000',
          'x-ratelimit-remaining-tokens': '5000',
          'x-ratelimit-remaining-requests': '1000',
          'x-ratelimit-reset-tokens': '8s',
          'x-ratelimit-reset-requests': '12h'
        })
      };
    }
    return { ok: true, status: 200, headers: headers({}) };
  };

  const resilient = createResilientFetch(baseFetch, async (ms) => { sleeps.push(ms); });
  await resilient(endpoint, init);
  await resilient(endpoint, init);

  assert.equal(calls, 2);
  assert.ok(sleeps.some((ms) => ms >= 9500));
});
