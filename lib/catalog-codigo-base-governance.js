'use strict';

const {
  normalizeManufacturer,
  normalizeCode,
  refsFrom,
} = require('./catalog-codigo-base-policy');

const POLICY_VERSION = '2026-08-18-v1';

function uniqueCodes(refs, manufacturers) {
  const wanted = new Set(manufacturers.map(normalizeManufacturer));
  const seen = new Set();
  const out = [];
  for (const ref of refs) {
    if (!wanted.has(ref.manufacturer)) continue;
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

function deriveCodigoBaseGovernance(row = {}) {
  const duty = String(row.duty || '').toUpperCase();
  const refs = [...refsFrom(row.competitor_codes), ...refsFrom(row.oem_codes)];
  const donaldson = uniqueCodes(refs, ['DONALDSON']);
  const fleetguard = uniqueCodes(refs, ['FLEETGUARD', 'CUMMINS FILTRATION']);
  const mann = uniqueCodes(refs, ['MANN', 'MANN FILTER', 'MANN-FILTER', 'MANNFILTER', 'MANN HUMMEL']);

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
        observed_fallback_candidates: fleetguard,
      };
    }
    if (donaldson.length) {
      return {
        ...common,
        required_authority: 'DONALDSON',
        state: 'REVIEW_DONALDSON_CANDIDATE',
        observed_preferred_candidates: donaldson,
        observed_fallback_candidates: fleetguard,
      };
    }
    if (fleetguard.length) {
      return {
        ...common,
        required_authority: 'DONALDSON_THEN_FLEETGUARD',
        state: 'REVIEW_DONALDSON_ABSENCE',
        observed_preferred_candidates: [],
        observed_fallback_candidates: fleetguard,
      };
    }
    return {
      ...common,
      required_authority: 'DONALDSON_THEN_FLEETGUARD_THEN_OEM',
      state: 'REVIEW_DONALDSON_AND_FLEETGUARD_ABSENCE',
      observed_preferred_candidates: [],
      observed_fallback_candidates: [],
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
      };
    }
    if (mann.length) {
      return {
        ...common,
        required_authority: 'MANN_FILTER',
        state: 'REVIEW_MANN_CANDIDATE',
        observed_preferred_candidates: mann,
        observed_fallback_candidates: [],
      };
    }
    return {
      ...common,
      required_authority: 'MANN_FILTER_THEN_OEM',
      state: 'REVIEW_MANN_ABSENCE',
      observed_preferred_candidates: [],
      observed_fallback_candidates: [],
    };
  }

  return {
    ...common,
    required_authority: 'UNSUPPORTED_DUTY',
    state: 'REVIEW_UNSUPPORTED_DUTY',
    observed_preferred_candidates: [],
    observed_fallback_candidates: [],
  };
}

module.exports = {
  POLICY_VERSION,
  uniqueCodes,
  baseMatchesAny,
  deriveCodigoBaseGovernance,
};
