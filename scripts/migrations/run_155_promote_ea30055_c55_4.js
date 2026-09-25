'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const SKU='EA30055',BASE='C55(4)';
const URL='https://www.mann-filter.com/us-en/catalog/search-results/product.html/c55%284%29_mann-filter.html';
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
async function run(){
 const db=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:false});
 const report={mode:APPLY?'apply':'dry-run'};await db.connect();
 try{
  await db.query('BEGIN');
  const row=(await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[SKU])).rows[0];
  if(!row||row.duty!=='LIGHT_DUTY'||row.filter_type!=='air'||row.catalog_active!==true)throw new Error('SCOPE_MISMATCH');
  const collision=await db.query("select elimfilters_sku from ld_catalog.ld_canonical_product_identity where status='ACTIVE' and ld_catalog.norm_part(canonical_part_number)=ld_catalog.norm_part($1) and elimfilters_sku<>$2",[BASE,SKU]);
  if(collision.rowCount)throw new Error('CANONICAL_COLLISION');
  const currentRef=(row.competitor_codes||[]).find(x=>norm(x.code||x.part_number||x.reference)===norm(BASE)&&String(x.manufacturer||x.brand||'').toUpperCase().includes('MANN'));
  if(!currentRef)throw new Error('TRACEABLE_MANN_REFERENCE_MISSING');
  const old=row.enrichment_data||{};
  const governance={...(old.codigo_base_governance||{}),
    policy_version:'2026-09-25-air-b09',
    state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',
    origin_group:'EUROPEAN',approved_manufacturer:'MANN-FILTER',
    approved_codigo_base:BASE,approved_source_column:'CANONICAL_POLICY',
    current_codigo_base:BASE,primary_manufacturer_verified:true,
    required_authority:'VERIFIED_MANN_FILTER',
    evidence_note:'MANN C55(4) verified against current traceable MANN reference, exact 51x92 mm geometry, and Rietschle-only application scope.'
  };
  const enrichment_data={...old,codigo_base_governance:governance};
  const competitor_codes=(row.competitor_codes||[]).filter(x=>norm(x.code||x.part_number||x.reference)!==norm(BASE));
  const patch={codigo_base:BASE,competitor_codes,enrichment_data};
  report.gateway=assertGovernedCatalogPatch(row,patch);
  if(!report.gateway.valid)throw new Error('GATEWAY_BLOCKED:'+JSON.stringify(report.gateway.reasons));
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  await db.query(`update public.elimfilters_catalog set
    codigo_base=$1::varchar,competitor_codes=$2::jsonb,enrichment_data=$3::jsonb,
    canonical_source_brand='MANN-FILTER',canonical_source_code=$1,canonical_source_url=$4,
    canonical_source_status='VERIFIED',canonical_verified_at=now(),canonical_evidence=$5::jsonb
    where sku=$6`,[BASE,JSON.stringify(competitor_codes),JSON.stringify(enrichment_data),URL,JSON.stringify({
      authority:'MANN-FILTER',code:BASE,source_url:URL,
      official_dimensions_mm:{outer_diameter:51,inner_diameter:5.1,inner_diameter_1:31,height:92},
      catalog_dimensions_mm:{outer_diameter:51,height:92},
      official_scope:'RIETSCHLE'
    }),SKU]);
  await db.query(`insert into ld_catalog.ld_canonical_product_identity
    (elimfilters_sku,origin_group,canonical_brand,canonical_part_number,filter_type,status,evidence_source,created_at,updated_at)
    values($1,'EUROPEAN','MANN-FILTER',$2,'air','ACTIVE','MANN_C55_4_OFFICIAL_20260925',now(),now())
    on conflict(elimfilters_sku) do update set origin_group='EUROPEAN',canonical_brand='MANN-FILTER',
      canonical_part_number=excluded.canonical_part_number,filter_type='air',status='ACTIVE',
      evidence_source=excluded.evidence_source,updated_at=now()`,[SKU,BASE]);
  await db.query('delete from public.crossref_resolved_cache where sku=$1',[SKU]);
  await db.query('select refresh_crossref_cache_sku($1)',[SKU]);
  const audit=(await db.query('select sku,codigo_base,canonical_source_brand,canonical_source_code,canonical_source_status from public.elimfilters_catalog where sku=$1',[SKU])).rows[0];
  const identity=(await db.query('select origin_group,canonical_brand,canonical_part_number,status from ld_catalog.ld_canonical_product_identity where elimfilters_sku=$1',[SKU])).rows[0];
  report.audit=audit;report.identity=identity;
  if(audit.codigo_base!==BASE||audit.canonical_source_brand!=='MANN-FILTER'||audit.canonical_source_code!==BASE||audit.canonical_source_status!=='VERIFIED')throw new Error('POST_WRITE_ROW_MISMATCH');
  if(!identity||identity.origin_group!=='EUROPEAN'||identity.canonical_brand!=='MANN-FILTER'||identity.canonical_part_number!==BASE||identity.status!=='ACTIVE')throw new Error('POST_WRITE_IDENTITY_MISMATCH');
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run155]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run155] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};