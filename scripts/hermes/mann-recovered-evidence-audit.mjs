#!/usr/bin/env node
// Independently recheck cached MANN product HTML; no network, SQL, or publication.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(process.argv[2]||'out/hermes-mann-official-recovery');
const ledger=JSON.parse(fs.readFileSync(path.join(root,'ledger.json'),'utf8'));
const norm=x=>String(x||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const rows=[];
for(const record of Object.values(ledger)){
 const found=record.candidate;
 if(!found){rows.push({sku:record.sku,status:'NOT_RECOVERED'});continue;}
 const file=path.join(root,path.basename(found.file||''));
 if(!found.file||!fs.existsSync(file)){rows.push({sku:record.sku,status:'MISSING_CAPTURE'});continue;}
 const body=fs.readFileSync(file,'utf8');
 if(digest(body)!==found.sha256){rows.push({sku:record.sku,status:'HASH_MISMATCH'});continue;}
 const visible=body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,' ');
 const productCode=(visible.match(/\b(?:Product|Produkt)\s*:\s*([A-Z]{1,3}\s*\d[\d\s/]*[A-Z]?)(?=\s|$)/i)||[])[1]||'';
 const exact=norm(productCode)===norm(found.declared_product_code);
 const candidateCode=decodeURIComponent(new URL(found.url).pathname.split('/product.html/')[1]?.replace(/_mann-filter\.html$/,'')||'');
 const canonicalMatch=norm(candidateCode)===norm(productCode);
 const originalMatch=norm(record.mann_code_claim)===norm(productCode);
 const status=exact&&canonicalMatch&&originalMatch?'MANN_IDENTITY_RECONFIRMED_MAPPING_REVIEW_REQUIRED':'REVIEW_SOURCE_IDENTITY_MISMATCH';
 rows.push({sku:record.sku,mann_code_claim:record.mann_code_claim,mann_product_code:productCode,url:found.url,sha256:found.sha256,checks:{declared_code_matches_page:exact,url_matches_page:canonicalMatch,original_matches_page:originalMatch},status});
}
const tally={};
for(const r of rows)tally[r.status]=(tally[r.status]||0)+1;
const report={total:rows.length,counts:tally,certified:0,postgres_writes:0,publication:false,status:'REVIEW_REQUIRED'};
fs.writeFileSync(path.join(root,'independent-review.json'),JSON.stringify(rows,null,2)+'\n');
fs.writeFileSync(path.join(root,'independent-review-summary.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,mismatch_samples:rows.filter(r=>r.status==='REVIEW_SOURCE_IDENTITY_MISMATCH').slice(0,5)},null,2));
