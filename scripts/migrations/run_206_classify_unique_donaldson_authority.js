'use strict';

require('dotenv').config();
const fs=require('fs');
const crypto=require('crypto');
const {Client}=require('pg');

const EXECUTE=process.argv.includes('--execute');
const EXPECTED=174;
const ROOT='C:/Users/ELIMSERVER/world-catalogue-hold45';
const DONALDSON_CAPTURE='DONALDSON_SHOP_CROSSREF_CAPTURE_2026_07';

function norm(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
function sha(v){return crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');}
function runtimeUrl(){
  const direct=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(direct)return direct;
  const runner=fs.readFileSync('C:/ELIMSERVER/state/run-search-cutover-user.ps1','utf8');
  const m=runner.match(/\$env:DATABASE_URL='([^']+)'/);
  if(!m)throw new Error('RUNTIME_DB_URL_NOT_FOUND');
  return m[1];
}
function loadDonaldsonCapture(){
  const dir=ROOT+'/scripts';
  const files=fs.readdirSync(dir).filter(f=>/^donaldson_.*_results\.json$/i.test(f));
  const exact=new Map();
  for(const file of files){
    const raw=fs.readFileSync(dir+'/'+file,'utf8');
    const arr=JSON.parse(raw);
    for(const record of arr){
      const k=norm(record.part_number);
      if(k&&!exact.has(k)) exact.set(k,{file,record,record_hash:sha(record)});
    }
  }
  return exact;
}

async function main(){
  const url=runtimeUrl();
  const u=new URL(url);
  if(!['127.0.0.1','localhost'].includes(u.hostname)||!['5432','5441'].includes(u.port)||u.pathname!=='/catalogo_elimfilters'){
    throw new Error('REFUSE_NON_CANONICAL_DB');
  }

  const capture=loadDonaldsonCapture();
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();

  const report={
    migration:'206_CLASSIFY_UNIQUE_DONALDSON_AUTHORITY',
    mode:EXECUTE?'execute':'dry-run',
    selected:0,
    classified:{
      donaldson_product_exists:0,
      superseded_reference:0,
      cross_reference_only:0,
      not_found_not_absence:0
    },
    mutations:{sku:0,codigo_base:0,alternates:0,catalog:0,evidence:0,queue:0},
    details:[]
  };

  try{
    const q=await db.query(
      "SELECT q.sku,q.current_codigo_base,q.status,q.governance_state,q.last_error,q.attempts,"+
      "c.enrichment_data->'codigo_base_governance'->'observed_primary_candidates' AS candidates "+
      "FROM public.catalog_codigo_base_sanitation_queue q "+
      "JOIN public.elimfilters_catalog c ON c.sku=q.sku "+
      "WHERE q.status='PENDING' AND q.attempts<3 "+
      "AND q.governance_state='REVIEW_PRIMARY_CANDIDATE' "+
      "AND coalesce(q.last_error,'') NOT IN ("+
      "'CROSS_REFERENCE_ONLY_NOT_MANUFACTURING_AUTHORITY',"+
      "'CROSS_REFERENCE_ONLY_NOT_CANONICAL_AUTHORITY',"+
      "'SUPERSEDED_REFERENCE_NOT_CANONICAL_AUTHORITY',"+
      "'DONALDSON_PRODUCT_EXISTS_IDENTITY_LINK_UNVERIFIED',"+
      "'DONALDSON_NOT_FOUND_NOT_ABSENCE_EVIDENCE') "+
      "AND c.duty='HEAVY_DUTY' "+
      "AND jsonb_array_length(coalesce(c.enrichment_data->'codigo_base_governance'->'observed_primary_candidates','[]'::jsonb))=1 "+
      "ORDER BY q.sku"
    );
    report.selected=q.rowCount;
    if(q.rowCount!==EXPECTED) throw new Error('EXPECTED_'+EXPECTED+'_ROWS_GOT_'+q.rowCount);

    const refRows=await db.query(
      "SELECT e.part_number,e.reference_type,e.sku AS target_sku,e.source,"+
      "c.codigo_base AS target_current,c.canonical_source_url "+
      "FROM public.exact_part_reference e "+
      "LEFT JOIN public.elimfilters_catalog c ON c.sku=e.sku "+
      "WHERE e.reference_type IN ('SUPERSEDED','COMPETITOR')"
    );
    const refMap=new Map();
    for(const r of refRows.rows){
      const k=norm(r.part_number);
      if(!refMap.has(k)) refMap.set(k,[]);
      refMap.get(k).push(r);
    }

    for(const row of q.rows){
      const candidate=Array.isArray(row.candidates)?row.candidates[0]:null;
      if(!candidate) throw new Error('CANDIDATE_MISSING:'+row.sku);

      const refs=refMap.get(norm(candidate))||[];
      const exact=capture.get(norm(candidate))||null;

      let classification;
      let lastError;
      let evidence=null;

      const superseded=refs.find(r=>r.reference_type==='SUPERSEDED');
      const competitor=refs.find(r=>r.reference_type==='COMPETITOR');

      if(superseded){
        classification='superseded_reference';
        lastError='SUPERSEDED_REFERENCE_NOT_CANONICAL_AUTHORITY';
        const sourceUrl=superseded.canonical_source_url||('https://shop.donaldson.com/store/en-us/search?Ntt='+encodeURIComponent(candidate));
        evidence={
          kind:'SUPERSEDED_REFERENCE',
          authority:superseded.source||'DONALDSON_OFFICIAL_SUPERSESSION',
          source_url:sourceUrl,
          hash:sha({candidate,target_sku:superseded.target_sku,target_current:superseded.target_current,source:superseded.source}),
          metadata:{
            relationship:'SUPERSEDED',
            target_sku:superseded.target_sku,
            current_donaldson_part:superseded.target_current,
            current_fleetguard_code:row.current_codigo_base,
            canonical_promotion_allowed:false
          }
        };
      } else if(competitor){
        classification='cross_reference_only';
        lastError='CROSS_REFERENCE_ONLY_NOT_CANONICAL_AUTHORITY';
        const sourceUrl=competitor.canonical_source_url||('https://shop.donaldson.com/store/en-us/search?Ntt='+encodeURIComponent(candidate));
        evidence={
          kind:'OFFICIAL_CROSS_REFERENCE',
          authority:competitor.source||'DONALDSON_OFFICIAL_CROSS_REFERENCE',
          source_url:sourceUrl,
          hash:sha({candidate,target_sku:competitor.target_sku,target_current:competitor.target_current,source:competitor.source}),
          metadata:{
            relationship:'OFFICIAL_CROSS_REFERENCE',
            target_sku:competitor.target_sku,
            current_donaldson_part:competitor.target_current,
            current_fleetguard_code:row.current_codigo_base,
            canonical_promotion_allowed:false
          }
        };
      } else if(exact){
        classification='donaldson_product_exists';
        lastError='DONALDSON_PRODUCT_EXISTS_IDENTITY_LINK_UNVERIFIED';
        evidence={
          kind:'OFFICIAL_PRODUCT_CAPTURE',
          authority:DONALDSON_CAPTURE,
          source_url:'https://shop.donaldson.com/store/en-us/search?Ntt='+encodeURIComponent(candidate),
          hash:exact.record_hash,
          metadata:{
            source_file:'scripts/'+exact.file,
            candidate_donaldson_part:candidate,
            current_fleetguard_code:row.current_codigo_base,
            manufacturer_exists:true,
            identity_link_to_current_base_verified:false,
            canonical_promotion_allowed:false
          }
        };
      } else {
        classification='not_found_not_absence';
        lastError='DONALDSON_NOT_FOUND_NOT_ABSENCE_EVIDENCE';
      }

      report.classified[classification]++;
      report.details.push({sku:row.sku,current:row.current_codigo_base,candidate,classification,last_error:lastError});

      if(!EXECUTE) continue;

      await db.query('BEGIN');
      try{
        const lock=await db.query(
          "SELECT status,governance_state,last_error,attempts FROM public.catalog_codigo_base_sanitation_queue WHERE sku=$1 FOR UPDATE",
          [row.sku]
        );
        if(lock.rowCount!==1) throw new Error('QUEUE_ROW_MISSING:'+row.sku);
        const lr=lock.rows[0];
        if(lr.status!=='PENDING'||lr.governance_state!=='REVIEW_PRIMARY_CANDIDATE'||lr.attempts>=3||
           ['CROSS_REFERENCE_ONLY_NOT_MANUFACTURING_AUTHORITY','CROSS_REFERENCE_ONLY_NOT_CANONICAL_AUTHORITY','SUPERSEDED_REFERENCE_NOT_CANONICAL_AUTHORITY','DONALDSON_PRODUCT_EXISTS_IDENTITY_LINK_UNVERIFIED','DONALDSON_NOT_FOUND_NOT_ABSENCE_EVIDENCE'].includes(lr.last_error||'')){
          throw new Error('QUEUE_BASELINE_CHANGED:'+row.sku);
        }

        if(evidence){
          const ev=await db.query(
            "INSERT INTO public.catalog_codigo_base_evidence "+
            "(sku,evidence_kind,authority,manufacturer,reference_code,normalized_reference,source_url,evidence_hash,verified_at,metadata) "+
            "VALUES ($1,$2,$3,'DONALDSON',$4,$5,$6,$7,now(),$8::jsonb) "+
            "ON CONFLICT DO NOTHING RETURNING id",
            [row.sku,evidence.kind,evidence.authority,candidate,norm(candidate),evidence.source_url,evidence.hash,JSON.stringify(evidence.metadata)]
          );
          report.mutations.evidence+=ev.rowCount;
        }

        const upd=await db.query(
          "UPDATE public.catalog_codigo_base_sanitation_queue SET last_error=$1,updated_at=now() "+
          "WHERE sku=$2 AND status='PENDING' AND governance_state='REVIEW_PRIMARY_CANDIDATE' RETURNING sku",
          [lastError,row.sku]
        );
        if(upd.rowCount!==1) throw new Error('QUEUE_CAS_FAILED:'+row.sku);
        report.mutations.queue++;
        await db.query('COMMIT');
      }catch(e){
        await db.query('ROLLBACK');
        throw e;
      }
    }

    return report;
  }finally{
    await db.end();
  }
}

if(require.main===module){
  main().then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e.stack||e.message);process.exit(1)});
}
module.exports={main};
