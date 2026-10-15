import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { callLocalLlm } = require('../../lib/hermes-local-llm');

test('local LLM disables reasoning so thinking models return content', async () => {
  let sentBody;
  const fetchImpl = async (_url, init) => {
    sentBody = JSON.parse(init.body);
    return {
      ok: true,
      json: async () => ({ choices: [{ message: { content: '{"status":"ok"}' } }] })
    };
  };

  const result = await callLocalLlm([{ role: 'user', content: 'ping' }], { fetchImpl });

  assert.equal(sentBody.reasoning_effort, 'none');
  assert.equal(result.ok, true);
  assert.equal(result.content, '{"status":"ok"}');
});
