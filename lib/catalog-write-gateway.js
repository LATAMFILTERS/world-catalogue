'use strict';

const {
  POLICY_VERSION,
  normalizeManufacturer,
  normalizeCode,
  lastFourNumeric,
  skuLastFourNumeric,
} = require('./catalog-codigo-base-policy');
const {
  APPLICATION_POLICY_VERSION,
  validateApplicationWrite,
  assertApplicationWrite,
} = require('./catalog-application-governance');

const ALLOWED_DUTIES = new Set(['HEAVY_DUTY', 'LIGHT_DUTY']);
const ALLOWED_SOURCE_COLUMNS = new Set(['OEM_CODES', 'COMPETITOR_CODES']);
const MANN_NAMES = new Set(['MANN', 'MANNFILTER', 'MANNHUMMEL']);

function governanceFrom(row = {}) {
  return row?.enrichment_data?.codigo_base_governance || {};
}

function assertAlternateArrays(row = {}) {
  if (!Array.isArray(row.oem_codes)) throw new Error('CATALOG_GATEWAY: oem_codes must be an array');
  if (!Array.isArray(row.competitor_codes)) throw new Error('CATALOG_GATEWAY: competitor_codes must be an array');
}

function itemCode(item = {}) {
  return normalizeCode(item?.code || item?.reference);
}

function validateAlternateClassification(row = {}) {
  assertAlternateArrays(row);
  const violations = [];
  const base = normalizeCode(row.codigo_base);
  for (const item of row.oem_codes) {
    const code = itemCode(item);
    const kind = String(item?.classification || item?.source_type || 'OEM').toUpperCase();
    if (base && code === base) violations.push({ column: 'oem_codes', code, reason: 'CODIGO_BASE_DUPLICATED_IN_ALTERNATES' });
    if (kind === 'AFTERMARKET' || kind === 'COMPETITOR') violations.push({ column: 'oem_codes', code: item?.code || item?.reference || null, reason: 'AFTERMARKET_IN_OEM_CODES' });
  }
  for (const item of row.competitor_codes) {
    const code = itemCode(item);
    const kind = String(item?.classification || item?.source_type || 'AFTERMARKET').toUpperCase();
    if (base && code === base) violations.push({ column: 'competitor_codes', code, reason: 'CODIGO_BASE_DUPLICATED_IN_ALTERNATES' });
    if (kind === 'OEM') violations.push({ column: 'competitor_codes', code: item?.code || item?.reference || null, reason: 'OEM_IN_COMPETITOR_CODES' });
  }
  return violations;
}

function validateCanonicalWrite(row = {}, options = {}) {
  const duty = String(row.duty || '').toUpperCase();
  const base = normalizeCode(row.codigo_base);
  const gov = governanceFrom(row);
  const approved = normalizeCode(gov.approved_codigo_base);
  const manufacturer = normalizeManufacturer(gov.approved_manufacturer);
  const source = String(gov.approved_source_column || '').toUpperCase();
  const reasons = [];

  if (!ALLOWED_DUTIES.has(duty)) reasons.push('UNSUPPORTED_DUTY');
  if (!base) reasons.push('MISSING_CODIGO_BASE');
  reasons.push(...validateAlternateClassification(row).map((v) => v.reason));

  if (duty === 'HEAVY_DUTY') {
    const primary = gov.primary_manufacturer_verified === true && manufacturer === 'DONALDSON' && approved === base;
    if (!primary) {
      if (gov.donaldson_absence_verified !== true) reasons.push('DONALDSON_ABSENCE_NOT_VERIFIED');
      if (gov.fallback_manufacturer_verified !== true) reasons.push('FALLBACK_MANUFACTURER_NOT_VERIFIED');
      if (gov.fallback_commercial_code_verified !== true) reasons.push('FALLBACK_COMMERCIAL_CODE_NOT_VERIFIED');
      if (!approved || approved !== base) reasons.push('APPROVED_BASE_MISMATCH');
      if (!ALLOWED_SOURCE_COLUMNS.has(source)) reasons.push('FALLBACK_SOURCE_NOT_CLASSIFIED');
      const expected = lastFourNumeric(gov.approved_codigo_base);
      if (!expected || skuLastFourNumeric(row.sku) !== expected) reasons.push('SKU_SUFFIX_MISMATCH');
    }
  }

  if (duty === 'LIGHT_DUTY') {
    const primary = gov.primary_manufacturer_verified === true && MANN_NAMES.has(manufacturer) && approved === base;
    if (!primary) {
      if (gov.mann_absence_verified !== true) reasons.push('MANN_ABSENCE_NOT_VERIFIED');
      if (gov.fallback_manufacturer_verified !== true) reasons.push('FALLBACK_MANUFACTURER_NOT_VERIFIED');
      if (gov.fallback_commercial_code_verified !== true) reasons.push('FALLBACK_COMMERCIAL_CODE_NOT_VERIFIED');
      if (!approved || approved !== base) reasons.push('APPROVED_BASE_MISMATCH');
      if (source !== 'OEM_CODES') reasons.push('LD_FALLBACK_MUST_BE_OEM');
    }
  }

  const applicationValidation = validateApplicationWrite(row, {
    requireEvidence: options.applicationWrite === true,
  });
  reasons.push(...applicationValidation.reasons);

  return {
    valid: reasons.length === 0,
    policy_version: POLICY_VERSION,
    application_policy_version: APPLICATION_POLICY_VERSION,
    reasons: [...new Set(reasons)],
    application_validation: applicationValidation,
    model: 'CODIGO_BASE_CANONICAL__ALTERNATES_CLASSIFIED__APPLICATIONS_EVIDENCE_GOVERNED',
  };
}

function assertCanonicalWrite(row = {}, options = {}) {
  const result = validateCanonicalWrite(row, options);
  if (!result.valid) {
    const error = new Error(`CATALOG_GATEWAY_BLOCKED: ${result.reasons.join(',')}`);
    error.code = 'CATALOG_GATEWAY_BLOCKED';
    error.validation = result;
    throw error;
  }
  return result;
}

module.exports = {
  validateCanonicalWrite,
  assertCanonicalWrite,
  validateAlternateClassification,
  validateApplicationWrite,
  assertApplicationWrite,
};
