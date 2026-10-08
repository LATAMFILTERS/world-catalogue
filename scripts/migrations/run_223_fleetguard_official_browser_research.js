'use strict';

require('dotenv').config();
const crypto=require('crypto');
const fs=require('fs');
function recordProgress(report,sku,code){if(process.env.CATALOG_RESEARCH_PROGRESS_PATH)fs.writeFileSync(process.env.CATALOG_RESEARCH_PROGRESS_PATH,JSON.stringify({selected_rows:report.selected_rows,candidate_codes:report.candidate_codes,attempted:report.attempted,verified:report.verified,unresolved:report.unresolved,last_sku:sku,last_code:code,timestamp:new Date().toISOString()}));}
const {Client}=require('pg');
const {
  normalizeCode,
  normalizeManufacturer,
  governanceFrom,
  lastFourNumeric,
}=require('../../lib/catalog-codigo-base-policy');

const {exactCodeToken,exactProductUrl,verifiesDonaldsonCrossReference,verifiedFleetguardIdentityForSource}=require('../../lib/fleetguard-official-evidence');
const EXECUTE=process.argv.includes('--execute');
const LIMIT_ARG=process.argv.find(x=>x.startsWith('--limit='));
const LIMIT=LIMIT_ARG?Math.max(1,Number(LIMIT_ARG.split('=')[1])||20):20;

function sha(v){return crypto.createHash('sha256').update(String(v)).digest('hex');}
function prefixFor(sku=''){
  const s=String(sku).toUpperCase();
  for(const p of ['EA1','EA2','EF9','EL8','EH6']) if(s.startsWith(p)) return p;
  return null;
}
function expectedSkuFromCode(sku,code){
  const p=prefixFor(sku),s=lastFourNumeric(code);
  return p&&s?p+s:null;
}
function refs(v){
  if(!Array.isArray(v))return [];
  return v.map(x=>({
    code:String(x?.code||x?.reference||x||'').trim(),
    manufacturer:normalizeManufacturer(x?.manufacturer||x?.brand||x?.oem||''),
    source_url:x?.source_url||x?.url||null
  })).filter(x=>x.code);
}
function exactPathMatches(url,code){
  try{
    return exactProductUrl(url,code);
  }catch{return false;}
}

async function main(){
  let chromium;
  try{({chromium}=await import('patchright'));}catch{
    try{({chromium}=await import('playwright'));}catch{
      throw new Error('STOP_SOURCE_BROWSER_TOOL_MISSING');
    }
  }

  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url)throw new Error('DB URL missing');

  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();

  const report={
    migration:'223_FLEETGUARD_OFFICIAL_BROWSER_RESEARCH',
    mode:EXECUTE?'execute':'dry-run',
    limit:LIMIT,
    selected_rows:0,
    candidate_codes:0,
    attempted:0,
    verified:0,
    unresolved:0,
    evidence_mutations:0,
    details:[],
    transaction:EXECUTE?'PER_ROW_COMMIT':'READ_ONLY'
  };

  const browser=await chromium.launch({headless:true});
  try{
    const rows=(await db.query(`
      SELECT *
      FROM public.elimfilters_catalog
      WHERE catalog_active=true
        AND (sku LIKE 'EA1%' OR sku LIKE 'EA2%' OR sku LIKE 'EF9%' OR sku LIKE 'EL8%' OR sku LIKE 'EH6%')
      ORDER BY sku
    `)).rows;

    const bySku=new Map(rows.map(r=>[String(r.sku).toUpperCase(),r]));
    const malformed=rows.map(r=>({...r,natural_target:expectedSkuFromCode(r.sku,r.codigo_base||r.canonical_source_code)}))
      .filter(r=>r.natural_target&&r.natural_target!==String(r.sku).toUpperCase());

    const groups=new Map();
    for(const r of malformed){
      if(!groups.has(r.natural_target))groups.set(r.natural_target,[]);
      groups.get(r.natural_target).push(r);
    }

    const collisionRows=[];
    for(const [target,sources] of groups){
      const occupied=bySku.get(target)||null;
      if(sources.length>1||occupied){
        for(const source of sources)collisionRows.push({source,target,occupied});
      }
    }

    const skuList=collisionRows.map(x=>x.source.sku);
    let ledger=[];
    if(skuList.length){
      ledger=(await db.query(`
        SELECT sku,manufacturer,reference_code,evidence_kind,source_url,evidence_hash,verified_at,metadata
        FROM public.catalog_codigo_base_evidence
        WHERE sku=ANY($1::text[])
          AND manufacturer='FLEETGUARD'
          AND (UPPER(evidence_kind) LIKE '%OFFICIAL%' OR UPPER(evidence_kind) LIKE '%MANUFACTURER%')
      `,[skuList])).rows;
    }
    const existing=new Set(ledger.filter(e=>verifiedFleetguardIdentityForSource(e,bySku.get(e.sku)||{})).map(e=>String(e.sku).toUpperCase()+'|'+normalizeCode(e.reference_code)));

    const selected=[];
    for(const item of collisionRows){
      const r=item.source;
      const gov=governanceFrom(r);
      const donaldsonPrimary=gov.primary_manufacturer_verified===true
        && normalizeManufacturer(r.canonical_source_brand)==='DONALDSON'
        && normalizeCode(r.canonical_source_code);
      if(!donaldsonPrimary)continue;

      const fg=[...new Map(
        refs(r.competitor_codes)
          .filter(x=>x.manufacturer==='FLEETGUARD')
          .map(x=>[normalizeCode(x.code),x])
      ).values()].filter(x=>!existing.has(String(r.sku).toUpperCase()+'|'+normalizeCode(x.code)));

      if(!fg.length)continue;
      selected.push({item,fg});
      if(selected.length>=LIMIT)break;
    }

    report.selected_rows=selected.length;
    report.candidate_codes=selected.reduce((n,x)=>n+x.fg.length,0);

    const productPages=new Map();
    const page=await browser.newPage({locale:'en-US',viewport:{width:1440,height:1200}});

    for(const sel of selected){
      const sku=sel.item.source.sku;
      for(const ref of sel.fg){
        const code=normalizeCode(ref.code);
        const requested=ref.source_url&&/fleetguard\.com/i.test(ref.source_url)
          ? ref.source_url
          : 'https://www.fleetguard.com/product/'+encodeURIComponent(code);

        report.attempted++;

        let verified=null;
        let reason='OFFICIAL_PAGE_NOT_CONFIRMED';
        try{
          const cached=productPages.get(code);
          const response=cached?{ok:()=>true}:await page.goto(requested,{waitUntil:'domcontentloaded',timeout:60000});
          if(!response?.ok()){
            reason='HTTP_'+String(response?.status()||0);
          }else{
            if(!cached)await page.waitForTimeout(1800);
            const finalUrl=cached?.url||page.url();
            const payload=cached?.payload||await page.evaluate(()=>({
              text:document.body?.innerText||'',
              html:document.documentElement?.outerHTML||'',
              title:document.title||'',
              images:[...document.images].slice(0,200).map(img=>({
                alt:img.alt||'',
                src:img.currentSrc||img.src||'',
                parent:(img.closest('article,li,section,div')?.textContent||'').slice(0,1000)
              }))
            }));

            productPages.set(code,{url:finalUrl,payload});
            const exactBody=exactCodeToken(payload.text,code);
            const exactUrl=exactPathMatches(finalUrl,code);
            const imageBound=payload.images.some(img=>{
              return exactCodeToken(img.alt,code)||exactCodeToken(img.src,code);
            });

            const crossReference=verifiesDonaldsonCrossReference(payload,code,sel.item.source.canonical_source_code);
            if(exactUrl&&exactBody&&imageBound&&crossReference){
              verified={
                url:finalUrl,
                evidence_kind:'OFFICIAL_FLEETGUARD_RENDERED_PRODUCT_PAGE',
                evidence_hash:sha(payload.html),
                title:payload.title
              };
            }else{
              reason=[
                exactUrl?'':'URL_CODE_MISMATCH',
                exactBody?'':'BODY_CODE_MISSING',
                imageBound?'':'IMAGE_BINDING_MISSING',
                crossReference?'':'DONALDSON_CROSS_REFERENCE_MISSING'
              ].filter(Boolean).join('+')||reason;
            }
          }
        }catch(e){
          reason=e?.name==='TimeoutError'?'PAGE_TIMEOUT':'PAGE_FAILED';
        }

        if(!verified){
          report.unresolved++;
          report.details.push({sku,code,status:'UNRESOLVED',reason,requested_url:requested});
          recordProgress(report,sku,code);
          continue;
        }

        report.verified++;
        report.details.push({sku,code,status:'VERIFIED',url:verified.url,evidence_kind:verified.evidence_kind});
        recordProgress(report,sku,code);

        if(EXECUTE){
          await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
          try{
            const locked=(await db.query('SELECT sku,competitor_codes FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',[sku])).rows[0];
            if(!locked)throw new Error('SOURCE_MISSING');
            const stillPresent=refs(locked.competitor_codes).some(x=>x.manufacturer==='FLEETGUARD'&&normalizeCode(x.code)===code);
            if(!stillPresent)throw new Error('FLEETGUARD_REFERENCE_CHANGED');

            const ins=await db.query(`
              INSERT INTO public.catalog_codigo_base_evidence
                (sku,evidence_kind,authority,manufacturer,reference_code,normalized_reference,source_url,evidence_hash,verified_at,metadata)
              VALUES($1,$2,'OFFICIAL_FLEETGUARD','FLEETGUARD',$3,$4,$5,$6,now(),$7::jsonb)
              ON CONFLICT DO NOTHING
              RETURNING id
            `,[
              sku,
              verified.evidence_kind,
              ref.code,
              code,
              verified.url,
              verified.evidence_hash,
              JSON.stringify({
                migration:'223_FLEETGUARD_OFFICIAL_BROWSER_RESEARCH',
                verification:'EXACT_URL_EXACT_BODY_IMAGE_BOUND_EXACT_DONALDSON_CROSS_REFERENCE',
                cross_reference_confirmed:true,
                source_codigo_base:sel.item.source.codigo_base,
                source_canonical_code:sel.item.source.canonical_source_code
              })
            ]);
            report.evidence_mutations+=ins.rowCount;
            await db.query('COMMIT');
          }catch(e){
            await db.query('ROLLBACK');
            throw e;
          }
        }
      }
    }

    report.summary={
      selected_rows:report.selected_rows,
      candidate_codes:report.candidate_codes,
      attempted:report.attempted,
      verified:report.verified,
      unresolved:report.unresolved,
      evidence_mutations:report.evidence_mutations
    };

    console.log(JSON.stringify(report,null,2));
  }finally{
    await browser.close();
    await db.end();
  }
}

main().catch(e=>{console.error(e.stack||e);process.exit(1);});
