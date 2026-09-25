'use strict';
const {Client}=require('pg');
const {applyVerifiedApplications}=require('../../lib/catalog-application-write-service');
const APPLY=process.argv.includes('--apply');
const SKU='EA30242';
const HASH='bb4eff523e3a6d808894f0234abffe7602477be5a65cf9bdf9328f29c5527e71';
const SOURCE_URL='https://www.showmethepartsdb.com/bin/showmeconnect.exe';
async function run(){
 const db=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:false});
 const report={mode:APPLY?'apply':'dry-run'};await db.connect();
 try{
  await db.query('BEGIN');
  const row=(await db.query("select sku,codigo_base,canonical_source_brand,vehicle_applications from public.elimfilters_catalog where sku=$1 for update",[SKU])).rows[0];
  if(!row||row.codigo_base!=='CA10242'||row.canonical_source_brand!=='FRAM') throw new Error('EA30242_CANONICAL_STATE_REQUIRED');
  report.before=(row.vehicle_applications||[]).length;
  if(report.before!==20) throw new Error('UNEXPECTED_LEGACY_APP_COUNT_'+report.before);
  report.gateway=await applyVerifiedApplications(db,{sku:SKU,vehicle_applications:[],evidence:{authority:'FRAM_CA10242_CANONICAL_MISMATCH_CLEANUP',source_url:SOURCE_URL,evidence_hash:HASH,metadata:{reason:'REMOVE_LEGACY_KIA_TOYOTA_APPLICATIONS_NOT_SUPPORTED_BY_CANONICAL_FRAM_CA10242'}}});
  const after=(await db.query("select jsonb_array_length(coalesce(vehicle_applications,'[]'::jsonb)) n from public.elimfilters_catalog where sku=$1",[SKU])).rows[0].n;
  report.after=after;
  if(after!==0) throw new Error('APPLICATION_CLEANUP_FAILED');
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}
 finally{await db.end();}
}
if(require.main===module){
 run().then(r=>console.log('[run153]',JSON.stringify(r,null,2))).catch(e=>{
  console.error('[run153] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1);
 });
}
module.exports={run};


