'use strict';
const {normalizeCode,normalizeManufacturer,lastFourNumeric,governanceFrom}=require('./catalog-codigo-base-policy');
const {assertGovernedCatalogPatch}=require('./catalog-write-gateway');
function officialDonaldsonUrl(value){try{const u=new URL(value);return u.protocol==='https:'&&(u.hostname==='donaldson.com'||u.hostname.endsWith('.donaldson.com'));}catch{return false;}}
function qualifyNaturalRemap(row,target,evidence=[],occupied=[]){
 const reasons=[];const prefix=['EA1','EA2','EF9','EL8','EH6'].find(p=>String(row.sku||'').startsWith(p));const suffix=lastFourNumeric(row.codigo_base);
 if(!prefix||!suffix||target!==prefix+suffix)reasons.push('SKU_NUMERIC_SUFFIX_INVALID');
 if(occupied.some(r=>r.sku===target))reasons.push('TARGET_OCCUPIED');
 const gov=governanceFrom(row);
 if(row.duty!=='HEAVY_DUTY'||gov.primary_manufacturer_verified!==true||normalizeManufacturer(row.canonical_source_brand)!=='DONALDSON'||row.canonical_source_status!=='VERIFIED'||normalizeCode(row.canonical_source_code)!==normalizeCode(row.codigo_base))reasons.push('VERIFIED_DONALDSON_CANONICAL_IDENTITY_REQUIRED');
 const match=evidence.some(e=>e.sku===row.sku&&normalizeManufacturer(e.manufacturer)==='DONALDSON'&&normalizeCode(e.reference_code)===normalizeCode(row.codigo_base)&&/^OFFICIAL_/.test(e.evidence_kind||'')&&Number.isFinite(Date.parse(e.verified_at))&&/^[a-f0-9]{64}$/i.test(e.evidence_hash||'')&&officialDonaldsonUrl(e.source_url));
 if(!match)reasons.push('COMPLETE_OFFICIAL_BASE_EVIDENCE_REQUIRED');
 try{assertGovernedCatalogPatch(row,{sku:target},{validateApplications:false});}catch(e){reasons.push('GATEWAY_REJECTED:'+e.message);}
 return {ready:reasons.length===0,source_sku:row.sku,target,reasons};
}
module.exports={qualifyNaturalRemap};
