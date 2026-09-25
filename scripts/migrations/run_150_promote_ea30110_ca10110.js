'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const SKU='EA30110', BASE='CA10110';
const HASH='36319f55bb2db8452234eab0203ea40b3fcab052a6838a45a9c34d275793a9f1';
const SOURCE_URL='https://www.showmethepartsdb.com/bin/showmeconnect.exe';
async function run(){
 const db=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:false});
 const report={mode:APPLY?'apply':'dry-run'}; await db.connect();
 try{
  await db.query('BEGIN');
  const row=(await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[SKU])).rows[0];
  if(!row||row.duty!=='LIGHT_DUTY'||row.filter_type!=='air'||row.catalog_active!==true) throw new Error('EA30110_SCOPE_MISMATCH');
  const collision=await db.query("select elimfilters_sku from ld_catalog.ld_canonical_product_identity where status='ACTIVE' and ld_catalog.norm_part(canonical_part_number)=ld_catalog.norm_part($1) and elimfilters_sku<>$2",[BASE,SKU]);
  if(collision.rowCount) throw new Error('CA10110_CANONICAL_COLLISION');
  const old=row.enrichment_data||{};
  const governance={...(old.codigo_base_governance||{}),policy_version:'2026-08-29-regional-v3.2',state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',origin_group:'NON_EUROPEAN',approved_manufacturer:'FRAM',approved_codigo_base:BASE,approved_source_column:'CANONICAL_POLICY',current_codigo_base:BASE,primary_manufacturer_verified:true,required_authority:'REGIONAL_CANONICAL_POLICY_SATISFIED',evidence_note:'FRAM CA10110 is the non-European LD air authority for Buick/Chevrolet/GMC/Saturn LD applications; FRAM is the non-European regional authority.'};
  const enrich={...old,codigo_base_governance:governance};
  const nextCompetitors=(row.competitor_codes||[]).filter(x=>!(String(x.manufacturer||x.brand||'').toUpperCase()==='FRAM'&&String(x.code||x.part_number||x.reference||'').toUpperCase().replace(/[^A-Z0-9]/g,'')===BASE));
  const patch={codigo_base:BASE,competitor_codes:nextCompetitors,enrichment_data:enrich};
  report.gateway=assertGovernedCatalogPatch(row,patch);
  if(!report.gateway.valid) throw new Error('GATEWAY_BLOCKED');
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  await db.query(`
    update public.elimfilters_catalog set
      codigo_base=$1::varchar,
      competitor_codes=$6::jsonb,
      enrichment_data=$2::jsonb,
      canonical_source_brand='FRAM',
      canonical_source_code=$7::text,
      canonical_source_url=$3,
      canonical_source_status='VERIFIED',
      canonical_verified_at=now(),
      canonical_evidence=$4::jsonb
    where sku=$5
  `,[BASE,JSON.stringify(enrich),SOURCE_URL,JSON.stringify({authority:'FRAM',code:BASE,evidence_hash:HASH,source_part_key:'000991667',source_catalog:'FRAM_USA_LD_HARVEST_20260911'}),SKU,JSON.stringify(nextCompetitors),BASE]);
  await db.query(`
    insert into ld_catalog.ld_canonical_product_identity
      (elimfilters_sku,origin_group,canonical_brand,canonical_part_number,filter_type,status,evidence_source,created_at,updated_at)
    values($1,'NON_EUROPEAN','FRAM',$2,'air','ACTIVE','FRAM_CA10110_HARVEST_CANONICAL',now(),now())
    on conflict(elimfilters_sku) do update set
      origin_group='NON_EUROPEAN',
      canonical_brand='FRAM',
      canonical_part_number=excluded.canonical_part_number,
      filter_type='air',
      status='ACTIVE',
      evidence_source=excluded.evidence_source,
      updated_at=now()
  `,[SKU,BASE]);
  await db.query('delete from public.crossref_resolved_cache where sku=$1',[SKU]);
  await db.query('select refresh_crossref_cache_sku($1)',[SKU]);
  const audit=(await db.query("select sku,catalog_active,codigo_base,canonical_source_brand,canonical_source_code,canonical_source_status from public.elimfilters_catalog where sku=$1",[SKU])).rows[0];
  const identity=(await db.query("select origin_group,canonical_brand,canonical_part_number,status from ld_catalog.ld_canonical_product_identity where elimfilters_sku=$1",[SKU])).rows[0];
  const v6=(await db.query("select code,sku,manufacturer,status from public.v_api_resolver_v6 where ld_catalog.norm_part(code)=ld_catalog.norm_part($1)",[BASE])).rows;
  report.audit=audit; report.identity=identity; report.v6=v6;
  if(audit.codigo_base!==BASE||audit.canonical_source_brand!=='FRAM'||audit.canonical_source_code!==BASE||audit.canonical_source_status!=='VERIFIED') throw new Error('POST_WRITE_ROW_MISMATCH');
  if(!identity||identity.origin_group!=='NON_EUROPEAN'||identity.canonical_brand!=='FRAM'||identity.canonical_part_number!==BASE||identity.status!=='ACTIVE') throw new Error('POST_WRITE_IDENTITY_MISMATCH');
  if(!v6.some(r=>r.code===BASE&&r.sku===SKU)) throw new Error('POST_WRITE_RESOLVER_MISSING');
  await db.query('COMMIT'); report.transaction='COMMIT'; return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){} e.report=report; throw e;}
 finally{await db.end();}
}
if(require.main===module){
 run().then(r=>console.log('[run150]',JSON.stringify(r,null,2))).catch(e=>{
  console.error('[run150] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1);
 });
}
module.exports={run};

