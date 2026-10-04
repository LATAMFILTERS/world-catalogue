'use strict';

require('dotenv').config();
const fs=require('fs');
const crypto=require('crypto');
const {Client}=require('pg');

const EXECUTE=process.argv.includes('--execute');
const EXPECTED=142;
const ROOT='C:/Users/ELIMSERVER/world-catalogue-hold45';
const AUTH='DONALDSON_SHOP_CROSSREF_CAPTURE_2026_07';

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
function add(map,key,val){
  const k=norm(key); if(!k)return;
  if(!map.has(k))map.set(k,[]);
  map.get(k).push(val);
}
function loadCrossrefs(){
  const map=new Map(),dir=ROOT+'/scripts';
  for(const file of fs.readdirSync(dir).filter(f=>/^donaldson_.*_results\.json$/i.test(f))){
    const raw=fs.readFileSync(dir+'/'+file,'utf8'), fileHash=sha(raw);
    for(const rec of JSON.parse(raw)){
      const part=String(rec.part_number||'');
      const recordHash=sha(rec);
      const push=(v,kind)=>add(map,v,{donaldson_part:part,source_file:'scripts/'+file,source_file_hash:fileHash,record_hash:recordHash,kind});
      for(const x of rec.alternatives||[])push(typeof x==='string'?x:(x.part_number||x.code||x.reference),'ALTERNATIVE');
      for(const x of rec.cross_references||[]){
        if(Array.isArray(x))for(const y of x)push(y,'CROSS_REFERENCE');
        else if(typeof x==='string')push(x,'CROSS_REFERENCE');
        else if(x&&typeof x==='object')push(x.part_number||x.code||x.reference,'CROSS_REFERENCE');
      }
      for(const [brand,arr] of Object.entries(rec.brand_crossrefs||{})){
        for(const x of (Array.isArray(arr)?arr:[arr]))push(x,'BRAND_CROSSREF:'+brand);
      }
    }
  }
  const flat=ROOT+'/scripts/donaldson_crossref_flat.csv';
  if(fs.existsSync(flat)){
    const raw=fs.readFileSync(flat,'utf8'), fileHash=sha(raw);
    for(const line of raw.split(/\r?\n/).slice(1).filter(Boolean)){
      const a=line.split(',');
      if(a.length>=6)add(map,a[4],{donaldson_part:a[2],source_file:'scripts/donaldson_crossref_flat.csv',source_file_hash:fileHash,record_hash:sha(line),kind:a[5],brand:a[3]});
    }
  }
  return map;
}

async function main(){
  const url=runtimeUrl(),u=new URL(url);
  if(!['127.0.0.1','localhost'].includes(u.hostname)||u.port!=='5432'||u.pathname!=='/catalogo_elimfilters')throw new Error('REFUSE_NON_RUNTIME_5432_DB');
  const cross=loadCrossrefs();
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});await db.connect();

  const report={
    migration:'211_CLASSIFY_PRIMARY_CROSSREF_EXISTS',
    mode:EXECUTE?'execute':'dry-run',
    selected:0,one_candidate:0,multi_candidate:0,
    mutations:{sku:0,codigo_base:0,alternates:0,catalog:0,evidence:0,queue:0}
  };

  try{
    const q=await db.query(
      "SELECT q.sku,q.current_codigo_base,q.status,q.governance_state,q.last_error,c.filter_type "+
      "FROM public.catalog_codigo_base_sanitation_queue q "+
      "JOIN public.elimfilters_catalog c ON c.sku=q.sku "+
      "WHERE q.status='PENDING' AND q.attempts<3 "+
      "AND q.governance_state='VERIFY_PRIMARY_ABSENCE' "+
      "AND q.last_error='PRIMARY_ABSENCE_REQUIRES_EXPLICIT_EVIDENCE' "+
      "AND c.duty='HEAVY_DUTY' "+
      "AND EXISTS (SELECT 1 FROM public.catalog_codigo_base_evidence e WHERE e.sku=q.sku AND e.authority='FLEETGUARD_OFFICIAL_PRODUCT_SITEMAP' AND e.evidence_kind='OFFICIAL_PRODUCT_SITEMAP') "+
      "ORDER BY q.sku"
    );

    const rows=[];
    for(const row of q.rows){
      const hits=cross.get(norm(row.current_codigo_base))||[];
      const byPart=new Map();
      for(const h of hits){
        const p=norm(h.donaldson_part);
        if(!p)continue;
        if(!byPart.has(p))byPart.set(p,[]);
        byPart.get(p).push(h);
      }
      const parts=[...byPart.keys()];
      if(parts.length)rows.push({...row,parts,byPart});
    }

    report.selected=rows.length;
    if(rows.length!==EXPECTED)throw new Error('EXPECTED_'+EXPECTED+'_ROWS_GOT_'+rows.length);

    for(const row of rows){
      const isMulti=row.parts.length>1;
      if(isMulti)report.multi_candidate++; else report.one_candidate++;
      const lastError=isMulti
        ? 'PRIMARY_MANUFACTURER_MULTIPLE_CROSSREFS_EXIST_NOT_CANONICAL'
        : 'PRIMARY_MANUFACTURER_CROSSREF_EXISTS_NOT_CANONICAL';

      if(!EXECUTE)continue;

      await db.query('BEGIN');
      try{
        const lock=(await db.query(
          "SELECT status,governance_state,last_error FROM public.catalog_codigo_base_sanitation_queue WHERE sku=$1 FOR UPDATE",
          [row.sku]
        )).rows[0];
        if(!lock||lock.status!=='PENDING'||lock.governance_state!=='VERIFY_PRIMARY_ABSENCE'||lock.last_error!=='PRIMARY_ABSENCE_REQUIRES_EXPLICIT_EVIDENCE'){
          throw new Error('QUEUE_BASELINE_CHANGED:'+row.sku);
        }

        for(const part of row.parts){
          const sources=row.byPart.get(part)||[];
          const primary=sources[0];
          const evidenceHash=sha({
            current_fallback_code:row.current_codigo_base,
            donaldson_part:part,
            sources:sources.map(s=>({source_file:s.source_file,source_file_hash:s.source_file_hash,record_hash:s.record_hash,kind:s.kind,brand:s.brand||null}))
          });
          const ev=await db.query(
            "INSERT INTO public.catalog_codigo_base_evidence "+
            "(sku,evidence_kind,authority,manufacturer,reference_code,normalized_reference,source_url,evidence_hash,verified_at,metadata) "+
            "VALUES ($1,'OFFICIAL_CROSS_REFERENCE',$2,'DONALDSON',$3,$4,$5,$6,now(),$7::jsonb) "+
            "ON CONFLICT DO NOTHING RETURNING id",
            [
              row.sku,AUTH,part,norm(part),
              'https://shop.donaldson.com/store/en-us/search?Ntt='+encodeURIComponent(row.current_codigo_base),
              evidenceHash,
              JSON.stringify({
                relationship:'OFFICIAL_CROSS_REFERENCE',
                current_fallback_code:row.current_codigo_base,
                donaldson_part:part,
                candidate_count:row.parts.length,
                source_file:primary.source_file,
                source_file_hash:primary.source_file_hash,
                record_hash:primary.record_hash,
                evidence_channels:sources.map(s=>s.kind),
                proves_primary_absence:false,
                canonical_promotion_allowed:false
              })
            ]
          );
          report.mutations.evidence+=ev.rowCount;
        }

        const qu=await db.query(
          "UPDATE public.catalog_codigo_base_sanitation_queue SET last_error=$1,updated_at=now() "+
          "WHERE sku=$2 AND status='PENDING' AND governance_state='VERIFY_PRIMARY_ABSENCE' "+
          "AND last_error='PRIMARY_ABSENCE_REQUIRES_EXPLICIT_EVIDENCE' RETURNING sku",
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
