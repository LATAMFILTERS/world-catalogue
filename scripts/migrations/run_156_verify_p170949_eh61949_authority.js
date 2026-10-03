'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');

const EXECUTE=process.argv.includes('--execute');
const SKU='EH61949';
const BASE='P170949';
const MANN='WH12005';
const EXPECTED_ROWS=155;
const OFFICIAL_URL='https://shop.donaldson.com/store/en-us/product/P170949/16581';
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');
  const u=new URL(url);
  if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  const report={mode:EXECUTE?'execute':'dry-run',sku:SKU,base:BASE,mann:MANN,pre:{},mutations:{governance_updated:0,cache_refreshed:0},post:{}};
  try{
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const q=await db.query(`
      SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE
    `,[SKU]);
    if(q.rowCount!==1) throw new Error('TARGET_NOT_UNIQUE');
    const row=q.rows[0];
    if(row.duty!=='HEAVY_DUTY'||row.filter_type!=='hydraulic'||norm(row.codigo_base)!==BASE||
       norm(row.canonical_source_code)!==BASE||String(row.canonical_source_brand||'').toUpperCase()!=='DONALDSON'||
       String(row.canonical_source_status||'').toUpperCase()!=='VERIFIED'||row.catalog_active!==true){
      throw new Error('TARGET_IDENTITY_CHANGED '+JSON.stringify({
        duty:row.duty,filter_type:row.filter_type,codigo_base:row.codigo_base,
        canonical_source_brand:row.canonical_source_brand,canonical_source_code:row.canonical_source_code,
        canonical_source_status:row.canonical_source_status,catalog_active:row.catalog_active
      }));
    }
    const apps=await db.query(`
      SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications
      WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)
    `,[SKU,MANN]);
    if(apps.rows[0].n!==EXPECTED_ROWS) throw new Error(`WH12005 rows ${apps.rows[0].n} != ${EXPECTED_ROWS}`);
    const xref=await db.query(`
      SELECT count(*)::int n FROM ld_catalog.ld_competitor_cross_references
      WHERE elimfilters_sku=$1 AND upper(coalesce(competitor_brand,''))='MANN-FILTER'
        AND ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part($2)
    `,[SKU,MANN]);
    if(xref.rows[0].n!==1) throw new Error('WH12005_XREF_NOT_UNIQUE');
    const gov={
      ...(row.enrichment_data?.codigo_base_governance||{}),
      policy_version:'2026-08-19-v3.1',
      state:'CANONICAL_VERIFIED',
      governance_state:'CANONICAL_VERIFIED',
      required_authority:'VERIFIED_DONALDSON',
      approved_codigo_base:BASE,
      current_codigo_base:BASE,
      approved_manufacturer:'DONALDSON',
      approved_source_column:'DONALDSON_OFFICIAL',
      primary_manufacturer_verified:true,
      verification_method:'DONALDSON_OFFICIAL_PRODUCT_PAGE',
      evidence_url:OFFICIAL_URL,
      verified_at:new Date().toISOString(),
      evidence_note:'Donaldson official product page directly identifies P170949 as HYDRAULIC FILTER, SPIN-ON DURAMAX. WH12005 remains a MANN-FILTER cross-reference owned by EH61949.'
    };
    const enrichment={...(row.enrichment_data||{}),codigo_base_governance:gov};
    report.pre={
      applications:apps.rows[0].n,
      mann_crossrefs:xref.rows[0].n,
      prior_state:row.enrichment_data?.codigo_base_governance?.state||null,
      official_url:OFFICIAL_URL
    };
    report.pre.gateway=assertGovernedCatalogPatch(row,{enrichment_data:enrichment});

    if(EXECUTE){
      const upd=await db.query(`
        UPDATE public.elimfilters_catalog
        SET enrichment_data=$2::jsonb,canonical_source_url=$3,canonical_verified_at=now()
        WHERE sku=$1 RETURNING sku
      `,[SKU,JSON.stringify(enrichment),OFFICIAL_URL]);
      if(upd.rowCount!==1) throw new Error('GOVERNANCE_UPDATE_FAILED');
      report.mutations.governance_updated=1;
      await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1',[SKU]);
      await db.query('SELECT public.refresh_crossref_cache_sku($1)',[SKU]);
      report.mutations.cache_refreshed=1;
    }
    const post=await db.query(`
      SELECT
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) apps,
        (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($2) AND sku=$1) base_resolves_target,
        (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($3) AND sku=$1) mann_resolves_target,
        (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($2) AND sku<>$1) base_resolves_other,
        (SELECT coalesce(enrichment_data->'codigo_base_governance'->>'state','') FROM public.elimfilters_catalog WHERE sku=$1) governance_state
    `,[SKU,BASE,MANN]);
    report.post=post.rows[0];

    if(EXECUTE){
      if(report.post.apps!==EXPECTED_ROWS||report.post.base_resolves_target!==1||report.post.mann_resolves_target!==1||
         report.post.base_resolves_other!==0||report.post.governance_state!=='CANONICAL_VERIFIED'){
        throw new Error('POSTCHECK_FAILED '+JSON.stringify(report.post));
      }
      await db.query('COMMIT'); report.transaction='COMMIT';
    }else{
      await db.query('ROLLBACK'); report.transaction='ROLLBACK';
    }
    console.log(JSON.stringify(report,null,2));
  }catch(e){
    try{await db.query('ROLLBACK')}catch{}
    console.error(e.stack||e); process.exitCode=1;
  }finally{await db.end()}
}
if(require.main===module) main();
