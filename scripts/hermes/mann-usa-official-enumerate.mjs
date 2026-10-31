#!/usr/bin/env node
// Independent US MANN-FILTER LD European-make product discovery from official XML sitemaps.
// No SQL, publication, certification, or dependency on the internal SKU candidate set.
// Discovery completeness is NOT assumed from sitemap enumeration.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const base='https://www.mann-filter.com';
const root=path.resolve(process.argv[2]||'out/hermes-mann-audit/mann-usa-european-ld');
const limit=Number(process.env.MANN_US_MAX_PRODUCTS||10000);
const maxSitemaps=Number(process.env.MANN_US_MAX_SITEMAPS||200);
if(!Number.isInteger(limit)||limit<1||limit>50000)throw Error('BAD_PRODUCT_LIMIT');
fs.mkdirSync(root,{recursive:true});
const progressFile=path.join(root,'official-us-enumeration-progress.json');
const save=(file,data)=>fs.writeFileSync(path.join(root,file),JSON.stringify(data,null,2)+'\n');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const makes=['AUDI','BMW','MERCEDES-BENZ','MERCEDES BENZ','VOLKSWAGEN','VW','PORSCHE','VOLVO','MINI','LAND ROVER','JAGUAR','FIAT','ALFA ROMEO','SAAB','SMART','SKODA','SEAT','RENAULT','PEUGEOT','CITROEN','OPEL','VAUXHALL','BENTLEY','ROLLS-ROYCE','MASERATI','FERRARI','LAMBORGHINI','ASTON MARTIN','BUGATTI','LOTUS'];
const eu=make=>makes.some(m=>make===m||make.startsWith(m+' ('));
const state=fs.existsSync(progressFile)?JSON.parse(fs.readFileSync(progressFile,'utf8')):{sitemaps_visited:[],urls_seen:[],records:[],errors:[]};
const seenSite=new Set(state.sitemaps_visited),seenUrl=new Set(state.urls_seen);
const products=new Map(state.records.map(r=>[r.url,r]));
const errors=state.errors;
const sitemapQueue=['https://www.mann-filter.com/sitemap.xml','https://www.mann-filter.com/sitemap_index.xml','https://www.mann-filter.com/us-en.sitemap.xml'];
const xmlLinks=xml=>[...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map(m=>m[1].replace(/&amp;/g,'&').trim());
const isOfficial=u=>{try{return new URL(u).hostname==='www.mann-filter.com'}catch{return false}};
const isProduct=u=>/\/us-en\/catalog\/search-results\/product\.html\//i.test(u);
const persist=()=>save('official-us-enumeration-progress.json',{sitemaps_visited:[...seenSite],urls_seen:[...seenUrl],records:[...products.values()],errors});
async function get(url){
 const res=await fetch(url,{signal:AbortSignal.timeout(15000),headers:{'User-Agent':'ELIMFILTERS-Evidence-Research/1.0'}});
 if(!res.ok)throw Error('HTTP_'+res.status);
 return await res.text();
}
for(let s=0;s<sitemapQueue.length&&seenSite.size<maxSitemaps;s++){
 const url=sitemapQueue[s];
 if(seenSite.has(url)||!isOfficial(url))continue;
 seenSite.add(url);
 try{
  const xml=await get(url);
  for(const loc of xmlLinks(xml)){
   if(!isOfficial(loc))continue;
   if(/\.xml(?:\?|$)/i.test(loc)){if(!seenSite.has(loc)&&!sitemapQueue.includes(loc))sitemapQueue.push(loc);}
   else if(isProduct(loc))seenUrl.add(loc);
  }
 }catch(e){errors.push({scope:'sitemap',url,error:String(e.message||e)});}
 if(s%10===0)persist();
}
let fetched=0;
for(const url of [...seenUrl]){
 if(products.has(url)||fetched>=limit)continue;
 try{
  const html=await get(url);fetched++;
  const visible=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/\s+/g,' ');
  const code=(visible.match(/\b(?:Product|Produkt|Producto)\s*:\s*([A-Z]{1,3}\s*\d[\d\s/()-]*[A-Z]?(?:-\d+)?)(?=\s|$)/i)||[])[1]||'';
  const slug=decodeURIComponent(url.split('/product.html/')[1]?.replace(/_mann-filter\.html.*$/,'')||'');
  const identity=Boolean(code&&norm(code)===norm(slug));
  const headers=[...html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/gi)].map(m=>m[1].trim());
  const candidateMakes=headers.filter(h=>/\(USA\)/i.test(h)).map(h=>h.replace(/\s*\(USA\).*$/i,'').toUpperCase());
  const europeMakes=candidateMakes.filter(eu);
  const ld=europeMakes.length>0&&/\b(?:Air Filter|Oil Filter|Fuel Filter|Cabin Air Filter|Interior Filter)\b/i.test(visible);
  products.set(url,{url,mann_code:code.trim()||null,source_sha256:sha(html),identity_verified:identity,
   usa_vehicle_makes:candidateMakes,european_usa_vehicle_makes:europeMakes,ld_european_vehicle_evidence:ld,status:ld&&identity?'US_EUROPEAN_LD_PRODUCT_OBSERVED':'NOT_US_EUROPEAN_LD_CONFIRMED'});
 }catch(e){errors.push({scope:'product',url,error:String(e.message||e)});}
 if(fetched%25===0)persist();
}
persist();
const baseline=[...products.values()].filter(r=>r.ld_european_vehicle_evidence&&r.identity_verified);
const codeMap=new Map();
for(const r of baseline){const k=norm(r.mann_code);if(!codeMap.has(k))codeMap.set(k,{mann_code:r.mann_code,official_url:r.url,usa_ld_source_evidence:r.url,european_vehicle_make:r.european_usa_vehicle_makes.join(';'),source_sha256:r.source_sha256});}
save('official-usa-european-ld-observed.json',[...codeMap.values()]);
const report={sitemaps_read:seenSite.size,official_us_product_urls_discovered:seenUrl.size,product_pages_inspected:products.size,
usa_european_ld_codes_observed:codeMap.size,errors:errors.length,sitemap_complete:false,enumeration_completeness:'NOT_PROVEN',
status:'REVIEW_REQUIRED',certified:0,postgres_writes:0,publication:false};
save('official-us-enumeration-summary.json',report);
console.log(JSON.stringify(report,null,2));
