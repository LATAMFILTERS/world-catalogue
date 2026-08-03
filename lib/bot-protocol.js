const { Pool } = require('pg');

const MAX_RESULTS = 8;
let pool = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

function normalizeReference(value) {
  return String(value || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

function extractReferences(text) {
  const matches = String(text || '').match(/\b[A-Z]{1,6}[- ]?\d{3,}[A-Z0-9-]*\b/gi) || [];
  return [...new Set(matches.map(normalizeReference).filter(Boolean))];
}

function extractEquipmentTokens(text) {
  const source = String(text || '').toUpperCase();
  const brands = source.match(/\b(?:JOHN\s*DEERE|MACK|VOLVO|FREIGHTLINER|KENWORTH|PETERBILT|CUMMINS|DETROIT)\b/g) || [];
  const models = source.match(/\b(?:9650(?:\s+(?:CTS|STS))?|MP\d|DD60|SERIES\s*60|[A-Z]{1,4}\d{2,5}[A-Z]{0,4})\b/g) || [];
  return [...new Set([...brands, ...models].flatMap(value => value.split(/\s+/)).filter(value => value.length >= 2))];
}

function classifyIntent(text, references, equipmentTokens) {
  const value = String(text || '');
  if (/equivalente|equivalencia|cruce|cross\s*reference|reemplaza|sustituye/i.test(value)) return 'cross_reference_lookup';
  if (/especificaci[oó]n|medida|dimensi[oó]n|rosca|altura|di[aá]metro|micra|beta|caudal|presi[oó]n/i.test(value)) return 'specification_lookup';
  if (/falla|fallando|problema|s[ií]ntoma|pierde potencia|humo|contaminaci[oó]n|agua en combustible|se apaga|no arranca|restricci[oó]n/i.test(value)) return 'diagnostic';
  if (/qu[eé]\s+filtros?|cu[aá]l(?:es)?\s+filtros?|aplicaci[oó]n|usa|lleva/i.test(value) && equipmentTokens.length) return 'application_lookup';
  if (references.length) return 'exact_reference_lookup';
  return 'general';
}

function buildPlan(intent) {
  switch (intent) {
    case 'cross_reference_lookup':
    case 'exact_reference_lookup':
      return ['search_catalog', 'retrieve_technical_sheet', 'validate_catalog_evidence'];
    case 'specification_lookup':
      return ['search_catalog', 'retrieve_technical_sheet', 'validate_specifications'];
    case 'application_lookup':
      return ['search_applications', 'retrieve_candidate_skus', 'validate_recommendation'];
    case 'diagnostic':
      return ['identify_equipment', 'identify_symptoms', 'identify_duration', 'identify_operating_context', 'identify_business_impact', 'search_applications', 'validate_conditional_recommendation'];
    default:
      return ['use_general_conversation_flow'];
  }
}

const SELECT_FIELDS = `
  id, sku, codigo_base, name, description, filter_type, sub_type, technology,
  thread_size, height_mm, outer_diameter_mm, gasket_od_mm, gasket_id_mm,
  micron_rating, nominal_efficiency, filter_media, oem_codes,
  competitor_codes, brand_crossrefs, equipment_applications, specs,
  enrichment_data, is_primary
`;

function normalizeProduct(row) {
  return {
    id: row.id,
    sku: row.sku,
    codigo_base: row.codigo_base,
    name: row.name,
    description: row.description,
    filter_type: row.filter_type,
    sub_type: row.sub_type,
    technology: row.technology,
    thread_size: row.thread_size,
    height_mm: row.height_mm,
    outer_diameter_mm: row.outer_diameter_mm,
    gasket_od_mm: row.gasket_od_mm,
    gasket_id_mm: row.gasket_id_mm,
    micron_rating: row.micron_rating,
    nominal_efficiency: row.nominal_efficiency,
    filter_media: row.filter_media,
    oem_codes: row.oem_codes || [],
    competitor_codes: row.competitor_codes || [],
    brand_crossrefs: row.brand_crossrefs || {},
    equipment_applications: row.equipment_applications || [],
    specs: row.specs || {},
    enrichment_data: row.enrichment_data || {},
    is_primary: row.is_primary
  };
}

async function searchReferences(references) {
  if (!references.length) return [];
  const result = await getPool().query(
    `SELECT ${SELECT_FIELDS}
     FROM elimfilters_catalog
     WHERE EXISTS (
       SELECT 1 FROM unnest($1::text[]) ref
       WHERE regexp_replace(upper(coalesce(sku, '')), '[^A-Z0-9]', '', 'g') = ref
          OR regexp_replace(upper(coalesce(codigo_base, '')), '[^A-Z0-9]', '', 'g') = ref
          OR regexp_replace(upper(coalesce(oem_codes::text, '')), '[^A-Z0-9]', '', 'g') LIKE '%' || ref || '%'
          OR regexp_replace(upper(coalesce(competitor_codes::text, '')), '[^A-Z0-9]', '', 'g') LIKE '%' || ref || '%'
          OR regexp_replace(upper(coalesce(brand_crossrefs::text, '')), '[^A-Z0-9]', '', 'g') LIKE '%' || ref || '%'
     )
     ORDER BY is_primary DESC NULLS LAST, sku ASC
     LIMIT ${MAX_RESULTS}`,
    [references]
  );
  return result.rows.map(normalizeProduct);
}

async function searchApplications(tokens) {
  if (!tokens.length) return [];
  const result = await getPool().query(
    `SELECT ${SELECT_FIELDS}
     FROM elimfilters_catalog
     WHERE equipment_applications IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM unnest($1::text[]) token
         WHERE upper(equipment_applications::text) NOT LIKE '%' || token || '%'
       )
     ORDER BY filter_type ASC, is_primary DESC NULLS LAST, sku ASC
     LIMIT ${MAX_RESULTS}`,
    [tokens]
  );
  return result.rows.map(normalizeProduct);
}

function extractDiagnosticData(message, context = {}) {
  const text = String(message || '');
  const history = Array.isArray(context.history) ? context.history.join(' ') : '';
  const combined = `${history} ${text}`.trim();
  const equipmentTokens = extractEquipmentTokens(combined);

  const symptoms = [];
  const symptomPatterns = [
    ['power_loss', /p[eé]rdida de potencia|pierde potencia|sin fuerza/i],
    ['black_smoke', /humo negro/i],
    ['white_smoke', /humo blanco/i],
    ['hard_start', /arranque dif[ií]cil|le cuesta arrancar|no arranca/i],
    ['engine_stall', /se apaga|apagones/i],
    ['high_consumption', /alto consumo|consume m[aá]s combustible/i],
    ['water_in_fuel', /agua en (?:el )?combustible|agua en diesel|agua en di[eé]sel/i],
    ['contamination', /contaminaci[oó]n|suciedad|sedimento|part[ií]culas/i],
    ['pressure_loss', /baja presi[oó]n|pierde presi[oó]n/i],
    ['restriction', /restricci[oó]n|filtro tapado|obstrucci[oó]n/i]
  ];
  for (const [key, pattern] of symptomPatterns) if (pattern.test(combined)) symptoms.push(key);

  const durationMatch = combined.match(/(?:desde hace|hace)\s+([^,.!?]+)/i);
  const duration = context.duration || durationMatch?.[1]?.trim() || null;
  const operatingContext = context.operating_context || (
    /mina|minero|miner[ií]a/i.test(combined) ? 'mining' :
    /construcci[oó]n|obra/i.test(combined) ? 'construction' :
    /agricultura|agr[ií]cola|cosecha/i.test(combined) ? 'agriculture' :
    /flota|carretera|transporte/i.test(combined) ? 'fleet' : null
  );
  const impact = context.impact || (
    /parad[oa]|fuera de servicio|detenido|no puede trabajar/i.test(combined) ? 'equipment_down' :
    /producci[oó]n|operaci[oó]n|entrega|retraso|downtime/i.test(combined) ? 'operational_loss' : null
  );

  return {
    equipment_tokens: context.equipment_tokens?.length ? context.equipment_tokens : equipmentTokens,
    symptoms: context.symptoms?.length ? context.symptoms : [...new Set(symptoms)],
    duration,
    operating_context: operatingContext,
    impact
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

  const lines = products.map(product => {
    const oem = (Array.isArray(product.oem_codes) ? product.oem_codes : [])
      .map(item => typeof item === 'string' ? item : item?.code)
      .filter(Boolean);
    return `• ${product.sku}${product.codigo_base ? ` / ${product.codigo_base}` : ''}${oem.length ? ` — OEM: ${oem.join(', ')}` : ''}`;
  });

  const heading = intent === 'application_lookup'
    ? 'Aplicaciones confirmadas en el catálogo ELIMFILTERS:'
    : 'Referencia confirmada en el catálogo ELIMFILTERS:';
  return `${heading}\n\n${lines.join('\n')}`;
}

async function processQuery(message, context = {}) {
  const references = extractReferences(message);
  const equipmentTokens = extractEquipmentTokens(message);
  const intent = classifyIntent(message, references, equipmentTokens);
  const plan = buildPlan(intent);

  if (intent === 'diagnostic') {
    const diagnostic = extractDiagnosticData(message, context);
    const next = nextDiagnosticQuestion(diagnostic);
    let products = [];
    if (!next && diagnostic.equipment_tokens.length) products = await searchApplications(diagnostic.equipment_tokens);

    return {
      protocol_version: '1.1.0',
      intent,
      phase: next ? 'collecting_diagnostic_data' : 'diagnostic_assessment',
      plan,
      entities: { references, equipment_tokens: diagnostic.equipment_tokens },
      diagnostic: {
        ...diagnostic,
        probable_cause: next ? null : inferProbableCause(diagnostic),
        missing_field: next?.field || null,
        complete: !next
      },
      evidence: {
        source: 'elimfilters_catalog',
        count: products.length,
        validated: products.length > 0,
        products
      },
      answer: next
        ? next.question
        : `${products.length ? buildCatalogAnswer('application_lookup', products, []) : 'Diagnóstico preliminar completado sin una aplicación exacta confirmada en catálogo.'}\n\nCausa probable: ${inferProbableCause(diagnostic)}. La recomendación queda condicionada a verificación técnica.`
    };
  }

  let products = [];
  if (plan.includes('search_catalog')) products = await searchReferences(references);
  if (plan.includes('search_applications')) products = await searchApplications(equipmentTokens);

  return {
    protocol_version: '1.1.0',
    intent,
    phase: 'catalog_resolution',
    plan,
    entities: { references, equipment_tokens: equipmentTokens },
    evidence: {
      source: 'elimfilters_catalog',
      count: products.length,
      validated: products.length > 0,
      products
    },
    answer: buildCatalogAnswer(intent, products, references)
  };
}

function registerBotProtocol(app) {
  app.post('/api/bot/protocol', async (req, res) => {
    try {
      const message = String(req.body?.message || '').trim();
      if (!message) return res.status(400).json({ error: 'message is required' });
      const context = req.body?.context && typeof req.body.context === 'object' ? req.body.context : {};
      return res.json(await processQuery(message, context));
    } catch (error) {
      console.error('[bot-protocol]', error.message);
      return res.status(500).json({ error: 'protocol_execution_failed' });
    }
  });
}

module.exports = { registerBotProtocol, processQuery, extractDiagnosticData, nextDiagnosticQuestion };
