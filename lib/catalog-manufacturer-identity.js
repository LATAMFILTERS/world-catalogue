'use strict';

const crypto = require('node:crypto');

function normalizeCode(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function isExactFleetguardProductEvidence(row, evidence) {
  const current = normalizeCode(row.current_codigo_base || row.codigo_base);
  const evidenceCode = normalizeCode(evidence?.normalized_reference || evidence?.reference_code);
  let source;
  try { source = new URL(evidence?.source_url); } catch (_) { return false; }

  return Boolean(
    current &&
    normalizeCode(row.current_codigo_base) === normalizeCode(row.codigo_base) &&
    evidence?.manufacturer === 'FLEETGUARD' &&
    evidence?.authority === 'FLEETGUARD_OFFICIAL_PRODUCT_SITEMAP' &&
    evidence?.evidence_kind === 'OFFICIAL_PRODUCT_SITEMAP' &&
    evidenceCode === current &&
    evidence?.evidence_hash &&
    evidence?.verified_at &&
    source.protocol === 'https:' &&
    source.hostname === 'www.fleetguard.com' &&
    /^\/product\//i.test(source.pathname)
  );
}

function buildManufacturerIdentityRecord(row, evidence = null) {
  const verified = Boolean(evidence && isExactFleetguardProductEvidence(row, evidence));
  const payload = verified
    ? {
        status: 'VERIFIED',
        manufacturer: 'FLEETGUARD',
        code: row.current_codigo_base,
        identity_scope: 'MANUFACTURER_CODE_EXISTS_IN_OFFICIAL_PRODUCT_CATALOG',
        canonical_elimfilters_identity: false,
        equivalence_approved: false,
        applications_approved: false,
        publication_approved: false,
        manufacturer_priority_status: 'PENDING',
        priority_manufacturer: 'DONALDSON',
        priority_required_authority: 'EXPLICIT_DONALDSON_MANUFACTURING_ABSENCE',
        donaldson_absence_verified: false,
      }
    : {
        status: 'REVIEW_REQUIRED',
        manufacturer: null,
        code: row.current_codigo_base,
        reason: 'NO_EXACT_OFFICIAL_PRODUCT_EVIDENCE_FOR_CURRENT_CODE',
        manufacturer_priority_status: 'PENDING',
        priority_manufacturer: 'DONALDSON',
        priority_required_authority: 'EXPLICIT_DONALDSON_MANUFACTURING_ABSENCE',
        donaldson_absence_verified: false,
        equivalence_approved: false,
        applications_approved: false,
        publication_approved: false,
      };
  const sourceHash = verified ? evidence.evidence_hash : null;
  const evidenceId = crypto.createHash('sha256')
    .update(['HERMES_MANUFACTURER_IDENTITY_V1', row.sku, payload.status, row.current_codigo_base, sourceHash || ''].join('|'))
    .digest('hex');

  return {
    evidence_id: evidenceId,
    sku: row.sku,
    field_group: 'MANUFACTURER_IDENTITY',
    field_name: 'documented_manufacturer_code_identity',
    authority: verified ? evidence.authority : null,
    source_type: verified ? 'CATALOG_CODIGO_BASE_EVIDENCE' : 'NO_EXACT_PRODUCT_EVIDENCE',
    source_url: verified ? evidence.source_url : null,
    source_hash: sourceHash,
    verification_status: verified ? 'VERIFIED' : 'REVIEW_REQUIRED',
    payload,
    provenance: verified
      ? { source_table: 'catalog_codigo_base_evidence', source_id: evidence.id, source_kind: evidence.evidence_kind, normalized_reference: evidence.normalized_reference, queue_state: row.governance_state, required_authority: row.required_authority }
      : { source_table: 'catalog_codigo_base_sanitation_queue', queue_state: row.governance_state, required_authority: row.required_authority, alternate_references_are_not_identity_proof: true },
    captured_at: verified ? evidence.verified_at : null,
  };
}

module.exports = { normalizeCode, isExactFleetguardProductEvidence, buildManufacturerIdentityRecord };
