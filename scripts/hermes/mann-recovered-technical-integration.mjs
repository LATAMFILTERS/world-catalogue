#!/usr/bin/env node
// Integrate only independently reconfirmed recovered MANN captures with the existing
// offline technical reviewer. No network, SQL, catalogue mutation, or certification.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

const recoveryDir=path.resolve(process.argv[2]||'out/hermes-mann-official-recovery');
const outputDir=path.resolve(process.argv[3]||'out/hermes-mann-recovered-technical');
const ledger=JSON.parse(fs.readFileSync(path.join(recoveryDir,'ledger.json'),'utf8'));
const independent=JSON.parse(fs.readFileSync(path.join(recoveryDir,'independent-review.json'),'utf8'));
const confirmed=new Map(independent.filter(r=>r.status==='MANN_IDENTITY_RECONFIRMED_MAPPING_REVIEW_REQUIRED').map(r=>[r.sku,r]));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
fs.mkdirSync(outputDir,{recursive:true});
const records=[],skipped=[];
for(const row of Object.values(ledger)){
 const evidence=confirmed.get(row.sku);
 if(!evidence){skipped.push({sku:row.sku,reason:'NOT_INDEPENDENTLY_RECONFIRMED'});continue;}
 const c=row.candidate;
 if(!c?.file){skipped.push({sku:row.sku,reason:'NO_CAPTURE'});continue;}
 const input=path.join(recoveryDir,path.basename(c.file));
 if(!fs.existsSync(input)){skipped.push({sku:row.sku,reason:'MISSING_CAPTURE'});continue;}
 const body=fs.readFileSync(input);
 const digest=sha(body);
 if(digest!==c.sha256||digest!==evidence.sha256)throw Error('SOURCE_HASH_MISMATCH '+row.sku);
 const filename=row.sku+'.mann.html';
 fs.writeFileSync(path.join(outputDir,filename),body);
 records.push({sku:row.sku,canonical_base_claim:row.mann_code_claim,result:'EVIDENCE_CAPTURED',evidence:{file:filename,url:c.url,sha256:digest,bytes:body.length},source_recovery:'MANN_OFFICIAL_RECOVERED_INDEPENDENTLY_RECONFIRMED',status:'REVIEW_REQUIRED'});
}
fs.writeFileSync(path.join(outputDir,'manifest.json'),JSON.stringify({status:'REVIEW_REQUIRED',records},null,2)+'\n');
let error=null,results=[];
if(records.length){
 const script=path.resolve('scripts/hermes/ten-sku-offline-review.mjs');
 const run=spawnSync(process.execPath,[script,outputDir],{cwd:process.cwd(),encoding:'utf8',maxBuffer:8*1024*1024,timeout:180000});
 if(run.status!==0)error={exit_code:run.status,stderr:String(run.stderr||run.error?.message||'').slice(0,1200)};
 else results=JSON.parse(fs.readFileSync(path.join(outputDir,'technical-summary-integrated.json'),'utf8')).results;
}
const report={independently_confirmed:confirmed.size,staged:records.length,reviewed:results.length,
with_dimensions:results.filter(r=>r.dimension_fields>0).length,with_oem:results.filter(r=>r.oem_codes>0).length,
with_european_applications:results.filter(r=>r.european_applications>0).length,
not_staged:skipped.length,errors:error?[error]:[],status:'REVIEW_REQUIRED',certified:0,postgres_writes:0,publication:false};
fs.writeFileSync(path.join(outputDir,'recovered-technical-summary.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(error||records.length!==confirmed.size||results.length!==records.length)process.exitCode=2;
