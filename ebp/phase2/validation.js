'use strict';

// EBP Phase 2 — pure validation functions and state machines for the
// Manufacturer Registry. No I/O here; database/network calls live in
// repository.js and service.js. See
// docs/ebp/phases/phase-02-manufacturer-registry.md.

const COUNTRY_CODE_FORMAT = /^[A-Z]{2}$/;
const EMAIL_FORMAT = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const LOCATION_TYPES = new Set(['HEADQUARTERS', 'FACTORY', 'WAREHOUSE', 'LAB', 'OTHER']);
const CERTIFICATION_STATUSES = new Set(['PENDING_VERIFICATION', 'VERIFIED', 'EXPIRED', 'REVOKED', 'REJECTED']);
const CAPABILITY_TYPES = new Set([
  'PRODUCT_FAMILY',
  'CONSTRUCTION_TYPE',
  'DIMENSIONAL_RANGE',
  'PROCESS',
  'MONTHLY_CAPACITY',
  'LAB',
  'INTERNAL_TEST',
  'PACKAGING',
  'PRINTING_LITHOGRAPHY',
  'MARKET_SERVED',
  'LANGUAGE',
  'CURRENCY_ACCEPTED',
]);
const CAPABILITY_REVIEW_STATUSES = new Set(['DECLARED', 'VERIFIED', 'REJECTED', 'EXPIRED']);
const CONDITION_TYPES = new Set([
  'MAX_OUTER_DIAMETER_MM',
  'MAX_HEIGHT_MM',
  'CONSTRUCTION_TYPE',
  'ALLOWED_MATERIAL',
  'APPROVED_TECHNOLOGY',
  'LOCATION_RESTRICTED',
  'INITIAL_SAMPLE_REQUIRED',
  'MIN_MONTHLY_CAPACITY',
]);

// ADR-0020: Manufacturer status state machine. Six states; RETIRED terminal.
const MANUFACTURER_STATUSES = new Set(['CANDIDATE', 'UNDER_REVIEW', 'CONDITIONAL', 'QUALIFIED', 'SUSPENDED', 'RETIRED']);
const MANUFACTURER_TRANSITIONS = Object.freeze({
  CANDIDATE: ['UNDER_REVIEW', 'RETIRED'],
  UNDER_REVIEW: ['CANDIDATE', 'CONDITIONAL', 'QUALIFIED', 'RETIRED'],
  CONDITIONAL: ['UNDER_REVIEW', 'QUALIFIED', 'SUSPENDED', 'RETIRED'],
  QUALIFIED: ['SUSPENDED', 'RETIRED'],
  SUSPENDED: ['UNDER_REVIEW', 'RETIRED'],
  RETIRED: [],
});

// ADR-0020: Qualification status state machine. Five states; REVOKED terminal.
const QUALIFICATION_STATUSES = new Set(['CANDIDATE', 'CONDITIONAL', 'QUALIFIED', 'SUSPENDED', 'REVOKED']);
const QUALIFICATION_TRANSITIONS = Object.freeze({
  CANDIDATE: ['CONDITIONAL', 'QUALIFIED', 'REVOKED'],
  CONDITIONAL: ['QUALIFIED', 'SUSPENDED', 'REVOKED'],
  QUALIFIED: ['SUSPENDED', 'REVOKED'],
  SUSPENDED: ['CONDITIONAL', 'QUALIFIED', 'REVOKED'],
  REVOKED: [],
});

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidTransition(transitions, from, to) {
  const allowed = transitions[from];
  return Array.isArray(allowed) && allowed.includes(to);
}

function validateManufacturerTransition(fromStatus, toStatus) {
  if (!MANUFACTURER_STATUSES.has(toStatus)) {
    return [`status must be one of ${[...MANUFACTURER_STATUSES].join(', ')}`];
  }
  if (!isValidTransition(MANUFACTURER_TRANSITIONS, fromStatus, toStatus)) {
    return [`invalid manufacturer status transition: ${fromStatus} -> ${toStatus}`];
  }
  return [];
}

function validateQualificationTransition(fromStatus, toStatus) {
  if (!QUALIFICATION_STATUSES.has(toStatus)) {
    return [`status must be one of ${[...QUALIFICATION_STATUSES].join(', ')}`];
  }
  if (!isValidTransition(QUALIFICATION_TRANSITIONS, fromStatus, toStatus)) {
    return [`invalid qualification status transition: ${fromStatus} -> ${toStatus}`];
  }
  return [];
}

function validateManufacturerPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') return ['payload must be an object'];
  if (!isNonEmptyString(payload.legal_name)) errors.push('legal_name is required');
  if (!isNonEmptyString(payload.country_code) || !COUNTRY_CODE_FORMAT.test(payload.country_code)) {
    errors.push('country_code must be a 2-letter uppercase ISO 3166-1 alpha-2 code');
  }
  if (!isNonEmptyString(payload.timezone)) errors.push('timezone is required');
  return errors;
}

const MANUFACTURER_MUTABLE_FIELDS = ['legal_name', 'trade_name', 'website', 'timezone', 'internal_notes'];

function validateManufacturerUpdate(payload) {
  if (!payload || typeof payload !== 'object') return ['payload must be an object'];
  const errors = [];
  const keys = Object.keys(payload);
  const disallowed = keys.filter((k) => !MANUFACTURER_MUTABLE_FIELDS.includes(k));
  if (disallowed.length) {
    errors.push(`fields not updatable via this endpoint: ${disallowed.join(', ')}`);
  }
  if (payload.legal_name !== undefined && !isNonEmptyString(payload.legal_name)) {
    errors.push('legal_name, if provided, must be a non-empty string');
  }
  return errors;
}

function validateContactPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') return ['payload must be an object'];
  if (!isNonEmptyString(payload.full_name)) errors.push('full_name is required');
  if (!isNonEmptyString(payload.email) || !EMAIL_FORMAT.test(payload.email)) errors.push('email must be a valid email address');
  return errors;
}

function validateLocationPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') return ['payload must be an object'];
  if (!LOCATION_TYPES.has(payload.location_type)) {
    errors.push(`location_type must be one of ${[...LOCATION_TYPES].join(', ')}`);
  }
  if (!isNonEmptyString(payload.country_code) || !COUNTRY_CODE_FORMAT.test(payload.country_code)) {
    errors.push('country_code must be a 2-letter uppercase ISO 3166-1 alpha-2 code');
  }
  if (!isNonEmptyString(payload.timezone)) errors.push('timezone is required');
  return errors;
}

function validateCertificationPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') return ['payload must be an object'];
  if (!isNonEmptyString(payload.certification_code)) errors.push('certification_code is required');
  if (!isNonEmptyString(payload.issuing_body)) errors.push('issuing_body is required');
  if (!isNonEmptyString(payload.issued_on)) errors.push('issued_on is required (YYYY-MM-DD)');
  return errors;
}

function validateCertificationVerification(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') return ['payload must be an object'];
  if (!CERTIFICATION_STATUSES.has(payload.status) || !['VERIFIED', 'REJECTED', 'REVOKED'].includes(payload.status)) {
    errors.push('status must be one of VERIFIED, REJECTED, REVOKED');
  }
  return errors;
}

function validateCapabilityPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') return ['payload must be an object'];
  if (!CAPABILITY_TYPES.has(payload.capability_type)) {
    errors.push(`capability_type must be one of ${[...CAPABILITY_TYPES].join(', ')}`);
  }
  if (payload.capability_value === undefined || payload.capability_value === null || typeof payload.capability_value !== 'object') {
    errors.push('capability_value is required and must be an object');
  }
  return errors;
}

function validateCapabilityVerification(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') return ['payload must be an object'];
  if (!['VERIFIED', 'REJECTED'].includes(payload.review_status)) {
    errors.push('review_status must be one of VERIFIED, REJECTED');
  }
  return errors;
}

function validateQualificationPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') return ['payload must be an object'];
  if (!isNonEmptyString(payload.location_id)) errors.push('location_id is required');
  if (!isNonEmptyString(payload.product_category)) errors.push('product_category is required');
  if (!isNonEmptyString(payload.product_subtype)) errors.push('product_subtype is required');
  const conditions = payload.conditions || [];
  if (!Array.isArray(conditions)) {
    errors.push('conditions, if provided, must be an array');
  } else {
    conditions.forEach((condition, idx) => {
      const condErrors = validateQualificationCondition(condition);
      condErrors.forEach((e) => errors.push(`conditions[${idx}]: ${e}`));
    });
  }
  return errors;
}

function validateQualificationCondition(condition) {
  const errors = [];
  if (!condition || typeof condition !== 'object') return ['condition must be an object'];
  if (!CONDITION_TYPES.has(condition.condition_type)) {
    errors.push(`condition_type must be one of ${[...CONDITION_TYPES].join(', ')}`);
  }
  if (
    condition.parameters === undefined ||
    condition.parameters === null ||
    typeof condition.parameters !== 'object' ||
    Array.isArray(condition.parameters)
  ) {
    errors.push('parameters is required and must be an object');
  }
  return errors;
}

module.exports = {
  MANUFACTURER_STATUSES,
  MANUFACTURER_TRANSITIONS,
  QUALIFICATION_STATUSES,
  QUALIFICATION_TRANSITIONS,
  MANUFACTURER_MUTABLE_FIELDS,
  LOCATION_TYPES,
  CERTIFICATION_STATUSES,
  CAPABILITY_TYPES,
  CAPABILITY_REVIEW_STATUSES,
  CONDITION_TYPES,
  validateManufacturerTransition,
  validateQualificationTransition,
  validateManufacturerPayload,
  validateManufacturerUpdate,
  validateContactPayload,
  validateLocationPayload,
  validateCertificationPayload,
  validateCertificationVerification,
  validateCapabilityPayload,
  validateCapabilityVerification,
  validateQualificationPayload,
  validateQualificationCondition,
};
