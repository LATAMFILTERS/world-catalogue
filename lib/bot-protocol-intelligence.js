const INTENTS = new Set([
  'greeting',
  'diagnostic',
  'application_lookup',
  'exact_reference_lookup',
  'cross_reference_lookup',
  'specification_lookup',
  'distribution_inquiry',
  'commercial_inquiry',
  'support_request',
  'general'
]);

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

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

function conversationText(message, context = {}) {
  const history = Array.isArray(context.history) ? context.history.slice(-12) : [];
  return [...history, String(message || '')].filter(Boolean).join('\n');
}

function deterministicIntent(message, context = {}) {
  const value = String(message || '').trim();
  if (/^(?:hola|buenas|buenos\s+d[ií]as|buenas\s+tardes|buenas\s+noches|saludos|hello)[\s!¡,.]*$/i.test(value)) return 'greeting';
  if (/distribuidor|distribuci[oó]n|representar|territorio|dealer|importador/i.test(value)) return 'distribution_inquiry';
  if (/cotizaci[oó]n|precio|comprar|pedido|orden|disponibilidad/i.test(value)) return 'commercial_inquiry';
  if (/equivalente|equivalencia|cruce|cross\s*reference|reemplaza|sustituye/i.test(value)) return 'cross_reference_lookup';
  if (/especificaci[oó]n|medida|dimensi[oó]n|rosca|altura|di[aá]metro|micra|beta|caudal/i.test(value)) return 'specification_lookup';
  if (/falla|fallando|problema|s[ií]ntoma|presi[oó]n|pierde\s+potencia|humo|se\s+apaga|no\s+arranca|restricci[oó]n|obstrucci[oó]n/i.test(value)) return 'diagnostic';
  if (/recomiend|qu[eé]\s+filtros?|cu[aá]l(?:es)?\s+filtros?|aplicaci[oó]n|usa|lleva/i.test(value)) return 'application_lookup';
  if (/\b(?=[A-Z0-9-]{4,}\b)(?=[A-Z0-9-]*[A-Z])(?=[A-Z0-9-]*\d)[A-Z0-9]+(?:-[A-Z0-9]+)*\b/i.test(value)) return 'exact_reference_lookup';
  if (context.pending_field && context.active_intent) return context.active_intent;
  return 'general';
}

async function groqJson(messages, maxTokens = 500, temperature = 0) {
  if (!process.env.GROQ_API_KEY) return null;
  const timeout = timeoutSignal(6500);
  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      signal: timeout.signal,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: DEFAULT_GROQ_MODEL,
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
        messages
      })
    });
    if (!response.ok) {
      console.error('[bot-intelligence][groq] HTTP', response.status, (await response.text()).slice(0, 300));
      return null;
    }
    const data = await response.json();
    return safeJson(data?.choices?.[0]?.message?.content);
  } catch (error) {
    console.error('[bot-intelligence][groq]', error.name === 'AbortError' ? 'timeout' : error.message);
    return null;
  } finally {
    timeout.clear();
  }
}

async function classifyWithGroq(message, context = {}) {
  const fallback = deterministicIntent(message, context);
  if (context.pending_field && context.active_intent) {
    return { intent: context.active_intent, confidence: 1, source: 'pending_state', is_follow_up: true };
  }

  const result = await groqJson([
    {
      role: 'system',
      content: `Eres el enrutador central de ELIMFILTERS. Clasifica la intención usando únicamente una de estas etiquetas: ${[...INTENTS].join(', ')}. Considera toda la conversación. Un saludo acompañado de una consulta NO es greeting. Devuelve JSON: {"intent":"...","confidence":0.0,"is_follow_up":false,"entities":{"equipment":[],"references":[],"year":null},"reason":"breve"}.`
    },
    { role: 'user', content: conversationText(message, context) }
  ], 350, 0);

  if (!result || !INTENTS.has(result.intent)) return { intent: fallback, confidence: 0.55, source: 'deterministic', is_follow_up: false };
  return {
    intent: result.intent,
    confidence: Number(result.confidence || 0),
    source: 'groq',
    is_follow_up: Boolean(result.is_follow_up),
    entities: result.entities || {},
    reason: result.reason || null
  };
}

async function createCandidateCase(message, sessionId, channel, context = {}) {
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
        assetSummary: { equipment_tokens: context.equipment_tokens || [], active_intent: context.active_intent || null },
        structuredIntake: { sessionId, message, context }
      })
    });
    if (!response.ok) {
      console.error('[bot-intelligence][knowledge-center] HTTP', response.status);
      return null;
    }
    return (await response.json())?.id || null;
  } catch (error) {
    console.error('[bot-intelligence][knowledge-center]', error.name === 'AbortError' ? 'timeout' : error.message);
    return null;
  } finally {
    timeout.clear();
  }
}

async function queryKnowledge(message, requestBody, payload) {
  const url = process.env.KNOWLEDGE_ENGINE_RUNTIME_URL;
  const key = process.env.ENGINE_API_KEY;
  if (!url || !key) return { status: 'not_configured', answer: null, citations: [] };

  const sessionId = String(requestBody.conversation_id || requestBody.user_id || requestBody.contact_id || requestBody.context?.conversation_id || requestBody.context?.user_id || 'anonymous');
  const channel = String(requestBody.channel || requestBody.context?.channel || 'api');
  const candidateCaseId = await createCandidateCase(message, sessionId, channel, requestBody.context || {});
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
          conversation: requestBody.context || {},
          intent: payload.intent,
          phase: payload.phase,
          catalogEvidence: payload.evidence || null,
          timestamp: new Date().toISOString()
        }
      })
    });
    if (!response.ok) {
      console.error('[bot-intelligence][knowledge-engine] HTTP', response.status, (await response.text()).slice(0, 250));
      return { status: 'error', answer: null, citations: [], candidateCaseId };
    }
    const data = await response.json();
    return {
      status: data.action === 'ANSWER' && data.answer ? 'answered' : 'no_answer',
      answer: data.action === 'ANSWER' ? data.answer : null,
      confidence: data.confidence ?? null,
      citations: Array.isArray(data.citations) ? data.citations : [],
      action: data.action || null,
      verificationRequests: data.verificationRequests || [],
      candidateCaseId
    };
  } catch (error) {
    console.error('[bot-intelligence][knowledge-engine]', error.name === 'AbortError' ? 'timeout' : error.message);
    return { status: error.name === 'AbortError' ? 'timeout' : 'error', answer: null, citations: [], candidateCaseId };
  } finally {
    timeout.clear();
  }
}

function shouldUseKnowledge(payload = {}) {
  if (payload.intent === 'greeting') return false;
  if (payload.phase === 'collecting_diagnostic_data' || payload.phase === 'collecting_application_data') return false;
  return ['diagnostic', 'specification_lookup', 'general', 'support_request'].includes(payload.intent);
}

async function synthesizeAnswer(message, requestBody, payload, knowledge) {
  if (!process.env.GROQ_API_KEY) return payload.answer;
  if (payload.phase === 'collecting_diagnostic_data' || payload.phase === 'collecting_application_data') return payload.answer;

  const products = Array.isArray(payload.evidence?.products) ? payload.evidence.products : [];
  const catalogEvidence = products.map(product => ({
    sku: product.sku,
    codigo_base: product.codigo_base,
    name: product.name,
    filter_type: product.filter_type,
    specs: product.specs,
    equipment_applications: product.equipment_applications
  }));

  const result = await groqJson([
    {
      role: 'system',
      content: `Eres el cerebro técnico central de ELIMFILTERS. Responde en español claro y profesional. Usa el historial, la evidencia del Knowledge Engine y el catálogo. Reglas absolutas: 1) no inventes SKU, equivalencias, aplicaciones ni especificaciones; 2) solo menciona SKU presentes en catalog_evidence; 3) si catalog_evidence está vacío, explica que no existe validación de catálogo; 4) conserva preguntas pendientes y no repitas campos ya resueltos; 5) ante riesgos mecánicos graves prioriza seguridad; 6) no hables de tecnologías ajenas como recomendación. Devuelve JSON {"answer":"texto final"}.`
    },
    {
      role: 'user',
      content: JSON.stringify({
        message,
        history: requestBody.context?.history || [],
        intent: payload.intent,
        phase: payload.phase,
        diagnostic: payload.diagnostic || null,
        deterministic_answer: payload.answer,
        knowledge_answer: knowledge?.answer || null,
        knowledge_citations: knowledge?.citations || [],
        catalog_validated: payload.evidence?.validated === true,
        catalog_evidence: catalogEvidence
      })
    }
  ], 900, 0.1);

  return typeof result?.answer === 'string' && result.answer.trim() ? result.answer.trim() : payload.answer;
}

function installProtocolIntelligence(app) {
  app.use('/api/bot/protocol', async (req, res, next) => {
    if (req.method !== 'POST') return next();
    const message = String(req.body?.message || '').trim();
    if (!message) return next();

    try {
      const context = req.body?.context && typeof req.body.context === 'object' ? req.body.context : {};
      const classification = await classifyWithGroq(message, context);
      const preservePending = Boolean(context.pending_field && context.active_intent);
      req.body = {
        ...(req.body || {}),
        context: {
          ...context,
          active_intent: preservePending ? context.active_intent : classification.intent,
          ai_classification: classification
        }
      };

      const originalJson = res.json.bind(res);
      res.json = payload => {
        const finalize = async () => {
          let knowledge = { status: 'skipped', answer: null, citations: [] };
          if (shouldUseKnowledge(payload)) knowledge = await queryKnowledge(message, req.body || {}, payload);
          const answer = await synthesizeAnswer(message, req.body || {}, payload, knowledge);
          const finalPayload = {
            ...payload,
            protocol_version: '2.0.0',
            answer,
            intelligence: {
              classifier: classification.source,
              classified_intent: classification.intent,
              confidence: classification.confidence,
              groq_enabled: Boolean(process.env.GROQ_API_KEY),
              knowledge_status: knowledge.status,
              knowledge_confidence: knowledge.confidence ?? null,
              citations: knowledge.citations || [],
              candidate_case_id: knowledge.candidateCaseId || null
            }
          };
          console.info('[bot-intelligence]', {
            channel: req.body?.channel || req.body?.context?.channel || 'api',
            intent: finalPayload.intent,
            classified_intent: classification.intent,
            phase: finalPayload.phase,
            groq: Boolean(process.env.GROQ_API_KEY),
            knowledge: knowledge.status,
            catalog_evidence: finalPayload.evidence?.count || 0
          });
          return originalJson(finalPayload);
        };
        void finalize().catch(error => {
          console.error('[bot-intelligence][finalize]', error.message);
          originalJson(payload);
        });
        return res;
      };
    } catch (error) {
      console.error('[bot-intelligence][prepare]', error.message);
    }
    return next();
  });
}

module.exports = {
  installProtocolIntelligence,
  deterministicIntent,
  classifyWithGroq,
  queryKnowledge,
  synthesizeAnswer
};
