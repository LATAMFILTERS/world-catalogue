'use strict';

require('dotenv').config();
const fs=require('fs');
const crypto=require('crypto');
const {Client}=require('pg');
const {normalizeCode,pageSupportsOfficialProduct}=require('../../lib/donaldson-official-evidence');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');

const EXECUTE=process.argv.includes('--execute');

const BATCH=Object.freeze([
  {sku:'EA18485',current:'P778485',product_url:'https://shop.donaldson.com/store/en-us/product/P778485/22013',candidate:'J8522111',candidate_relation:'OFFICIAL_CROSS_REFERENCE'},
  {sku:'EA18638',current:'P778638',product_url:'https://shop.donaldson.com/store/en-us/product/P778638/22026',candidate:'J8584001',candidate_relation:'OFFICIAL_CROSS_REFERENCE'},
  {sku:'EA18885',current:'P608885',product_url:'https://shop.donaldson.com/store/en-us/product/P608885/35665',candidate:'P812559',candidate_relation:'OFFICIAL_CROSS_REFERENCE'},
  {sku:'EA19240',current:'P529240',product_url:'https://shop.donaldson.com/store/en-us/product/P529240/19400',candidate:'J8552411',candidate_relation:'OFFICIAL_CROSS_REFERENCE'},
  {sku:'EA19241',current:'P529241',product_url:'https://shop.donaldson.com/store/en-us/product/P529241/19401',candidate:'J8552421',candidate_relation:'OFFICIAL_CROSS_REFERENCE'},
  {sku:'EA19552',current:'P529552',product_url:'https://shop.donaldson.com/store/en-us/product/P529552/19408',candidate:'P531950',candidate_relation:'OFFICIAL_CROSS_REFERENCE'},
  {sku:'EA200003',current:'G100003',product_url:'https://shop.donaldson.com/store/en-us/product/G100003/12119',candidate:'FWG100003',candidate_relation:'OFFICIAL_CROSS_REFERENCE'},
  {sku:'EA20007',current:'G210007',product_url:'https://shop.donaldson.com/store/en-us/product/G210007/12315',candidate:'FTG210007',candidate_relation:'OFFICIAL_CROSS_REFERENCE'},
  {sku:'EA20009',current:'G070009',product_url:'https://shop.donaldson.com/store/en-us/product/G070009/12031',candidate:'FPG070009',candidate_relation:'OFFICIAL_CROSS_REFERENCE'},
  {sku:'EA20010',current:'G210010',product_url:'https://shop.donaldson.com/store/en-us/product/G210010/12317',candidate:'FTG210010',candidate_relation:'OFFICIAL_CROSS_REFERENCE'},
  {sku:'EA20087',current:'G180087',product_url:'https://shop.donaldson.com/store/en-us/product/G180087/37865',candidate:'FRG180087',candidate_relation:'OFFICIAL_CROSS_REFERENCE'},
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

async function fetchCandidateSearch(code,current){
  const url='https://shop.donaldson.com/store/en-us/search?Ntt='+encodeURIComponent(code);
  const f=await fetchPage(url);
  if(!f.ok)return {...f,relation_ok:false};
  const n=normalizeCode(f.html);
  return {...f,relation_ok:n.includes(normalizeCode(code))&&n.includes(normalizeCode(current))};
}

async function fetchCurrentOfficialEvidence(code,productUrl){
  const direct=await fetchPage(productUrl);
  if(direct.ok&&pageSupportsOfficialProduct(direct.html,code)){
    return {...direct,evidence_kind:'OFFICIAL_PRODUCT_PAGE'};
  }
  const search=await fetchCandidateSearch(code,code);
  const exactPattern=new RegExp('/product/'+String(code).replace(/[^A-Z0-9-]/gi,'')+'/\\d+','i');
  if(search.ok&&exactPattern.test(search.html)){
    return {...search,evidence_kind:'OFFICIAL_EXACT_SEARCH_RESULT'};
  }
  return {ok:false,reason:direct.reason||'OFFICIAL_EXACT_SEARCH_RESULT_NOT_FOUND',url:productUrl};
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
    migration:'202_VERIFY_AIR_CURRENT_DONALDSON_AUTHORITY_BATCH10',
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
        before.duty==='HEAVY_DUTY'&&
        before.filter_type==='air'&&
        String(before.canonical_source_status||'').toUpperCase()==='UNVERIFIED'&&
        normalizeCode(before.codigo_base)===normalizeCode(item.current)&&
        gov.state==='REVIEW_PRIMARY_CANDIDATE'&&
        candidates.some(c=>normalizeCode(c)===normalizeCode(item.candidate));
      if(!baseline){
        report.unresolved++; report.details.push({sku:item.sku,status:'UNRESOLVED',reason:'BASELINE_CHANGED'}); continue;
      }

      const official=await fetchCurrentOfficialEvidence(item.current,item.product_url);
      if(!official.ok){
        report.unresolved++; report.details.push({sku:item.sku,status:'UNRESOLVED',reason:official.reason||'OFFICIAL_DONALDSON_EXACT_EVIDENCE_NOT_FOUND'}); continue;
      }

      let cross=null;
      if(item.candidate_relation==='OFFICIAL_CROSS_REFERENCE'){
        cross=await fetchCandidateSearch(item.candidate,item.current);
        if(!cross.ok||!cross.relation_ok){
          report.unresolved++; report.details.push({sku:item.sku,status:'UNRESOLVED',reason:'CROSS_REFERENCE_DID_NOT_REVALIDATE'}); continue;
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
        approved_codigo_base:before.codigo_base,
        approved_source_column:'CODIGO_BASE',
        evidence_authority:'OFFICIAL_DONALDSON_SHOP',
        evidence_kind:official.evidence_kind,
        evidence_url:official.url,
        evidence_hash:official.hash,
        verified_at:now,
        observed_primary_candidates:[],
        observed_preferred_candidates:[],
        rejected_primary_candidates:rejected,
        rejected_primary_candidate_reason:'CURRENT_CANONICAL_VERIFIED_CANDIDATE_NOT_CANONICAL_AUTHORITY',
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
            ...prior.filter(x=>normalizeCode(x?.part_number)!==normalizeCode(item.candidate)),
            {
              part_number:item.candidate,
              relationship:'OFFICIAL_CROSS_REFERENCE',
              manufacturer:'DONALDSON_SEARCH',
              status:'VERIFIED',
              evidence_authority:'OFFICIAL_DONALDSON_SHOP',
              evidence_kind:'OFFICIAL_SEARCH_RESULT',
              source_url:cross.url,
              evidence_hash:cross.hash,
              verified_at:now,
              canonical_target:item.current,
            },
          ],
        };
      }

      assertGovernedCatalogPatch(before,{enrichment_data:nextData});
      report.verified++;
      report.details.push({sku:item.sku,status:'READY',current:item.current,candidate:item.candidate,candidate_relation:item.candidate_relation,evidence_url:official.url});
      if(!EXECUTE)continue;

      await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
      try{
        const locked=(await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',[item.sku])).rows[0];
        const lg=locked.enrichment_data?.codigo_base_governance||{};
        const lc=Array.isArray(lg.observed_primary_candidates)?lg.observed_primary_candidates.map(String):[];
        if(
          normalizeCode(locked.codigo_base)!==normalizeCode(item.current)||
          String(locked.canonical_source_status||'').toUpperCase()!=='UNVERIFIED'||
          lg.state!=='REVIEW_PRIMARY_CANDIDATE'||
          !lc.some(c=>normalizeCode(c)===normalizeCode(item.candidate))
        )throw new Error(`EXECUTION_BASELINE_CHANGED:${item.sku}`);

        assertGovernedCatalogPatch(locked,{enrichment_data:nextData});

        const evidence=await db.query(`
          INSERT INTO public.catalog_codigo_base_evidence
            (sku,evidence_kind,authority,manufacturer,reference_code,normalized_reference,source_url,evidence_hash,verified_at,metadata)
          VALUES
            ($1,$8,'OFFICIAL_DONALDSON_SHOP','DONALDSON',$2,$3,$4,$5,$6,$7::jsonb)
          ON CONFLICT DO NOTHING
          RETURNING id
        `,[
          item.sku,item.current,normalizeCode(item.current),official.url,official.hash,now,
          JSON.stringify({migration:'202_VERIFY_AIR_CURRENT_DONALDSON_AUTHORITY_BATCH10',candidate:item.candidate,candidate_relation:item.candidate_relation}),
          official.evidence_kind,
        ]);

        const updated=await db.query(`
          UPDATE public.elimfilters_catalog
          SET enrichment_data=$1::jsonb,
              canonical_source_brand='DONALDSON',
              canonical_source_code=$2,
              canonical_source_url=$3,
              canonical_source_status='VERIFIED',
              canonical_verified_at=$4,
              canonical_evidence=$5::jsonb
          WHERE sku=$6
            AND codigo_base IS NOT DISTINCT FROM $7
            AND canonical_source_status='UNVERIFIED'
          RETURNING sku,codigo_base,canonical_source_status,enrichment_data
        `,[
          JSON.stringify(nextData),item.current,official.url,now,
          JSON.stringify({source:official.evidence_kind==='OFFICIAL_PRODUCT_PAGE'?'OFFICIAL_DONALDSON_PRODUCT_PAGE':'OFFICIAL_DONALDSON_EXACT_SEARCH_RESULT',source_url:official.url,evidence_hash:official.hash,migration:'202_VERIFY_AIR_CURRENT_DONALDSON_AUTHORITY_BATCH10'}),
          item.sku,locked.codigo_base,
        ]);
        if(updated.rowCount!==1)throw new Error(`CATALOG_CAS_FAILED:${item.sku}`);

        const queue=await db.query(`
          UPDATE public.catalog_codigo_base_sanitation_queue
          SET governance_state='CANONICAL_VERIFIED',
              required_authority='DONALDSON',
              status='RESOLVED',
              last_error=NULL,
              updated_at=now()
          WHERE sku=$1
            AND status='PENDING'
            AND governance_state='REVIEW_PRIMARY_CANDIDATE'
          RETURNING sku
        `,[item.sku]);
        if(queue.rowCount!==1)throw new Error(`QUEUE_CAS_FAILED:${item.sku}`);

        const post=updated.rows[0];
        const pg=post.enrichment_data?.codigo_base_governance||{};
        if(post.canonical_source_status!=='VERIFIED'||pg.state!=='CANONICAL_VERIFIED'||normalizeCode(pg.approved_codigo_base)!==normalizeCode(item.current)){
          throw new Error(`POSTCHECK_FAILED:${item.sku}`);
        }

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
