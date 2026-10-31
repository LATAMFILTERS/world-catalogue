#!/usr/bin/env node
// Controlled MANN official source recovery; no SQL, no catalogue publication.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const queueFile=process.argv[2]||'out/hermes-mann-audit/404-official-search-queue.json';
const outDir=path.resolve(process.argv[3]||'out/hermes-mann-official-recovery');
const queue=JSON.parse(fs.readFileSync(queueFile,'utf8'));
if(!Array.isArray(queue))throw Error('INVALID_QUEUE');
fs.mkdirSync(outDir,{recursive:true});
const ledgerFile=path.join(outDir,'ledger.json');
const ledger=fs.existsSync(ledgerFile)?JSON.parse(fs.readFileSync(ledgerFile,'utf8')):{};
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const normalize=s=>String(s).toLowerCase().replace(/[^a-z0-9]/g,'');
function candidates(raw){
 const code=String(raw).toUpperCase().replace(/[\s/-]/g,'');
 const m=/^([A-Z]+)(\d+)([A-Z]*)$/.exec(code);
 if(!m)return [];
 const [,prefix,digits,suffix]=m;
 const result=new Set();
 // Alternate slash positions: only previously untried, official MANN slugs.
 for(let take=1;take<=Math.min(3,digits.length-2);take++){
  result.add((prefix+digits.slice(0,-take)+'/'+digits.slice(-take)+suffix).toLowerCase());
 }
 // Suffixes may be placed after the slash e.g. PU 821/2 x.
 if(suffix&&digits.length>=3)result.add((prefix+digits.slice(0,-1)+'/'+digits.slice(-1)+suffix).toLowerCase());
 return [...result];
}
async function run(){
 let fetched=0,matched=0,unresolved=0;
 for(const [i,item] of queue.entries()){
  if(ledger[item.sku]?.candidate)continue;
  if(ledger[item.sku]?.parser_version===3)continue;
  const variants=candidates(item.mann_code);
  const attempts=[...(ledger[item.sku]?.attempts||[])];let found=null;
  const attemptedUrls=new Set(attempts.map(a=>a.url));
  for(const variant of variants){
   // No retry of original failed URLs: only a newly formatted candidate with a slash.
   if(!variant.includes('/'))continue;
   const url='https://www.mann-filter.com/en/catalog/search-results/product.html/'+variant+'_mann-filter.html';
   if(attemptedUrls.has(url))continue;
   try{
    const res=await fetch(url,{signal:AbortSignal.timeout(12000),headers:{'User-Agent':'ELIMFILTERS-Catalogue-Research/1.0'}});
    const body=await res.text();fetched++;
    const visible=body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,' ');
    const pageCode=(visible.match(/\b(?:Product|Produkt)\s*:\s*([A-Z]{1,3}\s*\d[\d\s/]*[A-Z]?)(?=\s|$)/i)||[])[1]||'';
    const exact=normalize(pageCode)===normalize(variant);
    const isProductPage=/\bGTIN Code\b|\bProduct Details\b|\bOE Numbers\b/i.test(visible);
    attempts.push({url,http_status:res.status,content_sha256:hash(body),declared_product_code:pageCode.trim(),identity_verified:res.ok&&exact&&isProductPage});
    if(res.ok&&exact&&isProductPage){
     const filename=item.sku+'-'+hash(url).slice(0,12)+'.html';
     fs.writeFileSync(path.join(outDir,filename),body);
     found={url,declared_product_code:pageCode.trim(),sha256:hash(body),file:filename,status:'MANN_PRODUCT_IDENTITY_CONFIRMED_ELIMFILTERS_MAPPING_REVIEW_REQUIRED'};
     break;
    }
   }catch(e){attempts.push({url,error:String(e.message||e)});}
  }
  ledger[item.sku]={parser_version:3,sku:item.sku,mann_code_claim:item.mann_code,candidate:found,attempts,status:found?'MANN_PRODUCT_FOUND_REVIEW_REQUIRED':'NO_OFFICIAL_IDENTITY_MATCH',certified:false};
  fs.writeFileSync(ledgerFile,JSON.stringify(ledger,null,2)+'\n');
  found?matched++:unresolved++;
  if((i+1)%25===0)console.log(JSON.stringify({processed:i+1,total:queue.length,new_matches:matched,new_unresolved:unresolved,new_requests:fetched}));
 }
 const result={processed:Object.keys(ledger).length,queue_size:queue.length,official_identities_confirmed:Object.values(ledger).filter(x=>x.candidate).length,status:'REVIEW_REQUIRED',certified:0,postgres_writes:0,publication:false};
 fs.writeFileSync(path.join(outDir,'summary.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result,null,2));
}
await run();
