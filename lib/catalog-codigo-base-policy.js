'use strict';

/**
 * UNIQUE SOURCE OF TRUTH — ELIMFILTERS codigo_base authority policy.
 *
 * codigo_base is the canonical/main commercial reference for the ELIMFILTERS SKU.
 * oem_codes contains VERIFIED OEM alternate references only.
 * competitor_codes contains VERIFIED aftermarket alternate references only.
 * The canonical codigo_base does not need to be duplicated in either alternate column.
 * Alternate references may locate a SKU, but never create new SKU-to-SKU equivalence by themselves.
 *
 * HEAVY_DUTY
 *   1. Verified Donaldson manufacturing reference when Donaldson makes the filter.
 *   2. If verified that Donaldson does NOT manufacture it, use verified Fleetguard.
 *   3. If verified that Fleetguard also does NOT manufacture it, use a verified OEM code.
 *   4. Generic aftermarket brands are never eligible as HEAVY_DUTY codigo_base.
 *   5. For verified HD fallback, the ELIMFILTERS SKU suffix uses the last 4 numeric
 *      digits of approved_codigo_base.
 *
 * LIGHT_DUTY
 *   1. EUROPEAN origin: verified MANN-FILTER manufacturing reference.
 *   2. NON_EUROPEAN origin: verified FRAM manufacturing reference.
 *   3. If the regional primary manufacturer does NOT manufacture it, and that
 *      absence is verified, use a verified OEM commercial reference as codigo_base.
 *   4. Generic aftermarket brands are never eligible as LIGHT_DUTY fallback codigo_base.
 *   5. When a verified MANN identity cannot use either 4-digit SKU window because both are
 *      occupied by verified products, a verified OEM reference may be codigo_base while
 *      MANN remains canonical_source_brand/code.
 *
 * Missing references in JSONB are NEVER proof that a manufacturer does not make a filter.
 * A cross-reference observation is evidence to review, not proof of manufacturing authority.
 */

const POLICY_VERSION = '2026-10-03-v4.1';

function normalizeManufacturer(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function normalizeCode(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function codeFromItem(item) {
  if (typeof item === 'string') {
    const pipe = item.split('|');
    return String(pipe.length > 1 ? pipe[pipe.length - 1] : item).trim();
  }
  return String(item?.code || item?.reference || item?.part_number || item?.partNumber || item?.partno || item?.oem_code || item?.oemCode || item?.cross_reference || item?.crossReference || '').trim();
}

function manufacturerFromItem(item) {
  if (typeof item === 'string') {
    const pipe = item.split('|');
    return pipe.length > 1 ? normalizeManufacturer(pipe[0]) : '';
  }
  return normalizeManufacturer(item?.manufacturer || item?.brand || item?.oem);
}

function refsFrom(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const code = codeFromItem(item);
    return {
      code,
      normalizedCode: normalizeCode(code),
      manufacturer: manufacturerFromItem(item),
    };
  }).filter((item) => item.code);
}

function governanceFrom(row = {}) {
  const data = row.enrichment_data && typeof row.enrichment_data === 'object' && !Array.isArray(row.enrichment_data) ? row.enrichment_data : {};
  return data.codigo_base_governance && typeof data.codigo_base_governance === 'object' && !Array.isArray(data.codigo_base_governance)
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

function lastFourNumeric(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 4 ? digits.slice(-4) : null;
}

function skuLastFourNumeric(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 4 ? digits.slice(-4) : null;
}

function approvedFallbackReady(row = {}, primaryAbsenceKey) {
  const gov = governanceFrom(row);
  const approved = normalizeCode(gov.approved_codigo_base);
  const base = normalizeCode(row.codigo_base);
  return Boolean(
    gov[primaryAbsenceKey] === true &&
    gov.fallback_manufacturer_verified === true &&
    gov.fallback_commercial_code_verified === true &&
    approved && approved === base &&
    ['OEM_CODES', 'COMPETITOR_CODES'].includes(String(gov.approved_source_column || '').toUpperCase())
  );
}

function approvedLdOemCollisionReady(row = {}) {
  const gov = governanceFrom(row);
  const base = normalizeCode(row.codigo_base);
  const approved = normalizeCode(gov.approved_codigo_base);
  const approvedManufacturer = normalizeManufacturer(gov.approved_manufacturer);
  const approvedSource = String(gov.approved_source_column || '').toUpperCase();
  const canonicalBrand = normalizeManufacturer(row.canonical_source_brand);
  const canonicalCode = normalizeCode(row.canonical_source_code);
  const collisionCanonical = normalizeCode(gov.collision_canonical_code);
  const mannNames = new Set(['MANN', 'MANNFILTER', 'MANNHUMMEL']);

  return Boolean(
    String(gov.origin_group || '').toUpperCase() === 'EUROPEAN' &&
    gov.mann_code_collision_verified === true &&
    gov.oem_base_verified === true &&
    gov.primary_manufacturer_verified === true &&
    mannNames.has(canonicalBrand) &&
    canonicalCode && collisionCanonical && canonicalCode === collisionCanonical &&
    approved && approved === base &&
    approvedSource === 'OEM_CODES' &&
    approvedManufacturer &&
    lastFourNumeric(base) &&
    skuLastFourNumeric(row.sku) === lastFourNumeric(base)
  );
}
function approvedPrimaryReady(row = {}, manufacturers = []) {
  const gov = governanceFrom(row);
  const approvedManufacturer = normalizeManufacturer(gov.approved_manufacturer);
  const wanted = new Set(manufacturers.map(normalizeManufacturer));
  return Boolean(
    gov.primary_manufacturer_verified === true &&
    wanted.has(approvedManufacturer) &&
    normalizeCode(gov.approved_codigo_base) &&
    normalizeCode(gov.approved_codigo_base) === normalizeCode(row.codigo_base)
  );
}

function evaluateCodigoBase(row = {}) {
  const duty = String(row.duty || '').toUpperCase();
  const base = normalizeCode(row.codigo_base);
  const refs = [...refsFrom(row.competitor_codes), ...refsFrom(row.oem_codes)];
  const gov = governanceFrom(row);
  if (!base) return { valid: false, reason: 'codigo_base_missing', policy_version: POLICY_VERSION };

  if (duty === 'HEAVY_DUTY') {
    if (approvedPrimaryReady(row, ['DONALDSON'])) {
      return { valid: true, authority: 'VERIFIED_DONALDSON', policy_version: POLICY_VERSION };
    }
    const donaldson = byManufacturers(refs, ['DONALDSON']);
    if (donaldson.length) {
      return { valid: false, reason: 'donaldson_reference_requires_primary_manufacturer_verification', authority: 'DONALDSON_REVIEW', policy_version: POLICY_VERSION };
    }
    if (gov.donaldson_absence_verified !== true) {
      return { valid: false, reason: 'donaldson_manufacturing_absence_requires_verified_evidence', authority: 'VERIFY_DONALDSON_ABSENCE', policy_version: POLICY_VERSION };
    }
    const fleetguard = byManufacturers(refs, ['FLEETGUARD']);
    const approvedManufacturer = normalizeManufacturer(gov.approved_manufacturer);
    const approvedSource = String(gov.approved_source_column || '').toUpperCase();
    const fallbackReady = approvedFallbackReady(row, 'donaldson_absence_verified');
    if (approvedManufacturer === 'FLEETGUARD' && fallbackReady && approvedSource === 'COMPETITOR_CODES') {
      const expected = lastFourNumeric(gov.approved_codigo_base);
      if (!expected || skuLastFourNumeric(row.sku) !== expected) return { valid: false, reason: 'sku_suffix_must_match_last_four_numeric_digits_of_approved_commercial_code', authority: 'VERIFIED_FLEETGUARD_FALLBACK', expected_suffix: expected, policy_version: POLICY_VERSION };
      return { valid: true, authority: 'VERIFIED_FLEETGUARD_FALLBACK', policy_version: POLICY_VERSION };
    }
    if (fleetguard.length && gov.fleetguard_absence_verified !== true) return { valid: false, reason: 'fleetguard_reference_requires_manufacturing_verification', authority: 'FLEETGUARD_REVIEW', policy_version: POLICY_VERSION };
    if (gov.fleetguard_absence_verified !== true) return { valid: false, reason: 'fleetguard_manufacturing_absence_requires_verified_evidence', authority: 'VERIFY_FLEETGUARD_ABSENCE', policy_version: POLICY_VERSION };
    if (!fallbackReady || approvedSource !== 'OEM_CODES') return { valid: false, reason: 'verified_oem_fallback_required_after_donaldson_and_fleetguard_absence', authority: 'VERIFIED_OEM_FALLBACK', policy_version: POLICY_VERSION };
    const expected = lastFourNumeric(gov.approved_codigo_base);
    if (!expected || skuLastFourNumeric(row.sku) !== expected) return { valid: false, reason: 'sku_suffix_must_match_last_four_numeric_digits_of_approved_commercial_code', authority: 'VERIFIED_OEM_FALLBACK', expected_suffix: expected, policy_version: POLICY_VERSION };
    return { valid: true, authority: 'VERIFIED_OEM_FALLBACK', policy_version: POLICY_VERSION };
  }

  if (duty === 'LIGHT_DUTY') {
    const originGroup = String(gov.origin_group || '').toUpperCase();
    if (!['EUROPEAN', 'NON_EUROPEAN'].includes(originGroup)) {
      return { valid: false, reason: 'ld_origin_group_required', authority: 'VERIFY_LD_ORIGIN_GROUP', policy_version: POLICY_VERSION };
    }
    const european = originGroup === 'EUROPEAN';
    const primaryNames = european
      ? ['MANN', 'MANN FILTER', 'MANN-FILTER', 'MANNFILTER', 'MANN HUMMEL']
      : ['FRAM'];
    const primaryAuthority = european ? 'VERIFIED_MANN_FILTER' : 'VERIFIED_FRAM';
    const reviewAuthority = european ? 'MANN_FILTER_REVIEW' : 'FRAM_REVIEW';
    const absenceKey = european ? 'mann_absence_verified' : 'fram_absence_verified';
    const absenceReason = european ? 'mann_manufacturing_absence_requires_verified_evidence' : 'fram_manufacturing_absence_requires_verified_evidence';
    const refsForPrimary = byManufacturers(refs, primaryNames);

    if (approvedLdOemCollisionReady(row)) {
      return { valid: true, authority: 'VERIFIED_OEM_COLLISION_BASE', policy_version: POLICY_VERSION };
    }
    if (approvedPrimaryReady(row, primaryNames)) {
      return { valid: true, authority: primaryAuthority, policy_version: POLICY_VERSION };
    }
    if (refsForPrimary.length) {
      return { valid: false, reason: 'regional_primary_reference_requires_manufacturing_verification', authority: reviewAuthority, policy_version: POLICY_VERSION };
    }
    if (gov[absenceKey] !== true) {
      return { valid: false, reason: absenceReason, authority: european ? 'VERIFY_MANN_ABSENCE' : 'VERIFY_FRAM_ABSENCE', policy_version: POLICY_VERSION };
    }
    if (!approvedFallbackReady(row, absenceKey) || String(gov.approved_source_column || '').toUpperCase() !== 'OEM_CODES') {
      return { valid: false, reason: 'verified_oem_fallback_required', authority: 'VERIFIED_OEM_FALLBACK', policy_version: POLICY_VERSION };
    }
    return { valid: true, authority: 'VERIFIED_OEM_FALLBACK', policy_version: POLICY_VERSION };
  }

  return { valid: false, reason: 'unsupported_duty', policy_version: POLICY_VERSION };
}

module.exports = {
  POLICY_VERSION,
  normalizeManufacturer,
  normalizeCode,
  codeFromItem,
  manufacturerFromItem,
  refsFrom,
  governanceFrom,
  byManufacturers,
  codeBelongsTo,
  lastFourNumeric,
  skuLastFourNumeric,
  approvedFallbackReady,
  approvedLdOemCollisionReady,
  approvedPrimaryReady,
  evaluateCodigoBase,
};
