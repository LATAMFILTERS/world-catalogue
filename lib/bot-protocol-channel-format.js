const CHANNEL_LIMITS = {
  whatsapp: 3000,
  instagram: 900,
  facebook: 1800,
  linkedin: 1300,
  web: 5000,
  api: 8000
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

  if (typeof candidate === 'string') {
    return enrichment.approved_for_bot_use === true ? cleanText(candidate, 260) : null;
  }

  if (typeof candidate !== 'object' || candidate.approved_for_bot_use !== true) return null;
  return cleanText(candidate.comment || candidate.text || candidate.statement, 260);
}

function formatCatalogProduct(product) {
  const header = `• ${product.sku}${product.codigo_base ? ` / ${product.codigo_base}` : ''}${product.filter_type ? ` — ${product.filter_type}` : ''}`;
  const details = [];
  const description = cleanText(product.description || product.name, 220);
  const oemCodes = normalizeOemCodes(product.oem_codes);
  const knowledgeComment = approvedKnowledgeComment(product);

  if (description) details.push(`  Descripción: ${description}`);
  if (oemCodes.length) details.push(`  OEM: ${oemCodes.join(', ')}`);
  if (knowledgeComment) details.push(`  Comentario técnico: ${knowledgeComment}`);

  return [header, ...details].join('\n');
}

function enrichCatalogAnswer(payload, answer) {
  const products = payload?.evidence?.products;
  if (!Array.isArray(products) || !products.length) return answer;
  if (!/^Referencia confirmada en la base de datos ELIMFILTERS:/i.test(answer)) return answer;

  return `Referencia confirmada en la base de datos ELIMFILTERS:\n\n${products.map(formatCatalogProduct).join('\n\n')}`;
}

function formatForChannel(payload = {}, requestBody = {}) {
  const channel = normalizeChannel(requestBody.channel || requestBody.context?.channel);
  const limit = CHANNEL_LIMITS[channel];
  let answer = compactWhitespace(payload.answer);

  answer = enrichCatalogAnswer(payload, answer);

  if (channel === 'instagram') {
    answer = answer.replace(/^Aplicaciones confirmadas en el catálogo ELIMFILTERS:\s*/i, 'Aplicaciones confirmadas:\n');
  }

  if (channel === 'linkedin') {
    answer = answer.replace(/^Referencia confirmada en el catálogo ELIMFILTERS:\s*/i, 'Referencia confirmada:\n');
  }

  answer = truncateAtBoundary(answer, limit);

  return {
    ...payload,
    answer,
    delivery: {
      channel,
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
  approvedKnowledgeComment
};
