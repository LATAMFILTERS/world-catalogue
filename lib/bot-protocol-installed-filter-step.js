const { Pool } = require('pg');

const FILTER_QUESTION_MARKER = '¿Qué filtro de aceite está usando actualmente?';
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

function getContext(body = {}) {
  return body.context && typeof body.context === 'object' ? body.context : {};
}

function getHistory(body = {}) {
  const history = getContext(body).history;
  return Array.isArray(history) ? history : [];
}

function questionIndex(history = []) {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (String(history[index] || '').includes(FILTER_QUESTION_MARKER)) return index;
  }
  return -1;
}

function filterQuestionWasAsked(body = {}) {
  return questionIndex(getHistory(body)) >= 0;
}

function filterAnswerWasRecorded(body = {}) {
  const history = getHistory(body);
  const index = questionIndex(history);
  return index >= 0 && index < history.length - 1;
}

function currentMessageAnswersFilterQuestion(body = {}) {
  const history = getHistory(body);
  const index = questionIndex(history);
  const message = String(body.message || '').trim();
  return index === history.length - 1 && message.length > 0;
}

function normalizeReference(value) {
  return String(value || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

function extractFilterReferences(value) {
  const source = String(value || '').toUpperCase();
  const matches = source.match(/\b(?=[A-Z0-9-]{4,}\b)(?=[A-Z0-9-]*[A-Z])(?=[A-Z0-9-]*\d)[A-Z0-9]+(?:-[A-Z0-9]+)*\b/g) || [];
  return [...new Set(matches.map(normalizeReference).filter(reference => reference.length >= 4))];
}

function customerDoesNotKnow(value) {
  return /\b(?:no\s+lo\s+s[eé]|no\s+s[eé]|no\s+puedo\s+verlo|no\s+se\s+ve|desconozco)\b/i.test(String(value || ''));
}

async function searchInstalledFilter(references) {
  if (!references.length) return [];
  const result = await getPool().query(
    `SELECT id, sku, codigo_base, name, description, filter_type, sub_type, technology,
            oem_codes, competitor_codes, brand_crossrefs, equipment_applications,
            specs, enrichment_data, is_primary
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
  return result.rows;
}

function catalogAnswer(products, references) {
  if (!products.length) {
    return `No encontré una equivalencia confirmada para ${references.join(', ')} en la base de datos ELIMFILTERS. No asignaré un SKU sin evidencia. Verifica que el código esté completo o envía una foto frontal de la etiqueta.`;
  }

  const lines = products.map(product => {
    const base = product.codigo_base ? ` / ${product.codigo_base}` : '';
    const type = product.filter_type ? ` — ${product.filter_type}` : '';
    return `• ${product.sku}${base}${type}`;
  });

  return `Referencia del filtro actual confirmada en la base de datos ELIMFILTERS:\n\n${lines.join('\n')}`;
}

function installInstalledFilterStep(app) {
  app.use('/api/bot/protocol', async (req, res, next) => {
    if (req.method !== 'POST') return next();

    let installedFilterLookup = null;
    if (currentMessageAnswersFilterQuestion(req.body || {})) {
      const currentFilter = String(req.body?.message || '').trim();
      const references = extractFilterReferences(currentFilter);
      const doesNotKnow = customerDoesNotKnow(currentFilter);
      let products = [];

      if (references.length) {
        try {
          products = await searchInstalledFilter(references);
        } catch (error) {
          console.error('[installed-filter-step]', error.message);
        }
      }

      installedFilterLookup = { currentFilter, references, products, doesNotKnow };
    }

    const originalJson = res.json.bind(res);
    res.json = payload => {
      if (payload?.intent !== 'diagnostic' || payload?.phase !== 'diagnostic_assessment') {
        return originalJson(payload);
      }

      if (filterAnswerWasRecorded(req.body || {})) return originalJson(payload);

      if (installedFilterLookup) {
        const { currentFilter, references, products, doesNotKnow } = installedFilterLookup;

        if (doesNotKnow) {
          return originalJson({
            ...payload,
            protocol_version: '1.1.5',
            diagnostic: {
              ...(payload?.diagnostic || {}),
              current_filter: null,
              current_filter_status: 'unknown',
              missing_field: null,
              complete: true
            },
            answer: `${payload.answer}\n\nNo se identificó el filtro instalado. La recomendación de reemplazo queda pendiente de validar marca, modelo, motor y año contra la base de datos ELIMFILTERS.`
          });
        }

        if (!references.length) {
          return originalJson({
            ...payload,
            protocol_version: '1.1.5',
            phase: 'collecting_diagnostic_data',
            diagnostic: {
              ...(payload?.diagnostic || {}),
              current_filter: currentFilter,
              current_filter_status: 'reference_required',
              missing_field: 'current_filter_reference',
              complete: false
            },
            answer: 'No pude identificar un código de filtro en tu respuesta. Escribe la referencia completa tal como aparece impresa o envía una foto frontal donde se vea la etiqueta.'
          });
        }

        return originalJson({
          ...payload,
          protocol_version: '1.1.5',
          diagnostic: {
            ...(payload?.diagnostic || {}),
            current_filter: currentFilter,
            current_filter_references: references,
            current_filter_status: products.length ? 'validated' : 'not_found',
            missing_field: null,
            complete: true
          },
          evidence: {
            source: 'elimfilters_catalog',
            count: products.length,
            validated: products.length > 0,
            match_type: products.length ? 'installed_filter_reference' : null,
            products
          },
          answer: `${payload.answer}\n\n${catalogAnswer(products, references)}`
        });
      }

      if (!filterQuestionWasAsked(req.body || {})) {
        return originalJson({
          ...payload,
          protocol_version: '1.1.5',
          phase: 'collecting_diagnostic_data',
          plan: [
            ...new Set([...(Array.isArray(payload?.plan) ? payload.plan : []), 'identify_installed_filter', 'validate_installed_filter_in_catalog'])
          ],
          diagnostic: {
            ...(payload?.diagnostic || {}),
            current_filter: null,
            missing_field: 'current_filter',
            complete: false
          },
          answer: `${FILTER_QUESTION_MARKER} Indica el tipo, la marca y el código o referencia impresa. Si no podés verlo, respondé “no lo sé”.`
        });
      }

      return originalJson(payload);
    };

    next();
  });
}

module.exports = {
  installInstalledFilterStep,
  filterQuestionWasAsked,
  filterAnswerWasRecorded,
  currentMessageAnswersFilterQuestion,
  extractFilterReferences,
  customerDoesNotKnow,
  searchInstalledFilter
};
