'use strict';
const {Client}=require('pg');
const {assertCanonicalWrite,assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const {APPLICATION_POLICY_VERSION,applicationPayloadHash}=require('../../lib/catalog-application-governance');

const EXECUTE=process.argv.includes('--execute');
const SOURCE='EA32002', TARGET='EA42002';
const C142='C14200/2', C420='C42002';
const C142_URL='https://www.mann-filter.com/en/catalog/search-results/product.html/c14200/2_mann-filter.html';
const C420_URL='https://www.mann-filter.com/en/catalog/search-results/product.html/c42002_mann-filter.html';
const SOURCE_ROWS=229, TARGET_ROWS=6;
const C420_OEM=[
 {manufacturer:'MERCEDES-BENZ',code:'651 090 00 51'},
 {manufacturer:'MERCEDES-BENZ',code:'A 651 090 00 51'}
];
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');

async function main(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
 if(!url) throw new Error('DB URL missing');
 const u=new URL(url);
 if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');
 const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
 await db.connect();
 const report={mode:EXECUTE?'execute':'dry-run',source:SOURCE,target:TARGET,canonical_source:C142,split_source:C420,pre:{},mutations:{},post:{}};
 try{
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

  const currentQ=await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',[SOURCE]);
  if(currentQ.rowCount!==1) throw new Error('SOURCE_NOT_UNIQUE');
  const current=currentQ.rows[0];
  if(current.catalog_active!==true||current.codigo_base!=='2002'||current.duty!=='LIGHT_DUTY'||current.filter_type!=='air') throw new Error('SOURCE_BASELINE_CHANGED');

  const targetConflict=await db.query("SELECT sku FROM public.elimfilters_catalog WHERE sku=$1 OR ld_catalog.norm_part(coalesce(codigo_base,''))=ld_catalog.norm_part($2) OR ld_catalog.norm_part(coalesce(canonical_source_code,''))=ld_catalog.norm_part($2)",[TARGET,C420]);
  if(targetConflict.rowCount) throw new Error('TARGET_OR_C420_CONFLICT '+JSON.stringify(targetConflict.rows));

  const sourceRows=await db.query("SELECT id,make,model_family,model_type,year,engine_code FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2) ORDER BY id",[SOURCE,C142]);
  const splitRows=await db.query("SELECT id,make,model_family,model_type,year,engine_code FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2) ORDER BY id",[SOURCE,C420]);
  if(sourceRows.rowCount!==SOURCE_ROWS) throw new Error('C142_ROW_COUNT_CHANGED '+sourceRows.rowCount);
  if(splitRows.rowCount!==TARGET_ROWS) throw new Error('C420_ROW_COUNT_CHANGED '+splitRows.rowCount);

  const otherRows=await db.query("SELECT source_sku,count(*)::int n FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku) NOT IN (ld_catalog.norm_part($2),ld_catalog.norm_part($3)) GROUP BY source_sku",[SOURCE,C142,C420]);
  if(otherRows.rowCount) throw new Error('UNEXPECTED_SOURCE_IDENTITIES '+JSON.stringify(otherRows.rows));

  const parent=await db.query('SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 FOR UPDATE',[SOURCE]);
  if(parent.rowCount!==1||norm(parent.rows[0].source_sku)!==norm(C142)) throw new Error('SOURCE_PARENT_CHANGED '+JSON.stringify(parent.rows));

  const conflicts=await db.query("SELECT elimfilters_sku,canonical_part_number,status FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=ANY($1::text[]) OR ld_catalog.norm_part(canonical_part_number) IN (ld_catalog.norm_part($2),ld_catalog.norm_part($3)) FOR UPDATE",[[SOURCE,TARGET],C142,C420]);
  if(conflicts.rowCount) throw new Error('IDENTITY_CONFLICT '+JSON.stringify(conflicts.rows));

  const resolver=await db.query("SELECT code,sku,manufacturer,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code) IN (ld_catalog.norm_part($1),ld_catalog.norm_part($2))",[C142,C420]);
  if(resolver.rowCount) throw new Error('RESOLVER_CONFLICT '+JSON.stringify(resolver.rows));

  const oemClaims=await db.query("SELECT elimfilters_sku,oem_part_number FROM ld_catalog.ld_oem_cross_references WHERE ld_catalog.norm_part(oem_part_number) IN (ld_catalog.norm_part($1),ld_catalog.norm_part($2))",[C420_OEM[0].code,C420_OEM[1].code]);
  if(oemClaims.rowCount) throw new Error('C420_OEM_ALREADY_CLAIMED '+JSON.stringify(oemClaims.rows));

  const sourceApps=sourceRows.rows.map(r=>({make:r.make,model:r.model_family,type:r.model_type,year:r.year,engine:r.engine_code}));
  const targetApps=splitRows.rows.map(r=>({make:r.make,model:r.model_family,type:r.model_type,year:r.year,engine:r.engine_code}));
  const sourceHash=applicationPayloadHash(sourceApps), targetHash=applicationPayloadHash(targetApps);
  const sourceDbHash=(await db.query('SELECT md5($1::jsonb::text) h',[JSON.stringify(sourceApps)])).rows[0].h;
  const targetDbHash=(await db.query('SELECT md5($1::jsonb::text) h',[JSON.stringify(targetApps)])).rows[0].h;

  const quarantine={captured_at:new Date().toISOString(),reason:'EA32002 historical JSON cross-references mixed C14200/2, C42002 and unrelated hydraulic/aftermarket identities; withheld pending per-code authority review.',oem_codes:current.oem_codes||[],competitor_codes:current.competitor_codes||[]};
  const sourceGov={policy_version:'2026-10-03-v4.1',state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',origin_group:'EUROPEAN',required_authority:'VERIFIED_MANN_FILTER',primary_manufacturer_verified:true,approved_manufacturer:'MANN-FILTER',approved_codigo_base:C142,current_codigo_base:C142,approved_source_column:'CANONICAL_POLICY',verification_method:'MANN_OFFICIAL_PRODUCT_AND_APPLICATION',evidence_url:C142_URL,evidence_note:'MANN C 14 200/2 is a distinct cylindrical engine air filter, 124 x 74 x 320 mm; its 229 relational rows remain with EA32002 after C42002 collision split.'};
  const targetGov={policy_version:'2026-10-03-v4.1',state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',origin_group:'EUROPEAN',required_authority:'VERIFIED_MANN_FILTER',primary_manufacturer_verified:true,approved_manufacturer:'MANN-FILTER',approved_codigo_base:C420,current_codigo_base:C420,approved_source_column:'CANONICAL_POLICY',verification_method:'MANN_OFFICIAL_PRODUCT_APPLICATION_AND_OE',evidence_url:C420_URL,evidence_note:'MANN C 42 002 is a distinct panel engine air filter, 416 x 225 x 30 mm, for Mercedes-Benz V-Class/Vito/Metris; six contaminated rows are reowned from EA32002 to natural SKU EA42002.'};
  const sourceAppGov={policy_version:APPLICATION_POLICY_VERSION,evidence_recorded:true,evidence_authority:'RELATIONAL_LD_VEHICLE_APPLICATIONS_C14200_2',vehicle_verified:true,vehicle_payload_hash:sourceHash,vehicle_db_payload_hash:sourceDbHash,engine_verified:true,engine_payload_hash:sourceHash,engine_db_payload_hash:sourceDbHash,verified_at:new Date().toISOString()};
  const targetAppGov={policy_version:APPLICATION_POLICY_VERSION,evidence_recorded:true,evidence_authority:'RELATIONAL_LD_VEHICLE_APPLICATIONS_C42002',vehicle_verified:true,vehicle_payload_hash:targetHash,vehicle_db_payload_hash:targetDbHash,engine_verified:true,engine_payload_hash:targetHash,engine_db_payload_hash:targetDbHash,verified_at:new Date().toISOString()};

  const sourceEnrichment={...(current.enrichment_data||{}),codigo_base_governance:sourceGov,application_governance:sourceAppGov,dimensions_source:{mann_filter:C142_URL,outer_diameter_mm:124,inner_diameter_mm:74,height_mm:320},cross_reference_quarantine:quarantine};
  const sourcePatch={codigo_base:C142,duty:'LIGHT_DUTY',oem_codes:[],competitor_codes:[],vehicle_applications:sourceApps,equipment_applications:[],enrichment_data:sourceEnrichment};
  report.pre.source_gateway=assertGovernedCatalogPatch(current,sourcePatch,{applicationWrite:true});

  const targetInitialEnrichment={codigo_base_governance:targetGov,dimensions_source:{mann_filter:C420_URL,length_mm:416,width_mm:225,height_mm:30}};
  const targetEnrichment={...targetInitialEnrichment,application_governance:targetAppGov};
  const targetCandidate={sku:TARGET,codigo_base:C420,duty:'LIGHT_DUTY',filter_type:'air',technology:'MACROCORE™',canonical_source_brand:'MANN-FILTER',canonical_source_code:C420,oem_codes:C420_OEM,competitor_codes:[],vehicle_applications:targetApps,equipment_applications:[],enrichment_data:targetEnrichment};
  report.pre.target_gateway=assertCanonicalWrite(targetCandidate);
  report.pre.source_rows=sourceRows.rowCount; report.pre.target_rows=splitRows.rowCount;
  report.pre.quarantined_oem=(current.oem_codes||[]).length; report.pre.quarantined_competitor=(current.competitor_codes||[]).length;

  if(EXECUTE){
   const ins=await db.query(`INSERT INTO public.elimfilters_catalog(sku,codigo_base,name,description,duty,filter_type,technology,installation_type,height_mm,outer_diameter_mm,inner_diameter_mm,canonical_source_brand,canonical_source_code,canonical_source_url,canonical_source_status,canonical_verified_at,duty_source_brand,duty_validation_status,duty_verified_at,oem_codes,competitor_codes,vehicle_applications,equipment_applications,catalog_active,enrichment_data) VALUES($1::varchar,$2::varchar,'ELIMFILTERS Air Filter C42002','ELIMFILTERS light-duty panel engine air filter; MANN-FILTER C 42 002 canonical.','LIGHT_DUTY','air','MACROCORE™','Panel',30,416,225,'MANN-FILTER',$2::text,$3::text,'VERIFIED',now(),'MANN-FILTER','VERIFIED',now(),$4::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,true,$5::jsonb) RETURNING sku`,[TARGET,C420,C420_URL,JSON.stringify(C420_OEM),JSON.stringify(targetInitialEnrichment)]);
   if(ins.rowCount!==1) throw new Error('TARGET_INSERT_FAILED');
   report.mutations.target_inserted=1;

   const parentIns=await db.query("INSERT INTO ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment,created_at,updated_at) VALUES($1,$2,'Air Filter',now(),now()) RETURNING elimfilters_sku",[TARGET,C420]);
   if(parentIns.rowCount!==1) throw new Error('TARGET_PARENT_FAILED');
   report.mutations.target_parent_inserted=1;

   const moved=await db.query("UPDATE ld_catalog.ld_vehicle_applications SET elimfilters_sku=$1 WHERE elimfilters_sku=$2 AND id=ANY($3::bigint[]) AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4) RETURNING id",[TARGET,SOURCE,splitRows.rows.map(r=>r.id),C420]);
   if(moved.rowCount!==TARGET_ROWS) throw new Error('C420_MOVE_FAILED '+moved.rowCount);
   report.mutations.applications_reowned=moved.rowCount;

   for(const spec of [{sku:SOURCE,hash:sourceDbHash,auth:'RELATIONAL_LD_VEHICLE_APPLICATIONS_C14200_2',url:C142_URL,rows:SOURCE_ROWS,source:C142},{sku:TARGET,hash:targetDbHash,auth:'RELATIONAL_LD_VEHICLE_APPLICATIONS_C42002',url:C420_URL,rows:TARGET_ROWS,source:C420}]){
    for(const kind of ['VEHICLE','ENGINE']){
     const ev=await db.query("INSERT INTO public.catalog_application_evidence(sku,application_kind,payload_hash,evidence_authority,source_url,verified,verified_at,metadata) VALUES($1,$2,$3,$4,$5,true,now(),$6::jsonb) ON CONFLICT (sku,application_kind,payload_hash,evidence_authority) DO UPDATE SET source_url=EXCLUDED.source_url,verified=true,verified_at=now(),metadata=EXCLUDED.metadata RETURNING id",[spec.sku,kind,spec.hash,spec.auth,spec.url,JSON.stringify({migration:'run_195',source:'ld_catalog.ld_vehicle_applications',source_sku:spec.source,rows:spec.rows})]);
     if(ev.rowCount!==1) throw new Error('APPLICATION_EVIDENCE_WRITE_FAILED '+spec.sku+' '+kind);
     report.mutations.application_evidence_written=(report.mutations.application_evidence_written||0)+1;
    }
   }

   const targetUpd=await db.query("UPDATE public.elimfilters_catalog SET vehicle_applications=$2::jsonb,enrichment_data=$3::jsonb WHERE sku=$1 RETURNING sku",[TARGET,JSON.stringify(targetApps),JSON.stringify(targetEnrichment)]);
   if(targetUpd.rowCount!==1) throw new Error('TARGET_APPLICATION_PUBLISH_FAILED');
   report.mutations.target_applications_published=1;

   const upd=await db.query(`UPDATE public.elimfilters_catalog SET codigo_base=$2::varchar,name='ELIMFILTERS Air Filter C14200/2',description='ELIMFILTERS light-duty engine air filter; MANN-FILTER C 14 200/2 canonical.',height_mm=320,outer_diameter_mm=124,inner_diameter_mm=74,canonical_source_brand='MANN-FILTER',canonical_source_code=$2::text,canonical_source_url=$3::text,canonical_source_status='VERIFIED',canonical_verified_at=now(),duty_source_brand='MANN-FILTER',duty_validation_status='VERIFIED',duty_verified_at=now(),oem_codes='[]'::jsonb,competitor_codes='[]'::jsonb,vehicle_applications=$4::jsonb,equipment_applications='[]'::jsonb,enrichment_data=$5::jsonb WHERE sku=$1 RETURNING sku`,[SOURCE,C142,C142_URL,JSON.stringify(sourceApps),JSON.stringify(sourceEnrichment)]);
   if(upd.rowCount!==1) throw new Error('SOURCE_UPDATE_FAILED');
   report.mutations.source_updated=1;

   const id1=await db.query("INSERT INTO ld_catalog.ld_canonical_product_identity(elimfilters_sku,origin_group,canonical_brand,canonical_part_number,filter_type,status,evidence_source,created_at,updated_at) VALUES($1,'EUROPEAN','MANN-FILTER',$2,'air','ACTIVE','MIGRATION_195_C14200_2',now(),now()) RETURNING elimfilters_sku",[SOURCE,C142]);
   const id2=await db.query("INSERT INTO ld_catalog.ld_canonical_product_identity(elimfilters_sku,origin_group,canonical_brand,canonical_part_number,filter_type,status,evidence_source,created_at,updated_at) VALUES($1,'EUROPEAN','MANN-FILTER',$2,'air','ACTIVE','MIGRATION_195_C42002',now(),now()) RETURNING elimfilters_sku",[TARGET,C420]);
   if(id1.rowCount!==1||id2.rowCount!==1) throw new Error('IDENTITY_INSERT_FAILED');
   report.mutations.identities_inserted=2;

   for(const oe of C420_OEM){
    const ox=await db.query("INSERT INTO ld_catalog.ld_oem_cross_references(elimfilters_sku,source_sku,oem_brand,oem_part_number,created_at) VALUES($1,$2,$3,$4,now()) RETURNING id",[TARGET,C420,oe.manufacturer,oe.code]);
    if(ox.rowCount!==1) throw new Error('OEM_XREF_INSERT_FAILED '+oe.code);
    report.mutations.oem_xrefs_inserted=(report.mutations.oem_xrefs_inserted||0)+1;
   }
   await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=ANY($1::text[])',[[SOURCE,TARGET]]);
   await db.query('SELECT public.refresh_crossref_cache_sku($1)',[SOURCE]);
   await db.query('SELECT public.refresh_crossref_cache_sku($1)',[TARGET]);
   report.mutations.cache_refreshed=2;
  }

  const post=(await db.query(`SELECT
   (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) source_rows,
   (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)) source_c420_rows,
   (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)) target_rows,
   (SELECT codigo_base FROM public.elimfilters_catalog WHERE sku=$1) source_base,
   (SELECT codigo_base FROM public.elimfilters_catalog WHERE sku=$2) target_base,
   (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($3) AND sku=$1) source_resolves,
   (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($4) AND sku=$2) target_resolves,
   (SELECT count(*)::int FROM public.catalog_application_evidence WHERE sku=$1 AND application_kind='VEHICLE' AND payload_hash=$5 AND verified=true) source_vehicle_evidence,
   (SELECT count(*)::int FROM public.catalog_application_evidence WHERE sku=$2 AND application_kind='VEHICLE' AND payload_hash=$6 AND verified=true) target_vehicle_evidence,
   (SELECT coalesce(enrichment_data->'codigo_base_governance'->>'state','') FROM public.elimfilters_catalog WHERE sku=$1) source_state,
   (SELECT coalesce(enrichment_data->'codigo_base_governance'->>'state','') FROM public.elimfilters_catalog WHERE sku=$2) target_state
  `,[SOURCE,TARGET,C142,C420,sourceDbHash,targetDbHash])).rows[0];
  report.post=post;

  if(EXECUTE){
   if(post.source_rows!==SOURCE_ROWS||post.source_c420_rows!==0||post.target_rows!==TARGET_ROWS||post.source_base!==C142||post.target_base!==C420||post.source_resolves!==1||post.target_resolves!==1||post.source_vehicle_evidence<1||post.target_vehicle_evidence<1||post.source_state!=='CANONICAL_VERIFIED'||post.target_state!=='CANONICAL_VERIFIED') throw new Error('POSTCHECK_FAILED '+JSON.stringify(post));
   await db.query('COMMIT');report.transaction='COMMIT';
  } else {await db.query('ROLLBACK');report.transaction='ROLLBACK';}
  console.log(JSON.stringify(report,null,2));
 }catch(e){try{await db.query('ROLLBACK')}catch{} console.error(e.stack||e.message);process.exitCode=1;}
 finally{await db.end();}
}
if(require.main===module) main();
