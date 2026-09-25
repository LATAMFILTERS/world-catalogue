'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
async function run(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!url)throw new Error('Missing database URL');
 const db=new Client({connectionString:url,ssl:false});const report={mode:APPLY?'apply':'dry-run',sku:'EL33387'};await db.connect();
 try{
  await db.query('BEGIN');
  const q=await db.query("select * from public.elimfilters_catalog where sku='EL33387' for update");
  if(q.rowCount!==1)throw new Error('EL33387_NOT_FOUND');
  const row=q.rows[0];
  if(row.codigo_base!=='PH3387A'||row.filter_type!=='oil'||row.duty!=='LIGHT_DUTY'||row.canonical_source_brand!=='FRAM')throw new Error('IDENTITY_MISMATCH');
  if((row.oem_codes||[]).length!==24||(row.competitor_codes||[]).length!==42||(row.vehicle_applications||[]).length!==308)throw new Error('COUNT_MISMATCH');
  const old=row.enrichment_data&&typeof row.enrichment_data==='object'?row.enrichment_data:{};
  const next={...old,codigo_base_governance:{...(old.codigo_base_governance||{}),
   policy_version:'2026-08-29-regional-v3.2',state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',
   origin_group:'NON_EUROPEAN',approved_manufacturer:'FRAM',approved_codigo_base:'PH3387A',approved_source_column:'CANONICAL_POLICY',
   current_codigo_base:'PH3387A',primary_manufacturer_verified:true,required_authority:'REGIONAL_CANONICAL_POLICY_SATISFIED',
   oem_code_count:24,competitor_code_count:42,observed_primary_candidates:[],
   verified_equivalents:['MANN-FILTER W712/22','MANN-FILTER W712/12','MAHLE ML 1000'],
   evidence_note:'FRAM PH3387A is canonical LD non-European oil authority. Secondary equivalents remain alternates only; PG6161, TG3387A and XG3387A resolve publicly to EL33387.'
  },reference_governance_resolution:{
   status:'RESOLVED_WITH_CANONICAL_PRIORITY_AND_PUBLIC_GOVERNANCE',
   governed_references:['PG6161','TG3387A','XG3387A'],canonical_sku:'EL33387',verified_at:new Date().toISOString()
  }};
  report.gateway=assertGovernedCatalogPatch(row,{enrichment_data:next});
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  await db.query("update public.elimfilters_catalog set enrichment_data=$1::jsonb where sku='EL33387'",[JSON.stringify(next)]);
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run134]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run134] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};