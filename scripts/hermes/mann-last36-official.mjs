#!/usr/bin/env node
// Investigate only unresolved MANN catalogue references using new regional official pages.
// All captures are evidence candidates; never authorizes cross-reference, SQL or publication.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const dir=path.resolve(process.argv[2]||'out/hermes-mann-official-recovery');
const ledgerPath=path.join(dir,'ledger.json'),ledger=JSON.parse(fs.readFileSync(ledgerPath,'utf8'));
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const originals=Object.values(ledger).filter(r=>!r.candidate);
let requests=0,newlyRecovered=0;
for(const row of originals){
 const attempted=new Set((row.attempts||[]).map(a=>a.url));
 const candidates=new Set();
 const code=String(row.mann_code_claim||'').toLowerCase();
 for(const a of row.attempts||[]){
  const m=/\/product\.html\/(.+?)_mann-filter\.html/.exec(a.url||'');
  if(m)candidates.add(m[1]);
 }
 // Include canonical slug as a new regional lookup, without requesting old URLs.
 candidates.add(code);
 let recovered=null;
 for(const region of ['sg-en','es-es','de-de']){
  if(recovered)break;
  for(const slug of candidates){
   const url='https://www.mann-filter.com/'+region+'/catalog/search-results/product.html/'+slug+'_mann-filter.html';
   if(attempted.has(url))continue;
   attempted.add(url);
   let record={url};
   try{
    const response=await fetch(url,{signal:AbortSignal.timeout(12000),headers:{'User-Agent':'ELIMFILTERS-Catalogue-Research/1.0'}});
    requests++;
    if(!response.ok){record.http_status=response.status;row.attempts.push(record);continue;}
    const body=await response.text();
    const visible=body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/\s+/g,' ');
    const declared=(visible.match(/\b(?:Product|Produkt|Producto)\s*:\s*([A-Z]{1,3}\s*\d[\d\s/]*[A-Z]?)(?=\s|$)/i)||[])[1]||'';
    const exact=norm(declared)===norm(row.mann_code_claim);
    const product=/\bGTIN Code\b|\bProduct Details\b|\bOE Numbers\b|Código GTIN|Detalles del producto|Produktdetails|GTIN-Code/i.test(visible);
    record={url,http_status:response.status,declared_product_code:declared.trim(),sha256:hash(body),identity_verified:Boolean(exact&&product)};
    row.attempts.push(record);
    if(exact&&product){
     const file=row.sku+'-'+hash(url).slice(0,12)+'.html';
     fs.writeFileSync(path.join(dir,file),body);
     recovered={url,declared_product_code:declared.trim(),sha256:hash(body),file,status:'MANN_PRODUCT_IDENTITY_CONFIRMED_ELIMFILTERS_MAPPING_REVIEW_REQUIRED'};
     break;
    }
   }catch(error){row.attempts.push({url,error:String(error.message||error)});}
  }
 }
 if(recovered){row.candidate=recovered;row.status='MANN_PRODUCT_FOUND_REVIEW_REQUIRED';newlyRecovered++;}
 row.research_pass='REGIONAL_OFFICIAL_LOOKUP_V1';
 fs.writeFileSync(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
}
const out={regional_researched:originals.length,newly_recovered:newlyRecovered,remaining:Object.values(ledger).filter(r=>!r.candidate).length,requests,status:'REVIEW_REQUIRED',certified:0,postgres_writes:0,publication:false};
fs.writeFileSync(path.join(dir,'last36-regional-summary.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
