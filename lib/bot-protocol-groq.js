'use strict';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const REPLACEMENT_MODEL = 'openai/gpt-oss-120b';
const DEPRECATED_MODELS = new Set([
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant'
]);

function resolveModel() {
  const configured = String(process.env.GROQ_MODEL || '').trim();
  if (!configured) return REPLACEMENT_MODEL;
  if (DEPRECATED_MODELS.has(configured)) {
    console.warn('[bot-protocol-groq] deprecated GROQ_MODEL remapped', {
      configured_model: configured,
      replacement_model: REPLACEMENT_MODEL
    });
    return REPLACEMENT_MODEL;
  }
  return configured;
}

function timeoutSignal(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

function safeJson(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (_error) {
    const match = String(value).match(/\{[\s\S]*\}/);
    if (!match) return null;
    try { return JSON.parse(match[0]); } catch (_nested) { return null; }
  }
}

async function callGroq(messages, model, { maxTokens, temperature, signal }) {
  return fetch(GROQ_URL, {
    method: 'POST',
    signal,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
      messages
    })
  });
}

// Shared Groq JSON caller. Deprecated model IDs are remapped before the
// request, and a model-not-found response gets one safe retry on the current
// production replacement. Callers still receive null on any final failure so
// deterministic routing remains the fail-safe.
async function groqChatJson(messages, { maxTokens = 500, temperature = 0, timeoutMs = 6500 } = {}) {
  if (!process.env.GROQ_API_KEY) return null;
  const timeout = timeoutSignal(timeoutMs);
  const preferredModel = resolveModel();

  try {
    let response = await callGroq(messages, preferredModel, {
      maxTokens,
      temperature,
      signal: timeout.signal
    });

    if (!response.ok) {
      const firstBody = await response.text();
      const modelUnavailable = response.status === 404 && /model_not_found|does not exist|do not have access/i.test(firstBody);

      if (modelUnavailable && preferredModel !== REPLACEMENT_MODEL) {
        console.warn('[bot-protocol-groq] model unavailable; retrying replacement', {
          requested_model: preferredModel,
          replacement_model: REPLACEMENT_MODEL
        });
        response = await callGroq(messages, REPLACEMENT_MODEL, {
          maxTokens,
          temperature,
          signal: timeout.signal
        });
      } else {
        console.error('[bot-protocol-groq] HTTP', response.status, firstBody.slice(0, 300));
        return null;
      }
    }

    if (!response.ok) {
      console.error('[bot-protocol-groq] HTTP', response.status, (await response.text()).slice(0, 300));
      return null;
    }

    const data = await response.json();
    return safeJson(data?.choices?.[0]?.message?.content);
  } catch (error) {
    console.error('[bot-protocol-groq]', error.name === 'AbortError' ? 'timeout' : error.message);
    return null;
  } finally {
    timeout.clear();
  }
}

module.exports = { groqChatJson, resolveModel };
