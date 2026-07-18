'use strict';

// EBP Phase 2 — internal-only DTO/projection functions (ADR-0021). Every
// read path in this module is served by one of these explicit allow-list
// projections; there is no generic `SELECT *` row-serialization path
// anywhere in the Phase 2 module. No Manufacturer-facing (Factory Portal)
// or Distributor-facing projection exists in this phase — see
// docs/ebp/phases/phase-02-manufacturer-registry.md "Confidentiality".

function toInternalManufacturerDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    manufacturer_code: row.manufacturer_code,
    legal_name: row.legal_name,
    trade_name: row.trade_name,
    country_code: row.country_code,
    timezone: row.timezone,
    website: row.website,
    status: row.status,
    status_reason: row.status_reason,
    internal_notes: row.internal_notes,
    registered_on: row.registered_on,
    created_by: row.created_by, // declared_actor label, not a verified identity — see ebp/phase1/actor.js
    identity_mechanism: row.identity_mechanism,
    created_at: row.created_at,
    updated_at: row.updated_at,
    retired_at: row.retired_at,
  };
}

function toInternalStatusHistoryDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    manufacturer_id: row.manufacturer_id,
    from_status: row.from_status,
    to_status: row.to_status,
    reason: row.reason,
    evidence_reference: row.evidence_reference,
    declared_actor: row.declared_actor,
    identity_mechanism: row.identity_mechanism,
    changed_at: row.changed_at,
  };
}

function toInternalContactDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    manufacturer_id: row.manufacturer_id,
    full_name: row.full_name,
    title: row.title,
    email: row.email,
    phone: row.phone,
    preferred_language: row.preferred_language,
    is_primary: row.is_primary,
    is_technical: row.is_technical,
    is_commercial: row.is_commercial,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function toInternalLocationDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    manufacturer_id: row.manufacturer_id,
    location_code: row.location_code,
    location_type: row.location_type,
    country_code: row.country_code,
    region: row.region,
    city: row.city,
    address_line: row.address_line,
    postal_code: row.postal_code,
    timezone: row.timezone,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// row is expected to come from the ebp_manufacturer_certifications_effective
// view (ADR-0019) — effective_status is present alongside the raw status.
function toInternalCertificationDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    manufacturer_id: row.manufacturer_id,
    location_id: row.location_id,
    certification_code: row.certification_code,
    certificate_number: row.certificate_number,
    issuing_body: row.issuing_body,
    issued_on: row.issued_on,
    expires_on: row.expires_on,
    status: row.status,
    effective_status: row.effective_status,
    evidence_reference: row.evidence_reference,
    scope: row.scope,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function toInternalCapabilityDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    manufacturer_id: row.manufacturer_id,
    location_id: row.location_id,
    capability_type: row.capability_type,
    capability_value: row.capability_value,
    review_status: row.review_status,
    declared_at: row.declared_at,
    verified_at: row.verified_at,
    verified_by: row.verified_by,
    expires_on: row.expires_on,
    notes: row.notes,
  };
}

function toInternalQualificationConditionDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    qualification_id: row.qualification_id,
    condition_type: row.condition_type,
    parameters: row.parameters,
    is_satisfied: row.is_satisfied,
    satisfied_at: row.satisfied_at,
    notes: row.notes,
    created_at: row.created_at,
  };
}

// row.conditions, if present, is an array of raw condition rows.
function toInternalQualificationDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    manufacturer_id: row.manufacturer_id,
    location_id: row.location_id,
    product_category: row.product_category,
    product_subtype: row.product_subtype,
    status: row.status,
    effective_from: row.effective_from,
    review_due_on: row.review_due_on,
    approved_by: row.approved_by,
    evidence_reference: row.evidence_reference,
    created_at: row.created_at,
    updated_at: row.updated_at,
    conditions: Array.isArray(row.conditions) ? row.conditions.map(toInternalQualificationConditionDTO) : [],
  };
}

module.exports = {
  toInternalManufacturerDTO,
  toInternalStatusHistoryDTO,
  toInternalContactDTO,
  toInternalLocationDTO,
  toInternalCertificationDTO,
  toInternalCapabilityDTO,
  toInternalQualificationDTO,
  toInternalQualificationConditionDTO,
};
