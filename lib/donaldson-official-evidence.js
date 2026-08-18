'use strict';

function normalizeCode(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function pageSupportsCrossReference(html, donaldsonCode, currentCode) {
  const text = stripHtml(html);
  const normalizedText = normalizeCode(text);
  const d = normalizeCode(donaldsonCode);
  const c = normalizeCode(currentCode);
  const hasCrossReferenceContext = /cross\s*reference/i.test(text);
  return Boolean(d && c && hasCrossReferenceContext && normalizedText.includes(d) && normalizedText.includes(c));
}

module.exports = { normalizeCode, stripHtml, pageSupportsCrossReference };
