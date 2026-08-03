'use strict';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

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

// The single shared Groq text-chat caller. Returns null on any failure
// (missing key, timeout, HTTP error, invalid JSON) so callers can fall back
// deterministically instead of guessing at partial state.
async function groqChatJson(messages, { maxTokens = 500, temperature = 0, timeoutMs = 6500 } = {}) {
  if (!process.env.GROQ_API_KEY) return null;
  const timeout = timeoutSignal(timeoutMs);
  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      signal: timeout.signal,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
        messages
      })
    });
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

module.exports = { groqChatJson };
