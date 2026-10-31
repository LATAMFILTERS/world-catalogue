#!/usr/bin/env node
// Cross-document engine evidence: same MANN vehicle type and vehicle identity only.
// Source-derived suggestions; never modifies the original rows, SQL or publication.
import fs from 'node:fs';
import path from 'node:path';
const dir=path.resolve(process.argv[2]||'out/hermes-mann-audit');
const src=path.join(dir,'european-application-source-rows.json');
const rows=JSON.parse(fs.readFileSync(src,'utf8'));
const key=r=>[r.make,r.type_id,r.model_series,r.model,r.manufactured_from,r.manufactured_to].map(v=>String(v||'').trim().toUpperCase()).join('\u001f');
const index=new Map();
for(const row of rows){
 if(!row.engine_code_literal||!row.type_id)continue;
 const k=key(row);if(!index.has(k))index.set(k,new Map());
 const group=index.get(k),engine=row.engine_code_literal.trim().toUpperCase();
 if(!group.has(engine))group.set(engine,[]);
 group.get(engine).push({sku:row.sku,mann_code:row.mann_code,source_url:row.source_url,source_sha256:row.source_sha256});
}
const recovered=[],ambiguous=[],unmatched=[];
for(const row of rows){
 if(row.engine_code_literal)continue;
 const group=index.get(key(row));
 const base={sku:row.sku,mann_code:row.mann_code,make:row.make,model_series:row.model_series,model:row.model,type_id:row.type_id,manufactured_from:row.manufactured_from,manufactured_to:row.manufactured_to};
 if(!group){unmatched.push({...base,status:'NO_MATCHING_MANN_VEHICLE_EVIDENCE'});continue;}
 if(group.size!==1){ambiguous.push({...base,candidate_engines:[...group.keys()],status:'MULTIPLE_ENGINES_REVIEW_REQUIRED'});continue;}
 const [engine,sources]=[...group.entries()][0];
 recovered.push({...base,engine_code_candidate:engine,evidence_sources:sources,status:'CROSS_DOCUMENT_ENGINE_CANDIDATE_REVIEW_REQUIRED'});
}
const output={total_rows:rows.length,missing_engine_rows:rows.filter(r=>!r.engine_code_literal).length,cross_document_candidates:recovered.length,ambiguous:ambiguous.length,no_matching_source:unmatched.length,certified:0,postgres_writes:0,publication:false,status:'REVIEW_REQUIRED'};
fs.writeFileSync(path.join(dir,'european-engine-evidence-candidates.json'),JSON.stringify(recovered,null,2)+'\n');
fs.writeFileSync(path.join(dir,'european-engine-evidence-ambiguous.json'),JSON.stringify(ambiguous,null,2)+'\n');
fs.writeFileSync(path.join(dir,'european-engine-evidence-unmatched.json'),JSON.stringify(unmatched,null,2)+'\n');
fs.writeFileSync(path.join(dir,'european-engine-evidence-summary.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
