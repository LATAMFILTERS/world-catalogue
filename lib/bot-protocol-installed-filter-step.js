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
    if (
      value.includes(FILTER_QUESTION_MARKER) ||
      value.includes('¿Qué filtro de aceite está usando actualmente?') ||
      value.includes('¿Cuál es el año') && value.includes('referencia de filtro')
    ) return index;
  }
  return -1;
}

function filterQuestionWasAsked(body = {}) {
  const context = getContext(body);
  return ['current_filter', 'current_filter_reference', 'technical_identification'].includes(context.pending_field) || questionIndex(getHistory(body)) >= 0;
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
  if (['current_filter', 'current_filter_reference', 'technical_identification'].includes(context.pending_field)) return true;
  const history = getHistory(body);
  return questionIndex(history) === history.length - 1;
}

function normalizeReference(value) {
  return String(value || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

function extractFilterReferences(value) {
  const source = String(value || '').toUpperCase();
  const years = new Set(source.match(/\b(?:19[8-9]\d|20[0-3]\d)\b/g) || []);
  const matches = source.match(/\b(?=[A-Z0-9-]{4,}\b)(?=[A-Z0-9-]*[A-Z])(?=[A-Z0-9-]*\d)[A-Z0-9]+(?:-[A-Z0-9]+)*\b/g) || [];
  return [...new Set(matches.map(normalizeReference).filter(reference => reference.length >= 4 && !years.has(reference) && !/^O?20\d{2}$/.test(reference)))].slice(0, 5);
}

function extractYear(value) {
  return String(value || '').match(/\b(19[8-9]\d|20[0-3]\d)\b/)?.[1] || null;
}

function customerDoesNotKnow(value) {
  return /\b(?:no\s+lo\s+s[eé]|no\s+s[eé]|no\s+puedo\s+verlo|no\s+se\s+ve|desconozco|no\s+tengo\s+el\s+c[oó]digo)\b/i.test(String(value || ''));
}

async function searchInstalledFilter(references) {
  if (!references.length) return [];
  const startedAt = Date.now();

  const rows = await withProtocolClient(async client => {
    const result = await client.query(
      `SELECT id, sku, codigo_base, name, description, filter_type, sub_type, technology,
              oem_codes, competitor_codes, brand_crossrefs, equipment_applications,
              specs, enrichment_data, is_primary,
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
                SELECT 1
                  FROM jsonb_array_elements(CASE WHEN jsonb_typeof(c.oem_codes) = 'array' THEN c.oem_codes ELSE '[]'::jsonb END) item
                 WHERE upper(regexp_replace(coalesce(item->>'code', item#>>'{}', ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
              )
           OR EXISTS (
                SELECT 1
                  FROM jsonb_array_elements(CASE WHEN jsonb_typeof(c.competitor_codes) = 'array' THEN c.competitor_codes ELSE '[]'::jsonb END) item
                 WHERE upper(regexp_replace(coalesce(item->>'code', item#>>'{}', ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
              )
           OR EXISTS (
                SELECT 1
                  FROM jsonb_each_text(CASE WHEN jsonb_typeof(c.brand_crossrefs) = 'object' THEN c.brand_crossrefs ELSE '{}'::jsonb END) pair
                 WHERE upper(regexp_replace(pair.value, '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
              )
        ORDER BY protocol_match_type ASC, is_primary DESC NULLS LAST, sku ASC
        LIMIT ${MAX_RESULTS}`,
      [references]
    );
    return result.rows;
  }, { statementTimeoutMs: 5000 });

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

function needsTechnicalIdentification(payload = {}, body = {}) {
  if (payload?.intent !== 'diagnostic') return false;
  const diagnostic = payload?.diagnostic || {};
  const context = getContext(body);
  const equipment = diagnostic.equipment_tokens || payload?.entities?.equipment_tokens || context.equipment_tokens || [];
  const symptoms = diagnostic.symptoms || context.symptoms || [];
  if (!equipment.length || !symptoms.length) return false;
  const year = payload?.entities?.year || context.year || null;
  const filterKnown = Boolean(
    diagnostic.current_filter_status && !['pending', 'reference_required'].includes(diagnostic.current_filter_status)
  ) || Boolean(context.current_filter_status && !['pending', 'reference_required'].includes(context.current_filter_status));
  return !year || !filterKnown;
}

function technicalIdentificationQuestion(payload = {}, body = {}) {
  const equipment = payload?.diagnostic?.equipment_tokens || payload?.entities?.equipment_tokens || getContext(body).equipment_tokens || [];
  const label = equipment.length ? equipment.join(' ') : 'el equipo';
  return `¿Cuál es el año exacto de ${label} y qué referencia de filtro está instalada actualmente? Escribe la marca y el código tal como aparecen impresos. También podés enviar una foto clara.`;
}

function pressureLossSafetyAnswer(payload, product) {
  const diagnostic = payload?.diagnostic || {};
  const sku = product?.sku;
  const base = product?.codigo_base ? ` / ${product.codigo_base}` : '';
  const operatingContext = diagnostic.operating_context ? ` en operación ${diagnostic.operating_context}` : '';
  return `La información apunta a una caída de presión en caliente${operatingContext}. No debe atribuirse únicamente al filtro sin medir la presión real del sistema. Las causas posibles incluyen nivel o viscosidad incorrectos, degradación o dilución del aceite, restricción del filtro, funcionamiento de la válvula reguladora o desgaste interno.\n\nLa referencia instalada fue validada en la base de datos ELIMFILTERS. La equivalencia confirmada es:\n\n• ${sku}${base}${product?.filter_type ? ` — ${product.filter_type}` : ''}\n\nAcciones recomendadas:\n1. Verificar nivel, condición y viscosidad del aceite.\n2. Medir la presión con un manómetro mecánico en frío, en ralentí caliente y bajo carga.\n3. Revisar contaminación o dilución del aceite.\n4. Confirmar la válvula reguladora y descartar desgaste interno.\n5. Sustituir el filtro por ${sku} después de confirmar la aplicación exacta del motor.\n\nNo continúes operando el motor si la presión medida está por debajo de la especificación del fabricante, porque puede producir daño severo en cojinetes, cigüeñal y turbo.`;
}

function finalTechnicalAnswer(payload, products, references, lookupError) {
  if (lookupError || !products.length) return `${payload.answer}\n\n${catalogAnswer(products, references, lookupError)}`;
  const symptoms = new Set(payload?.diagnostic?.symptoms || []);
  if (symptoms.has('pressure_loss')) return pressureLossSafetyAnswer(payload, products[0]);
  return `${payload.answer}\n\n${catalogAnswer(products, references, null)}\n\nLa recomendación se basa únicamente en la equivalencia validada en la base de datos y debe confirmarse contra la configuración exacta del equipo antes de instalar.`;
}

function installInstalledFilterStep(app) {
  app.use('/api/bot/protocol', async (req, res, next) => {
    if (req.method !== 'POST') return next();

    let installedFilterLookup = null;
    if (currentMessageAnswersFilterQuestion(req.body || {})) {
      const currentFilter = String(req.body?.message || '').trim();
      const references = extractFilterReferences(currentFilter);
      const year = extractYear(currentFilter);
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

      installedFilterLookup = { currentFilter, references, year, products, doesNotKnow, lookupError };
    }

    const originalJson = res.json.bind(res);
    res.json = payload => {
      if (payload?.intent !== 'diagnostic') return originalJson(payload);

      if (installedFilterLookup) {
        const { currentFilter, references, year, products, doesNotKnow, lookupError } = installedFilterLookup;
        const mergedEntities = { ...(payload.entities || {}), year: year || payload?.entities?.year || getContext(req.body).year || null };

        if (doesNotKnow) {
          return originalJson({
            ...payload,
            entities: mergedEntities,
            diagnostic: {
              ...(payload?.diagnostic || {}),
              current_filter: null,
              current_filter_references: [],
              current_filter_status: 'unknown',
              missing_field: payload?.diagnostic?.missing_field === 'technical_identification' ? 'duration' : payload?.diagnostic?.missing_field,
              complete: false
            },
            answer: payload.answer
          });
        }

        if (!references.length) {
          return originalJson({
            ...payload,
            entities: mergedEntities,
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

        const nextPayload = {
          ...payload,
          entities: mergedEntities,
          diagnostic: {
            ...(payload?.diagnostic || {}),
            current_filter: currentFilter,
            current_filter_references: references,
            current_filter_status: lookupError ? 'lookup_error' : products.length ? 'validated' : 'not_found'
          },
          evidence: {
            source: 'elimfilters_catalog',
            count: products.length,
            validated: !lookupError && products.length > 0,
            match_type: products[0]?.protocol_match_type || null,
            lookup_status: lookupError ? 'error' : 'completed',
            products
          }
        };

        if (payload.phase === 'diagnostic_assessment') {
          nextPayload.diagnostic = { ...nextPayload.diagnostic, missing_field: null, complete: true };
          nextPayload.answer = finalTechnicalAnswer(payload, products, references, lookupError);
        }

        return originalJson(nextPayload);
      }

      if (needsTechnicalIdentification(payload, req.body || {})) {
        return originalJson({
          ...payload,
          phase: 'collecting_diagnostic_data',
          plan: [
            ...new Set([...(Array.isArray(payload?.plan) ? payload.plan : []), 'identify_year', 'identify_installed_filter', 'validate_installed_filter_in_catalog'])
          ],
          diagnostic: {
            ...(payload?.diagnostic || {}),
            current_filter: null,
            current_filter_references: [],
            current_filter_status: 'pending',
            missing_field: 'technical_identification',
            complete: false
          },
          answer: technicalIdentificationQuestion(payload, req.body || {})
        });
      }

      if (payload?.phase === 'diagnostic_assessment' && !filterAnswerWasRecorded(req.body || {})) {
        return originalJson({
          ...payload,
          phase: 'collecting_diagnostic_data',
          diagnostic: {
            ...(payload?.diagnostic || {}),
            current_filter_status: 'pending',
            missing_field: 'current_filter',
            complete: false
          },
          answer: `${FILTER_QUESTION_MARKER} Escribe la marca y el código o referencia impresos. También podés enviar una foto clara.`
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
  searchInstalledFilter,
  extractYear,
  needsTechnicalIdentification
};
