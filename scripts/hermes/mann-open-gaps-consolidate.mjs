#!/usr/bin/env node
// Consolidate only open MANN gaps from the already reviewed recovered captures.
// Never re-fetches, guesses an engine, or writes to catalog/DB.
import fs from 'node:fs';
import path from 'node:path';
const audit=path.resolve(process.argv[2]||'out/hermes-mann-audit');
const recovery=path.resolve(process.argv[3]||'out/hermes-mann-official-recovery');
const technical=path.resolve(process.argv[4]||'out/hermes-mann-recovered-technical');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const ledger=read(path.join(recovery,'ledger.json'));
const independent=read(path.join(recovery,'independent-review.json'));
const review=read(path.join(technical,'technical-summary-integrated.json'));
const oldRows=read(path.join(audit,'european-application-source-rows.json'));
const unresolved=Object.values(ledger).filter(r=>!r.candidate).map(r=>({sku:r.sku,mann_code:r.mann_code_claim,prior_attempts:r.attempts||[],status:'OFFICIAL_CATALOG_LOOKUP_REQUIRED'}));
const identity=new Map(independent.map(r=>[r.sku,r.status]));
const resultBySku=new Map(review.results.map(r=>[r.sku,r]));
const recovered=[];
for(const row of Object.values(ledger)){
 if(!row.candidate||identity.get(row.sku)!=='MANN_IDENTITY_RECONFIRMED_MAPPING_REVIEW_REQUIRED')continue;
 const part=resultBySku.get(row.sku);
 if(!part)throw Error('MISSING_TECHNICAL_REVIEW '+row.sku);
 const detail=read(path.join(technical,part.report));
 const european=detail.application_rows.filter(r=>r.origin_is_european);
 recovered.push(...european.filter(r=>!r.engine_code_literal).map(r=>({sku:row.sku,mann_code:row.mann_code_claim,make:r.make,model:r.model,source_year_literal:r.source_year_literal,vehicle_type_id:r.vehicle_type_id,source_url:r.source_url,source_sha256:r.source_sha256,source_vehicle_record:r,status:'MANN_ENGINE_NOT_PUBLISHED_REVIEW_REQUIRED'})));
}
const missingOld=oldRows.filter(r=>!r.engine_code_literal).map(r=>({sku:r.sku,mann_code:r.mann_code,make:r.make,model:r.model,source_url:r.source_url,source_sha256:r.source_sha256,source_vehicle_record:r,status:'MANN_ENGINE_NOT_PUBLISHED_REVIEW_REQUIRED'}));
const engineRows=[...missingOld.map((r,i)=>({...r,source_dataset:'ORIGINAL_MANN',source_row_index:i})),...recovered.map((r,i)=>({...r,source_dataset:'RECOVERED_MANN',source_row_index:i}))];
// Never discard distinct applications. Group only for investigation, and retain every source row.
const groups=new Map();
for(const row of engineRows){
 const key=JSON.stringify([row.sku,row.mann_code,row.make,row.model,row.source_sha256]);
 if(!groups.has(key))groups.set(key,[]);
 groups.get(key).push(row);
}
const collapsedGroups=[...groups.values()].filter(g=>g.length>1);
const vehicleSignature=r=>JSON.stringify(r.source_vehicle_record||{});
const suspectCollisions=collapsedGroups.map(g=>{
 const signatures=new Set(g.map(vehicleSignature));
 return {key:{sku:g[0].sku,mann_code:g[0].mann_code,make:g[0].make,model:g[0].model,source_sha256:g[0].source_sha256},classification:signatures.size===1?'IDENTICAL_SOURCE_VEHICLE_FIELDS':'DISTINCT_SOURCE_VEHICLE_FIELDS',distinct_vehicle_records:signatures.size,rows:g};
});
const identicalSourceGroups=suspectCollisions.filter(g=>g.classification==='IDENTICAL_SOURCE_VEHICLE_FIELDS').length;
const differentSourceGroups=suspectCollisions.length-identicalSourceGroups;
const counts={unresolved_mann_products:unresolved.length,independent_mann_products:independent.filter(r=>r.status==='MANN_IDENTITY_RECONFIRMED_MAPPING_REVIEW_REQUIRED').length,
reviewed_recovered_products:review.results.length,missing_engine_original:missingOld.length,missing_engine_recovered:recovered.length,unique_grouping_keys:groups.size,grouping_collisions:engineRows.length-groups.size,collision_groups:collapsedGroups.length,identical_source_field_groups:identicalSourceGroups,distinct_source_field_groups:differentSourceGroups,retained_engine_rows:engineRows.length,
status:'REVIEW_REQUIRED',certified:0,postgres_writes:0,publication:false};
fs.writeFileSync(path.join(audit,'mann-36-unresolved.json'),JSON.stringify(unresolved,null,2)+'\n');
fs.writeFileSync(path.join(audit,'mann-engine-open-gaps-all.json'),JSON.stringify(engineRows,null,2)+'\n');
fs.writeFileSync(path.join(audit,'mann-engine-grouping-collisions.json'),JSON.stringify(suspectCollisions,null,2)+'\n');
fs.writeFileSync(path.join(audit,'mann-open-gaps-summary.json'),JSON.stringify(counts,null,2)+'\n');
console.log(JSON.stringify(counts,null,2));
