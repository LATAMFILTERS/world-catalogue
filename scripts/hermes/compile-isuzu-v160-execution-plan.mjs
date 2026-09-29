#!/usr/bin/env node
import fs from 'node:fs';
const src='hermes/reports/isuzu-v160-decision-ledger.json';
const out='hermes/reports/isuzu-v160-execution-plan.json';
const doc=JSON.parse(fs.readFileSync(src,'utf8'));
const allowed=new Set(doc.allowed_decisions||[]);
const errors=[];const ready=[];const remap=[];const materialize=[];const hold=[];const retired=[];const satisfied=[];
for(const r of doc.rows||[]){
 if(!allowed.has(r.decision)){errors.push({id:r.id,error:'INVALID_DECISION'});continue}
 if(r.decision==='READY_TO_IMPLEMENT'){
  if(!r.evidence_verified||!r.evidence_authority||!r.evidence_reference) errors.push({id:r.id,error:'READY_WITHOUT_EVIDENCE'});
  else if((r.lane==='REMAP_REQUIRED'||r.lane==='RETIRE_REMAP'||r.lane==='ALIAS_REMAP_REVIEW')&&!r.owner_resolution_verified) errors.push({id:r.id,error:'WRONG_LANE_FOR_DIRECT_WRITE'});
  else ready.push(r);
 } else if(r.decision==='READY_REMAP'){
  if(!r.evidence_verified||!r.target_sku||r.target_sku===r.sku) errors.push({id:r.id,error:'INVALID_REMAP'});
  else remap.push(r);
 } else if(r.decision==='READY_MATERIALIZE') materialize.push(r);
 else if(r.decision==='RETIRED') retired.push(r);
 else if(r.decision==='SATISFIED') satisfied.push(r);
 else hold.push(r);
}
const plan={schema_version:'1.0.0',source:src,errors,summary:{
 total:(doc.rows||[]).length,ready:ready.length,remap:remap.length,materialize:materialize.length,hold:hold.length,retired:retired.length,satisfied:satisfied.length
},ready,remap,materialize,hold,retired,satisfied};
fs.writeFileSync(out,JSON.stringify(plan,null,2)+'\n');
console.log(JSON.stringify(plan.summary,null,2));
if(errors.length){console.error(JSON.stringify(errors.slice(0,20),null,2));process.exit(2)}
