'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{Pool}=require('pg');
const {assertCanonicalWrite}=require('../../lib/catalog-write-gateway');
const ROOT='C:/Users/ELIMSERVER/world-catalogue-pg-gap';
const MANIFEST=path.join(ROOT,'scripts/candidates/donaldson_fuel_unique_remap_restore_ready_20260927.json');
const APPLY=process.argv.includes('--apply');
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v??null)).digest('hex');
function gov(m){return{policy_version:'2026-08-19-v3.1',state:'CANONICAL_VERIFIED',required_authority:'DONALDSON_PRIMARY',approved_manufacturer:'DONALDSON',approved_codigo_base:m.codigo_base,current_codigo_base:m.codigo_base,approved_source_column:'CODIGO_BASE',primary_manufacturer_verified:true,verification_method:'DONALDSON_FUEL_OFFICIAL_CATALOG_20260917_UNIQUE_REMAP_RESTORE',verified_at:new Date().toISOString(),evidence_authority:'DONALDSON_OFFICIAL_CATALOG',evidence_url:m.source_url,evidence_level:'OFFICIAL_PRODUCT_PAGE'};}
(async()=>{
 const rows=JSON.parse(fs.readFileSync(MANIFEST,'utf8'));
 const pool=new Pool({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:{rejectUnauthorized:false},max:1});
 const db=await pool.connect();
 const report={migration:'121_RESTORE_DONALDSON_FUEL_UNIQUE_REMAPS',mode:APPLY?'apply':'dry-run',manifest_rows:rows.length,pass:0,blocked:[],updated:0,audit:{}};
 try{
  await db.query('BEGIN');
  for(const m of rows){
   const q=await db.query("select * from elimfilters_catalog where lower(coalesce(filter_type,''))='fuel' and codigo_base=$1 for update",[m.codigo_base]);
   if(q.rowCount!==1){report.blocked.push({codigo_base:m.codigo_base,reason:'CURRENT_CODE_NOT_UNIQUE',rows:q.rowCount});continue}
   const cur=q.rows[0];
   if(cur.sku!==m.sku){report.blocked.push({codigo_base:m.codigo_base,reason:'SKU_CHANGED_SINCE_MANIFEST',current:cur.sku,expected:m.sku});continue}
   const evidence={dataset:'donaldson_fuel_final_results_20260917.json',source_url:m.source_url,scraped_at:m.scraped_at,source_sku:m.source_sku,current_sku:m.sku,evidence_hash:hash(m)};
   const enrichment={...(cur.enrichment_data||{}),codigo_base_governance:gov(m),donaldson_fuel_unique_remap_restore_20260927:evidence};
   const merged={...cur,oem_codes:Array.isArray(cur.oem_codes)?cur.oem_codes:[],competitor_codes:Array.isArray(cur.competitor_codes)?cur.competitor_codes:[],enrichment_data:enrichment,canonical_source_brand:'DONALDSON',canonical_source_code:m.codigo_base,canonical_source_url:m.source_url,canonical_source_status:'VERIFIED',canonical_verified_at:new Date().toISOString(),canonical_evidence:evidence};
   try{assertCanonicalWrite(merged,{skipApplicationValidation:true});report.pass++}catch(e){report.blocked.push({sku:m.sku,codigo_base:m.codigo_base,reason:e.validation?.reasons||[e.message]});continue}
   if(APPLY){await db.query("update elimfilters_catalog set enrichment_data=$1::jsonb,canonical_source_brand='DONALDSON',canonical_source_code=$2,canonical_source_url=$3,canonical_source_status='VERIFIED',canonical_verified_at=now(),canonical_evidence=$4::jsonb,oem_codes=coalesce(oem_codes,'[]'::jsonb),competitor_codes=coalesce(competitor_codes,'[]'::jsonb) where id=$5",[JSON.stringify(enrichment),m.codigo_base,m.source_url,JSON.stringify(evidence),cur.id]);report.updated++}
  }
  const a=await db.query("select count(*)::int total,count(*) filter(where canonical_source_status='VERIFIED')::int verified,count(*) filter(where canonical_source_brand='DONALDSON' and canonical_source_status='VERIFIED')::int donaldson_verified from elimfilters_catalog where lower(coalesce(filter_type,''))='fuel'");
  report.audit=a.rows[0];
  if(report.blocked.length)throw new Error('RESTORE_BLOCKED:'+report.blocked.length);
  if(APPLY)await db.query('COMMIT');else await db.query('ROLLBACK');
  report.transaction=APPLY?'COMMIT':'ROLLBACK';console.log(JSON.stringify(report,null,2));
 }catch(e){try{await db.query('ROLLBACK')}catch{};report.transaction='ROLLBACK';report.error=e.message;console.log(JSON.stringify(report,null,2));process.exitCode=1}
 finally{db.release();await pool.end()}
})();
