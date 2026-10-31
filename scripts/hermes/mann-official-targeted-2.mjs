#!/usr/bin/env node
// Two researched MANN official product pages. No DB writes, no equivalence approval.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve('out/hermes-mann-official-recovery');
const file=path.join(root,'ledger.json');
const ledger=JSON.parse(fs.readFileSync(file,'utf8'));
const targets=[
 {sku:'EF38533',code:'WK8533',url:'https://www.mann-filter.com/us-en/catalog/search-results/product.html/wk853/3_mann-filter.html'},
 {sku:'EF34213',code:'WK4213',url:'https://www.mann-filter.com/au-en/catalog/search-results/product.html/wk42/13_mann-filter.html'}
];
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
const results=[];
for(const t of targets){
 const record=ledger[t.sku];
 if(!record||record.mann_code_claim!==t.code)throw Error('CLAIM_MISMATCH '+t.sku);
 if(record.candidate){results.push({sku:t.sku,status:'ALREADY_CAPTURED'});continue;}
 const prior=record.attempts?.find(a=>a.url===t.url);
 if(prior){results.push({sku:t.sku,status:'PREVIOUSLY_QUERIED',attempt:prior});continue;}
 const response=await fetch(t.url,{signal:AbortSignal.timeout(15000)});
 const html=await response.text();
 const cleaned=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/\s+/g,' ');
 // Match the exact product identity inside the product's legal information, not a related product.
 const observed=[...cleaned.matchAll(/\b(?:Product|Produkt|Producto)\s*:\s*([A-Z]{1,3}\s*\d[\d\s/()-]*[A-Z]?(?:-\d+)?)(?=\s|$)/gi)].map(m=>m[1]);
 const actual=observed.find(c=>norm(c)===norm(t.code));
 const slug=decodeURIComponent(t.url.split('/product.html/')[1].replace(/_mann-filter\.html$/,''));
 const confirmed=Boolean(response.ok&&actual&&norm(slug)===norm(t.code)&&/GTIN Code|Product Details|OE Numbers/i.test(cleaned));
 const attempt={url:t.url,http_status:response.status,sha256:digest(html),declared_product_code:actual||null,identity_verified:confirmed};
 record.attempts??=[];record.attempts.push(attempt);
 if(confirmed){
  const name=t.sku+'-'+digest(t.url).slice(0,12)+'.html';
  fs.writeFileSync(path.join(root,name),html);
  record.candidate={url:t.url,declared_product_code:actual,sha256:digest(html),file:name,status:'MANN_PRODUCT_IDENTITY_CONFIRMED_ELIMFILTERS_MAPPING_REVIEW_REQUIRED'};
  record.status='MANN_PRODUCT_FOUND_REVIEW_REQUIRED';
 }
 results.push({sku:t.sku,status:confirmed?'OFFICIAL_IDENTITY_CAPTURED':'REVIEW_REQUIRED',declared:actual||null,http_status:response.status});
 fs.writeFileSync(file,JSON.stringify(ledger,null,2)+'\n');
}
console.log(JSON.stringify({results,confirmed_total:Object.values(ledger).filter(r=>r.candidate).length,remaining:Object.values(ledger).filter(r=>!r.candidate).length,status:'REVIEW_REQUIRED',certified:0,postgres_writes:0,publication:false},null,2));
