'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const ITEMS=[
 {sku:'EA30118',code:'CA10118',hash:'411f8fbede086f3daa6852a2fc855397753720bed7afaec541d46b0251fc9f35',canonical:'C118'},
 {sku:'EA30193',code:'CA10193',hash:'c4b24a2839f07696d2c77f27047ad6dd1e61ea1fe1d5ccc5049c0ec4d0a0e2d8',canonical:'C40193'}
];
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
async function run(){
 const db=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:false});
 const report={mode:APPLY?'apply':'dry-run',items:[]}; await db.connect();
 try{
  await db.query('BEGIN');
  for(const item of ITEMS){
   const row=(await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[item.sku])).rows[0];
   if(!row||row.codigo_base!==item.canonical||row.duty!=='LIGHT_DUTY'||row.filter_type!=='air') throw new Error('SCOPE_MISMATCH_'+item.sku);
   const next=(row.competitor_codes||[]).filter(x=>!(norm(x.manufacturer||x.brand)==='FRAM'&&norm(x.code||x.part_number||x.reference)===item.code));
   const removed=(row.competitor_codes||[]).length-next.length;
   if(removed!==1) throw new Error('EXPECTED_ONE_REF_'+item.sku);
   const gateway=assertGovernedCatalogPatch(row,{competitor_codes:next},{
    referenceCorrection:true,
    correctionEvidence:{
     authority:'FRAM_USA_LD_HARVEST_20260911',
     source_url:'local://fram-usa-ld-full-20260911/products/'+item.code+'.json',
     evidence_hash:item.hash,
     reason:'REMOVE_FRAM_SUFFIX_COLLISION_FROM_MANN_CANONICAL_AIR_FAMILY'
    }
   });
   report.items.push({sku:item.sku,code:item.code,removed,gateway});
   if(APPLY){
    await db.query('update public.elimfilters_catalog set competitor_codes=$1::jsonb where sku=$2',[JSON.stringify(next),item.sku]);
    await db.query('delete from public.crossref_resolved_cache where sku=$1 and code=$2',[item.sku,item.code]);
    await db.query('select refresh_crossref_cache_sku($1)',[item.sku]);
   }
  }
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  for(const item of ITEMS){
   const bad=(await db.query('select code,sku from public.v_api_resolver_v5 where code=$1 and sku=$2',[item.code,item.sku])).rows;
   if(bad.length) throw new Error('BAD_ROUTE_REMAINS_'+item.sku);
   const id=(await db.query('select canonical_brand,canonical_part_number,status from ld_catalog.ld_canonical_product_identity where elimfilters_sku=$1',[item.sku])).rows[0];
   if(!id||id.canonical_brand!=='MANN-FILTER'||id.canonical_part_number!==item.canonical||id.status!=='ACTIVE') throw new Error('CANONICAL_IDENTITY_CHANGED_'+item.sku);
  }
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}
 finally{await db.end();}
}
if(require.main===module){
 run().then(r=>console.log('[run149]',JSON.stringify(r,null,2))).catch(e=>{
  console.error('[run149] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1);
 });
}
module.exports={run};
