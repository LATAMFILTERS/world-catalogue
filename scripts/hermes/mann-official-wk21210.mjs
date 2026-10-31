#!/usr/bin/env node
// Targeted recovery of EF31210 from directly located official MANN product page.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const dir=path.resolve('out/hermes-mann-official-recovery');
const ledgerFile=path.join(dir,'ledger.json');
const ledger=JSON.parse(fs.readFileSync(ledgerFile,'utf8'));
const row=ledger.EF31210;
if(!row||row.mann_code_claim!=='WK21210')throw Error('UNEXPECTED_MANN_CLAIM');
const url='https://www.mann-filter.com/my-en/catalog/search-results/product.html/wk21/2%2810%29_mann-filter.html';
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
if(row.candidate){console.log(JSON.stringify({status:'ALREADY_CONFIRMED',sku:row.sku}));process.exit(0);}
if((row.attempts||[]).some(a=>a.url===url))throw Error('URL_ALREADY_REQUESTED');
const res=await fetch(url,{signal:AbortSignal.timeout(15000)});
const body=await res.text();
const text=body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/\s+/g,' ');
const found=[...text.matchAll(/\bProduct\s*:\s*([A-Z]{1,3}\s*\d[\d\s/()-]*[A-Z]?(?:-\d+)?)(?=\s|$)/gi)].map(m=>m[1]);
const actual=found.find(c=>norm(c)===norm(row.mann_code_claim));
const slug=decodeURIComponent(url.split('/product.html/')[1].replace(/_mann-filter\.html$/,''));
const confirmed=Boolean(res.ok&&actual&&norm(slug)===norm(actual)&&/GTIN Code|Product Details|OE Numbers/.test(text));
row.attempts??=[];
row.attempts.push({url,http_status:res.status,sha256:sha(body),declared_product_code:actual||null,identity_verified:confirmed});
if(confirmed){
 const filename='EF31210-'+sha(url).slice(0,12)+'.html';
 fs.writeFileSync(path.join(dir,filename),body);
 row.candidate={url,declared_product_code:actual,sha256:sha(body),file:filename,status:'MANN_PRODUCT_IDENTITY_CONFIRMED_ELIMFILTERS_MAPPING_REVIEW_REQUIRED'};
 row.status='MANN_PRODUCT_FOUND_REVIEW_REQUIRED';
}
fs.writeFileSync(ledgerFile,JSON.stringify(ledger,null,2)+'\n');
console.log(JSON.stringify({sku:row.sku,mnn_code:row.mann_code_claim,published:actual||null,http_status:res.status,identity_confirmed:confirmed,confirmed_total:Object.values(ledger).filter(x=>x.candidate).length,remaining:Object.values(ledger).filter(x=>!x.candidate).length,status:'REVIEW_REQUIRED',certified:0,postgres_writes:0,publication:false},null,2));
