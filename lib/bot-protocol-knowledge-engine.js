'use strict';

function timeoutSignal(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

// Creates a knowledge_center.candidate_cases row via the real, deployed
// knowledge-center-api service. This is the actual HERMES-research-tracking
// backend (see lib/knowledge-governance/hermes-client.js, which is the
// governed entry point: gated by HERMES_REQUESTS_ENABLED and deduplicated
// against lib/knowledge-governance/knowledge-gap-store.js before ever
// calling this). Exported so hermes-client.js reuses this exact call
// instead of re-implementing it.
async function createCandidateCase(message, sessionId, channel, state = {}, { priority = 'NORMAL', externalId, structuredIntake } = {}) {
  const url = process.env.KNOWLEDGE_CENTER_API_URL;
  const key = process.env.KNOWLEDGE_CENTER_API_KEY;
  if (!url || !key) return null;
  const timeout = timeoutSignal(4000);
  try {
    const response = await fetch(`${url}/api/knowledge-center/v1/candidate-cases`, {
      method: 'POST',
      signal: timeout.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'x-actor-id': sessionId,
        'x-actor-role': 'BOT_PROTOCOL'
      },
      body: JSON.stringify({
        externalId: externalId || `BOT-${channel}-${sessionId}-${Date.now()}`,
        sourceChannel: `${String(channel || 'API').toUpperCase()}_BOT`,
        priority,
        symptomSummary: String(message).slice(0, 500),
        assetSummary: { equipment: state.equipment || {}, intent: state.intent || null },
        structuredIntake: structuredIntake || { sessionId, message, state }
      })
    });
    if (!response.ok) {
      console.error('[bot-knowledge-engine][candidate-case] HTTP', response.status);
      return null;
    }
    return (await response.json()) || null;
  } catch (error) {
    console.error('[bot-knowledge-engine][candidate-case]', error.name === 'AbortError' ? 'timeout' : error.message);
    return null;
  } finally {
    timeout.clear();
  }
}

// Consults the external Knowledge Engine runtime for domain reasoning. This
// service can only ever contribute technical knowledge/citations — it is
// never permitted to assign a SKU (that authority belongs to PostgreSQL only).
//
// candidateCaseId is optional and, when supplied, only links this reasoning
// trace to an ALREADY-EXISTING HERMES research case (created separately and
// deliberately by lib/knowledge-governance/hermes-client.js when a real gap
// was detected) — this function itself no longer creates a candidate case
// on every call, since doing so on every single message produced one
// candidate case per message regardless of outcome, which is exactly the
// duplication Bloque 2 is required to prevent.
async function queryKnowledgeEngine(message, requestBody, state, candidateCaseId = null) {
  const url = process.env.KNOWLEDGE_ENGINE_RUNTIME_URL;
  const key = process.env.ENGINE_API_KEY;
  if (!url || !key) return { status: 'not_configured', answer: null, citations: [] };

  const sessionId = String(requestBody.conversation_id || requestBody.user_id || requestBody.contact_id || 'anonymous');
  const channel = String(requestBody.channel || 'api');
  // Spec-suggested Obsidian-equivalent timeout range is 4-6s.
  const timeout = timeoutSignal(5500);
  try {
    const response = await fetch(`${url}/api/knowledge-engine/v1/reason`, {
      method: 'POST',
      signal: timeout.signal,
      headers: { 'content-type': 'application/json', 'x-engine-api-key': key },
      body: JSON.stringify({
        query: message,
        audience: 'TECHNICAL_SUPPORT',
        channel: `${channel.toUpperCase()}_BOT`,
        correlationId: sessionId,
        candidateCaseId,
        context: {
          state,
          timestamp: new Date().toISOString()
        }
      })
    });
    if (!response.ok) {
      console.error('[bot-knowledge-engine] HTTP', response.status, (await response.text()).slice(0, 250));
      return { status: 'error', answer: null, citations: [], candidateCaseId };
    }
    const data = await response.json();
    return {
      status: data.action === 'ANSWER' && data.answer ? 'answered' : 'no_answer',
      answer: data.action === 'ANSWER' ? data.answer : null,
      confidence: data.confidence ?? null,
      citations: Array.isArray(data.citations) ? data.citations : [],
      action: data.action || null,
      candidateCaseId
    };
  } catch (error) {
    console.error('[bot-knowledge-engine]', error.name === 'AbortError' ? 'timeout' : error.message);
    return { status: error.name === 'AbortError' ? 'timeout' : 'error', answer: null, citations: [], candidateCaseId };
  } finally {
    timeout.clear();
  }
}

module.exports = { queryKnowledgeEngine, createCandidateCase };
