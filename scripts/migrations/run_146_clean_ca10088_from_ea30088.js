'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const SKU='EA30088';
const BAD_CODE='CA10088';
const HASH='fef4d9e29906f5a94494838250f82bc2506887716c30ff8d930b0779c7e9e13c';
const SOURCE='FRAM_USA_LD_HARVEST_20260911';
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
async function run(){
 const db=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:false});
 const report={mode:APPLY?'apply':'dry-run'}; await db.connect();
 try{
  await db.query('BEGIN');
  const row=(await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[SKU])).rows[0];
  if(!row) throw new Error('EA30088_NOT_FOUND');
  const next=(row.competitor_codes||[]).filter(x=>!(norm(x.manufacturer||x.brand)==='FRAM'&&norm(x.code||x.part_number||x.reference)===BAD_CODE));
  report.before=(row.competitor_codes||[]).length; report.after=next.length; report.removed=report.before-report.after;
  if(report.removed!==1) throw new Error('EXPECTED_ONE_CA10088_REFERENCE');
  report.gateway=assertGovernedCatalogPatch(row,{competitor_codes:next},{
   referenceCorrection:true,
   correctionEvidence:{
    authority:SOURCE,
    source_url:'local://fram-usa-ld-full-20260911/products/CA10088.json',
    evidence_hash:HASH,
    reason:'REMOVE_CA10088_FROM_MANN_C88_FAMILY_APPLICATION_MISMATCH'
   }
  });
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  await db.query('update public.elimfilters_catalog set competitor_codes=$1::jsonb where sku=$2',[JSON.stringify(next),SKU]);
  await db.query("delete from ld_catalog.ld_competitor_cross_references where elimfilters_sku=$1 and regexp_replace(upper(competitor_part_number),'[^A-Z0-9]','','g')=$2",[SKU,BAD_CODE]);
  await db.query('delete from public.crossref_resolved_cache where sku=$1 and code=$2',[SKU,BAD_CODE]);
  await db.query('select refresh_crossref_cache_sku($1)',[SKU]);
  const v5=(await db.query("select code,sku,manufacturer from public.v_api_resolver_v5 where code=$1 order by code,sku",[BAD_CODE])).rows;
  report.v5=v5;
  if(v5.some(r=>r.sku===SKU)) throw new Error('CA10088_STILL_RESOLVES_TO_EA30088');
  const identity=(await db.query("select canonical_brand,canonical_part_number,status from ld_catalog.ld_canonical_product_identity where elimfilters_sku=$1",[SKU])).rows[0];
  const audit=(await db.query("select sku,catalog_active,codigo_base from public.elimfilters_catalog where sku=$1",[SKU])).rows[0];
  report.identity=identity; report.audit=audit;
  if(!identity||identity.canonical_brand!=='MANN-FILTER'||identity.canonical_part_number!=='C88'||identity.status!=='ACTIVE') throw new Error('C88_CANONICAL_IDENTITY_MISSING');
  if(!audit?.catalog_active||audit.codigo_base!=='C88') throw new Error('EA30088_CANONICAL_ROW_MISMATCH');
  await db.query('COMMIT'); report.transaction='COMMIT'; return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){} e.report=report; throw e;}
 finally{await db.end();}
}
if(require.main===module){
 run().then(r=>console.log('[run146]',JSON.stringify(r,null,2))).catch(e=>{
  console.error('[run146] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1);
 });
}
module.exports={run};
