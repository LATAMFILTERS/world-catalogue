'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');

async function run(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
 if(!url) throw new Error('Missing database URL');
 const db=new Client({connectionString:url,ssl:false});
 const report={mode:APPLY?'apply':'dry-run',sku:'EL30158'};
 await db.connect();
 try{
  await db.query('BEGIN');
  const q=await db.query("select * from public.elimfilters_catalog where sku='EL30158' for update");
  if(q.rowCount!==1) throw new Error('EL30158_NOT_FOUND');
  const row=q.rows[0];
  const old=row.enrichment_data||{};
  const next={
   ...old,
   codigo_base_governance:{
    ...(old.codigo_base_governance||{}),
    policy_version:'2026-08-29-regional-v3.2',
    state:'CANONICAL_VERIFIED',
    governance_state:'CANONICAL_VERIFIED',
    origin_group:'NON_EUROPEAN',
    approved_manufacturer:'FRAM',
    approved_codigo_base:'CH10158',
    approved_source_column:'CANONICAL_POLICY',
    current_codigo_base:'CH10158',
    primary_manufacturer_verified:true,
    required_authority:'REGIONAL_CANONICAL_POLICY_SATISFIED',
    oem_code_count:Array.isArray(row.oem_codes)?row.oem_codes.length:0,
    competitor_code_count:Array.isArray(row.competitor_codes)?row.competitor_codes.length:0,
    verified_equivalents:['MANN-FILTER HU7009Z'],
    evidence_note:'FRAM CH10158 is canonical LD non-European oil authority; MANN-FILTER HU7009Z is a verified equivalent and secondary evidence source.'
   }
  };
  report.gateway=assertGovernedCatalogPatch(row,{enrichment_data:next});
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  await db.query("update public.elimfilters_catalog set enrichment_data=$1::jsonb where sku='EL30158'",[JSON.stringify(next)]);
  await db.query("select refresh_crossref_cache_sku('EL30158')");
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run128]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run128] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};