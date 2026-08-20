'use strict';

const OFFICIAL_HOST = 'shop.donaldson.com';
const PRODUCT_PATH = /^\/store\/[a-z]{2}-[a-z]{2}\/product\/([^/]+)\/([^/?#]+)/i;

function normalizeCode(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&amp;/gi, '&')
    .replace(/&#x2f;|&#47;/gi, '/')
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#x27;|&#39;/gi, "'");
}

function decodeRepeated(value, maxPasses = 3) {
  let decoded = decodeHtml(String(value || '').replace(/\\\//g, '/'));
  for (let i = 0; i < maxPasses; i += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch (_) {
      break;
    }
  }
  return decoded;
}

function decodeBase64Url(value) {
  try {
    const encoded = String(value || '').replace(/^a1/i, '').replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (encoded.length % 4)) % 4);
    return Buffer.from(encoded + padding, 'base64').toString('utf8');
  } catch (_) {
    return '';
  }
}

function unwrapSearchRedirect(candidate) {
  const decoded = decodeRepeated(candidate);
  try {
    const url = new URL(decoded);
    if (/^(?:www\.)?bing\.com$/i.test(url.hostname)) {
      const wrapped = url.searchParams.get('u');
      if (wrapped) return decodeRepeated(decodeBase64Url(wrapped));
    }
    if (/duckduckgo\.com$/i.test(url.hostname)) {
      const wrapped = url.searchParams.get('uddg');
      if (wrapped) return decodeRepeated(wrapped);
    }
  } catch (_) {
    // The caller will reject malformed or non-URL candidates.
  }
  return decoded;
}

function canonicalOfficialProductUrl(candidate, expectedCode) {
  const unwrapped = unwrapSearchRedirect(candidate).replace(/["'<>\s]+.*$/s, '');
  try {
    const url = new URL(unwrapped);
    if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== OFFICIAL_HOST) return null;
    const match = url.pathname.match(PRODUCT_PATH);
    if (!match || normalizeCode(match[1]) !== normalizeCode(expectedCode)) return null;
    url.search = '';
    url.hash = '';
    return `${url.origin}${url.pathname.replace(/\/$/, '')}`;
  } catch (_) {
    return null;
  }
}

function rawUrlCandidates(payload) {
  const variants = new Set([String(payload || '')]);
  for (const value of [...variants]) {
    variants.add(decodeHtml(value));
    variants.add(decodeRepeated(value));
  }

  const candidates = [];
  const patterns = [
    /https?:\\?\/\\?\/[^\s"'<>]+/gi,
    /https?%3A%2F%2F[^\s"'<>]+/gi,
  ];
  for (const value of variants) {
    for (const pattern of patterns) {
      for (const match of value.matchAll(pattern)) candidates.push(match[0]);
    }
  }
  return candidates;
}

function extractOfficialProductUrls(payload, expectedCode) {
  const urls = new Set();
  for (const candidate of rawUrlCandidates(payload)) {
    const canonical = canonicalOfficialProductUrl(candidate, expectedCode);
    if (canonical) urls.add(canonical);
  }
  return [...urls];
}

function discoveryUrls(code) {
  const query = encodeURIComponent(`site:${OFFICIAL_HOST}/store/ "${String(code).trim()}" product`);
  return [
    `https://www.bing.com/search?format=rss&q=${query}`,
    `https://www.bing.com/search?q=${query}`,
    `https://html.duckduckgo.com/html/?q=${query}`,
    `https://lite.duckduckgo.com/lite/?q=${query}`,
  ];
}

module.exports = {
  OFFICIAL_HOST,
  canonicalOfficialProductUrl,
  discoveryUrls,
  extractOfficialProductUrls,
  normalizeCode,
  unwrapSearchRedirect,
};
