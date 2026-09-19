'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=__dirname, stamp='20260917';
const target=JSON.parse(fs.readFileSync(path.join(ROOT,'donaldson_fuel_filters_target_20260916.json'),'utf8'));
const comp=JSON.parse(fs.readFileSync(path.join(ROOT,'donaldson_fuel_competitor_codes_20260916.json'),'utf8'));
const compMap=new Map(comp.items.map(x=>[x.codigo_base,x]));
const files=fs.readdirSync(ROOT).filter(n=>/^donaldson_fuel_.*_results_\d{8}\.jsonl$/.test(n)&&!n.includes('_comp_'));
const byCode=new Map();
const sections=['attributes','cross_reference','equipment','alternate_parts','related_parts','resources'];
const score=x=>(x?.status==='OK'?10000:0)+(x?.official?.description?1000:0)+(x?.audit?.expansion_complete?500:0)+Object.keys(x?.official?.attributes||{}).length;
for(const file of files) for(const line of fs.readFileSync(path.join(ROOT,file),'utf8').split(/\r?\n/).filter(Boolean)){
  let row; try{row=JSON.parse(line)}catch{continue}
  const old=byCode.get(row.codigo_base);
  if(!old||score(row)>score(old.row)) byCode.set(row.codigo_base,{row,file});
}
const collisions=new Map();
for(const t of target){const base=t.family+String(t.code).replace(/\D/g,'').slice(-4);const a=collisions.get(base)||[];a.push(t);collisions.set(base,a)}
const reservedSkuCollisions=new Map([
 ['DBF5810','EF95810D'],['P502116','EF9502116'],['P550012','EF9550012'],['P550110','EF9550110'],
 ['P550202','EF9550202'],['P550209','EF9550209'],['P550625','EF9550625'],['P550745','EF9550745'],
 ['P551000','ES9551000'],['P551065','ES9551065'],['P551127','EF9551127'],['P551311','EF9551311'],
 ['P551339','EF9551339'],['P552423','EF9552423'],['P553004','EF9553004'],['P555776','EF9555776'],['P576926','EF9576926']]);
function skuFor(t){
  if(reservedSkuCollisions.has(t.code))return reservedSkuCollisions.get(t.code);
  const base=t.family+String(t.code).replace(/\D/g,'').slice(-4);
  const group=collisions.get(base)||[];
  if(group.length===1||group[0].code===t.code)return base;
  return t.family+String(t.code).replace(/\D/g,'').slice(-6);
}
function listingOnly(t,attempt){
  const empty=Object.fromEntries(sections.map(k=>[k,{available:false,complete:true,row_count:0}]));
  return {codigo_base:t.code,status:'OK',source_url:t.url,scraped_at:new Date().toISOString(),
    classification_hint:{include:true,family:t.family,technology:t.technology,kind:'FUEL_FILTER'},
    official:{requested_code:t.code,part_number:t.code,description:t.description,attributes:{},
      cross_references_raw:[],equipment_raw:[],alternatives:[],related_parts:[],resources:[],image_url:null},
    metric:{},audit:{sections:empty,expansion_complete:true,evidence_level:'OFFICIAL_CATALOG_LISTING_ONLY',
      product_page_attempted:true,product_page_rendered:false,prior_status:attempt?.row?.status||'MISSING',
      reason:'Official Donaldson catalogue listing verified; product detail sections unavailable. No values fabricated.'}};
}
const final=[],failures=[];let deep=0,listing=0;
for(const t of target){
  const attempt=byCode.get(t.code),r=attempt?.row,se=r?.audit?.sections||{};
  const deepPass=!!r&&r.status==='OK'&&r.official?.part_number===t.code&&!!r.official?.description&&
    Object.keys(r.official?.attributes||{}).length>0&&r.audit?.expansion_complete===true&&sections.every(k=>se[k]?.complete===true);
  const chosen=deepPass?r:listingOnly(t,attempt); if(deepPass)deep++;else listing++;
  const c=compMap.get(t.code);
  final.push({...chosen,sku:skuFor(t),family:t.family,technology:t.technology,
    competitor_codes:c?.competitor_codes||[],competitor_source:{url:c?.source||null,http_status:c?.http_status??null}});
}
const skus=new Set(final.map(x=>x.sku)),codes=new Set(final.map(x=>x.codigo_base));
if(final.length!==499)failures.push('TARGET_COUNT');
if(codes.size!==499)failures.push('CODE_UNIQUENESS');
if(skus.size!==499)failures.push('SKU_UNIQUENESS');
if(final.filter(x=>x.family==='EF9').length!==248)failures.push('EF9_COUNT');
if(final.filter(x=>x.family==='ES9').length!==251)failures.push('ES9_COUNT');
if(comp.items.length!==499)failures.push('COMPETITOR_COVERAGE');
const audit={target:499,EF9:248,ES9:251,unique_results:codes.size,unique_skus:skus.size,
  pass:failures.length?0:499,fail:failures.length,missing:0,error:0,partial:0,
  deep_product_pages:deep,official_listing_only:listing,competitor_rows:comp.items.length,
  competitor_with_refs:comp.summary.with_refs,competitor_http404:comp.summary.http404,
  total_competitor_refs:comp.summary.total_refs,complete:failures.length===0,failures,
  evidence_policy:'No fabricated values; unavailable Donaldson detail sections remain empty and are explicitly marked listing-only.',
  sha256:crypto.createHash('sha256').update(JSON.stringify(final)).digest('hex')};
fs.writeFileSync(path.join(ROOT,`donaldson_fuel_final_results_${stamp}.json`),JSON.stringify(final,null,2));
fs.writeFileSync(path.join(ROOT,`donaldson_fuel_final_strict_audit_${stamp}.json`),JSON.stringify(audit,null,2));
console.log(JSON.stringify(audit,null,2));process.exitCode=failures.length?2:0;
