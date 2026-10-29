#!/usr/bin/env node
// Production GET-only semantic audit. Does not alter catalogue or assert equivalence.
import fs from 'node:fs';
import path from 'node:path';
const base='https://elimfilters.com';
const output=path.resolve(process.argv[2]||'out/aeo-semantic-jsonld.json');
function attributes(tag){const out={};for(const m of tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gis))out[m[1].toLowerCase()]=m[3];return out;}
async function get(url){
 const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(25000),headers:{Accept:'text/html,application/xml','User-Agent':'ELIMFILTERS-AEO-Semantics-Audit/1.0'}});
 if(!r.ok)throw Error('HTTP '+r.status);return r.text();
}
function data(html){
 const nodes=[],errors=[];
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
  if(attributes('<script '+m[1]+'>').type?.toLowerCase()!=='application/ld+json')continue;
  try{const obj=JSON.parse(m[2]);nodes.push(...(Array.isArray(obj?.['@graph'])?obj['@graph']:[obj]));}
  catch(e){errors.push('JSONLD_PARSE '+e.message);}
 }
 return {nodes,errors};
}
const sitemap=await get(base+'/sitemap.xml');
const urls=[...sitemap.matchAll(/<loc>\s*(https:\/\/elimfilters\.com\/[^<]+)<\/loc>/g)].map(x=>x[1]);
const productUrls=[...new Set(urls.filter(u=>new URL(u).pathname.startsWith('/products/')))];
const targets=[base+'/',...productUrls];
const records=[];
let index=0;
async function worker(){
 while(index<targets.length){
  const url=targets[index++],issues=[],record={url,status:'BLOCKED',issues};
  try{
   const {nodes,errors}=data(await get(url));issues.push(...errors);
   const types=nodes.flatMap(n=>Array.isArray(n?.['@type'])?n['@type']:[n?.['@type']]);
   const ids=nodes.map(n=>n?.['@id']).filter(Boolean);
   record.types=types.filter(Boolean);
   const dup=ids.filter((id,i)=>ids.indexOf(id)!==i);if(dup.length)issues.push('DUPLICATE_ENTITY_IDS '+[...new Set(dup)].join(','));
   if(!nodes.length)issues.push('JSONLD_ABSENT');
   for(const n of nodes){
    if(n?.['@type']==='Organization'&&n['@id']!==base+'/#organization')issues.push('ORGANIZATION_ID '+n['@id']);
    if(n?.['@type']==='BreadcrumbList'){
     const items=n.itemListElement;
     if(!Array.isArray(items)||!items.length)issues.push('BREADCRUMB_EMPTY');
     else {
      for(let i=0;i<items.length;i++){
       if(items[i].position!==i+1)issues.push('BREADCRUMB_POSITION '+i);
       if(!items[i].item||!String(items[i].item).startsWith(base+'/'))issues.push('BREADCRUMB_URL '+i);
      }
      if(url.startsWith(base+'/products/') && items.at(-1)?.item!==url)issues.push('BREADCRUMB_FINAL_URL');
     }
    }
    if(n?.['@type']==='Product'){
     if(!n.sku||!n.url||!n['@id'])issues.push('PRODUCT_MISSING_ID_SKU_URL');
     if(n.isRelatedTo!==undefined)issues.push('PRODUCT_UNVERIFIED_IS_RELATED_TO');
     if(n.isSimilarTo!==undefined)issues.push('PRODUCT_UNVERIFIED_IS_SIMILAR_TO');
     if(n.offers!==undefined)issues.push('PRODUCT_UNVERIFIED_OFFER');
     if(n.manufacturer?.['@id'] && n.manufacturer['@id']!==base+'/#organization')issues.push('PRODUCT_MANUFACTURER_ID');
    }
   }
   if(url.startsWith(base+'/products/')&&!types.includes('Product'))issues.push('PRODUCT_JSONLD_ABSENT');
   record.status=issues.length?'FAIL':'PASS';
  }catch(e){issues.push('FETCH '+e.message);}
  records.push(record);
 }
}
await Promise.all(Array.from({length:Math.min(6,targets.length)},()=>worker()));
const passed=records.filter(r=>r.status==='PASS').length;
const failed=records.filter(r=>r.status==='FAIL').length;
const blocked=records.filter(r=>r.status==='BLOCKED').length;
const status=failed?'FAIL':blocked||!productUrls.length?'BLOCKED':'PASS';
const report={timestamp:new Date().toISOString(),mode:'READ_ONLY_GET_NO_JS',scope:'PRODUCT_AND_ORGANIZATION_JSONLD',status,sitemapUrls:urls.length,productPagesDiscovered:productUrls.length,checked:records.length,passed,failed,blocked,results:records};
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status,productPagesDiscovered:productUrls.length,checked:records.length,passed,failed,blocked,report_path:output},null,2));
process.exitCode=status==='PASS'?0:2;
