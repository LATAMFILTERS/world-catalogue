'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const SKU='EL33387',BASE='PH3387A',CODE='PG111';
const URL='https://api.pgfilters.com/catalog/api/v1/products/PG111/interchanges';
const HASH='c5a8f3efc35780e93e72ca593418c2e9c2f13ba26cb81897bc3b5ba029dcd47a';
async function run(){
 const db=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:false});const report={mode:APPLY?'apply':'dry-run',sku:SKU};await db.connect();
 try{
  await db.query('BEGIN');
  const q=await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[SKU]);if(q.rowCount!==1)throw new Error('SKU_NOT_FOUND');
  const row=q.rows[0];
  if(row.codigo_base!==BASE||row.filter_type!=='oil'||row.duty!=='LIGHT_DUTY'||row.canonical_source_brand!=='FRAM')throw new Error('IDENTITY_MISMATCH');
  const exists=(row.competitor_codes||[]).some(x=>String(x.code||'').toUpperCase().replace(/[^A-Z0-9]/g,'')===CODE);
  if(exists)throw new Error('PG111_ALREADY_PRESENT');
  const nextComp=[...(row.competitor_codes||[]),{manufacturer:'PREMIUM GUARD',code:CODE,classification:'AFTERMARKET',source_url:URL,evidence_hash:HASH,evidence_authority:'PREMIUM_GUARD_PUBLIC_API'}];
  report.reference_gateway=assertGovernedCatalogPatch(row,{competitor_codes:nextComp},{referenceEnrichment:true,enrichmentEvidence:{authority:'PREMIUM_GUARD_PUBLIC_API',source_url:URL,evidence_hash:HASH,reason:'Add PG111 as reviewed Premium Guard alternate for canonical FRAM PH3387A.'}});
  const old=row.enrichment_data&&typeof row.enrichment_data==='object'?row.enrichment_data:{};
  const governed=[...new Set([...(old.reference_governance_resolution?.governed_references||[]),CODE])];
  const nextEn={...old,codigo_base_governance:{...(old.codigo_base_governance||{}),competitor_code_count:nextComp.length,evidence_note:'FRAM PH3387A is canonical LD non-European oil authority. Premium Guard PG6161 and PG111, TG3387A and XG3387A resolve publicly to EL33387.'},reference_governance_resolution:{...(old.reference_governance_resolution||{}),status:'RESOLVED_WITH_CANONICAL_PRIORITY_AND_PUBLIC_GOVERNANCE',governed_references:governed,canonical_sku:SKU,verified_at:new Date().toISOString()}};
  report.governance_gateway=assertGovernedCatalogPatch(row,{enrichment_data:nextEn});
  report.preflight={comp_before:(row.competitor_codes||[]).length,comp_after:nextComp.length};
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  await db.query('update public.elimfilters_catalog set competitor_codes=$1::jsonb,enrichment_data=$2::jsonb where sku=$3',[JSON.stringify(nextComp),JSON.stringify(nextEn),SKU]);
  await db.query('insert into ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number) values($1,$2,$3,$4) on conflict do nothing',[SKU,BASE,'PREMIUM GUARD',CODE]);
  await db.query('select refresh_crossref_cache_sku($1)',[SKU]);
  const routes=await db.query("select v.code,array_agg(distinct v.sku order by v.sku) skus from public.v_api_resolver_v5 v join public.elimfilters_catalog_active_v a on a.sku=v.sku where v.code=$1 group by v.code",[CODE]);
  report.routes=routes.rows;
  if(routes.rowCount!==1||JSON.stringify(routes.rows[0].skus)!==JSON.stringify([SKU]))throw new Error('PG111_ROUTE_FAILED');
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run144]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run144] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};