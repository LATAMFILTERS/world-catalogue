'use strict';
const {Client}=require('pg');
const {assertCanonicalWrite}=require('../../lib/catalog-write-gateway');

const EXECUTE=process.argv.includes('--execute');
const SOURCE='EF37015';
const TARGET='EF86040';
const MANN='WK7015';
const OEM='13329886040';
const OEM2='13328591018';
const OEM_BRAND='BMW';
const EXPECTED_ROWS=95;
const EXPECTED_PU_ROWS=9;
const MANN_URL='https://www.mann-filter.com/es-es/catalogo/resultados-de-la-busqueda/producto.html/wk7015_mann-filter.html';

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

  const fn=(await db.query("SELECT pg_get_functiondef('public.enforce_elimfilters_codigo_base_policy()'::regprocedure) def")).rows[0]?.def||'';
  if(!fn.includes('mann_code_collision_verified')) throw new Error('CATALOG_POLICY_V41_COLLISION_SUPPORT_MISSING');

  const source=(await db.query(
    'SELECT sku,codigo_base,duty,filter_type,technology,canonical_source_brand,canonical_source_code,canonical_source_status FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',
    [SOURCE]
  )).rows[0];
  if(!source||source.codigo_base!=='PU7015'||source.duty!=='LIGHT_DUTY'||source.filter_type!=='fuel'||source.technology!=='SYNTAPORE™'||source.canonical_source_code!=='PU7015'){
    throw new Error('SOURCE_IDENTITY_CHANGED');
  }
  const targetConflict=await db.query(
    "SELECT sku,codigo_base,canonical_source_code FROM public.elimfilters_catalog WHERE sku=$1 OR ld_catalog.norm_part(codigo_base)=ld_catalog.norm_part($2) OR ld_catalog.norm_part(canonical_source_code)=ld_catalog.norm_part($3)",
    [TARGET,OEM,MANN]
  );
  if(targetConflict.rowCount) throw new Error('TARGET_OR_IDENTITY_CONFLICT '+JSON.stringify(targetConflict.rows));

  const parentConflict=await db.query(
    "SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 OR ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)",
    [TARGET,MANN]
  );
  if(parentConflict.rowCount) throw new Error('TARGET_PARENT_CONFLICT '+JSON.stringify(parentConflict.rows));

  const rows=await db.query(
    "SELECT id FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2) ORDER BY id",
    [SOURCE,MANN]
  );
  if(rows.rowCount!==EXPECTED_ROWS) throw new Error('WK7015_ROW_COUNT_CHANGED '+rows.rowCount);

  const puRows=await db.query(
    "SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('PU7015')",
    [SOURCE]
  );
  if(puRows.rows[0].n!==EXPECTED_PU_ROWS) throw new Error('PU7015_ROW_COUNT_CHANGED '+puRows.rows[0].n);

  const collision=await db.query(
    "SELECT sku,codigo_base,canonical_source_code FROM public.elimfilters_catalog WHERE sku=$1",
    [SOURCE]
  );
  if(collision.rowCount!==1||collision.rows[0].canonical_source_code!=='PU7015') throw new Error('MANN_7015_COLLISION_CHANGED');

  const oemClaim=await db.query(
    "SELECT elimfilters_sku,oem_part_number FROM ld_catalog.ld_oem_cross_references WHERE ld_catalog.norm_part(oem_part_number) IN (ld_catalog.norm_part($1),ld_catalog.norm_part($2))",
    [OEM,OEM2]
  );
  if(oemClaim.rowCount) throw new Error('OEM_ALREADY_CLAIMED '+JSON.stringify(oemClaim.rows));
  const gov={
    policy_version:'2026-10-03-v4.1',
    state:'CANONICAL_VERIFIED',
    governance_state:'CANONICAL_VERIFIED',
    origin_group:'EUROPEAN',
    required_authority:'MANN_FILTER_WITH_VERIFIED_OEM_COLLISION_BASE',
    primary_manufacturer_verified:true,
    collision_canonical_code:MANN,
    mann_code_collision_verified:true,
    oem_base_verified:true,
    approved_manufacturer:OEM_BRAND,
    approved_codigo_base:OEM,
    current_codigo_base:OEM,
    approved_source_column:'OEM_CODES',
    collision_windows:[{sku:SOURCE,canonical_code:'PU7015',suffix:'7015'}],
    verification_method:'MANN_CANONICAL_IDENTITY_PLUS_VERIFIED_OEM_COLLISION_BASE',
    canonical_evidence_url:MANN_URL,
    oem_evidence_url:MANN_URL,
    evidence_note:'WK7015 is a distinct MANN fuel filter for BMW applications (58 x 330 mm, 8 mm inlet/outlet). Its only normal MANN suffix 7015 collides with canonical PU7015. BMW OE 13 32 9 886 040 is verified by the MANN page and supplies governed codigo_base 13329886040; target EF86040 preserves the required final 6040 suffix.'
  };

  const candidate={
    sku:TARGET,codigo_base:OEM,duty:'LIGHT_DUTY',filter_type:'fuel',technology:'SYNTAPORE™',
    canonical_source_brand:'MANN-FILTER',canonical_source_code:MANN,
    oem_codes:[],competitor_codes:[],vehicle_applications:[],equipment_applications:[],
    enrichment_data:{codigo_base_governance:gov}
  };
  report.pre.gateway=assertCanonicalWrite(candidate);
  report.pre.wk7015_rows=rows.rowCount;
  report.pre.pu7015_rows=puRows.rows[0].n;
  report.pre.collision=collision.rows[0];
  report.pre.oem_claimants=oemClaim.rowCount;
  if(EXECUTE){
   const product=await db.query(`
    INSERT INTO public.elimfilters_catalog(
      sku,codigo_base,name,description,duty,filter_type,technology,installation_type,
      height_mm,outer_diameter_mm,
      canonical_source_brand,canonical_source_code,canonical_source_url,canonical_source_status,canonical_verified_at,
      duty_source_brand,duty_validation_status,duty_verified_at,
      oem_codes,competitor_codes,vehicle_applications,equipment_applications,
      catalog_active,enrichment_data
    ) VALUES(
      $1,$2,'ELIMFILTERS Fuel Filter WK7015',
      'ELIMFILTERS® light-duty fuel filter for MANN-FILTER WK7015 BMW applications. SYNTAPORE™.',
      'LIGHT_DUTY','fuel','SYNTAPORE™','Inline',
      330,58,
      'MANN-FILTER',$3,$4,'VERIFIED',now(),
      'MANN-FILTER','VERIFIED',now(),
      '[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,
      true,$5::jsonb
    ) RETURNING sku
   `,[TARGET,OEM,MANN,MANN_URL,JSON.stringify({codigo_base_governance:gov})]);
   if(product.rowCount!==1) throw new Error('PRODUCT_INSERT_FAILED');
   report.mutations.product_inserted=1;

   const parent=await db.query(
    "INSERT INTO ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment,created_at,updated_at) VALUES($1,$2,'Fuel Filter',now(),now()) RETURNING elimfilters_sku",
    [TARGET,MANN]
   );
   if(parent.rowCount!==1) throw new Error('PARENT_INSERT_FAILED');
   report.mutations.parent_inserted=1;

   const identity=await db.query(
    "INSERT INTO ld_catalog.ld_canonical_product_identity(elimfilters_sku,origin_group,canonical_brand,canonical_part_number,filter_type,status,evidence_source,created_at,updated_at) VALUES($1,'EUROPEAN','MANN-FILTER',$2,'fuel','ACTIVE','MIGRATION_164_WK7015_OEM_COLLISION_BASE',now(),now()) RETURNING elimfilters_sku",
    [TARGET,MANN]
   );
   if(identity.rowCount!==1) throw new Error('IDENTITY_INSERT_FAILED');
   report.mutations.identity_inserted=1;
   for(const part of [OEM,OEM2]){
    const ox=await db.query(
      "INSERT INTO ld_catalog.ld_oem_cross_references(elimfilters_sku,source_sku,oem_brand,oem_part_number,created_at) VALUES($1,$2,$3,$4,now()) RETURNING id",
      [TARGET,MANN,OEM_BRAND,part]
    );
    if(ox.rowCount!==1) throw new Error('OEM_XREF_INSERT_FAILED '+part);
    report.mutations.oem_xref_inserted=(report.mutations.oem_xref_inserted||0)+1;
   }

   const moved=await db.query(
    "UPDATE ld_catalog.ld_vehicle_applications SET elimfilters_sku=$1 WHERE elimfilters_sku=$2 AND id=ANY($3::bigint[]) AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)",
    [TARGET,SOURCE,rows.rows.map(r=>r.id),MANN]
   );
   if(moved.rowCount!==EXPECTED_ROWS) throw new Error('WK7015_MOVE_FAILED '+moved.rowCount);
   report.mutations.applications_reowned=moved.rowCount;

   await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=ANY($1::text[])',[[SOURCE,TARGET]]);
   await db.query('SELECT public.refresh_crossref_cache_sku($1)',[SOURCE]);
   await db.query('SELECT public.refresh_crossref_cache_sku($1)',[TARGET]);
   report.mutations.cache_refreshed=2;
  }
  const post=await db.query(`
    SELECT
      (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) source_wk_rows,
      (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) target_wk_rows,
      (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('PU7015')) pu_rows,
      (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($3) AND sku=$1) wk_resolves_target,
      (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($4) AND sku=$1) oem_resolves_target,
      (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part('PU7015') AND sku=$2) pu_resolves_source
  `,[TARGET,SOURCE,MANN,OEM]);
  report.post=post.rows[0];

  if(EXECUTE){
   if(report.post.source_wk_rows!==0||report.post.target_wk_rows!==EXPECTED_ROWS||report.post.pu_rows!==EXPECTED_PU_ROWS||
      report.post.wk_resolves_target!==1||report.post.oem_resolves_target!==1||report.post.pu_resolves_source!==1){
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
 }finally{await db.end();}
}
if(require.main===module) main();
