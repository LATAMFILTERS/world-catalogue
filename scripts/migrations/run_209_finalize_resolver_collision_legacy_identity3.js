'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');

const EXECUTE=process.argv.includes('--execute');
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const SPECS=[
  {sku:'EA11510',brand:'DONALDSON',code:'P771510',method:'DONALDSON_CLOSED_UNIVERSE',identityMode:'ABSENT'},
  {sku:'EA16386',brand:'DONALDSON',code:'P776386',method:'DONALDSON_CLOSED_UNIVERSE',identityMode:'ABSENT'},
  {sku:'EA30507',brand:'FRAM',code:'CA507SY',origin:'NON_EUROPEAN',method:'FRAM_LD_MULTI_REGION',identityMode:'EXISTING'}
];

async function main(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
 if(!url) throw new Error('DB URL missing');
 const u=new URL(url);
 if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');
 const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
 await db.connect();
 const report={mode:EXECUTE?'execute':'dry-run',items:[],mutations:{}};
 try{
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  for(const spec of SPECS){
   const q=await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',[spec.sku]);
   if(q.rowCount!==1) throw new Error('SKU_NOT_UNIQUE '+spec.sku);
   const current=q.rows[0];
   if(current.catalog_active!==true) throw new Error('SKU_NOT_ACTIVE '+spec.sku);
   if(norm(current.codigo_base)!==norm(spec.code)||norm(current.canonical_source_code)!==norm(spec.code)||String(current.canonical_source_brand||'').toUpperCase()!==spec.brand||current.canonical_source_status!=='VERIFIED') {
    throw new Error('CANONICAL_BASELINE_CHANGED '+spec.sku);
   }
   const existingGov=current.enrichment_data?.codigo_base_governance||{};
   if(String(existingGov.state||'')!=='VERIFY_PRIMARY_ABSENCE') throw new Error('GOVERNANCE_BASELINE_CHANGED '+spec.sku+' '+String(existingGov.state||''));

   const parent=await db.query('SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 FOR UPDATE',[spec.sku]);
   if(parent.rowCount!==1) throw new Error('PARENT_MISSING '+spec.sku);

   const identity=await db.query("SELECT elimfilters_sku,origin_group,canonical_brand,canonical_part_number,filter_type,status,evidence_source FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=$1 AND status='ACTIVE' FOR UPDATE",[spec.sku]);
   if(spec.identityMode==='ABSENT' && identity.rowCount!==0) throw new Error('HD_IDENTITY_TABLE_MUST_BE_EMPTY '+spec.sku);
   if(spec.identityMode==='EXISTING'){
    if(identity.rowCount!==1||String(identity.rows[0].canonical_brand||'').toUpperCase()!==spec.brand||norm(identity.rows[0].canonical_part_number)!==norm(spec.code)) throw new Error('IDENTITY_BASELINE_CHANGED '+spec.sku+' '+JSON.stringify(identity.rows));
   }

   const identityCollision=await db.query("SELECT elimfilters_sku,canonical_brand,canonical_part_number,status FROM ld_catalog.ld_canonical_product_identity WHERE status='ACTIVE' AND ld_catalog.norm_part(canonical_part_number)=ld_catalog.norm_part($1) AND elimfilters_sku<>$2",[spec.code,spec.sku]);
   if(identityCollision.rowCount) throw new Error('IDENTITY_CODE_COLLISION '+spec.sku+' '+JSON.stringify(identityCollision.rows));

   const resolverConflict=await db.query("SELECT code,sku,manufacturer,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1) AND sku<>$2",[spec.code,spec.sku]);
   if(resolverConflict.rowCount) throw new Error('RESOLVER_CONFLICT '+spec.sku+' '+JSON.stringify(resolverConflict.rows));

   const sourceUrl=current.canonical_source_url||current.canonical_evidence?.source_url||null;
   if(spec.brand==='DONALDSON'){
    if(!sourceUrl||!String(sourceUrl).toLowerCase().includes('donaldson.com')) throw new Error('DONALDSON_OFFICIAL_URL_MISSING '+spec.sku);
    if(current.canonical_evidence?.source!=='DONALDSON_CLOSED_UNIVERSE') throw new Error('DONALDSON_CLOSED_UNIVERSE_EVIDENCE_MISSING '+spec.sku);
   }
   if(spec.brand==='FRAM'){
    if(current.canonical_evidence?.source_catalog_scope!=='FRAM_LD_MULTI_REGION') throw new Error('FRAM_MULTI_REGION_EVIDENCE_MISSING '+spec.sku);
    if(current.canonical_evidence?.authority!==spec.code) throw new Error('FRAM_AUTHORITY_MISMATCH '+spec.sku);
   }

   const gov={
    ...existingGov,
    policy_version:'2026-10-04-v4.2',
    state:'CANONICAL_VERIFIED',
    governance_state:'CANONICAL_VERIFIED',
    ...(spec.origin?{origin_group:spec.origin}:{}),
    required_authority:spec.brand==='DONALDSON'?'VERIFIED_DONALDSON':'VERIFIED_FRAM',
    primary_manufacturer_verified:true,
    approved_manufacturer:spec.brand,
    approved_codigo_base:spec.code,
    current_codigo_base:spec.code,
    approved_source_column:'CANONICAL_POLICY',
    verification_method:spec.method,
    evidence_url:sourceUrl,
    evidence_note:spec.brand==='DONALDSON'
      ? 'Canonical identity finalized from existing VERIFIED Donaldson closed-universe evidence and official Donaldson product URL.'
      : 'Canonical identity governance aligned to existing VERIFIED FRAM LD multi-region authority and ACTIVE identity.'
   };
   const enrichment={...(current.enrichment_data||{}),codigo_base_governance:gov};
   const gatewayCurrent={
    ...current,
    oem_codes:Array.isArray(current.oem_codes)?current.oem_codes:[],
    competitor_codes:Array.isArray(current.competitor_codes)?current.competitor_codes:[],
    vehicle_applications:Array.isArray(current.vehicle_applications)?current.vehicle_applications:[],
    equipment_applications:Array.isArray(current.equipment_applications)?current.equipment_applications:[]
   };
   const gateway=assertGovernedCatalogPatch(gatewayCurrent,{enrichment_data:enrichment});
   const item={sku:spec.sku,parent_source:parent.rows[0].source_sku,gateway_valid:gateway.valid,identity_before:identity.rows,source_url:sourceUrl};
   report.items.push(item);

   if(EXECUTE){
    const upd=await db.query('UPDATE public.elimfilters_catalog SET enrichment_data=$2::jsonb WHERE sku=$1 RETURNING sku',[spec.sku,JSON.stringify(enrichment)]);
    if(upd.rowCount!==1) throw new Error('CATALOG_UPDATE_FAILED '+spec.sku);
    report.mutations.catalog_updated=(report.mutations.catalog_updated||0)+1;

    const evidencePayload={
      migration:'run_209',
      canonical_source_brand:spec.brand,
      canonical_source_code:spec.code,
      canonical_source_status:current.canonical_source_status,
      canonical_verified_at:current.canonical_verified_at,
      canonical_evidence:current.canonical_evidence||{},
      prior_governance_state:existingGov.state||null,
      final_governance_state:'CANONICAL_VERIFIED'
    };
    const ev=await db.query(`INSERT INTO public.catalog_identity_evidence(sku,evidence_type,authority,source_code,source_url,evidence,verified,verified_at,created_at)
      SELECT $1,'CANONICAL_SOURCE_IDENTITY',$2,$3,$4,$5::jsonb,true,now(),now()
      WHERE NOT EXISTS(
        SELECT 1 FROM public.catalog_identity_evidence
        WHERE sku=$1 AND evidence_type='CANONICAL_SOURCE_IDENTITY' AND authority=$2 AND ld_catalog.norm_part(source_code)=ld_catalog.norm_part($3) AND verified=true
      ) RETURNING id`,[spec.sku,spec.brand,spec.code,sourceUrl,JSON.stringify(evidencePayload)]);
    report.mutations.identity_evidence_inserted=(report.mutations.identity_evidence_inserted||0)+ev.rowCount;

    await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1',[spec.sku]);
    await db.query('SELECT public.refresh_crossref_cache_sku($1)',[spec.sku]);
    report.mutations.cache_refreshed=(report.mutations.cache_refreshed||0)+1;
   }

   const post=(await db.query(`SELECT
     (SELECT coalesce(enrichment_data->'codigo_base_governance'->>'state','') FROM public.elimfilters_catalog WHERE sku=$1) state,
     (SELECT canonical_source_status FROM public.elimfilters_catalog WHERE sku=$1) canonical_status,
     (SELECT count(*)::int FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=$1 AND status='ACTIVE' AND upper(canonical_brand)=upper($2) AND ld_catalog.norm_part(canonical_part_number)=ld_catalog.norm_part($3)) active_identity,
     (SELECT count(*)::int FROM public.catalog_identity_evidence WHERE sku=$1 AND evidence_type='CANONICAL_SOURCE_IDENTITY' AND verified=true AND upper(authority)=upper($2) AND ld_catalog.norm_part(source_code)=ld_catalog.norm_part($3)) verified_identity_evidence,
     (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($3) AND sku=$1) resolver_self,
     (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($3) AND sku<>$1) resolver_other
    `,[spec.sku,spec.brand,spec.code])).rows[0];
   item.post=post;
   if(EXECUTE){
    const expectedIdentity=spec.identityMode==='EXISTING'?1:0;
    if(post.state!=='CANONICAL_VERIFIED'||post.canonical_status!=='VERIFIED'||post.active_identity!==expectedIdentity||post.verified_identity_evidence<1||post.resolver_other!==0) throw new Error('POSTCHECK_FAILED '+spec.sku+' '+JSON.stringify(post));
   }
  }

  if(EXECUTE){await db.query('COMMIT');report.transaction='COMMIT';}
  else {await db.query('ROLLBACK');report.transaction='ROLLBACK';}
  console.log(JSON.stringify(report,null,2));
 }catch(e){try{await db.query('ROLLBACK')}catch{} console.error(e.stack||e.message);process.exitCode=1;}
 finally{await db.end();}
}
if(require.main===module) main();
