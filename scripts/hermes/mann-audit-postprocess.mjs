#!/usr/bin/env node
// Offline reconciliation of previously captured MANN audit evidence. No SQL, network, catalogue writes.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(process.argv[2]||'out/hermes-mann-audit');
const folders=fs.readdirSync(root,{withFileTypes:true}).filter(d=>d.isDirectory()&&fs.existsSync(path.join(root,d.name,'manifest.json'))).map(d=>path.join(root,d.name)).sort((a,b)=>Number(/batch-(\d+)/.exec(a)?.[1]||0)-Number(/batch-(\d+)/.exec(b)?.[1]||0));
if(!folders.length)throw Error('NO_MANN_AUDIT_MANIFESTS');
const records=[],technical=[],failures=[];
for(const folder of folders){
 const manifest=JSON.parse(fs.readFileSync(path.join(folder,'manifest.json'),'utf8'));
 if(!Array.isArray(manifest.records))throw Error('INVALID_AUDIT_MANIFEST '+folder);
 records.push(...manifest.records);
 const captured=manifest.records.filter(r=>r.result==='EVIDENCE_CAPTURED');
 if(!captured.length)continue;
 const run=spawnSync(process.execPath,['scripts/hermes/ten-sku-offline-review.mjs',folder],{encoding:'utf8',maxBuffer:8*1024*1024,timeout:120000});
 if(run.status!==0){failures.push({folder,error:String(run.stderr||run.error?.message||'UNKNOWN').slice(0,600)});continue;}
 const summary=JSON.parse(fs.readFileSync(path.join(folder,'technical-summary-integrated.json'),'utf8'));
 technical.push(...summary.results);
}
const failureRows=records.filter(r=>r.result!=='EVIDENCE_CAPTURED').map(r=>({sku:r.sku,mann_code:r.canonical_base_claim,reason:r.result,attempts:r.attempts||[]}));
const byReason=Object.fromEntries([...new Set(failureRows.map(r=>r.reason))].sort().map(k=>[k,failureRows.filter(r=>r.reason===k).length]));
const unique=new Set(records.map(r=>r.sku));
const output={status:failures.length?'PARTIAL_REVIEW':'REVIEW_REQUIRED',processed:records.length,unique_skus:unique.size,mann_pages_confirmed:records.filter(r=>r.result==='EVIDENCE_CAPTURED').length,not_confirmed:failureRows.length,failures_by_reason:byReason,technical_extracted:technical.length,with_dimensions:technical.filter(r=>r.dimension_fields>0).length,with_oem:technical.filter(r=>r.oem_codes>0).length,with_structured_applications:technical.filter(r=>r.applications>0).length,competitor_codes_verified:0,certified:0,postgres_writes:0,publication:false,batch_errors:failures};
fs.writeFileSync(path.join(root,'audit-summary.json'),JSON.stringify(output,null,2)+'\n');
fs.writeFileSync(path.join(root,'not-confirmed.json'),JSON.stringify(failureRows,null,2)+'\n');
fs.writeFileSync(path.join(root,'technical-summary.json'),JSON.stringify(technical,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
if(failures.length||unique.size!==records.length)process.exitCode=2;
