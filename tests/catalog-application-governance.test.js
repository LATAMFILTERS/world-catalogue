'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  APPLICATION_POLICY_VERSION,
  applicationPayloadHash,
  validateApplicationWrite,
} = require('../lib/catalog-application-governance');
const { validateCanonicalWrite } = require('../lib/catalog-write-gateway');

function hdBase(overrides = {}) {
  return {
    sku: 'EH61234',
    codigo_base: 'P551234',
    duty: 'HEAVY_DUTY',
    oem_codes: [],
    competitor_codes: [],
    equipment_applications: [],
    vehicle_applications: [],
    enrichment_data: {
      codigo_base_governance: {
        primary_manufacturer_verified: true,
        approved_manufacturer: 'DONALDSON',
        approved_codigo_base: 'P551234',
      },
    },
    ...overrides,
  };
}

function verifiedApplicationGovernance(payload, kind = 'EQUIPMENT', hasEngine = true) {
  const hash = applicationPayloadHash(payload);
  const gov = {
    policy_version: APPLICATION_POLICY_VERSION,
    evidence_recorded: true,
    evidence_authority: 'OFFICIAL_MANUFACTURER_CATALOG',
  };
  if (kind === 'EQUIPMENT') {
    gov.equipment_verified = true;
    gov.equipment_payload_hash = hash;
  } else {
    gov.vehicle_verified = true;
    gov.vehicle_payload_hash = hash;
  }
  if (hasEngine) {
    gov.engine_verified = true;
    gov.engine_payload_hash = hash;
  }
  return gov;
}

test('HD equipment application with engine is blocked without explicit application evidence', () => {
  const equipment = [{ make: 'VOLVO', model: 'L120', equipment: 'VOLVO L120', type: 'LOADER', engine: 'D6' }];
  const row = hdBase({ equipment_applications: equipment });
  const result = validateApplicationWrite(row, { requireEvidence: true });
  assert.equal(result.valid, false);
  assert.ok(result.reasons.includes('APPLICATION_EVIDENCE_NOT_RECORDED'));
  assert.ok(result.reasons.includes('ENGINE_APPLICATION_NOT_VERIFIED'));
});

test('HD equipment and nested engine pass when the exact payload is explicitly verified', () => {
  const equipment = [{ make: 'VOLVO', model: 'L120', equipment: 'VOLVO L120', type: 'LOADER', engine: 'D6' }];
  const row = hdBase({
    equipment_applications: equipment,
    enrichment_data: {
      codigo_base_governance: hdBase().enrichment_data.codigo_base_governance,
      application_governance: verifiedApplicationGovernance(equipment, 'EQUIPMENT', true),
    },
  });
  assert.equal(validateApplicationWrite(row, { requireEvidence: true }).valid, true);
  assert.equal(validateCanonicalWrite(row, { applicationWrite: true }).valid, true);
});

test('changing engine text invalidates the approved payload hash', () => {
  const approved = [{ equipment: 'VOLVO L120', engine: 'D6' }];
  const changed = [{ equipment: 'VOLVO L120', engine: 'D8' }];
  const row = hdBase({
    equipment_applications: changed,
    enrichment_data: {
      codigo_base_governance: hdBase().enrichment_data.codigo_base_governance,
      application_governance: verifiedApplicationGovernance(approved, 'EQUIPMENT', true),
    },
  });
  const result = validateApplicationWrite(row, { requireEvidence: true });
  assert.equal(result.valid, false);
  assert.ok(result.reasons.includes('EQUIPMENT_PAYLOAD_HASH_MISMATCH'));
  assert.ok(result.reasons.includes('ENGINE_PAYLOAD_HASH_MISMATCH'));
});

test('HD vehicle_applications are blocked to prevent cross-model propagation', () => {
  const row = hdBase({ vehicle_applications: [{ make: 'FORD', model: 'F-150' }] });
  const result = validateApplicationWrite(row);
  assert.equal(result.valid, false);
  assert.ok(result.reasons.includes('HD_VEHICLE_APPLICATIONS_MUST_USE_EQUIPMENT_MODEL'));
});

test('LD vehicle application passes only with exact evidence and engine verification', () => {
  const vehicles = [{ make: 'TOYOTA', model: 'HILUX', year: '2022', engine: '2GD-FTV' }];
  const row = {
    sku: 'EA31234',
    duty: 'LIGHT_DUTY',
    equipment_applications: [],
    vehicle_applications: vehicles,
    enrichment_data: { application_governance: verifiedApplicationGovernance(vehicles, 'VEHICLE', true) },
  };
  assert.equal(validateApplicationWrite(row, { requireEvidence: true }).valid, true);
});

test('LD equipment_applications are blocked', () => {
  const row = {
    sku: 'EA31234',
    duty: 'LIGHT_DUTY',
    equipment_applications: [{ equipment: 'TOYOTA HILUX', engine: '2GD-FTV' }],
    vehicle_applications: [],
    enrichment_data: {},
  };
  const result = validateApplicationWrite(row);
  assert.equal(result.valid, false);
  assert.ok(result.reasons.includes('LD_EQUIPMENT_APPLICATIONS_MUST_USE_VEHICLE_MODEL'));
});

test('an observed application cannot become verified merely because a cross reference exists', () => {
  const equipment = [{ equipment: 'CAT 320', engine: 'C7.1', source: 'CROSS_REFERENCE_ONLY' }];
  const row = hdBase({ equipment_applications: equipment });
  const result = validateApplicationWrite(row, { requireEvidence: true });
  assert.equal(result.valid, false);
  assert.ok(result.reasons.includes('APPLICATION_EVIDENCE_NOT_RECORDED'));
});
