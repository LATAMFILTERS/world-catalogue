'use strict';
// Mirror in the write gateway of the database function public.el35796_millard_exception_approved (operator 2026-11-22): EL35796 uses Millard ML-57961 as its code base because MANN does not make it
// (previously sold as EL85796; commercially known as 5796). One SKU, one approval id, checked field by field; not a general Millard fallback.
const APPROVAL_ID = 'EL35796_MILLARD_OPERATOR_EXCEPTION_20261122';
const EVIDENCE_URL = 'https://www.millardcatalog.com/en/millard/Venezuela/oil-filter/ML-57961';

function approvedEl35796MillardExceptionReady(row = {}) {
  const g = row.enrichment_data?.codigo_base_governance || {};
  const p = g.approved_manual_exception || {};
  return row.sku === 'EL35796' && row.duty === 'LIGHT_DUTY' && row.filter_type === 'oil'
    && row.codigo_base === 'ML57961' && row.canonical_source_brand === 'MILLARD' && row.canonical_source_code === 'ML57961'
    && row.canonical_source_status === 'VERIFIED'
    && g.approved_manufacturer === 'MILLARD' && g.approved_codigo_base === 'ML57961'
    && p.approval_id === APPROVAL_ID && p.authorized_by === 'OPERATOR' && p.evidence_url === EVIDENCE_URL;
}

module.exports = { approvedEl35796MillardExceptionReady, APPROVAL_ID, EVIDENCE_URL };
