'use strict';
/**
 * Fase 2 (typographic-variant search fallback) — design only, behind a
 * feature flag that defaults OFF. Not wired into server-original.js's
 * live request path by this change; importing this module has zero
 * runtime effect unless a caller explicitly enables the flag AND calls
 * resolveWithFallback().
 *
 * Rules (from the audit brief, unchanged):
 *   - normalized_code is a SEARCH aid, never a merge/identity key.
 *   - Tier 1 = today's exact-match behavior, untouched.
 *   - Tier 2 = normalized fallback, ONLY tried when Tier 1 finds nothing.
 *   - If Tier 2 finds more than one distinct SKU, return
 *     AMBIGUOUS_CANDIDATES — never auto-pick one.
 *   - Normalization: uppercase, strip '-', ' ', '/'. Nothing else. The
 *     original (display_code) is always preserved and returned alongside
 *     the normalized form, never replaced by it.
 *   - Manufacturer aliasing is a SEPARATE, explicit table — never derived
 *     from code similarity.
 */

const FEATURE_FLAG_ENV = 'ENABLE_NORMALIZED_CODE_FALLBACK';

function isFallbackEnabled() {
  return process.env[FEATURE_FLAG_ENV] === 'true';
}

function normalizeCode(rawCode) {
  if (typeof rawCode !== 'string') return '';
  return rawCode.toUpperCase().replace(/[-\s/]/g, '');
}

/**
 * @param {string} rawCode - the user-entered code, unnormalized.
 * @param {(code: string) => Promise<Array<{sku: string}>>} exactLookup - Tier 1, existing behavior.
 * @param {(normalized: string) => Promise<Array<{sku: string, display_code: string}>>} normalizedLookup - Tier 2, queries by normalized_code.
 * @returns {Promise<{status: 'RESOLVED_EXACT'|'RESOLVED_FALLBACK'|'AMBIGUOUS_CANDIDATES'|'NOT_FOUND', sku?: string, candidates?: Array}>}
 */
async function resolveWithFallback(rawCode, exactLookup, normalizedLookup) {
  const exact = await exactLookup(rawCode);
  if (exact.length === 1) return { status: 'RESOLVED_EXACT', sku: exact[0].sku };
  if (exact.length > 1) return { status: 'AMBIGUOUS_CANDIDATES', candidates: exact };
  // exact.length === 0 falls through to Tier 2 below.

  if (!isFallbackEnabled()) return { status: 'NOT_FOUND' };

  const normalized = normalizeCode(rawCode);
  if (!normalized) return { status: 'NOT_FOUND' };

  const fallbackMatches = await normalizedLookup(normalized);
  const distinctSkus = [...new Set(fallbackMatches.map((m) => m.sku))];

  if (distinctSkus.length === 0) return { status: 'NOT_FOUND' };
  if (distinctSkus.length === 1) {
    return { status: 'RESOLVED_FALLBACK', sku: distinctSkus[0], matched_display_code: fallbackMatches[0].display_code };
  }
  return { status: 'AMBIGUOUS_CANDIDATES', candidates: fallbackMatches };
}

module.exports = { normalizeCode, resolveWithFallback, isFallbackEnabled, FEATURE_FLAG_ENV };
