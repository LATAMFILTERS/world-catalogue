'use strict';
const {Client}=require('pg');
const {assertCanonicalWrite}=require('../../lib/catalog-write-gateway');

const EXECUTE=process.argv.includes('--execute');
const SOURCE='EA36010';
const TARGET='EH761048';
const DONALDSON='P761048';
const MANN='C6010';
const OEM='84457330';
const OEM_BRAND='NEW HOLLAND';
const EXPECTED_ROWS=5;
const EXPECTED_SOURCE_REMAINING=10;
const DONALDSON_URL='https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/catalogs/Hydraulic/emea/f116023/Hydraulic-Filtration-Product-Guide.pdf';
const CROSS_URL='https://www.motointegrator.de/artikel/2044782-entlueftung-fuer-den-hydrauliktank-mann-filter-c-6010';

async function main(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
 if(!url) throw new Error('DB URL missing');
 const u=new URL(url);
 if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');
 const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
 await db.connect();
 const report={mode:EXECUTE?'execute':'dry-run',source:SOURCE,target:TARGET,donaldson:DONALDSON,mann:MANN,oem:OEM,pre:{},mutations:{},post:{}};
 try{
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

  const source=(await db.query("SELECT sku,codigo_base,duty,filter_type,catalog_active FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE",[SOURCE])).rows[0];
  if(!source||source.codigo_base!=='6010'||source.duty!=='LIGHT_DUTY'||source.filter_type!=='air'||source.catalog_active!==true) throw new Error('SOURCE_BASELINE_CHANGED');

  const conflicts=await db.query(
   "SELECT sku FROM public.elimfilters_catalog WHERE sku=$1 OR ld_catalog.norm_part(codigo_base)=ld_catalog.norm_part($2) OR ld_catalog.norm_part(canonical_source_code)=ld_catalog.norm_part($2)",
   [TARGET,DONALDSON]
  );
  if(conflicts.rowCount) throw new Error('TARGET_OR_DONALDSON_CONFLICT '+JSON.stringify(conflicts.rows));

  const rows=await db.query("SELECT id FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2) ORDER BY id",[SOURCE,MANN]);
  if(rows.rowCount!==EXPECTED_ROWS) throw new Error('C6010_ROW_COUNT_CHANGED '+rows.rowCount);

  const sourceRemaining=await db.query("SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)<>ld_catalog.norm_part($2)",[SOURCE,MANN]);
  if(sourceRemaining.rows[0].n!==EXPECTED_SOURCE_REMAINING) throw new Error('SOURCE_REMAINING_CHANGED '+sourceRemaining.rows[0].n);

  const parentConflict=await db.query("SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 OR ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)",[TARGET,DONALDSON]);
  if(parentConflict.rowCount) throw new Error('PARENT_CONFLICT '+JSON.stringify(parentConflict.rows));

  const xrefConflict=await db.query("SELECT elimfilters_sku,competitor_part_number FROM ld_catalog.ld_competitor_cross_references WHERE ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part($1)",[MANN]);
  if(xrefConflict.rowCount) throw new Error('MANN_XREF_CONFLICT '+JSON.stringify(xrefConflict.rows));

  const oemClaim=await db.query("SELECT elimfilters_sku FROM ld_catalog.ld_oem_cross_references WHERE ld_catalog.norm_part(oem_part_number)=ld_catalog.norm_part($1)",[OEM]);
  if(oemClaim.rowCount) throw new Error('OEM_ALREADY_CLAIMED '+JSON.stringify(oemClaim.rows));

  const gov={
   policy_version:'2026-10-03-v4.1',state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',
   required_authority:'VERIFIED_DONALDSON',primary_manufacturer_verified:true,
   approved_manufacturer:'DONALDSON',approved_codigo_base:DONALDSON,current_codigo_base:DONALDSON,
   approved_source_column:'CANONICAL_POLICY',
   verification_method:'DONALDSON_HYDRAULIC_GUIDE_PLUS_OE_CROSS_REFERENCE',
   evidence_url:DONALDSON_URL,supporting_evidence_url:CROSS_URL,
   evidence_note:'Donaldson P761048 is FS4 hydraulic tank breather, M22x1.5. MANN C6010 and New Holland 84457330 cross to the same breather identity. Extended EH761048 avoids collision with existing EH61048/P567048.'
  };
  const competitorCodes=[{manufacturer:'MANN-FILTER',code:MANN,classification:'AFTERMARKET'}];
  const oemCodes=[{manufacturer:OEM_BRAND,code:OEM,classification:'OEM'}];
  const candidate={
   sku:TARGET,codigo_base:DONALDSON,duty:'HEAVY_DUTY',filter_type:'hydraulic',technology:'NANOFORCE™',
   canonical_source_brand:'DONALDSON',canonical_source_code:DONALDSON,
   oem_codes:oemCodes,competitor_codes:competitorCodes,
   vehicle_applications:[],equipment_applications:[],
   enrichment_data:{codigo_base_governance:gov}
  };
  report.pre.gateway=assertCanonicalWrite(candidate);
  report.pre.source_rows=rows.rowCount;
  report.pre.source_remaining=sourceRemaining.rows[0].n;

  if(EXECUTE){
   const product=await db.query(`
    INSERT INTO public.elimfilters_catalog(
     sku,codigo_base,name,description,duty,filter_type,technology,installation_type,
     thread_size,
     canonical_source_brand,canonical_source_code,canonical_source_url,canonical_source_status,canonical_verified_at,
     duty_source_brand,duty_validation_status,duty_verified_at,
     oem_codes,competitor_codes,vehicle_applications,equipment_applications,catalog_active,enrichment_data
    ) VALUES(
     $1::varchar,$2::varchar,'ELIMFILTERS Hydraulic Breather P761048',
     'ELIMFILTERS® hydraulic tank breather for New Holland applications; Donaldson P761048 canonical, MANN C6010 alternate.',
     'HEAVY_DUTY','hydraulic','NANOFORCE™','Tank Breather',
     'M22x1.5',
     'DONALDSON',$2::text,$3::text,'VERIFIED',now(),
     'DONALDSON','VERIFIED',now(),
     $4::jsonb,$5::jsonb,'[]'::jsonb,'[]'::jsonb,true,$6::jsonb
    ) RETURNING sku
   `,[TARGET,DONALDSON,DONALDSON_URL,JSON.stringify(oemCodes),JSON.stringify(competitorCodes),JSON.stringify({codigo_base_governance:gov,dimensions_source:{donaldson:{family:'FS4',A_mm:52,B_mm:48,C_mm:10,thread:'M22x1.5'}}})]);
   if(product.rowCount!==1) throw new Error('PRODUCT_INSERT_FAILED');
   report.mutations.product_inserted=1;

   const parent=await db.query("INSERT INTO ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment,created_at,updated_at) VALUES($1,$2,'Hydraulic Breather',now(),now()) RETURNING elimfilters_sku",[TARGET,DONALDSON]);
   if(parent.rowCount!==1) throw new Error('PARENT_INSERT_FAILED');
   report.mutations.parent_inserted=1;

   const mx=await db.query("INSERT INTO ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number,created_at) VALUES($1,$2,'MANN-FILTER',$3,now()) RETURNING id",[TARGET,DONALDSON,MANN]);
   if(mx.rowCount!==1) throw new Error('MANN_XREF_INSERT_FAILED');
   report.mutations.mann_xref_inserted=1;

   const ox=await db.query("INSERT INTO ld_catalog.ld_oem_cross_references(elimfilters_sku,source_sku,oem_brand,oem_part_number,created_at) VALUES($1,$2,$3,$4,now()) RETURNING id",[TARGET,DONALDSON,OEM_BRAND,OEM]);
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
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)) target_rows,
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)) source_rows,
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2) source_remaining,
    (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($3) AND sku=$1) base_resolves,
    (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($4) AND sku=$1) mann_resolves,
    (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($5) AND sku=$1) oem_resolves,
    (SELECT duty FROM public.elimfilters_catalog WHERE sku=$1) target_duty,
    (SELECT filter_type FROM public.elimfilters_catalog WHERE sku=$1) target_filter_type,
    (SELECT coalesce(enrichment_data->'codigo_base_governance'->>'state','') FROM public.elimfilters_catalog WHERE sku=$1) target_state
  `,[TARGET,SOURCE,DONALDSON,MANN,OEM]);
  report.post=post.rows[0];

  if(EXECUTE){
   if(report.post.target_rows!==EXPECTED_ROWS||report.post.source_rows!==0||report.post.source_remaining!==EXPECTED_SOURCE_REMAINING||
      report.post.base_resolves!==1||report.post.mann_resolves!==1||report.post.oem_resolves!==1||
      report.post.target_duty!=='HEAVY_DUTY'||report.post.target_filter_type!=='hydraulic'||report.post.target_state!=='CANONICAL_VERIFIED'){
    throw new Error('POSTCHECK_FAILED '+JSON.stringify(report.post));
   }
   await db.query('COMMIT');report.transaction='COMMIT';
  }else{await db.query('ROLLBACK');report.transaction='ROLLBACK';}
  console.log(JSON.stringify(report,null,2));
 }catch(e){try{await db.query('ROLLBACK')}catch{} console.error(e.stack||e);process.exitCode=1;}
 finally{await db.end();}
}
if(require.main===module) main();
