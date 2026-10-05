'use strict';
const {Client}=require('pg');

const EXECUTE=process.argv.includes('--execute');
const TARGETS=new Set([
'EA30148','EA30703','EA31004','EA31144','EA31161','EA31170','EA31226','EA31401','EA31653','EA31801',
'EA32006','EA32025','EA32335','EA33252','EA34010','EA34402','EA34870','EA35081','EA35150','EA35300',
'EA36503','EA36508','EA37225','EA38398','EA38401','EA38502','EA38507','EC30018','EC32345','EF30020',
'EF30729','EF30911','EF31059','EF31168','EF34019','EF37162','EF38041','EF38112','EF38120','EF38121',
'EF38133','EF38148','EF38155','EF39190','EF39406','EL30005','EL30006','EL30013','EL30231','EL30792',
'EL30960','EL30962','EL31001','EL31102','EL31140','EL31160','EL31269','EL32572','EL32574','EL34011',
'EL34024','EL34281','EL36219','EL39452','EL39621'
]);

const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const appKey=r=>[r.make,r.model_family,r.model_type,r.year||'',r.engine_code||'']
  .map(v=>String(v||'').trim().toUpperCase()).join('|');

function officialMannUrl(url){
  try{
    const host=new URL(url).hostname.toLowerCase().replace(/^www\./,'');
    return host==='mann-filter.com' || host.endsWith('.mann-filter.com');
  }catch{return false;}
}

async function main(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
 if(!url) throw new Error('DB URL missing');
 const u=new URL(url);
 if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');

 const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
 await db.connect();
 const report={mode:EXECUTE?'execute':'dry-run',matched:0,ready:[],skipped:[],mutations:{}};

 try{
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

  const dossiers=(await db.query(`
    SELECT d.*, b.discovery_hints, b.status backlog_status
    FROM hermes_catalogue_dossier d
    JOIN hermes_catalogue_backlog b ON b.backlog_id=d.backlog_id
    WHERE d.dossier_status='REVIEW_REQUIRED'
      AND d.canonical_role='CANONICAL_BASE'
      AND d.identity_status='VERIFIED'
      AND d.consistency_status='VERIFIED'
      AND d.provenance_status='VERIFIED'
    ORDER BY d.last_researched_at,d.sku
    FOR UPDATE OF d,b`)).rows;

  for(const d of dossiers){
   if(!TARGETS.has(d.sku)) continue;
   report.matched++;

   const code=String(d.source_code||'').trim();
   const sourceUrls=Array.isArray(d.source_urls)?d.source_urls:[];
   const sourceUrl=sourceUrls.find(Boolean)||null;
   if(!code){report.skipped.push({sku:d.sku,reason:'DOSSIER_CODE_MISSING'});continue;}

   const candidate=(await db.query(
     "SELECT * FROM ld_catalog.ld_canonical_backfill_candidates WHERE elimfilters_sku=$1 FOR UPDATE",
     [d.sku]
   )).rows[0]||null;

   const mannEuropean=candidate
     && candidate.origin_group==='EUROPEAN'
     && String(candidate.canonical_brand||'').toUpperCase()==='MANN-FILTER'
     && candidate.candidate_state==='READY_SOURCE_MANN'
     && norm(candidate.canonical_part_number)===norm(code);

   if(!mannEuropean){
    report.skipped.push({sku:d.sku,reason:'NOT_EUROPEAN_READY_SOURCE_MANN',code});
    continue;
   }
   if(!officialMannUrl(sourceUrl)){
    report.skipped.push({sku:d.sku,reason:'OFFICIAL_MANN_URL_REQUIRED',code,source_url:sourceUrl});
    continue;
   }

   const evId=Array.isArray(d.evidence_ids)?d.evidence_ids[0]:null;
   if(!evId){report.skipped.push({sku:d.sku,reason:'HERMES_EVIDENCE_ID_MISSING'});continue;}

   const ev=await db.query(
     "SELECT evidence_id,verification_status,source_url FROM hermes_catalogue_evidence WHERE evidence_id=$1",
     [evId]
   );
   if(ev.rowCount!==1||ev.rows[0].verification_status!=='VERIFIED'||!officialMannUrl(ev.rows[0].source_url||sourceUrl)){
    report.skipped.push({sku:d.sku,reason:'HERMES_EVIDENCE_NOT_VERIFIED_MANN',evidence_id:evId});
    continue;
   }

   const resolver=(await db.query(
     "SELECT DISTINCT sku FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1)",
     [code]
   )).rows;
   const owners=[...new Set(resolver.map(r=>r.sku))];
   if(owners.length!==1||owners[0]===d.sku){
    report.skipped.push({sku:d.sku,reason:'NOT_UNIQUE_OTHER_RESOLVER_TARGET',code,owners});
    continue;
   }
   const target=owners[0];

   const catalogs=(await db.query(
     "SELECT sku,filter_type,catalog_active FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) FOR UPDATE",
     [[d.sku,target]]
   )).rows;
   if(catalogs.length!==2||catalogs.some(r=>r.catalog_active!==true)){
    report.skipped.push({sku:d.sku,target,reason:'CATALOG_TARGET_OR_PEER_NOT_ACTIVE'});
    continue;
   }
   const peerCat=catalogs.find(r=>r.sku===d.sku);
   const targetCat=catalogs.find(r=>r.sku===target);
   if(String(peerCat.filter_type||'').toLowerCase()!==String(targetCat.filter_type||'').toLowerCase()){
    report.skipped.push({sku:d.sku,target,reason:'FILTER_TYPE_MISMATCH'});
    continue;
   }

   const parent=await db.query(
     "SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 FOR UPDATE",
     [d.sku]
   );
   if(parent.rowCount!==1||norm(parent.rows[0].source_sku)!==norm(code)){
    report.skipped.push({sku:d.sku,target,reason:'PARENT_SOURCE_NOT_DOSSIER_CODE',parent:parent.rows});
    continue;
   }
   const targetParent=await db.query(
     "SELECT elimfilters_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1",
     [target]
   );
   if(targetParent.rowCount!==1){
    report.skipped.push({sku:d.sku,target,reason:'TARGET_PARENT_MISSING'});
    continue;
   }

   const peerRows=(await db.query(
     "SELECT id,source_sku,make,model_family,model_type,year,engine_code FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 ORDER BY id FOR UPDATE",
     [d.sku]
   )).rows;
   const moveRows=peerRows.filter(r=>norm(r.source_sku)===norm(code));
   if(!moveRows.length){
    report.skipped.push({sku:d.sku,target,reason:'NO_ROWS_FOR_CONFIRMED_CODE',code});
    continue;
   }

   const remaining=peerRows.filter(r=>norm(r.source_sku)!==norm(code));
   const remainingSources=[...new Set(remaining.map(r=>r.source_sku).filter(Boolean))];
   if(remainingSources.length!==1){
    report.skipped.push({
      sku:d.sku,target,reason:'REMAINING_SOURCE_NOT_UNIQUE',
      code,remaining_rows:remaining.length,remaining_sources:remainingSources
    });
    continue;
   }
   const nextSource=remainingSources[0];

   const targetRows=(await db.query(
     "SELECT id,source_sku,make,model_family,model_type,year,engine_code FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1",
     [target]
   )).rows;
   const targetKeys=new Set(targetRows.map(appKey));
   const duplicates=moveRows.filter(r=>targetKeys.has(appKey(r)));
   if(duplicates.length){
    report.skipped.push({
      sku:d.sku,target,reason:'TARGET_APPLICATION_DUPLICATES',
      code,move_rows:moveRows.length,duplicates:duplicates.length
    });
    continue;
   }

   const item={
    sku:d.sku,target,confirmed_code:code,evidence_id:evId,
    move_rows:moveRows.length,remaining_rows:remaining.length,
    next_source:nextSource,manufacturer:d.manufacturer,source_url:sourceUrl
   };
   report.ready.push(item);

   if(EXECUTE){
    const moved=await db.query(
      "UPDATE ld_catalog.ld_vehicle_applications SET elimfilters_sku=$1 WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3) RETURNING id",
      [target,d.sku,code]
    );
    if(moved.rowCount!==moveRows.length) throw new Error('REOWNERSHIP_COUNT_CHANGED '+d.sku);
    report.mutations.applications_reowned=(report.mutations.applications_reowned||0)+moved.rowCount;

    const pp=await db.query(
      "UPDATE ld_catalog.ld_product_catalog SET source_sku=$2 WHERE elimfilters_sku=$1 RETURNING elimfilters_sku",
      [d.sku,nextSource]
    );
    if(pp.rowCount!==1) throw new Error('PARENT_ROTATION_FAILED '+d.sku);
    report.mutations.parents_rotated=(report.mutations.parents_rotated||0)+1;

    const bc=await db.query(`
      UPDATE ld_catalog.ld_canonical_backfill_candidates
      SET canonical_part_number=ld_catalog.norm_part($2),
          candidate_state='READY_SOURCE_MANN',
          updated_at=now()
      WHERE elimfilters_sku=$1
        AND origin_group='EUROPEAN'
        AND canonical_brand='MANN-FILTER'
      RETURNING elimfilters_sku`,[d.sku,nextSource]);
    if(bc.rowCount!==1) throw new Error('BACKFILL_CANDIDATE_ROTATION_FAILED '+d.sku);
    report.mutations.backfill_candidates_rotated=(report.mutations.backfill_candidates_rotated||0)+1;

    await db.query(
      "UPDATE hermes_catalogue_evidence SET provenance=coalesce(provenance,'{}'::jsonb)||$2::jsonb,updated_at=now() WHERE evidence_id=$1",
      [evId,JSON.stringify({
        resolver_duplicate_resolution:{
          peer_sku:d.sku,target_sku:target,confirmed_code:code,
          moved_rows:moved.rowCount,next_source:nextSource,migration:'run_212'
        }
      })]
    );

    await db.query(`
      UPDATE hermes_catalogue_backlog
      SET status='OPEN',next_attempt_at=now(),last_research_error=NULL,
          resolved_at=NULL,updated_at=now()
      WHERE backlog_id=$1`,[d.backlog_id]);

    await db.query(
      "UPDATE hermes_catalogue_dossier SET dossier_status='APPROVED',updated_at=now() WHERE sku=$1",
      [d.sku]
    );
    report.mutations.source_reopened=(report.mutations.source_reopened||0)+1;

    for(const sku of [d.sku,target]){
      await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1',[sku]);
      await db.query('SELECT public.refresh_crossref_cache_sku($1)',[sku]);
      report.mutations.cache_refreshed=(report.mutations.cache_refreshed||0)+1;
    }
   }
  }

  if(EXECUTE){await db.query('COMMIT');report.transaction='COMMIT';}
  else{await db.query('ROLLBACK');report.transaction='ROLLBACK';}
  console.log(JSON.stringify(report,null,2));
 }catch(e){
  try{await db.query('ROLLBACK')}catch{}
  console.error(e.stack||e.message);
  process.exitCode=1;
 }finally{
  await db.end();
 }
}
if(require.main===module) main();
