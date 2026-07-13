'use strict';

// EBP Phase 1 — unit tests for pure functions (no DB, no network).
// Run: node --test tests/ebp-phase1/unit.test.js

const test = require('node:test');
const assert = require('node:assert/strict');

const validation = require('../../ebp/phase1/validation');
const dto = require('../../ebp/phase1/dto');

test('validateLockedIdentification rejects missing fields', () => {
  const errors = validation.validateLockedIdentification({});
  assert.ok(errors.includes('elimfilters_code is required'));
  assert.ok(errors.includes('product_category is required'));
  assert.ok(errors.includes('product_subtype is required'));
  assert.ok(errors.some((e) => e.startsWith('duty must be one of')));
});

test('validateLockedIdentification accepts a complete payload', () => {
  const errors = validation.validateLockedIdentification({
    elimfilters_code: 'EL80047',
    product_category: 'OIL',
    product_subtype: 'SPIN_ON',
    duty: 'HEAVY_DUTY',
  });
  assert.deepEqual(errors, []);
});

test('validateLockedIdentification rejects an invalid duty value', () => {
  const errors = validation.validateLockedIdentification({
    elimfilters_code: 'EL80047',
    product_category: 'OIL',
    product_subtype: 'SPIN_ON',
    duty: 'MEDIUM_DUTY',
  });
  assert.ok(errors.some((e) => e.startsWith('duty must be one of')));
});

test('resolveFieldApplicability: matrix value used when no override given', () => {
  const resolved = validation.resolveFieldApplicability([{ field_name: 'bypass_valve_applicability', applicability: 'REQUIRED' }], {});
  assert.equal(resolved.bypass_valve_applicability, 'REQUIRED');
});

test('resolveFieldApplicability: explicit override always wins over the matrix', () => {
  const resolved = validation.resolveFieldApplicability(
    [{ field_name: 'bypass_valve_applicability', applicability: 'REQUIRED' }],
    { bypass_valve_applicability: 'NOT_APPLICABLE' }
  );
  assert.equal(resolved.bypass_valve_applicability, 'NOT_APPLICABLE');
});

test('resolveFieldApplicability: ignores an override with an invalid value', () => {
  const resolved = validation.resolveFieldApplicability([], { bypass_valve_applicability: 'MAYBE' });
  assert.equal(resolved.bypass_valve_applicability, undefined);
});

test('unresolvedValveFields: flags both valve fields when nothing resolves them', () => {
  const unresolved = validation.unresolvedValveFields({});
  assert.deepEqual(unresolved.sort(), ['antidrainback_valve_applicability', 'bypass_valve_applicability']);
});

test('unresolvedValveFields: empty once both are resolved', () => {
  const unresolved = validation.unresolvedValveFields({
    bypass_valve_applicability: 'NOT_APPLICABLE',
    antidrainback_valve_applicability: 'REQUIRED',
  });
  assert.deepEqual(unresolved, []);
});

test('validateEngineering: errors when valve applicability is unresolved', () => {
  const errors = validation.validateEngineering({}, {});
  assert.equal(errors.length, 1);
  assert.match(errors[0], /unresolved applicability/);
});

test('validateEngineering: no errors once resolved', () => {
  const errors = validation.validateEngineering(
    {},
    { bypass_valve_applicability: 'REQUIRED', antidrainback_valve_applicability: 'NOT_APPLICABLE' }
  );
  assert.deepEqual(errors, []);
});

test('validatePackaging: rejects bad packaging_class and non-positive quantity', () => {
  const errors = validation.validatePackaging({ packaging_class: 'RESIDENTIAL', elimfilters_target_quantity: 0 });
  assert.ok(errors.some((e) => e.startsWith('packaging_class must be one of')));
  assert.ok(errors.includes('elimfilters_target_quantity must be a positive integer'));
});

test('validatePackaging: accepts a valid payload', () => {
  const errors = validation.validatePackaging({ packaging_class: 'AUTOMOTIVE', elimfilters_target_quantity: 24 });
  assert.deepEqual(errors, []);
});

test('applyPackagingDefaults: AUTOMOTIVE defaults individual_box_required to true', () => {
  const out = validation.applyPackagingDefaults({ packaging_class: 'AUTOMOTIVE' });
  assert.equal(out.individual_box_required, true);
  assert.equal(out.master_carton_required, true);
});

test('applyPackagingDefaults: INDUSTRIAL defaults individual_box_required to false', () => {
  const out = validation.applyPackagingDefaults({ packaging_class: 'INDUSTRIAL' });
  assert.equal(out.individual_box_required, false);
});

test('applyPackagingDefaults: explicit values are never overwritten', () => {
  const out = validation.applyPackagingDefaults({ packaging_class: 'AUTOMOTIVE', individual_box_required: false });
  assert.equal(out.individual_box_required, false);
});

// ── DTOs (ADR-0009) ─────────────────────────────────────────────────────────

const SAMPLE_ROW = {
  id: 'p1',
  elimfilters_code: 'EL80047',
  is_pre_sku_draft: false,
  base_code: 'ML1003',
  base_brand: 'MANN',
  product_category: 'OIL',
  product_subtype: 'SPIN_ON',
  duty: 'HEAVY_DUTY',
  technology_code: 'SYNTRAX',
  engineering_revision: 1,
  status: 'ACTIVE',
  supersedes_passport_id: null,
  created_by: 'engineer@elimfilters.com',
  created_at: '2026-07-13T00:00:00Z',
  activated_at: '2026-07-13T00:01:00Z',
  superseded_at: null,
  engineering: {
    required_media: 'cellulose',
    manufacturer_instruction_notes: 'Use torque spec X',
    internal_engineering_notes: 'Do not quote below $2.10 FOB',
  },
  packaging: { packaging_class: 'AUTOMOTIVE', elimfilters_target_quantity: 24 },
};

test('toInternalPassportDTO includes both note fields', () => {
  const result = dto.toInternalPassportDTO(SAMPLE_ROW);
  assert.equal(result.engineering.manufacturer_instruction_notes, 'Use torque spec X');
  assert.equal(result.engineering.internal_engineering_notes, 'Do not quote below $2.10 FOB');
});

test('toManufacturerPassportDTO strips internal_engineering_notes but keeps manufacturer_instruction_notes', () => {
  const result = dto.toManufacturerPassportDTO(SAMPLE_ROW);
  assert.equal(result.engineering.manufacturer_instruction_notes, 'Use torque spec X');
  assert.equal('internal_engineering_notes' in result.engineering, false);
});

test('toDistributorPassportDTO exposes only locked identification — no engineering, packaging, or notes', () => {
  const result = dto.toDistributorPassportDTO(SAMPLE_ROW);
  assert.deepEqual(Object.keys(result).sort(), ['duty', 'elimfilters_code', 'product_category', 'product_subtype', 'technology_code'].sort());
  assert.equal('engineering' in result, false);
  assert.equal('packaging' in result, false);
});

test('DTOs handle a null row without throwing', () => {
  assert.equal(dto.toInternalPassportDTO(null), null);
  assert.equal(dto.toManufacturerPassportDTO(null), null);
  assert.equal(dto.toDistributorPassportDTO(null), null);
});
