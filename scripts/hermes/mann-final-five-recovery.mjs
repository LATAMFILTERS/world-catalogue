#!/usr/bin/env node
// Research exactly five outstanding MANN identities, never re-query prior URLs.
// Preserve original evidence and never modify PostgreSQL or catalogue.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(process.argv[2]||'out/hermes-mann-official-recovery');
const file=path.join(root,'ledger.json'),ledger=JSON.parse(fs.readFileSync(file,'utf8'));
const target=new Set(['EF38308','EA38551','EF30210','EF31210','EF31510']);
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
let requests=0;const output=[];
for(const sku of target){
 const row=ledger[sku];
 if(!row)throw Error('SKU_NOT_IN_LEDGER '+sku);
 if(row.candidate){output.push({sku,status:'ALREADY_CONFIRMED'});continue;}
 row.attempts??=[];
 const done=new Set(row.attempts.map(a=>a.url));
 const claim=row.mann_code_claim.toLowerCase();
 const match=/^([a-z]+)(\d+)([a-z]*)$/.exec(claim);
 if(!match)throw Error('INVALID_CODE '+sku);
 const [,prefix,digits,suffix]=match;
 const slugs=new Set();
 for(let cut=1;cut<digits.length;cut++)slugs.add(prefix+digits.slice(0,cut)+'/'+digits.slice(cut)+suffix);
 // Official market variants, never treat normalization as proof.
 const markets=['us-en','au-en','gb-en','de-de','es-es'];
 let recovered=false;
 for(const locale of markets){
  if(recovered)break;
  for(const slug of slugs){
   if(recovered)break;
   const url='https://www.mann-filter.com/'+locale+'/catalog/search-results/product.html/'+slug+'_mann-filter.html';
   if(done.has(url))continue;
   try{
    const response=await fetch(url,{signal:AbortSignal.timeout(10000)});
    requests++;
    if(!response.ok){row.attempts.push({url,http_status:response.status});continue;}
    const html=await response.text();
    const visible=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/\s+/g,' ');
    const productCodes=[...visible.matchAll(/\b(?:Product|Produkt|Producto)\s*:\s*([A-Z]{1,3}\s*\d[\d\s/()-]*[A-Z]?(?:-\d+)?)(?=\s|$)/gi)].map(m=>m[1]);
    const exact=productCodes.find(c=>norm(c)===norm(row.mann_code_claim)&&norm(c)===norm(slug));
    const product=/(?:GTIN Code|Product Details|OE Numbers|Detalles del producto|Produktdetails|GTIN-Code)/i.test(visible);
    const verified=Boolean(response.ok&&exact&&product);
    row.attempts.push({url,http_status:response.status,content_sha256:sha(html),declared_product_code:exact||null,identity_verified:verified});
    if(verified){
     const filename=sku+'-'+sha(url).slice(0,12)+'.html';
     fs.writeFileSync(path.join(root,filename),html);
     row.candidate={url,declared_product_code:exact,sha256:sha(html),file:filename,status:'MANN_PRODUCT_IDENTITY_CONFIRMED_ELIMFILTERS_MAPPING_REVIEW_REQUIRED'};
     row.status='MANN_PRODUCT_FOUND_REVIEW_REQUIRED';
     recovered=true;
    }
   }catch(error){row.attempts.push({url,error:String(error.message||error)});}
  }
 }
 output.push({sku,mann_code:row.mann_code_claim,status:recovered?'OFFICIAL_IDENTITY_CAPTURED':'NOT_CONFIRMED'});
 fs.writeFileSync(file,JSON.stringify(ledger,null,2)+'\n');
}
const result={results:output,new_requests:requests,confirmed_total:Object.values(ledger).filter(x=>x.candidate).length,remaining:Object.values(ledger).filter(x=>!x.candidate).length,status:'REVIEW_REQUIRED',certified:0,postgres_writes:0,publication:false};
fs.writeFileSync(path.join(root,'final-five-summary.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
