'use strict';

require('dotenv').config();
const fs=require('fs');
const crypto=require('crypto');
const {Client}=require('pg');
const {normalizeCode,pageSupportsOfficialProduct}=require('../../lib/donaldson-official-evidence');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');

const EXECUTE=process.argv.includes('--execute');

const BATCH=Object.freeze([
  {
    sku:'EA10903',
    truncated:'0903',
    canonical:'P610903',
    product_url:'https://shop.donaldson.com/store/en-us/product/P610903/35601',
    prior_candidate:'P827654',
    candidate_relation:'REJECTED_AS_CANONICAL_AUTHORITY',
    source_record:'scripts/donaldson_import_ready.jsonl',
  },
  {
    sku:'EA16288',
    truncated:'6288',
    canonical:'P606288',
    product_url:'https://shop.donaldson.com/store/en-us/product/P606288/23261',
    prior_candidate:'J8584661',
    candidate_relation:'OFFICIAL_CROSS_REFERENCE',
    source_record:'scripts/donaldson_import_ready.jsonl',
  },
]);

function runtimeUrl(){
  const direct=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(direct)return direct;
  const runner=fs.readFileSync('C:/ELIMSERVER/state/run-search-cutover-user.ps1','utf8');
  const m=runner.match(/\$env:DATABASE_URL='([^']+)'/);
  if(!m)throw new Error('RUNTIME_DB_URL_NOT_FOUND');
  return m[1];
}

async function fetchPage(url){
  const c=new AbortController(); const t=setTimeout(()=>c.abort(),12000);
  try{
    const r=await fetch(url,{redirect:'follow',signal:c.signal});
    if(!r.ok)return {ok:false,reason:`HTTP_${r.status}`,url:r.url||url};
    const html=await r.text();
    return {ok:true,url:r.url||url,html,hash:crypto.createHash('sha256').update(html).digest('hex')};
  }catch(e){
    return {ok:false,reason:e?.name==='AbortError'?'FETCH_TIMEOUT':'FETCH_FAILED',url};
  }finally{clearTimeout(t);}
}

async function fetchSearch(code,current){
  const url='https://shop.donaldson.com/store/en-us/search?Ntt='+encodeURIComponent(code);
  const f=await fetchPage(url);
  if(!f.ok)return {...f,relation_ok:false};
  const n=normalizeCode(f.html);
  return {...f,relation_ok:n.includes(normalizeCode(code))&&n.includes(normalizeCode(current))};
}

function suffix4(v){
  const n=normalizeCode(v);
  return n.slice(-4);
}

async function main(){
  const url=runtimeUrl();
  const u=new URL(url);
  if(!['127.0.0.1','localhost'].includes(u.hostname)||!['5432','5441'].includes(u.port)||u.pathname!=='/catalogo_elimfilters'){
    throw new Error('REFUSE_NON_CANONICAL_DB');
  }

  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();

  const report={
    migration:'199_RECONSTRUCT_TRUNCATED_AIR_CODIGO_BASE',
    mode:EXECUTE?'execute':'dry-run',
    selected:BATCH.length,verified:0,unresolved:0,
    mutations:{sku:0,codigo_base:0,alternates:0,canonical_authority:0,evidence:0,queue:0,official_cross_reference:0},
    details:[],
  };

  try{
    for(const item of BATCH){
      const qr=await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1',[item.sku]);
      if(qr.rowCount!==1)throw new Error(`SKU_NOT_UNIQUE:${item.sku}`);
      const before=qr.rows[0];
      const gov=before.enrichment_data?.codigo_base_governance||{};
      const candidates=Array.isArray(gov.observed_primary_candidates)?gov.observed_primary_candidates.map(String):[];

      const baseline=
        before.duty==='HEAVY_DUTY' &&
        before.filter_type==='air' &&
        normalizeCode(before.codigo_base)===normalizeCode(item.truncated) &&
        String(before.canonical_source_status||'').toUpperCase()==='UNVERIFIED' &&
        gov.state==='REVIEW_PRIMARY_CANDIDATE' &&
        candidates.some(c=>normalizeCode(c)===normalizeCode(item.prior_candidate)) &&
        suffix4(item.sku)===suffix4(item.canonical);

      if(!baseline){
        report.unresolved++;
        report.details.push({sku:item.sku,status:'UNRESOLVED',reason:'BASELINE_CHANGED'});
        continue;
      }

      const sourceLine=fs.readFileSync(item.source_record,'utf8')
        .split(/\r?\n/)
        .find(line=>line.includes(`"sku": "${item.sku}"`));
      if(!sourceLine){
        report.unresolved++;
        report.details.push({sku:item.sku,status:'UNRESOLVED',reason:'ORIGINAL_SOURCE_RECORD_MISSING'});
        continue;
      }
      const sourceJson=JSON.parse(sourceLine);
      if(normalizeCode(sourceJson.codigo_base)!==normalizeCode(item.canonical)){
        report.unresolved++;
        report.details.push({sku:item.sku,status:'UNRESOLVED',reason:'ORIGINAL_SOURCE_DOES_NOT_MATCH_CANONICAL'});
        continue;
      }

      const official=await fetchPage(item.product_url);
      if(!official.ok||!pageSupportsOfficialProduct(official.html,item.canonical)){
        report.unresolved++;
        report.details.push({sku:item.sku,status:'UNRESOLVED',reason:official.reason||'OFFICIAL_PRODUCT_PAGE_DID_NOT_VALIDATE'});
        continue;
      }

      let cross=null;
      if(item.candidate_relation==='OFFICIAL_CROSS_REFERENCE'){
        cross=await fetchSearch(item.prior_candidate,item.canonical);
        if(!cross.ok||!cross.relation_ok){
          report.unresolved++;
          report.details.push({sku:item.sku,status:'UNRESOLVED',reason:'CROSS_REFERENCE_DID_NOT_REVALIDATE'});
          continue;
        }
      }

      const now=new Date().toISOString();
      const rejected=[...new Set([
        ...(Array.isArray(gov.rejected_primary_candidates)?gov.rejected_primary_candidates:[]),
        ...candidates,
      ].map(String).filter(Boolean))];

      const nextGov={
        ...gov,
        policy_version:'2026-10-03-v4.1',
        state:'CANONICAL_VERIFIED',
        governance_state:'CANONICAL_VERIFIED',
        required_authority:'VERIFIED_DONALDSON',
        primary_manufacturer_verified:true,
        approved_manufacturer:'DONALDSON',
        approved_codigo_base:item.canonical,
        approved_source_column:'CODIGO_BASE',
        evidence_authority:'OFFICIAL_DONALDSON_SHOP_PLUS_ORIGINAL_IMPORT',
        evidence_kind:'OFFICIAL_PRODUCT_PAGE_AND_SOURCE_RECONSTRUCTION',
        evidence_url:official.url,
        evidence_hash:official.hash,
        verified_at:now,
        observed_primary_candidates:[],
        observed_preferred_candidates:[],
        rejected_primary_candidates:rejected,
        rejected_primary_candidate_reason:'TRUNCATED_BASE_RECONSTRUCTED_FROM_ORIGINAL_SOURCE_AND_OFFICIAL_PRODUCT_PAGE',
      };

      const nextData={...(before.enrichment_data||{}),codigo_base_governance:nextGov};
      if(cross){
        const rel=nextData.reference_relationships&&typeof nextData.reference_relationships==='object'&&!Array.isArray(nextData.reference_relationships)
          ? nextData.reference_relationships:{};
        const prior=Array.isArray(rel.official_cross_references)?rel.official_cross_references:[];
        nextData.reference_relationships={
          ...rel,
          policy_version:'2026-10-04-v1',
          official_cross_references:[
            ...prior.filter(x=>normalizeCode(x?.part_number)!==normalizeCode(item.prior_candidate)),
            {
              part_number:item.prior_candidate,
              relationship:'OFFICIAL_CROSS_REFERENCE',
              manufacturer:'DONALDSON_SEARCH',
              status:'VERIFIED',
              evidence_authority:'OFFICIAL_DONALDSON_SHOP',
              evidence_kind:'OFFICIAL_SEARCH_RESULT',
              source_url:cross.url,
              evidence_hash:cross.hash,
              verified_at:now,
              canonical_target:item.canonical,
            },
          ],
        };
      }

      const patch={
        codigo_base:item.canonical,
        canonical_source_brand:'DONALDSON',
        canonical_source_code:item.canonical,
        canonical_source_url:official.url,
        canonical_source_status:'VERIFIED',
        canonical_verified_at:now,
        canonical_evidence:{
          source:'ORIGINAL_IMPORT_RECONSTRUCTION_PLUS_OFFICIAL_DONALDSON_PRODUCT_PAGE',
          source_file:item.source_record,
          original_truncated_codigo_base:item.truncated,
          reconstructed_codigo_base:item.canonical,
          source_url:official.url,
          evidence_hash:official.hash,
          migration:'199_RECONSTRUCT_TRUNCATED_AIR_CODIGO_BASE',
        },
        enrichment_data:nextData,
      };

      assertGovernedCatalogPatch(before,patch);

      report.verified++;
      report.details.push({
        sku:item.sku,status:'READY',
        from:item.truncated,to:item.canonical,
        candidate:item.prior_candidate,candidate_relation:item.candidate_relation,
        evidence_url:official.url,
      });
      if(!EXECUTE)continue;

      await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
      try{
        const locked=(await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',[item.sku])).rows[0];
        const lg=locked.enrichment_data?.codigo_base_governance||{};
        const lc=Array.isArray(lg.observed_primary_candidates)?lg.observed_primary_candidates.map(String):[];
        if(
          normalizeCode(locked.codigo_base)!==normalizeCode(item.truncated) ||
          String(locked.canonical_source_status||'').toUpperCase()!=='UNVERIFIED' ||
          lg.state!=='REVIEW_PRIMARY_CANDIDATE' ||
          !lc.some(c=>normalizeCode(c)===normalizeCode(item.prior_candidate))
        )throw new Error(`EXECUTION_BASELINE_CHANGED:${item.sku}`);

        assertGovernedCatalogPatch(locked,patch);

        const evidence=await db.query(`
          INSERT INTO public.catalog_codigo_base_evidence
            (sku,evidence_kind,authority,manufacturer,reference_code,normalized_reference,source_url,evidence_hash,verified_at,metadata)
          VALUES
            ($1,'OFFICIAL_PRODUCT_PAGE_AND_SOURCE_RECONSTRUCTION','OFFICIAL_DONALDSON_SHOP_PLUS_ORIGINAL_IMPORT','DONALDSON',$2,$3,$4,$5,$6,$7::jsonb)
          ON CONFLICT DO NOTHING
          RETURNING id
        `,[
          item.sku,item.canonical,normalizeCode(item.canonical),official.url,official.hash,now,
          JSON.stringify({
            migration:'199_RECONSTRUCT_TRUNCATED_AIR_CODIGO_BASE',
            source_file:item.source_record,
            original_truncated_codigo_base:item.truncated,
            prior_candidate:item.prior_candidate,
            candidate_relation:item.candidate_relation,
          }),
        ]);

        const updated=await db.query(`
          UPDATE public.elimfilters_catalog
          SET codigo_base=$1::varchar,
              canonical_source_brand='DONALDSON',
              canonical_source_code=$1::text,
              canonical_source_url=$2::text,
              canonical_source_status='VERIFIED',
              canonical_verified_at=$3,
              canonical_evidence=$4::jsonb,
              enrichment_data=$5::jsonb
          WHERE sku=$6
            AND codigo_base=$7
            AND canonical_source_status='UNVERIFIED'
          RETURNING sku,codigo_base,canonical_source_status,enrichment_data
        `,[
          item.canonical,official.url,now,JSON.stringify(patch.canonical_evidence),JSON.stringify(nextData),
          item.sku,item.truncated,
        ]);
        if(updated.rowCount!==1)throw new Error(`CATALOG_CAS_FAILED:${item.sku}`);

        const queue=await db.query(`
          UPDATE public.catalog_codigo_base_sanitation_queue
          SET current_codigo_base=$2,
              governance_state='CANONICAL_VERIFIED',
              required_authority='DONALDSON',
              status='RESOLVED',
              last_error=NULL,
              updated_at=now()
          WHERE sku=$1
            AND status='PENDING'
            AND governance_state='REVIEW_PRIMARY_CANDIDATE'
          RETURNING sku
        `,[item.sku,item.canonical]);
        if(queue.rowCount!==1)throw new Error(`QUEUE_CAS_FAILED:${item.sku}`);

        const post=updated.rows[0];
        const pg=post.enrichment_data?.codigo_base_governance||{};
        if(
          normalizeCode(post.codigo_base)!==normalizeCode(item.canonical) ||
          post.canonical_source_status!=='VERIFIED' ||
          pg.state!=='CANONICAL_VERIFIED' ||
          normalizeCode(pg.approved_codigo_base)!==normalizeCode(item.canonical)
        )throw new Error(`POSTCHECK_FAILED:${item.sku}`);

        report.mutations.codigo_base++;
        report.mutations.canonical_authority++;
        report.mutations.evidence+=evidence.rowCount;
        report.mutations.queue++;
        if(cross)report.mutations.official_cross_reference++;
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
module.exports={BATCH,main};
