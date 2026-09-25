'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const ITEMS=[
 {sku:'EL30158',base:'CH10158',brand:'FRAM',codes:[
  {code:'PG5609',url:'https://api.pgfilters.com/catalog/api/v1/products/PG5609/interchanges',hash:'8a862940107f609debf07f927a5f82c63d93953da75a9470f6f54d660395523e'}
 ]},
 {sku:'EL36122',base:'CH10246',brand:'FRAM',codes:[
  {code:'PG5839',url:'https://api.pgfilters.com/catalog/api/v1/products/PG5839/interchanges',hash:'474d7c6483f5a40bdf8e03c59fe8cddb700fa62734c99d0817340d36a8d3be23'},
  {code:'PG5839EX',url:'https://api.pgfilters.com/catalog/api/v1/products/PG5839EX/interchanges',hash:'b4e9c67726184be58e6241430d73a25ddf328bf9a4be8d52a4233f60c626aab6'}
 ]}
];
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
async function run(){
 const db=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:false});
 const report={mode:APPLY?'apply':'dry-run',items:[]};await db.connect();
 try{
  await db.query('BEGIN');
  for(const item of ITEMS){
   const q=await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[item.sku]);
   if(q.rowCount!==1)throw new Error('SKU_NOT_FOUND_'+item.sku);
   const row=q.rows[0];
   if(row.codigo_base!==item.base||row.filter_type!=='oil'||row.duty!=='LIGHT_DUTY'||row.canonical_source_brand!==item.brand)throw new Error('IDENTITY_MISMATCH_'+item.sku);
   let nextComp=[...(row.competitor_codes||[])];
   const added=[];
   for(const c of item.codes){
    if(nextComp.some(x=>norm(x.code)===norm(c.code)))continue;
    nextComp.push({manufacturer:'PREMIUM GUARD',code:c.code,classification:'AFTERMARKET',source_url:c.url,evidence_hash:c.hash,evidence_authority:'PREMIUM_GUARD_PUBLIC_API'});
    added.push(c);
   }
   if(!added.length){report.items.push({sku:item.sku,added:[],already_present:true});continue;}
   for(const c of added){
    assertGovernedCatalogPatch(row,{competitor_codes:nextComp},{referenceEnrichment:true,enrichmentEvidence:{authority:'PREMIUM_GUARD_PUBLIC_API',source_url:c.url,evidence_hash:c.hash,reason:'Add reviewed Premium Guard alternate to existing canonical LD family '+item.base+'.'}});
   }
   const old=row.enrichment_data&&typeof row.enrichment_data==='object'?row.enrichment_data:{};
   const governed=[...new Set([...(old.reference_governance_resolution?.governed_references||[]),...added.map(x=>x.code)])];
   const nextEn={...old,codigo_base_governance:{...(old.codigo_base_governance||{}),state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',competitor_code_count:nextComp.length},reference_governance_resolution:{...(old.reference_governance_resolution||{}),status:'RESOLVED_WITH_CANONICAL_PRIORITY_AND_PUBLIC_GOVERNANCE',governed_references:governed,canonical_sku:item.sku,verified_at:new Date().toISOString()}};
   assertGovernedCatalogPatch(row,{enrichment_data:nextEn});
   report.items.push({sku:item.sku,base:item.base,added:added.map(x=>x.code),comp_before:(row.competitor_codes||[]).length,comp_after:nextComp.length});
   if(APPLY){
    await db.query('update public.elimfilters_catalog set competitor_codes=$1::jsonb,enrichment_data=$2::jsonb where sku=$3',[JSON.stringify(nextComp),JSON.stringify(nextEn),item.sku]);
    for(const c of added)await db.query('insert into ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number) values($1,$2,$3,$4) on conflict do nothing',[item.sku,item.base,'PREMIUM GUARD',c.code]);
    await db.query('select refresh_crossref_cache_sku($1)',[item.sku]);
   }
  }
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  const codes=ITEMS.flatMap(x=>x.codes.map(c=>c.code));
  const routes=await db.query("select v.code,array_agg(distinct v.sku order by v.sku) skus from public.v_api_resolver_v5 v join public.elimfilters_catalog_active_v a on a.sku=v.sku where v.code=any($1::text[]) group by v.code order by v.code",[codes]);
  report.routes=routes.rows;
  const expected={PG5609:['EL30158'],PG5839:['EL36122'],PG5839EX:['EL36122']};
  for(const [code,skus] of Object.entries(expected)){const r=routes.rows.find(x=>x.code===code);if(!r||JSON.stringify(r.skus)!==JSON.stringify(skus))throw new Error('ROUTE_FAILED_'+code+':'+JSON.stringify(r?.skus||[]));}
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run146]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run146] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};