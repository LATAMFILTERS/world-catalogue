'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const {APPLICATION_POLICY_VERSION,applicationPayloadHash}=require('../../lib/catalog-application-governance');

const EXECUTE=process.argv.includes('--execute');
const SKU='EF30054', MANN='WK54', EXPECTED_ROWS=195;
const MANN_URL='https://www.mann-filter.com/it-it/catalogo/risultati-ricerca/prodotto.html/wk54_mann-filter.html';
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const OFFICIAL_OE=new Set([
'516180','ACV0773380','700722667','1950577','D139225','P1950594L','BN53373','87400394','87400384','L1950594',
'2990378','9R9925','3826094','929322','4700929322','DNP550974','91083218','7437100227','761193431','76193431',
'1243000H1','1637835','3450211084','43977982','58827932','402969675','332Y3299','7022135','70010861','R127970',
'RE220719','RE63288','5040102740','3789819M1','101542M2','L87400394','76207829','82988059','86597473','1481046',
'102601','L1950594','P1950594','10052428AA','278609999951','D6150548','102995001','43911668','13064282'
].map(norm));

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
  if(current.catalog_active!==true||current.codigo_base!=='0054'||current.duty!=='LIGHT_DUTY'||current.filter_type!=='fuel') throw new Error('BASELINE_CHANGED');

  const rows=await db.query("SELECT id,make,model_family,model_type,year,engine_code FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2) ORDER BY id",[SKU,MANN]);
  if(rows.rowCount!==EXPECTED_ROWS) throw new Error('WK54_ROW_COUNT_CHANGED '+rows.rowCount);
  const other=await db.query("SELECT source_sku,count(*)::int n FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)<>ld_catalog.norm_part($2) GROUP BY source_sku",[SKU,MANN]);
  if(other.rowCount) throw new Error('MIXED_SOURCE_IDENTITIES '+JSON.stringify(other.rows));

  const parent=await db.query('SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 FOR UPDATE',[SKU]);
  if(parent.rowCount!==1||norm(parent.rows[0].source_sku)!==norm(MANN)) throw new Error('PARENT_CHANGED '+JSON.stringify(parent.rows));
  const identity=await db.query('SELECT elimfilters_sku,canonical_part_number,status FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=$1 FOR UPDATE',[SKU]);
  if(identity.rowCount) throw new Error('IDENTITY_ALREADY_EXISTS '+JSON.stringify(identity.rows));
  const resolverConflict=await db.query("SELECT code,sku,manufacturer,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1) AND sku<>$2",[MANN,SKU]);
  if(resolverConflict.rowCount) throw new Error('WK54_RESOLVER_CONFLICT '+JSON.stringify(resolverConflict.rows));

  const historicOem=Array.isArray(current.oem_codes)?current.oem_codes:[];
  const unsupported=historicOem.filter(x=>!OFFICIAL_OE.has(norm(x.code)));
  if(unsupported.length) throw new Error('OEM_NOT_IN_MANN_OFFICIAL '+JSON.stringify(unsupported));
  const verifiedOem=historicOem.map(x=>({manufacturer:String(x.manufacturer||'').trim(),code:String(x.code||'').trim()}));

  const apps=rows.rows.map(r=>({make:r.make,model:r.model_family,type:r.model_type,year:r.year,engine:r.engine_code}));
  const appHash=applicationPayloadHash(apps);
  const dbHash=(await db.query('SELECT md5($1::jsonb::text) h',[JSON.stringify(apps)])).rows[0].h;
  const appGov={policy_version:APPLICATION_POLICY_VERSION,evidence_recorded:true,evidence_authority:'RELATIONAL_LD_VEHICLE_APPLICATIONS_WK54_PLUS_MANN_OFFICIAL',vehicle_verified:true,vehicle_payload_hash:appHash,vehicle_db_payload_hash:dbHash,engine_verified:true,engine_payload_hash:appHash,engine_db_payload_hash:dbHash,verified_at:new Date().toISOString(),evidence_note:'run_196 rebuilds EF30054 applications from the 195 relational WK54 rows; MANN official catalog confirms WK54 diesel fuel-filter identity and application families.'};
  const gov={policy_version:'2026-10-03-v4.1',state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',origin_group:'EUROPEAN',required_authority:'VERIFIED_MANN_FILTER',primary_manufacturer_verified:true,approved_manufacturer:'MANN-FILTER',approved_codigo_base:MANN,current_codigo_base:MANN,approved_source_column:'CANONICAL_POLICY',verification_method:'MANN_OFFICIAL_PRODUCT_APPLICATION_AND_OE',evidence_url:MANN_URL,evidence_note:'MANN WK54 is a diesel fuel filter, 49 mm outer diameter and 99 mm height. All historical EF30054 OEM codes are retained only after normalization match against the MANN official OE list.'};
  const enrichment={...(current.enrichment_data||{}),codigo_base_governance:gov,application_governance:appGov,dimensions_source:{mann_filter:MANN_URL,outer_diameter_mm:49,height_mm:99,inlet_mm:11,outlet_mm:10}};
  const patch={codigo_base:MANN,duty:'LIGHT_DUTY',oem_codes:verifiedOem,competitor_codes:[],vehicle_applications:apps,equipment_applications:[],enrichment_data:enrichment};
  report.pre.gateway=assertGovernedCatalogPatch(current,patch,{applicationWrite:true});
  report.pre.rows=rows.rowCount; report.pre.verified_oem=verifiedOem.length; report.pre.unsupported_oem=unsupported.length; report.pre.db_payload_hash=dbHash;

  if(EXECUTE){
   for(const kind of ['VEHICLE','ENGINE']){
    const ev=await db.query("INSERT INTO public.catalog_application_evidence(sku,application_kind,payload_hash,evidence_authority,source_url,verified,verified_at,metadata) VALUES($1,$2,$3,$4,$5,true,now(),$6::jsonb) ON CONFLICT (sku,application_kind,payload_hash,evidence_authority) DO UPDATE SET source_url=EXCLUDED.source_url,verified=true,verified_at=now(),metadata=EXCLUDED.metadata RETURNING id",[SKU,kind,dbHash,'RELATIONAL_LD_VEHICLE_APPLICATIONS_WK54_PLUS_MANN_OFFICIAL',MANN_URL,JSON.stringify({migration:'run_196',source:'ld_catalog.ld_vehicle_applications',source_sku:MANN,rows:EXPECTED_ROWS})]);
    if(ev.rowCount!==1) throw new Error('APPLICATION_EVIDENCE_WRITE_FAILED '+kind);
    report.mutations.application_evidence_written=(report.mutations.application_evidence_written||0)+1;
   }

   const upd=await db.query(`UPDATE public.elimfilters_catalog SET codigo_base=$2::varchar,name='ELIMFILTERS Fuel Filter WK54',description='ELIMFILTERS light-duty diesel fuel filter; MANN-FILTER WK54 canonical.',duty='LIGHT_DUTY',filter_type='fuel',technology='SYNTAPORE™',height_mm=99,outer_diameter_mm=49,inner_diameter_mm=NULL,canonical_source_brand='MANN-FILTER',canonical_source_code=$2::text,canonical_source_url=$3::text,canonical_source_status='VERIFIED',canonical_verified_at=now(),duty_source_brand='MANN-FILTER',duty_validation_status='VERIFIED',duty_verified_at=now(),oem_codes=$4::jsonb,competitor_codes='[]'::jsonb,vehicle_applications=$5::jsonb,equipment_applications='[]'::jsonb,enrichment_data=$6::jsonb WHERE sku=$1 RETURNING sku`,[SKU,MANN,MANN_URL,JSON.stringify(verifiedOem),JSON.stringify(apps),JSON.stringify(enrichment)]);
   if(upd.rowCount!==1) throw new Error('CATALOG_UPDATE_FAILED');
   report.mutations.catalog_updated=1;

   const id=await db.query("INSERT INTO ld_catalog.ld_canonical_product_identity(elimfilters_sku,origin_group,canonical_brand,canonical_part_number,filter_type,status,evidence_source,created_at,updated_at) VALUES($1,'EUROPEAN','MANN-FILTER',$2,'fuel','ACTIVE','MIGRATION_196_WK54',now(),now()) RETURNING elimfilters_sku",[SKU,MANN]);
   if(id.rowCount!==1) throw new Error('IDENTITY_INSERT_FAILED');
   report.mutations.identity_inserted=1;

   const existing=await db.query("SELECT count(*)::int n FROM ld_catalog.ld_oem_cross_references WHERE elimfilters_sku=$1",[SKU]);
   if(existing.rows[0].n!==0) throw new Error('RELATIONAL_OEM_BASELINE_CHANGED '+existing.rows[0].n);
   for(const oe of verifiedOem){
    const ox=await db.query("INSERT INTO ld_catalog.ld_oem_cross_references(elimfilters_sku,source_sku,oem_brand,oem_part_number,created_at) VALUES($1,$2,$3,$4,now()) RETURNING id",[SKU,MANN,oe.manufacturer,oe.code]);
    if(ox.rowCount!==1) throw new Error('OEM_XREF_INSERT_FAILED '+oe.code);
    report.mutations.oem_xrefs_inserted=(report.mutations.oem_xrefs_inserted||0)+1;
   }
   await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1',[SKU]);
   await db.query('SELECT public.refresh_crossref_cache_sku($1)',[SKU]);
   report.mutations.cache_refreshed=1;
  }

  report.post=(await db.query(`SELECT
   (SELECT codigo_base FROM public.elimfilters_catalog WHERE sku=$1) codigo_base,
   (SELECT canonical_source_brand FROM public.elimfilters_catalog WHERE sku=$1) canonical_brand,
   (SELECT canonical_source_code FROM public.elimfilters_catalog WHERE sku=$1) canonical_code,
   (SELECT canonical_source_status FROM public.elimfilters_catalog WHERE sku=$1) canonical_status,
   (SELECT height_mm FROM public.elimfilters_catalog WHERE sku=$1) height_mm,
   (SELECT outer_diameter_mm FROM public.elimfilters_catalog WHERE sku=$1) diameter_mm,
   (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)) app_rows,
   (SELECT status FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=$1 AND canonical_part_number=$2) identity_status,
   (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($2) AND sku=$1) resolves,
   (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($2) AND sku<>$1) resolves_other,
   (SELECT count(*)::int FROM public.catalog_application_evidence WHERE sku=$1 AND application_kind='VEHICLE' AND payload_hash=$3 AND verified=true) vehicle_evidence,
   (SELECT count(*)::int FROM public.catalog_application_evidence WHERE sku=$1 AND application_kind='ENGINE' AND payload_hash=$3 AND verified=true) engine_evidence,
   (SELECT count(*)::int FROM ld_catalog.ld_oem_cross_references WHERE elimfilters_sku=$1) governed_oem,
   (SELECT coalesce(enrichment_data->'codigo_base_governance'->>'state','') FROM public.elimfilters_catalog WHERE sku=$1) state
  `,[SKU,MANN,dbHash])).rows[0];

  if(EXECUTE){
   const p=report.post;
   if(p.codigo_base!==MANN||p.canonical_brand!=='MANN-FILTER'||p.canonical_code!==MANN||p.canonical_status!=='VERIFIED'||Number(p.height_mm)!==99||Number(p.diameter_mm)!==49||p.app_rows!==EXPECTED_ROWS||p.identity_status!=='ACTIVE'||p.resolves!==1||p.resolves_other!==0||p.vehicle_evidence<1||p.engine_evidence<1||p.governed_oem!==verifiedOem.length||p.state!=='CANONICAL_VERIFIED') throw new Error('POSTCHECK_FAILED '+JSON.stringify(p));
   await db.query('COMMIT'); report.transaction='COMMIT';
  } else {await db.query('ROLLBACK'); report.transaction='ROLLBACK';}
  console.log(JSON.stringify(report,null,2));
 }catch(e){try{await db.query('ROLLBACK')}catch{} console.error(e.stack||e.message);process.exitCode=1;}
 finally{await db.end();}
}
if(require.main===module) main();
