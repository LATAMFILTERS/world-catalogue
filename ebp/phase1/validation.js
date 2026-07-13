'use strict';

// EBP Phase 1 — pure validation functions for the Product Engineering
// Passport. No I/O here; database/network calls live in repository.js and
// service.js. See docs/ebp/phases/phase-01-product-engineering-passport.md.

const VALVE_APPLICABILITY_VALUES = new Set(['REQUIRED', 'NOT_APPLICABLE']);
const DUTY_VALUES = new Set(['HEAVY_DUTY', 'LIGHT_DUTY']);
const PACKAGING_CLASS_VALUES = new Set(['AUTOMOTIVE', 'INDUSTRIAL']);
const VALVE_FIELDS = ['bypass_valve_applicability', 'antidrainback_valve_applicability'];

// ADR-0014: an applicability-matrix row's review state. Seed data is always
// PROVISIONAL until ELIMFILTERS engineering reviews it — see
// migrations/ebp-phase1/003_actor_identity_and_applicability_approval.sql.
const APPLICABILITY_APPROVAL_STATUS = Object.freeze({
  PROVISIONAL: 'PROVISIONAL_REQUIRES_ELIMFILTERS_ENGINEERING_APPROVAL',
  APPROVED: 'ENGINEERING_APPROVED',
});

function validateLockedIdentification(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') {
    return ['payload must be an object'];
  }
  if (!isNonEmptyString(payload.elimfilters_code)) {
    errors.push('elimfilters_code is required');
  }
  if (!isNonEmptyString(payload.product_category)) {
    errors.push('product_category is required');
  }
  if (!isNonEmptyString(payload.product_subtype)) {
    errors.push('product_subtype is required');
  }
  if (!DUTY_VALUES.has(payload.duty)) {
    errors.push(`duty must be one of ${[...DUTY_VALUES].join(', ')}`);
  }
  return errors;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// Merges applicability-matrix rows with explicit per-Passport overrides.
// matrixRows: [{ field_name, applicability, approval_status }]
// overrides: { [field_name]: 'REQUIRED' | 'NOT_APPLICABLE' }
// An explicit override always wins over the matrix default.
//
// Returns { resolved, source } — `source[field]` is 'MATRIX' or 'OVERRIDE',
// recording *where* each resolved value came from. This provenance is
// persisted (ebp_passport_engineering.field_applicability_source) so
// activatePassport() can re-check, at activation time, whether a Passport
// still depends on a PROVISIONAL matrix row — an explicit OVERRIDE is an
// engineering decision already made and is never blocked by matrix review
// state (ADR-0014).
function resolveFieldApplicability(matrixRows, overrides = {}) {
  const resolved = {};
  const source = {};
  for (const row of matrixRows || []) {
    resolved[row.field_name] = row.applicability;
    source[row.field_name] = 'MATRIX';
  }
  for (const [field, value] of Object.entries(overrides || {})) {
    if (VALVE_APPLICABILITY_VALUES.has(value)) {
      resolved[field] = value;
      source[field] = 'OVERRIDE';
    }
  }
  return { resolved, source };
}

// The two valve fields have dedicated NOT NULL columns and must always
// resolve to a real value — either from the matrix or an explicit override.
// Every other field is allowed to remain unresolved (absent from the
// generic field_applicability JSONB), per the phase-01 spec.
function unresolvedValveFields(resolved) {
  return VALVE_FIELDS.filter((field) => !VALVE_APPLICABILITY_VALUES.has(resolved[field]));
}

function validateEngineering(payload, resolvedApplicability) {
  const errors = [];
  const unresolved = unresolvedValveFields(resolvedApplicability || {});
  if (unresolved.length) {
    errors.push(
      `unresolved applicability for: ${unresolved.join(', ')} — no applicability-matrix entry ` +
        'and no explicit override supplied'
    );
  }
  return errors;
}

function validatePackaging(payload) {
  if (!payload || typeof payload !== 'object') {
    return ['packaging payload must be an object'];
  }
  const errors = [];
  if (!PACKAGING_CLASS_VALUES.has(payload.packaging_class)) {
    errors.push(`packaging_class must be one of ${[...PACKAGING_CLASS_VALUES].join(', ')}`);
  }
  const qty = payload.elimfilters_target_quantity;
  if (!(Number.isInteger(qty) && qty > 0)) {
    errors.push('elimfilters_target_quantity must be a positive integer');
  }
  return errors;
}

// Applies the automotive/industrial defaults from BUSINESS_RULES.md §3.1
// when the caller didn't explicitly set a value.
function applyPackagingDefaults(payload) {
  const out = { ...(payload || {}) };
  if (out.packaging_class === 'AUTOMOTIVE') {
    if (out.individual_box_required === undefined) out.individual_box_required = true;
  } else if (out.packaging_class === 'INDUSTRIAL') {
    if (out.individual_box_required === undefined) out.individual_box_required = false;
  }
  if (out.protective_bag_required === undefined) out.protective_bag_required = false;
  if (out.separator_required === undefined) out.separator_required = false;
  if (out.master_carton_required === undefined) out.master_carton_required = true;
  return out;
}

module.exports = {
  VALVE_FIELDS,
  DUTY_VALUES,
  PACKAGING_CLASS_VALUES,
  VALVE_APPLICABILITY_VALUES,
  APPLICABILITY_APPROVAL_STATUS,
  validateLockedIdentification,
  resolveFieldApplicability,
  unresolvedValveFields,
  validateEngineering,
  validatePackaging,
  applyPackagingDefaults,
};
