const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MAX_IMAGE_DATA_URL_LENGTH = 4_500_000;

function cleanCode(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
}

function parseJsonObject(text) {
  const value = String(text || '').trim();
  try { return JSON.parse(value); } catch {
    const match = value.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try { return JSON.parse(match[0]); } catch { return null; }
  }
}

function normalizeVisionResult(raw = {}) {
  const references = Array.isArray(raw.references)
    ? raw.references.map(cleanCode).filter(code => code.length >= 4)
    : [];
  return {
    status: references.length ? 'reference_detected' : 'unreadable',
    brand: String(raw.brand || '').trim() || null,
    filter_type: String(raw.filter_type || '').trim() || null,
    references: [...new Set(references)].slice(0, 5),
    confidence: ['high', 'medium', 'low'].includes(raw.confidence) ? raw.confidence : 'low',
    notes: String(raw.notes || '').trim() || null
  };
}

async function inspectImage(imageDataUrl) {
  const apiKey = String(process.env.GROQ_API_KEY || '').trim();
  if (!apiKey) throw new Error('GROQ_API_KEY is required');
  if (!String(imageDataUrl || '').startsWith('data:image/')) throw new Error('image_data_url is invalid');
  if (imageDataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) throw new Error('image_data_url is too large');

  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0,
      max_completion_tokens: 500,
      response_format: { type: 'json_object' },
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Inspect this filter photo. Return JSON only with brand, filter_type, references, confidence and notes. Extract only exact printed part numbers. Never invent obscured characters.' },
          { type: 'image_url', image_url: { url: imageDataUrl } }
        ]
      }]
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || `groq_http_${response.status}`);
  return normalizeVisionResult(parseJsonObject(payload?.choices?.[0]?.message?.content) || {});
}

function registerBotProtocolImage(app, runBotProtocol, securityMiddleware) {
  const handlers = securityMiddleware ? [securityMiddleware] : [];
  app.post('/api/bot/protocol/image', ...handlers, async (req, res) => {
    try {
      const imageDataUrl = String(req.body?.image_data_url || '');
      const caption = String(req.body?.caption || '').trim();
      const vision = await inspectImage(imageDataUrl);

      if (vision.status !== 'reference_detected' || !vision.references.length || vision.confidence === 'low') {
        return res.json({
          protocol_version: '3.0.0',
          intent: 'image_reference_lookup',
          phase: 'collecting_filter_image',
          vision,
          evidence: { source: 'filter_image', count: 0, validated: false, products: [] },
          answer: vision.references.length
            ? `La foto parece mostrar ${vision.references.join(', ')}, pero no se distingue con suficiente claridad. Confirma el código por escrito o envía otra foto más cercana.`
            : 'No pude leer una referencia completa. Envía otra foto frontal, cercana, bien iluminada y sin reflejos.'
        });
      }

      const message = [
        `Referencia del filtro instalado: ${vision.references.join(', ')}.`,
        vision.brand ? `Marca visible: ${vision.brand}.` : null,
        vision.filter_type ? `Tipo visible: ${vision.filter_type}.` : null,
        caption ? `Comentario del cliente: ${caption}.` : null
      ].filter(Boolean).join(' ');

      const result = await runBotProtocol({ ...req.body, message });
      return res.json({ ...result, protocol_version: '3.0.0', vision });
    } catch (error) {
      console.error('[bot-protocol-image]', error.message);
      return res.status(500).json({ error: 'image_protocol_execution_failed' });
    }
  });
}

module.exports = { registerBotProtocolImage, normalizeVisionResult };
