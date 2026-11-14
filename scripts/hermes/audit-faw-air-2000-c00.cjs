'use strict';
/**
 * HERMES #1304: FAW 2000-C00 exact-code read-only catalogue audit.
 * This script never inserts/updates records. No implicit correction of the operator's original code.
 * Run: node scripts/hermes/audit-faw-air-2000-c00.cjs
 */
require('dotenv').config();
const { Client } = require('pg');
const crypto = require('crypto');

const TARGET_SKUS=['EK50401','EA17800','EA16229'];
const GROUPS={
  original_received:['1090702000C00'],
  primary_faw:['11090602000','11090602000C00','11090602000C00B'],
  primary_mann:['C27800'],
  safety_faw:['11090702000','11090702000C00','11090702000C00A'],
  safety_mann:['CF16229'],
  primary_donaldson_candidate:['R005061'],
  safety_donaldson_candidate:['P641356'],
  kit_mann:['SP26522'],
  kit_fleetguard_candidate:['AA90179'],
  kit_hengst_candidate:['E1896L2']
};
const normalize=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const wanted=[...new Set(Object.values(GROUPS).flat().map(normalize))];
function matches(value){return wanted.includes(normalize(value));}
function classify(code){return Object.entries(GROUPS).filter(([,codes])=>codes.map(normalize).includes(normalize(code))).map(([key])=>key);}
function refs(row){
 const result=[];
 for(const field of ['oem_codes','competitor_codes']){
  for(const r of (Array.isArray(row[field])?row[field]:[])){
   const code=r && (r.code || r.reference);
   if(matches(code)) result.push({field,manufacturer:r.manufacturer||r.brand||null,code,groups:classify(code)});
  }
 }
 return result;
}
function report(rows){
 const targets=rows.filter(r=>TARGET_SKUS.includes(r.sku));
 const found=rows.flatMap(r=>[...refs(r),...['codigo_base','canonical_source_code'].filter(field=>matches(r[field])).map(field=>({field,manufacturer:field==='canonical_source_code'?r.canonical_source_brand:null,code:r[field],groups:classify(r[field])}))].map(hit=>({sku:r.sku,...hit})));
 return {status:'NO_GO_READ_ONLY',operator_code:'1090702000C00',operator_code_exact_matches:found.filter(x=>x.groups.includes('original_received')),
   target_skus:TARGET_SKUS.map(sku=>{const row=targets.find(r=>r.sku===sku);return row?
     {sku,found:true,active:row.catalog_active,duty:row.duty,filter_type:row.filter_type,codigo_base:row.codigo_base,
      canonical_source_brand:row.canonical_source_brand,canonical_source_code:row.canonical_source_code,
      oem_count:Array.isArray(row.oem_codes)?row.oem_codes.length:null,
      competitor_count:Array.isArray(row.competitor_codes)?row.competitor_codes.length:null,
      applications_count:Array.isArray(row.equipment_applications)?row.equipment_applications.length:null,
      record_sha256:crypto.createHash('sha256').update(JSON.stringify(row)).digest('hex')}:
     {sku,found:false};}),
   reference_matches:found,
   grouped_matches:Object.fromEntries(Object.keys(GROUPS).map(group=>[group,found.filter(x=>x.groups.includes(group))])),
   follow_up:'Check base references, canonical governance and overlap before any SKU/kit changes'};
}
async function main(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
 if(!url)throw Error('DATABASE_URL_MISSING');
 const db=new Client({connectionString:url,ssl:/@(127\.0\.0\.1|localhost)[:/]/.test(url)?false:{rejectUnauthorized:false}});
 await db.connect();
 try{
  await db.query('BEGIN READ ONLY');
  await db.query("SET LOCAL statement_timeout='45000ms'");
  const {rows}=await db.query("SELECT sku,codigo_base,filter_type,duty,catalog_active,canonical_source_brand,canonical_source_code,oem_codes,competitor_codes,equipment_applications FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) OR regexp_replace(upper(COALESCE(codigo_base,'')),'[^A-Z0-9]','','g')=ANY($2::text[]) OR regexp_replace(upper(COALESCE(canonical_source_code,'')),'[^A-Z0-9]','','g')=ANY($2::text[]) OR EXISTS(SELECT 1 FROM jsonb_array_elements(COALESCE(oem_codes,'[]'::jsonb) || COALESCE(competitor_codes,'[]'::jsonb)) x WHERE regexp_replace(upper(COALESCE(x->>'code',x->>'reference','')),'[^A-Z0-9]','','g')=ANY($2::text[]))", [TARGET_SKUS,wanted]);
  console.log(JSON.stringify(report(rows),null,2));
  await db.query('ROLLBACK');
 }catch(e){await db.query('ROLLBACK').catch(()=>{});throw e;}
 finally{await db.end();}
}
if(require.main===module)main().catch(e=>{console.error('NO_GO',e.message);process.exitCode=1;});
module.exports={TARGET_SKUS,GROUPS,normalize,classify,refs,report};
