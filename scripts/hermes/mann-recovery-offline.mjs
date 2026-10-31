#!/usr/bin/env node
// Reconcile failed MANN URLs with captured official pages and recover partial European applications.
// Never fetches failed URLs; no DB/catalogue access, no automatic certification.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {isEuropeanMake} from './ld-origin-group.mjs';
const root=path.resolve(process.argv[2]||'out/hermes-mann-audit');
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const dirs=fs.readdirSync(root,{withFileTypes:true}).filter(d=>d.isDirectory()&&fs.existsSync(path.join(root,d.name,'manifest.json'))).map(d=>path.join(root,d.name));
const records=dirs.flatMap(dir=>JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8')).records.map(r=>({...r,dir})));
const successes=records.filter(r=>r.result==='EVIDENCE_CAPTURED');
const index=new Map();
for(const r of successes){
 const code=norm(r.canonical_base_claim);
 if(!index.has(code))index.set(code,[]);
 index.get(code).push(r);
}
const failures=records.filter(r=>r.result!=='EVIDENCE_CAPTURED');
const recovered=[],applications=[];
for(const r of failures){
 const prior=index.get(norm(r.canonical_base_claim))||[];
 recovered.push({sku:r.sku,mann_code:r.canonical_base_claim,original_status:r.result,
   exact_cached_official_code_candidates:prior.filter(p=>p.sku!==r.sku).map(p=>({sku:p.sku,url:p.evidence.url,sha256:p.evidence.sha256})),
   resolution_status:prior.some(p=>p.sku!==r.sku)?'EXACT_MANN_CODE_EVIDENCE_REQUIRES_FAMILY_AND_ELIMFILTERS_REVIEW':'NOT_FOUND_IN_CACHED_OFFICIAL_PAGES'});
}
for(const r of successes){
 const file=path.join(r.dir,r.evidence.file);
 const html=fs.readFileSync(file,'utf8');
 if(sha(html)!==r.evidence.sha256)throw Error('HASH_MISMATCH '+r.sku);
 const re=/<a\b([^>]*data-g-binding-params="([^"]+)"[^>]*)>/gi;
 const seen=new Set();
 for(const m of html.matchAll(re)){
  if(!/data-g-binding-application-link\b/.test(m[1]))continue;
  let query;
  try{query=new URLSearchParams(decodeURIComponent(m[2].replace(/&amp;/gi,'&')).replace(/^\?/,''));}catch{continue;}
  if(query.get('mode')!=='application')continue;
  const make=query.get('vehicleMake');
  if(!make||!isEuropeanMake(make))continue;
  const model=query.get('vehicleModel'),variant=query.get('vehicleName');
  const started=query.get('vehicleManufacturedFrom'),ended=query.get('vehicleManufacturedTo');
  const year=/^(19|20)\d{2}$/.test(model||'')?Number(model):null;
  const manufacturedYear=/^(19|20)\d{2}-\d{2}-\d{2}$/.test(started||'')?Number(started.slice(0,4)):null;
  const id=query.get('vehicleTypeId')||null;
  const sourceFieldsComplete=Boolean(make&&model&&variant&&id&&manufacturedYear&&query.get('engineCode'));
  const missingFields=[['model_series',model],['vehicle_variant',variant],['type_id',id],['manufactured_from',manufacturedYear],['engine_code',query.get('engineCode')]].filter(([,v])=>!v).map(([name])=>name);
  const identity=[make,model,variant,id,query.get('engineCode')].join('|');
  if(seen.has(identity))continue;seen.add(identity);
  applications.push({sku:r.sku,mann_code:r.canonical_base_claim,make,model:variant||null,model_series:model||null,
   type_id:id,year:year,manufactured_start_year:manufacturedYear,manufactured_from:started||null,manufactured_to:ended||null,engine_code_literal:query.get('engineCode')||null,missing_fields:missingFields,
   source_url:r.evidence.url,source_sha256:r.evidence.sha256,
   status:sourceFieldsComplete?'EUROPEAN_SOURCE_ROW_REVIEW_REQUIRED':'EUROPEAN_PARTIAL_ROW_REVIEW_REQUIRED'});
 }
}
const missingFieldCounts=Object.fromEntries(['model_series','vehicle_variant','type_id','manufactured_from','engine_code'].map(field=>[field,applications.filter(r=>r.missing_fields.includes(field)).length]));
const searchQueue=recovered.filter(r=>r.original_status==='REVIEW_REQUIRED'&&r.exact_cached_official_code_candidates.length===0).map(r=>({sku:r.sku,mann_code:r.mann_code,official_catalog_search:'https://www.mann-filter.com/en/catalog.html',query_term:r.mann_code,status:'OFFICIAL_CATALOG_SEARCH_REQUIRED',direct_product_urls_reused:false}));
const report={source_records:records.length,failed_records:failures.length,exact_cached_code_candidates:recovered.filter(r=>r.exact_cached_official_code_candidates.length).length,
 european_source_rows:applications.length,european_partial_rows:applications.filter(r=>r.status==='EUROPEAN_PARTIAL_ROW_REVIEW_REQUIRED').length,missing_field_counts:missingFieldCounts,search_queue_count:searchQueue.length,
 status:'REVIEW_REQUIRED',certified:0,postgres_writes:0,publication:false};
fs.writeFileSync(path.join(root,'404-cached-crosscheck.json'),JSON.stringify(recovered,null,2)+'\n');
fs.writeFileSync(path.join(root,'european-application-source-rows.json'),JSON.stringify(applications,null,2)+'\n');
fs.writeFileSync(path.join(root,'404-official-search-queue.json'),JSON.stringify(searchQueue,null,2)+'\n');
fs.writeFileSync(path.join(root,'recovery-summary.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
