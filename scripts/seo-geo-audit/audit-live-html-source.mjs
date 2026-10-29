#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const BASE='https://elimfilters.com';
const ROUTES=['/','/industries/mining/','/industries/agriculture/'];
const LANGS=[['','en'],['/es','es'],['/pt','pt-BR']];
const output=path.resolve(process.argv[2]||'out/aeo-live-html-audit-20261029.json');
function attributes(tag){const a={};for(const m of tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gis))a[m[1].toLowerCase()]=m[3];return a;}
function extract(html){
 const root=html.match(/<html\b[^>]*>/i)?.[0], head=html.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i)?.[1];
 if(!root||!head)throw Error('Missing original HTML/head');
 const links=[...head.matchAll(/<link\b[^>]*>/gi)].map(m=>attributes(m[0]));
 const canonical=links.filter(x=>x.rel?.toLowerCase().split(/\s+/).includes('canonical')).map(x=>x.href);
 const alternates=links.filter(x=>x.rel?.toLowerCase().split(/\s+/).includes('alternate')&&x.hreflang).map(x=>({lang:x.hreflang,href:x.href}));
 const jsonld=[],parseErrors=[];
 for(const m of head.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
   if(attributes('<script '+m[1]+'>').type?.toLowerCase()!=='application/ld+json')continue;
   try{jsonld.push(JSON.parse(m[2]));}catch(e){parseErrors.push(String(e.message));}
 }
 return {lang:attributes(root).lang||null,canonical,alternates,jsonld,parseErrors};
}
const rows=[];
for(const route of ROUTES)for(const [prefix,lang] of LANGS){
 const url=BASE+prefix+route, issues=[],row={url,status:'BLOCKED',issues};
 try{
  const res=await fetch(url,{method:'GET',redirect:'follow',headers:{Accept:'text/html','User-Agent':'ELIMFILTERS-AEO-ReadOnly-Audit/1.0'},signal:AbortSignal.timeout(20000)});
  row.http=res.status;row.finalUrl=res.url;row.contentType=res.headers.get('content-type');
  if(!res.ok)throw Error('HTTP '+res.status);
  if(!row.contentType?.includes('text/html'))throw Error('Unexpected content type');
  const html=await res.text(),meta=extract(html);
  row.htmlLang=meta.lang;row.canonical=meta.canonical;row.hreflang=meta.alternates;row.jsonldCount=meta.jsonld.length;
  if(meta.lang!==lang)issues.push('HTML_LANG expected='+lang+' actual='+meta.lang);
  if(meta.canonical.length!==1||meta.canonical[0]!==url)issues.push('CANONICAL expected='+url+' actual='+JSON.stringify(meta.canonical));
  const expected={en:BASE+route,es:BASE+'/es'+route,'pt-BR':BASE+'/pt'+route,'x-default':BASE+route};
  const actual=new Map();
  for(const alt of meta.alternates){if(actual.has(alt.lang))issues.push('DUPLICATE_HREFLANG '+alt.lang);actual.set(alt.lang,alt.href);}
  for(const [tag,href] of Object.entries(expected))if(actual.get(tag)!==href)issues.push('HREFLANG '+tag+' expected='+href+' actual='+actual.get(tag));
  if(!meta.jsonld.length)issues.push('JSONLD_ABSENT');
  for(const err of meta.parseErrors)issues.push('JSONLD_INVALID '+err);
  for(const graph of meta.jsonld){
   for(const node of Array.isArray(graph?.['@graph'])?graph['@graph']:[graph]){
    if(node?.['@type']==='Organization'&&Array.isArray(node.additionalProperty)&&/database-audited 2026-08-31|12,192 unique SKUs|1,044,939 unique relationships/i.test(JSON.stringify(node.additionalProperty)))issues.push('STALE_ORGANIZATION_METRICS');
   }
  }
  if(new URL(res.url).pathname.replace(/\/$/,'')!==new URL(url).pathname.replace(/\/$/,''))issues.push('REDIRECT_PATH '+res.url);
  row.status=issues.length?'FAIL':'PASS';
 }catch(e){issues.push('FETCH_OR_PARSE '+e.message);row.status='BLOCKED';}
 rows.push(row);
}
const summary={timestamp:new Date().toISOString(),scope:'AEO_HTML_ONLY',mode:'READ_ONLY_GET_NO_JS',status:rows.every(r=>r.status==='PASS')?'PASS':rows.some(r=>r.status==='FAIL')?'FAIL':'BLOCKED',checked:rows.length,passed:rows.filter(r=>r.status==='PASS').length,failed:rows.filter(r=>r.status==='FAIL').length,blocked:rows.filter(r=>r.status==='BLOCKED').length,results:rows};
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({status:summary.status,checked:summary.checked,passed:summary.passed,failed:summary.failed,blocked:summary.blocked,report_path:output},null,2));
process.exitCode=summary.status==='PASS'?0:2;
