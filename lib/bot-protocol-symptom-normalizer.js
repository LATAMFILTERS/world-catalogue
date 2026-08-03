'use strict';

const SYMPTOM_RULES = [
  ['water_contamination', /\b(?:agua|humedad)\s+(?:en|dentro\s+de)\s+(?:el\s+)?(?:sistema|circuito|l[ií]nea|filtro|tanque|dep[oó]sito)\b/i],
  ['water_in_fuel', /\bagua\s+en\s+(?:el\s+)?(?:combustible|di[eé]sel|diesel|gasoil)\b/i],
  ['coolant_contamination', /\bagua\s+en\s+(?:el\s+)?(?:aceite|lubricante)|aceite\s+(?:lechoso|color\s+caf[eé]\s+con\s+leche)\b/i],
  ['pressure_loss', /\b(?:ca[ií]da|p[eé]rdida|baja)\s+de\s+presi[oó]n\b/i],
  ['power_loss', /\b(?:p[eé]rdida\s+de\s+potencia|pierde\s+potencia|sin\s+fuerza)\b/i],
  ['restriction', /\b(?:restricci[oó]n|obstrucci[oó]n|filtro\s+tapado)\b/i],
  ['contamination', /\b(?:contaminaci[oó]n|sedimento|suciedad|part[ií]culas)\b/i]
];

function detectSymptoms(message) {
  const text = String(message || '').trim();
  if (!text) return [];
  return [...new Set(SYMPTOM_RULES.filter(([, pattern]) => pattern.test(text)).map(([name]) => name))];
}

function installProtocolSymptomNormalizer(app) {
  app.use('/api/bot/protocol', (req, _res, next) => {
    if (req.method !== 'POST') return next();

    const detected = detectSymptoms(req.body?.message);
    if (!detected.length) return next();

    const context = req.body?.context && typeof req.body.context === 'object' ? req.body.context : {};
    const existing = Array.isArray(context.symptoms) ? context.symptoms : [];

    req.body = {
      ...(req.body || {}),
      context: {
        ...context,
        active_intent: 'diagnostic',
        symptoms: [...new Set([...existing, ...detected])]
      }
    };

    console.info('[bot-symptom-normalizer]', {
      detected,
      pending_field: context.pending_field || null
    });

    return next();
  });
}

module.exports = {
  installProtocolSymptomNormalizer,
  detectSymptoms
};
