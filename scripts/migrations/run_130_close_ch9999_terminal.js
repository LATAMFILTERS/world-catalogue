'use strict';
const fs=require('fs');
const path=require('path');
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const TARGET='EL39999', WRONG='EH61818', CODE='7061';
const MANIFEST=path.resolve(__dirname,'../candidates/premium_guard_oil_phase3_block2_canonical_20260923.json');
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const refCode=x=>norm(x?.code||x?.part_number||x?.reference);
async function run(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!url)throw new Error('Missing database URL');
 const item=JSON.parse(fs.readFileSync(MANIFEST,'utf8')).find(x=>x.sku===TARGET);if(!item)throw new Error('CH9999_MANIFEST_MISSING');
 const db=new Client({connectionString:url,ssl:false});const report={mode:APPLY?'apply':'dry-run',target:TARGET,wrong:WRONG};await db.connect();
 try{
  await db.query('BEGIN');
  const q=await db.query('select * from public.elimfilters_catalog where sku=any($1::text[]) for update',[[TARGET,WRONG]]);
  const by=new Map(q.rows.map(r=>[r.sku,r]));const target=by.get(TARGET),wrong=by.get(WRONG);
  if(!target||!wrong)throw new Error('ROWS_MISSING');
  if(target.filter_type!=='oil'||norm(target.codigo_base)!=='CH9999')throw new Error('TARGET_IDENTITY_MISMATCH');
  if(wrong.filter_type!=='hydraulic'||wrong.duty!=='HEAVY_DUTY')throw new Error('WRONG_ROW_IDENTITY_MISMATCH');
  const wrongOem=(wrong.oem_codes||[]).filter(x=>refCode(x)!==CODE);
  const wrongComp=(wrong.competitor_codes||[]).filter(x=>refCode(x)!==CODE);
  const removed=(wrong.oem_codes||[]).length-wrongOem.length+(wrong.competitor_codes||[]).length-wrongComp.length;
  if(removed<1)throw new Error('NO_7061_CONTAMINATION_TO_REMOVE');
  report.wrong_gateway=assertGovernedCatalogPatch(wrong,{oem_codes:wrongOem,competitor_codes:wrongComp},{
   referenceCorrection:true,
   correctionEvidence:{
    authority:'NAPA_OFFICIAL_PLUS_FRAM_CH9999',
    source_url:'https://www.napaonline.com/en/p/FIL7061',
    evidence_hash:'696b4b348b28a136005e511f39f173be66cf8757eee14f6e3a4e146ceac42272',
    reason:'NAPA 7061 is a cartridge lube oil reference in the FRAM CH9999 family; CROSLAND 7061 on hydraulic EH61818 is incompatible cross-category contamination.'
   }
  });
  const old=target.enrichment_data&&typeof target.enrichment_data==='object'?target.enrichment_data:{};
  const nextEn={...old,codigo_base_governance:{...(old.codigo_base_governance||{}),
   policy_version:'2026-08-29-regional-v3.2',state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',
   origin_group:'NON_EUROPEAN',approved_manufacturer:'FRAM',approved_codigo_base:'CH9999',approved_source_column:'CANONICAL_POLICY',
   current_codigo_base:'CH9999',primary_manufacturer_verified:true,required_authority:'REGIONAL_CANONICAL_POLICY_SATISFIED',
   competitor_code_count:(target.competitor_codes||[]).length,oem_code_count:(target.oem_codes||[]).length,
   verified_equivalents:['MANN-FILTER HU824X'],observed_primary_candidates:[],
   evidence_note:'FRAM CH9999 is canonical LD non-European oil authority; MANN-FILTER HU824X is a verified equivalent cross-reference.'
  },reference_governance_resolution:{
   status:'RESOLVED_CROSS_CATEGORY_CONTAMINATION',resolved_code:'7061',canonical_sku:TARGET,wrong_sku:WRONG,
   authority:'NAPA_OFFICIAL_PLUS_FRAM_CH9999',source_url:'https://www.napaonline.com/en/p/FIL7061',
   evidence_hash:'696b4b348b28a136005e511f39f173be66cf8757eee14f6e3a4e146ceac42272',
   resolved_at:new Date().toISOString()
  }};
  report.target_gateway=assertGovernedCatalogPatch(target,{enrichment_data:nextEn});
  const hasHu824=(target.competitor_codes||[]).some(x=>norm(x.manufacturer||x.brand)==='MANNFILTER'&&refCode(x)==='HU824X');
  if(!hasHu824)throw new Error('HU824X_MISSING_FROM_TARGET');
  report.preflight={wrong_removed:removed,target_oem:(target.oem_codes||[]).length,target_comp:(target.competitor_codes||[]).length,hu824x:hasHu824};
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  await db.query('update public.elimfilters_catalog set oem_codes=$1::jsonb,competitor_codes=$2::jsonb where sku=$3',[JSON.stringify(wrongOem),JSON.stringify(wrongComp),WRONG]);
  await db.query(`delete from ld_catalog.ld_oem_cross_references where elimfilters_sku=$1 and regexp_replace(upper(coalesce(oem_part_number,'')),'[^A-Z0-9]','','g')=$2`,[WRONG,CODE]);
  await db.query(`delete from ld_catalog.ld_competitor_cross_references where elimfilters_sku=$1 and regexp_replace(upper(coalesce(competitor_part_number,'')),'[^A-Z0-9]','','g')=$2`,[WRONG,CODE]);
  await db.query('update public.elimfilters_catalog set enrichment_data=$1::jsonb where sku=$2',[JSON.stringify(nextEn),TARGET]);
  await db.query('select refresh_crossref_cache_sku($1)',[WRONG]);
  await db.query('select refresh_crossref_cache_sku($1)',[TARGET]);
  const v5=await db.query("select code,array_agg(distinct sku order by sku) skus from public.v_api_resolver_v5 where code=any($1::text[]) group by code order by code",[['7061','HU824X','PG5610EX','TG9999','263203C100','263202A001']]);
  report.v5=v5.rows;
  const owners=Object.fromEntries(v5.rows.map(r=>[r.code,r.skus]));
  for(const code of ['7061','HU824X','PG5610EX','TG9999','263203C100']) if(JSON.stringify(owners[code])!==JSON.stringify([TARGET])) throw new Error('TARGET_ROUTE_'+code+':'+JSON.stringify(owners[code]||[]));
  if((owners['263202A001']||[]).includes(TARGET))throw new Error('WRONG_263202A001_REMAINS');
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run130]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run130] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};
