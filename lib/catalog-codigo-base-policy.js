'use strict';

/**
 * UNIQUE SOURCE OF TRUTH — ELIMFILTERS codigo_base authority policy.
 *
 * HEAVY_DUTY
 *   1. Donaldson when verified manufacturing evidence exists.
 *   2. If Donaldson is VERIFIED not to manufacture the filter, use the verified
 *      code of the manufacturer that does make it (OEM or aftermarket).
 *   3. If that manufacturer has multiple valid codes, governance must identify
 *      the verified most-commercial code before it can become codigo_base.
 *   4. OEM alternatives belong in oem_codes; aftermarket alternatives belong in
 *      competitor_codes. The selected codigo_base remains separate.
 *   5. For fallback-manufacturer bases, the ELIMFILTERS SKU must use the final
 *      four numeric digits of the approved commercial code.
 *
 * LIGHT_DUTY
 *   1. MANN-FILTER when verified manufacturing evidence exists.
 *   2. If MANN-FILTER is VERIFIED absent, use a verified OEM commercial code.
 *
 * Missing references in JSONB are NEVER proof that a manufacturer does not
 * make a filter. Absence and commercial-code selection require explicit,
 * verified governance evidence in enrichment_data.codigo_base_governance.
 */

function normalizeManufacturer(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function normalizeCode(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function refsFrom(value, sourceColumn = null) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => ({
    code: String(item?.code || '').trim(),
    normalizedCode: normalizeCode(item?.code),
    manufacturer: normalizeManufacturer(item?.manufacturer || item?.brand || item?.oem),
    sourceColumn,
  })).filter((item) => item.code && item.manufacturer);
}

function refsFromRow(row = {}) {
  return [
    ...refsFrom(row.oem_codes, 'OEM_CODES'),
    ...refsFrom(row.competitor_codes, 'COMPETITOR_CODES'),
  ];
}

function governanceFrom(row = {}) {
  const data = row.enrichment_data && typeof row.enrichment_data === 'object' ? row.enrichment_data : {};
  return data.codigo_base_governance && typeof data.codigo_base_governance === 'object'
    ? data.codigo_base_governance
    : {};
}

function byManufacturers(refs, manufacturers) {
  const wanted = new Set(manufacturers.map(normalizeManufacturer));
  return refs.filter((ref) => wanted.has(ref.manufacturer));
}

function codeBelongsTo(code, refs) {
  const wanted = normalizeCode(code);
  return Boolean(wanted) && refs.some((ref) => ref.normalizedCode === wanted);
}

function lastFourNumericDigits(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 4 ? digits.slice(-4) : null;
}

function skuUsesCommercialSuffix(sku, code) {
  const suffix = lastFourNumericDigits(code);
  if (!suffix) return false;
  const skuDigits = String(sku || '').replace(/\D/g, '');
  return skuDigits.endsWith(suffix);
}

function verifiedFallback(row, refs, gov, preferredAbsenceField) {
  if (gov[preferredAbsenceField] !== true) {
    return { valid: false, reason: `${preferredAbsenceField}_requires_verified_evidence` };
  }
  if (gov.fallback_manufacturer_verified !== true) {
    return { valid: false, reason: 'fallback_manufacturer_requires_verified_evidence' };
  }
  if (gov.fallback_commercial_code_verified !== true) {
    return { valid: false, reason: 'fallback_commercial_code_requires_verified_evidence' };
  }

  const approvedCode = String(gov.approved_codigo_base || '').trim();
  const approvedSource = String(gov.approved_source_column || '').trim().toUpperCase();
  const approvedManufacturer = normalizeManufacturer(gov.approved_manufacturer || '');
  const current = normalizeCode(row.codigo_base);

  if (!approvedCode || normalizeCode(approvedCode) !== current) {
    return { valid: false, reason: 'codigo_base_must_match_approved_commercial_code' };
  }
  if (!['OEM_CODES', 'COMPETITOR_CODES'].includes(approvedSource)) {
    return { valid: false, reason: 'approved_source_column_required' };
  }

  const sourceRefs = refs.filter((ref) => ref.sourceColumn === approvedSource);
  const approvedRefs = sourceRefs.filter((ref) => ref.normalizedCode === current);
  if (!approvedRefs.length) {
    return { valid: false, reason: 'approved_codigo_base_must_exist_in_declared_source_column' };
  }
  if (approvedManufacturer && !approvedRefs.some((ref) => ref.manufacturer === approvedManufacturer)) {
    return { valid: false, reason: 'approved_manufacturer_must_match_declared_reference' };
  }

  const suffix = lastFourNumericDigits(approvedCode);
  if (!suffix) {
    return { valid: false, reason: 'approved_commercial_code_requires_four_numeric_digits' };
  }
  if (!skuUsesCommercialSuffix(row.sku, approvedCode)) {
    return { valid: false, reason: 'sku_must_use_last_four_numeric_digits_of_commercial_code', expectedSkuSuffix: suffix };
  }

  return {
    valid: true,
    authority: approvedSource === 'OEM_CODES' ? 'VERIFIED_OEM_MANUFACTURER' : 'VERIFIED_AFTERMARKET_MANUFACTURER',
    approvedSourceColumn: approvedSource,
    approvedManufacturer: approvedManufacturer || approvedRefs[0].manufacturer,
    expectedSkuSuffix: suffix,
  };
}

function evaluateCodigoBase(row = {}) {
  const duty = String(row.duty || '').toUpperCase();
  const code = row.codigo_base;
  const refs = refsFromRow(row);
  const gov = governanceFrom(row);

  if (!normalizeCode(code)) return { valid: false, reason: 'codigo_base_missing' };

  if (duty === 'HEAVY_DUTY') {
    const donaldson = byManufacturers(refs, ['DONALDSON']);
    if (donaldson.length) {
      return codeBelongsTo(code, donaldson)
        ? { valid: true, authority: 'DONALDSON' }
        : { valid: false, reason: 'donaldson_reference_must_be_codigo_base', authority: 'DONALDSON' };
    }

    return verifiedFallback(row, refs, gov, 'donaldson_absence_verified');
  }

  if (duty === 'LIGHT_DUTY') {
    const mann = byManufacturers(refs, ['MANN', 'MANN FILTER', 'MANN-FILTER', 'MANNFILTER', 'MANN HUMMEL']);
    if (mann.length) {
      return codeBelongsTo(code, mann)
        ? { valid: true, authority: 'MANN_FILTER' }
        : { valid: false, reason: 'mann_reference_must_be_codigo_base', authority: 'MANN_FILTER' };
    }

    const fallback = verifiedFallback(row, refs, gov, 'mann_absence_verified');
    if (!fallback.valid) return fallback;
    if (fallback.approvedSourceColumn !== 'OEM_CODES') {
      return { valid: false, reason: 'light_duty_fallback_must_be_verified_oem' };
    }
    return { ...fallback, authority: 'VERIFIED_OEM_MANUFACTURER' };
  }

  return { valid: false, reason: 'unsupported_duty' };
}

module.exports = {
  normalizeManufacturer,
  normalizeCode,
  refsFrom,
  refsFromRow,
  governanceFrom,
  byManufacturers,
  codeBelongsTo,
  lastFourNumericDigits,
  skuUsesCommercialSuffix,
  verifiedFallback,
  evaluateCodigoBase,
};
