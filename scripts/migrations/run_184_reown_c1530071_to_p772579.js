'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');

const EXECUTE=process.argv.includes('--execute');
const SOURCE='EA30071';
const TARGET='EA12579';
const BASE='P772579';
const MANN='C153007/1';
const EXPECTED_ROWS=868;
const DONALDSON_URL='https://shop.donaldson.com/store/fr-us/product/P772579/21675';
const DONALDSON_AG_URL='https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/literature/south-africa/industries-markets/f112250-eng/Agriculture-Market-Overview.pdf';

async function main(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
 if(!url) throw new Error('DB URL missing');
 const u=new URL(url);
 if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');
 const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
 await db.connect();
 const report={mode:EXECUTE?'execute':'dry-run',source:SOURCE,target:TARGET,base:BASE,mann:MANN,pre:{},mutations:{},post:{}};
 try{
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

  const sourceQ=await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',[SOURCE]);
  const targetQ=await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',[TARGET]);
  if(sourceQ.rowCount!==1||targetQ.rowCount!==1) throw new Error('SOURCE_OR_TARGET_NOT_UNIQUE');
  const source=sourceQ.rows[0], target=targetQ.rows[0];

  if(source.catalog_active!==true||source.codigo_base!=='0071'||source.duty!=='LIGHT_DUTY'||source.filter_type!=='air') throw new Error('SOURCE_BASELINE_CHANGED');
  if(target.catalog_active!==true||target.codigo_base!==BASE||target.duty!=='HEAVY_DUTY'||target.filter_type!=='air'||
     target.canonical_source_brand!=='DONALDSON'||target.canonical_source_code!==BASE||target.canonical_source_status!=='VERIFIED') throw new Error('TARGET_IDENTITY_CHANGED');

  const rows=await db.query("SELECT id FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2) ORDER BY id",[SOURCE,MANN]);
  if(rows.rowCount!==EXPECTED_ROWS) throw new Error('C1530071_ROW_COUNT_CHANGED '+rows.rowCount);

  const other=await db.query("SELECT source_sku,count(*)::int n FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)<>ld_catalog.norm_part($2) GROUP BY source_sku ORDER BY source_sku",[SOURCE,MANN]);
  if(other.rowCount!==0) throw new Error('MIXED_IDENTITIES_REMAIN '+JSON.stringify(other.rows));

  const sourceParent=await db.query("SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 FOR UPDATE",[SOURCE]);
  if(sourceParent.rowCount!==1||norm(sourceParent.rows[0].source_sku)!==norm(MANN)) throw new Error('SOURCE_PARENT_CHANGED');

  const targetParent=await db.query("SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 OR ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)",[TARGET,BASE]);
  if(targetParent.rowCount!==0) throw new Error('TARGET_PARENT_CONFLICT '+JSON.stringify(targetParent.rows));

  const xref=await db.query("SELECT elimfilters_sku,competitor_part_number FROM ld_catalog.ld_competitor_cross_references WHERE ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part($1)",[MANN]);
  if(xref.rowCount!==0) throw new Error('MANN_XREF_CONFLICT '+JSON.stringify(xref.rows));

  const gov={
   policy_version:'2026-10-03-v4.1',
   state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',
   required_authority:'VERIFIED_DONALDSON',
   primary_manufacturer_verified:true,
   approved_manufacturer:'DONALDSON',
   approved_codigo_base:BASE,current_codigo_base:BASE,
   approved_source_column:'CANONICAL_POLICY',
   verification_method:'DONALDSON_OFFICIAL_PRIMARY_RADIALSEAL_PLUS_AGRICULTURE_APPLICATION',
   evidence_url:DONALDSON_URL,
   supporting_evidence_url:DONALDSON_AG_URL,
   evidence_note:'Donaldson P772579 is an official primary RadialSeal air filter and is listed for McCormick F80. C153007/1 is reowned from the historical suffix-collision placeholder EA30071.'
  };
  const targetEnrichment={...(target.enrichment_data||{}),codigo_base_governance:gov};
  report.pre.gateway=assertGovernedCatalogPatch(target,{enrichment_data:targetEnrichment});
  report.pre.source_rows=rows.rowCount;
  report.pre.other_rows=other.rows;
  report.pre.target_equipment_apps=Array.isArray(target.equipment_applications)?target.equipment_applications.length:0;

  if(EXECUTE){
   const tg=await db.query("UPDATE public.elimfilters_catalog SET enrichment_data=$2::jsonb WHERE sku=$1 RETURNING sku",[TARGET,JSON.stringify(targetEnrichment)]);
   if(tg.rowCount!==1) throw new Error('TARGET_GOVERNANCE_UPDATE_FAILED');
   report.mutations.target_governance_updated=1;

   const parent=await db.query("INSERT INTO ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment,created_at,updated_at) VALUES($1,$2,'Air Filter',now(),now()) RETURNING elimfilters_sku",[TARGET,BASE]);
   if(parent.rowCount!==1) throw new Error('TARGET_PARENT_INSERT_FAILED');
   report.mutations.target_parent_inserted=1;

   const xr=await db.query("INSERT INTO ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number,created_at) VALUES($1,$2,'MANN-FILTER',$3,now()) RETURNING id",[TARGET,BASE,MANN]);
   if(xr.rowCount!==1) throw new Error('MANN_XREF_INSERT_FAILED');
   report.mutations.mann_xref_inserted=1;

   const moved=await db.query("UPDATE ld_catalog.ld_vehicle_applications SET elimfilters_sku=$1 WHERE elimfilters_sku=$2 AND id=ANY($3::bigint[]) AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4) RETURNING id",[TARGET,SOURCE,rows.rows.map(r=>r.id),MANN]);
   if(moved.rowCount!==EXPECTED_ROWS) throw new Error('APPLICATION_MOVE_FAILED '+moved.rowCount);
   report.mutations.applications_reowned=moved.rowCount;

   const sp=await db.query("DELETE FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2) RETURNING elimfilters_sku",[SOURCE,MANN]);
   if(sp.rowCount!==1) throw new Error('SOURCE_PARENT_DELETE_FAILED');
   report.mutations.source_parent_deleted=1;

   const sourceGov={...(source.enrichment_data?.codigo_base_governance||{}),state:'RETIRED',governance_state:'RETIRED',superseded_by:{sku:TARGET,canonical_code:BASE,alternate:MANN}};
   const sourceEnrichment={...(source.enrichment_data||{}),codigo_base_governance:sourceGov};
   const sr=await db.query("UPDATE public.elimfilters_catalog SET catalog_active=false,enrichment_data=$2::jsonb WHERE sku=$1 RETURNING sku",[SOURCE,JSON.stringify(sourceEnrichment)]);
   if(sr.rowCount!==1) throw new Error('SOURCE_RETIRE_FAILED');
   report.mutations.source_retired=1;

   await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=ANY($1::text[])',[[TARGET,SOURCE]]);
   await db.query('SELECT public.refresh_crossref_cache_sku($1)',[TARGET]);
   report.mutations.cache_refreshed=1;
  }

  const post=await db.query(`
   SELECT
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) target_rows,
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2) source_rows,
    (SELECT catalog_active FROM public.elimfilters_catalog WHERE sku=$2) source_active,
    (SELECT count(*)::int FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)) target_parent,
    (SELECT count(*)::int FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$2) source_parent,
    (SELECT count(*)::int FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part($3)) mann_xref,
    (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($4) AND sku=$1) base_resolves,
    (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($3) AND sku=$1) mann_resolves,
    (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($3) AND sku<>$1) mann_other,
    (SELECT coalesce(enrichment_data->'codigo_base_governance'->>'state','') FROM public.elimfilters_catalog WHERE sku=$1) target_state,
    (SELECT jsonb_array_length(coalesce(equipment_applications,'[]'::jsonb)) FROM public.elimfilters_catalog WHERE sku=$1) target_equipment_apps
  `,[TARGET,SOURCE,MANN,BASE]);
  report.post=post.rows[0];

  if(EXECUTE){
   if(report.post.target_rows!==EXPECTED_ROWS||report.post.source_rows!==0||report.post.source_active!==false||
      report.post.target_parent!==1||report.post.source_parent!==0||report.post.mann_xref!==1||
      report.post.base_resolves!==1||report.post.mann_resolves!==1||report.post.mann_other!==0||
      report.post.target_state!=='CANONICAL_VERIFIED'||report.post.target_equipment_apps!==report.pre.target_equipment_apps){
    throw new Error('POSTCHECK_FAILED '+JSON.stringify(report.post));
   }
   await db.query('COMMIT');report.transaction='COMMIT';
  }else{await db.query('ROLLBACK');report.transaction='ROLLBACK';}
  console.log(JSON.stringify(report,null,2));
 }catch(e){try{await db.query('ROLLBACK')}catch{} console.error(e.stack||e);process.exitCode=1;}
 finally{await db.end();}
}
function norm(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
if(require.main===module) main();
