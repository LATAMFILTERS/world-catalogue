import test from 'node:test';
import assert from 'node:assert/strict';
import { createResilientFetch } from '../../scripts/hermes/industry-sweep-reliable.mjs';

function headers(values = {}) {
  return { get: (name) => values[name.toLowerCase()] ?? null };
}

test('429 uses retry-after/token reset and never treats request RPD reset as TPM delay', async () => {
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

  const response = await createResilientFetch(baseFetch, async (ms) => { sleeps.push(ms); })(
    'https://api.groq.com/openai/v1/chat/completions',
    { method: 'POST', body: JSON.stringify({ messages: [{ role: 'system', content: 'test' }] }) }
  );

  assert.equal(response.ok, true);
  assert.equal(calls, 2);
  assert.ok(sleeps.some((ms) => ms >= 3000 && ms < 10000));
  assert.equal(sleeps.some((ms) => ms >= 90000), false);
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
  const init = { method: 'POST', body: JSON.stringify({ messages: [{ role: 'system', content: 'test' }] }) };
  await resilient('https://api.groq.com/openai/v1/chat/completions', init);
  await resilient('https://api.groq.com/openai/v1/chat/completions', init);

  assert.equal(calls, 2);
  assert.ok(sleeps.some((ms) => ms >= 9000));
});
