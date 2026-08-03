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

function conversationText(body = {}) {
  const context = body.context && typeof body.context === 'object' ? body.context : {};
  const history = Array.isArray(context.history) ? context.history.join(' ') : '';
  return `${history} ${String(body.message || '')}`.trim();
}

function nextDiagnosticStep(body = {}) {
  const context = body.context && typeof body.context === 'object' ? body.context : {};
  const combined = conversationText(body);

  if (!hasEquipmentContext(body)) {
    return {
      field: 'equipment',
      answer: '¿En qué equipo ocurre la caída de presión de aceite? Indica marca, modelo, motor y año. Si se encendió la alerta roja o la presión está por debajo del rango normal, apaga el motor para evitar daños.'
    };
  }

  if (!/\b(?:en\s+)?(?:fr[ií]o|caliente|ralent[ií]|bajo\s+carga|en\s+carga)\b/i.test(combined)) {
    return {
      field: 'operating_condition',
      answer: '¿La caída de presión ocurre en frío, en caliente, en ralentí o bajo carga?'
    };
  }

  if (!context.duration && !/(?:desde\s+hace|hace|desde)\s+[^,.!?]+/i.test(combined)) {
    return {
      field: 'duration',
      answer: '¿Desde cuándo ocurre la caída de presión de aceite?'
    };
  }

  if (!context.operating_context && !/carretera|flota|transporte|min(?:a|er[ií]a)|construcci[oó]n|obra|agricultura|agr[ií]cola|generaci[oó]n|marino|industrial/i.test(combined)) {
    return {
      field: 'operating_context',
      answer: '¿En qué tipo de operación trabaja el equipo: carretera, minería, construcción, agricultura u otra?'
    };
  }

  if (!context.impact && !/detenid[oa]|parad[oa]|fuera\s+de\s+servicio|p[eé]rdida\s+de\s+potencia|mayor\s+consumo|riesgo\s+de\s+daño|producci[oó]n|retraso|downtime/i.test(combined)) {
    return {
      field: 'impact',
      answer: '¿Qué impacto está causando: equipo detenido, pérdida de potencia, mayor consumo o riesgo de daño?'
    };
  }

  return {
    field: null,
    answer: 'La información diagnóstica básica está completa. La causa probable debe confirmarse revisando nivel y viscosidad del aceite, sensor y manómetro, filtro, válvula de alivio, bomba y holguras internas. No operes el motor si la presión permanece por debajo del rango especificado por el fabricante.'
  };
}

function installDiagnosticOverride(app) {
  app.use('/api/bot/protocol', (req, res, next) => {
    const context = req.body?.context && typeof req.body.context === 'object' ? req.body.context : {};
    const continuingDiagnostic = context.active_intent === 'diagnostic';
    if (req.method !== 'POST' || (!isDiagnosticMessage(req.body?.message) && !continuingDiagnostic)) return next();

    const originalJson = res.json.bind(res);
    res.json = payload => {
      if (payload?.intent === 'diagnostic') return originalJson(payload);

      const step = nextDiagnosticStep(req.body || {});
      return originalJson({
        ...payload,
        protocol_version: '1.1.2',
        intent: 'diagnostic',
        phase: step.field ? 'collecting_diagnostic_data' : 'diagnostic_assessment',
        plan: [
          'identify_equipment',
          'identify_symptoms',
          'identify_duration',
          'identify_operating_context',
          'identify_business_impact'
        ],
        diagnostic: {
          ...(payload?.diagnostic || {}),
          equipment_tokens: context.equipment_tokens || payload?.entities?.equipment_tokens || [],
          symptoms: context.symptoms?.length ? context.symptoms : ['pressure_loss'],
          duration: context.duration || null,
          operating_context: context.operating_context || null,
          impact: context.impact || null,
          missing_field: step.field,
          complete: !step.field,
          probable_cause: step.field ? null : 'oil_pressure_loss_requires_mechanical_confirmation'
        },
        evidence: {
          source: 'elimfilters_catalog',
          count: 0,
          validated: false,
          products: []
        },
        answer: step.answer
      });
    };

    next();
  });
}

module.exports = { installDiagnosticOverride, isDiagnosticMessage, nextDiagnosticStep };
