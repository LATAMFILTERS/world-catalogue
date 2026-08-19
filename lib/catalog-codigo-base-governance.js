'use strict';

const {
  POLICY_VERSION,
  normalizeManufacturer,
  normalizeCode,
  refsFrom,
  governanceFrom,
  lastFourNumeric,
  skuLastFourNumeric,
} = require('./catalog-codigo-base-policy');

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

function arrayLength(value) {
  return Array.isArray(value) ? value.length : 0;
}

function approvedPrimaryVerified(existing, base, manufacturers) {
  const wanted = new Set(manufacturers.map(normalizeManufacturer));
  return Boolean(
    existing.primary_manufacturer_verified === true &&
    wanted.has(normalizeManufacturer(existing.approved_manufacturer)) &&
    normalizeCode(existing.approved_codigo_base) &&
    normalizeCode(existing.approved_codigo_base) === normalizeCode(base)
  );
}

function deriveCodigoBaseGovernance(row = {}) {
  const duty = String(row.duty || '').toUpperCase();
  const refs = [...refsFrom(row.competitor_codes), ...refsFrom(row.oem_codes)];
  const existing = governanceFrom(row);
  const donaldson = uniqueCodes(refs, ['DONALDSON']);
  const mann = uniqueCodes(refs, ['MANN', 'MANN FILTER', 'MANN-FILTER', 'MANNFILTER', 'MANN HUMMEL']);
  const compCount = arrayLength(row.competitor_codes);
  const oemCount = arrayLength(row.oem_codes);
  const contaminationFlags = [];
  if (compCount > 100) contaminationFlags.push('COMPETITOR_CODES_HIGH_CARDINALITY');
  if (oemCount > 100) contaminationFlags.push('OEM_CODES_HIGH_CARDINALITY');

  const common = {
    policy_version: POLICY_VERSION,
    current_codigo_base: row.codigo_base || null,
    alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY',
    competitor_code_count: compCount,
    oem_code_count: oemCount,
    contamination_flags: contaminationFlags,
  };

  if (duty === 'HEAVY_DUTY') {
    if (approvedPrimaryVerified(existing, row.codigo_base, ['DONALDSON'])) {
      return {
        ...common,
        required_authority: 'VERIFIED_DONALDSON',
        state: 'CANONICAL_VERIFIED',
        observed_primary_candidates: donaldson,
      };
    }
    if (baseMatchesAny(row.codigo_base, donaldson)) {
      return {
        ...common,
        required_authority: 'VERIFY_DONALDSON_MANUFACTURING_AUTHORITY',
        state: 'CANONICAL_EVIDENCED_NOT_VERIFIED',
        observed_primary_candidates: donaldson,
      };
    }
    if (donaldson.length) {
      return {
        ...common,
        required_authority: 'VERIFY_DONALDSON_MANUFACTURING_AUTHORITY',
        state: 'REVIEW_PRIMARY_CANDIDATE',
        observed_primary_candidates: donaldson,
      };
    }
    if (existing.donaldson_absence_verified !== true) {
      return {
        ...common,
        required_authority: 'VERIFY_DONALDSON_MANUFACTURING_ABSENCE',
        state: 'VERIFY_PRIMARY_ABSENCE',
        observed_primary_candidates: [],
      };
    }

    const approved = normalizeCode(existing.approved_codigo_base);
    const base = normalizeCode(row.codigo_base);
    const source = String(existing.approved_source_column || '').toUpperCase();
    const manufacturerReady = existing.fallback_manufacturer_verified === true;
    const commercialReady = existing.fallback_commercial_code_verified === true;
    const approvedReady = Boolean(approved && approved === base && ['OEM_CODES', 'COMPETITOR_CODES'].includes(source));

    if (!(manufacturerReady && commercialReady && approvedReady)) {
      return {
        ...common,
        required_authority: 'VERIFIED_OEM_OR_AFTERMARKET_MANUFACTURER',
        state: 'SELECT_VERIFIED_FALLBACK',
        observed_primary_candidates: [],
      };
    }

    const expected = lastFourNumeric(existing.approved_codigo_base);
    if (!expected || skuLastFourNumeric(row.sku) !== expected) {
      return {
        ...common,
        required_authority: source === 'OEM_CODES' ? 'VERIFIED_OEM_FALLBACK' : 'VERIFIED_AFTERMARKET_FALLBACK',
        state: 'SKU_SUFFIX_REVIEW',
        expected_sku_suffix: expected,
        observed_primary_candidates: [],
      };
    }

    return {
      ...common,
      required_authority: source === 'OEM_CODES' ? 'VERIFIED_OEM_FALLBACK' : 'VERIFIED_AFTERMARKET_FALLBACK',
      state: 'CANONICAL_VERIFIED',
      approved_source_column: source,
      observed_primary_candidates: [],
    };
  }

  if (duty === 'LIGHT_DUTY') {
    if (approvedPrimaryVerified(existing, row.codigo_base, ['MANN', 'MANN FILTER', 'MANN-FILTER', 'MANNFILTER', 'MANN HUMMEL'])) {
      return {
        ...common,
        required_authority: 'VERIFIED_MANN_FILTER',
        state: 'CANONICAL_VERIFIED',
        observed_primary_candidates: mann,
      };
    }
    if (baseMatchesAny(row.codigo_base, mann)) {
      return {
        ...common,
        required_authority: 'VERIFY_MANN_MANUFACTURING_AUTHORITY',
        state: 'CANONICAL_EVIDENCED_NOT_VERIFIED',
        observed_primary_candidates: mann,
      };
    }
    if (mann.length) {
      return {
        ...common,
        required_authority: 'VERIFY_MANN_MANUFACTURING_AUTHORITY',
        state: 'REVIEW_PRIMARY_CANDIDATE',
        observed_primary_candidates: mann,
      };
    }
    if (existing.mann_absence_verified !== true) {
      return {
        ...common,
        required_authority: 'VERIFY_MANN_MANUFACTURING_ABSENCE',
        state: 'VERIFY_PRIMARY_ABSENCE',
        observed_primary_candidates: [],
      };
    }

    const approved = normalizeCode(existing.approved_codigo_base);
    const base = normalizeCode(row.codigo_base);
    const source = String(existing.approved_source_column || '').toUpperCase();
    if (!(existing.fallback_manufacturer_verified === true && existing.fallback_commercial_code_verified === true && approved && approved === base && source === 'OEM_CODES')) {
      return {
        ...common,
        required_authority: 'VERIFIED_OEM_FALLBACK',
        state: 'SELECT_VERIFIED_FALLBACK',
        observed_primary_candidates: [],
      };
    }

    return {
      ...common,
      required_authority: 'VERIFIED_OEM_FALLBACK',
      state: 'CANONICAL_VERIFIED',
      approved_source_column: 'OEM_CODES',
      observed_primary_candidates: [],
    };
  }

  return {
    ...common,
    required_authority: 'UNSUPPORTED_DUTY',
    state: 'REVIEW_UNSUPPORTED_DUTY',
    observed_primary_candidates: [],
  };
}

module.exports = {
  POLICY_VERSION,
  uniqueCodes,
  baseMatchesAny,
  approvedPrimaryVerified,
  deriveCodigoBaseGovernance,
};
