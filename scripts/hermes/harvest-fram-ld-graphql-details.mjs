#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';

const endpoint='https://www.fram.com/graphql';
const pageSize=100;
const outDir=path.resolve('elimfilters-vault/91-private-evidence/fram-ld-graphql-details');
const client=axios.create({timeout:60000,headers:{'User-Agent':'ELIMFILTERS-HERMES/1.0','Content-Type':'application/json'}});
const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
function family(p){
  const cats=(p.categories||[]).map(c=>clean(c.name)).join(' | ');
  const text=`${clean(p.name)} ${p.url_key||''} ${cats}`.toLowerCase();
  if(/heavy\s*duty|\bhd\b|commercial|racing/.test(text)) return null;
  if(/cabin/.test(text)) return 'CABIN';
  if(/fuel/.test(text)) return 'FUEL';
  if(/engine air|air filter|air-filter/.test(text)) return 'AIR';
  if(/oil filter|oil-filter|lube/.test(text)) return 'LUBE';
  return null;
}
function attrs(p){
  const out={};
  for(const a of p.custom_attributesV2?.items||[]){
    if(a.__typename==='AttributeValue') out[a.code]=a.value;
    else if(a.__typename==='AttributeSelectedOptions') out[a.code]=(a.selected_options||[]).map(x=>({label:x.label,value:x.value}));
  }
  return out;
}
async function fetchPage(n){
  const query=`query { products(search:"",pageSize:${pageSize},currentPage:${n}) { total_count page_info { total_pages current_page } items { sku name url_key categories { name url_path } description { html } custom_attributesV2(filters:{is_visible_on_front:true}) { items { code __typename ... on AttributeValue { value } ... on AttributeSelectedOptions { selected_options { label value } } } } } } }`;
  const r=await client.post(endpoint,{query});
  if(r.data?.errors) throw new Error(JSON.stringify(r.data.errors));
  return r.data.data.products;
}
fs.mkdirSync(outDir,{recursive:true});
const first=await fetchPage(1);
const records=[];
for(let n=1;n<=first.page_info.total_pages;n++){
  const p=n===1?first:await fetchPage(n);
  for(const item of p.items){
    const f=family(item); if(!f) continue;
    records.push({sku:item.sku,family:f,name:clean(item.name),url_key:item.url_key,categories:item.categories,description:clean(item.description?.html),attributes:attrs(item)});
  }
  if(n%5===0||n===first.page_info.total_pages) console.log(`[FRAM details] page ${n}/${first.page_info.total_pages} ld=${records.length}`);
}
const unique=[...new Map(records.map(r=>[String(r.sku).toUpperCase(),r])).values()];
const metrics={};
for(const f of ['LUBE','AIR','CABIN','FUEL']){
  const rows=unique.filter(r=>r.family===f);
  metrics[f]={count:rows.length,with_weight:rows.filter(r=>r.attributes.weight).length,with_dimensions:rows.filter(r=>r.attributes.height||r.attributes.width||r.attributes.length||r.attributes.outer_diameter||r.attributes.outside_diameter).length};
}
const runId=`fram-ld-details-${new Date().toISOString().replace(/[:.]/g,'-')}`;
const out={schema_version:'1.0.0',run_id:runId,source:'FRAM_MAGENTO_GRAPHQL',private_evidence_only:true,europe_promotion_allowed:false,mann_filter_non_europe_role:'Cross Reference Competitor',total_catalog:first.total_count,ld_unique:unique.length,metrics,records:unique};
const file=path.join(outDir,`${runId}.json`); fs.writeFileSync(file,JSON.stringify(out,null,2)+'\n');
fs.writeFileSync(path.join(outDir,'latest-manifest.json'),JSON.stringify({...out,records:undefined,record_file:path.basename(file)},null,2)+'\n');
console.log(JSON.stringify({ld_unique:unique.length,metrics,output:file},null,2));
