'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const SKU='EA30004',BASE='C30004';
const URL='https://www.mann-filter.com/us-en/catalog/search-results/product.html/c30004_mann-filter.html';
async function run(){
 const db=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:false});
 const report={mode:APPLY?'apply':'dry-run'};await db.connect();
 try{
  await db.query('BEGIN');
  const row=(await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[SKU])).rows[0];
  if(!row)throw new Error('SKU_NOT_FOUND');
  const id=(await db.query('select * from ld_catalog.ld_canonical_product_identity where elimfilters_sku=$1',[SKU])).rows[0];
  if(!id||id.origin_group!=='EUROPEAN'||id.canonical_brand!=='MANN-FILTER'||id.canonical_part_number!==BASE||id.status!=='ACTIVE')throw new Error('IDENTITY_MISMATCH');
  report.gateway=assertGovernedCatalogPatch(row,{enrichment_data:row.enrichment_data});
  const gov=row.enrichment_data?.codigo_base_governance||{};
  if(gov.state!=='CANONICAL_VERIFIED'||gov.approved_manufacturer!=='MANN-FILTER'||gov.approved_codigo_base!==BASE)throw new Error('GOVERNANCE_MISMATCH');
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  await db.query(`update public.elimfilters_catalog
    set canonical_source_brand='MANN-FILTER',
        canonical_source_code=$1,
        canonical_source_url=$2,
        canonical_source_status='VERIFIED',
        canonical_verified_at=now(),
        canonical_evidence=$3::jsonb
    where sku=$4`,[
      BASE,URL,JSON.stringify({
        authority:'MANN-FILTER',
        code:BASE,
        evidence_source:'MIGRATION_088_EXACT_APPLICATION_UNIQUE',
        source_url:URL,
        synchronized_from_existing_governance:true
      }),SKU
    ]);
  const audit=(await db.query("select sku,codigo_base,canonical_source_brand,canonical_source_code,canonical_source_status from public.elimfilters_catalog where sku=$1",[SKU])).rows[0];
  report.audit=audit;
  if(audit.codigo_base!==BASE||audit.canonical_source_brand!=='MANN-FILTER'||audit.canonical_source_code!==BASE||audit.canonical_source_status!=='VERIFIED')throw new Error('POST_WRITE_AUDIT_FAILED');
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run145]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run145] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};