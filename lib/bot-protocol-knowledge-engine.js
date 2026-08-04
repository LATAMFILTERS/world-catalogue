'use strict';

function timeoutSignal(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

async function createCandidateCase(message, sessionId, channel, state = {}) {
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
        externalId: `BOT-${channel}-${sessionId}-${Date.now()}`,
        sourceChannel: `${String(channel || 'API').toUpperCase()}_BOT`,
        priority: 'NORMAL',
        symptomSummary: String(message).slice(0, 500),
        assetSummary: { equipment: state.equipment || {}, intent: state.intent || null },
        structuredIntake: { sessionId, message, state }
      })
    });
    if (!response.ok) {
      console.error('[bot-knowledge-engine][candidate-case] HTTP', response.status);
      return null;
    }
    return (await response.json())?.id || null;
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
async function queryKnowledgeEngine(message, requestBody, state) {
  const url = process.env.KNOWLEDGE_ENGINE_RUNTIME_URL;
  const key = process.env.ENGINE_API_KEY;
  if (!url || !key) return { status: 'not_configured', answer: null, citations: [] };

  const sessionId = String(requestBody.conversation_id || requestBody.user_id || requestBody.contact_id || 'anonymous');
  const channel = String(requestBody.channel || 'api');
  const candidateCaseId = await createCandidateCase(message, sessionId, channel, state);
  const timeout = timeoutSignal(9000);
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

module.exports = { queryKnowledgeEngine };
