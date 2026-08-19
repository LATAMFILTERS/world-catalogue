'use strict';

const {
  normalizeManufacturer,
  normalizeCode,
  refsFromRow,
} = require('./catalog-codigo-base-policy');

const POLICY_VERSION = '2026-08-19-v2';

function uniqueCodes(refs, manufacturers = null) {
  const wanted = manufacturers ? new Set(manufacturers.map(normalizeManufacturer)) : null;
  const seen = new Set();
  const out = [];
  for (const ref of refs) {
    if (wanted && !wanted.has(ref.manufacturer)) continue;
    const normalized = normalizeCode(ref.code);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(ref.code);
  }
  return out;
}

function baseMatchesAny(base, codes) {
  const current = normalizeCode(base);
  return Boolean(current) && codes.some((code) => normalizeCode(code) === current);
}

function fallbackObservations(refs) {
  const seen = new Set();
  const out = [];
  for (const ref of refs) {
    if (ref.manufacturer === 'DONALDSON') continue;
    const key = `${ref.sourceColumn}:${ref.manufacturer}:${ref.normalizedCode}`;
    if (!ref.normalizedCode || seen.has(key)) continue;
    seen.add(key);
    out.push({
      code: ref.code,
      manufacturer: ref.manufacturer,
      source_column: ref.sourceColumn,
    });
  }
  return out;
}

function deriveCodigoBaseGovernance(row = {}) {
  const duty = String(row.duty || '').toUpperCase();
  const refs = refsFromRow(row);
  const donaldson = uniqueCodes(refs, ['DONALDSON']);
  const mann = uniqueCodes(refs, ['MANN', 'MANN FILTER', 'MANN-FILTER', 'MANNFILTER', 'MANN HUMMEL']);
  const fallbacks = fallbackObservations(refs);

  const common = {
    policy_version: POLICY_VERSION,
    current_codigo_base: row.codigo_base || null,
  };

  if (duty === 'HEAVY_DUTY') {
    if (baseMatchesAny(row.codigo_base, donaldson)) {
      return {
        ...common,
        required_authority: 'DONALDSON',
        state: 'CANONICAL_EVIDENCED',
        observed_preferred_candidates: donaldson,
        observed_fallback_candidates: fallbacks.map((x) => x.code),
        observed_fallback_sources: fallbacks,
      };
    }
    if (donaldson.length) {
      return {
        ...common,
        required_authority: 'DONALDSON',
        state: 'REVIEW_DONALDSON_CANDIDATE',
        observed_preferred_candidates: donaldson,
        observed_fallback_candidates: fallbacks.map((x) => x.code),
        observed_fallback_sources: fallbacks,
      };
    }
    return {
      ...common,
      required_authority: 'DONALDSON_THEN_VERIFIED_MANUFACTURER',
      state: 'REVIEW_DONALDSON_ABSENCE_AND_FALLBACK_SELECTION',
      observed_preferred_candidates: [],
      observed_fallback_candidates: fallbacks.map((x) => x.code),
      observed_fallback_sources: fallbacks,
    };
  }

  if (duty === 'LIGHT_DUTY') {
    if (baseMatchesAny(row.codigo_base, mann)) {
      return {
        ...common,
        required_authority: 'MANN_FILTER',
        state: 'CANONICAL_EVIDENCED',
        observed_preferred_candidates: mann,
        observed_fallback_candidates: [],
        observed_fallback_sources: [],
      };
    }
    if (mann.length) {
      return {
        ...common,
        required_authority: 'MANN_FILTER',
        state: 'REVIEW_MANN_CANDIDATE',
        observed_preferred_candidates: mann,
        observed_fallback_candidates: [],
        observed_fallback_sources: [],
      };
    }
    const oemFallbacks = fallbacks.filter((x) => x.source_column === 'OEM_CODES');
    return {
      ...common,
      required_authority: 'MANN_FILTER_THEN_VERIFIED_OEM',
      state: 'REVIEW_MANN_ABSENCE_AND_OEM_SELECTION',
      observed_preferred_candidates: [],
      observed_fallback_candidates: oemFallbacks.map((x) => x.code),
      observed_fallback_sources: oemFallbacks,
    };
  }

  return {
    ...common,
    required_authority: 'UNSUPPORTED_DUTY',
    state: 'REVIEW_UNSUPPORTED_DUTY',
    observed_preferred_candidates: [],
    observed_fallback_candidates: [],
    observed_fallback_sources: [],
  };
}

module.exports = {
  POLICY_VERSION,
  uniqueCodes,
  baseMatchesAny,
  fallbackObservations,
  deriveCodigoBaseGovernance,
};
