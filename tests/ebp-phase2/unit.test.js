'use strict';

// EBP Phase 2 — unit tests for pure functions (no DB, no network).
// Run: node --test tests/ebp-phase2/unit.test.js

const test = require('node:test');
const assert = require('node:assert/strict');

const efmCode = require('../../ebp/phase2/efm-code');
const validation = require('../../ebp/phase2/validation');
const dto = require('../../ebp/phase2/dto');

// ── EFM code generation/validation (ADR-0015) ──────────────────────────────

test('generateCandidate produces a well-formed EFM-XXXX code', () => {
  const code = efmCode.generateCandidate();
  assert.match(code, efmCode.CODE_FORMAT);
  assert.ok(efmCode.isValidFormat(code));
});

test('generateCandidate never uses ambiguous characters (0, 1, O, I)', () => {
  for (let i = 0; i < 200; i += 1) {
    const code = efmCode.generateCandidate();
    assert.doesNotMatch(code, /[01OI]/);
  }
});

test('isValidFormat rejects lowercase, wrong length, and missing prefix', () => {
  assert.equal(efmCode.isValidFormat('efm-a7k2'), false);
  assert.equal(efmCode.isValidFormat('EFM-A7K'), false);
  assert.equal(efmCode.isValidFormat('EFM-A7K22'), false);
  assert.equal(efmCode.isValidFormat('XFM-A7K2'), false);
  assert.equal(efmCode.isValidFormat('EFM-A7O2'), false); // contains ambiguous O
  assert.equal(efmCode.isValidFormat(null), false);
});

test('isValidFormat accepts a well-formed code', () => {
  assert.equal(efmCode.isValidFormat('EFM-A7K2'), true);
});

test('generateUniqueManufacturerCode retries on collision and returns a free candidate', async () => {
  let calls = 0;
  const taken = new Set();
  const code = await efmCode.generateUniqueManufacturerCode(async (candidate) => {
    calls += 1;
    if (calls <= 3) {
      taken.add(candidate);
      return true; // force a collision the first 3 attempts
    }
    return false;
  });
  assert.ok(efmCode.isValidFormat(code));
  assert.ok(calls >= 4);
});

test('generateUniqueManufacturerCode throws if every attempt collides', async () => {
  await assert.rejects(
    () => efmCode.generateUniqueManufacturerCode(async () => true),
    /could not generate a unique manufacturer_code/
  );
});

// ── Manufacturer status state machine (ADR-0020) ───────────────────────────

test('validateManufacturerTransition accepts CANDIDATE -> UNDER_REVIEW', () => {
  assert.deepEqual(validation.validateManufacturerTransition('CANDIDATE', 'UNDER_REVIEW'), []);
});

test('validateManufacturerTransition rejects CANDIDATE -> QUALIFIED (must pass through UNDER_REVIEW)', () => {
  const errors = validation.validateManufacturerTransition('CANDIDATE', 'QUALIFIED');
  assert.ok(errors.length > 0);
  assert.match(errors[0], /invalid manufacturer status transition/);
});

test('validateManufacturerTransition rejects any transition out of RETIRED (terminal)', () => {
  const errors = validation.validateManufacturerTransition('RETIRED', 'UNDER_REVIEW');
  assert.ok(errors.length > 0);
});

test('validateManufacturerTransition rejects SUSPENDED -> QUALIFIED directly (must reactivate via UNDER_REVIEW)', () => {
  const errors = validation.validateManufacturerTransition('SUSPENDED', 'QUALIFIED');
  assert.ok(errors.length > 0);
});

test('validateManufacturerTransition accepts SUSPENDED -> UNDER_REVIEW (the only reactivation path)', () => {
  assert.deepEqual(validation.validateManufacturerTransition('SUSPENDED', 'UNDER_REVIEW'), []);
});

test('validateManufacturerTransition rejects an unknown target status', () => {
  const errors = validation.validateManufacturerTransition('CANDIDATE', 'BOGUS');
  assert.ok(errors.some((e) => e.startsWith('status must be one of')));
});

// ── Qualification status state machine (ADR-0020) ──────────────────────────

test('validateQualificationTransition accepts CANDIDATE -> CONDITIONAL', () => {
  assert.deepEqual(validation.validateQualificationTransition('CANDIDATE', 'CONDITIONAL'), []);
});

test('validateQualificationTransition rejects any transition out of REVOKED (terminal)', () => {
  const errors = validation.validateQualificationTransition('REVOKED', 'CANDIDATE');
  assert.ok(errors.length > 0);
});

test('validateQualificationTransition rejects CANDIDATE -> SUSPENDED (must qualify or condition first)', () => {
  const errors = validation.validateQualificationTransition('CANDIDATE', 'SUSPENDED');
  assert.ok(errors.length > 0);
});

// ── Payload validators ──────────────────────────────────────────────────────

test('validateManufacturerPayload requires legal_name, country_code, timezone', () => {
  const errors = validation.validateManufacturerPayload({});
  assert.ok(errors.includes('legal_name is required'));
  assert.ok(errors.some((e) => e.startsWith('country_code must be')));
  assert.ok(errors.includes('timezone is required'));
});

test('validateManufacturerPayload rejects a lowercase or 3-letter country_code', () => {
  const errors = validation.validateManufacturerPayload({ legal_name: 'Acme', country_code: 'cn', timezone: 'Asia/Shanghai' });
  assert.ok(errors.some((e) => e.startsWith('country_code must be')));
});

test('validateManufacturerPayload accepts a complete payload', () => {
  const errors = validation.validateManufacturerPayload({ legal_name: 'Acme Filtration Co.', country_code: 'CN', timezone: 'Asia/Shanghai' });
  assert.deepEqual(errors, []);
});

test('validateManufacturerUpdate rejects protected fields (status, manufacturer_code)', () => {
  const errors = validation.validateManufacturerUpdate({ status: 'QUALIFIED' });
  assert.ok(errors.some((e) => e.includes('status')));
  const errors2 = validation.validateManufacturerUpdate({ manufacturer_code: 'EFM-ZZZZ' });
  assert.ok(errors2.some((e) => e.includes('manufacturer_code')));
});

test('validateManufacturerUpdate accepts the allow-listed mutable fields', () => {
  const errors = validation.validateManufacturerUpdate({ legal_name: 'New Name', website: 'https://example.com' });
  assert.deepEqual(errors, []);
});

test('validateContactPayload requires full_name and a valid email', () => {
  const errors = validation.validateContactPayload({ full_name: '', email: 'not-an-email' });
  assert.ok(errors.includes('full_name is required'));
  assert.ok(errors.some((e) => e.startsWith('email must be')));
});

test('validateLocationPayload rejects an invalid location_type', () => {
  const errors = validation.validateLocationPayload({ location_type: 'CASTLE', country_code: 'US', timezone: 'America/Chicago' });
  assert.ok(errors.some((e) => e.startsWith('location_type must be one of')));
});

test('validateCertificationPayload requires certification_code, issuing_body, issued_on', () => {
  const errors = validation.validateCertificationPayload({});
  assert.ok(errors.includes('certification_code is required'));
  assert.ok(errors.includes('issuing_body is required'));
  assert.ok(errors.includes('issued_on is required (YYYY-MM-DD)'));
});

test('validateCertificationVerification only allows VERIFIED/REJECTED/REVOKED', () => {
  const errors = validation.validateCertificationVerification({ status: 'PENDING_VERIFICATION' });
  assert.ok(errors.length > 0);
  assert.deepEqual(validation.validateCertificationVerification({ status: 'VERIFIED' }), []);
});

test('validateCapabilityPayload requires a known capability_type and an object capability_value', () => {
  const errors = validation.validateCapabilityPayload({ capability_type: 'SPACESHIP_PARTS', capability_value: 'not-an-object' });
  assert.ok(errors.some((e) => e.startsWith('capability_type must be one of')));
  assert.ok(errors.includes('capability_value is required and must be an object'));
});

test('validateQualificationPayload requires location_id, product_category, product_subtype', () => {
  const errors = validation.validateQualificationPayload({});
  assert.ok(errors.includes('location_id is required'));
  assert.ok(errors.includes('product_category is required'));
  assert.ok(errors.includes('product_subtype is required'));
});

test('validateQualificationCondition rejects unknown condition_type and non-object parameters', () => {
  const errors = validation.validateQualificationCondition({ condition_type: 'UNKNOWN', parameters: 'nope' });
  assert.ok(errors.some((e) => e.startsWith('condition_type must be one of')));
  assert.ok(errors.includes('parameters is required and must be an object'));
});

test('validateQualificationCondition accepts a well-formed MAX_OUTER_DIAMETER_MM condition', () => {
  const errors = validation.validateQualificationCondition({ condition_type: 'MAX_OUTER_DIAMETER_MM', parameters: { max_mm: 120 } });
  assert.deepEqual(errors, []);
});

// ── DTOs (ADR-0021 — internal-only, no generic row serialization) ──────────

const SAMPLE_MANUFACTURER_ROW = {
  id: 'm1',
  manufacturer_code: 'EFM-A7K2',
  legal_name: 'Acme Filtration Co.',
  trade_name: 'Acme',
  country_code: 'CN',
  timezone: 'Asia/Shanghai',
  website: 'https://acme.example',
  status: 'CANDIDATE',
  status_reason: null,
  internal_notes: 'Do not disclose pricing floor.',
  registered_on: '2026-07-13',
  created_by: 'admin-key-session',
  identity_mechanism: 'ADMIN_KEY_SHARED',
  created_at: '2026-07-13T00:00:00Z',
  updated_at: '2026-07-13T00:00:00Z',
  retired_at: null,
  extra_column_from_a_future_migration: 'should never leak through the DTO',
};

test('toInternalManufacturerDTO includes manufacturer_code and internal_notes (internal-only projection)', () => {
  const result = dto.toInternalManufacturerDTO(SAMPLE_MANUFACTURER_ROW);
  assert.equal(result.manufacturer_code, 'EFM-A7K2');
  assert.equal(result.internal_notes, 'Do not disclose pricing floor.');
});

test('toInternalManufacturerDTO is an explicit allow-list — unknown columns never leak through', () => {
  const result = dto.toInternalManufacturerDTO(SAMPLE_MANUFACTURER_ROW);
  assert.equal('extra_column_from_a_future_migration' in result, false);
});

test('toInternalManufacturerDTO handles a null row without throwing', () => {
  assert.equal(dto.toInternalManufacturerDTO(null), null);
});

test('toInternalCertificationDTO surfaces both status and effective_status (ADR-0019)', () => {
  const result = dto.toInternalCertificationDTO({
    id: 'c1',
    manufacturer_id: 'm1',
    location_id: null,
    certification_code: 'ISO9001',
    certificate_number: '12345',
    issuing_body: 'TUV',
    issued_on: '2020-01-01',
    expires_on: '2021-01-01',
    status: 'VERIFIED',
    effective_status: 'EXPIRED',
    evidence_reference: null,
    scope: null,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2020-01-01T00:00:00Z',
  });
  assert.equal(result.status, 'VERIFIED');
  assert.equal(result.effective_status, 'EXPIRED');
});

test('toInternalQualificationDTO nests conditions via toInternalQualificationConditionDTO', () => {
  const result = dto.toInternalQualificationDTO({
    id: 'q1',
    manufacturer_id: 'm1',
    location_id: 'l1',
    product_category: 'OIL',
    product_subtype: 'SPIN_ON',
    status: 'CANDIDATE',
    effective_from: null,
    review_due_on: null,
    approved_by: null,
    evidence_reference: null,
    created_at: '2026-07-13T00:00:00Z',
    updated_at: '2026-07-13T00:00:00Z',
    conditions: [
      { id: 'cond1', qualification_id: 'q1', condition_type: 'MAX_HEIGHT_MM', parameters: { max_mm: 200 }, is_satisfied: false, satisfied_at: null, notes: null, created_at: '2026-07-13T00:00:00Z' },
    ],
  });
  assert.equal(result.conditions.length, 1);
  assert.equal(result.conditions[0].condition_type, 'MAX_HEIGHT_MM');
});

test('toInternalQualificationDTO defaults conditions to an empty array when absent', () => {
  const result = dto.toInternalQualificationDTO({ id: 'q1', manufacturer_id: 'm1', location_id: 'l1', product_category: 'OIL', product_subtype: 'SPIN_ON', status: 'CANDIDATE' });
  assert.deepEqual(result.conditions, []);
});
