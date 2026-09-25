'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const SKU='EL38936', HELD='P502008';
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const code=x=>norm(x?.code||x?.part_number||x?.reference);
async function run(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!url)throw new Error('Missing database URL');
 const db=new Client({connectionString:url,ssl:false});const report={mode:APPLY?'apply':'dry-run',sku:SKU};await db.connect();
 try{
  await db.query('BEGIN');
  const q=await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[SKU]);if(q.rowCount!==1)throw new Error('SKU_NOT_FOUND');
  const row=q.rows[0];if(row.codigo_base!=='PH8936')throw new Error('IDENTITY_MISMATCH');
  const nextComp=(row.competitor_codes||[]).filter(x=>code(x)!==HELD);
  const removed=(row.competitor_codes||[]).length-nextComp.length;if(removed!==1)throw new Error('EXPECTED_ONE_P502008');
  const old=row.enrichment_data&&typeof row.enrichment_data==='object'?row.enrichment_data:{};
  const nextEn={...old,reference_governance_hold:{status:'HELD_ACTIVE_BASE_COLLISION',held_codes:[HELD],held_code_owner:{sku:'EL82008',codigo_base:'P502008',filter_type:'oil'},publication_rule:'FAIL_CLOSED_UNTIL_CANONICAL_OWNER_RESOLVED',evidence_note:'P502008 is a documented PH8936 cross-reference but remains an active ELIMFILTERS codigo_base; do not override direct-base precedence from this phase.',verified_at:new Date().toISOString()}};
  report.reference_gateway=assertGovernedCatalogPatch(row,{competitor_codes:nextComp},{referenceCorrection:true,correctionEvidence:{authority:'FRAM_PH8936_PLUS_PREMIUM_GUARD_HG50040_WITH_ACTIVE_BASE_PRECEDENCE',source_url:'https://api.pgfilters.com/catalog/api/v1/products/HG50040/interchanges',evidence_hash:'6a5afd9e4fcb6578e5f101fd552811a0067a30ccfdcfdc4ab1dff27c7628639d',reason:'Hold P502008 from PH8936 publication because P502008 is an active direct codigo_base owned by EL82008 pending separate canonical resolution.'}});
  report.hold_gateway=assertGovernedCatalogPatch(row,{enrichment_data:nextEn});
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  await db.query('update public.elimfilters_catalog set competitor_codes=$1::jsonb,enrichment_data=$2::jsonb where sku=$3',[JSON.stringify(nextComp),JSON.stringify(nextEn),SKU]);
  await db.query("delete from ld_catalog.ld_competitor_cross_references where elimfilters_sku=$1 and regexp_replace(upper(coalesce(competitor_part_number,'')),'[^A-Z0-9]','','g')=$2",[SKU,HELD]);
  await db.query('select refresh_crossref_cache_sku($1)',[SKU]);
  const a=(await db.query("select jsonb_array_length(competitor_codes) comp_count,enrichment_data from public.elimfilters_catalog where sku=$1",[SKU])).rows[0];
  report.audit={comp_count:a.comp_count,hold:a.enrichment_data?.reference_governance_hold};
  if(Number(a.comp_count)!==12||a.enrichment_data?.reference_governance_hold?.held_codes?.[0]!==HELD)throw new Error('POST_AUDIT_FAILED');
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run142]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run142] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};