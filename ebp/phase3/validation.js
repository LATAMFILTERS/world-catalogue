'use strict';

// EBP Phase 3 — pure validation functions and state machines. No I/O here;
// database/network calls live in repository.js and service.js. See
// docs/ebp/phases/phase-03-supplier-portal.md.

const pepFields = require('./pep-fields');

const BATCH_PURPOSES = new Set(['CAPABILITY_ASSESSMENT', 'COMMERCIAL_QUOTATION', 'PRODUCTION_CANDIDATE']);
const BATCH_CHANNELS = new Set(['PORTAL', 'EXCEL', 'HYBRID']);
const BATCH_STATUSES = new Set(['DRAFT', 'SENT', 'PARTIALLY_RESPONDED', 'RESPONDED', 'OVERDUE', 'CLOSED', 'CANCELLED']);

// ADR-0025-adjacent: explicit transition table, no arbitrary jump.
const BATCH_TRANSITIONS = Object.freeze({
  DRAFT: ['SENT', 'CANCELLED'],
  SENT: ['PARTIALLY_RESPONDED', 'RESPONDED', 'OVERDUE', 'CANCELLED'],
  PARTIALLY_RESPONDED: ['RESPONDED', 'OVERDUE', 'CLOSED', 'CANCELLED'],
  OVERDUE: ['PARTIALLY_RESPONDED', 'RESPONDED', 'CLOSED', 'CANCELLED'],
  RESPONDED: ['CLOSED', 'CANCELLED'],
  CLOSED: [],
  CANCELLED: [],
});

const OFFER_STATUSES = new Set([
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'VALIDATED',
  'REJECTED',
  'APPROVED',
  'SUPERSEDED',
  'EXPIRED',
  'WITHDRAWN',
]);

// Phase 3 only ever WRITES the transitions listed here (ADR-0026). Every
// other value in OFFER_STATUSES is a valid column value a LATER phase
// writes (Phase 4: UNDER_REVIEW/VALIDATED/REJECTED; a future Offer
// Approval phase: APPROVED) — Phase 3's own transition function rejects
// any attempt to write those from this surface.
const OFFER_TRANSITIONS_PHASE3_WRITABLE = Object.freeze({
  DRAFT: ['SUBMITTED', 'WITHDRAWN'],
  SUBMITTED: ['WITHDRAWN', 'SUPERSEDED'],
  VALIDATED: ['SUPERSEDED'],
  APPROVED: ['SUPERSEDED'],
});

const COMPLETENESS_STATUSES = new Set(['ANSWERED', 'CANNOT_MEET', 'NOT_APPLICABLE']);
const DOCUMENT_CATEGORIES = new Set([
  'CERTIFICATION_EVIDENCE',
  'TECHNICAL_EVIDENCE',
  'COMMERCIAL_DOCUMENT',
  'EXCEL_IMPORT',
  'EXCEL_EXPORT',
  'OTHER',
]);
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
]);
const MAX_DOCUMENT_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB, ADR-0027

const FACTORY_ROLES = new Set([
  'MANUFACTURER_ADMIN',
  'MANUFACTURER_ENGINEERING',
  'MANUFACTURER_COMMERCIAL',
  'MANUFACTURER_READ_ONLY',
]);

const EMAIL_FORMAT = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
// Strict decimal string: optional leading '-', digits, optional '.', digits.
// Never parseFloat — preserves ADR-0026's exact-decimal requirement end to end.
const DECIMAL_FORMAT = /^-?\d+(\.\d+)?$/;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidTransition(transitions, from, to) {
  const allowed = transitions[from];
  return Array.isArray(allowed) && allowed.includes(to);
}

function validateBatchTransition(fromStatus, toStatus) {
  if (!BATCH_STATUSES.has(toStatus)) {
    return [`status must be one of ${[...BATCH_STATUSES].join(', ')}`];
  }
  if (!isValidTransition(BATCH_TRANSITIONS, fromStatus, toStatus)) {
    return [`invalid batch status transition: ${fromStatus} -> ${toStatus}`];
  }
  return [];
}

function validateOfferTransition(fromStatus, toStatus) {
  if (!OFFER_STATUSES.has(toStatus)) {
    return [`status must be one of ${[...OFFER_STATUSES].join(', ')}`];
  }
  if (!isValidTransition(OFFER_TRANSITIONS_PHASE3_WRITABLE, fromStatus, toStatus)) {
    return [
      `invalid or not-Phase-3-writable offer status transition: ${fromStatus} -> ${toStatus} ` +
        '(UNDER_REVIEW/VALIDATED/REJECTED belong to Phase 4; APPROVED belongs to a future Offer Approval phase)',
    ];
  }
  return [];
}

function validateBatchPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') return ['payload must be an object'];
  if (!isNonEmptyString(payload.manufacturer_id)) errors.push('manufacturer_id is required');
  if (!BATCH_PURPOSES.has(payload.purpose)) {
    errors.push(`purpose must be one of ${[...BATCH_PURPOSES].join(', ')}`);
  }
  if (!BATCH_CHANNELS.has(payload.channel)) {
    errors.push(`channel must be one of ${[...BATCH_CHANNELS].join(', ')}`);
  }
  if (!isNonEmptyString(payload.timezone)) errors.push('timezone is required');
  return errors;
}

function validateBatchItemPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') return ['payload must be an object'];
  if (!isNonEmptyString(payload.passport_id)) errors.push('passport_id is required');
  return errors;
}

function validateDecimalString(value, fieldName) {
  if (typeof value !== 'string' || !DECIMAL_FORMAT.test(value)) {
    return [`${fieldName} must be a decimal string (e.g. "123.45"), never a float/number literal`];
  }
  return [];
}

function validateOfferPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') return ['payload must be an object'];
  errors.push(...validateDecimalString(payload.fob_price, 'fob_price'));
  if (payload.fob_price !== undefined && DECIMAL_FORMAT.test(payload.fob_price) && Number(payload.fob_price) <= 0) {
    errors.push('fob_price must be greater than 0');
  }
  if (!isNonEmptyString(payload.currency) || payload.currency.length !== 3) {
    errors.push('currency must be a 3-letter code');
  }
  if (payload.tooling_cost !== undefined && payload.tooling_cost !== null) {
    errors.push(...validateDecimalString(payload.tooling_cost, 'tooling_cost'));
  }
  if (payload.sample_cost !== undefined && payload.sample_cost !== null) {
    errors.push(...validateDecimalString(payload.sample_cost, 'sample_cost'));
  }
  const fields = payload.technical_fields || [];
  if (!Array.isArray(fields)) {
    errors.push('technical_fields, if provided, must be an array');
  } else {
    fields.forEach((field, idx) => {
      const fieldErrors = validateTechnicalFieldPayload(field);
      fieldErrors.forEach((e) => errors.push(`technical_fields[${idx}]: ${e}`));
    });
  }
  return errors;
}

// ADR-0032: field_name always comes from the Batch Item's frozen PEP
// snapshot — the Manufacturer never writes or alters it. Validates that
// (1) every submitted field_name is one of the Passport's actual
// applicable fields (rejects any free-typed/invented field_name), and
// (2) when submitting (not saving a DRAFT), every applicable field has a
// response — no silent gaps. Portal and Excel both funnel through this
// same function, so they can never diverge on what "complete" means.
function validateOfferFieldsAgainstSnapshot(passportSnapshot, submittedFields, isSubmit) {
  const errors = [];
  const applicableFields = pepFields.getApplicableFields(passportSnapshot);
  const applicableNames = new Set(applicableFields.map((f) => f.field_name));
  const submittedNames = new Set();

  for (const field of submittedFields || []) {
    if (field && typeof field === 'object') submittedNames.add(field.field_name);
    if (!field || !applicableNames.has(field.field_name)) {
      errors.push(
        `field_name "${field && field.field_name}" is not an applicable field on this Passport — field_name must come from the Passport snapshot, it is never freely entered`
      );
    }
  }

  if (isSubmit) {
    for (const name of applicableNames) {
      if (!submittedNames.has(name)) {
        errors.push(`applicable field "${name}" has no response — every applicable field must be ANSWERED, CANNOT_MEET, or NOT_APPLICABLE before this Offer can be submitted`);
      }
    }
  }

  return errors;
}

function validateTechnicalFieldPayload(field) {
  const errors = [];
  if (!field || typeof field !== 'object') return ['field must be an object'];
  if (!isNonEmptyString(field.field_name)) errors.push('field_name is required');
  if (!COMPLETENESS_STATUSES.has(field.completeness_status)) {
    errors.push(`completeness_status must be one of ${[...COMPLETENESS_STATUSES].join(', ')}`);
  }
  if (field.completeness_status === 'ANSWERED' && (field.offered_value === undefined || field.offered_value === null)) {
    errors.push('offered_value is required when completeness_status is ANSWERED');
  }
  return errors;
}

function validateDocumentUpload({ mimeType, sizeBytes }) {
  const errors = [];
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    errors.push(`mime_type ${mimeType} is not in the allowed list (PDF, PNG, JPEG, XLSX, XLS)`);
  }
  if (!(Number.isInteger(sizeBytes) && sizeBytes > 0 && sizeBytes <= MAX_DOCUMENT_SIZE_BYTES)) {
    errors.push(`size_bytes must be a positive integer no larger than ${MAX_DOCUMENT_SIZE_BYTES}`);
  }
  return errors;
}

function validateFactoryUserPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') return ['payload must be an object'];
  if (!isNonEmptyString(payload.email) || !EMAIL_FORMAT.test(payload.email)) errors.push('email must be a valid email address');
  if (!isNonEmptyString(payload.full_name)) errors.push('full_name is required');
  if (!FACTORY_ROLES.has(payload.role)) errors.push(`role must be one of ${[...FACTORY_ROLES].join(', ')}`);
  return errors;
}

function validateLoginPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') return ['payload must be an object'];
  if (!isNonEmptyString(payload.email)) errors.push('email is required');
  if (!isNonEmptyString(payload.password)) errors.push('password is required');
  return errors;
}

function validatePasswordStrength(password) {
  if (typeof password !== 'string' || password.length < 10) {
    return ['password must be at least 10 characters'];
  }
  return [];
}

module.exports = {
  BATCH_PURPOSES,
  BATCH_CHANNELS,
  BATCH_STATUSES,
  BATCH_TRANSITIONS,
  OFFER_STATUSES,
  OFFER_TRANSITIONS_PHASE3_WRITABLE,
  COMPLETENESS_STATUSES,
  DOCUMENT_CATEGORIES,
  ALLOWED_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  FACTORY_ROLES,
  DECIMAL_FORMAT,
  validateBatchTransition,
  validateOfferTransition,
  validateBatchPayload,
  validateBatchItemPayload,
  validateOfferPayload,
  validateOfferFieldsAgainstSnapshot,
  validateTechnicalFieldPayload,
  validateDecimalString,
  validateDocumentUpload,
  validateFactoryUserPayload,
  validateLoginPayload,
  validatePasswordStrength,
};
