'use strict';

const LOCAL_DEFAULT_URL = 'http://127.0.0.1:11434/v1/chat/completions';
const LOCAL_DEFAULT_MODEL = 'qwen3:8b';

function boolEnv(name, fallback = false) {
  const raw = process.env[name];
  if (raw == null || raw === '') return fallback;
  return String(raw).toLowerCase() === 'true';
}

function zeroCostRequired() {
  return boolEnv('HERMES_ZERO_COST_REQUIRED', true);
}

function externalGroqAllowedAtZeroCost() {
  if (!zeroCostRequired()) return true;
  return boolEnv('HERMES_GROQ_FREE_TIER_CONFIRMED', false);
}

function localConfig() {
  return {
    enabled: boolEnv('HERMES_LOCAL_LLM_ENABLED', true),
    url: String(process.env.HERMES_LOCAL_LLM_URL || LOCAL_DEFAULT_URL).trim(),
    model: String(process.env.HERMES_LOCAL_LLM_MODEL || LOCAL_DEFAULT_MODEL).trim(),
    timeoutMs: Math.max(1000, Number(process.env.HERMES_LOCAL_LLM_TIMEOUT_MS || 12000))
  };
}

async function callLocalLlm(messages, {
  responseFormat = { type: 'json_object' },
  maxTokens = 1200,
  temperature = 0,
  fetchImpl = globalThis.fetch
} = {}) {
  const cfg = localConfig();
  if (!cfg.enabled || typeof fetchImpl !== 'function') return { ok: false, reason: 'LOCAL_DISABLED' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
  try {
    const response = await fetchImpl(cfg.url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: cfg.model,
        temperature,
        max_tokens: maxTokens,
        response_format: responseFormat,
        messages
      })
    });
    if (!response.ok) {
      return { ok: false, reason: `LOCAL_HTTP_${response.status}`, status: response.status };
    }
    const body = await response.json();
    const content = body?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) return { ok: false, reason: 'LOCAL_EMPTY_RESPONSE' };
    return { ok: true, provider: 'local', model: cfg.model, content };
  } catch (error) {
    return {
      ok: false,
      reason: error?.name === 'AbortError' ? 'LOCAL_TIMEOUT' : 'LOCAL_ERROR',
      error: String(error?.message || error).slice(0, 200)
    };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = {
  LOCAL_DEFAULT_URL,
  LOCAL_DEFAULT_MODEL,
  localConfig,
  callLocalLlm,
  zeroCostRequired,
  externalGroqAllowedAtZeroCost
};
