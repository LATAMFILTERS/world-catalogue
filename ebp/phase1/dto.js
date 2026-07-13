'use strict';

// EBP Phase 1 — role-scoped DTO/projection functions (ADR-0009). Only the
// internal projection is wired to a live endpoint in Phase 1; the
// Manufacturer and Distributor projections are implemented and tested here
// so Phases 3 and 8 can reuse them without redesigning the shape, per
// docs/ebp/phases/phase-01-product-engineering-passport.md.
//
// `row` is the composed object produced by repository.fetchPassportRow():
// the ebp_engineering_passports columns plus `engineering` and `packaging`
// sub-objects (or null if not yet written).

function toInternalPassportDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    elimfilters_code: row.elimfilters_code,
    is_pre_sku_draft: row.is_pre_sku_draft,
    base_code: row.base_code,
    base_brand: row.base_brand,
    product_category: row.product_category,
    product_subtype: row.product_subtype,
    duty: row.duty,
    technology_code: row.technology_code,
    engineering_revision: row.engineering_revision,
    status: row.status,
    supersedes_passport_id: row.supersedes_passport_id,
    created_by: row.created_by,
    created_at: row.created_at,
    activated_at: row.activated_at,
    superseded_at: row.superseded_at,
    engineering: row.engineering ? { ...row.engineering } : null,
    packaging: row.packaging ? { ...row.packaging } : null,
  };
}

// Manufacturer-facing: excludes internal_engineering_notes unconditionally.
// Callers (Phase 3) are responsible for checking the Manufacturer was
// actually sent this Passport before calling this projection at all — see
// ADR-0009. This function only guarantees the *shape* is safe once that
// eligibility check has passed.
function toManufacturerPassportDTO(row) {
  const dto = toInternalPassportDTO(row);
  if (!dto) return null;
  if (dto.engineering) {
    const { internal_engineering_notes, ...safeEngineering } = dto.engineering;
    dto.engineering = safeEngineering;
  }
  return dto;
}

// Distributor-facing: locked identification only. No engineering detail, no
// packaging detail, no note field of any kind — per BUSINESS_RULES.md §11.
function toDistributorPassportDTO(row) {
  if (!row) return null;
  return {
    elimfilters_code: row.elimfilters_code,
    product_category: row.product_category,
    product_subtype: row.product_subtype,
    duty: row.duty,
    technology_code: row.technology_code,
  };
}

module.exports = { toInternalPassportDTO, toManufacturerPassportDTO, toDistributorPassportDTO };
