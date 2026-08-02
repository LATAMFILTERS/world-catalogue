const DIAGNOSTIC_PATTERNS = [
  /ca[ií]da\s+de\s+presi[oó]n/i,
  /baja\s+presi[oó]n/i,
  /pierde\s+presi[oó]n/i,
  /presi[oó]n\s+(?:de\s+)?aceite\s+baja/i,
  /luz\s+(?:roja\s+)?de\s+aceite/i,
  /falla|fallando|problema|s[ií]ntoma/i,
  /pierde\s+potencia|sin\s+fuerza|humo/i,
  /se\s+apaga|no\s+arranca|restricci[oó]n|obstrucci[oó]n/i
];

function isDiagnosticMessage(message) {
  const value = String(message || '').trim();
  return value.length > 0 && DIAGNOSTIC_PATTERNS.some(pattern => pattern.test(value));
}

function hasEquipmentContext(body = {}) {
  const message = String(body.message || '');
  const context = body.context && typeof body.context === 'object' ? body.context : {};
  if (Array.isArray(context.equipment_tokens) && context.equipment_tokens.length) return true;
  return /\b(?:MACK|VOLVO|FREIGHTLINER|KENWORTH|PETERBILT|CUMMINS|DETROIT|JOHN\s*DEERE)\b/i.test(message) ||
    /\b(?:MP\d|DD\d+|SERIES\s*60|\d{3,4}\s*(?:CTS|STS))\b/i.test(message);
}

function installDiagnosticOverride(app) {
  app.use('/api/bot/protocol', (req, res, next) => {
    if (req.method !== 'POST' || !isDiagnosticMessage(req.body?.message)) return next();

    const originalJson = res.json.bind(res);
    res.json = payload => {
      if (payload?.intent === 'diagnostic') return originalJson(payload);

      const hasEquipment = hasEquipmentContext(req.body || {});
      const answer = hasEquipment
        ? '¿La caída de presión ocurre en frío, en caliente, en ralentí o bajo carga? Indica también desde cuándo comenzó.'
        : '¿En qué equipo ocurre la caída de presión de aceite? Indica marca, modelo, motor y año. Si la presión está por debajo del rango normal o se encendió la alerta roja, apaga el motor para evitar daños.';

      return originalJson({
        ...payload,
        protocol_version: '1.1.1',
        intent: 'diagnostic',
        phase: 'collecting_diagnostic_data',
        plan: [
          'identify_equipment',
          'identify_symptoms',
          'identify_duration',
          'identify_operating_context',
          'identify_business_impact'
        ],
        diagnostic: {
          ...(payload?.diagnostic || {}),
          missing_field: hasEquipment ? 'operating_condition' : 'equipment',
          complete: false,
          probable_cause: null
        },
        evidence: {
          source: 'elimfilters_catalog',
          count: 0,
          validated: false,
          products: []
        },
        answer
      });
    };

    next();
  });
}

module.exports = { installDiagnosticOverride, isDiagnosticMessage };
