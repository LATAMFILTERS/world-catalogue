#!/usr/bin/env node
'use strict';
// Non-mutating reconciliation of DB source and live public reference arrays.
// No missing code is automatically called a governance-approved omission.
const {Client}=require('pg');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const SKUS=['EA30001','EA10002','EA30003'];
const FIELDS=['oem_codes','competitor_codes'];
const base=process.env.CATALOG_PUBLIC_SEARCH_BASE;
const db=process.env.DATABASE_URL_READONLY;
const out=process.env.REFERENCE_RECONCILIATION_REPORT||path.resolve('out/reference-reconciliation-20261029.json');
const clean=v=>String(v??'').trim().toUpperCase().replace(/[^A-Z0-9]/g,'');
const fieldCode=x=>typeof x==='string'?x:(x?.code??x?.reference??x?.part_number??'');
const fieldMaker=x=>typeof x==='string'?'':(x?.manufacturer??x?.brand??'');
const entry=(x,f)=>({code:clean(fieldCode(x)),maker:clean(fieldMaker(x)),classification:clean(x?.classification),source_type:clean(x?.source_type),field:f});
const key=x=>x.maker+'|'+x.code;
const pairKey=x=>x.field+'|'+key(x);
const digest=x=>crypto.createHash('sha256').update(x).digest('hex').slice(0,16);
function collections(body) {
 const result=[],visited=new Set();
 function scan(v) {
  if(!v||typeof v!=='object'||visited.has(v))return;
  visited.add(v);
  if(Array.isArray(v)){v.forEach(scan);return;}
  if(typeof(v.sku||v.elimfilters_sku)==='string')result.push(v);
  for(const k of ['results','products','matches','candidates','product','alternatives','related'])scan(v[k]);
 }
 scan(body);return result;
}
function group(array) {const map=new Map();for(const x of array){const k=pairKey(x);if(!map.has(k))map.set(k,[]);map.get(k).push(x);}return map;}
async function audit(){
 const report={date:new Date().toISOString(),mode:'READ_ONLY',status:'BLOCKED',scope:SKUS,checks:[],skus:[]};
 if(!db||!base||!/^https:\/\//.test(base)){report.checks.push({status:'BLOCKED',reason:'Missing DATABASE_URL_READONLY or HTTPS CATALOG_PUBLIC_SEARCH_BASE'});return report;}
 const client=new Client({connectionString:db,application_name:'elimfilters-reference-reconciliation-readonly'});
 try{
 await client.connect();
 await client.query('BEGIN TRANSACTION READ ONLY');
 await client.query("SET LOCAL statement_timeout='12000ms'");
 if((await client.query('SHOW transaction_read_only')).rows[0]?.transaction_read_only!=='on')throw Error('Read-only transaction not active');
 for(const sku of SKUS){
  const sql=await client.query('SELECT sku,oem_codes,competitor_codes FROM public.elimfilters_catalog WHERE sku=$1',[sku]);
  if(sql.rows.length!==1){report.checks.push({sku,status:'BLOCKED',reason:'DB SKU not unique/present'});continue;}
  const url=new URL('/api/search',base);url.searchParams.set('q',sku);
  let response,body;
  try{response=await fetch(url,{headers:{accept:'application/json'},signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('HTTP '+response.status);body=await response.json();}
  catch(err){report.checks.push({sku,status:'BLOCKED',reason:'API: '+err.message});continue;}
  const matches=collections(body).filter(x=>String(x.sku||x.elimfilters_sku).toUpperCase()===sku);
  if(matches.length!==1){report.checks.push({sku,status:'BLOCKED',reason:'Public exact match count '+matches.length});continue;}
  const source=sql.rows[0],publicRow=matches[0],records=[],stats={};
  for(const f of FIELDS){
   if(!Array.isArray(source[f])||!Array.isArray(publicRow[f])){report.checks.push({sku,field:f,status:'BLOCKED',reason:'Non-array reference collection'});continue;}
   const original=source[f].map(x=>entry(x,f)),visible=publicRow[f].map(x=>entry(x,f));
   const dbMap=group(original),apiMap=group(visible);
   const dbByCode=new Map();
   for(const x of original){if(!dbByCode.has(x.code))dbByCode.set(x.code,[]);dbByCode.get(x.code).push(x);}
   const other=visible.map(x=>({ ...x,field:f==='oem_codes'?'competitor_codes':'oem_codes'}));
   let exact=0,unbacked=0,ambiguous=0,missing=0,duplicate=0,wrongClass=0;
   for(const [k,rows] of dbMap){if(rows.length>1){duplicate+=rows.length-1;records.push({kind:'DB_DUPLICATE',field:f,key_hash:digest(k),count:rows.length});}
    if(!apiMap.has(k)){missing++;records.push({kind:'NOT_PUBLISHED_UNEXPLAINED',field:f,key_hash:digest(k),db_count:rows.length});}}
   for(const [k,rows] of apiMap){
    const x=rows[0];
    if(!x.code){ambiguous++;records.push({kind:'PUBLIC_EMPTY_CODE',field:f,key_hash:digest(k)});continue;}
    if(dbMap.has(k)){exact++;records.push({kind:'MATCHED_NORMALIZED',field:f,key_hash:digest(k),db_count:dbMap.get(k).length,public_count:rows.length});}
    else {
     const byCode=dbByCode.get(x.code)||[];
     if(byCode.length){ambiguous++;records.push({kind:'MANUFACTURER_MISMATCH_OR_ALIAS',field:f,key_hash:digest(k),source_makers:byCode.length});}
     else{unbacked++;records.push({kind:'PUBLIC_WITHOUT_FIELD_BACKING',field:f,key_hash:digest(k)});}
    }
    if(x.classification){const declared=f==='oem_codes'?['OEM']:['AFTERMARKET','COMPETITOR','CROSSREFERENCE'];if(!declared.includes(x.classification)){wrongClass++;records.push({kind:'PUBLIC_CLASSIFICATION_REVIEW',field:f,key_hash:digest(k),classification:x.classification});}}
   }
   stats[f]={database_entries:original.length,public_entries:visible.length,unique_database:dbMap.size,unique_public:apiMap.size,duplicates_in_database:duplicate,exact_normalized:exact,not_published_unexplained:missing,public_without_field_backing:unbacked,manufacturer_ambiguous:ambiguous,classification_review:wrongClass};
   report.checks.push({sku,field:f,status:unbacked||ambiguous||wrongClass?'FAIL':'BLOCKED',reason:unbacked||ambiguous||wrongClass?'Review published reference integrity':'Publication exclusions are not proven by governance rules'});
  }
  report.skus.push({sku,stats,records});
 }
 await client.query('ROLLBACK');
 }catch(e){report.checks.push({status:'BLOCKED',reason:'Audit error: '+e.message});try{await client.query('ROLLBACK');}catch{}}
 finally{await client.end().catch(()=>{});}
 report.status=report.checks.some(x=>x.status==='FAIL')?'FAIL':'BLOCKED';
 return report;
}
audit().then(report=>{fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checks:report.checks,summary:report.skus.map(x=>({sku:x.sku,stats:x.stats})),report_path:out},null,2));process.exitCode=report.status==='FAIL'?1:2;}).catch(e=>{console.error('BLOCKED:',e.message);process.exitCode=2;});
