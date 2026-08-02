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

function formatForChannel(payload = {}, requestBody = {}) {
  const channel = normalizeChannel(requestBody.channel || requestBody.context?.channel);
  const limit = CHANNEL_LIMITS[channel];
  let answer = compactWhitespace(payload.answer);

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

module.exports = { formatForChannel, normalizeChannel, CHANNEL_LIMITS };
