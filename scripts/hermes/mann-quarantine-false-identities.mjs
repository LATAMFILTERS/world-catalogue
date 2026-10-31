#!/usr/bin/env node
// Quarantine rejected MANN candidates while preserving original HTML and attempt evidence.
import fs from 'node:fs';
import path from 'node:path';
const dir=path.resolve(process.argv[2]||'out/hermes-mann-official-recovery');
const file=path.join(dir,'ledger.json');
const ledger=JSON.parse(fs.readFileSync(file,'utf8'));
const audit=JSON.parse(fs.readFileSync(path.join(dir,'independent-review.json'),'utf8'));
const rejected=audit.filter(r=>r.status==='REVIEW_SOURCE_IDENTITY_MISMATCH');
const changes=[];
for(const row of rejected){
 const entry=ledger[row.sku];
 if(!entry?.candidate)continue;
 if(entry.candidate.sha256!==row.sha256)throw Error('REVIEW_HASH_CONFLICT '+row.sku);
 entry.quarantined_candidates??=[];
 entry.quarantined_candidates.push({...entry.candidate,reason:'INDEPENDENT_PRODUCT_IDENTITY_MISMATCH',actual_product_code:row.mann_product_code});
 entry.candidate=null;
 entry.status='REVIEW_SOURCE_IDENTITY_MISMATCH';
 changes.push({sku:row.sku,claimed:entry.mann_code_claim,observed:row.mann_product_code});
}
if(changes.length)fs.writeFileSync(file,JSON.stringify(ledger,null,2)+'\n');
const result={quarantined:changes,confirmed:Object.values(ledger).filter(r=>r.candidate).length,unresolved:Object.values(ledger).filter(r=>!r.candidate).length,status:'REVIEW_REQUIRED',certified:0,postgres_writes:0,publication:false};
fs.writeFileSync(path.join(dir,'quarantine-summary.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
