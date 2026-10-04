'use strict';

require('dotenv').config();
const fs=require('fs');
const crypto=require('crypto');
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');

const EXECUTE=process.argv.includes('--execute');
const EXPECTED=99;
const ROOT='C:/Users/ELIMSERVER/world-catalogue-hold45';
const CAPTURE='DONALDSON_SHOP_CROSSREF_CAPTURE_2026_07';

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
function flattenCodes(record){
  const out=[]; const push=v=>{if(v!==null&&v!==undefined&&String(v).trim())out.push(norm(v));};
  for(const x of record.alternatives||[])push(typeof x==='string'?x:(x.part_number||x.code||x.reference));
  for(const x of record.cross_references||[]){
    if(Array.isArray(x)){for(const y of x)push(y);}
    else if(typeof x==='string')push(x);
    else if(x&&typeof x==='object')push(x.part_number||x.code||x.reference);
  }
  for(const x of record.oem_codes||[]){
    if(typeof x==='string')push(x);
    else if(x&&typeof x==='object')push(x.part_number||x.code||x.reference);
  }
  for(const arr of Object.values(record.brand_crossrefs||{})){
    for(const x of Array.isArray(arr)?arr:[arr])push(x);
  }
  return new Set(out.filter(Boolean));
}
function loadCapture(){
  const dir=ROOT+'/scripts';
  const exact=new Map();
  for(const file of fs.readdirSync(dir).filter(f=>/^donaldson_.*_results\.json$/i.test(f))){
    const raw=fs.readFileSync(dir+'/'+file,'utf8');
    const fileHash=sha(raw);
    for(const record of JSON.parse(raw)){
      const k=norm(record.part_number);
      if(k&&!exact.has(k))exact.set(k,{file:'scripts/'+file,file_hash:fileHash,record,record_hash:sha(record)});
    }
  }
  return exact;
}

async function main(){
  const url=runtimeUrl(); const u=new URL(url);
  if(!['127.0.0.1','localhost'].includes(u.hostname)||!['5432','5441'].includes(u.port)||u.pathname!=='/catalogo_elimfilters')throw new Error('REFUSE_NON_CANONICAL_DB');
  const capture=loadCapture();
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}}); await db.connect();

  const report={
    migration:'207_VERIFY_MULTI_CURRENT_DONALDSON_99',
    mode:EXECUTE?'execute':'dry-run',
    selected:0,verified:0,unresolved:0,
    relations:{official_cross_reference:0,rejected_primary_candidates:0},
    mutations:{sku:0,codigo_base:0,alternates:0,canonical_authority:0,evidence:0,queue:0}
  };

  try{
    const q=await db.query(
      "SELECT q.sku,q.current_codigo_base,c.* "+
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
      "AND jsonb_array_length(coalesce(c.enrichment_data->'codigo_base_governance'->'observed_primary_candidates','[]'::jsonb))>1 "+
      "ORDER BY q.sku"
    );

    const rows=q.rows.filter(r=>capture.has(norm(r.current_codigo_base)));
    report.selected=rows.length;
    if(rows.length!==EXPECTED)throw new Error('EXPECTED_'+EXPECTED+'_ROWS_GOT_'+rows.length);

    for(const joined of rows){
      const before={...joined}; delete before.current_codigo_base;
      const current=joined.codigo_base;
      const src=capture.get(norm(current));
      const gov=before.enrichment_data?.codigo_base_governance||{};
      const candidates=Array.isArray(gov.observed_primary_candidates)?gov.observed_primary_candidates.map(String):[];
      if(candidates.length<=1||gov.state!=='REVIEW_PRIMARY_CANDIDATE'||String(before.canonical_source_status||'').toUpperCase()!=='UNVERIFIED'){
        report.unresolved++; continue;
      }
      const official=flattenCodes(src.record);
      const confirmed=candidates.filter(c=>official.has(norm(c)));
      const now=new Date().toISOString();
      const evidenceUrl='https://shop.donaldson.com/store/en-us/search?Ntt='+encodeURIComponent(current);

      const rejected=[...new Set([
        ...(Array.isArray(gov.rejected_primary_candidates)?gov.rejected_primary_candidates:[]),
        ...candidates
      ].map(String).filter(Boolean))];

      const nextGov={
        ...gov,
        policy_version:'2026-10-03-v4.1',
        state:'CANONICAL_VERIFIED',
        governance_state:'CANONICAL_VERIFIED',
        required_authority:'VERIFIED_DONALDSON',
        primary_manufacturer_verified:true,
        approved_manufacturer:'DONALDSON',
        approved_codigo_base:current,
        approved_source_column:'CODIGO_BASE',
        evidence_authority:CAPTURE,
        evidence_kind:'OFFICIAL_AUTHENTICATED_CAPTURE',
        evidence_url:evidenceUrl,
        evidence_hash:src.record_hash,
        verified_at:now,
        observed_primary_candidates:[],
        observed_preferred_candidates:[],
        rejected_primary_candidates:rejected,
        rejected_primary_candidate_reason:'CURRENT_CANONICAL_VERIFIED_MULTI_CANDIDATES_NOT_CANONICAL_AUTHORITY'
      };
      const nextData={...(before.enrichment_data||{}),codigo_base_governance:nextGov};

      if(confirmed.length){
        const rel=nextData.reference_relationships&&typeof nextData.reference_relationships==='object'&&!Array.isArray(nextData.reference_relationships)?nextData.reference_relationships:{};
        const prior=Array.isArray(rel.official_cross_references)?rel.official_cross_references:[];
        const map=new Map(prior.map(x=>[norm(x?.part_number),x]));
        for(const c of confirmed){
          map.set(norm(c),{
            part_number:c,
            relationship:'OFFICIAL_CROSS_REFERENCE',
            manufacturer:'DONALDSON_CAPTURE',
            status:'VERIFIED',
            evidence_authority:CAPTURE,
            evidence_kind:'OFFICIAL_AUTHENTICATED_CAPTURE',
            source_url:evidenceUrl,
            evidence_hash:src.record_hash,
            verified_at:now,
            canonical_target:current
          });
        }
        nextData.reference_relationships={...rel,policy_version:'2026-10-04-v1',official_cross_references:[...map.values()]};
      }

      const canonicalEvidence={
        source:CAPTURE,source_file:src.file,source_file_hash:src.file_hash,
        record_hash:src.record_hash,reference_code:current,
        candidate_count:candidates.length,confirmed_cross_references:confirmed
      };
      const patch={
        enrichment_data:nextData,
        canonical_source_brand:'DONALDSON',
        canonical_source_code:current,
        canonical_source_url:evidenceUrl,
        canonical_source_status:'VERIFIED',
        canonical_verified_at:now,
        canonical_evidence:canonicalEvidence
      };
      assertGovernedCatalogPatch(before,patch);

      report.verified++;
      report.relations.official_cross_reference+=confirmed.length;
      report.relations.rejected_primary_candidates+=candidates.length;

      if(!EXECUTE)continue;

      await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
      try{
        const lock=(await db.query("SELECT c.*,q.status AS queue_status,q.governance_state AS queue_state FROM public.elimfilters_catalog c JOIN public.catalog_codigo_base_sanitation_queue q ON q.sku=c.sku WHERE c.sku=$1 FOR UPDATE",[joined.sku])).rows[0];
        const lg=lock.enrichment_data?.codigo_base_governance||{};
        const lc=Array.isArray(lg.observed_primary_candidates)?lg.observed_primary_candidates:[];
        if(lock.queue_status!=='PENDING'||lock.queue_state!=='REVIEW_PRIMARY_CANDIDATE'||lg.state!=='REVIEW_PRIMARY_CANDIDATE'||lc.length<=1||norm(lock.codigo_base)!==norm(current)||String(lock.canonical_source_status||'').toUpperCase()!=='UNVERIFIED')throw new Error('EXECUTION_BASELINE_CHANGED:'+joined.sku);

        const lockedBefore={...lock}; delete lockedBefore.queue_status; delete lockedBefore.queue_state;
        assertGovernedCatalogPatch(lockedBefore,patch);

        const ev=await db.query(
          "INSERT INTO public.catalog_codigo_base_evidence (sku,evidence_kind,authority,manufacturer,reference_code,normalized_reference,source_url,evidence_hash,verified_at,metadata) "+
          "VALUES ($1,'OFFICIAL_AUTHENTICATED_CAPTURE',$2,'DONALDSON',$3,$4,$5,$6,$7,$8::jsonb) ON CONFLICT DO NOTHING RETURNING id",
          [joined.sku,CAPTURE,current,norm(current),evidenceUrl,src.record_hash,now,JSON.stringify(canonicalEvidence)]
        );
        const upd=await db.query(
          "UPDATE public.elimfilters_catalog SET enrichment_data=$1::jsonb,canonical_source_brand='DONALDSON',canonical_source_code=$2,canonical_source_url=$3,canonical_source_status='VERIFIED',canonical_verified_at=$4,canonical_evidence=$5::jsonb "+
          "WHERE sku=$6 AND codigo_base IS NOT DISTINCT FROM $7 AND canonical_source_status='UNVERIFIED' RETURNING sku",
          [JSON.stringify(nextData),current,evidenceUrl,now,JSON.stringify(canonicalEvidence),joined.sku,lock.codigo_base]
        );
        if(upd.rowCount!==1)throw new Error('CATALOG_CAS_FAILED:'+joined.sku);
        const qu=await db.query(
          "UPDATE public.catalog_codigo_base_sanitation_queue SET governance_state='CANONICAL_VERIFIED',required_authority='DONALDSON',status='RESOLVED',last_error=NULL,updated_at=now() "+
          "WHERE sku=$1 AND status='PENDING' AND governance_state='REVIEW_PRIMARY_CANDIDATE' RETURNING sku",
          [joined.sku]
        );
        if(qu.rowCount!==1)throw new Error('QUEUE_CAS_FAILED:'+joined.sku);
        report.mutations.canonical_authority++;
        report.mutations.evidence+=ev.rowCount;
        report.mutations.queue++;
        await db.query('COMMIT');
      }catch(e){await db.query('ROLLBACK');throw e;}
    }
    return report;
  }finally{await db.end();}
}
if(require.main===module)main().then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e.stack||e.message);process.exit(1)});
module.exports={main};
