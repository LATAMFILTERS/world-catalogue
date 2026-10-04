import crypto from 'node:crypto';

export function norm(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
}
export function stableId(...parts) {
  return crypto.createHash('sha256').update(parts.map((x) => String(x ?? '')).join('|')).digest('hex').slice(0, 32);
}
export const nonEmptyArray = (value) => Array.isArray(value) && value.length > 0;
export const verifiedDimensionStatus = (value) => ['VERIFIED','FULL_PRODUCT_DIMENSIONS_OFFICIAL'].includes(String(value || '').toUpperCase());
export const verifiedPackagingStatus = (value) => String(value || '').toUpperCase() === 'VERIFIED';

export function buildOrganizationIndex(organizations = []) {
  const map = new Map();
  for (const org of organizations) {
    for (const key of [org.id?.replace(/_/g,' '), org.name, org.parent_company, ...(org.aliases || [])]) {
      const n = norm(key); if (!n) continue;
      if (!map.has(n)) map.set(n, []);
      map.get(n).push({organization_id:org.id,name:org.name,category:org.category,official_domain:org.official_domain||null,status:org.status||null});
    }
  }
  return map;
}
export function manufacturerCandidates(row, exactRefs = []) {
  const gov = row.enrichment_data?.codigo_base_governance || {};
  const values = [row.canonical_source_brand,gov.approved_manufacturer,gov.fallback_manufacturer,...exactRefs.map(x=>x.brand),...(row.competitor_codes||[]).map(x=>x?.manufacturer||x?.brand),...(row.oem_codes||[]).map(x=>x?.manufacturer||x?.brand)];
  const seen=new Set(), out=[];
  for (const value of values) { const text=String(value||'').trim(), key=norm(text); if(!key||seen.has(key)) continue; seen.add(key); out.push(text); }
  return out.slice(0,12);
}
export function organizationCandidates(candidates, orgIndex) {
  const found=new Map();
  for(const candidate of candidates) for(const org of orgIndex.get(norm(candidate))||[]) found.set(org.organization_id,org);
  return [...found.values()];
}
export function assessSku(row, context={}) {
  const appVerifiedCount=Number(context.appVerifiedCount||0), exactRefs=context.exactRefs||[];
  const manufacturerIdentity=context.manufacturerIdentity||null;
  const manufacturerPriority=context.manufacturerPriority||null;
  const manufacturerIdentityStatus=String(manufacturerIdentity?.verification_status||'NOT_ASSESSED').toUpperCase();
  const manufacturerPriorityStatus=String(manufacturerPriority?.status||'NOT_ASSESSED').toUpperCase();
  const manufacturerIdentityVerified=manufacturerIdentityStatus==='VERIFIED' && manufacturerIdentity?.payload?.status==='VERIFIED';
  const sourceVerified=['VERIFIED','EXCEPTION_CONFIRMED'].includes(String(row.canonical_source_status||'').toUpperCase()) && Boolean(row.canonical_source_brand);
  const sourcePresent=Boolean(row.canonical_source_brand||row.canonical_source_code||row.canonical_source_url);
  const sourcePrimaryEvidence=sourceVerified && Boolean(row.canonical_source_url || (row.canonical_evidence && Object.keys(row.canonical_evidence).length));
  const applicationsPresent=nonEmptyArray(row.vehicle_applications)||nonEmptyArray(row.equipment_applications);
  const applicationsVerified=appVerifiedCount>0;
  const crossrefsPresent=nonEmptyArray(row.oem_codes)||nonEmptyArray(row.competitor_codes)||nonEmptyArray(row.brand_crossrefs)||exactRefs.length>0;
  const crossrefsVerified=exactRefs.length>0;
  const dimensionsPresent=[row.height_mm,row.product_length_mm,row.outer_diameter_mm,row.inner_diameter_mm,row.gasket_od_mm,row.gasket_id_mm].some(x=>x!==null&&x!==undefined);
  const dimensionsVerified=verifiedDimensionStatus(row.product_dimensions_validation_status);
  const imagePresent=Boolean(String(row.image_url||'').trim());
  const imageVerified=row.enrichment_data?.image_evidence?.verified===true || row.enrichment_data?.image_validation?.status==='VERIFIED';
  const packagingPresent=Boolean(row.units_per_case||row.unit_packaged_weight_kg||row.unit_packaged_volume_m3||row.master_carton_length_cm||row.packaging_type);
  const packagingVerified=verifiedPackagingStatus(row.packaging_validation_status);
  const technicalReady=sourceVerified&&applicationsVerified&&crossrefsVerified&&dimensionsVerified;
  const fullyVerified=technicalReady&&imageVerified&&packagingVerified;
  const gaps=[]; if(!sourceVerified)gaps.push('SOURCE'); if(!applicationsVerified)gaps.push('APPLICATIONS'); if(!crossrefsVerified)gaps.push('CROSS_REFERENCES'); if(!dimensionsVerified)gaps.push('DIMENSIONS'); if(!imageVerified)gaps.push('IMAGE'); if(!packagingVerified)gaps.push('PACKAGING');
  let readinessState='FULLY_VERIFIED';
  if(!sourceVerified)readinessState='SOURCE_PENDING'; else if(!applicationsVerified)readinessState='APPLICATION_PENDING'; else if(!crossrefsVerified)readinessState='REFERENCE_PENDING'; else if(!dimensionsVerified)readinessState='DIMENSIONS_PENDING'; else if(!imageVerified)readinessState='MEDIA_PENDING'; else if(!packagingVerified)readinessState='LOGISTICS_PENDING';
  return {sku:row.sku,duty:row.duty,technology:row.technology,filter_type:row.filter_type,manufacturer_identity_status:manufacturerIdentityStatus,manufacturer_identity_verified:manufacturerIdentityVerified,manufacturer_identity_manufacturer:manufacturerIdentity?.payload?.manufacturer||null,manufacturer_priority_status:manufacturerPriorityStatus,manufacturer_priority_required_authority:manufacturerPriority?.required_authority||null,source_present:sourcePresent,source_verified:sourceVerified,source_primary_evidence:sourcePrimaryEvidence,applications_present:applicationsPresent,applications_verified:applicationsVerified,crossrefs_present:crossrefsPresent,crossrefs_verified:crossrefsVerified,dimensions_present:dimensionsPresent,dimensions_verified:dimensionsVerified,image_present:imagePresent,image_verified:imageVerified,packaging_present:packagingPresent,packaging_verified:packagingVerified,technical_ready:technicalReady,fully_verified:fullyVerified,readiness_state:readinessState,gaps,evidence_counts:{application_verified:appVerifiedCount,exact_references:exactRefs.length}};
}
const PRIORITY={SOURCE:0,APPLICATIONS:1,CROSS_REFERENCES:1,DIMENSIONS:2,IMAGE:3,PACKAGING:4};
const ACTION={
  SOURCE:'Locate an exact official manufacturer source and create HERMES official evidence before canonical source changes.',
  APPLICATIONS:'Locate official vehicle/equipment application evidence and record verified application evidence.',
  CROSS_REFERENCES:'Validate manufacturer + part number against an official or governed exact-reference source; quarantine conflicts.',
  DIMENSIONS:'Capture official product dimensions at field level; preserve source units and normalized values.',
  IMAGE:'Locate an official product image or approved manufacturer media asset and preserve provenance.',
  PACKAGING:'Obtain official/factory packaging evidence; derived calculations remain non-verified until confirmation.'
};
export function buildBacklog(row, readiness, exactRefs, orgIndex, sourceCandidate=null) {
  const gov=row.enrichment_data?.codigo_base_governance||{};
  const governedSourceCandidate = sourceCandidate && ['READY_SOURCE_MANN','READY_SINGLE_FRAM'].includes(sourceCandidate.candidate_state) && sourceCandidate.canonical_brand && sourceCandidate.canonical_part_number ? sourceCandidate : null;
  const manufacturers=manufacturerCandidates(row,exactRefs);
  if(governedSourceCandidate && !manufacturers.some(x=>norm(x)===norm(governedSourceCandidate.canonical_brand))) manufacturers.unshift(governedSourceCandidate.canonical_brand);
  const organizations=organizationCandidates(manufacturers,orgIndex);
  return readiness.gaps.slice(0,1).map(gap=>({backlog_id:stableId(row.sku,gap),sku:row.sku,gap_type:gap,priority:PRIORITY[gap],status:'OPEN',manufacturer_candidates:manufacturers,organization_candidates:organizations,discovery_hints:{codigo_base:row.codigo_base,duty:row.duty,technology:row.technology,filter_type:row.filter_type,governance_state:gov.state||null,required_authority:gov.required_authority||null,approved_manufacturer_candidate:gov.approved_manufacturer||null,canonical_source_brand:row.canonical_source_brand||null,source_candidate_state:governedSourceCandidate?.candidate_state||null,source_candidate_brand:governedSourceCandidate?.canonical_brand||null,source_candidate_code:governedSourceCandidate?.canonical_part_number||null,source_candidate_origin_group:governedSourceCandidate?.origin_group||null,exact_reference_sources:[...new Set(exactRefs.map(x=>x.source))].slice(0,10)},recommended_action:ACTION[gap]}));
}
