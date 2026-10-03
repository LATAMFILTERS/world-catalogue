'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');

const EXECUTE=process.argv.includes('--execute');
const TARGET='EA10622';
const TARGET_BASE='P780622';
const CURRENT_SOURCE='EA31410';
const CURRENT='C311410';
const OLD_SOURCE='EA31447';
const OLD='C321447';
const KEEP='C291410';
const EXPECTED_CURRENT=73;
const EXPECTED_OLD=77;
const EXPECTED_OLD_DUPLICATES=29;
const EXPECTED_OLD_UNIQUE=48;
const EXPECTED_KEEP=2;
const DONALDSON_URL='https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/catalogs/industries-markets/truck-bus/emea/f116002/Truck-Bus-Catalogue.pdf';
const MANN_URL='https://www.mann-filter.com/us-en/catalog/search-results/product.html/c311410_mann-filter.html';

async function main(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
 if(!url) throw new Error('DB URL missing');
 const u=new URL(url);
 if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');
 const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
 await db.connect();
 const report={mode:EXECUTE?'execute':'dry-run',target:TARGET,base:TARGET_BASE,current:CURRENT,predecessor:OLD,pre:{},mutations:{},post:{}};
 try{
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

  const targetQ=await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',[TARGET]);
  if(targetQ.rowCount!==1) throw new Error('TARGET_NOT_UNIQUE');
  const target=targetQ.rows[0];
  if(target.codigo_base!==TARGET_BASE||target.duty!=='HEAVY_DUTY'||target.filter_type!=='air'||String(target.technology||'').toUpperCase().replace(/[^A-Z0-9]/g,'')!=='MACROCORE'||target.canonical_source_code!==TARGET_BASE||target.canonical_source_brand!=='DONALDSON'){
   throw new Error('TARGET_IDENTITY_CHANGED');
  }
  const currentOwner=await db.query(
   "SELECT sku,codigo_base,duty,filter_type,canonical_source_code FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE",
   [CURRENT_SOURCE]
  );
  const oldOwner=await db.query(
   "SELECT sku,codigo_base,duty,filter_type,canonical_source_code,enrichment_data,catalog_active FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE",
   [OLD_SOURCE]
  );
  if(currentOwner.rowCount!==1||currentOwner.rows[0].codigo_base!=='C291410'||currentOwner.rows[0].canonical_source_code!=='C291410') throw new Error('CURRENT_SOURCE_CHANGED');
  if(oldOwner.rowCount!==1||oldOwner.rows[0].codigo_base!==OLD||oldOwner.rows[0].canonical_source_code!==OLD||oldOwner.rows[0].catalog_active!==true) throw new Error('PREDECESSOR_SOURCE_CHANGED');

  const curRows=await db.query(
   "SELECT id FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2) ORDER BY id",
   [CURRENT_SOURCE,CURRENT]
  );
  const oldRows=await db.query(
   "SELECT id FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2) ORDER BY id",
   [OLD_SOURCE,OLD]
  );
  const keepRows=await db.query(
   "SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)",
   [CURRENT_SOURCE,KEEP]
  );
  if(curRows.rowCount!==EXPECTED_CURRENT) throw new Error('CURRENT_ROW_COUNT_CHANGED '+curRows.rowCount);
  if(oldRows.rowCount!==EXPECTED_OLD) throw new Error('OLD_ROW_COUNT_CHANGED '+oldRows.rowCount);
  const overlapQ=await db.query(
   "WITH c AS (SELECT make,model_family,model_type,year FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)), o AS (SELECT make,model_family,model_type,year FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$3 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)) SELECT count(*)::int n FROM o WHERE EXISTS (SELECT 1 FROM c WHERE coalesce(c.make,'')=coalesce(o.make,'') AND coalesce(c.model_family,'')=coalesce(o.model_family,'') AND coalesce(c.model_type,'')=coalesce(o.model_type,'') AND coalesce(c.year,'')=coalesce(o.year,''))",
   [CURRENT_SOURCE,CURRENT,OLD_SOURCE,OLD]
  );
  const oldDuplicateCount=overlapQ.rows[0].n;
  const oldUniqueCount=EXPECTED_OLD-oldDuplicateCount;
  if(oldDuplicateCount!==EXPECTED_OLD_DUPLICATES||oldUniqueCount!==EXPECTED_OLD_UNIQUE) throw new Error('PREDECESSOR_OVERLAP_CHANGED '+JSON.stringify({oldDuplicateCount,oldUniqueCount}));
  if(keepRows.rows[0].n!==EXPECTED_KEEP) throw new Error('KEEP_ROW_COUNT_CHANGED '+keepRows.rows[0].n);
  const targetParent=await db.query("SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1",[TARGET]);
  if(targetParent.rowCount>0 && !(targetParent.rowCount===1&&targetParent.rows[0].source_sku===TARGET_BASE)) throw new Error('TARGET_PARENT_CONFLICT');

  const targetIdentity=await db.query("SELECT elimfilters_sku,canonical_part_number,status FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=$1",[TARGET]);
  if(targetIdentity.rowCount>0 && !(targetIdentity.rowCount===1&&targetIdentity.rows[0].canonical_part_number===TARGET_BASE&&targetIdentity.rows[0].status==='ACTIVE')) throw new Error('TARGET_IDENTITY_CONFLICT');

  const oldIdentity=await db.query("SELECT elimfilters_sku,canonical_part_number,status FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=$1 FOR UPDATE",[OLD_SOURCE]);
  if(oldIdentity.rowCount!==1||oldIdentity.rows[0].canonical_part_number!==OLD||oldIdentity.rows[0].status!=='ACTIVE') throw new Error('OLD_CANONICAL_IDENTITY_CHANGED');

  const xrefs=await db.query(
   "SELECT elimfilters_sku,competitor_part_number FROM ld_catalog.ld_competitor_cross_references WHERE ld_catalog.norm_part(competitor_part_number) IN (ld_catalog.norm_part($1),ld_catalog.norm_part($2))",
   [CURRENT,OLD]
  );
  if(xrefs.rows.some(r=>r.elimfilters_sku!==TARGET)) throw new Error('MANN_XREF_CONFLICT '+JSON.stringify(xrefs.rows));

  const gov={
   ...(target.enrichment_data?.codigo_base_governance||{}),
   policy_version:'2026-10-03-v4.1',
   state:'CANONICAL_VERIFIED',
   governance_state:'CANONICAL_VERIFIED',
   required_authority:'VERIFIED_DONALDSON',
   primary_manufacturer_verified:true,
   approved_manufacturer:'DONALDSON',
   approved_codigo_base:TARGET_BASE,
   current_codigo_base:TARGET_BASE,
   approved_source_column:'CANONICAL_POLICY',
   verification_method:'DONALDSON_TRUCK_BUS_OE_MAPPING_PLUS_MANN_SUCCESSOR',
   evidence_url:DONALDSON_URL,
   supporting_evidence_url:MANN_URL,
   supersedes:[OLD],
   evidence_note:'Donaldson maps Renault Trucks OE 5010230841 to standard primary RadialSeal P780622. MANN C311410 is a heavy-duty Renault Trucks/Sisu/Volvo air filter in a Donaldson filtration system; C321447 is its predecessor.'
  };
  const targetEnrichment={...(target.enrichment_data||{}),codigo_base_governance:gov};
  report.pre.gateway=assertGovernedCatalogPatch(target,{enrichment_data:targetEnrichment});
  report.pre.current_rows=curRows.rowCount;
  report.pre.predecessor_rows=oldRows.rowCount;
  report.pre.predecessor_constraint_duplicates=oldDuplicateCount;
  report.pre.predecessor_unique=oldUniqueCount;
  report.pre.keep_rows=keepRows.rows[0].n;
  report.pre.target_parent=targetParent.rowCount;
  report.pre.target_identity=targetIdentity.rowCount;
  report.pre.existing_xrefs=xrefs.rowCount;
  if(EXECUTE){
   if(targetParent.rowCount===0){
    const p=await db.query("INSERT INTO ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment,created_at,updated_at) VALUES($1,$2,'Air Filter',now(),now()) RETURNING elimfilters_sku",[TARGET,TARGET_BASE]);
    if(p.rowCount!==1) throw new Error('TARGET_PARENT_INSERT_FAILED');
    report.mutations.parent_inserted=1;
   }else report.mutations.parent_inserted=0;

   if(targetIdentity.rowCount!==0) throw new Error('HD_TARGET_MUST_NOT_USE_LD_CANONICAL_IDENTITY');
   report.mutations.identity_inserted=0;

   const upd=await db.query(
    `UPDATE public.elimfilters_catalog
     SET canonical_source_brand='DONALDSON',canonical_source_code=$2,canonical_source_url=$3,
         canonical_source_status='VERIFIED',canonical_verified_at=now(),
         duty='HEAVY_DUTY',duty_source_brand='DONALDSON',duty_validation_status='VERIFIED',duty_verified_at=now(),
         enrichment_data=$4::jsonb
     WHERE sku=$1 RETURNING sku`,
    [TARGET,TARGET_BASE,DONALDSON_URL,JSON.stringify(targetEnrichment)]
   );
   if(upd.rowCount!==1) throw new Error('TARGET_GOVERNANCE_UPDATE_FAILED');
   report.mutations.target_governance_updated=1;

   for(const code of [CURRENT,OLD]){
    if(!xrefs.rows.some(r=>r.competitor_part_number===code&&r.elimfilters_sku===TARGET)){
     const x=await db.query(
      "INSERT INTO ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number,created_at) VALUES($1,$2,'MANN-FILTER',$3,now()) RETURNING id",
      [TARGET,TARGET_BASE,code]
     );
     if(x.rowCount!==1) throw new Error('XREF_INSERT_FAILED '+code);
     report.mutations.xrefs_inserted=(report.mutations.xrefs_inserted||0)+1;
    }
   }
   const movedCurrent=await db.query(
    "UPDATE ld_catalog.ld_vehicle_applications SET elimfilters_sku=$1 WHERE elimfilters_sku=$2 AND id=ANY($3::bigint[]) AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)",
    [TARGET,CURRENT_SOURCE,curRows.rows.map(r=>r.id),CURRENT]
   );
   const deletedOldDuplicates=await db.query(
    "DELETE FROM ld_catalog.ld_vehicle_applications o USING ld_catalog.ld_vehicle_applications c WHERE o.elimfilters_sku=$1 AND ld_catalog.norm_part(o.source_sku)=ld_catalog.norm_part($2) AND c.elimfilters_sku=$3 AND ld_catalog.norm_part(c.source_sku)=ld_catalog.norm_part($4) AND coalesce(c.make,'')=coalesce(o.make,'') AND coalesce(c.model_family,'')=coalesce(o.model_family,'') AND coalesce(c.model_type,'')=coalesce(o.model_type,'') AND coalesce(c.year,'')=coalesce(o.year,'') RETURNING o.id",
    [OLD_SOURCE,OLD,TARGET,CURRENT]
   );
   const movedOld=await db.query(
    "UPDATE ld_catalog.ld_vehicle_applications SET elimfilters_sku=$1 WHERE elimfilters_sku=$2 AND id=ANY($3::bigint[]) AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)",
    [TARGET,OLD_SOURCE,oldRows.rows.map(r=>r.id),OLD]
   );
   if(movedCurrent.rowCount!==EXPECTED_CURRENT||deletedOldDuplicates.rowCount!==EXPECTED_OLD_DUPLICATES||movedOld.rowCount!==EXPECTED_OLD_UNIQUE) throw new Error('APPLICATION_MOVE_FAILED '+JSON.stringify({movedCurrent:movedCurrent.rowCount,deletedOldDuplicates:deletedOldDuplicates.rowCount,movedOld:movedOld.rowCount}));
   report.mutations.current_reowned=movedCurrent.rowCount;
   report.mutations.predecessor_duplicates_deleted=deletedOldDuplicates.rowCount;
   report.mutations.predecessor_reowned=movedOld.rowCount;

   const retiredIdentity=await db.query("UPDATE ld_catalog.ld_canonical_product_identity SET status='RETIRED',updated_at=now(),evidence_source='MIGRATION_165_SUPERSEDED_BY_C311410_P780622' WHERE elimfilters_sku=$1 AND canonical_part_number=$2 AND status='ACTIVE' RETURNING elimfilters_sku",[OLD_SOURCE,OLD]);
   if(retiredIdentity.rowCount!==1) throw new Error('OLD_IDENTITY_RETIRE_FAILED');
   report.mutations.old_identity_retired=1;

   const oldGov={...(oldOwner.rows[0].enrichment_data?.codigo_base_governance||{})};
   oldGov.state='SUPERSEDED';
   oldGov.governance_state='SUPERSEDED';
   oldGov.superseded_by={sku:TARGET,canonical_code:CURRENT,donaldson_base:TARGET_BASE};
   oldGov.superseded_at=new Date().toISOString();
   oldGov.policy_version='2026-10-03-v4.1';
   const oldEnrichment={...(oldOwner.rows[0].enrichment_data||{}),codigo_base_governance:oldGov};
   const retiredProduct=await db.query("UPDATE public.elimfilters_catalog SET catalog_active=false,enrichment_data=$2::jsonb WHERE sku=$1 RETURNING sku",[OLD_SOURCE,JSON.stringify(oldEnrichment)]);
   if(retiredProduct.rowCount!==1) throw new Error('OLD_PRODUCT_RETIRE_FAILED');
   report.mutations.old_product_retired=1;

   await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=ANY($1::text[])',[[TARGET,CURRENT_SOURCE,OLD_SOURCE]]);
   await db.query('SELECT public.refresh_crossref_cache_sku($1)',[TARGET]);
   await db.query('SELECT public.refresh_crossref_cache_sku($1)',[CURRENT_SOURCE]);
   report.mutations.cache_refreshed=2;
  }
  const post=await db.query(`
   SELECT
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)) target_current,
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) target_old,
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$4 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)) source_current,
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$5 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) source_old,
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$4 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($6)) keep_rows,
    (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($7) AND sku=$1) base_resolves,
    (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($2) AND sku=$1) current_resolves,
    (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($3) AND sku=$1) old_resolves,
    (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($3) AND sku<>$1) old_other,
    (SELECT status FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=$5) old_identity_status,
    (SELECT catalog_active FROM public.elimfilters_catalog WHERE sku=$5) old_active,
    (SELECT duty FROM public.elimfilters_catalog WHERE sku=$1) target_duty,
    (SELECT coalesce(enrichment_data->'codigo_base_governance'->>'state','') FROM public.elimfilters_catalog WHERE sku=$1) target_state
  `,[TARGET,CURRENT,OLD,CURRENT_SOURCE,OLD_SOURCE,KEEP,TARGET_BASE]);
  report.post=post.rows[0];

  if(EXECUTE){
   if(report.post.target_current!==EXPECTED_CURRENT||report.post.target_old!==EXPECTED_OLD_UNIQUE||
      report.post.source_current!==0||report.post.source_old!==0||report.post.keep_rows!==EXPECTED_KEEP||
      report.post.base_resolves!==1||report.post.current_resolves!==1||report.post.old_resolves!==1||report.post.old_other!==0||
      report.post.old_identity_status!=='RETIRED'||report.post.old_active!==false||
      report.post.target_duty!=='HEAVY_DUTY'||report.post.target_state!=='CANONICAL_VERIFIED'){
    throw new Error('POSTCHECK_FAILED '+JSON.stringify(report.post));
   }
   await db.query('COMMIT');report.transaction='COMMIT';
  }else{
   await db.query('ROLLBACK');report.transaction='ROLLBACK';
  }
  console.log(JSON.stringify(report,null,2));
 }catch(e){
  try{await db.query('ROLLBACK')}catch{}
  console.error(e.stack||e);process.exitCode=1;
 }finally{await db.end();}
}
if(require.main===module) main();
