// HERMES — endpoint diagnostic core.
// Answers "why is this endpoint EMPTY_CONTENT/INSUFFICIENT_CONTENT?" with a
// single safe, minimal record per URL. Deliberately narrow: final URL,
// HTTP status, content-type, raw/normalized lengths, redirect count, and a
// classification — never cookies, never full response headers, never the
// full response body. Read-only; makes no writes anywhere.
import { normalizeHtmlToText, sha256Hex, USER_AGENT, DEFAULT_TIMEOUT_MS, DEFAULT_MAX_BYTES } from './collect-real-sources-core.mjs';
import { classifyContentSufficiency, DEFAULT_MIN_CONTENT_LENGTH } from './source-baseline-core.mjs';

export const MAX_REDIRECTS = 10;

/**
 * Follows redirects manually (rather than relying on fetch's automatic
 * redirect: 'follow') purely so the hop count is observable — the only
 * reason a caller needs to know "how many redirects" rather than just the
 * final destination.
 */
async function fetchWithRedirectTrace({ url, timeoutMs, userAgent, fetchImpl, maxRedirects = MAX_REDIRECTS }) {
  const impl = fetchImpl || globalThis.fetch;
  let currentUrl = url;
  let redirectCount = 0;
  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await impl(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: { 'User-Agent': userAgent, Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.5' }
      });
    } finally {
      clearTimeout(timer);
    }
    const location = typeof response.headers?.get === 'function' ? response.headers.get('location') : null;
    if (response.status >= 300 && response.status < 400 && location) {
      redirectCount += 1;
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }
    return { finalUrl: currentUrl, redirectCount, response };
  }
  throw new Error(`too many redirects (> ${maxRedirects})`);
}

/**
 * Diagnoses a single URL. Never throws for ordinary failure modes (network
 * error, timeout, non-2xx) — those come back as result: 'FAILED' with a
 * short reason, same non-fatal philosophy as the collector itself.
 */
export async function diagnoseEndpoint({
  url,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  maxBytes = DEFAULT_MAX_BYTES,
  userAgent = USER_AGENT,
  minContentLength = DEFAULT_MIN_CONTENT_LENGTH,
  fetchImpl,
  maxRedirects = MAX_REDIRECTS
}) {
  const requestedAt = new Date().toISOString();
  try {
    const { finalUrl, redirectCount, response } = await fetchWithRedirectTrace({ url, timeoutMs, userAgent, fetchImpl, maxRedirects });
    const contentType = typeof response.headers?.get === 'function' ? response.headers.get('content-type') : null;
    if (!response.ok) {
      return {
        url, final_url: finalUrl, requested_at: requestedAt, http_status: response.status, content_type: contentType,
        redirect_count: redirectCount, raw_length: 0, normalized_length: 0, result: 'FAILED', reason: `HTTP ${response.status}`
      };
    }
    let text = '';
    if (typeof response.text === 'function') {
      text = await response.text();
      if (text.length > maxBytes) text = text.slice(0, maxBytes);
    }
    const normalized = normalizeHtmlToText(text);
    const contentHash = sha256Hex(normalized);
    const sufficiency = classifyContentSufficiency(normalized, contentHash, minContentLength);
    const result = sufficiency === 'SUFFICIENT' ? 'VALID' : sufficiency;
    return {
      url,
      final_url: finalUrl,
      requested_at: requestedAt,
      http_status: response.status,
      content_type: contentType,
      redirect_count: redirectCount,
      raw_length: text.length,
      normalized_length: normalized.length,
      result,
      reason: result === 'VALID' ? null : describeLikelyReason({ rawLength: text.length, normalizedLength: normalized.length, contentType })
    };
  } catch (error) {
    const timedOut = error?.name === 'AbortError' || error?.name === 'TimeoutError';
    return {
      url, final_url: url, requested_at: requestedAt, http_status: null, content_type: null,
      redirect_count: 0, raw_length: 0, normalized_length: 0, result: 'FAILED',
      reason: timedOut ? `timeout after ${timeoutMs}ms` : String(error?.message || error)
    };
  }
}

/**
 * Best-effort, transparent classification of WHY a page came back thin —
 * never a guess presented as fact, always visible as a "likely_cause"
 * alongside the raw numbers a human can verify independently.
 */
function describeLikelyReason({ rawLength, normalizedLength }) {
  if (rawLength === 0) return 'empty HTTP response body';
  const ratio = normalizedLength / rawLength;
  if (rawLength > 3000 && ratio < 0.02) {
    return 'likely JavaScript-rendered shell (large raw body, almost no visible text — a client-side app that needs a browser to render content HERMES does not run)';
  }
  if (rawLength < 500) return 'very small response body — likely a redirect stub or bot-protection interstitial';
  return 'short visible text relative to response size — page structure did not yield much normalized content';
}

export async function diagnoseEndpoints(urls, options = {}) {
  const results = [];
  for (const url of urls) results.push(await diagnoseEndpoint({ ...options, url }));
  return results;
}
