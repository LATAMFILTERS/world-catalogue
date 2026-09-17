#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';

const censusDir=path.resolve('elimfilters-vault/91-private-evidence/fram-ld-graphql-harvest');
const manifest=JSON.parse(fs.readFileSync(path.join(censusDir,'latest-manifest.json'),'utf8'));
const census=JSON.parse(fs.readFileSync(path.join(censusDir,manifest.record_file),'utf8'));
const skus=census.records.map(r=>({sku:r.sku,family:r.family}));
const endpoint='https://www.fram.com/graphql';
const concurrency=Number(process.env.HERMES_FRAM_GRAPHQL_CONCURRENCY||16);
const client=axios.create({timeout:45000,headers:{'User-Agent':'ELIMFILTERS-HERMES/1.0','Content-Type':'application/json'}});
const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
function toAttrs(items=[]){
  const out={};
  for(const a of items){
    if(a.__typename==='AttributeValue') out[a.code]=a.value;
    else if(a.__typename==='AttributeSelectedOptions') out[a.code]=(a.selected_options||[]).map(x=>({label:x.label,value:x.value}));
  }
  return out;
}
async function fetchOne(entry){
  const sku=String(entry.sku).replace(/[^A-Za-z0-9._/-]/g,'');
  const query=`query { products(filter:{sku:{eq:"${sku}"}},pageSize:1) { items { sku name url_key categories { name url_path } description { html } custom_attributesV2 { items { code __typename ... on AttributeValue { value } ... on AttributeSelectedOptions { selected_options { label value } } } } } } }`;
  try{
    const r=await client.post(endpoint,{query});
    if(r.data?.errors) throw new Error(r.data.errors.map(x=>x.message).join('; '));
    const p=r.data?.data?.products?.items?.[0]; if(!p) throw new Error('NOT_FOUND');
    return {status:'OK',family:entry.family,sku:p.sku,name:clean(p.name),url_key:p.url_key,categories:p.categories,description:clean(p.description?.html),attributes:toAttrs(p.custom_attributesV2?.items)};
  }catch(e){ return {status:'ERROR',family:entry.family,sku:entry.sku,error:e.message}; }
}
