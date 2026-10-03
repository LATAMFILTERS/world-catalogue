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
 *   3. Only if both Donaldson and Fleetguard are verified absent, use a verified OEM code.
 *   4. No other aftermarket brand may become codigo_base in Heavy Duty.
 *   5. ET9 is the sole exception: codigo_base authority is Racor/Parker only.
 *   6. For verified HD fallback, the ELIMFILTERS SKU suffix uses the last 4 numeric
 *      digits of approved_codigo_base.
 *
 * LIGHT_DUTY
 *   1. Verified MANN-FILTER manufacturing reference when MANN-FILTER makes it.
 *   2. If verified that MANN-FILTER does NOT manufacture it, use a verified OEM
 *      commercial reference as codigo_base.
 *   3. If a verified MANN reference is real but every 4-digit SKU window collides
 *      with other verified products, a verified OEM commercial reference may become
 *      codigo_base while MANN remains canonical_source_brand/code.
 *
 * Missing references in JSONB are NEVER proof that a manufacturer does not make a filter.
 * A cross-reference observation is evidence to review, not proof of manufacturing authority.
 */

const POLICY_VERSION = '2026-10-03-v4.1';
const HD_SECONDARY_NAMES = new Set(['FLEETGUARD', 'NELSONFLEETGUARD']);
const ET9_BASE_NAMES = new Set(['RACOR', 'PARKER', 'PARKERRACOR', 'RACORPARKER']);
const MANN_PRIMARY_NAMES = new Set(['MANN', 'MANNFILTER', 'MANNHUMMEL']);

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


  return Boolean(
    gov.mann_code_collision_verified === true &&
    gov.oem_base_verified === true &&
    gov.primary_manufacturer_verified === true &&
    MANN_PRIMARY_NAMES.has(canonicalBrand) &&
    canonicalCode && collisionCanonical && canonicalCode === collisionCanonical &&
    approved && approved === base && approvedSource === 'OEM_CODES' &&
    approvedManufacturer &&

    lastFourNumeric(base) && skuLastFourNumeric(row.sku) === lastFourNumeric(base)
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
    const sku = String(row.sku || '').trim().toUpperCase();
    const approvedManufacturer = normalizeManufacturer(gov.approved_manufacturer);
    const approvedSource = String(gov.approved_source_column || '').toUpperCase();

    if (sku.startsWith('ET9')) {
      if (gov.primary_manufacturer_verified === true
        && ET9_BASE_NAMES.has(approvedManufacturer)
        && normalizeCode(gov.approved_codigo_base) === base) {
        return { valid: true, authority: 'VERIFIED_RACOR_PARKER_ET9', policy_version: POLICY_VERSION };
      }
      return { valid: false, reason: 'et9_base_must_be_racor_parker', authority: 'RACOR_PARKER_REQUIRED', policy_version: POLICY_VERSION };
    }

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
    if (!approvedFallbackReady(row, 'donaldson_absence_verified')) {
      return { valid: false, reason: 'verified_fallback_manufacturer_and_commercial_code_required', authority: 'VERIFIED_FALLBACK', policy_version: POLICY_VERSION };
    }

    if (HD_SECONDARY_NAMES.has(approvedManufacturer)) {
      if (approvedSource !== 'COMPETITOR_CODES') {
        return { valid: false, reason: 'fleetguard_base_must_use_competitor_codes', authority: 'FLEETGUARD_REVIEW', policy_version: POLICY_VERSION };
      }
    } else {
      if (gov.fleetguard_absence_verified !== true) {
        return { valid: false, reason: 'fleetguard_manufacturing_absence_requires_verified_evidence', authority: 'VERIFY_FLEETGUARD_ABSENCE', policy_version: POLICY_VERSION };
      }
      if (approvedSource !== 'OEM_CODES') {
        return { valid: false, reason: 'heavy_duty_final_fallback_must_be_oem', authority: 'VERIFIED_OEM_FALLBACK', policy_version: POLICY_VERSION };
      }
    }

    const expected = lastFourNumeric(gov.approved_codigo_base);
    if (!expected || skuLastFourNumeric(row.sku) !== expected) {
      return { valid: false, reason: 'sku_suffix_must_match_last_four_numeric_digits_of_approved_commercial_code', authority: 'VERIFIED_FALLBACK', expected_suffix: expected, policy_version: POLICY_VERSION };
    }
    return { valid: true, authority: HD_SECONDARY_NAMES.has(approvedManufacturer) ? 'VERIFIED_FLEETGUARD_FALLBACK' : 'VERIFIED_OEM_FALLBACK', policy_version: POLICY_VERSION };
  }

  if (duty === 'LIGHT_DUTY') {
    if (approvedLdOemCollisionReady(row)) {
      return { valid: true, authority: 'VERIFIED_OEM_COLLISION_BASE', policy_version: POLICY_VERSION };
    }
    if (approvedPrimaryReady(row, ['MANN', 'MANN FILTER', 'MANN-FILTER', 'MANNFILTER', 'MANN HUMMEL'])) {
      return { valid: true, authority: 'VERIFIED_MANN_FILTER', policy_version: POLICY_VERSION };
    }
    const mann = byManufacturers(refs, ['MANN', 'MANN FILTER', 'MANN-FILTER', 'MANNFILTER', 'MANN HUMMEL']);
    if (mann.length) {
      return { valid: false, reason: 'mann_reference_requires_primary_manufacturer_verification', authority: 'MANN_FILTER_REVIEW', policy_version: POLICY_VERSION };
    }
    if (gov.mann_absence_verified !== true) {
      return { valid: false, reason: 'mann_manufacturing_absence_requires_verified_evidence', authority: 'VERIFY_MANN_ABSENCE', policy_version: POLICY_VERSION };
    }
    if (!approvedFallbackReady(row, 'mann_absence_verified') || String(gov.approved_source_column || '').toUpperCase() !== 'OEM_CODES') {
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
