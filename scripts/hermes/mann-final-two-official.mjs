#!/usr/bin/env node
// Official MANN product pages independently discovered for the final two identities.
// No catalogue, SQL or publication writes. Existing captures are not re-fetched.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const dir=path.resolve('out/hermes-mann-official-recovery'),file=path.join(dir,'ledger.json');
const ledger=JSON.parse(fs.readFileSync(file,'utf8'));
const targets=[
 {sku:'EF30210',code:'WK300210',url:'https://www.mann-filter.com/en/catalog/search-results/product.html/wk3002%2810%29_mann-filter.html'},
 {sku:'EF31510',code:'WK31510',url:'https://www.mann-filter.com/en/catalog/search-results/product.html/wk31/5%2810%29_mann-filter.html'}
];
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const output=[];
for(const t of targets){
 const r=ledger[t.sku];
 if(!r||r.mann_code_claim!==t.code)throw Error('CLAIM_MISMATCH '+t.sku);
 if(r.candidate){output.push({sku:t.sku,status:'ALREADY_CAPTURED'});continue;}
 if(r.attempts?.some(x=>x.url===t.url)){output.push({sku:t.sku,status:'ALREADY_QUERIED'});continue;}
 const response=await fetch(t.url,{signal:AbortSignal.timeout(15000)});
 const body=await response.text(),digest=sha(body);
 const visible=body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,' ');
 const codes=[...visible.matchAll(/\b(?:Product|Produkt|Producto)\s*:\s*([A-Z]{1,3}\s*\d[\d\s/()-]*[A-Z]?(?:-\d+)?)(?=\s|$)/gi)].map(m=>m[1]);
 const actual=codes.find(v=>norm(v)===norm(t.code));
 const slug=decodeURIComponent(t.url.split('/product.html/')[1].replace(/_mann-filter\.html$/,''));
 const verified=Boolean(response.ok&&actual&&norm(actual)===norm(slug)&&/GTIN Code|Product Details|OE Numbers/i.test(visible));
 r.attempts??=[];r.attempts.push({url:t.url,http_status:response.status,sha256:digest,declared_product_code:actual||null,identity_verified:verified});
 if(verified){
  const name=t.sku+'-'+sha(t.url).slice(0,12)+'.html';
  fs.writeFileSync(path.join(dir,name),body);
  r.candidate={url:t.url,declared_product_code:actual,sha256:digest,file:name,status:'MANN_PRODUCT_IDENTITY_CONFIRMED_ELIMFILTERS_MAPPING_REVIEW_REQUIRED'};
  r.status='MANN_PRODUCT_FOUND_REVIEW_REQUIRED';
 }
 output.push({sku:t.sku,http_status:response.status,published_code:actual||null,identity_captured:verified});
 fs.writeFileSync(file,JSON.stringify(ledger,null,2)+'\n');
}
console.log(JSON.stringify({results:output,confirmed_total:Object.values(ledger).filter(r=>r.candidate).length,remaining:Object.values(ledger).filter(r=>!r.candidate).length,status:'REVIEW_REQUIRED',certified:0,postgres_writes:0,publication:false},null,2));
