'use strict';
// Individually approved preservation of an existing OEM identity; not a general FRAM fallback.
const APPROVAL_ID='EA33603_KIA_OEM_PRESERVATION_OPERATOR_20261013';
const ORIGINAL_SHA256='1a835d9427f143d85620514d6dbe09e080568cfd88bf181a7f12c6f0f3abcace';
function approvedEa33603OemPreservationReady(row={}) {
  const g=row.enrichment_data?.codigo_base_governance||{},p=g.approved_oem_preservation||{};
  return row.id===65522&&row.sku==='EA33603'&&row.duty==='LIGHT_DUTY'&&row.filter_type==='air'
    &&row.codigo_base==='OK6B0-23-603'&&row.canonical_source_brand==='KIA'&&row.canonical_source_code==='OK6B0-23-603'
    &&row.canonical_source_status==='VERIFIED'&&g.origin_group==='NON_EUROPEAN'&&g.approved_manufacturer==='KIA'
    &&g.approved_codigo_base==='OK6B0-23-603'&&g.approved_source_column==='OEM_CODES'
    &&g.primary_manufacturer_verified===false&&g.fram_absence_verified===false
    &&g.fallback_manufacturer_verified===true&&g.fallback_commercial_code_verified===true
    &&p.approval_id===APPROVAL_ID&&p.original_row_sha256===ORIGINAL_SHA256&&p.authorized_by==='OPERATOR'
    &&p.evidence_url==='https://azfilter.jp/catalogue/498313';
}
module.exports={approvedEa33603OemPreservationReady,APPROVAL_ID,ORIGINAL_SHA256};
