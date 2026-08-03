const GREETING_PATTERN = /^(?:hola|buenas|buenos\s+d[ií]as|buenas\s+tardes|buenas\s+noches|saludos|hey|hello)(?:[\s!¡,.]+(?:elimfilters|equipo|amigo|amiga))?[\s!¡,.]*$/i;

function isStandaloneGreeting(value) {
  return GREETING_PATTERN.test(String(value || '').trim());
}

function installProtocolGreeting(app) {
  app.use('/api/bot/protocol', (req, res, next) => {
    if (req.method !== 'POST' || !isStandaloneGreeting(req.body?.message)) return next();

    return res.json({
      protocol_version: '1.2.3',
      intent: 'greeting',
      phase: 'conversation_start',
      plan: ['identify_customer_need'],
      entities: { references: [], equipment_tokens: [], year: null },
      diagnostic: {
        equipment_tokens: [],
        symptoms: [],
        duration: null,
        operating_context: null,
        impact: null,
        missing_field: null,
        complete: false
      },
      evidence: {
        source: 'elimfilters_catalog',
        count: 0,
        validated: false,
        products: []
      },
      answer: 'Hola. ¿En qué equipo o sistema necesitás ayuda? Podés indicar marca, modelo, motor, año y el problema que presenta.'
    });
  });
}

module.exports = { installProtocolGreeting, isStandaloneGreeting };
