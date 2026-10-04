'use strict';

require('dotenv').config();
const fs=require('fs');
const crypto=require('crypto');
const {Client}=require('pg');

const EXECUTE=process.argv.includes('--execute');
const EXPECTED=60;
const ROOT='C:/Users/ELIMSERVER/world-catalogue-hold45';
const FG_SITEMAP='https://www.fleetguard.com/sitemap-product-1.xml';
const FG_AUTH='FLEETGUARD_OFFICIAL_PRODUCT_SITEMAP';
const D_AUTH='DONALDSON_SHOP_CROSSREF_CAPTURE_2026_07';

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
function loadDonaldson(){
  const exact=new Map(),dir=ROOT+'/scripts';
  for(const file of fs.readdirSync(dir).filter(f=>/^donaldson_.*_results\.json$/i.test(f))){
    const raw=fs.readFileSync(dir+'/'+file,'utf8'),fileHash=sha(raw);
    for(const record of JSON.parse(raw)){
      const k=norm(record.part_number);
      if(k&&!exact.has(k))exact.set(k,{file:'scripts/'+file,file_hash:fileHash,record_hash:sha(record)});
    }
  }
  return exact;
}
async function loadFleetguard(){
  const r=await fetch(FG_SITEMAP,{redirect:'follow'});
  if(!r.ok)throw new Error('FLEETGUARD_SITEMAP_HTTP_'+r.status);
  const xml=await r.text(),map=new Map();
  for(const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)){
    const url=m[1],p=url.match(/\/product\/([^/?#<]+)/i);
    if(p)map.set(norm(decodeURIComponent(p[1])),url);
  }
  return {map,hash:sha(xml),count:map.size};
}

async function main(){
  const url=runtimeUrl(),u=new URL(url);
  if(!['127.0.0.1','localhost'].includes(u.hostname)||!['5432','5441'].includes(u.port)||u.pathname!=='/catalogo_elimfilters')throw new Error('REFUSE_NON_CANONICAL_DB');
  const donaldson=loadDonaldson(),fleetguard=await loadFleetguard();
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});await db.connect();
  const report={
    migration:'208_CLASSIFY_MULTI_FLEETGUARD_DONALDSON_60',
    mode:EXECUTE?'execute':'dry-run',selected:0,
    fleetguard_verified:0,
    classified:{donaldson_product_exists:0,not_found_not_absence:0},
    candidate_product_evidence:0,
    mutations:{sku:0,codigo_base:0,alternates:0,catalog:0,evidence:0,queue:0}
  };
  try{
    const q=await db.query(
      "SELECT q.sku,q.current_codigo_base,c.enrichment_data->'codigo_base_governance'->'observed_primary_candidates' candidates "+
      "FROM public.catalog_codigo_base_sanitation_queue q JOIN public.elimfilters_catalog c ON c.sku=q.sku "+
      "WHERE q.status='PENDING' AND q.attempts<3 AND q.governance_state='REVIEW_PRIMARY_CANDIDATE' "+
      "AND coalesce(q.last_error,'') NOT IN ("+
      "'CROSS_REFERENCE_ONLY_NOT_MANUFACTURING_AUTHORITY','CROSS_REFERENCE_ONLY_NOT_CANONICAL_AUTHORITY',"+
      "'SUPERSEDED_REFERENCE_NOT_CANONICAL_AUTHORITY','DONALDSON_PRODUCT_EXISTS_IDENTITY_LINK_UNVERIFIED',"+
      "'DONALDSON_NOT_FOUND_NOT_ABSENCE_EVIDENCE') "+
      "AND c.duty='HEAVY_DUTY' "+
      "AND jsonb_array_length(coalesce(c.enrichment_data->'codigo_base_governance'->'observed_primary_candidates','[]'::jsonb))>1 "+
      "ORDER BY q.sku"
    );
    report.selected=q.rowCount;
    if(q.rowCount!==EXPECTED)throw new Error('EXPECTED_'+EXPECTED+'_ROWS_GOT_'+q.rowCount);

    for(const row of q.rows){
      const fgUrl=fleetguard.map.get(norm(row.current_codigo_base));
      if(!fgUrl)throw new Error('FLEETGUARD_PRODUCT_NOT_IN_SITEMAP:'+row.sku+':'+row.current_codigo_base);
      report.fleetguard_verified++;

      const candidates=Array.isArray(row.candidates)?row.candidates.map(String):[];
      const exactCandidates=candidates.filter(c=>donaldson.has(norm(c)));
      const lastError=exactCandidates.length
        ? 'DONALDSON_PRODUCT_EXISTS_IDENTITY_LINK_UNVERIFIED'
        : 'DONALDSON_NOT_FOUND_NOT_ABSENCE_EVIDENCE';
      if(exactCandidates.length)report.classified.donaldson_product_exists++;
      else report.classified.not_found_not_absence++;
      report.candidate_product_evidence+=exactCandidates.length;

      if(!EXECUTE)continue;

      await db.query('BEGIN');
      try{
        const lock=(await db.query(
          "SELECT status,governance_state,last_error,attempts FROM public.catalog_codigo_base_sanitation_queue WHERE sku=$1 FOR UPDATE",
          [row.sku]
        )).rows[0];
        if(!lock||lock.status!=='PENDING'||lock.governance_state!=='REVIEW_PRIMARY_CANDIDATE'||lock.attempts>=3||
          ['CROSS_REFERENCE_ONLY_NOT_MANUFACTURING_AUTHORITY','CROSS_REFERENCE_ONLY_NOT_CANONICAL_AUTHORITY','SUPERSEDED_REFERENCE_NOT_CANONICAL_AUTHORITY','DONALDSON_PRODUCT_EXISTS_IDENTITY_LINK_UNVERIFIED','DONALDSON_NOT_FOUND_NOT_ABSENCE_EVIDENCE'].includes(lock.last_error||'')){
          throw new Error('QUEUE_BASELINE_CHANGED:'+row.sku);
        }

        const fgHash=sha({sitemap_hash:fleetguard.hash,product_url:fgUrl,code:row.current_codigo_base});
        const fe=await db.query(
          "INSERT INTO public.catalog_codigo_base_evidence (sku,evidence_kind,authority,manufacturer,reference_code,normalized_reference,source_url,evidence_hash,verified_at,metadata) "+
          "VALUES ($1,'OFFICIAL_PRODUCT_SITEMAP',$2,'FLEETGUARD',$3,$4,$5,$6,now(),$7::jsonb) ON CONFLICT DO NOTHING RETURNING id",
          [row.sku,FG_AUTH,row.current_codigo_base,norm(row.current_codigo_base),fgUrl,fgHash,JSON.stringify({
            sitemap_url:FG_SITEMAP,sitemap_hash:fleetguard.hash,purpose:'MANUFACTURER_AND_COMMERCIAL_CODE_VERIFICATION_ONLY',
            canonical_promotion_allowed:false,donaldson_absence_verified:false,candidate_count:candidates.length
          })]
        );
        report.mutations.evidence+=fe.rowCount;

        for(const candidate of exactCandidates){
          const src=donaldson.get(norm(candidate));
          const de=await db.query(
            "INSERT INTO public.catalog_codigo_base_evidence (sku,evidence_kind,authority,manufacturer,reference_code,normalized_reference,source_url,evidence_hash,verified_at,metadata) "+
            "VALUES ($1,'OFFICIAL_PRODUCT_CAPTURE',$2,'DONALDSON',$3,$4,$5,$6,now(),$7::jsonb) ON CONFLICT DO NOTHING RETURNING id",
            [row.sku,D_AUTH,candidate,norm(candidate),'https://shop.donaldson.com/store/en-us/search?Ntt='+encodeURIComponent(candidate),src.record_hash,JSON.stringify({
              source_file:src.file,source_file_hash:src.file_hash,candidate_donaldson_part:candidate,
              current_fleetguard_code:row.current_codigo_base,manufacturer_exists:true,
              identity_link_to_current_base_verified:false,canonical_promotion_allowed:false
            })]
          );
          report.mutations.evidence+=de.rowCount;
        }

        const qu=await db.query(
          "UPDATE public.catalog_codigo_base_sanitation_queue SET last_error=$1,updated_at=now() "+
          "WHERE sku=$2 AND status='PENDING' AND governance_state='REVIEW_PRIMARY_CANDIDATE' RETURNING sku",
          [lastError,row.sku]
        );
        if(qu.rowCount!==1)throw new Error('QUEUE_CAS_FAILED:'+row.sku);
        report.mutations.queue++;
        await db.query('COMMIT');
      }catch(e){await db.query('ROLLBACK');throw e;}
    }
    return report;
  }finally{await db.end();}
}
if(require.main===module)main().then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e.stack||e.message);process.exit(1)});
module.exports={main};
