const DIRECT_INTENTS = new Set([
  'distribution_inquiry',
  'commercial_inquiry',
  'support_request',
  'general'
]);

function directAnswer(intent) {
  if (intent === 'distribution_inquiry') {
    return 'Para evaluar una oportunidad de distribución necesito país o territorio, tipo de clientes que atendés y experiencia en filtración, flotas o equipos pesados.';
  }
  if (intent === 'commercial_inquiry') {
    return 'Para preparar una cotización necesito el código o la aplicación exacta, la cantidad requerida y el país o ciudad de entrega.';
  }
  if (intent === 'support_request') {
    return 'Describí el equipo, el problema y cualquier código o referencia disponible. Con esos datos puedo iniciar la revisión técnica.';
  }
  return 'Indicá qué necesitás revisar: una aplicación, una equivalencia, una especificación, un diagnóstico técnico o información comercial.';
}

function installProtocolRouting(app) {
  app.use('/api/bot/protocol', (req, res, next) => {
    if (req.method !== 'POST') return next();

    const classification = req.body?.context?.ai_classification;
    const intent = classification?.intent;
    if (!DIRECT_INTENTS.has(intent)) return next();

    return res.json({
      protocol_version: '2.0.1',
      intent,
      phase: intent === 'general' ? 'conversation' : 'intake',
      plan: intent === 'general' ? ['identify_customer_need'] : ['collect_required_information'],
      entities: {
        references: classification?.entities?.references || [],
        equipment_tokens: classification?.entities?.equipment || [],
        year: classification?.entities?.year || null
      },
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
        lookup_status: 'not_required',
        products: []
      },
      answer: directAnswer(intent)
    });
  });
}

module.exports = { installProtocolRouting, directAnswer };
