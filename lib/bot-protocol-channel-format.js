'use strict';

const { buildTicket, dispatchTicket } = require('./bot-protocol-escalation');

const CHANNEL_LIMITS = Object.freeze({
  whatsapp: 3000,
  instagram: 900,
  facebook: 1800,
  linkedin: 1300,
  web: 5000,
  api: 8000
});

const MAX_UNRESOLVED_ATTEMPTS = 5;

const COPY = {
  es: {
    confirmed: 'Referencia confirmada en la base de datos ELIMFILTERS:',
    recommendationIntro: 'Esto es lo que te recomendamos:',
    recommendationIntroFor: vehicle => `Para tu ${vehicle}, esto es lo que te recomendamos:`,
    recommendationClosing: 'Elegí ELIMFILTERS: protección real para tu equipo, con tecnología validada y trazabilidad en cada referencia. ¿Seguimos con la compra o tenés otra consulta?',
    description: 'Descripción',
    technology: 'Tecnología ELIMFILTERS',
    technicalComment: 'Comentario técnico',
    authorizedDistributor: 'Para adquirir productos ELIMFILTERS, debe contactar al distribuidor autorizado de su país. ¿En qué país se encuentra?',
    noDistributor: 'Entiendo. Para orientarlo correctamente: ¿está interesado en distribuir ELIMFILTERS en su país, o necesita productos para una empresa, flota, mina, planta, taller u otra operación? Indique también el país y el tipo de operación.',
    escalated: ticket => `No pude confirmar una respuesta con suficiente evidencia. Su solicitud fue referida al departamento correspondiente de ELIMFILTERS bajo el Ticket #${ticket}. Nuestro equipo continuará la revisión.`
  },
  en: {
    confirmed: 'Reference confirmed in the ELIMFILTERS database:',
    recommendationIntro: 'Here is what we recommend:',
    recommendationIntroFor: vehicle => `For your ${vehicle}, here is what we recommend:`,
    recommendationClosing: 'Choose ELIMFILTERS: real protection for your equipment, with validated technology and traceability on every reference. Shall we move forward, or do you have another question?',
    description: 'Description',
    technology: 'ELIMFILTERS technology',
    technicalComment: 'Technical comment',
    authorizedDistributor: 'To purchase ELIMFILTERS products, please contact the authorized distributor for your country. Which country are you located in?',
    noDistributor: 'Understood. To route your request correctly: are you interested in distributing ELIMFILTERS in your country, or do you need products for a company, fleet, mine, plant, workshop, or another operation? Please also indicate the country and type of operation.',
    escalated: ticket => `I could not confirm an answer with sufficient evidence. Your request was referred to the appropriate ELIMFILTERS department under Ticket #${ticket}. Our team will continue the review.`
  },
  pt: {
    confirmed: 'Referência confirmada no banco de dados ELIMFILTERS:',
    recommendationIntro: 'Aqui está o que recomendamos:',
    recommendationIntroFor: vehicle => `Para o seu ${vehicle}, aqui está o que recomendamos:`,
    recommendationClosing: 'Escolha a ELIMFILTERS: proteção real para o seu equipamento, com tecnologia validada e rastreabilidade em cada referência. Seguimos com a compra ou tem outra dúvida?',
    description: 'Descrição',
    technology: 'Tecnologia ELIMFILTERS',
    technicalComment: 'Comentário técnico',
    authorizedDistributor: 'Para adquirir produtos ELIMFILTERS, entre em contato com o distribuidor autorizado do seu país. Em qual país você está?',
    noDistributor: 'Entendo. Para direcionar corretamente: você tem interesse em distribuir ELIMFILTERS no seu país ou precisa de produtos para uma empresa, frota, mina, planta, oficina ou outra operação? Informe também o país e o tipo de operação.',
    escalated: ticket => `Não consegui confirmar uma resposta com evidência suficiente. Sua solicitação foi encaminhada ao departamento correspondente da ELIMFILTERS sob o Ticket #${ticket}. Nossa equipe continuará a análise.`
  }
};

// Catalog data (`filter_type`) is stored in English regardless of the
// customer's language -- interpolating it verbatim into an otherwise-Spanish
// or Portuguese answer is what produced mixed-language, unconvincing replies
// (e.g. "SKU123 — Fuel Filter" inside a Spanish sentence). Unknown values
// fall back to the original text rather than disappearing, since an
// untranslated label is still better than a silently dropped one.
//
// The live catalog stores this as a short category tag, not a descriptive
// phrase -- confirmed directly against production (`SELECT DISTINCT
// filter_type FROM elimfilters_catalog`) returns 'air' (4998 rows),
// 'hydraulic' (2367), 'fuel' (2131), 'oil' (1855), 'cabin' (652), 'water'
// (102), 'other' (76), plus one legacy 'Fuel Filter' outlier. Both forms are
// kept here so a future data-format change doesn't silently reopen this bug.
const FILTER_TYPE_TRANSLATIONS = {
  es: {
    'oil': 'Filtro de aceite',
    'oil filter': 'Filtro de aceite',
    'lube filter': 'Filtro de aceite',
    'fuel': 'Filtro de combustible',
    'fuel filter': 'Filtro de combustible',
    'water': 'Separador de agua y combustible',
    'fuel water separator': 'Separador de agua y combustible',
    'water separator': 'Separador de agua',
    'air': 'Filtro de aire',
    'air filter': 'Filtro de aire',
    'cabin': 'Filtro de cabina',
    'cabin air filter': 'Filtro de cabina',
    'coolant': 'Filtro de refrigerante',
    'coolant filter': 'Filtro de refrigerante',
    'hydraulic': 'Filtro hidráulico',
    'hydraulic filter': 'Filtro hidráulico',
    'housing': 'Carcasa (housing)',
    'other': 'Filtro'
  },
  pt: {
    'oil': 'Filtro de óleo',
    'oil filter': 'Filtro de óleo',
    'lube filter': 'Filtro de óleo',
    'fuel': 'Filtro de combustível',
    'fuel filter': 'Filtro de combustível',
    'water': 'Separador de água e combustível',
    'fuel water separator': 'Separador de água e combustível',
    'water separator': 'Separador de água',
    'air': 'Filtro de ar',
    'air filter': 'Filtro de ar',
    'cabin': 'Filtro de cabine',
    'cabin air filter': 'Filtro de cabine',
    'coolant': 'Filtro de arrefecimento',
    'coolant filter': 'Filtro de arrefecimento',
    'hydraulic': 'Filtro hidráulico',
    'hydraulic filter': 'Filtro hidráulico',
    'housing': 'Carcaça (housing)',
    'other': 'Filtro'
  }
};

function translateFilterType(value, language = 'es') {
  const text = cleanText(value, 60);
  if (!text) return null;
  const table = FILTER_TYPE_TRANSLATIONS[language];
  if (!table) return text;
  return table[text.toLowerCase()] || text;
}

function describeVehicle(equipment = {}, language = 'es') {
  const parts = [equipment.brand, equipment.model, equipment.year].filter(Boolean);
  if (!parts.length) return null;
  return parts.join(' ');
}

function normalizeChannel(value) {
  const channel = String(value || 'api').trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(CHANNEL_LIMITS, channel) ? channel : 'api';
}

function compactWhitespace(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function truncateAtBoundary(text, limit) {
  if (text.length <= limit) return text;
  const slice = text.slice(0, Math.max(0, limit - 1));
  const boundary = Math.max(slice.lastIndexOf('\n'), slice.lastIndexOf('. '), slice.lastIndexOf(' '));
  return `${slice.slice(0, boundary > limit * 0.65 ? boundary : slice.length).trim()}…`;
}

function cleanText(value, maxLength = 220) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return null;
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trim()}…` : text;
}

function detectLanguage(requestBody = {}, payload = {}) {
  const explicit = String(requestBody.language || requestBody.locale || requestBody.context?.language || '').toLowerCase();
  if (/^pt/.test(explicit)) return 'pt';
  if (/^en/.test(explicit)) return 'en';
  if (/^es/.test(explicit)) return 'es';

  const current = String(requestBody.message || '').toLowerCase();
  const history = Array.isArray(payload?.state?.conversationHistory)
    ? payload.state.conversationHistory.slice(-6).join(' ').toLowerCase()
    : '';
  const text = `${history} ${current}`;
  const ptScore = (text.match(/\b(onde|comprar|distribuidor|não|nao|país|pais|frota|mina|empresa|preciso|produto)\b/g) || []).length;
  const enScore = (text.match(/\b(where|buy|purchase|distributor|country|fleet|mine|company|need|product|filter|cross)\b/g) || []).length;
  const esScore = (text.match(/\b(dónde|donde|comprar|adquirir|distribuidor|país|pais|flota|mina|empresa|necesito|producto|filtro|equivalente)\b/g) || []).length;
  if (ptScore > enScore && ptScore > esScore) return 'pt';
  if (enScore > esScore) return 'en';
  return 'es';
}

function normalizeManufacturer(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
}

function inferEngineManufacturers(engine) {
  const value = normalizeManufacturer(engine);
  if (!value) return [];
  if (/\bMP\d{1,2}\b/.test(value)) return ['MACK', 'VOLVO'];
  if (/\bD1[136]\b/.test(value)) return ['VOLVO', 'MACK'];
  if (/\bDD\d{1,2}\b|SERIES 60/.test(value)) return ['DETROIT'];
  if (/\bISX\d*\b|\bX15\b|\bL9\b|\bB6 7\b/.test(value)) return ['CUMMINS'];
  return [];
}

function allowedOemManufacturers(equipment = {}) {
  const brand = normalizeManufacturer(equipment.brand);
  const allowed = new Set();
  if (brand) allowed.add(brand);
  if (brand === 'MACK') allowed.add('VOLVO');
  if (brand === 'VOLVO') allowed.add('MACK');
  for (const manufacturer of inferEngineManufacturers(equipment.engine)) allowed.add(manufacturer);
  return allowed;
}

function manufacturerAllowed(manufacturer, allowed) {
  if (!allowed.size) return true;
  const normalized = normalizeManufacturer(manufacturer);
  if (!normalized) return false;
  return [...allowed].some(candidate => normalized === candidate || normalized.startsWith(`${candidate} `));
}

function normalizeOemCodes(value, equipment = {}) {
  if (!Array.isArray(value)) return [];
  const allowed = allowedOemManufacturers(equipment);
  const codes = [];
  for (const item of value) {
    if (typeof item === 'string') {
      const text = cleanText(item, 100);
      if (!text) continue;
      const match = text.match(/^([A-Za-z][A-Za-z0-9 &.-]{1,40})\s+([A-Za-z0-9][A-Za-z0-9./-]*)$/);
      if (allowed.size && (!match || !manufacturerAllowed(match[1], allowed))) continue;
      codes.push(text);
      continue;
    }
    if (!item || typeof item !== 'object') continue;
    const code = cleanText(item.code || item.reference || item.part_number || item.partNumber, 80);
    if (!code) continue;
    const manufacturer = cleanText(item.manufacturer || item.brand || item.oem, 60);
    if (!manufacturerAllowed(manufacturer, allowed)) continue;
    codes.push(manufacturer ? `${manufacturer} ${code}` : code);
  }
  return [...new Set(codes)].slice(0, 8);
}

function approvedKnowledgeComment(product) {
  const enrichment = product?.enrichment_data;
  if (!enrichment || typeof enrichment !== 'object') return null;
  const candidate = enrichment.knowledge_center_comment || enrichment.technical_comment || null;
  if (!candidate) return null;
  if (typeof candidate === 'string') return enrichment.approved_for_bot_use === true ? cleanText(candidate, 260) : null;
  if (typeof candidate !== 'object' || candidate.approved_for_bot_use !== true) return null;
  return cleanText(candidate.comment || candidate.text || candidate.statement, 260);
}

function protectOemCode(value, channel) {
  return ['whatsapp', 'instagram', 'facebook'].includes(channel) ? `\`${String(value || '')}\`` : String(value || '');
}

// Canonical fuel-technology scope:
// - TURBOCORE™ exclusively governs approved FH/FG turbine-style fuel/water
//   separation systems and their dedicated replacement-element architecture.
// - HYDROCORE™ governs approved standard non-turbine fuel/water separators.
// - SYNTAPORE™ governs plain diesel-fuel particulate filtration.
// These scopes are intentionally distinct and must not be merged.
function isTurbineHousingSignal(product = {}) {
  const haystack = `${product.filter_type || ''} ${product.sub_type || ''} ${product.name || ''} ${product.sku || ''} ${product.codigo_base || ''} ${product.description || ''}`.toUpperCase();
  const codigoBase = String(product.codigo_base || '').toUpperCase();
  if (/TURBINE|RACOR/.test(haystack)) return true;
  // Approved turbine housings may use FH/FG identifiers such as 900/902/1000/1002.
  if (/(?:^|[^A-Z0-9])(?:500|900|1000|2010|2020|2040)(?:FG|FH)(?:[^A-Z0-9]|$)/.test(haystack)) return true;
  // Dedicated replacement elements for those turbine systems may use the
  // 2010/2020/2040 series with PM/SM/TM variants.
  if (/^(2010|2020|2040)(SM|TM|PM)/.test(codigoBase)) return true;
  return false;
}

function inferTechnology(product = {}) {
  const explicit = cleanText(product.technology || product.specs?.technology || product.enrichment_data?.technology, 100);
  if (explicit) return explicit;
  const isTurbine = isTurbineHousingSignal(product);
  if (isTurbine) return 'TURBOCORE™';
  const type = `${product.filter_type || ''} ${product.sub_type || ''}`.toLowerCase();
  // A non-turbine water separator (production's bare 'water' filter_type
  // category, or explicit "fuel water separator" wording) is HYDROCORE™.
  // SYNTAPORE™ is scoped to plain fuel filtration only, never separators.
  const isFuelWaterSeparator = /\bwater\b|fuel.*water|water.*separator|separador.*agua/.test(type);
  if (isFuelWaterSeparator) return 'HYDROCORE™';
  if (/fuel|diesel|combustible/.test(type)) return 'SYNTAPORE™';
  if (/dryer|secador/.test(type)) return 'DRYCORE™';
  if (/hydraulic|hidr[aá]ul/.test(type)) return 'NANOFORCE™';
  if (/lube|lubric|oil|aceite/.test(type)) return 'SYNTRAX™';
  if (/coolant|refrigerante/.test(type)) return 'THERMACORE™';
  if (/cabin|cabina/.test(type)) return 'MICROKAPPA™';
  if (/air/.test(type) && /housing/.test(type)) return 'INTEKCORE™';
  if (/air|aire|intake|admisi[oó]n/.test(type)) return 'MACROCORE™';
  return null;
}

function extractInputReference(payload = {}, requestBody = {}) {
  const references = payload?.evidence?.references;
  if (Array.isArray(references) && references.length) return cleanText(references[0], 80);
  return cleanText(String(requestBody.message || '').match(/\b(?=[A-Z0-9./-]{4,}\b)(?=[A-Z0-9./-]*[A-Z])(?=[A-Z0-9./-]*\d)[A-Z0-9]+(?:[-/.][A-Z0-9]+)*\b/i)?.[0], 80);
}

function formatCatalogProduct(product, { language = 'es', channel = 'api', equipment = {} } = {}) {
  const labels = COPY[language] || COPY.es;
  const filterTypeLabel = translateFilterType(product.filter_type, language);
  const header = `• ${product.sku}${product.codigo_base ? ` / ${product.codigo_base}` : ''}${filterTypeLabel ? ` — ${filterTypeLabel}` : ''}`;
  const details = [];
  // product.description/name is free-text catalog data stored in English
  // regardless of the customer's language (same root cause as filter_type).
  // There's no safe way to translate arbitrary free text without risking an
  // invented/incorrect technical claim, so it's only shown untranslated for
  // English conversations -- omitting it elsewhere keeps every line of a
  // Spanish/Portuguese recommendation actually in that language.
  const description = language === 'en' ? cleanText(product.description || product.name, 220) : null;
  const technology = inferTechnology(product);
  const oemCodes = normalizeOemCodes(product.oem_codes, equipment);
  const knowledgeComment = approvedKnowledgeComment(product);
  if (description) details.push(`  ${labels.description}: ${description}`);
  if (technology) details.push(`  ${labels.technology}: ${technology}`);
  if (oemCodes.length) details.push(`  OEM: ${oemCodes.map(code => protectOemCode(code, channel)).join(', ')}`);
  if (knowledgeComment) details.push(`  ${labels.technicalComment}: ${knowledgeComment}`);
  return [header, ...details].join('\n');
}

// The specific benefit worth naming depends on which system the filter
// actually protects -- claiming "fuel cleanliness" for an oil or hydraulic
// filter is inaccurate and undercuts trust, which is the opposite of what a
// recommendation is for.
const TECHNOLOGY_PURPOSE_PHRASES = {
  es: {
    fuel: 'a mantener el combustible limpio y proteger el sistema de inyección',
    oil: 'a mantener la lubricación del motor y extender su vida útil',
    coolant: 'a mantener limpio el sistema de enfriamiento',
    hydraulic: 'a proteger los componentes hidráulicos de la contaminación',
    air: 'a evitar el ingreso de partículas y proteger el motor',
    cabin: 'a mantener el aire de la cabina limpio',
    default: 'a la protección del activo'
  },
  en: {
    fuel: 'keep the fuel clean and protect the injection system',
    oil: 'maintain engine lubrication and extend its service life',
    coolant: 'keep the cooling system clean',
    hydraulic: 'protect hydraulic components from contamination',
    air: 'keep particles out and protect the engine',
    cabin: 'keep cabin air clean',
    default: 'asset protection'
  },
  pt: {
    fuel: 'manter o combustível limpo e proteger o sistema de injeção',
    oil: 'manter a lubrificação do motor e prolongar sua vida útil',
    coolant: 'manter limpo o sistema de arrefecimento',
    hydraulic: 'proteger os componentes hidráulicos da contaminação',
    air: 'evitar a entrada de partículas e proteger o motor',
    cabin: 'manter o ar da cabine limpo',
    default: 'a proteção do ativo'
  }
};

function technologyPurposePhrase(filterType, language) {
  const type = String(filterType || '').toLowerCase();
  const table = TECHNOLOGY_PURPOSE_PHRASES[language] || TECHNOLOGY_PURPOSE_PHRASES.es;
  if (/cabin/.test(type)) return table.cabin;
  if (/fuel/.test(type)) return table.fuel;
  if (/oil|lube/.test(type)) return table.oil;
  if (/coolant/.test(type)) return table.coolant;
  if (/hydraulic/.test(type)) return table.hydraulic;
  if (/air/.test(type)) return table.air;
  return table.default;
}

function buildCrossReferenceNarrative(payload, requestBody, language) {
  const products = payload?.evidence?.products;
  if (!Array.isArray(products) || products.length !== 1) return null;
  if (!['cross_reference_lookup', 'exact_reference_lookup'].includes(payload?.intent)) return null;
  const inputReference = extractInputReference(payload, requestBody);
  if (!inputReference) return null;

  const product = products[0];
  const sku = cleanText(product.sku, 80);
  if (!sku) return null;
  const filterType = translateFilterType(product.filter_type, language) || cleanText(product.name, 120);
  const description = cleanText(product.description, 260);
  const technology = inferTechnology(product);
  const purpose = technologyPurposePhrase(product.filter_type, language);

  if (language === 'en') {
    const base = `The OEM part number ${inputReference} cross-references to the ELIMFILTERS ${sku}${filterType ? ` ${filterType}` : ''}.`;
    const descLine = description ? ` ${description.replace(/[.]+$/, '')}.` : '';
    const tech = technology ? ` It incorporates ELIMFILTERS ${technology} technology to help ${purpose}.` : '';
    return `${base}${descLine}${tech}`;
  }
  if (language === 'pt') {
    const base = `O código OEM ${inputReference} corresponde ao ELIMFILTERS ${sku}${filterType ? ` ${filterType}` : ''}.`;
    const descLine = description ? ` ${description.replace(/[.]+$/, '')}.` : '';
    const tech = technology ? ` Incorpora a tecnologia ELIMFILTERS ${technology} para ${purpose}.` : '';
    return `${base}${descLine}${tech}`;
  }
  const base = `La referencia OEM ${inputReference} cruza con el ELIMFILTERS ${sku}${filterType ? ` ${filterType}` : ''}.`;
  const descLine = description ? ` ${description.replace(/[.]+$/, '')}.` : '';
  const tech = technology ? ` Incorpora tecnología ELIMFILTERS ${technology} para ayudar ${purpose}.` : '';
  return `${base}${descLine}${tech}`;
}

function enrichCatalogAnswer(payload, answer, options, requestBody) {
  const products = payload?.evidence?.products;
  if (!Array.isArray(products) || !products.length) return answer;
  const catalogIntent = ['exact_reference_lookup', 'cross_reference_lookup', 'specification_lookup', 'application_lookup'].includes(payload?.intent);
  if (!catalogIntent) return answer;
  const narrative = buildCrossReferenceNarrative(payload, requestBody, options.language);
  if (narrative) return narrative;
  const labels = COPY[options.language] || COPY.es;
  const equipment = payload?.state?.equipment || {};
  const vehicle = describeVehicle(equipment, options.language);
  const intro = payload?.intent === 'application_lookup' && vehicle
    ? labels.recommendationIntroFor(vehicle)
    : labels.recommendationIntro;
  const productLines = products.map(product => formatCatalogProduct(product, { ...options, equipment })).join('\n\n');
  return `${intro}\n\n${productLines}\n\n${labels.recommendationClosing}`;
}

function commercialRoutingAnswer(message, language) {
  const text = String(message || '').trim().toLowerCase();
  const labels = COPY[language] || COPY.es;
  const noDistributor = /(no\s+(hay|existe|tenemos?)\s+(un\s+)?distribuidor|sin\s+distribuidor|there\s+is\s+no\s+distributor|no\s+distributor|não\s+(há|tem)\s+distribuidor|nao\s+(ha|tem)\s+distribuidor)/i.test(text);
  if (noDistributor) return labels.noDistributor;
  const acquisition = /(d[oó]nde|donde|where|onde).*(comprar|adquirir|purchase|buy|obter)|\b(comprar|adquirir|purchase|buy)\b.*\b(d[oó]nde|donde|where|onde)\b/i.test(text);
  return acquisition ? labels.authorizedDistributor : null;
}

function shouldEscalate(payload = {}) {
  const attempts = Number(payload?.state?.unresolvedAttempts || 0);
  const pendingField = payload?.pending_field || payload?.state?.pendingField || null;
  const lookupStatus = payload?.evidence?.lookup_status || 'not_required';
  if (pendingField) return false;
  if (['collecting_diagnostic_data', 'collecting_application_data'].includes(payload?.phase)) return false;
  if (lookupStatus !== 'completed') return false;
  if (attempts < MAX_UNRESOLVED_ATTEMPTS) return false;
  if (payload?.evidence?.validated || Number(payload?.evidence?.count || 0) > 0) return false;
  return ['diagnostic', 'application_lookup', 'exact_reference_lookup', 'cross_reference_lookup', 'specification_lookup', 'support_request', 'general'].includes(payload?.intent);
}

function escalateAnswer(payload, requestBody, language) {
  if (!shouldEscalate(payload)) return null;
  const ticket = buildTicket({ payload, requestBody });
  dispatchTicket(ticket).catch(error => console.error('[bot-ticket-dispatch]', error.message));
  return { answer: (COPY[language] || COPY.es).escalated(ticket.ticket_id), ticket };
}

function formatForChannel(payload = {}, requestBody = {}) {
  const channel = normalizeChannel(requestBody.channel || requestBody.context?.channel);
  const limit = CHANNEL_LIMITS[channel];
  const language = detectLanguage(requestBody, payload);
  let answer = compactWhitespace(payload.answer);
  let escalation = null;

  const escalated = escalateAnswer(payload, requestBody, language);
  if (escalated) {
    answer = escalated.answer;
    escalation = {
      ticket_id: escalated.ticket.ticket_id,
      status: escalated.ticket.status,
      department: escalated.ticket.department,
      priority: escalated.ticket.priority
    };
  } else {
    const routedCommercialAnswer = commercialRoutingAnswer(requestBody.message, language);
    if (routedCommercialAnswer) answer = routedCommercialAnswer;
    else answer = enrichCatalogAnswer(payload, answer, { language, channel }, requestBody);
  }

  answer = truncateAtBoundary(answer, limit);
  return {
    ...payload,
    answer,
    escalation,
    delivery: {
      channel,
      language,
      character_limit: limit,
      character_count: answer.length,
      truncated: answer.endsWith('…'),
      format: channel === 'api' ? 'structured_json' : 'plain_text'
    }
  };
}

module.exports = {
  formatForChannel,
  normalizeChannel,
  CHANNEL_LIMITS,
  MAX_UNRESOLVED_ATTEMPTS,
  formatCatalogProduct,
  normalizeOemCodes,
  approvedKnowledgeComment,
  detectLanguage,
  commercialRoutingAnswer,
  allowedOemManufacturers,
  inferEngineManufacturers,
  shouldEscalate,
  inferTechnology,
  buildCrossReferenceNarrative,
  extractInputReference
};