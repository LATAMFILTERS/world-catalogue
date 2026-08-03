const { withProtocolClient } = require('./bot-protocol-db');

const MAX_RESULTS = 8;

function normalizeReference(value) {
  return String(value || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

function extractReferences(text) {
  const matches = String(text || '').match(/\b[A-Z]{1,6}[- ]?\d{3,}[A-Z0-9-]*\b/gi) || [];
  return [...new Set(matches.map(normalizeReference).filter(reference => {
    if (!reference) return false;
    if (/^[A-Z](?:19|20)\d{2}$/.test(reference)) return false;
    return true;
  }))];
}

function extractEquipmentTokens(text) {
  const source = String(text || '').toUpperCase();
  const brands = source.match(/\b(?:JOHN\s*DEERE|MACK|VOLVO|FREIGHTLINER|KENWORTH|PETERBILT|CUMMINS|DETROIT)\b/g) || [];
  const models = source.match(/\b(?:9650(?:\s+(?:CTS|STS))?|MP\d|DD60|SERIES\s*60|[A-Z]{1,4}\d{2,5}[A-Z]{0,4})\b/g) || [];
  return [...new Set([...brands, ...models].flatMap(value => value.split(/\s+/)).filter(value => value.length >= 2))];
}

function extractYear(text) {
  const match = String(text || '').match(/\b(19[8-9]\d|20[0-3]\d)\b/);
  return match ? match[1] : null;
}

function classifyIntent(text, references, equipmentTokens, context = {}) {
  const value = String(text || '');
  if (context.active_intent === 'diagnostic') return 'diagnostic';
  if (/equivalente|equivalencia|cruce|cross\s*reference|reemplaza|sustituye/i.test(value)) return 'cross_reference_lookup';
  if (/especificaci[oó]n|medida|dimensi[oó]n|rosca|altura|di[aá]metro|micra|beta|caudal|presi[oó]n/i.test(value)) return 'specification_lookup';
  if (/falla|fallando|problema|s[ií]ntoma|pierde potencia|humo|contaminaci[oó]n|agua en combustible|se apaga|no arranca|restricci[oó]n/i.test(value)) return 'diagnostic';
  if (/recomiend|qu[eé]\s+filtros?|cu[aá]l(?:es)?\s+filtros?|aplicaci[oó]n|usa|lleva/i.test(value) && equipmentTokens.length) return 'application_lookup';
  if (context.active_intent === 'application_lookup' || context.pending_field === 'application_year') return 'application_lookup';
  if (references.length) return 'exact_reference_lookup';
  return 'general';
}

function buildPlan(intent) {
  if (intent === 'application_lookup') return ['identify_equipment', 'identify_engine', 'identify_year', 'search_applications', 'validate_recommendation'];
  if (intent === 'diagnostic') return ['identify_equipment', 'identify_symptoms', 'identify_duration', 'identify_operating_context', 'identify_business_impact', 'search_applications', 'validate_conditional_recommendation'];
  if (intent === 'cross_reference_lookup' || intent === 'exact_reference_lookup') return ['search_catalog', 'retrieve_technical_sheet', 'validate_catalog_evidence'];
  if (intent === 'specification_lookup') return ['search_catalog', 'retrieve_technical_sheet', 'validate_specifications'];
  return ['use_general_conversation_flow'];
}

const SELECT_FIELDS = `id, sku, codigo_base, name, description, filter_type, sub_type, technology,
  thread_size, height_mm, outer_diameter_mm, gasket_od_mm, gasket_id_mm,
  micron_rating, nominal_efficiency, filter_media, oem_codes,
  competitor_codes, brand_crossrefs, equipment_applications, specs,
  enrichment_data, is_primary`;

function normalizeProduct(row) {
  return {
    ...row,
    oem_codes: row.oem_codes || [],
    competitor_codes: row.competitor_codes || [],
    brand_crossrefs: row.brand_crossrefs || {},
    equipment_applications: row.equipment_applications || [],
    specs: row.specs || {},
    enrichment_data: row.enrichment_data || {}
  };
}

async function searchReferences(references) {
  if (!references.length) return [];
  return withProtocolClient(async client => {
    const direct = await client.query(
      `SELECT ${SELECT_FIELDS} FROM elimfilters_catalog
       WHERE sku = ANY($1::text[]) OR codigo_base = ANY($1::text[])
       ORDER BY is_primary DESC NULLS LAST, sku ASC LIMIT ${MAX_RESULTS}`,
      [references]
    );
    if (direct.rows.length) return direct.rows.map(normalizeProduct);

    const cross = await client.query(
      `SELECT ${SELECT_FIELDS} FROM elimfilters_catalog
       WHERE oem_codes @> to_jsonb($1::text[])
          OR competitor_codes @> to_jsonb($1::text[])
          OR brand_crossrefs::text ILIKE ANY($2::text[])
       ORDER BY is_primary DESC NULLS LAST, sku ASC LIMIT ${MAX_RESULTS}`,
      [references, references.map(ref => `%${ref}%`)]
    );
    return cross.rows.map(normalizeProduct);
  }, { statementTimeoutMs: 1400 });
}

function strongestApplicationToken(tokens) {
  return [...tokens].sort((a, b) => {
    const aScore = /\d/.test(a) ? a.length + 20 : a.length;
    const bScore = /\d/.test(b) ? b.length + 20 : b.length;
    return bScore - aScore;
  })[0] || null;
}

async function searchApplications(tokens, year = null) {
  const token = strongestApplicationToken(tokens);
  if (!token) return [];
  return withProtocolClient(async client => {
    const params = [`%${token}%`];
    let yearClause = '';
    if (year) {
      params.push(`%${year}%`);
      yearClause = ' AND equipment_applications::text ILIKE $2';
    }
    const result = await client.query(
      `SELECT ${SELECT_FIELDS} FROM elimfilters_catalog
       WHERE equipment_applications::text ILIKE $1${yearClause}
       ORDER BY filter_type ASC, is_primary DESC NULLS LAST, sku ASC
       LIMIT ${MAX_RESULTS}`,
      params
    );
    return result.rows.map(normalizeProduct);
  }, { statementTimeoutMs: 1200 });
}

function extractDiagnosticData(message, context = {}) {
  const text = String(message || '');
  const history = Array.isArray(context.history) ? context.history.join(' ') : '';
  const combined = `${history} ${text}`.trim();
  const symptoms = [];
  const patterns = [
    ['power_loss', /p[eé]rdida de potencia|pierde potencia|sin fuerza/i],
    ['black_smoke', /humo negro/i], ['white_smoke', /humo blanco/i],
    ['hard_start', /arranque dif[ií]cil|le cuesta arrancar|no arranca/i],
    ['engine_stall', /se apaga|apagones/i], ['high_consumption', /alto consumo|consume m[aá]s combustible/i],
    ['water_in_fuel', /agua en (?:el )?combustible|agua en diesel|agua en di[eé]sel/i],
    ['contamination', /contaminaci[oó]n|suciedad|sedimento|part[ií]culas/i],
    ['pressure_loss', /baja presi[oó]n|pierde presi[oó]n|ca[ií]da de presi[oó]n/i], ['restriction', /restricci[oó]n|filtro tapado|obstrucci[oó]n/i]
  ];
  for (const [key, pattern] of patterns) if (pattern.test(combined)) symptoms.push(key);
  const durationMatch = combined.match(/(?:desde hace|hace)\s+([^,.!?]+)/i);
  return {
    equipment_tokens: context.equipment_tokens?.length ? context.equipment_tokens : extractEquipmentTokens(combined),
    symptoms: context.symptoms?.length ? context.symptoms : [...new Set(symptoms)],
    duration: context.duration || durationMatch?.[1]?.trim() || null,
    operating_context: context.operating_context || (/mina|minero|miner[ií]a/i.test(combined) ? 'mining' : /construcci[oó]n|obra/i.test(combined) ? 'construction' : /agricultura|agr[ií]cola|cosecha/i.test(combined) ? 'agriculture' : /flota|carretera|transporte/i.test(combined) ? 'fleet' : null),
    impact: context.impact || (/parad[oa]|fuera de servicio|detenido|no puede trabajar/i.test(combined) ? 'equipment_down' : /producci[oó]n|operaci[oó]n|entrega|retraso|downtime/i.test(combined) ? 'operational_loss' : null)
  };
}

function nextDiagnosticQuestion(data) {
  if (!data.equipment_tokens.length) return { field: 'equipment', question: '¿Cuál es la marca, modelo y motor exactos del equipo?' };
  if (!data.symptoms.length) return { field: 'symptoms', question: '¿Qué síntomas observás exactamente en el equipo?' };
  if (!data.duration) return { field: 'duration', question: '¿Desde cuándo ocurre el problema?' };
  if (!data.operating_context) return { field: 'operating_context', question: '¿En qué tipo de operación trabaja el equipo: carretera, minería, construcción, agricultura u otra?' };
  if (!data.impact) return { field: 'impact', question: '¿Qué impacto está causando: equipo detenido, pérdida de potencia, mayor consumo o riesgo de daño?' };
  return null;
}

function inferProbableCause(data) {
  const symptoms = new Set(data.symptoms);
  if (symptoms.has('water_in_fuel')) return 'water_contamination_in_fuel';
  if (symptoms.has('restriction') || symptoms.has('pressure_loss')) return 'filter_restriction_or_flow_loss';
  if (symptoms.has('power_loss') && symptoms.has('black_smoke')) return 'air_or_fuel_delivery_restriction';
  if (symptoms.has('hard_start') || symptoms.has('engine_stall')) return 'fuel_delivery_contamination_or_restriction';
  if (symptoms.has('contamination')) return 'fluid_contamination';
  return 'cause_requires_technical_confirmation';
}

function buildCatalogAnswer(intent, products, references) {
  if (!products.length) {
    if (references.length) return `No encontré una equivalencia confirmada para ${references.join(', ')} en el catálogo ELIMFILTERS. No se asignará un SKU sin evidencia.`;
    return 'No encontré una aplicación confirmada en el catálogo ELIMFILTERS. Confirma marca, modelo, motor y año del equipo.';
  }
  const lines = products.map(product => `• ${product.sku}${product.codigo_base ? ` / ${product.codigo_base}` : ''}`);
  return `${intent === 'application_lookup' ? 'Aplicaciones confirmadas' : 'Referencia confirmada'} en el catálogo ELIMFILTERS:\n\n${lines.join('\n')}`;
}

function equipmentLabel(tokens) {
  return tokens.length ? tokens.join(' ') : 'el equipo';
}

async function processQuery(message, context = {}) {
  const historyText = Array.isArray(context.history) ? context.history.join(' ') : '';
  const combinedText = `${historyText} ${message}`.trim();
  const references = extractReferences(message);
  const equipmentTokens = context.equipment_tokens?.length
    ? context.equipment_tokens
    : extractEquipmentTokens(combinedText);
  const year = extractYear(combinedText);
  const intent = classifyIntent(message, references, equipmentTokens, context);
  const plan = buildPlan(intent);

  if (intent === 'application_lookup' && !year) {
    return {
      protocol_version: '1.2.2', intent, phase: 'collecting_application_data', plan,
      entities: { references, equipment_tokens: equipmentTokens, year: null },
      diagnostic: { missing_field: 'application_year', complete: false },
      evidence: { source: 'elimfilters_catalog', count: 0, validated: false, products: [] },
      answer: `¿De qué año es ${equipmentLabel(equipmentTokens)}? Con marca, modelo, motor y año exactos valido la aplicación antes de recomendar un filtro.`
    };
  }

  if (intent === 'diagnostic') {
    const diagnostic = extractDiagnosticData(message, context);
    const next = nextDiagnosticQuestion(diagnostic);
    let products = [];
    if (!next && diagnostic.equipment_tokens.length) products = await searchApplications(diagnostic.equipment_tokens, year);
    return {
      protocol_version: '1.2.2', intent,
      phase: next ? 'collecting_diagnostic_data' : 'diagnostic_assessment', plan,
      entities: { references, equipment_tokens: diagnostic.equipment_tokens, year },
      diagnostic: { ...diagnostic, probable_cause: next ? null : inferProbableCause(diagnostic), missing_field: next?.field || null, complete: !next },
      evidence: { source: 'elimfilters_catalog', count: products.length, validated: products.length > 0, products },
      answer: next ? next.question : `${products.length ? buildCatalogAnswer('application_lookup', products, []) : 'Diagnóstico preliminar completado sin una aplicación exacta confirmada en catálogo.'}\n\nCausa probable: ${inferProbableCause(diagnostic)}. La recomendación queda condicionada a verificación técnica.`
    };
  }

  let products = [];
  if (plan.includes('search_catalog')) products = await searchReferences(references);
  if (plan.includes('search_applications')) products = await searchApplications(equipmentTokens, year);
  return {
    protocol_version: '1.2.2', intent, phase: 'catalog_resolution', plan,
    entities: { references, equipment_tokens: equipmentTokens, year },
    diagnostic: intent === 'application_lookup' ? { missing_field: null, complete: true } : undefined,
    evidence: { source: 'elimfilters_catalog', count: products.length, validated: products.length > 0, products },
    answer: buildCatalogAnswer(intent, products, references)
  };
}

function registerBotProtocol(app) {
  app.post('/api/bot/protocol', async (req, res) => {
    const startedAt = Date.now();
    try {
      const message = String(req.body?.message || '').trim();
      if (!message) return res.status(400).json({ error: 'message is required' });
      const context = req.body?.context && typeof req.body.context === 'object' ? req.body.context : {};
      const result = await processQuery(message, context);
      console.info('[bot-protocol]', { intent: result.intent, phase: result.phase, duration_ms: Date.now() - startedAt, evidence_count: result.evidence?.count || 0 });
      return res.json(result);
    } catch (error) {
      console.error('[bot-protocol]', { error: error.message, stack: error.stack, duration_ms: Date.now() - startedAt });
      return res.status(503).json({ error: 'protocol_temporarily_unavailable' });
    }
  });
}

module.exports = { registerBotProtocol, processQuery, extractDiagnosticData, nextDiagnosticQuestion, extractYear, strongestApplicationToken, classifyIntent, extractReferences };
