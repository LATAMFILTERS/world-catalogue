'use strict';

const crypto = require('crypto');

const APPLICATION_POLICY_VERSION = '2026-08-19-app-v1';
const APPLICATION_KINDS = new Set(['EQUIPMENT', 'VEHICLE', 'ENGINE']);

function normalizeText(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

function normalizedApplication(entry = {}) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
  return {
    make: normalizeText(entry.make || entry.manufacturer || entry.brand),
    model: normalizeText(entry.model),
    equipment: normalizeText(entry.equipment || entry.vehicle || entry.application),
    type: normalizeText(entry.type || entry.equipment_type || entry.vehicle_type),
    engine: normalizeText(entry.engine || entry.engine_model || entry.motor),
    year: normalizeText(entry.year),
    year_from: normalizeText(entry.year_from || entry.from_year),
    year_to: normalizeText(entry.year_to || entry.to_year),
  };
}

function stableApplicationPayload(value) {
  const rows = Array.isArray(value) ? value : [];
  return rows
    .map(normalizedApplication)
    .filter(Boolean)
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
}

function applicationPayloadHash(value) {
  return crypto.createHash('md5').update(JSON.stringify(stableApplicationPayload(value))).digest('hex');
}

function engineApplicationsFrom(value) {
  return stableApplicationPayload(value).filter((entry) => entry.engine);
}

function validateEntry(entry, kind) {
  const normalized = normalizedApplication(entry);
  const reasons = [];
  if (!normalized) return ['APPLICATION_ENTRY_NOT_OBJECT'];

  if (kind === 'EQUIPMENT') {
    if (!normalized.equipment && !(normalized.make && normalized.model)) reasons.push('EQUIPMENT_IDENTITY_MISSING');
  }
  if (kind === 'VEHICLE') {
    if (!(normalized.make && normalized.model) && !normalized.equipment) reasons.push('VEHICLE_IDENTITY_MISSING');
  }
  if (kind === 'ENGINE' && !normalized.engine) reasons.push('ENGINE_IDENTITY_MISSING');

  return reasons;
}

function applicationGovernanceFrom(row = {}) {
  const data = row.enrichment_data && typeof row.enrichment_data === 'object' && !Array.isArray(row.enrichment_data)
    ? row.enrichment_data
    : {};
  return data.application_governance && typeof data.application_governance === 'object' && !Array.isArray(data.application_governance)
    ? data.application_governance
    : {};
}

function validateApplicationWrite(row = {}, options = {}) {
  const duty = String(row.duty || '').toUpperCase();
  const equipment = Array.isArray(row.equipment_applications) ? row.equipment_applications : [];
  const vehicles = Array.isArray(row.vehicle_applications) ? row.vehicle_applications : [];
  const engines = [...engineApplicationsFrom(equipment), ...engineApplicationsFrom(vehicles)];
  const gov = applicationGovernanceFrom(row);
  const reasons = [];

  if (row.equipment_applications != null && !Array.isArray(row.equipment_applications)) reasons.push('EQUIPMENT_APPLICATIONS_NOT_ARRAY');
  if (row.vehicle_applications != null && !Array.isArray(row.vehicle_applications)) reasons.push('VEHICLE_APPLICATIONS_NOT_ARRAY');

  if (duty === 'HEAVY_DUTY' && vehicles.length) reasons.push('HD_VEHICLE_APPLICATIONS_MUST_USE_EQUIPMENT_MODEL');
  if (duty === 'LIGHT_DUTY' && equipment.length) reasons.push('LD_EQUIPMENT_APPLICATIONS_MUST_USE_VEHICLE_MODEL');

  for (const entry of equipment) reasons.push(...validateEntry(entry, 'EQUIPMENT'));
  for (const entry of vehicles) reasons.push(...validateEntry(entry, 'VEHICLE'));
  for (const entry of engines) reasons.push(...validateEntry(entry, 'ENGINE'));

  const requireEvidence = options.requireEvidence === true;
  if (requireEvidence && (equipment.length || vehicles.length)) {
    if (gov.policy_version !== APPLICATION_POLICY_VERSION) reasons.push('APPLICATION_POLICY_VERSION_MISSING');
    if (gov.evidence_recorded !== true) reasons.push('APPLICATION_EVIDENCE_NOT_RECORDED');
    if (!normalizeText(gov.evidence_authority)) reasons.push('APPLICATION_EVIDENCE_AUTHORITY_MISSING');

    if (equipment.length) {
      if (gov.equipment_verified !== true) reasons.push('EQUIPMENT_APPLICATION_NOT_VERIFIED');
      if (gov.equipment_payload_hash !== applicationPayloadHash(equipment)) reasons.push('EQUIPMENT_PAYLOAD_HASH_MISMATCH');
    }
    if (vehicles.length) {
      if (gov.vehicle_verified !== true) reasons.push('VEHICLE_APPLICATION_NOT_VERIFIED');
      if (gov.vehicle_payload_hash !== applicationPayloadHash(vehicles)) reasons.push('VEHICLE_PAYLOAD_HASH_MISMATCH');
    }
    if (engines.length) {
      if (gov.engine_verified !== true) reasons.push('ENGINE_APPLICATION_NOT_VERIFIED');
      const engineSource = equipment.length ? equipment : vehicles;
      if (gov.engine_payload_hash !== applicationPayloadHash(engineSource)) reasons.push('ENGINE_PAYLOAD_HASH_MISMATCH');
    }
  }

  return {
    valid: reasons.length === 0,
    policy_version: APPLICATION_POLICY_VERSION,
    reasons: [...new Set(reasons)],
    equipment_count: equipment.length,
    vehicle_count: vehicles.length,
    engine_count: engines.length,
    equipment_payload_hash: equipment.length ? applicationPayloadHash(equipment) : null,
    vehicle_payload_hash: vehicles.length ? applicationPayloadHash(vehicles) : null,
    engine_payload_hash: engines.length ? applicationPayloadHash(equipment.length ? equipment : vehicles) : null,
    model: 'APPLICATIONS_REQUIRE_EXPLICIT_EVIDENCE__NO_CROSS_REFERENCE_INHERITANCE',
  };
}

function assertApplicationWrite(row = {}, options = {}) {
  const result = validateApplicationWrite(row, options);
  if (!result.valid) {
    const error = new Error(`CATALOG_APPLICATION_GATEWAY_BLOCKED: ${result.reasons.join(',')}`);
    error.code = 'CATALOG_APPLICATION_GATEWAY_BLOCKED';
    error.validation = result;
    throw error;
  }
  return result;
}

module.exports = {
  APPLICATION_POLICY_VERSION,
  APPLICATION_KINDS,
  normalizeText,
  normalizedApplication,
  stableApplicationPayload,
  applicationPayloadHash,
  engineApplicationsFrom,
  applicationGovernanceFrom,
  validateApplicationWrite,
  assertApplicationWrite,
};
