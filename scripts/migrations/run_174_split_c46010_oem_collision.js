'use strict';
const {Client}=require('pg');
const {assertCanonicalWrite}=require('../../lib/catalog-write-gateway');

const EXECUTE=process.argv.includes('--execute');
const SOURCE='EA36010';
const TARGET='EA33000';
const MANN='C46010';
const OEM='6420943000';
const OEM_BRAND='MERCEDES-BENZ';
const EXPECTED_ROWS=1;
const EXPECTED_SOURCE_REMAINING=356;
const MANN_URL='https://www.mann-filter.com/en/catalog/search-results/product.html/c46010_mann-filter.html';

async function main(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
 if(!url) throw new Error('DB URL missing');
 const u=new URL(url);
 if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');
 const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
 await db.connect();
 const report={mode:EXECUTE?'execute':'dry-run',source:SOURCE,target:TARGET,mann:MANN,oem:OEM,pre:{},mutations:{},post:{}};
 try{
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

  const source=(await db.query("SELECT sku,codigo_base,duty,filter_type,technology,catalog_active FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE",[SOURCE])).rows[0];
  if(!source||source.codigo_base!=='6010'||source.duty!=='LIGHT_DUTY'||source.filter_type!=='air'||source.catalog_active!==true) throw new Error('SOURCE_BASELINE_CHANGED');

  const conflicts=await db.query(
   "SELECT sku FROM public.elimfilters_catalog WHERE sku=$1 OR ld_catalog.norm_part(codigo_base)=ld_catalog.norm_part($2) OR ld_catalog.norm_part(canonical_source_code)=ld_catalog.norm_part($3)",
   [TARGET,OEM,MANN]
  );
  if(conflicts.rowCount) throw new Error('TARGET_OR_IDENTITY_CONFLICT '+JSON.stringify(conflicts.rows));

  const rows=await db.query("SELECT id FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2) ORDER BY id",[SOURCE,MANN]);
  if(rows.rowCount!==EXPECTED_ROWS) throw new Error('C46010_ROW_COUNT_CHANGED '+rows.rowCount);

  const oemClaim=await db.query("SELECT elimfilters_sku FROM ld_catalog.ld_oem_cross_references WHERE ld_catalog.norm_part(oem_part_number)=ld_catalog.norm_part($1)",[OEM]);
  if(oemClaim.rowCount) throw new Error('OEM_ALREADY_CLAIMED '+JSON.stringify(oemClaim.rows));
  const parentConflict=await db.query("SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 OR ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)",[TARGET,MANN]);
  if(parentConflict.rowCount) throw new Error('PARENT_CONFLICT '+JSON.stringify(parentConflict.rows));
  const identityConflict=await db.query("SELECT elimfilters_sku,canonical_part_number,status FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=$1 OR ld_catalog.norm_part(canonical_part_number)=ld_catalog.norm_part($2)",[TARGET,MANN]);
  if(identityConflict.rowCount) throw new Error('IDENTITY_CONFLICT '+JSON.stringify(identityConflict.rows));

  const gov={
   policy_version:'2026-10-03-v4.1',state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',
   origin_group:'EUROPEAN',required_authority:'MANN_FILTER_WITH_VERIFIED_OEM_COLLISION_BASE',
   primary_manufacturer_verified:true,collision_canonical_code:MANN,mann_code_collision_verified:true,oem_base_verified:true,
   approved_manufacturer:OEM_BRAND,approved_codigo_base:OEM,current_codigo_base:OEM,approved_source_column:'OEM_CODES',
   collision_windows:[{sku:'EA36010',canonical_code:'C36010',suffix:'6010'},{sku:'EA34601',canonical_code:'C3314601',suffix:'4601'}],
   verification_method:'MANN_CANONICAL_IDENTITY_PLUS_VERIFIED_OEM_COLLISION_BASE',
   canonical_evidence_url:MANN_URL,oem_evidence_url:MANN_URL,
   evidence_note:'MANN C46010 is a distinct Mercedes-Benz G-Class engine air filter, 460 x 91 x 58 mm. Natural MANN suffix windows collide, so verified Mercedes-Benz OE 6420943000 is the governed codigo_base.'
  };
  const candidate={
   sku:TARGET,codigo_base:OEM,duty:'LIGHT_DUTY',filter_type:'air',technology:'MACROCORE™',
   canonical_source_brand:'MANN-FILTER',canonical_source_code:MANN,oem_codes:[],competitor_codes:[],
   vehicle_applications:[],equipment_applications:[],enrichment_data:{codigo_base_governance:gov}
  };
  report.pre.gateway=assertCanonicalWrite(candidate);
  report.pre.source_rows=rows.rowCount;
  report.pre.oem_claimants=oemClaim.rowCount;

  if(EXECUTE){
   const product=await db.query(`
    INSERT INTO public.elimfilters_catalog(
     sku,codigo_base,name,description,duty,filter_type,technology,installation_type,
     height_mm,outer_diameter_mm,inner_diameter_mm,
     canonical_source_brand,canonical_source_code,canonical_source_url,canonical_source_status,canonical_verified_at,
     duty_source_brand,duty_validation_status,duty_verified_at,
     oem_codes,competitor_codes,vehicle_applications,equipment_applications,catalog_active,enrichment_data
    ) VALUES(
     $1,$2,'ELIMFILTERS Air Filter C46010',
     'ELIMFILTERS® light-duty engine air filter for Mercedes-Benz G-Class; MANN-FILTER C46010 canonical identity.',
     'LIGHT_DUTY','air','MACROCORE™','Panel',
     58,460,91,
     'MANN-FILTER',$3,$4,'VERIFIED',now(),
     'MANN-FILTER','VERIFIED',now(),
     '[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,true,$5::jsonb
    ) RETURNING sku
   `,[TARGET,OEM,MANN,MANN_URL,JSON.stringify({codigo_base_governance:gov})]);
   if(product.rowCount!==1) throw new Error('PRODUCT_INSERT_FAILED');
   report.mutations.product_inserted=1;

   const parent=await db.query("INSERT INTO ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment,created_at,updated_at) VALUES($1,$2,'Air Filter',now(),now()) RETURNING elimfilters_sku",[TARGET,MANN]);
   if(parent.rowCount!==1) throw new Error('PARENT_INSERT_FAILED');
   report.mutations.parent_inserted=1;

   const identity=await db.query("INSERT INTO ld_catalog.ld_canonical_product_identity(elimfilters_sku,origin_group,canonical_brand,canonical_part_number,filter_type,status,evidence_source,created_at,updated_at) VALUES($1,'EUROPEAN','MANN-FILTER',$2,'air','ACTIVE','MIGRATION_174_C46010_OEM_COLLISION',now(),now()) RETURNING elimfilters_sku",[TARGET,MANN]);
   if(identity.rowCount!==1) throw new Error('IDENTITY_INSERT_FAILED');
   report.mutations.identity_inserted=1;

   const ox=await db.query("INSERT INTO ld_catalog.ld_oem_cross_references(elimfilters_sku,source_sku,oem_brand,oem_part_number,created_at) VALUES($1,$2,$3,$4,now()) RETURNING id",[TARGET,MANN,OEM_BRAND,OEM]);
   if(ox.rowCount!==1) throw new Error('OEM_XREF_INSERT_FAILED');
   report.mutations.oem_xref_inserted=1;

   const moved=await db.query("UPDATE ld_catalog.ld_vehicle_applications SET elimfilters_sku=$1 WHERE elimfilters_sku=$2 AND id=ANY($3::bigint[]) AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4) RETURNING id",[TARGET,SOURCE,rows.rows.map(r=>r.id),MANN]);
   if(moved.rowCount!==EXPECTED_ROWS) throw new Error('APPLICATION_MOVE_FAILED '+moved.rowCount);
   report.mutations.applications_reowned=moved.rowCount;

   await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=ANY($1::text[])',[[TARGET,SOURCE]]);
   await db.query('SELECT public.refresh_crossref_cache_sku($1)',[TARGET]);
   report.mutations.cache_refreshed=1;
  }

  const post=await db.query(`
   SELECT
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) target_rows,
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) source_rows,
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2) source_remaining,
    (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($3) AND sku=$1) mann_resolves,
    (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($4) AND sku=$1) oem_resolves,
    (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($3) AND sku<>$1) mann_other
  `,[TARGET,SOURCE,MANN,OEM]);
  report.post=post.rows[0];

  if(EXECUTE){
   if(report.post.target_rows!==EXPECTED_ROWS||report.post.source_rows!==0||report.post.source_remaining!==EXPECTED_SOURCE_REMAINING||
      report.post.mann_resolves!==1||report.post.oem_resolves!==1||report.post.mann_other!==0) throw new Error('POSTCHECK_FAILED '+JSON.stringify(report.post));
   await db.query('COMMIT');report.transaction='COMMIT';
  }else{await db.query('ROLLBACK');report.transaction='ROLLBACK';}
  console.log(JSON.stringify(report,null,2));
 }catch(e){try{await db.query('ROLLBACK')}catch{} console.error(e.stack||e);process.exitCode=1;}
 finally{await db.end();}
}
if(require.main===module) main();
