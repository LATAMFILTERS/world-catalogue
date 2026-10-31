#!/usr/bin/env node
// Read-only evidence assessment, no promotion, no SQL, no network.
import fs from 'node:fs';
import path from 'node:path';
const audit=path.resolve(process.argv[2]||'out/hermes-mann-audit');
const recovered=path.resolve(process.argv[3]||'out/hermes-mann-recovered-technical');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sources=[
 {kind:'original',dir:audit,rows:read(path.join(audit,'technical-summary.json'))},
 {kind:'recovered',dir:recovered,rows:read(path.join(recovered,'technical-summary-integrated.json')).results}
];
const recordBySku=new Map(),engineMissing=[];
for(const source of sources){
 for(const summary of source.rows){
  const sku=summary.sku;
  // Original batch detail is kept in the recorded batch, not in the root.
  let detail=null;
  if(source.kind==='recovered')detail=read(path.join(source.dir,summary.report));
  else{
   const folders=fs.readdirSync(audit,{withFileTypes:true}).filter(d=>d.isDirectory()&&d.name.startsWith('batch-'));
   for(const folder of folders){const f=path.join(audit,folder.name,sku+'.technical-review-integrated.json');if(fs.existsSync(f)){detail=read(f);break;}}
  }
  if(!detail)throw Error('MISSING_TECHNICAL_SOURCE '+sku);
  if(recordBySku.has(sku))throw Error('DUPLICATE_SKU '+sku);
  const apps=detail.application_rows||[];
  const european=apps.filter(r=>r.origin_is_european);
  const missing=european.filter(r=>!String(r.engine_code_literal||'').trim());
  const axes={dimensions:Boolean(summary.dimension_fields),oem:Boolean(summary.oem_codes),mann_identity:detail.source_page_identity_observed===true,
    european_fitment_count:european.length,engine_unpublished_count:missing.length};
  recordBySku.set(sku,{sku,mann_code:summary.mann_part,source_kind:source.kind,evidence:detail.evidence,axes,
   equivalence_status:'ELIMFILTERS_MANN_EQUIVALENCE_NOT_INDEPENDENTLY_VERIFIED',certification:'REVIEW_REQUIRED'});
  for(const row of missing)engineMissing.push({sku,mann_code:summary.mann_part,make:row.make,model:row.model,vehicle_type_id:row.vehicle_type_id||null,source_year_literal:row.source_year_literal||null,
   source_url:row.source_url,source_sha256:row.source_sha256,reason:'ENGINE_NOT_PUBLISHED',status:'REVIEW_REQUIRED'});
 }
}
const records=[...recordBySku.values()];
const report={sku_reviewed:records.length,mann_identity_present:records.filter(r=>r.axes.mann_identity).length,
 dimensional_evidence:records.filter(r=>r.axes.dimensions).length,oem_evidence:records.filter(r=>r.axes.oem).length,
 european_fitment_skus:records.filter(r=>r.axes.european_fitment_count>0).length,missing_engine_european_rows:engineMissing.length,
 mapping_evidence_sufficient_for_certification:0,certified:0,postgres_writes:0,publication:false,status:'REVIEW_REQUIRED'};
fs.writeFileSync(path.join(audit,'mann-evidence-readiness-by-sku.json'),JSON.stringify(records,null,2)+'\n');
fs.writeFileSync(path.join(audit,'mann-engine-missing-source-rows.json'),JSON.stringify(engineMissing,null,2)+'\n');
fs.writeFileSync(path.join(audit,'mann-evidence-readiness-summary.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
