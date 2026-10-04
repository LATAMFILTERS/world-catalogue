'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');

const EXECUTE=process.argv.includes('--execute');
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const SPECS=[
 {peer:'EA11510',target:'EA38715',code:'C28715',expected:65},
 {peer:'EA16386',target:'EA35853',code:'C275853',expected:42},
 {peer:'EA37149',target:'EA30507',code:'C17149',expected:121}
];

function sanitize(row){
 return {
  ...row,
  oem_codes:Array.isArray(row.oem_codes)?row.oem_codes:[],
  competitor_codes:Array.isArray(row.competitor_codes)?row.competitor_codes:[],
  vehicle_applications:Array.isArray(row.vehicle_applications)?row.vehicle_applications:[],
  equipment_applications:Array.isArray(row.equipment_applications)?row.equipment_applications:[]
 };
}

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
   const peerQ=await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',[spec.peer]);
   const targetQ=await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',[spec.target]);
   if(peerQ.rowCount!==1||targetQ.rowCount!==1) throw new Error('CATALOG_BASELINE_MISSING '+JSON.stringify(spec));
   const peer=peerQ.rows[0],target=targetQ.rows[0];
   if(peer.catalog_active!==true||target.catalog_active!==true) throw new Error('INACTIVE_CATALOG_ROW '+JSON.stringify(spec));

   const resolver=await db.query("SELECT DISTINCT sku FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1)",[spec.code]);
   const owners=[...new Set(resolver.rows.map(r=>r.sku))];
   if(owners.length!==1||owners[0]!==spec.target) throw new Error('RESOLVER_TARGET_CHANGED '+JSON.stringify({spec,owners}));

   const peerRows=await db.query("SELECT id,source_sku FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 ORDER BY id FOR UPDATE",[spec.peer]);
   if(peerRows.rowCount!==spec.expected) throw new Error('PEER_ROW_COUNT_CHANGED '+spec.peer+' '+peerRows.rowCount);
   const wrong=peerRows.rows.filter(r=>norm(r.source_sku)!==norm(spec.code));
   if(wrong.length) throw new Error('PEER_MIXED_SOURCE '+spec.peer+' '+JSON.stringify(wrong.slice(0,5)));

   const targetRows=await db.query("SELECT id,source_sku FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 ORDER BY id FOR UPDATE",[spec.target]);
   if(targetRows.rowCount!==0) throw new Error('TARGET_ROWS_CHANGED '+spec.target+' '+targetRows.rowCount);

   const targetParent=await db.query('SELECT elimfilters_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1',[spec.target]);
   if(targetParent.rowCount!==1) throw new Error('TARGET_PARENT_MISSING '+spec.target);

   const stamp=new Date().toISOString();
   const targetEnrichment={
    ...(target.enrichment_data||{}),
    relational_application_reownership:{
      migration:'run_210',
      role:'TARGET',
      source_sku:spec.code,
      from_sku:spec.peer,
      row_count:spec.expected,
      evidence_model:'SOURCE_SKU_RESOLVES_UNIQUELY_TO_TARGET__NO_PUBLIC_APPLICATION_INHERITANCE',
      public_application_write:false,
      recorded_at:stamp
    }
   };
   const peerEnrichment={
    ...(peer.enrichment_data||{}),
    relational_application_reownership:{
      migration:'run_210',
      role:'SOURCE_PEER',
      source_sku:spec.code,
      target_sku:spec.target,
      row_count:spec.expected,
      evidence_model:'SOURCE_SKU_RESOLVES_UNIQUELY_TO_TARGET__NO_PUBLIC_APPLICATION_INHERITANCE',
      public_application_write:false,
      recorded_at:stamp
    }
   };

   const targetGateway=assertGovernedCatalogPatch(sanitize(target),{enrichment_data:targetEnrichment});
   const peerGateway=assertGovernedCatalogPatch(sanitize(peer),{enrichment_data:peerEnrichment});
   const item={
    ...spec,
    target_gateway_valid:targetGateway.valid,
    peer_gateway_valid:peerGateway.valid,
    target_public_vehicle_count:Array.isArray(target.vehicle_applications)?target.vehicle_applications.length:0,
    target_public_equipment_count:Array.isArray(target.equipment_applications)?target.equipment_applications.length:0,
    peer_public_vehicle_count:Array.isArray(peer.vehicle_applications)?peer.vehicle_applications.length:0,
    peer_public_equipment_count:Array.isArray(peer.equipment_applications)?peer.equipment_applications.length:0
   };
   report.items.push(item);

   if(EXECUTE){
    const moved=await db.query("UPDATE ld_catalog.ld_vehicle_applications SET elimfilters_sku=$1 WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3) RETURNING id",[spec.target,spec.peer,spec.code]);
    if(moved.rowCount!==spec.expected) throw new Error('REOWNERSHIP_COUNT_CHANGED '+spec.peer+' '+moved.rowCount);
    report.mutations.applications_reowned=(report.mutations.applications_reowned||0)+moved.rowCount;

    const tu=await db.query('UPDATE public.elimfilters_catalog SET enrichment_data=$2::jsonb WHERE sku=$1 RETURNING sku',[spec.target,JSON.stringify(targetEnrichment)]);
    const pu=await db.query('UPDATE public.elimfilters_catalog SET enrichment_data=$2::jsonb WHERE sku=$1 RETURNING sku',[spec.peer,JSON.stringify(peerEnrichment)]);
    if(tu.rowCount!==1||pu.rowCount!==1) throw new Error('REOWNERSHIP_METADATA_UPDATE_FAILED '+JSON.stringify(spec));
    report.mutations.catalog_metadata_updated=(report.mutations.catalog_metadata_updated||0)+2;

    for(const sku of [spec.peer,spec.target]){
      await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1',[sku]);
      await db.query('SELECT public.refresh_crossref_cache_sku($1)',[sku]);
      report.mutations.cache_refreshed=(report.mutations.cache_refreshed||0)+1;
    }
   }

   const post=(await db.query(`SELECT
     (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1) peer_rows,
     (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) target_code_rows,
     (SELECT jsonb_array_length(coalesce(vehicle_applications,'[]'::jsonb)) FROM public.elimfilters_catalog WHERE sku=$1) peer_public_vehicle,
     (SELECT jsonb_array_length(coalesce(equipment_applications,'[]'::jsonb)) FROM public.elimfilters_catalog WHERE sku=$1) peer_public_equipment,
     (SELECT jsonb_array_length(coalesce(vehicle_applications,'[]'::jsonb)) FROM public.elimfilters_catalog WHERE sku=$2) target_public_vehicle,
     (SELECT jsonb_array_length(coalesce(equipment_applications,'[]'::jsonb)) FROM public.elimfilters_catalog WHERE sku=$2) target_public_equipment
   `,[spec.peer,spec.target,spec.code])).rows[0];
   item.post=post;

   if(EXECUTE){
    if(post.peer_rows!==0||post.target_code_rows!==spec.expected) throw new Error('POSTCHECK_RELATIONAL_FAILED '+JSON.stringify({spec,post}));
    if(post.peer_public_vehicle!==item.peer_public_vehicle_count||post.peer_public_equipment!==item.peer_public_equipment_count||post.target_public_vehicle!==item.target_public_vehicle_count||post.target_public_equipment!==item.target_public_equipment_count){
      throw new Error('PUBLIC_APPLICATIONS_CHANGED_UNEXPECTEDLY '+JSON.stringify({spec,post,item}));
    }
   }
  }

  if(EXECUTE){await db.query('COMMIT');report.transaction='COMMIT';}
  else{await db.query('ROLLBACK');report.transaction='ROLLBACK';}
  console.log(JSON.stringify(report,null,2));
 }catch(e){try{await db.query('ROLLBACK')}catch{} console.error(e.stack||e.message);process.exitCode=1;}
 finally{await db.end();}
}
if(require.main===module) main();
