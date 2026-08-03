const { withProtocolClient } = require('./bot-protocol-db');

const FILTER_QUESTION_MARKER = '¿Qué filtro está usando actualmente?';
const MAX_RESULTS = 8;

function getContext(body = {}) {
  return body.context && typeof body.context === 'object' ? body.context : {};
}

function getHistory(body = {}) {
  const history = getContext(body).history;
  return Array.isArray(history) ? history : [];
}

function questionIndex(history = []) {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const value = String(history[index] || '');
    if (value.includes(FILTER_QUESTION_MARKER) || value.includes('¿Qué filtro de aceite está usando actualmente?')) return index;
  }
  return -1;
}

function filterQuestionWasAsked(body = {}) {
  const context = getContext(body);
  return context.pending_field === 'current_filter' || context.pending_field === 'current_filter_reference' || questionIndex(getHistory(body)) >= 0;
}

function filterAnswerWasRecorded(body = {}) {
  const context = getContext(body);
  if (context.current_filter_status && !['reference_required', 'pending'].includes(context.current_filter_status)) return true;
  const history = getHistory(body);
  const index = questionIndex(history);
  return index >= 0 && index < history.length - 1;
}

function currentMessageAnswersFilterQuestion(body = {}) {
  const context = getContext(body);
  const message = String(body.message || '').trim();
  if (!message) return false;
  if (context.pending_field === 'current_filter' || context.pending_field === 'current_filter_reference') return true;
  const history = getHistory(body);
  return questionIndex(history) === history.length - 1;
}

function normalizeReference(value) {
  return String(value || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

function extractFilterReferences(value) {
  const source = String(value || '').toUpperCase();
  const matches = source.match(/\b(?=[A-Z0-9-]{4,}\b)(?=[A-Z0-9-]*[A-Z])(?=[A-Z0-9-]*\d)[A-Z0-9]+(?:-[A-Z0-9]+)*\b/g) || [];
  return [...new Set(matches.map(normalizeReference).filter(reference => reference.length >= 4))].slice(0, 5);
}

function customerDoesNotKnow(value) {
  return /\b(?:no\s+lo\s+s[eé]|no\s+s[eé]|no\s+puedo\s+verlo|no\s+se\s+ve|desconozco|no\s+tengo\s+el\s+c[oó]digo)\b/i.test(String(value || ''));
}

async function searchInstalledFilter(references) {
  if (!references.length) return [];
  const startedAt = Date.now();

  const rows = await withProtocolClient(async client => {
    const direct = await client.query(
      `SELECT id, sku, codigo_base, name, description, filter_type, sub_type, technology,
              oem_codes, competitor_codes, brand_crossrefs, equipment_applications,
              specs, enrichment_data, is_primary,
              'direct_reference'::text AS protocol_match_type
         FROM elimfilters_catalog
        WHERE upper(regexp_replace(coalesce(sku, ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
           OR upper(regexp_replace(coalesce(codigo_base, ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
        ORDER BY is_primary DESC NULLS LAST, sku ASC
        LIMIT ${MAX_RESULTS}`,
      [references]
    );
    if (direct.rows.length) return direct.rows;

    const crossref = await client.query(
      `SELECT id, sku, codigo_base, name, description, filter_type, sub_type, technology,
              oem_codes, competitor_codes, brand_crossrefs, equipment_applications,
              specs, enrichment_data, is_primary,
              'cross_reference'::text AS protocol_match_type
         FROM elimfilters_catalog
        WHERE coalesce(oem_codes, '[]'::jsonb) ?| $1::text[]
           OR coalesce(competitor_codes, '[]'::jsonb) ?| $1::text[]
           OR coalesce(brand_crossrefs, '{}'::jsonb) ?| $1::text[]
        ORDER BY is_primary DESC NULLS LAST, sku ASC
        LIMIT ${MAX_RESULTS}`,
      [references]
    );
    return crossref.rows;
  }, { statementTimeoutMs: 1600 });

  console.info('[installed-filter-step] catalog lookup', {
    references,
    count: rows.length,
    durationMs: Date.now() - startedAt
  });
  return rows;
}

function catalogAnswer(products, references, lookupError = null) {
  if (lookupError) {
    return 'No pude completar la validación en la base de datos en este momento. El código quedó registrado, pero no asignaré un SKU hasta confirmar la equivalencia.';
  }
  if (!products.length) {
    return `No encontré una equivalencia confirmada para ${references.join(', ')} en la base de datos ELIMFILTERS. No asignaré un SKU sin evidencia. Verifica que el código esté completo.`;
  }

  const lines = products.map(product => {
    const base = product.codigo_base ? ` / ${product.codigo_base}` : '';
    const type = product.filter_type ? ` — ${product.filter_type}` : '';
    return `• ${product.sku}${base}${type}`;
  });

  return `Referencia confirmada en la base de datos ELIMFILTERS:\n\n${lines.join('\n')}`;
}

function installedFilterQuestion(payload = {}) {
  const symptoms = payload?.diagnostic?.symptoms || [];
  const hint = symptoms.some(value => /pressure|oil/i.test(String(value)))
    ? 'Para este caso necesito revisar especialmente el filtro de aceite.'
    : 'Indica el filtro relacionado con el sistema que presenta la falla.';
  return `${FILTER_QUESTION_MARKER} ${hint} Escribe tipo, marca y código o referencia impresa. También podés enviar una foto clara. Si no lo sabés, respondé “no lo sé”.`;
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
      let lookupError = null;

      if (references.length) {
        try {
          products = await searchInstalledFilter(references);
        } catch (error) {
          lookupError = error;
          console.error('[installed-filter-step] catalog lookup failed', error.message);
        }
      }

      installedFilterLookup = { currentFilter, references, products, doesNotKnow, lookupError };
    }

    const originalJson = res.json.bind(res);
    res.json = payload => {
      if (payload?.intent !== 'diagnostic' || payload?.phase !== 'diagnostic_assessment') {
        return originalJson(payload);
      }

      if (installedFilterLookup) {
        const { currentFilter, references, products, doesNotKnow, lookupError } = installedFilterLookup;

        if (doesNotKnow) {
          return originalJson({
            ...payload,
            protocol_version: '1.2.0',
            diagnostic: {
              ...(payload?.diagnostic || {}),
              current_filter: null,
              current_filter_references: [],
              current_filter_status: 'unknown',
              missing_field: null,
              complete: true
            },
            answer: `${payload.answer}\n\nNo se identificó el filtro instalado. La recomendación de reemplazo queda pendiente de validar la aplicación exacta contra la base de datos ELIMFILTERS.`
          });
        }

        if (!references.length) {
          return originalJson({
            ...payload,
            protocol_version: '1.2.0',
            phase: 'collecting_diagnostic_data',
            diagnostic: {
              ...(payload?.diagnostic || {}),
              current_filter: currentFilter,
              current_filter_references: [],
              current_filter_status: 'reference_required',
              missing_field: 'current_filter_reference',
              complete: false
            },
            answer: 'No pude identificar un código de filtro. Escribe la referencia completa tal como aparece impresa o envía una foto frontal y enfocada de la etiqueta.'
          });
        }

        return originalJson({
          ...payload,
          protocol_version: '1.2.0',
          diagnostic: {
            ...(payload?.diagnostic || {}),
            current_filter: currentFilter,
            current_filter_references: references,
            current_filter_status: lookupError ? 'lookup_error' : products.length ? 'validated' : 'not_found',
            missing_field: null,
            complete: true
          },
          evidence: {
            source: 'elimfilters_catalog',
            count: products.length,
            validated: !lookupError && products.length > 0,
            match_type: products[0]?.protocol_match_type || null,
            lookup_status: lookupError ? 'error' : 'completed',
            products
          },
          answer: `${payload.answer}\n\n${catalogAnswer(products, references, lookupError)}`
        });
      }

      if (filterAnswerWasRecorded(req.body || {})) return originalJson(payload);

      return originalJson({
        ...payload,
        protocol_version: '1.2.0',
        phase: 'collecting_diagnostic_data',
        plan: [
          ...new Set([...(Array.isArray(payload?.plan) ? payload.plan : []), 'identify_installed_filter', 'validate_installed_filter_in_catalog'])
        ],
        diagnostic: {
          ...(payload?.diagnostic || {}),
          current_filter: null,
          current_filter_references: [],
          current_filter_status: 'pending',
          missing_field: 'current_filter',
          complete: false
        },
        answer: installedFilterQuestion(payload)
      });
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
