'use strict';

const {
  POLICY_VERSION,
  normalizeManufacturer,
  normalizeCode,
  lastFourNumeric,
  skuLastFourNumeric,
  approvedLdOemCollisionReady,
} = require('./catalog-codigo-base-policy');
const {
  APPLICATION_POLICY_VERSION,
  validateApplicationWrite,
  assertApplicationWrite,
} = require('./catalog-application-governance');

const ALLOWED_DUTIES = new Set(['HEAVY_DUTY', 'LIGHT_DUTY', 'INDUSTRIAL_PROCESS']);
const INDUSTRIAL_BASE_AUTHORITY = new Set(['ORIGINAL_BASE', 'FAMILY_ANCHOR_BASE']);
const INDUSTRIAL_SKU_POLICY_VERSION = 'INDUSTRIAL_SKU_NOMENCLATURE_V1_2026-09-22';
const ALLOWED_SOURCE_COLUMNS = new Set(['OEM_CODES', 'COMPETITOR_CODES']);
const MANN_NAMES = new Set(['MANN', 'MANNFILTER', 'MANNHUMMEL']);
const FRAM_NAMES = new Set(['FRAM']);
const FLEETGUARD_NAMES = new Set(['FLEETGUARD']);
const RETIRED_LD_PREFIXES = new Set(['EA5', 'EC5', 'EF5', 'EL5']);

function governanceFrom(row = {}) {
  return row?.enrichment_data?.codigo_base_governance || {};
}

function industrialBaseGovernanceFrom(row = {}) {
  return row?.enrichment_data?.industrial_base_governance || {};
}

function industrialSkuGovernanceFrom(row = {}) {
  return row?.enrichment_data?.industrial_sku_governance || {};
}

function validateIndustrialCanonicalWrite(row = {}) {
  const reasons = [];
  const sku = String(row.sku || '').trim().toUpperCase();
  const base = normalizeCode(row.codigo_base);
  const canonicalBrand = normalizeManufacturer(row.canonical_source_brand);
  const canonicalCode = normalizeCode(row.canonical_source_code);
  const canonicalStatus = String(row.canonical_source_status || '').trim().toUpperCase();
  const technology = String(row.technology || '').trim();
  const baseGov = industrialBaseGovernanceFrom(row);
  const skuGov = industrialSkuGovernanceFrom(row);
  const authority = String(baseGov.authority_status || '').trim().toUpperCase();
  const technologyCore = String(baseGov.technology_core || '').trim().toUpperCase();
  const approvedBase = normalizeCode(baseGov.approved_base_code);
  const approvedSourceBrand = normalizeManufacturer(baseGov.approved_source_brand);
  const approvedAnchorBrand = normalizeManufacturer(baseGov.approved_anchor_brand);

  if (!/^I[A-Z][0-9]{5}$/.test(sku)) reasons.push('INDUSTRIAL_SKU_FORMAT_INVALID');
  if (!technologyCore) reasons.push('INDUSTRIAL_TECHNOLOGY_CORE_MISSING');
  if (!technology) reasons.push('INDUSTRIAL_TECHNOLOGY_MISSING');
  if (!INDUSTRIAL_BASE_AUTHORITY.has(authority)) reasons.push('INDUSTRIAL_BASE_AUTHORITY_NOT_ELIGIBLE');
  if (baseGov.base_eligible !== true) reasons.push('INDUSTRIAL_BASE_NOT_ELIGIBLE');
  if (baseGov.primary_evidence_complete !== true) reasons.push('INDUSTRIAL_PRIMARY_EVIDENCE_INCOMPLETE');
  if (!base || !approvedBase || approvedBase !== base) reasons.push('INDUSTRIAL_APPROVED_BASE_MISMATCH');
  if (!canonicalCode || canonicalCode !== base) reasons.push('INDUSTRIAL_CANONICAL_SOURCE_CODE_MISMATCH');
  if (!canonicalBrand || !approvedSourceBrand || canonicalBrand !== approvedSourceBrand) reasons.push('INDUSTRIAL_CANONICAL_SOURCE_BRAND_MISMATCH');
  if (canonicalStatus !== 'VERIFIED') reasons.push('INDUSTRIAL_CANONICAL_SOURCE_NOT_VERIFIED');
  if (!Array.isArray(baseGov.source_urls) || baseGov.source_urls.length === 0) reasons.push('INDUSTRIAL_SOURCE_EVIDENCE_MISSING');

  if (authority === 'ORIGINAL_BASE' && baseGov.original_confirmed !== true) {
    reasons.push('INDUSTRIAL_ORIGINAL_BASE_NOT_CONFIRMED');
  }
  if (authority === 'FAMILY_ANCHOR_BASE') {
    if (!approvedAnchorBrand || approvedAnchorBrand !== canonicalBrand) reasons.push('INDUSTRIAL_FAMILY_ANCHOR_MISMATCH');
    if (baseGov.original_confirmed === true) reasons.push('INDUSTRIAL_FAMILY_ANCHOR_CONFLICTS_WITH_ORIGINAL');
  }

  if (skuGov.policy_version !== INDUSTRIAL_SKU_POLICY_VERSION) reasons.push('INDUSTRIAL_SKU_POLICY_VERSION_MISMATCH');
  if (String(skuGov.planned_sku || '').trim().toUpperCase() !== sku) reasons.push('INDUSTRIAL_PLANNED_SKU_MISMATCH');
  if (String(skuGov.technology_core || '').trim().toUpperCase() !== technologyCore) reasons.push('INDUSTRIAL_SKU_TECHNOLOGY_CORE_MISMATCH');
  if (skuGov.publication_order_locked !== true) reasons.push('INDUSTRIAL_PUBLICATION_ORDER_NOT_LOCKED');
  if (!Number.isInteger(skuGov.publication_order) || skuGov.publication_order < 1) reasons.push('INDUSTRIAL_PUBLICATION_ORDER_INVALID');

  return {
    valid: reasons.length === 0,
    reasons: [...new Set(reasons)],
    authority_status: authority || null,
    technology_core: technologyCore || null,
    model: 'INDUSTRIAL_BASE_AUTHORITY__FROZEN_SKU_PLAN__PRIMARY_EVIDENCE',
  };
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
  const skuPrefix = String(row.sku || '').toUpperCase().slice(0, 3);

  if (RETIRED_LD_PREFIXES.has(skuPrefix)) reasons.push('RETIRED_LD_PREFIX');
  if (!ALLOWED_DUTIES.has(duty)) reasons.push('UNSUPPORTED_DUTY');
  const filterType = String(row.filter_type || '').trim().toLowerCase();
  const technology = String(row.technology || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if ((filterType === 'air_dryer' || technology === 'DRYCORE') && duty !== 'HEAVY_DUTY') reasons.push('AIR_DRYER_REQUIRES_HEAVY_DUTY');
  if (!base) reasons.push('MISSING_CODIGO_BASE');
  reasons.push(...validateAlternateClassification(row).map((v) => v.reason));

  if (duty === 'HEAVY_DUTY') {
    const primary = gov.primary_manufacturer_verified === true && manufacturer === 'DONALDSON' && approved === base;
    if (!primary) {
      if (gov.donaldson_absence_verified !== true) reasons.push('DONALDSON_ABSENCE_NOT_VERIFIED');
      const isFleetguard = FLEETGUARD_NAMES.has(manufacturer);
      if (isFleetguard) {
        if (gov.fallback_manufacturer_verified !== true) reasons.push('FLEETGUARD_MANUFACTURER_NOT_VERIFIED');
        if (gov.fallback_commercial_code_verified !== true) reasons.push('FLEETGUARD_COMMERCIAL_CODE_NOT_VERIFIED');
        if (source !== 'COMPETITOR_CODES') reasons.push('FLEETGUARD_FALLBACK_SOURCE_INVALID');
      } else {
        if (gov.fleetguard_absence_verified !== true) reasons.push('FLEETGUARD_ABSENCE_NOT_VERIFIED');
        if (gov.fallback_manufacturer_verified !== true) reasons.push('OEM_MANUFACTURER_NOT_VERIFIED');
        if (gov.fallback_commercial_code_verified !== true) reasons.push('OEM_COMMERCIAL_CODE_NOT_VERIFIED');
        if (source !== 'OEM_CODES') reasons.push('HD_FINAL_FALLBACK_MUST_BE_OEM');
      }
      if (!approved || approved !== base) reasons.push('APPROVED_BASE_MISMATCH');
      const expected = lastFourNumeric(gov.approved_codigo_base);
      if (!expected || skuLastFourNumeric(row.sku) !== expected) reasons.push('SKU_SUFFIX_MISMATCH');
    }
  }

  if (duty === 'LIGHT_DUTY') {
    const originGroup = String(gov.origin_group || '').toUpperCase();
    if (originGroup === 'EUROPEAN' || originGroup === 'NON_EUROPEAN') {
      const primaryAuthorityOk = originGroup === 'EUROPEAN'
        ? MANN_NAMES.has(manufacturer)
        : FRAM_NAMES.has(manufacturer);
      const collisionOemBase = approvedLdOemCollisionReady(row);
      const primary = gov.primary_manufacturer_verified === true && primaryAuthorityOk && approved === base;

      if (!primary && !collisionOemBase) {
        const absenceVerified = originGroup === 'EUROPEAN'
          ? gov.mann_absence_verified === true
          : gov.fram_absence_verified === true;
        if (!absenceVerified) {
          reasons.push(originGroup === 'EUROPEAN' ? 'MANN_ABSENCE_NOT_VERIFIED' : 'FRAM_ABSENCE_NOT_VERIFIED');
        }
        if (gov.fallback_manufacturer_verified !== true) reasons.push('FALLBACK_MANUFACTURER_NOT_VERIFIED');
        if (gov.fallback_commercial_code_verified !== true) reasons.push('FALLBACK_COMMERCIAL_CODE_NOT_VERIFIED');
        if (!approved || approved !== base) reasons.push('APPROVED_BASE_MISMATCH');
        if (source !== 'OEM_CODES') reasons.push('LD_FALLBACK_MUST_BE_OEM');
      }
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

  let industrialValidation = null;
  if (duty === 'INDUSTRIAL_PROCESS') {
    industrialValidation = validateIndustrialCanonicalWrite(row);
    reasons.push(...industrialValidation.reasons);
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
    industrial_validation: industrialValidation,
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

function validateGovernedCatalogPatch(current = {}, patch = {}, options = {}) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    return { valid: false, reasons: ['INVALID_PATCH'], scope: 'PATCH' };
  }
  const touched = Object.keys(patch);
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
  const result = validateCanonicalWrite({ ...current, ...patch }, options);
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

module.exports = {
  validateCanonicalWrite,
  assertCanonicalWrite,
  validateGovernedCatalogPatch,
  assertGovernedCatalogPatch,
  CANONICAL_PATCH_FIELDS,
  validateAlternateClassification,
  validateApplicationWrite,
  assertApplicationWrite,
  RETIRED_LD_PREFIXES,
  INDUSTRIAL_SKU_POLICY_VERSION,
  industrialBaseGovernanceFrom,
  industrialSkuGovernanceFrom,
  validateIndustrialCanonicalWrite,
};
