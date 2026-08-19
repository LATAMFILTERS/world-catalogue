import test from 'node:test';
import assert from 'node:assert/strict';
import { createResilientFetch, _resetQuotaStateForTests } from '../../scripts/hermes/industry-sweep-reliable.mjs';

// fatalDailyQuota/quotaState/exhaustedModels are run-scoped (module-level),
// not per-call, by design (see the run-scoped circuit-breaker fix,
// 2026-08-19) — each test() below must start from a clean slate rather than
// inheriting exhaustion state a previous test in this file already tripped.
test.beforeEach(() => _resetQuotaStateForTests());

function headers(values = {}) {
  return { get: (name) => values[name.toLowerCase()] ?? null };
}

function init(model = 'groq/compound') {
  return {
    method: 'POST',
    body: JSON.stringify({ model, messages: [{ role: 'system', content: 'test' }] })
  };
}

const tpdBody = (model = 'meta-llama/llama-4-scout-17b-16e-instruct') => JSON.stringify({
  error: {
    message: `Rate limit reached for model ${model} on tokens per day (TPD): Limit 500000, Used 499424, Requested 1208. Please try again in 1m49.2s.`,
    type: 'compound',
    code: 'rate_limit_exceeded'
  }
});

test('falls back from groq/compound to groq/compound-mini when underlying TPD is exhausted', async () => {
  const models = [];
  const baseFetch = async (_url, requestInit) => {
    const model = JSON.parse(requestInit.body).model;
    models.push(model);
    if (model === 'groq/compound') {
      return { ok: false, status: 429, headers: headers({}), text: async () => tpdBody() };
    }
    return { ok: true, status: 200, headers: headers({}) };
  };

  const resilient = createResilientFetch(baseFetch, async () => {});
  const response = await resilient('https://api.groq.com/openai/v1/chat/completions', init());

  assert.equal(response.ok, true);
  assert.deepEqual(models, ['groq/compound', 'groq/compound-mini']);
});

test('stops further Groq traffic when fallback TPD is also exhausted', async () => {
  let calls = 0;
  const baseFetch = async (_url, requestInit) => {
    calls += 1;
    const model = JSON.parse(requestInit.body).model;
    return {
      ok: false,
      status: 429,
      headers: headers({}),
      text: async () => tpdBody(model)
    };
  };

  const resilient = createResilientFetch(baseFetch, async () => {});
  await assert.rejects(
    resilient('https://api.groq.com/openai/v1/chat/completions', init()),
    /GROQ_TPD_EXHAUSTED/
  );
  assert.equal(calls, 2, 'primary plus one fallback attempt only');

  await assert.rejects(
    resilient('https://api.groq.com/openai/v1/chat/completions', init()),
    /GROQ_TPD_EXHAUSTED/
  );
  assert.equal(calls, 2, 'no additional Groq request after fatal TPD state');
});

test('retries HTTP 200 responses that contain no Groq message content', async () => {
  let calls = 0;
  const sleeps = [];
  const baseFetch = async () => {
    calls += 1;
    const content = calls === 1 ? '' : '{"findings":[]}';
    return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  };

  const resilient = createResilientFetch(baseFetch, async (ms) => { sleeps.push(ms); });
  const response = await resilient('https://api.groq.com/openai/v1/chat/completions', init('groq/compound-mini'));
  const payload = await response.json();

  assert.equal(calls, 2);
  assert.equal(payload.choices[0].message.content, '{"findings":[]}');
  assert.ok(sleeps.some((ms) => ms >= 10000), 'empty-content retry should use controlled backoff');
});
