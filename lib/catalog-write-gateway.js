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
const { classifyReference } = require('./cross-reference-classification');

const ALLOWED_DUTIES = new Set(['HEAVY_DUTY', 'LIGHT_DUTY']);
const ALLOWED_SOURCE_COLUMNS = new Set(['OEM_CODES', 'COMPETITOR_CODES']);
const MANN_NAMES = new Set(['MANN', 'MANNFILTER', 'MANNHUMMEL']);
const FRAM_NAMES = new Set(['FRAM']);
const RETIRED_LD_PREFIXES = new Set(['EA5', 'EC5', 'EF5', 'EL5']);

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
    const classified = classifyReference(item);
    const kind = classified === 'UNKNOWN' ? String(item?.classification || item?.source_type || 'OEM').toUpperCase() : classified;
    if (base && code === base) violations.push({ column: 'oem_codes', code, reason: 'CODIGO_BASE_DUPLICATED_IN_ALTERNATES' });
    if (kind === 'AFTERMARKET' || kind === 'COMPETITOR') violations.push({ column: 'oem_codes', code: item?.code || item?.reference || null, reason: 'AFTERMARKET_IN_OEM_CODES' });
  }
  for (const item of row.competitor_codes) {
    const code = itemCode(item);
    const classified = classifyReference(item);
    const kind = classified === 'UNKNOWN' ? String(item?.classification || item?.source_type || 'AFTERMARKET').toUpperCase() : classified;
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
  const skuPrefix = String(row.sku || '').toUpperCase().slice(0, 3);

  if (RETIRED_LD_PREFIXES.has(skuPrefix)) reasons.push('RETIRED_LD_PREFIX');
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
    const originGroup = String(gov.origin_group || '').toUpperCase();
    if (originGroup === 'EUROPEAN' || originGroup === 'NON_EUROPEAN') {
      const authorityOk = originGroup === 'EUROPEAN'
        ? MANN_NAMES.has(manufacturer)
        : FRAM_NAMES.has(manufacturer);
      if (gov.primary_manufacturer_verified !== true) reasons.push('LD_CANONICAL_MANUFACTURER_NOT_VERIFIED');
      if (!authorityOk) reasons.push(originGroup === 'EUROPEAN' ? 'LD_EUROPEAN_MANN_REQUIRED' : 'LD_NON_EUROPEAN_FRAM_REQUIRED');
      if (!approved || approved !== base) reasons.push('APPROVED_BASE_MISMATCH');
    } else {
      const primary = gov.primary_manufacturer_verified === true && MANN_NAMES.has(manufacturer) && approved === base;
      if (!primary) {
        if (gov.mann_absence_verified !== true) reasons.push('MANN_ABSENCE_NOT_VERIFIED');
        if (gov.fallback_manufacturer_verified !== true) reasons.push('FALLBACK_MANUFACTURER_NOT_VERIFIED');
        if (gov.fallback_commercial_code_verified !== true) reasons.push('FALLBACK_COMMERCIAL_CODE_NOT_VERIFIED');
        if (!approved || approved !== base) reasons.push('APPROVED_BASE_MISMATCH');
        if (source !== 'OEM_CODES') reasons.push('LD_FALLBACK_MUST_BE_OEM');
      }
    }
  }

  const applicationValidation = options.skipApplicationValidation === true
    ? {
        valid: true,
        skipped: true,
        policy_version: APPLICATION_POLICY_VERSION,
        reasons: [],
        model: 'APPLICATION_VALIDATION_SKIPPED_FOR_UNTOUCHED_DOMAIN',
      }
    : validateApplicationWrite(row, {
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

const CANONICAL_PATCH_FIELDS = new Set([
  'sku', 'codigo_base', 'duty', 'oem_codes', 'competitor_codes',
  'equipment_applications', 'vehicle_applications', 'enrichment_data',
]);
const REFERENCE_PATCH_FIELDS = new Set(['oem_codes', 'competitor_codes']);

function validateReferenceEnrichment(current = {}, patch = {}, options = {}) {
  const touched = Object.keys(patch || {});
  const reasons = [];
  if (!touched.length || touched.some((field) => !REFERENCE_PATCH_FIELDS.has(field))) {
    reasons.push('REFERENCE_ENRICHMENT_SCOPE_VIOLATION');
  }

  const merged = { ...current, ...patch };
  if (merged.oem_codes == null) merged.oem_codes = [];
  if (merged.competitor_codes == null) merged.competitor_codes = [];

  const duty = String(merged.duty || '').toUpperCase();
  const skuPrefix = String(merged.sku || '').toUpperCase().slice(0, 3);
  if (RETIRED_LD_PREFIXES.has(skuPrefix)) reasons.push('RETIRED_LD_PREFIX');
  if (!ALLOWED_DUTIES.has(duty)) reasons.push('UNSUPPORTED_DUTY');
  reasons.push(...validateAlternateClassification(merged).map((v) => v.reason));

  if (options.requireReferenceEvidence === true) {
    const before = new Set([
      ...(Array.isArray(current.oem_codes) ? current.oem_codes : []).map((ref) => 'OEM|' + normalizeManufacturer(ref?.manufacturer || ref?.brand) + '|' + itemCode(ref)),
      ...(Array.isArray(current.competitor_codes) ? current.competitor_codes : []).map((ref) => 'COMPETITOR|' + normalizeManufacturer(ref?.manufacturer || ref?.brand) + '|' + itemCode(ref)),
    ]);
    const additions = [];
    for (const ref of Array.isArray(merged.oem_codes) ? merged.oem_codes : []) {
      const key = 'OEM|' + normalizeManufacturer(ref?.manufacturer || ref?.brand) + '|' + itemCode(ref);
      if (!before.has(key)) additions.push({ column:'oem_codes', ref });
    }
    for (const ref of Array.isArray(merged.competitor_codes) ? merged.competitor_codes : []) {
      const key = 'COMPETITOR|' + normalizeManufacturer(ref?.manufacturer || ref?.brand) + '|' + itemCode(ref);
      if (!before.has(key)) additions.push({ column:'competitor_codes', ref });
    }
    if (!additions.length) reasons.push('REFERENCE_ENRICHMENT_NO_NEW_REFERENCE');
    for (const { column, ref } of additions) {
      if (!itemCode(ref)) reasons.push('REFERENCE_CODE_MISSING');
      if (!String(ref?.source_url || '').trim()) reasons.push('REFERENCE_SOURCE_URL_MISSING');
      if (!String(ref?.evidence_authority || '').trim()) reasons.push('REFERENCE_EVIDENCE_AUTHORITY_MISSING');
      if (!String(ref?.evidence_hash || '').trim()) reasons.push('REFERENCE_EVIDENCE_HASH_MISSING');
      const classification = String(ref?.classification || ref?.source_type || '').toUpperCase();
      if (column === 'competitor_codes' && !['AFTERMARKET','COMPETITOR'].includes(classification)) {
        reasons.push('COMPETITOR_REFERENCE_CLASSIFICATION_REQUIRED');
      }
      if (column === 'oem_codes' && classification && classification !== 'OEM') {
        reasons.push('OEM_REFERENCE_CLASSIFICATION_REQUIRED');
      }
    }
  }

  return {
    valid: reasons.length === 0,
    reasons: [...new Set(reasons)],
    scope: 'REFERENCE_ENRICHMENT',
    touched_fields: touched,
    canonical_fields_touched: touched,
    policy_version: POLICY_VERSION,
    model: 'ALTERNATE_REFERENCE_ENRICHMENT_GOVERNED',
  };
}

function referenceKey(kind, ref = {}) {
  return kind + '|' + normalizeManufacturer(ref?.manufacturer || ref?.brand) + '|' + itemCode(ref);
}

function validateReferenceCorrection(current = {}, patch = {}, options = {}) {
  const touched = Object.keys(patch || {});
  const reasons = [];
  if (!touched.length || touched.some((field) => !REFERENCE_PATCH_FIELDS.has(field))) {
    reasons.push('REFERENCE_CORRECTION_SCOPE_VIOLATION');
  }

  const duty = String(current.duty || '').toUpperCase();
  const skuPrefix = String(current.sku || '').toUpperCase().slice(0, 3);
  if (RETIRED_LD_PREFIXES.has(skuPrefix)) reasons.push('RETIRED_LD_PREFIX');
  if (!ALLOWED_DUTIES.has(duty)) reasons.push('UNSUPPORTED_DUTY');

  const before = new Set([
    ...(Array.isArray(current.oem_codes) ? current.oem_codes : []).map((ref) => referenceKey('OEM', ref)),
    ...(Array.isArray(current.competitor_codes) ? current.competitor_codes : []).map((ref) => referenceKey('COMPETITOR', ref)),
  ]);
  const after = new Set([
    ...(Array.isArray(Object.prototype.hasOwnProperty.call(patch, 'oem_codes') ? patch.oem_codes : current.oem_codes) ? (Object.prototype.hasOwnProperty.call(patch, 'oem_codes') ? patch.oem_codes : current.oem_codes) : []).map((ref) => referenceKey('OEM', ref)),
    ...(Array.isArray(Object.prototype.hasOwnProperty.call(patch, 'competitor_codes') ? patch.competitor_codes : current.competitor_codes) ? (Object.prototype.hasOwnProperty.call(patch, 'competitor_codes') ? patch.competitor_codes : current.competitor_codes) : []).map((ref) => referenceKey('COMPETITOR', ref)),
  ]);

  const additions = [...after].filter((key) => !before.has(key));
  const removals = [...before].filter((key) => !after.has(key));
  if (additions.length) reasons.push('REFERENCE_CORRECTION_ADDITION_NOT_ALLOWED');
  if (!removals.length) reasons.push('REFERENCE_CORRECTION_NO_REMOVAL');

  const evidence = options.correctionEvidence || {};
  if (!String(evidence.authority || '').trim()) reasons.push('REFERENCE_CORRECTION_AUTHORITY_MISSING');
  if (!String(evidence.source_url || '').trim()) reasons.push('REFERENCE_CORRECTION_SOURCE_URL_MISSING');
  if (!String(evidence.evidence_hash || '').trim()) reasons.push('REFERENCE_CORRECTION_EVIDENCE_HASH_MISSING');
  if (!String(evidence.reason || '').trim()) reasons.push('REFERENCE_CORRECTION_REASON_MISSING');

  return {
    valid: reasons.length === 0,
    reasons: [...new Set(reasons)],
    scope: 'REFERENCE_CORRECTION',
    touched_fields: touched,
    canonical_fields_touched: touched,
    removed_references: removals,
    policy_version: POLICY_VERSION,
    model: 'ALTERNATE_REFERENCE_CORRECTION_GOVERNED',
  };
}

function validateGovernedCatalogPatch(current = {}, patch = {}, options = {}) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    return { valid: false, reasons: ['INVALID_PATCH'], scope: 'PATCH' };
  }
  const touched = Object.keys(patch);
  if (options.referenceEnrichment === true) {
    return validateReferenceEnrichment(current, patch, options);
  }
  if (options.referenceCorrection === true) {
    return validateReferenceCorrection(current, patch, options);
  }
  const canonicalTouched = touched.filter((field) => CANONICAL_PATCH_FIELDS.has(field));
  if (!canonicalTouched.length) {
    return {
      valid: true,
      reasons: [],
      scope: 'NON_CANONICAL_PATCH',
      touched_fields: touched,
      canonical_fields_touched: [],
      model: 'CATALOG_PATCH_GATEWAY',
    };
  }
  const merged = { ...current, ...patch };
  if (!Object.prototype.hasOwnProperty.call(patch, 'oem_codes') && merged.oem_codes == null) merged.oem_codes = [];
  if (!Object.prototype.hasOwnProperty.call(patch, 'competitor_codes') && merged.competitor_codes == null) merged.competitor_codes = [];

  const applicationRelevantTouched = canonicalTouched.some((field) =>
    ['duty', 'equipment_applications', 'vehicle_applications'].includes(field)
  );
  const result = validateCanonicalWrite(merged, {
    ...options,
    skipApplicationValidation: options.applicationWrite !== true && !applicationRelevantTouched,
  });
  return {
    ...result,
    scope: 'CANONICAL_PATCH',
    touched_fields: touched,
    canonical_fields_touched: canonicalTouched,
  };
}

function assertGovernedCatalogPatch(current = {}, patch = {}, options = {}) {
  const result = validateGovernedCatalogPatch(current, patch, options);
  if (!result.valid) {
    const error = new Error(`CATALOG_PATCH_GATEWAY_BLOCKED: ${result.reasons.join(',')}`);
    error.code = 'CATALOG_PATCH_GATEWAY_BLOCKED';
    error.validation = result;
    throw error;
  }
  return result;
}


function referenceIdentity(ref = {}) {
  return normalizeManufacturer(ref?.manufacturer || ref?.brand) + '|' + itemCode(ref);
}

function validateCrossReferenceReclassification(current = {}, patch = {}) {
  const reasons = [];
  const touched = Object.keys(patch || {});
  if (!touched.length || touched.some((field) => !REFERENCE_PATCH_FIELDS.has(field))) {
    reasons.push('REFERENCE_RECLASSIFICATION_SCOPE_VIOLATION');
  }
  const merged = { ...current, ...patch };
  if (merged.oem_codes == null) merged.oem_codes = [];
  if (merged.competitor_codes == null) merged.competitor_codes = [];
  const before = new Set([
    ...(Array.isArray(current.oem_codes) ? current.oem_codes : []).map(referenceIdentity),
    ...(Array.isArray(current.competitor_codes) ? current.competitor_codes : []).map(referenceIdentity),
  ]);
  const after = new Set([
    ...(Array.isArray(merged.oem_codes) ? merged.oem_codes : []).map(referenceIdentity),
    ...(Array.isArray(merged.competitor_codes) ? merged.competitor_codes : []).map(referenceIdentity),
  ]);
  for (const key of before) if (!after.has(key)) reasons.push('REFERENCE_RECLASSIFICATION_REMOVED_REFERENCE');
  for (const key of after) if (!before.has(key)) reasons.push('REFERENCE_RECLASSIFICATION_ADDED_REFERENCE');
  reasons.push(...validateAlternateClassification(merged).map((v) => v.reason));
  return { valid: reasons.length === 0, reasons: [...new Set(reasons)], scope: 'REFERENCE_RECLASSIFICATION' };
}

function assertCrossReferenceReclassification(current = {}, patch = {}) {
  const result = validateCrossReferenceReclassification(current, patch);
  if (!result.valid) {
    const error = new Error(`REFERENCE_RECLASSIFICATION_BLOCKED: ${result.reasons.join(',')}`);
    error.code = 'REFERENCE_RECLASSIFICATION_BLOCKED';
    error.validation = result;
    throw error;
  }
  return result;
}

module.exports = {
  validateCanonicalWrite,
  assertCanonicalWrite,
  validateGovernedCatalogPatch,
  assertGovernedCatalogPatch,
  CANONICAL_PATCH_FIELDS,
  validateAlternateClassification,
  validateReferenceEnrichment,
  validateReferenceCorrection,
  validateCrossReferenceReclassification,
  assertCrossReferenceReclassification,
  validateApplicationWrite,
  assertApplicationWrite,
  RETIRED_LD_PREFIXES,
};
