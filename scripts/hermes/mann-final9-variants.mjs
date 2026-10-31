#!/usr/bin/env node
// Nine unresolved MANN codes: alternative punctuation hypotheses only.
// Do not repeat previous URLs; do not claim equivalence; do not touch SQL.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const dir=path.resolve(process.argv[2]||'out/hermes-mann-official-recovery');
const file=path.join(dir,'ledger.json');
const ledger=JSON.parse(fs.readFileSync(file,'utf8'));
const variants={
 EF38212:['pu821x-2','pu821x2','pu821/2x'],
 EF38308:['wk830/8'],
 EF38533:['wk853/3'],
 EL34210:['w914/2(10)','w914/210','w914/2-10'],
 EA38551:['c20855/1'],
 EF30210:['wk300/210'],
 EF31210:['wk212/10'],
 EF31510:['wk315/10'],
 EF34213:['wk42/13']
};
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const remains=Object.values(ledger).filter(x=>!x.candidate);
const recovered=[];
let requests=0;
for(const item of remains){
 const attempted=new Set((item.attempts||[]).map(x=>x.url));
 item.attempts??=[];
 for(const slug of variants[item.sku]||[]){
  if(item.candidate)break;
  for(const locale of ['en','de-de','es-es']){
   if(item.candidate)break;
   const url='https://www.mann-filter.com/'+locale+'/catalog/search-results/product.html/'+slug+'_mann-filter.html';
   if(attempted.has(url))continue;
   attempted.add(url);
   try{
    const response=await fetch(url,{signal:AbortSignal.timeout(10000),headers:{'User-Agent':'ELIMFILTERS-Catalogue-Research/1.0'}});
    requests++;
    if(!response.ok){item.attempts.push({url,http_status:response.status});continue;}
    const body=await response.text();
    const visible=body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/\s+/g,' ');
    const published=(visible.match(/\b(?:Product|Produkt|Producto)\s*:\s*([A-Z]{1,3}\s*\d[\d\s/()-]*[A-Z]?(?:-\d+)?)(?=\s|$)/i)||[])[1]||'';
    const match=norm(published)===norm(item.mann_code_claim);
    const product=/\bGTIN Code\b|\bProduct Details\b|\bOE Numbers\b|Código GTIN|Detalles del producto|Produktdetails|GTIN-Code/i.test(visible);
    item.attempts.push({url,http_status:response.status,declared_product_code:published.trim(),sha256:hash(body),identity_verified:match&&product});
    if(match&&product){
     const name=item.sku+'-'+hash(url).slice(0,12)+'.html';
     fs.writeFileSync(path.join(dir,name),body);
     item.candidate={url,declared_product_code:published.trim(),sha256:hash(body),file:name,status:'MANN_PRODUCT_IDENTITY_CONFIRMED_ELIMFILTERS_MAPPING_REVIEW_REQUIRED'};
     recovered.push(item.sku);
    }
   }catch(error){item.attempts.push({url,error:String(error.message||error)});}
  }
 }
 fs.writeFileSync(file,JSON.stringify(ledger,null,2)+'\n');
}
const result={checked:remains.length,recovered,remaining:Object.values(ledger).filter(r=>!r.candidate).map(r=>({sku:r.sku,mann_code:r.mann_code_claim})),requests,certified:0,postgres_writes:0,publication:false,status:'REVIEW_REQUIRED'};
fs.writeFileSync(path.join(dir,'final9-summary.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
