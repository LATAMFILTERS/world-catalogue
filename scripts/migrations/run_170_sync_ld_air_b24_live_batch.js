'use strict';
const fs=require('fs'),path=require('path');
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const MANIFEST=path.resolve(__dirname,'../candidates/ld_air_b24_live_verified_20260926.json');
const close=(a,b,tol=1.5)=>Math.abs(Number(a)-Number(b))<=tol;
async function run(){
 const data=JSON.parse(fs.readFileSync(MANIFEST,'utf8'));
 const items=data.candidates||[];
 const db=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:false});
 const report={mode:APPLY?'apply':'dry-run',complete:[],blocked:[]};await db.connect();
 try{
  await db.query('BEGIN');
  for(const item of items){
   const row=(await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[item.sku])).rows[0];
   const identity=(await db.query('select * from ld_catalog.ld_canonical_product_identity where elimfilters_sku=$1',[item.sku])).rows[0];
   if(!row||!identity)throw new Error('ROW_OR_IDENTITY_MISSING:'+item.sku);
   const geometryOk=close(row.outer_diameter_mm,item.official.a_mm)&&close(row.height_mm,item.official.h_mm);
   if(!geometryOk){
    report.blocked.push({sku:item.sku,code:item.code,reason:'OFFICIAL_GEOMETRY_MISMATCH',catalog:{a_mm:row.outer_diameter_mm,h_mm:row.height_mm},official:item.official});
    continue;
   }
   const gov=row.enrichment_data?.codigo_base_governance||{};
   if(row.duty!=='LIGHT_DUTY'||row.filter_type!=='air'||row.catalog_active!==true)throw new Error('SCOPE_MISMATCH:'+item.sku);
   if(row.codigo_base!==item.code)throw new Error('BASE_MISMATCH:'+item.sku);
   if(identity.status!=='ACTIVE'||identity.origin_group!=='EUROPEAN'||identity.canonical_brand!=='MANN-FILTER'||identity.canonical_part_number!==item.code)throw new Error('IDENTITY_MISMATCH:'+item.sku);
   if(gov.state!=='CANONICAL_VERIFIED'||gov.primary_manufacturer_verified!==true||gov.approved_manufacturer!=='MANN-FILTER'||gov.approved_codigo_base!==item.code)throw new Error('GOVERNANCE_MISMATCH:'+item.sku);
   const patch={canonical_source_brand:'MANN-FILTER',canonical_source_code:item.code,canonical_source_url:item.source_url,canonical_source_status:'VERIFIED'};
   const gateway=assertGovernedCatalogPatch(row,patch,{skipApplicationValidation:true});
   if(!gateway.valid)throw new Error('GATEWAY_BLOCKED:'+item.sku);
   report.complete.push({sku:item.sku,code:item.code,gateway});
   if(APPLY) await db.query(`update public.elimfilters_catalog set canonical_source_brand='MANN-FILTER',canonical_source_code=$1,canonical_source_url=$2,canonical_source_status='VERIFIED',canonical_verified_at=now(),canonical_evidence=$3::jsonb where sku=$4`,[item.code,item.source_url,JSON.stringify({authority:'MANN-FILTER',code:item.code,source_url:item.source_url,official:item.official,selection_model:data.selection_model}),item.sku]);
  }  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  for(const x of report.complete){
   const audit=(await db.query('select sku,codigo_base,canonical_source_brand,canonical_source_code,canonical_source_status from public.elimfilters_catalog where sku=$1',[x.sku])).rows[0];
   if(!audit||audit.codigo_base!==x.code||audit.canonical_source_brand!=='MANN-FILTER'||audit.canonical_source_code!==x.code||audit.canonical_source_status!=='VERIFIED')throw new Error('POST_WRITE_AUDIT_FAILED:'+x.sku);
  }
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run170]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run170] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};

