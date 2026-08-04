const CHANNEL_LIMITS = {
  whatsapp: 3000,
  instagram: 900,
  facebook: 1800,
  linkedin: 1300,
  web: 5000,
  api: 8000
};

const COPY = {
  es: {
    confirmed: 'Referencia confirmada en la base de datos ELIMFILTERS:',
    description: 'Descripción',
    technicalComment: 'Comentario técnico',
    authorizedDistributor: 'Para adquirir productos ELIMFILTERS, debe contactar al distribuidor autorizado de su país. ¿En qué país se encuentra?',
    noDistributor: 'Entiendo. Para orientarlo correctamente: ¿está interesado en distribuir ELIMFILTERS en su país, o necesita productos para una empresa, flota, mina, planta, taller u otra operación? Indique también el país y el tipo de operación.'
  },
  en: {
    confirmed: 'Reference confirmed in the ELIMFILTERS database:',
    description: 'Description',
    technicalComment: 'Technical comment',
    authorizedDistributor: 'To purchase ELIMFILTERS products, please contact the authorized distributor for your country. Which country are you located in?',
    noDistributor: 'Understood. To route your request correctly: are you interested in distributing ELIMFILTERS in your country, or do you need products for a company, fleet, mine, plant, workshop, or another operation? Please also indicate the country and type of operation.'
  },
  pt: {
    confirmed: 'Referência confirmada no banco de dados ELIMFILTERS:',
    description: 'Descrição',
    technicalComment: 'Comentário técnico',
    authorizedDistributor: 'Para adquirir produtos ELIMFILTERS, entre em contato com o distribuidor autorizado do seu país. Em qual país você está?',
    noDistributor: 'Entendo. Para direcionar corretamente: você tem interesse em distribuir ELIMFILTERS no seu país ou precisa de produtos para uma empresa, frota, mina, planta, oficina ou outra operação? Informe também o país e o tipo de operação.'
  }
};

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
  const history = Array.isArray(payload?.state?.conversationHistory) ? payload.state.conversationHistory.slice(-6).join(' ').toLowerCase() : '';
  const text = `${history} ${current}`;

  const ptScore = (text.match(/\b(onde|comprar|distribuidor|não|nao|país|pais|frota|mina|empresa|preciso|produto)\b/g) || []).length;
  const enScore = (text.match(/\b(where|buy|purchase|distributor|country|fleet|mine|company|need|product|filter)\b/g) || []).length;
  const esScore = (text.match(/\b(dónde|donde|comprar|adquirir|distribuidor|país|pais|flota|mina|empresa|necesito|producto|filtro|quiero)\b/g) || []).length;

  if (ptScore > enScore && ptScore > esScore) return 'pt';
  if (enScore > esScore) return 'en';
  return 'es';
}

function normalizeOemCodes(value) {
  if (!Array.isArray(value)) return [];
  const codes = [];
  for (const item of value) {
    if (typeof item === 'string') {
      const code = cleanText(item, 80);
      if (code) codes.push(code);
      continue;
    }
    if (!item || typeof item !== 'object') continue;
    const code = cleanText(item.code || item.reference || item.part_number || item.partNumber, 80);
    if (!code) continue;
    const manufacturer = cleanText(item.manufacturer || item.brand || item.oem, 60);
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
  const text = String(value || '');
  return ['whatsapp', 'instagram', 'facebook'].includes(channel) ? `\`${text}\`` : text;
}

function formatCatalogProduct(product, { language = 'es', channel = 'api' } = {}) {
  const labels = COPY[language] || COPY.es;
  const header = `• ${product.sku}${product.codigo_base ? ` / ${product.codigo_base}` : ''}${product.filter_type ? ` — ${product.filter_type}` : ''}`;
  const details = [];
  const description = cleanText(product.description || product.name, 220);
  const oemCodes = normalizeOemCodes(product.oem_codes);
  const knowledgeComment = approvedKnowledgeComment(product);

  if (description) details.push(`  ${labels.description}: ${description}`);
  if (oemCodes.length) details.push(`  OEM: ${oemCodes.map(code => protectOemCode(code, channel)).join(', ')}`);
  if (knowledgeComment) details.push(`  ${labels.technicalComment}: ${knowledgeComment}`);
  return [header, ...details].join('\n');
}

function enrichCatalogAnswer(payload, answer, options) {
  const products = payload?.evidence?.products;
  if (!Array.isArray(products) || !products.length) return answer;
  const catalogIntent = ['exact_reference_lookup', 'cross_reference_lookup', 'specification_lookup', 'application_lookup'].includes(payload?.intent);
  if (!catalogIntent) return answer;
  const labels = COPY[options.language] || COPY.es;
  return `${labels.confirmed}\n\n${products.map(product => formatCatalogProduct(product, options)).join('\n\n')}`;
}

function commercialRoutingAnswer(message, language) {
  const text = String(message || '').trim().toLowerCase();
  const labels = COPY[language] || COPY.es;
  const noDistributor = /(no\s+(hay|existe|tenemos?)\s+(un\s+)?distribuidor|sin\s+distribuidor|there\s+is\s+no\s+distributor|no\s+distributor|não\s+(há|tem)\s+distribuidor|nao\s+(ha|tem)\s+distribuidor)/i.test(text);
  if (noDistributor) return labels.noDistributor;

  const acquisition = /(d[oó]nde|donde|where|onde).*(comprar|adquirir|purchase|buy|obter)|\b(comprar|adquirir|purchase|buy)\b.*\b(d[oó]nde|donde|where|onde)\b/i.test(text);
  return acquisition ? labels.authorizedDistributor : null;
}

function formatForChannel(payload = {}, requestBody = {}) {
  const channel = normalizeChannel(requestBody.channel || requestBody.context?.channel);
  const limit = CHANNEL_LIMITS[channel];
  const language = detectLanguage(requestBody, payload);
  let answer = compactWhitespace(payload.answer);

  const routedCommercialAnswer = commercialRoutingAnswer(requestBody.message, language);
  if (routedCommercialAnswer) answer = routedCommercialAnswer;
  else answer = enrichCatalogAnswer(payload, answer, { language, channel });

  answer = truncateAtBoundary(answer, limit);

  return {
    ...payload,
    answer,
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
  formatCatalogProduct,
  normalizeOemCodes,
  approvedKnowledgeComment,
  detectLanguage,
  commercialRoutingAnswer
};
