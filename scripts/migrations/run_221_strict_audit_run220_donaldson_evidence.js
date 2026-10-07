'use strict';

require('dotenv').config();
const crypto=require('crypto');
const {Client}=require('pg');
const {normalizeCode}=require('../../lib/catalog-codigo-base-policy');
const {pageSupportsOfficialProduct}=require('../../lib/donaldson-official-evidence');

const LIMIT_ARG=process.argv.find(x=>x.startsWith('--limit='));
const LIMIT=LIMIT_ARG?Math.max(1,Number(LIMIT_ARG.split('=')[1])||500):500;
const ANOMALIES_ONLY=process.argv.includes('--anomalies-only');

function sha(v){return crypto.createHash('sha256').update(String(v)).digest('hex');}

async function fetchText(url){
  const c=new AbortController();
  const t=setTimeout(()=>c.abort(),15000);
  try{
    const r=await fetch(url,{redirect:'follow',signal:c.signal,headers:{'user-agent':'ELIMFILTERS-Catalogue-Audit/1.0'}});
    if(!r.ok)return {ok:false,reason:'HTTP_'+r.status,url:r.url||url};
    const text=await r.text();
    return {ok:true,url:r.url||url,text,hash:sha(text)};
  }catch(e){
    return {ok:false,reason:e?.name==='AbortError'?'FETCH_TIMEOUT':'FETCH_FAILED',url};
  }finally{
    clearTimeout(t);
  }
}

function exactProductLink(html,code){
  const safe=String(code||'').replace(/[^A-Z0-9-]/gi,'');
  return safe ? new RegExp('/product/'+safe+'/(?:prod)?[A-Z0-9]+','i').test(String(html||'')) : false;
}

async function strictVerify(code,sourceUrl){
  const urls=[];
  if(sourceUrl&&/donaldson\.com/i.test(sourceUrl))urls.push(sourceUrl);
  urls.push('https://shop.donaldson.com/store/en-us/search?Ntt='+encodeURIComponent(code));
  for(const url of [...new Set(urls)]){
    const f=await fetchText(url);
    if(!f.ok)continue;
    if(/\/product\//i.test(f.url)){
      const safe=String(code||'').replace(/[^A-Z0-9-]/gi,'');
      const exactUrl=new RegExp('/product/'+safe+'/','i').test(f.url);
      if(exactUrl&&pageSupportsOfficialProduct(f.text,code))return {...f,evidence_kind:'OFFICIAL_PRODUCT_PAGE'};
      continue;
    }
    if(exactProductLink(f.text,code))return {...f,evidence_kind:'OFFICIAL_EXACT_SEARCH_RESULT'};
  }
  return {ok:false,reason:'STRICT_EXACT_PRODUCT_NOT_CONFIRMED'};
}

(async()=>{
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url)throw new Error('DB URL missing');

  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();

  const report={
    migration:'221_STRICT_AUDIT_RUN220_DONALDSON_EVIDENCE',
    limit:LIMIT,
    selected:0,
    strict_verified:0,
    strict_failed:0,
    canonical_mismatch:0,
    details:[],
    transaction:'READ_ONLY'
  };

  try{
    await db.query('BEGIN READ ONLY');

    const q=await db.query(`
      SELECT DISTINCT ON (e.sku,e.normalized_reference)
        e.sku,
        e.reference_code,
        e.normalized_reference,
        e.source_url,
        e.evidence_kind,
        e.verified_at,
        c.codigo_base,
        c.canonical_source_brand,
        c.canonical_source_code,
        c.canonical_source_status
      FROM public.catalog_codigo_base_evidence e
      JOIN public.elimfilters_catalog c ON c.sku=e.sku
      WHERE e.authority='OFFICIAL_DONALDSON'
        AND e.manufacturer='DONALDSON'
        AND COALESCE(e.metadata->>'migration','')='220_BULK_OFFICIAL_COLLISION_RESEARCH'
      ORDER BY e.sku,e.normalized_reference,e.verified_at DESC
      LIMIT $1
    `,[LIMIT]);

    report.selected=q.rowCount;

    for(const r of q.rows){
      const v=await strictVerify(r.reference_code,r.source_url);
      const canonicalMatch=normalizeCode(r.codigo_base)===normalizeCode(r.reference_code);

      if(!canonicalMatch)report.canonical_mismatch++;

      if(v.ok){
        report.strict_verified++;
        if(!ANOMALIES_ONLY || !canonicalMatch) report.details.push({
          sku:r.sku,
          code:r.reference_code,
          status:'STRICT_VERIFIED',
          canonical_match:canonicalMatch,
          evidence_kind:v.evidence_kind,
          url:v.url
        });
      }else{
        report.strict_failed++;
        report.details.push({
          sku:r.sku,
          code:r.reference_code,
          status:'STRICT_FAILED',
          canonical_match:canonicalMatch,
          source_url:r.source_url,
          canonical_source_brand:r.canonical_source_brand,
          canonical_source_code:r.canonical_source_code,
          canonical_source_status:r.canonical_source_status
        });
      }
    }

    await db.query('ROLLBACK');

    report.summary={
      selected:report.selected,
      strict_verified:report.strict_verified,
      strict_failed:report.strict_failed,
      canonical_mismatch:report.canonical_mismatch,
      anomalies:report.details.filter(x=>x.status==='STRICT_FAILED'||x.canonical_match===false).map(x=>({
        sku:x.sku,
        code:x.code,
        status:x.status,
        canonical_match:x.canonical_match,
        source_url:x.source_url||x.url||null,
        canonical_source_brand:x.canonical_source_brand||null,
        canonical_source_code:x.canonical_source_code||null,
        canonical_source_status:x.canonical_source_status||null
      }))
    };

    console.log(JSON.stringify(report,null,2));
  }finally{
    await db.end();
  }
})().catch(e=>{
  console.error(e);
  process.exit(1);
});
