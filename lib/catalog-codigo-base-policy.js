'use strict';

/**
 * UNIQUE SOURCE OF TRUTH — ELIMFILTERS codigo_base authority policy.
 *
 * HEAVY_DUTY
 *   1. Donaldson
 *   2. Fleetguard only after verified evidence that Donaldson does not make it
 *   3. Commercial OEM only after verified evidence that neither Donaldson nor Fleetguard make it
 *
 * LIGHT_DUTY
 *   1. MANN-FILTER
 *   2. Commercial OEM only after verified evidence that MANN-FILTER does not make it
 *
 * Missing references in JSONB are NOT proof of manufacturer absence.
 * Fallbacks require explicit governance evidence in enrichment_data.codigo_base_governance.
 */

function normalizeManufacturer(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function normalizeCode(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function refsFrom(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => ({
    code: String(item?.code || '').trim(),
    normalizedCode: normalizeCode(item?.code),
    manufacturer: normalizeManufacturer(item?.manufacturer || item?.brand || item?.oem),
  })).filter((item) => item.code && item.manufacturer);
}

function governanceFrom(row = {}) {
  const data = row.enrichment_data && typeof row.enrichment_data === 'object' ? row.enrichment_data : {};
  const gov = data.codigo_base_governance && typeof data.codigo_base_governance === 'object'
    ? data.codigo_base_governance
    : {};
  return gov;
}

function byManufacturers(refs, manufacturers) {
  const wanted = new Set(manufacturers.map(normalizeManufacturer));
  return refs.filter((ref) => wanted.has(ref.manufacturer));
}

function codeBelongsTo(code, refs) {
  const wanted = normalizeCode(code);
  return Boolean(wanted) && refs.some((ref) => ref.normalizedCode === wanted);
}

function evaluateCodigoBase(row = {}) {
  const duty = String(row.duty || '').toUpperCase();
  const code = row.codigo_base;
  const refs = [...refsFrom(row.competitor_codes), ...refsFrom(row.oem_codes)];
  const gov = governanceFrom(row);

  if (!normalizeCode(code)) return { valid: false, reason: 'codigo_base_missing' };

  if (duty === 'HEAVY_DUTY') {
    const donaldson = byManufacturers(refs, ['DONALDSON']);
    if (donaldson.length) {
      return codeBelongsTo(code, donaldson)
        ? { valid: true, authority: 'DONALDSON' }
        : { valid: false, reason: 'donaldson_reference_must_be_codigo_base', authority: 'DONALDSON' };
    }

    const fleetguard = byManufacturers(refs, ['FLEETGUARD', 'CUMMINS FILTRATION']);
    if (fleetguard.length) {
      if (gov.donaldson_absence_verified !== true) {
        return { valid: false, reason: 'donaldson_absence_requires_verified_evidence', authority: 'FLEETGUARD' };
      }
      return codeBelongsTo(code, fleetguard)
        ? { valid: true, authority: 'FLEETGUARD' }
        : { valid: false, reason: 'fleetguard_reference_must_be_codigo_base', authority: 'FLEETGUARD' };
    }

    if (gov.donaldson_absence_verified !== true || gov.fleetguard_absence_verified !== true) {
      return { valid: false, reason: 'preferred_manufacturer_absence_requires_verified_evidence', authority: 'OEM' };
    }
    if (gov.oem_commercial_code_verified !== true) {
      return { valid: false, reason: 'oem_commercial_code_requires_verified_evidence', authority: 'OEM' };
    }
    return { valid: true, authority: 'OEM' };
  }

  if (duty === 'LIGHT_DUTY') {
    const mann = byManufacturers(refs, ['MANN', 'MANN FILTER', 'MANN-FILTER', 'MANNFILTER', 'MANN HUMMEL']);
    if (mann.length) {
      return codeBelongsTo(code, mann)
        ? { valid: true, authority: 'MANN_FILTER' }
        : { valid: false, reason: 'mann_reference_must_be_codigo_base', authority: 'MANN_FILTER' };
    }

    if (gov.mann_absence_verified !== true) {
      return { valid: false, reason: 'mann_absence_requires_verified_evidence', authority: 'OEM' };
    }
    if (gov.oem_commercial_code_verified !== true) {
      return { valid: false, reason: 'oem_commercial_code_requires_verified_evidence', authority: 'OEM' };
    }
    return { valid: true, authority: 'OEM' };
  }

  return { valid: false, reason: 'unsupported_duty' };
}

module.exports = {
  normalizeManufacturer,
  normalizeCode,
  refsFrom,
  governanceFrom,
  evaluateCodigoBase,
};
