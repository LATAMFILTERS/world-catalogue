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

// openai/gpt-oss models on Groq are reasoning models: by default they spend
// an unbounded share of max_tokens on a hidden reasoning trace before
// writing the actual JSON, which is what produces the
// "max completion tokens reached before generating a valid document"
// failure on ordinary classification/JSON-schema calls that don't need deep
// reasoning. reasoning_effort keeps that budget in check; only gpt-oss
// models accept the parameter.
function isReasoningModel(model) {
  return /^openai\/gpt-oss/i.test(model);
}

async function callGroq(messages, model, { maxTokens, temperature, signal, reasoningEffort }) {
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
      ...(reasoningEffort && isReasoningModel(model) ? { reasoning_effort: reasoningEffort } : {}),
      messages
    })
  });
}

// Shared Groq JSON caller. Deprecated model IDs are remapped before the
// request; a model-not-found response gets one safe retry on the current
// production replacement, and a reasoning-budget exhaustion (see
// isReasoningModel above) gets one safe retry with a lower reasoning effort
// and a larger token budget. Callers still receive null on any final
// failure so deterministic routing remains the fail-safe.
async function groqChatJson(messages, { maxTokens = 500, temperature = 0, timeoutMs = 6500, reasoningEffort = 'low' } = {}) {
  if (!process.env.GROQ_API_KEY) return null;
  const timeout = timeoutSignal(timeoutMs);
  const preferredModel = resolveModel();

  try {
    let response = await callGroq(messages, preferredModel, {
      maxTokens,
      temperature,
      signal: timeout.signal,
      reasoningEffort
    });
    let effectiveModel = preferredModel;

    if (!response.ok) {
      const firstBody = await response.text();
      const modelUnavailable = response.status === 404 && /model_not_found|does not exist|do not have access/i.test(firstBody);
      const reasoningBudgetExhausted = response.status === 400
        && /json_validate_failed/i.test(firstBody)
        && /max completion tokens reached|max_tokens/i.test(firstBody);

      if (modelUnavailable && preferredModel !== REPLACEMENT_MODEL) {
        console.warn('[bot-protocol-groq] model unavailable; retrying replacement', {
          requested_model: preferredModel,
          replacement_model: REPLACEMENT_MODEL
        });
        effectiveModel = REPLACEMENT_MODEL;
        response = await callGroq(messages, effectiveModel, {
          maxTokens,
          temperature,
          signal: timeout.signal,
          reasoningEffort
        });
      } else if (reasoningBudgetExhausted) {
        console.warn('[bot-protocol-groq] reasoning budget exhausted before valid JSON; retrying with lower effort and larger budget', {
          model: preferredModel,
          original_max_tokens: maxTokens
        });
        response = await callGroq(messages, preferredModel, {
          maxTokens: Math.min(maxTokens * 3, 4000),
          temperature,
          signal: timeout.signal,
          reasoningEffort: 'low'
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
