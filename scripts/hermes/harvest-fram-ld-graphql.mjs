#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';

const endpoint='https://www.fram.com/graphql';
const pageSize=Number(process.env.HERMES_FRAM_GRAPHQL_PAGE_SIZE||100);
const outDir=path.resolve('elimfilters-vault/91-private-evidence/fram-ld-graphql-harvest');
const client=axios.create({timeout:45000,headers:{'User-Agent':'ELIMFILTERS-HERMES/1.0','Content-Type':'application/json'}});
const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
function classify(p){
  const cats=(p.categories||[]).map(c=>clean(c.name)).join(' | ');
  const text=`${clean(p.name)} ${p.url_key||''} ${cats}`.toLowerCase();
  if(/heavy\s*duty|\bhd\b|commercial|racing/.test(text)) return null;
  if(/cabin/.test(text)) return 'CABIN';
  if(/fuel/.test(text)) return 'FUEL';
  if(/engine air|air filter|air-filter/.test(text)) return 'AIR';
  if(/oil filter|oil-filter|lube/.test(text)) return 'LUBE';
  return null;
}
async function page(n){
  const query=`query { products(search:"",pageSize:${pageSize},currentPage:${n}) { total_count page_info { total_pages current_page page_size } items { sku name url_key categories { name url_path } } } }`;
  const r=await client.post(endpoint,{query});
  if(r.data?.errors) throw new Error(JSON.stringify(r.data.errors));
  return r.data.data.products;
}
fs.mkdirSync(outDir,{recursive:true});
const first=await page(1);
const all=[...first.items];
for(let n=2;n<=first.page_info.total_pages;n++){
  const p=await page(n); all.push(...p.items);
  if(n%5===0||n===first.page_info.total_pages) console.log(`[FRAM GraphQL] page ${n}/${first.page_info.total_pages} raw=${all.length}`);
}
const unique=[...new Map(all.map(p=>[String(p.sku).toUpperCase(),p])).values()];
const ld=unique.map(p=>({...p,family:classify(p)})).filter(p=>p.family);
const byFamily=Object.fromEntries(['LUBE','AIR','CABIN','FUEL'].map(f=>[f,ld.filter(p=>p.family===f).length]));
const runId=`fram-ld-graphql-${new Date().toISOString().replace(/[:.]/g,'-')}`;
const payload={schema_version:'1.0.0',run_id:runId,source:'FRAM_MAGENTO_GRAPHQL',endpoint,total_catalog_products:first.total_count,raw_products:all.length,unique_products:unique.length,allowed_families:['LUBE','AIR','CABIN','FUEL'],europe_promotion_allowed:false,mann_filter_non_europe_role:'Cross Reference Competitor',ld_candidate_count:ld.length,by_family:byFamily,records:ld.map(p=>({sku:p.sku,family:p.family,name:clean(p.name),url_key:p.url_key,categories:p.categories}))};
const runPath=path.join(outDir,`${runId}.json`);
fs.writeFileSync(runPath,JSON.stringify(payload,null,2)+'\n');
fs.writeFileSync(path.join(outDir,'latest-manifest.json'),JSON.stringify({...payload,records:undefined,record_file:path.basename(runPath)},null,2)+'\n');
for(const f of ['LUBE','AIR','CABIN','FUEL']) fs.writeFileSync(path.join(outDir,`${f.toLowerCase()}-skus.json`),JSON.stringify(ld.filter(p=>p.family===f),null,2)+'\n');
console.log(JSON.stringify({total_catalog:first.total_count,unique:unique.length,ld_candidates:ld.length,by_family:byFamily,output:runPath},null,2));
