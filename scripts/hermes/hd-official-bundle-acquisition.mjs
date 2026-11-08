#!/usr/bin/env node
// Read-only official source acquisition from HD canonical identity.
// Does not search arbitrary web; retrieves only already governed official source URLs.
import pg from 'pg';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
export function isTrustedOfficialUrl(url,hosts){
  try {
    const u=new URL(url);
    return u.protocol==='https:' && !u.username && !u.password && u.port==='' &&
      hosts.some(host=>u.hostname.toLowerCase()===host || u.hostname.toLowerCase().endsWith('.'+host));
  }catch{return false;}
}
export async function acquireOfficialBundles({skus,directory,allowedHosts,client,fetcher=fetch,timeoutMs=18000}){
  const hosts=String(allowedHosts||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
  if(!hosts.length) throw Error('OFFICIAL_SOURCE_ALLOWLIST_REQUIRED');
  const clean=[...new Set(skus.map(x=>String(x).toUpperCase()))].filter(x=>/^[A-Z0-9_-]{2,45}$/.test(x));
  if(!clean.length) return {written:0,skipped:0,results:[]};
  await fs.mkdir(directory,{recursive:true});
  const {rows}=await client.query(
    `SELECT sku, canonical_source_url AS url, canonical_source_code AS code
       FROM public.elimfilters_catalog
      WHERE duty='HEAVY_DUTY' AND catalog_active=true AND sku=ANY($1::text[])`,[clean]
  );
  const bySku=new Map(rows.map(r=>[r.sku,r]));
  const results=[];
  for(const sku of clean){
    const item=bySku.get(sku),dest=path.join(directory,sku+'.json');
    if(!item){results.push({sku,status:'NO_ACTIVE_HD_RECORD'});continue;}
    try{await fs.access(dest);results.push({sku,status:'EXISTS'});continue;}
    catch(error){if(error.code!=='ENOENT') throw error;}
    if(!item.code || !isTrustedOfficialUrl(item.url,hosts)){results.push({sku,status:'NO_TRUSTED_CANONICAL_URL_OR_CODE'});continue;}
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
    try{
      const response=await fetcher(item.url,{signal:controller.signal,redirect:'manual',headers:{'User-Agent':'ELIMFILTERS-HERMES-EVIDENCE/1.0'}});
      if(!response.ok || (response.status>=300&&response.status<400)){results.push({sku,status:'OFFICIAL_FETCH_FAILED',http:response.status});continue;}
      const type=String(response.headers?.get?.('content-type')||'');
      if(!/text\/html|text\/plain|application\/json/i.test(type)){results.push({sku,status:'UNSUPPORTED_SOURCE_FORMAT'});continue;}
      const raw=await response.text();
      if(raw.length>200000){results.push({sku,status:'SOURCE_TOO_LARGE'});continue;}
      const cleanText=raw.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
      if(cleanText.length<40||!norm(cleanText).includes(norm(item.code))){results.push({sku,status:'EXACT_CANONICAL_CODE_NOT_ON_SOURCE'});continue;}
      const digest=crypto.createHash('sha256').update(cleanText,'utf8').digest('hex');
      const bundle={sku,sources:[{url:item.url,content:cleanText.slice(0,50000),sha256:crypto.createHash('sha256').update(cleanText.slice(0,50000),'utf8').digest('hex'),source_type:'official_product_page'}]};
      const tmp=dest+'.tmp-'+process.pid;
      await fs.writeFile(tmp,JSON.stringify(bundle)+'\n',{flag:'wx'});
      await fs.rename(tmp,dest);
      results.push({sku,status:'BUNDLE_CREATED',sha256:digest});
    }catch(error){results.push({sku,status:'OFFICIAL_FETCH_ERROR',error:String(error.message||error).slice(0,120)});}
    finally{clearTimeout(timer);}
  }
  return {written:results.filter(x=>x.status==='BUNDLE_CREATED').length,skipped:results.filter(x=>x.status!=='BUNDLE_CREATED').length,results};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const flags={};
  for(let i=2;i<process.argv.length;i+=2)flags[process.argv[i].replace(/^--/,'')]=process.argv[i+1];
  if(!flags['sku-file']||!flags['bundle-dir']||!flags['allowed-hosts'])throw Error('REQUIRED_FLAGS_MISSING');
  const skus=(await fs.readFile(flags['sku-file'],'utf8')).split(/\r?\n/).filter(Boolean);
  const client=new pg.Client({
    host:process.env.PGHOST||'127.0.0.1',
    port:Number(process.env.PGPORT||5432),
    database:process.env.PGDATABASE||'catalogo_elimfilters',
    user:process.env.PGUSER||'postgres',
    password:process.env.PGPASSWORD||undefined,
    connectionTimeoutMillis:4500
  });
  await client.connect();
  try{console.log(JSON.stringify(await acquireOfficialBundles({skus,directory:flags['bundle-dir'],allowedHosts:flags['allowed-hosts'],client}),null,2));}
  finally{await client.end();}
}
