'use strict';
// Individually approved exception (operator 2026-11-25): EA17203 is the Kia Pregio passenger-van air filter (Light Duty even with a diesel engine). FRAM and MANN do not make it, so its code base is the
// Millard commercial code MK-7203 (known commercially as 7203). Same mechanism as EL35796 / EA33603: one SKU, one approval id, checked field by field; not a general Millard fallback.
const APPROVAL_ID = 'EA17203_MILLARD_OPERATOR_EXCEPTION_20261125';
const EVIDENCE_URL = 'https://www.millardcatalog.com/en/millard/Venezuela/air-filter/MK-7203';

function approvedEa17203MillardExceptionReady(row = {}) {
  const g = row.enrichment_data?.codigo_base_governance || {};
  const p = g.approved_manual_exception || {};
  return row.sku === 'EA17203' && row.duty === 'LIGHT_DUTY' && row.filter_type === 'air'
    && row.codigo_base === 'MK-7203' && row.canonical_source_brand === 'MILLARD' && row.canonical_source_code === 'MK-7203'
    && row.canonical_source_status === 'VERIFIED'
    && g.approved_manufacturer === 'MILLARD' && g.approved_codigo_base === 'MK-7203'
    && p.approval_id === APPROVAL_ID && p.authorized_by === 'OPERATOR' && p.evidence_url === EVIDENCE_URL;
}

module.exports = { approvedEa17203MillardExceptionReady, APPROVAL_ID, EVIDENCE_URL };
