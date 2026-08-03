const { withProtocolClient } = require('./bot-protocol-db');

const MAX_RESULTS = 12;
const SELECT_FIELDS = `id, sku, codigo_base, name, description, filter_type, sub_type, technology,
  thread_size, height_mm, outer_diameter_mm, gasket_od_mm, gasket_id_mm,
  micron_rating, nominal_efficiency, filter_media, oem_codes,
  competitor_codes, brand_crossrefs, equipment_applications, specs,
  enrichment_data, is_primary`;

function normalizeReference(value) {
  return String(value || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

function extractReferences(value) {
  const source = String(value || '').toUpperCase();
  const years = new Set(source.match(/\b(?:19[8-9]\d|20[0-3]\d)\b/g) || []);
  const candidates = source.match(/\b(?=[A-Z0-9-]{4,}\b)(?=[A-Z0-9-]*[A-Z])(?=[A-Z0-9-]*\d)[A-Z0-9]+(?:-[A-Z0-9]+)*\b/g) || [];
  return [...new Set(candidates.map(normalizeReference).filter(ref => ref.length >= 4 && !years.has(ref) && !/^O?20\d{2}$/.test(ref)))].slice(0, 8);
}

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

async function resolveReferences(references) {
  if (!references.length) return [];
  return withProtocolClient(async client => {
    const result = await client.query(
      `SELECT ${SELECT_FIELDS},
        CASE
          WHEN upper(regexp_replace(coalesce(sku, ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
            OR upper(regexp_replace(coalesce(codigo_base, ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
          THEN 'direct_reference'
          ELSE 'cross_reference'
        END AS protocol_match_type
       FROM elimfilters_catalog c
       WHERE upper(regexp_replace(coalesce(c.sku, ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
          OR upper(regexp_replace(coalesce(c.codigo_base, ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements(CASE WHEN jsonb_typeof(c.oem_codes) = 'array' THEN c.oem_codes ELSE '[]'::jsonb END) item
             WHERE upper(regexp_replace(coalesce(item->>'code', item#>>'{}', ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
          )
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements(CASE WHEN jsonb_typeof(c.competitor_codes) = 'array' THEN c.competitor_codes ELSE '[]'::jsonb END) item
             WHERE upper(regexp_replace(coalesce(item->>'code', item#>>'{}', ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
          )
          OR EXISTS (
            SELECT 1 FROM jsonb_each_text(CASE WHEN jsonb_typeof(c.brand_crossrefs) = 'object' THEN c.brand_crossrefs ELSE '{}'::jsonb END) pair
             WHERE upper(regexp_replace(pair.value, '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
          )
       ORDER BY protocol_match_type ASC, is_primary DESC NULLS LAST, sku ASC
       LIMIT ${MAX_RESULTS}`,
      [references]
    );
    return result.rows.map(normalizeProduct);
  }, { statementTimeoutMs: 5000 });
}

function equipmentTerms(body = {}, payload = {}) {
  const contextTokens = Array.isArray(body.context?.equipment_tokens) ? body.context.equipment_tokens : [];
  const entityTokens = Array.isArray(payload.entities?.equipment_tokens) ? payload.entities.equipment_tokens : [];
  return [...new Set([...contextTokens, ...entityTokens].map(value => String(value).trim()).filter(value => value.length >= 2))].slice(0, 8);
}

async function resolveApplication(terms, year = null) {
  if (!terms.length) return [];
  return withProtocolClient(async client => {
    const patterns = terms.map(term => `%${term}%`);
    const params = [patterns];
    let yearClause = '';
    if (year) {
      params.push(`%${year}%`);
      yearClause = ' AND c.equipment_applications::text ILIKE $2';
    }
    const result = await client.query(
      `SELECT ${SELECT_FIELDS}, 'application'::text AS protocol_match_type
         FROM elimfilters_catalog c
        WHERE c.equipment_applications::text ILIKE ANY($1::text[])${yearClause}
        ORDER BY is_primary DESC NULLS LAST, filter_type ASC, sku ASC
        LIMIT ${MAX_RESULTS}`,
      params
    );
    return result.rows.map(normalizeProduct);
  }, { statementTimeoutMs: 5000 });
}

function answerForProducts(payload, products, references) {
  if (!products.length) {
    if (references.length) return `No encontré una equivalencia confirmada para ${references.join(', ')} en la base de datos ELIMFILTERS. No asignaré un SKU sin evidencia.`;
    return payload.answer;
  }
  const lines = products.map(product => `• ${product.sku}${product.codigo_base ? ` / ${product.codigo_base}` : ''}${product.filter_type ? ` — ${product.filter_type}` : ''}`);
  const title = references.length ? 'Referencia confirmada en la base de datos ELIMFILTERS:' : 'Aplicación confirmada en la base de datos ELIMFILTERS:';
  return `${title}\n\n${lines.join('\n')}`;
}

function installCatalogResolver(app) {
  app.use('/api/bot/protocol', (req, res, next) => {
    if (req.method !== 'POST') return next();
    const originalJson = res.json.bind(res);
    res.json = payload => {
      const resolve = async () => {
        const message = String(req.body?.message || '');
        const references = extractReferences(message);
        const intent = payload?.intent;
        const diagnosticComplete = intent === 'diagnostic' && payload?.diagnostic?.complete;
        const referenceIntent = ['exact_reference_lookup', 'cross_reference_lookup', 'specification_lookup'].includes(intent);
        const applicationIntent = intent === 'application_lookup' || diagnosticComplete;
        if (!referenceIntent && !applicationIntent) return originalJson(payload);

        try {
          const products = referenceIntent
            ? await resolveReferences(references)
            : await resolveApplication(equipmentTerms(req.body || {}, payload), payload?.entities?.year || null);
          const evidence = {
            source: 'elimfilters_catalog',
            count: products.length,
            validated: products.length > 0,
            lookup_status: 'completed',
            match_type: products[0]?.protocol_match_type || null,
            products
          };
          console.info('[bot-catalog-resolver]', {
            intent,
            references,
            equipment_terms: applicationIntent ? equipmentTerms(req.body || {}, payload) : [],
            count: products.length,
            match_type: evidence.match_type
          });
          return originalJson({
            ...payload,
            evidence,
            answer: answerForProducts(payload, products, references)
          });
        } catch (error) {
          console.error('[bot-catalog-resolver]', error.message);
          return originalJson({
            ...payload,
            evidence: {
              source: 'elimfilters_catalog',
              count: 0,
              validated: false,
              lookup_status: 'error',
              match_type: null,
              products: []
            },
            answer: 'No pude completar la validación en la base de datos en este momento. No asignaré un SKU hasta confirmar la equivalencia.'
          });
        }
      };
      void resolve().catch(error => {
        console.error('[bot-catalog-resolver][unhandled]', error.message);
        originalJson(payload);
      });
      return res;
    };
    return next();
  });
}

module.exports = { installCatalogResolver, extractReferences, resolveReferences, resolveApplication };
