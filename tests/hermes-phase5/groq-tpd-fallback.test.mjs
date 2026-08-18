import test from 'node:test';
import assert from 'node:assert/strict';
import { createResilientFetch } from '../../scripts/hermes/industry-sweep-reliable.mjs';

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
