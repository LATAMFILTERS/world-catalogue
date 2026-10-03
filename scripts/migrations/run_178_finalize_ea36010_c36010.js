'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const {APPLICATION_POLICY_VERSION,applicationPayloadHash}=require('../../lib/catalog-application-governance');

const EXECUTE=process.argv.includes('--execute');
const SKU='EA36010';
const MANN='C36010';
const OLD_PARENT='C26010';
const EXPECTED_ROWS=10;
const MANN_URL='https://www.mann-filter.com/en/catalog/search-results/product.html/c36010_mann-filter.html';

async function main(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
 if(!url) throw new Error('DB URL missing');
 const u=new URL(url);
 if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');
 const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
 await db.connect();
 const report={mode:EXECUTE?'execute':'dry-run',sku:SKU,mann:MANN,pre:{},mutations:{},post:{}};
 try{
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

  const currentQ=await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',[SKU]);
  if(currentQ.rowCount!==1) throw new Error('SKU_NOT_UNIQUE');
  const current=currentQ.rows[0];
  if(current.catalog_active!==true||current.codigo_base!=='6010'||current.duty!=='LIGHT_DUTY'||current.filter_type!=='air') throw new Error('PLACEHOLDER_BASELINE_CHANGED');

  const rows=await db.query(
   "SELECT id,make,model_family,model_type,year,engine_code FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2) ORDER BY id",
   [SKU,MANN]
  );
  if(rows.rowCount!==EXPECTED_ROWS) throw new Error('C36010_ROW_COUNT_CHANGED '+rows.rowCount);

  const otherRows=await db.query(
   "SELECT source_sku,count(*)::int n FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)<>ld_catalog.norm_part($2) GROUP BY source_sku ORDER BY source_sku",
   [SKU,MANN]
  );
  if(otherRows.rowCount!==0) throw new Error('MIXED_IDENTITIES_REMAIN '+JSON.stringify(otherRows.rows));

  const parent=await db.query("SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 FOR UPDATE",[SKU]);
  if(parent.rowCount!==1||ldnorm(parent.rows[0].source_sku)!==ldnorm(OLD_PARENT)) throw new Error('PARENT_BASELINE_CHANGED '+JSON.stringify(parent.rows));

  const identity=await db.query("SELECT elimfilters_sku,canonical_part_number,status FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=$1 FOR UPDATE",[SKU]);
  if(identity.rowCount!==0) throw new Error('IDENTITY_ALREADY_EXISTS '+JSON.stringify(identity.rows));

  const resolverConflict=await db.query(
   "SELECT code,sku,manufacturer,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1) AND sku<>$2",
   [MANN,SKU]
  );
  if(resolverConflict.rowCount) throw new Error('C36010_RESOLVER_CONFLICT '+JSON.stringify(resolverConflict.rows));

  const vehicleApps=rows.rows.map(r=>({make:r.make,model:r.model_family,type:r.model_type,year:r.year,engine:r.engine_code}));
  const appHash=applicationPayloadHash(vehicleApps);
  const dbHash=(await db.query('SELECT md5($1::jsonb::text) h',[JSON.stringify(vehicleApps)])).rows[0].h;

  const appGov={
   policy_version:APPLICATION_POLICY_VERSION,
   evidence_recorded:true,
   evidence_authority:'RELATIONAL_LD_VEHICLE_APPLICATIONS_C36010',
   vehicle_verified:true,vehicle_payload_hash:appHash,vehicle_db_payload_hash:dbHash,
   engine_verified:true,engine_payload_hash:appHash,engine_db_payload_hash:dbHash,
   verified_at:new Date().toISOString(),
   evidence_note:'run_178 rebuilds EA36010 vehicle_applications from the ten surviving relational C36010 rows after mixed identities were split.'
  };

  const gov={
   policy_version:'2026-10-03-v4.1',state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',
   origin_group:'EUROPEAN',required_authority:'VERIFIED_MANN_FILTER',
   primary_manufacturer_verified:true,approved_manufacturer:'MANN-FILTER',
   approved_codigo_base:MANN,current_codigo_base:MANN,approved_source_column:'CANONICAL_POLICY',
   verification_method:'MANN_OFFICIAL_PRODUCT_AND_APPLICATION',
   evidence_url:MANN_URL,
   evidence_note:'MANN C36010 is a distinct European light-duty engine air filter for Citroen/Peugeot, 354 x 103 x 50 mm.'
  };

  const oemCodes=[
   {manufacturer:'CITROEN',code:'1444FC',classification:'OEM'},
   {manufacturer:'CITROEN',code:'1444TL',classification:'OEM'},
   {manufacturer:'CITROEN',code:'1444QJ',classification:'OEM'},
   {manufacturer:'PEUGEOT',code:'1444CQ',classification:'OEM'},
   {manufacturer:'PEUGEOT',code:'1444TL',classification:'OEM'}
  ];
  const enrichment={
   ...(current.enrichment_data||{}),
   codigo_base_governance:gov,
   application_governance:appGov,
   dimensions_source:{mann_filter:MANN_URL,length_mm:354,width_mm:103,height_mm:50}
  };
  const patch={
   codigo_base:MANN,duty:'LIGHT_DUTY',oem_codes:oemCodes,competitor_codes:[],
   vehicle_applications:vehicleApps,equipment_applications:[],enrichment_data:enrichment
  };
  report.pre.gateway=assertGovernedCatalogPatch(current,patch,{applicationWrite:true});
  report.pre.rows=rows.rowCount;
  report.pre.other_rows=otherRows.rows;
  report.pre.parent=parent.rows[0].source_sku;
  report.pre.db_payload_hash=dbHash;

  if(EXECUTE){
   for(const kind of ['VEHICLE','ENGINE']){
    const ev=await db.query(
     "INSERT INTO public.catalog_application_evidence(sku,application_kind,payload_hash,evidence_authority,source_url,verified,verified_at,metadata) VALUES($1,$2,$3,$4,$5,true,now(),$6::jsonb) ON CONFLICT (sku,application_kind,payload_hash,evidence_authority) DO UPDATE SET source_url=EXCLUDED.source_url,verified=true,verified_at=now(),metadata=EXCLUDED.metadata RETURNING id",
     [SKU,kind,dbHash,'RELATIONAL_LD_VEHICLE_APPLICATIONS_C36010',MANN_URL,JSON.stringify({migration:'run_178',source:'ld_catalog.ld_vehicle_applications',source_sku:MANN,rows:EXPECTED_ROWS})]
    );
    if(ev.rowCount!==1) throw new Error('APPLICATION_EVIDENCE_WRITE_FAILED '+kind);
    report.mutations.application_evidence_written=(report.mutations.application_evidence_written||0)+1;
   }

   const upd=await db.query(`
    UPDATE public.elimfilters_catalog
    SET codigo_base=$2::varchar,
        name='ELIMFILTERS Air Filter C36010',
        description='ELIMFILTERS® light-duty engine air filter for Citroen/Peugeot; MANN-FILTER C36010 canonical.',
        duty='LIGHT_DUTY',filter_type='air',technology='MACROCORE™',installation_type='Panel',
        height_mm=50,outer_diameter_mm=354,inner_diameter_mm=103,
        canonical_source_brand='MANN-FILTER',canonical_source_code=$2::text,
        canonical_source_url=$3::text,canonical_source_status='VERIFIED',canonical_verified_at=now(),
        duty_source_brand='MANN-FILTER',duty_validation_status='VERIFIED',duty_verified_at=now(),
        oem_codes=$4::jsonb,competitor_codes='[]'::jsonb,
        vehicle_applications=$5::jsonb,equipment_applications='[]'::jsonb,
        enrichment_data=$6::jsonb
    WHERE sku=$1::varchar RETURNING sku
   `,[SKU,MANN,MANN_URL,JSON.stringify(oemCodes),JSON.stringify(vehicleApps),JSON.stringify(enrichment)]);
   if(upd.rowCount!==1) throw new Error('CATALOG_UPDATE_FAILED');
   report.mutations.catalog_updated=1;

   const parentUpd=await db.query("UPDATE ld_catalog.ld_product_catalog SET source_sku=$2,updated_at=now() WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3) RETURNING elimfilters_sku",[SKU,MANN,OLD_PARENT]);
   if(parentUpd.rowCount!==1) throw new Error('PARENT_UPDATE_FAILED');
   report.mutations.parent_updated=1;

   const insIdentity=await db.query(
    "INSERT INTO ld_catalog.ld_canonical_product_identity(elimfilters_sku,origin_group,canonical_brand,canonical_part_number,filter_type,status,evidence_source,created_at,updated_at) VALUES($1,'EUROPEAN','MANN-FILTER',$2,'air','ACTIVE','MIGRATION_178_C36010',now(),now()) RETURNING elimfilters_sku",
    [SKU,MANN]
   );
   if(insIdentity.rowCount!==1) throw new Error('IDENTITY_INSERT_FAILED');
   report.mutations.identity_inserted=1;

   await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1',[SKU]);
   await db.query('SELECT public.refresh_crossref_cache_sku($1)',[SKU]);
   report.mutations.cache_refreshed=1;
  }

  const post=await db.query(`
   SELECT
    (SELECT codigo_base FROM public.elimfilters_catalog WHERE sku=$1) codigo_base,
    (SELECT canonical_source_brand FROM public.elimfilters_catalog WHERE sku=$1) canonical_brand,
    (SELECT canonical_source_code FROM public.elimfilters_catalog WHERE sku=$1) canonical_code,
    (SELECT canonical_source_status FROM public.elimfilters_catalog WHERE sku=$1) canonical_status,
    (SELECT height_mm FROM public.elimfilters_catalog WHERE sku=$1) height_mm,
    (SELECT outer_diameter_mm FROM public.elimfilters_catalog WHERE sku=$1) length_mm,
    (SELECT inner_diameter_mm FROM public.elimfilters_catalog WHERE sku=$1) width_mm,
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)) app_rows,
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)<>ld_catalog.norm_part($2)) other_rows,
    (SELECT source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1) parent_source,
    (SELECT status FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=$1 AND canonical_part_number=$2) identity_status,
    (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($2) AND sku=$1) resolves,
    (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($2) AND sku<>$1) resolves_other,
    (SELECT count(*)::int FROM public.catalog_application_evidence WHERE sku=$1 AND application_kind='VEHICLE' AND payload_hash=$3 AND verified=true) vehicle_evidence,
    (SELECT count(*)::int FROM public.catalog_application_evidence WHERE sku=$1 AND application_kind='ENGINE' AND payload_hash=$3 AND verified=true) engine_evidence,
    (SELECT coalesce(enrichment_data->'codigo_base_governance'->>'state','') FROM public.elimfilters_catalog WHERE sku=$1) state
  `,[SKU,MANN,dbHash]);
  report.post=post.rows[0];

  if(EXECUTE){
   if(report.post.codigo_base!==MANN||report.post.canonical_brand!=='MANN-FILTER'||report.post.canonical_code!==MANN||
      report.post.canonical_status!=='VERIFIED'||Number(report.post.height_mm)!==50||Number(report.post.length_mm)!==354||
      Number(report.post.width_mm)!==103||report.post.app_rows!==EXPECTED_ROWS||report.post.other_rows!==0||
      ldnorm(report.post.parent_source)!==ldnorm(MANN)||report.post.identity_status!=='ACTIVE'||
      report.post.resolves!==1||report.post.resolves_other!==0||
      report.post.vehicle_evidence<1||report.post.engine_evidence<1||report.post.state!=='CANONICAL_VERIFIED'){
    throw new Error('POSTCHECK_FAILED '+JSON.stringify(report.post));
   }
   await db.query('COMMIT');report.transaction='COMMIT';
  }else{await db.query('ROLLBACK');report.transaction='ROLLBACK';}
  console.log(JSON.stringify(report,null,2));
 }catch(e){try{await db.query('ROLLBACK')}catch{} console.error(e.stack||e);process.exitCode=1;}
 finally{await db.end();}
}
function ldnorm(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
if(require.main===module) main();
