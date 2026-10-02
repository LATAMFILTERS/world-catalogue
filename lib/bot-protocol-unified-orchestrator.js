'use strict';

const crypto = require('crypto');
const { runBotProtocol } = require('./bot-conversation-orchestrator');
const {
  memoryKey,
  loadMemory,
  saveMemory,
  normalizeState
} = require('./bot-protocol-memory');
const {
  extractReferences,
  searchByReferences,
  searchValidatedMaintenanceKit,
  searchByApplication,
  searchCompatibleElements,
  isHousing
} = require('./bot-protocol-catalog');
const { applyProtocolGuardrails } = require('./bot-protocol-guardrails');
const { formatForChannel } = require('./bot-protocol-channel-format');
const { applyDiagnosticResponseMatrix } = require('./bot-diagnostic-response-matrix');

const PROTOCOL_VERSION = '3.4.0';
const ELEMENT_REQUEST_PATTERN = /\b(?:cartucho|elemento|repuesto|replacement\s*element|replacement\s*filter|filtro\s+(?:de\s+)?repuesto|filtro\s+para\s+(?:la\s+)?turbina|qu[eé]\s+(?:cartucho|elemento|filtro)\s+(?:lleva|usa|recomiend|corresponde))\b/i;
const TURBINE_CONTEXT_PATTERN = /\b(?:turbina|racor|parker|fuel\s*water\s*separator|separador\s+(?:de\s+)?agua)\b/i;
const REFERENCE_INTENT_PATTERN = /\b(?:equivalente|equivalencia|cruce|cross\s*reference|reemplaza|sustituye|reemplazo)\b/i;
const SPECIFICATION_INTENT_PATTERN = /\b(?:especificaci[oó]n|medida|dimensi[oó]n|rosca|altura|di[aá]metro|micra|beta|caudal)\b/i;
const EQUIPMENT_BRAND_PATTERN = /\b(?:TOYOTA|LEXUS|HONDA|ACURA|FORD|CHEVROLET|GMC|NISSAN|INFINITI|MAZDA|SUBARU|HYUNDAI|KIA|JEEP|DODGE|RAM|CHRYSLER|VOLKSWAGEN|AUDI|BMW|MERCEDES-BENZ|MACK|VOLVO|FREIGHTLINER|KENWORTH|PETERBILT|INTERNATIONAL|CATERPILLAR|KOMATSU|HITACHI|CASE|NEW\s+HOLLAND|CUMMINS|DETROIT|SCANIA|MAN|ISUZU|HINO|JOHN\s+DEERE)\b/i;
const APPLICATION_INTENT_PATTERN = /\b(?:(?:qu[eé]|cu[aá]les?)\s+(?:son\s+(?:los\s+)?)?filtros?|filtros?\s+(?:que\s+)?(?:usa|lleva|utiliza|para)|filter(?:s)?\s+(?:for|does|fit|uses?)|maintenance\s+filters?)\b/i;
const ENGINE_PATTERN = /\b(?:DETROIT\s+DIESEL\s+(?:SERIES\s*60|S60)|DETROIT\s+DIESEL|DETROIT|MP\d{1,2}|D1[136]|DD\d{1,2}|SERIES\s*60|S60|ISX\d*|X15|L9|B6\.7|C\d{1,2}(?:\.\d)?)\b/i;
const YEAR_PATTERN = /\b(19[8-9]\d|20[0-3]\d)\b/;
const WATER_SIGNAL_PATTERN = /\bagua\b|water/i;
const POWER_LOSS_PATTERN = /\b(?:p[eé]rdida\s+de\s+potencia|pierd[oe]\s+(?:potencia|fuerza)|pierdo\s+(?:potencia|fuerza)|sin\s+fuerza|se\s+queda\s+sin\s+fuerza|no\s+(?:acelera|responde)|falta\s+de\s+potencia)\b/i;

function isReplacementElementRequest(message) {
  const value = String(message || '');
  return ELEMENT_REQUEST_PATTERN.test(value) && (
    TURBINE_CONTEXT_PATTERN.test(value)
    || /\b(?:500|900|1000|2010|2020|2040)(?:FG|FH|FF|FE|FC|PM|TM|SM)/i.test(value)
    || /\b(?:lleva|usa|recomiend|corresponde)\b/i.test(value)
  );
}

function normalizeVehicleModel(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\b(?:RAV\s*[- ]?\s*4|RAV\s+FOUR|RACKFORD)\b/g, 'RAV4')
    .replace(/[^A-Z0-9 -]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractApplicationEntities(message) {
  const value = String(message || '');
  const rav4Match = value.match(/\b(?:RAV\s*[- ]?\s*4|RAV\s+FOUR|RACKFORD)\b/i);
  const brandMatch = value.match(EQUIPMENT_BRAND_PATTERN);
  const inferredBrand = !brandMatch && rav4Match ? 'TOYOTA' : null;
  let brand = brandMatch?.[0]?.toUpperCase().replace(/\s+/g, ' ') || inferredBrand;
  const rawEngine = value.match(ENGINE_PATTERN)?.[0]?.toUpperCase().replace(/\s+/g, ' ') || null;
  const engine = rawEngine === 'S60' ? 'SERIES 60' : rawEngine?.replace(/\bS60\b/g, 'SERIES 60') || null;
  const yearMatch = value.match(YEAR_PATTERN);
  const year = Number(yearMatch?.[1]) || null;
  let model = rav4Match ? 'RAV4' : null;

  if (!model && brandMatch) {
    const start = brandMatch.index + brandMatch[0].length;
    const end = yearMatch && yearMatch.index > start ? yearMatch.index : value.length;
    const between = value.slice(start, end)
      .replace(ENGINE_PATTERN, ' ')
      .replace(/\b(?:DEL|DE|ANO|MODEL|MODELO|MOTOR|ENGINE|QUE|CUALES?|FILTROS?|USA|LLEVA|UTILIZA|REQUIERE|PARA|LA|EL|LOS|LAS|CON|TIENE|TENGO|COMO|ACEITE|OIL|AIRE|AIR|COMBUSTIBLE|FUEL|CABINA|CABIN|HIDRAULICO|HIDRÁULICO|HYDRAULIC|REFRIGERANTE|COOLANT|TRANSMISION|TRANSMISIÓN|TRANSMISSION)\b/gi, ' ');
    model = normalizeVehicleModel(between) || null;
  }

  const genericTarget = normalizeVehicleModel(value)
    .replace(YEAR_PATTERN, ' ')
    .replace(ENGINE_PATTERN, ' ')
    .replace(/\b(?:ME|PODRIAS?|INDICAR|INDICARME|DECIR|DECIRME|SABER|QUE|CUALES?|SON|LOS|LAS|EL|LA|UN|UNA|FILTROS?|USA|LLEVA|UTILIZA|REQUIERE|PARA|DEL|DE|ANO|MODEL|MODELO|MOTOR|ENGINE|NECESITO|BUSCO|CON|TIENE|TENGO|COMO|ACEITE|OIL|AIRE|AIR|COMBUSTIBLE|FUEL|CABINA|CABIN|HIDRAULICO|HIDRÁULICO|HYDRAULIC|REFRIGERANTE|COOLANT|TRANSMISION|TRANSMISIÓN|TRANSMISSION)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const genericTokens = (genericTarget.match(/[A-Z0-9][A-Z0-9.-]{1,}/g) || [])
    .filter(token => !YEAR_PATTERN.test(token))
    .slice(0, 6);

  if (!brand && genericTokens.length >= 2) {
    brand = genericTokens[0];
    model = model || genericTokens.slice(1).join(' ');
  } else if (!model && genericTokens.length) {
    const modelTokens = genericTokens.filter(token => token !== brand);
    model = modelTokens.length ? modelTokens.join(' ') : null;
  }

  const structuredTokens = [brand, model, engine].filter(Boolean);
  const tokens = structuredTokens.length >= 2
    ? [...new Set(structuredTokens)]
    : [...new Set([...structuredTokens, ...genericTokens].filter(Boolean))];
  return { brand, model, engine, year, tokens };
}

function requestedFilterSystem(message) {
  const value = String(message || '');
  if (/\b(?:aceite|oil|lube|lubricante)\b/i.test(value)) return 'oil';
  if (/\b(?:combustible|fuel)\b/i.test(value)) return 'fuel';
  if (/\b(?:cabina|cabin|polen|pollen)\b/i.test(value)) return 'cabin';
  if (/\b(?:hidr[aá]ulico|hydraulic)\b/i.test(value)) return 'hydraulic';
  if (/\b(?:refrigerante|coolant)\b/i.test(value)) return 'coolant';
  if (/\b(?:aire|air)\b/i.test(value)) return 'air';
  return null;
}

function needsApplicationDisambiguation(equipment, filterSystem, products = []) {
  return Boolean(
    filterSystem
    && !products.length
    && equipment?.brand
    && equipment?.engine
    && !equipment?.model
    && !equipment?.year
  );
}

function deterministicIntent(message) {
  if (REFERENCE_INTENT_PATTERN.test(message)) return 'cross_reference_lookup';
  if (SPECIFICATION_INTENT_PATTERN.test(message)) return 'specification_lookup';
  return 'exact_reference_lookup';
}

function shouldDeferReferenceToCanonical(message, state, replacementRequest) {
  const activeDiagnostic = state?.intent === 'diagnostic' && (
    Boolean(state.pendingField)
    || state.phase === 'collecting_diagnostic_data'
  );
  if (!activeDiagnostic || replacementRequest) return false;

  const explicitIndependentLookup = REFERENCE_INTENT_PATTERN.test(message)
    || SPECIFICATION_INTENT_PATTERN.test(message);
  return !explicitIndependentLookup;
}

function productLabel(product) {
  return `${product.sku}${product.codigo_base ? ` / ${product.codigo_base}` : ''}${product.filter_type ? ` — ${product.filter_type}` : ''}`;
}

function applicationProductLabel(product) {
  const sku = String(product?.sku || product?.elimfilters_sku || '').trim();
  return `${sku}${product?.filter_type ? ` — ${product.filter_type}` : ''}`;
}

function maintenanceSystem(product = {}) {
  const sku = String(product.sku || '').trim().toUpperCase();
  if (sku.startsWith('ED')) return 'air_dryer';

  const text = [
    product.filter_type,
    product.sub_type,
    product.name,
    product.description,
    product.technology,
    product.specs?.technology,
    product.enrichment_data?.technology
  ].filter(Boolean).join(' ').toLowerCase();
  if (/air[_ -]?dryer|secador de aire|desiccant|drycore/.test(text)) return 'air_dryer';
  if (/cabin|cabina|pollen|polen/.test(text)) return 'cabin';
  if (/fuel|combustible|diesel|water separator/.test(text)) return 'fuel';
  if (/oil|lube|aceite|lubric/.test(text)) return 'oil';
  if (/hydraulic|hidr[aá]ul/.test(text)) return 'hydraulic';
  if (/transmission|transmisi[oó]n|gearbox|powershift/.test(text)) return 'transmission';
  if (/coolant|refrigerante|water filter/.test(text)) return 'coolant';
  if (/air|aire/.test(text)) return 'air';
  return String(product.filter_type || 'other').toLowerCase();
}

function serviceRole(product = {}, system = maintenanceSystem(product)) {
  if (system === 'air_dryer') return 'air_dryer';

  const explicit = [
    product.service_role,
    product.filter_position,
    product.position,
    product.role,
    product.specs?.service_role,
    product.specs?.filter_position,
    product.enrichment_data?.service_role,
    product.enrichment_data?.filter_position
  ].find(Boolean);
  if (explicit) {
    return String(explicit).trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  }

  const text = [product.filter_type, product.sub_type, product.name, product.description]
    .filter(Boolean).join(' ').toLowerCase();

  if (system === 'air') {
    if (/\b(?:secondary|safety|inner|inside element|secundario|seguridad|interno)\b/.test(text)) return 'secondary_safety';
    if (/\b(?:primary|outer|outside element|primario|externo)\b/.test(text)) return 'primary_outer';
  }
  if (system === 'fuel') {
    if (/\b(?:water separator|fuel\/water|separador de agua|pre[- ]?filter|prefilter|primary|primario)\b/.test(text)) return 'primary_water_separator';
    if (/\b(?:secondary|final|fine fuel|secundario|final fuel)\b/.test(text)) return 'secondary_final';
  }
  if (system === 'oil') {
    if (/\b(?:bypass|by[- ]?pass|derivaci[oó]n)\b/.test(text)) return 'bypass';
    if (/\b(?:full[- ]?flow|flujo completo|primary lube|main lube)\b/.test(text)) return 'full_flow';
  }
  if (system === 'hydraulic') {
    if (/\b(?:suction|succi[oó]n|strainer)\b/.test(text)) return 'suction';
    if (/\b(?:pressure|presi[oó]n)\b/.test(text)) return 'pressure';
    if (/\b(?:return|retorno)\b/.test(text)) return 'return';
    if (/\b(?:pilot|piloto)\b/.test(text)) return 'pilot';
    if (/\b(?:breather|respiradero|vent)\b/.test(text)) return 'breather';
  }
  if (system === 'transmission') {
    if (/\b(?:suction|succi[oó]n)\b/.test(text)) return 'suction';
    if (/\b(?:return|retorno)\b/.test(text)) return 'return';
    if (/\b(?:internal|interno)\b/.test(text)) return 'internal';
    if (/\b(?:external|externo)\b/.test(text)) return 'external';
  }
  if (system === 'cabin') return 'cabin';
  if (system === 'coolant') return 'coolant';
  if (system === 'air_dryer') return 'air_dryer';

  return 'unspecified';
}

function applicationConfigurationKey(product = {}) {
  const values = [
    product.application_configuration,
    product.configuration,
    product.engine_code,
    product.engine,
    product.transmission_code,
    product.transmission,
    product.variant
  ].filter(Boolean);
  if (!values.length) return 'default';
  return values.map(value => String(value).trim().toUpperCase()).join('|');
}

function isIntegratedComponent(product = {}) {
  const text = [
    product.filter_type,
    product.sub_type,
    product.name,
    product.description,
    JSON.stringify(product.specs || {}),
    JSON.stringify(product.enrichment_data || {})
  ].filter(Boolean).join(' ').toLowerCase();

  return /\b(?:in[- ]?tank|inside (?:the )?tank|fuel pump(?: module)?|sender assembly|pump module|module assembly|integrated|integrado|m[oó]dulo de bomba|dentro del tanque|non[- ]?serviceable|nonserviceable|inside (?:the )?(?:pump|module|housing|transmission)|integrated (?:into|in) (?:the )?(?:pump|module|tank|housing|transmission))\b/.test(text);
}

function governApplicationProducts(products = []) {
  const routine = [];
  const integrated = [];
  const byServicePosition = new Map();

  for (const product of products) {
    if (isIntegratedComponent(product)) {
      integrated.push(product);
      continue;
    }
    const system = maintenanceSystem(product);
    const role = serviceRole(product, system);
    const configuration = applicationConfigurationKey(product);
    const key = `${system}|${role}`;
    if (!byServicePosition.has(key)) {
      byServicePosition.set(key, { system, role, configurations: new Set(), products: [] });
    }
    byServicePosition.get(key).configurations.add(configuration);
    byServicePosition.get(key).products.push(product);
  }

  const conflicts = [];
  for (const entry of byServicePosition.values()) {
    const unique = [...new Map(entry.products.map(row => [row.sku, row])).values()];
    if (unique.length === 1) routine.push(unique[0]);
    else if (unique.length > 1) conflicts.push({
      system: entry.system,
      service_role: entry.role,
      configurations: [...entry.configurations],
      products: unique
    });
  }

  return { routine, integrated, conflicts };
}

function applicationAnswer(equipment, catalog) {
  const label = [equipment.brand, equipment.model, equipment.engine, equipment.year].filter(Boolean).join(' ');
  const governed = governApplicationProducts(catalog.products || []);
  const lines = governed.routine.map(product => `• ${applicationProductLabel(product)}`);
  const sections = [];

  if (lines.length) {
    sections.push(`Filtros de mantenimiento confirmados para ${label}:\n\n${lines.join('\n')}`);
  }

  if (governed.integrated.length) {
    const integratedLines = governed.integrated.map(product =>
      `• ${applicationProductLabel(product)} — componente integrado; no se presenta como filtro externo de mantenimiento periódico`
    );
    sections.push(`Componentes integrados confirmados:\n\n${integratedLines.join('\n')}`);
  }

  if (governed.conflicts.length) {
    const conflictPositions = governed.conflicts.map(item =>
      item.service_role && item.service_role !== 'unspecified'
        ? `${item.system} (${item.service_role})`
        : item.system
    ).join(', ');
    sections.push(`Hay más de una referencia posible para la misma posición de servicio en: ${conflictPositions}. No voy a escoger una arbitrariamente; necesito la variante de motor/configuración para resolverla.`);
  }

  if (!sections.length) {
    return `No encontré filtros de mantenimiento publicables para ${label} con la evidencia disponible. No voy a inventar una equivalencia.`;
  }

  return `${sections.join('\n\n')}\n\nLa publicación está gobernada por aplicación, sistema y configuración; no se mezclan variantes incompatibles.`;
}

function compatibilityAnswer(result) {
  const housings = result.housingProducts || [];
  const elements = result.products || [];
  const housingLabels = housings.map(productLabel).join(', ');
  const lines = elements.map(product => {
    const micron = product.micron_rating || String(product.description || '').match(/(\d+)\s*µm/i)?.[1] || null;
    return `• ${productLabel(product)}${micron ? ` — ${micron} micras` : ''}`;
  });

  return `La referencia identificada corresponde al housing ${housingLabels}. El housing no es el cartucho. Los elementos compatibles validados en PostgreSQL son:\n\n${lines.join('\n')}\n\nLa selección entre 30, 10 o 2 micras depende de la posición del elemento y de la configuración del sistema; no se asignará automáticamente el elemento más fino sin confirmar esa condición.`;
}

function buildCatalogPayload({ requestId, body, state, intent, catalog, answer, source, references = [] }) {
  return {
    protocol_version: PROTOCOL_VERSION,
    request_id: requestId,
    intent,
    phase: 'catalog_resolution',
    state,
    pending_field: state?.pendingField || null,
    evidence: {
      source: 'elimfilters_catalog',
      count: catalog.products.length,
      validated: catalog.products.length > 0,
      lookup_status: catalog.lookupStatus,
      match_type: catalog.matchType || null,
      references,
      products: catalog.products,
      housing_products: catalog.housingProducts || [],
      compatible_series: catalog.series || [],
      application_conflicts: catalog.conflicts || []
    },
    intelligence: {
      classifier: 'deterministic',
      groq_enabled: Boolean(process.env.GROQ_API_KEY),
      knowledge_status: 'skipped',
      knowledge_source_count: 0,
      knowledge_conflicts_detected: false,
      clarification_reason: null
    },
    knowledge_governance: {
      safe_to_publish: true,
      technical_source_validated: false,
      oem_maintenance_found: false,
      knowledge_gap_registered: false,
      hermes_request_created: false,
      sku_validated_in_postgresql: catalog.products.length > 0,
      authority_violation_count: 0
    },
    deterministic_router: {
      matched: true,
      source,
      references
    },
    answer
  };
}

async function finalizeDeterministic({ body, key, state, payload }) {
  const guarded = applyProtocolGuardrails(payload, body);
  const formatted = await formatForChannel(guarded, body);
  const memorySource = await saveMemory(key, state);
  formatted.memory = {
    enabled: Boolean(key),
    key_scope: key ? 'channel_conversation' : null,
    memory_source: memorySource,
    pending_field: null,
    reset: !key
  };
  return formatted;
}

async function resolveDeterministically(body) {
  const message = String(body.message || '').trim();
  const requestId = crypto.randomUUID();
  const key = memoryKey(body);
  const { state: loaded } = await loadMemory(key);
  let state = normalizeState(loaded);
  const replacementRequest = isReplacementElementRequest(message);

  if (replacementRequest && state.identifiedHousing?.sku) {
    const housingCatalog = await searchByReferences([state.identifiedHousing.sku]);
    if (housingCatalog.lookupStatus === 'completed' && housingCatalog.products.length) {
      const compatibility = await searchCompatibleElements(housingCatalog.products);
      if (compatibility.products.length) {
        state = normalizeState({
          ...state,
          intent: 'cross_reference_lookup',
          phase: 'catalog_resolution',
          pendingField: null,
          validatedProducts: compatibility.products,
          unresolvedAttempts: 0,
          conversationHistory: [...(state.conversationHistory || []), message],
          identifiedHousing: {
            ...state.identifiedHousing,
            compatibleSeries: compatibility.series
          }
        });
        const payload = buildCatalogPayload({
          requestId, body, state, intent: 'cross_reference_lookup', catalog: compatibility,
          answer: compatibilityAnswer(compatibility), source: 'memory_housing_to_compatible_element'
        });
        return finalizeDeterministic({ body, key, state, payload });
      }
    }
  }

  const applicationEquipment = extractApplicationEntities(message);
  const equipmentContinuation = EQUIPMENT_BRAND_PATTERN.test(message)
    && /\b(?:para|con|motor|engine|modelo|model)\b/i.test(message)
    && !REFERENCE_INTENT_PATTERN.test(message)
    && !SPECIFICATION_INTENT_PATTERN.test(message);
  const applicationRequest = (APPLICATION_INTENT_PATTERN.test(message) || equipmentContinuation)
    && applicationEquipment.tokens.length > 0;

  if (applicationRequest) {
    const canUseValidatedKit = Boolean(
      applicationEquipment.brand
      && applicationEquipment.model
      && applicationEquipment.year
    );
    const validatedKit = canUseValidatedKit
      ? await searchValidatedMaintenanceKit(
        applicationEquipment.brand,
        applicationEquipment.model,
        applicationEquipment.year
      )
      : { products: [], lookupStatus: 'not_required', kit: null, ambiguous: false };

    if (validatedKit.lookupStatus === 'error') return null;

    if (validatedKit.ambiguous) {
      state = normalizeState({
        ...state,
        intent: 'application_lookup',
        phase: 'collecting_application_data',
        equipment: {
          ...state.equipment,
          brand: applicationEquipment.brand,
          model: applicationEquipment.model,
          engine: applicationEquipment.engine,
          year: applicationEquipment.year
        },
        pendingField: 'engine_or_configuration',
        validatedProducts: [],
        unresolvedAttempts: (state.unresolvedAttempts || 0) + 1,
        conversationHistory: [...(state.conversationHistory || []), message]
      });
      const catalog = { products: [], lookupStatus: 'completed', matchType: 'multiple_validated_configurations' };
      const answer = `Hay más de una configuración validada para ${[applicationEquipment.brand, applicationEquipment.model, applicationEquipment.year].filter(Boolean).join(' ')}. Indica motor, combustible o versión para seleccionar los filtros correctos; no voy a mezclar componentes de configuraciones distintas.`;
      const payload = buildCatalogPayload({
        requestId, body, state, intent: 'application_lookup', catalog, answer,
        source: 'validated_maintenance_kit_ambiguous'
      });
      return finalizeDeterministic({ body, key, state, payload });
    }

    if (validatedKit.products.length) {
      const kitLabel = validatedKit.kit?.equipment_ref
        || [applicationEquipment.brand, applicationEquipment.model, applicationEquipment.year].filter(Boolean).join(' ');
      const governedKit = governApplicationProducts(validatedKit.products);
      const publishableProducts = [...governedKit.routine, ...governedKit.integrated];
      const hasConflicts = governedKit.conflicts.length > 0;
      state = normalizeState({
        ...state,
        intent: 'application_lookup',
        phase: hasConflicts ? 'collecting_application_data' : 'catalog_resolution',
        equipment: {
          ...state.equipment,
          brand: applicationEquipment.brand,
          model: applicationEquipment.model,
          engine: applicationEquipment.engine,
          year: applicationEquipment.year
        },
        pendingField: hasConflicts ? 'engine_or_configuration' : null,
        validatedProducts: publishableProducts,
        unresolvedAttempts: hasConflicts ? (state.unresolvedAttempts || 0) + 1 : 0,
        conversationHistory: [...(state.conversationHistory || []), message]
      });

      const governedCatalog = { ...validatedKit, products: publishableProducts, conflicts: governedKit.conflicts };
      const answer = applicationAnswer(applicationEquipment, governedCatalog);
      const payload = buildCatalogPayload({
        requestId,
        body,
        state,
        intent: 'application_lookup',
        catalog: governedCatalog,
        answer,
        source: 'validated_maintenance_kit'
      });
      return finalizeDeterministic({ body, key, state, payload });
    }

    const applicationCatalog = await searchByApplication(
      applicationEquipment.tokens,
      applicationEquipment.year,
      requestedFilterSystem(message)
    );
    if (applicationCatalog.lookupStatus === 'error') return null;

    const governedApplication = governApplicationProducts(applicationCatalog.products);
    const publishableProducts = [...governedApplication.routine, ...governedApplication.integrated];
    const hasConflicts = governedApplication.conflicts.length > 0;
    const requestedSystem = requestedFilterSystem(message);
    const needsDisambiguation = needsApplicationDisambiguation(applicationEquipment, requestedSystem, applicationCatalog.products);
    const governedCatalog = { ...applicationCatalog, products: publishableProducts, conflicts: governedApplication.conflicts };

    state = normalizeState({
      ...state,
      intent: 'application_lookup',
      phase: (hasConflicts || needsDisambiguation) ? 'collecting_application_data' : 'catalog_resolution',
      equipment: {
        ...state.equipment,
        brand: applicationEquipment.brand,
        model: applicationEquipment.model,
        engine: applicationEquipment.engine,
        year: applicationEquipment.year
      },
      pendingField: hasConflicts ? 'engine_or_configuration' : (needsDisambiguation ? 'model_or_year' : null),
      validatedProducts: publishableProducts,
      unresolvedAttempts: publishableProducts.length && !hasConflicts ? 0 : (state.unresolvedAttempts || 0) + 1,
      conversationHistory: [...(state.conversationHistory || []), message]
    });

    const systemLabel = ({ oil: 'aceite', fuel: 'combustible', air: 'aire', cabin: 'cabina', hydraulic: 'hidráulico', coolant: 'refrigerante' })[requestedSystem] || requestedSystem;
    const answer = applicationCatalog.products.length
      ? applicationAnswer(applicationEquipment, applicationCatalog)
      : needsDisambiguation
        ? `Para ${applicationEquipment.brand} con motor ${applicationEquipment.engine}, la referencia del filtro de ${systemLabel} depende del modelo y año. Indica esos dos datos para seleccionar la aplicación exacta sin mezclar configuraciones.`
        : `No encontré aplicaciones confirmadas en ELIMFILTERS para ${[applicationEquipment.brand, applicationEquipment.model, applicationEquipment.year].filter(Boolean).join(' ')}. No voy a inventar una equivalencia; verifica el modelo o motor y vuelvo a buscar.`;

    const payload = buildCatalogPayload({
      requestId,
      body,
      state,
      intent: 'application_lookup',
      catalog: governedCatalog,
      answer,
      source: 'vehicle_application_lookup'
    });
    return finalizeDeterministic({ body, key, state, payload });
  }

  const references = extractReferences(message);
  if (references.length) {
    if (shouldDeferReferenceToCanonical(message, state, replacementRequest)) return null;

    const catalog = await searchByReferences(references);
    if (catalog.lookupStatus === 'error') return null;
    if (!catalog.products.length) return null;

    let resolvedCatalog = catalog;
    let source = 'catalog_reference_entity';
    let answer = `Referencia confirmada en la base de datos ELIMFILTERS:\n\n${catalog.products.map(product => `• ${productLabel(product)}`).join('\n')}`;
    let intent = deterministicIntent(message);

    if (replacementRequest) {
      const compatibility = await searchCompatibleElements(catalog.products);
      if (compatibility.products.length) {
        resolvedCatalog = compatibility;
        source = 'housing_to_compatible_element';
        answer = compatibilityAnswer(compatibility);
        intent = 'cross_reference_lookup';
      }
    }

    const housing = (catalog.products || []).find(isHousing) || null;
    state = normalizeState({
      ...state,
      intent,
      phase: 'catalog_resolution',
      pendingField: null,
      validatedProducts: resolvedCatalog.products,
      unresolvedAttempts: 0,
      conversationHistory: [...(state.conversationHistory || []), message],
      identifiedHousing: housing ? {
        sku: housing.sku,
        externalReference: references[0] || null,
        compatibleSeries: resolvedCatalog.series || []
      } : state.identifiedHousing
    });

    const payload = buildCatalogPayload({ requestId, body, state, intent, catalog: resolvedCatalog, answer, source, references });
    return finalizeDeterministic({ body, key, state, payload });
  }

  if (replacementRequest) {
    const equipment = extractApplicationEntities(message);
    if (equipment.tokens.length) {
      const applicationCatalog = await searchByApplication(equipment.tokens, equipment.year);
      if (applicationCatalog.lookupStatus === 'error') return null;
      if (applicationCatalog.products.length) {
        const compatibility = await searchCompatibleElements(applicationCatalog.products);
        if (compatibility.products.length) {
          const housing = applicationCatalog.products.find(isHousing) || null;
          state = normalizeState({
            ...state,
            intent: 'application_lookup',
            phase: 'catalog_resolution',
            equipment: { ...state.equipment, brand: equipment.brand, engine: equipment.engine, year: equipment.year },
            pendingField: null,
            validatedProducts: compatibility.products,
            unresolvedAttempts: 0,
            conversationHistory: [...(state.conversationHistory || []), message],
            identifiedHousing: housing ? {
              sku: housing.sku,
              externalReference: null,
              compatibleSeries: compatibility.series
            } : state.identifiedHousing
          });
          const payload = buildCatalogPayload({
            requestId, body, state, intent: 'application_lookup', catalog: compatibility,
            answer: compatibilityAnswer(compatibility), source: 'application_housing_to_compatible_element'
          });
          return finalizeDeterministic({ body, key, state, payload });
        }
      }
    }
  }

  return null;
}

function hasGroundedWaterSignal(body, canonical) {
  const message = String(body.message || '');
  const history = Array.isArray(canonical?.state?.conversationHistory) ? canonical.state.conversationHistory : [];
  return WATER_SIGNAL_PATTERN.test([message, ...history].join('\n'));
}

function nextDiagnosticQuestion(state) {
  if (!state.symptoms?.length) {
    return { pendingField: 'symptoms', question: '¿Qué síntomas observás exactamente en el equipo?' };
  }
  if (!state.duration) {
    return { pendingField: 'duration', question: '¿Desde cuándo ocurre este problema?' };
  }
  if (!state.operatingContext) {
    return { pendingField: 'operatingContext', question: '¿En qué tipo de operación trabaja el equipo: carretera, ciudad, trabajo mixto u otra?' };
  }
  if (state.installedFilter?.status !== 'unknown' && !state.installedFilter?.reference) {
    return { pendingField: 'installedFilter', question: '¿Qué filtro está usando actualmente? Indica marca y código impresos, o envía una foto clara.' };
  }
  return { pendingField: null, question: null };
}

async function repairUngroundedDiagnosticClarification(body, canonical) {
  if (!canonical || canonical.intent !== 'diagnostic' || canonical.pending_field !== 'symptom_system') return canonical;
  if (hasGroundedWaterSignal(body, canonical)) return canonical;

  const message = String(body.message || '').trim();
  const key = memoryKey(body);
  const repairedState = normalizeState(canonical.state || {});

  repairedState.symptoms = (repairedState.symptoms || []).filter(symptom => !(
    symptom?.system === 'unknown'
    && /^water_/i.test(String(symptom?.code || ''))
  ));

  if (POWER_LOSS_PATTERN.test(message) && !repairedState.symptoms.some(symptom => symptom?.code === 'power_loss')) {
    repairedState.symptoms.push({ code: 'power_loss', raw: message, system: null });
  }

  const next = nextDiagnosticQuestion(repairedState);
  repairedState.pendingField = next.pendingField;
  repairedState.phase = next.pendingField ? 'collecting_diagnostic_data' : 'diagnostic_assessment';

  canonical.state = repairedState;
  canonical.pending_field = next.pendingField;
  canonical.phase = repairedState.phase;
  canonical.answer = next.question || 'Ya tengo los datos principales. Voy a continuar con la evaluación técnica sin asumir información que no hayas indicado.';
  canonical.intelligence = {
    ...(canonical.intelligence || {}),
    classifier: 'deterministic_repair',
    clarification_reason: 'Removed unsupported water-system clarification'
  };
  canonical.deterministic_router = {
    matched: true,
    source: 'diagnostic_grounding_repair',
    references: []
  };

  await saveMemory(key, repairedState);
  console.warn('[bot-protocol-grounding-repair]', {
    request_id: canonical.request_id,
    reason: 'unsupported_water_clarification',
    repaired_pending_field: next.pendingField,
    power_loss_detected: POWER_LOSS_PATTERN.test(message)
  });

  return canonical;
}

async function runUnifiedBotProtocol(body) {
  const deterministic = await resolveDeterministically(body);
  if (deterministic) return deterministic;
  let canonical = await runBotProtocol(body);
  canonical = await repairUngroundedDiagnosticClarification(body, canonical);
  canonical = applyDiagnosticResponseMatrix(canonical);
  canonical.protocol_version = PROTOCOL_VERSION;
  return canonical;
}

async function handleUnifiedBotProtocolRequest(req, res) {
  const startedAt = Date.now();
  try {
    const payload = await runUnifiedBotProtocol(req.body || {});
    console.info('[bot-protocol-unified-orchestrator]', {
      request_id: payload.request_id,
      intent: payload.intent,
      phase: payload.phase,
      pending_field: payload.pending_field,
      evidence_count: payload.evidence?.count || 0,
      deterministic_source: payload.deterministic_router?.source || null,
      diagnostic_matrix: payload.diagnostic_matrix?.criterion || null,
      duration_ms: Date.now() - startedAt
    });
    return res.json(payload);
  } catch (error) {
    console.error('[bot-protocol-unified-orchestrator]', { error: error.message, stack: error.stack, duration_ms: Date.now() - startedAt });
    return res.status(503).json({ error: 'protocol_temporarily_unavailable' });
  }
}

module.exports = {
  PROTOCOL_VERSION,
  isReplacementElementRequest,
  extractApplicationEntities,
  requestedFilterSystem,
  needsApplicationDisambiguation,
  shouldDeferReferenceToCanonical,
  maintenanceSystem,
  serviceRole,
  applicationConfigurationKey,
  isIntegratedComponent,
  governApplicationProducts,
  resolveDeterministically,
  repairUngroundedDiagnosticClarification,
  runUnifiedBotProtocol,
  handleUnifiedBotProtocolRequest
};
