'use strict';

// EBP Phase 3 — DTO/projection functions. Every read path is served by one
// of these explicit allow-list projections — never a generic row
// serialization. password_hash, token_hash, and storage_key never appear
// in any of these (ADR-0023, ADR-0027).

function toInternalBatchDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    batch_code: row.batch_code,
    manufacturer_id: row.manufacturer_id,
    purpose: row.purpose,
    channel: row.channel,
    status: row.status,
    created_at: row.created_at,
    sent_at: row.sent_at,
    response_due_at: row.response_due_at,
    timezone: row.timezone,
    delivery_language: row.delivery_language,
    requested_currency: row.requested_currency,
    template_version: row.template_version,
    created_by: row.created_by,
    identity_mechanism: row.identity_mechanism,
    internal_notes: row.internal_notes,
    updated_at: row.updated_at,
    items: Array.isArray(row.items) ? row.items.map(toInternalBatchItemDTO) : undefined,
  };
}

// Factory-facing: strips internal_notes unconditionally (ADR-0021-style
// discipline extended to Phase 3).
function toFactoryBatchDTO(row) {
  const dto = toInternalBatchDTO(row);
  if (!dto) return null;
  const { internal_notes, created_by, identity_mechanism, ...safe } = dto;
  return safe;
}

function toInternalBatchItemDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    batch_id: row.batch_id,
    passport_id: row.passport_id,
    engineering_revision: row.engineering_revision,
    elimfilters_code: row.elimfilters_code,
    manufacturer_visible_snapshot: row.manufacturer_visible_snapshot,
    status: row.status,
    responded_at: row.responded_at,
    created_at: row.created_at,
  };
}

// Factory-facing batch item DTO is identical to internal — the snapshot
// IS the Manufacturer-visible content already (ADR-0025); there is no
// additional internal-only field on a batch item to strip.
const toFactoryBatchItemDTO = toInternalBatchItemDTO;

function toInternalOfferDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    offer_code: row.offer_code,
    offer_revision: row.offer_revision,
    batch_item_id: row.batch_item_id,
    manufacturer_id: row.manufacturer_id,
    passport_id: row.passport_id,
    engineering_revision: row.engineering_revision,
    status: row.status,
    effective_status: row.effective_status,
    submitted_at: row.submitted_at,
    late_submission: row.late_submission,
    effective_from: row.effective_from,
    expires_at: row.expires_at,
    supersedes_offer_id: row.supersedes_offer_id,
    factory_user_id: row.factory_user_id,
    created_by: row.created_by,
    identity_mechanism: row.identity_mechanism,
    fob_price: row.fob_price,
    currency: row.currency,
    incoterm: row.incoterm,
    fob_point: row.fob_point,
    moq: row.moq,
    lead_time_days: row.lead_time_days,
    monthly_capacity: row.monthly_capacity,
    tooling_cost: row.tooling_cost,
    sample_cost: row.sample_cost,
    offer_validity_until: row.offer_validity_until,
    commercial_notes: row.commercial_notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    technical_fields: Array.isArray(row.technical_fields) ? row.technical_fields.map(toInternalTechnicalFieldDTO) : undefined,
    packaging: row.packaging ? toInternalPackagingDTO(row.packaging) : undefined,
  };
}

const toFactoryOfferDTO = toInternalOfferDTO;

function toInternalTechnicalFieldDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    offer_id: row.offer_id,
    field_name: row.field_name,
    offered_value: row.offered_value,
    unit: row.unit,
    tolerance: row.tolerance,
    manufacturer_note: row.manufacturer_note,
    evidence_document_id: row.evidence_document_id,
    completeness_status: row.completeness_status,
    compliance_status: row.compliance_status,
  };
}

function toInternalPackagingDTO(row) {
  if (!row) return null;
  return {
    offer_id: row.offer_id,
    recommended_quantity_per_box: row.recommended_quantity_per_box,
    box_length_mm: row.box_length_mm,
    box_width_mm: row.box_width_mm,
    box_height_mm: row.box_height_mm,
    net_weight_kg: row.net_weight_kg,
    gross_weight_kg: row.gross_weight_kg,
    protection_method: row.protection_method,
    separators_used: row.separators_used,
    palletization: row.palletization,
    units_per_pallet: row.units_per_pallet,
    observations: row.observations,
    deviation_from_target: row.deviation_from_target,
  };
}

// storage_key is deliberately never included (ADR-0027).
function toDocumentDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    manufacturer_id: row.manufacturer_id,
    batch_id: row.batch_id,
    offer_id: row.offer_id,
    technical_field_id: row.technical_field_id,
    category: row.category,
    original_filename: row.original_filename,
    mime_type: row.mime_type,
    size_bytes: row.size_bytes,
    sha256_hash: row.sha256_hash,
    review_status: row.review_status,
    created_at: row.created_at,
  };
}

// password_hash / password_algo never included (ADR-0023).
function toFactoryUserDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    manufacturer_id: row.manufacturer_id,
    email: row.email,
    full_name: row.full_name,
    role: row.role,
    status: row.status,
    last_login_at: row.last_login_at,
    invited_at: row.invited_at,
    activated_at: row.activated_at,
    created_at: row.created_at,
  };
}

module.exports = {
  toInternalBatchDTO,
  toFactoryBatchDTO,
  toInternalBatchItemDTO,
  toFactoryBatchItemDTO,
  toInternalOfferDTO,
  toFactoryOfferDTO,
  toInternalTechnicalFieldDTO,
  toInternalPackagingDTO,
  toDocumentDTO,
  toFactoryUserDTO,
};
