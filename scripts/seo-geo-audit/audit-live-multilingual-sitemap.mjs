#!/usr/bin/env node
// Read-only GET audit of all multilingual triplets listed in the production sitemap.
import fs from 'node:fs';
import path from 'node:path';
const BASE='https://elimfilters.com';
const output=path.resolve(process.argv[2]||'out/aeo-live-multilingual-audit.json');
const origins=['en','es','pt-BR'];
const prefixes={'en':'','es':'/es','pt-BR':'/pt'};
const issuesGlobal=[];
function attrs(tag){const obj={};for(const m of tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gis))obj[m[1].toLowerCase()]=m[3];return obj;}
const normalize=u=>new URL(u).pathname.replace(/\/+/g,'/').replace(/\/?$/,'/') ;
async function get(url){
 const response=await fetch(url,{method:'GET',redirect:'follow',headers:{Accept:'text/html','User-Agent':'ELIMFILTERS-AEO-ReadOnly-Audit/1.1'},signal:AbortSignal.timeout(25000)});
 if(!response.ok)throw Error('HTTP '+response.status);
 return {response,html:await response.text()};
}
function parse(html){
 const root=html.match(/<html\b[^>]*>/i)?.[0];
 const head=html.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i)?.[1];
 if(!root||!head)throw Error('Missing html/head');
 const links=[...head.matchAll(/<link\b[^>]*>/gi)].map(m=>attrs(m[0]));
 const canon=links.filter(x=>x.rel?.toLowerCase().split(/\s+/).includes('canonical')).map(x=>x.href);
 const alts=links.filter(x=>x.rel?.toLowerCase().split(/\s+/).includes('alternate')&&x.hreflang).map(x=>({lang:x.hreflang,url:x.href}));
 const json=[],errors=[];
 for(const match of head.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
  if(attrs('<script '+match[1]+'>').type?.toLowerCase()!=='application/ld+json')continue;
  try{json.push(JSON.parse(match[2]));}catch(e){errors.push('JSONLD_PARSE '+e.message);}
 }
 return {lang:attrs(root).lang||null,canon,alts,json,errors};
}
let urls;
try{
 const {response,html}=await get(BASE+'/sitemap.xml');
 if(!response.headers.get('content-type')?.includes('xml'))issuesGlobal.push('SITEMAP_CONTENT_TYPE '+response.headers.get('content-type'));
 urls=[...html.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map(m=>m[1].replace(/&amp;/g,'&')).filter(x=>{try{return new URL(x).origin===BASE;}catch{return false;}});
 if(!urls.length)throw Error('Sitemap has no URLs');
}catch(e){console.error('BLOCKED sitemap '+e.message);process.exit(2);}
const urlSet=new Set(urls.map(normalize));
const routes=new Set();
for(const value of urls){
 const name=normalize(value);
 if(/^\/(es|pt)\//.test(name))routes.add(name.replace(/^\/(es|pt)/,''));
 else routes.add(name);
}
const groups=[],incomplete=[];
for(const route of [...routes].sort()){
 const expected=origins.map(lang=>({lang,url:BASE+prefixes[lang]+route}));
 const present=expected.filter(x=>urlSet.has(normalize(x.url)));
 if(present.length===3)groups.push({route,expected});
 else if(present.length>0 && present.some(x=>x.lang!=='en')) incomplete.push({route,present:present.map(x=>x.lang),missing:expected.filter(x=>!present.some(y=>y.lang===x.lang)).map(x=>x.lang)});
}
const targets=groups.flatMap(g=>g.expected.map(x=>({...x,route:g.route})));
const results=new Array(targets.length);
let cursor=0;
async function worker(){
 while(cursor<targets.length){
  const index=cursor++,target=targets[index],issues=[],row={...target,status:'BLOCKED',issues};
  try{
   const {response,html}=await get(target.url);
   row.http=response.status;row.finalUrl=response.url;
   if(!response.headers.get('content-type')?.includes('text/html'))throw Error('Unexpected content-type');
   const m=parse(html);
   row.htmlLang=m.lang;row.canonical=m.canon;row.hreflang=m.alts;row.jsonldCount=m.json.length;
   if(m.lang!==target.lang)issues.push('HTML_LANG expected='+target.lang+' actual='+m.lang);
   if(m.canon.length!==1||m.canon[0]!==target.url)issues.push('CANONICAL '+JSON.stringify(m.canon));
   const expectedAlts=Object.fromEntries(groups.find(g=>g.route===target.route).expected.map(x=>[x.lang,x.url]));
   expectedAlts['x-default']=expectedAlts.en;
   const seen=new Map();
   for(const alt of m.alts){if(seen.has(alt.lang))issues.push('DUPLICATE_HREFLANG '+alt.lang);seen.set(alt.lang,alt.url);}
   for(const [lang,url] of Object.entries(expectedAlts))if(seen.get(lang)!==url)issues.push('HREFLANG '+lang+' expected='+url+' actual='+seen.get(lang));
   for(const lang of seen.keys())if(!(lang in expectedAlts))issues.push('UNEXPECTED_HREFLANG '+lang);
   if(!m.json.length)issues.push('JSONLD_ABSENT');
   issues.push(...m.errors);
   for(const obj of m.json)for(const node of Array.isArray(obj?.['@graph'])?obj['@graph']:[obj]){
    if(node?.['@type']==='Organization' && /database-audited 2026-08-31|12,192 unique SKUs|1,044,939 unique relationships/i.test(JSON.stringify(node.additionalProperty||[])))issues.push('STALE_ORGANIZATION_METRIC');
   }
   if(normalize(response.url)!==normalize(target.url))issues.push('REDIRECTED_PATH '+response.url);
   row.status=issues.length?'FAIL':'PASS';
  }catch(e){issues.push('FETCH_OR_PARSE '+e.message);}
  results[index]=row;
 }
}
await Promise.all(Array.from({length:Math.min(6,targets.length)},()=>worker()));
const passed=results.filter(x=>x.status==='PASS').length,failed=results.filter(x=>x.status==='FAIL').length,blocked=results.filter(x=>x.status==='BLOCKED').length;
const status=failed?'FAIL':blocked||issuesGlobal.length?'BLOCKED':'PASS';
const report={timestamp:new Date().toISOString(),scope:'PUBLIC_SITEMAP_MULTILINGUAL_TRIPLETS',mode:'READ_ONLY_GET_NO_JS',status,sitemapUrls:urls.length,completeTriplets:groups.length,checked:results.length,passed,failed,blocked,incompleteLocaleGroups:incomplete,globalIssues:issuesGlobal,results};
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status,sitemapUrls:urls.length,completeTriplets:groups.length,incompleteLocaleGroups:incomplete.length,checked:results.length,passed,failed,blocked,report_path:output},null,2));
process.exitCode=status==='PASS'?0:2;
