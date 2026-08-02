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

function buildAnswer(intent, products, references) {
  if (!products.length) {
    if (references.length) {
      return `No encontré una equivalencia confirmada para ${references.join(', ')} en el catálogo ELIMFILTERS. No se asignará un SKU sin evidencia.`;
    }
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

async function processQuery(message) {
  const references = extractReferences(message);
  const equipmentTokens = extractEquipmentTokens(message);
  const intent = classifyIntent(message, references, equipmentTokens);
  const steps = buildPlan(intent);

  let products = [];
  if (steps.includes('search_catalog')) products = await searchReferences(references);
  if (steps.includes('search_applications')) products = await searchApplications(equipmentTokens);

  return {
    protocol_version: '1.0.0',
    intent,
    plan: steps,
    entities: { references, equipment_tokens: equipmentTokens },
    evidence: {
      source: 'elimfilters_catalog',
      count: products.length,
      validated: products.length > 0,
      products
    },
    answer: buildAnswer(intent, products, references)
  };
}

function registerBotProtocol(app) {
  app.post('/api/bot/protocol', async (req, res) => {
    try {
      const message = String(req.body?.message || '').trim();
      if (!message) return res.status(400).json({ error: 'message is required' });
      return res.json(await processQuery(message));
    } catch (error) {
      console.error('[bot-protocol]', error.message);
      return res.status(500).json({ error: 'protocol_execution_failed' });
    }
  });
}

module.exports = { registerBotProtocol, processQuery };
