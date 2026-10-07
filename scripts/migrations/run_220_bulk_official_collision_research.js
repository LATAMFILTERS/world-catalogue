'use strict';

require('dotenv').config();
const crypto=require('crypto');
const {Client}=require('pg');
const {
  normalizeCode,
  normalizeManufacturer,
  governanceFrom,
  lastFourNumeric,
} = require('../../lib/catalog-codigo-base-policy');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');

const EXECUTE=process.argv.includes('--execute');
const LIMIT_ARG=process.argv.find(x=>x.startsWith('--limit='));
const LIMIT=LIMIT_ARG?Math.max(1,Number(LIMIT_ARG.split('=')[1])||50):50;

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
  if(!Array.isArray(v)) return [];
  return v.map(x=>({
    code:String(x?.code||x?.reference||x||'').trim(),
    manufacturer:normalizeManufacturer(x?.manufacturer||x?.brand||x?.oem||''),
    source_url:x?.source_url||x?.url||null
  })).filter(x=>x.code);
}
async function fetchText(url){
  const c=new AbortController(); const t=setTimeout(()=>c.abort(),15000);
  try{
    const r=await fetch(url,{redirect:'follow',signal:c.signal,headers:{'user-agent':'ELIMFILTERS-Catalogue-Audit/1.0'}});
    if(!r.ok)return {ok:false,reason:'HTTP_'+r.status,url:r.url||url};
    const text=await r.text();
    return {ok:true,url:r.url||url,text,hash:sha(text)};
  }catch(e){
    return {ok:false,reason:e?.name==='AbortError'?'FETCH_TIMEOUT':'FETCH_FAILED',url};
  }finally{clearTimeout(t);}
}
async function verifyDonaldsonExact(code,preferredUrl){
  const urls=[];
  if(preferredUrl && /donaldson\.com/i.test(preferredUrl)) urls.push(preferredUrl);
  urls.push('https://shop.donaldson.com/store/en-us/search?Ntt='+encodeURIComponent(code));
  const wanted=normalizeCode(code);
  for(const url of [...new Set(urls)]){
    const f=await fetchText(url);
    if(!f.ok) continue;
    const n=normalizeCode(f.text);
    if(!n.includes(wanted)) continue;
    return {ok:true,url:f.url,hash:f.hash,evidence_kind:/\/product\//i.test(f.url)?'OFFICIAL_PRODUCT_PAGE':'OFFICIAL_EXACT_SEARCH_RESULT'};
  }
  return {ok:false,reason:'DONALDSON_EXACT_NOT_CONFIRMED'};
}
async function verifyFleetguardExact(code,preferredUrl){
  const urls=[];
  if(preferredUrl && /fleetguard\.com/i.test(preferredUrl)) urls.push(preferredUrl);
  urls.push('https://www.fleetguard.com/product/'+encodeURIComponent(code));
  const wanted=normalizeCode(code);
  for(const url of [...new Set(urls)]){
    const f=await fetchText(url);
    if(!f.ok) continue;
    const n=normalizeCode(f.text);
    if(!n.includes(wanted)) continue;
    return {ok:true,url:f.url,hash:f.hash,evidence_kind:'OFFICIAL_PRODUCT_PAGE'};
  }
  return {ok:false,reason:'FLEETGUARD_EXACT_NOT_CONFIRMED'};
}

(async()=>{
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();

  const report={
    migration:'220_BULK_OFFICIAL_COLLISION_RESEARCH',
    mode:EXECUTE?'execute':'dry-run',
    limit:LIMIT,
    selected:0,
    donaldson:{attempted:0,verified:0,unresolved:0},
    fleetguard:{attempted:0,verified:0,unresolved:0},
    details:[],
    mutations:{catalog:0,evidence:0},
    evidence_only:{donaldson_code_differs_from_base:0}
  };

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
      .filter(r=>r.natural_target && r.natural_target!==String(r.sku).toUpperCase());

    const groups=new Map();
    for(const r of malformed){
      if(!groups.has(r.natural_target)) groups.set(r.natural_target,[]);
      groups.get(r.natural_target).push(r);
    }

    const collisionRows=[];
    for(const [target,sources] of groups){
      const occupied=bySku.get(target)||null;
      if(sources.length>1||occupied) for(const source of sources) collisionRows.push({source,target,occupied});
    }

    const selected=collisionRows.filter(item=>{
      const r=item.source;
      const gov=governanceFrom(r);
      const canon=normalizeManufacturer(r.canonical_source_brand);
      const comp=refs(r.competitor_codes);
      const hasFg=comp.some(x=>x.manufacturer==='FLEETGUARD');
      const needsDonaldson=!(gov.primary_manufacturer_verified===true && canon==='DONALDSON' && normalizeCode(r.canonical_source_code));
      return needsDonaldson || hasFg;
    }).slice(0,LIMIT);

    report.selected=selected.length;

    for(const item of selected){
      const r=item.source;
      const gov=governanceFrom(r);
      let nextGov={...gov};
      let nextData={...(r.enrichment_data||{})};
      let patch={};
      let changed=false;

      const canon=normalizeManufacturer(r.canonical_source_brand);
      const donaldsonAlready=gov.primary_manufacturer_verified===true && canon==='DONALDSON' && normalizeCode(r.canonical_source_code);
      if(!donaldsonAlready){
        const candidates=[];
        if(canon==='DONALDSON' && r.canonical_source_code) candidates.push(r.canonical_source_code);
        if(Array.isArray(gov.observed_primary_candidates)) candidates.push(...gov.observed_primary_candidates);
        if(/^[PG]\d+/i.test(String(r.codigo_base||''))) candidates.push(r.codigo_base);
        const unique=[...new Set(candidates.map(String).filter(Boolean))];

        let verified=null;
        for(const code of unique){
          report.donaldson.attempted++;
          const f=await verifyDonaldsonExact(code,r.canonical_source_url);
          if(f.ok){verified={code,...f};break;}
        }
        if(verified){
          report.donaldson.verified++;
          const now=new Date().toISOString();
          const verifiedMatchesBase=normalizeCode(verified.code)===normalizeCode(r.codigo_base);

          report.details.push({
            sku:r.sku,
            kind:'DONALDSON',
            status:verifiedMatchesBase?'VERIFIED_CANONICAL_BASE':'VERIFIED_EVIDENCE_ONLY',
            code:verified.code,
            current_base:r.codigo_base,
            url:verified.url
          });

          if(verifiedMatchesBase){
            nextGov={
              ...nextGov,
              state:'CANONICAL_VERIFIED',
              governance_state:'CANONICAL_VERIFIED',
              required_authority:'VERIFIED_DONALDSON',
              primary_manufacturer_verified:true,
              approved_manufacturer:'DONALDSON',
              approved_codigo_base:r.codigo_base,
              current_codigo_base:r.codigo_base,
              evidence_authority:'OFFICIAL_DONALDSON',
              evidence_kind:verified.evidence_kind,
              evidence_url:verified.url,
              evidence_hash:verified.hash,
              verified_at:now
            };
            nextData={...nextData,codigo_base_governance:nextGov};
            patch={
              ...patch,
              canonical_source_brand:'DONALDSON',
              canonical_source_code:verified.code,
              canonical_source_url:verified.url,
              canonical_source_status:'VERIFIED',
              canonical_verified_at:now,
              canonical_evidence:{source:verified.evidence_kind,source_url:verified.url,evidence_hash:verified.hash,migration:'220_BULK_OFFICIAL_COLLISION_RESEARCH'}
            };
            changed=true;
          }else{
            report.evidence_only.donaldson_code_differs_from_base++;
          }

          if(EXECUTE){
            await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
            try{
              const locked=(await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',[r.sku])).rows[0];
              if(!locked) throw new Error('SOURCE_MISSING');

              const evidence=await db.query(`
                INSERT INTO public.catalog_codigo_base_evidence
                  (sku,evidence_kind,authority,manufacturer,reference_code,normalized_reference,source_url,evidence_hash,verified_at,metadata)
                VALUES($1,$2,'OFFICIAL_DONALDSON','DONALDSON',$3,$4,$5,$6,$7,$8::jsonb)
                ON CONFLICT DO NOTHING
                RETURNING id
              `,[
                r.sku,verified.evidence_kind,verified.code,normalizeCode(verified.code),
                verified.url,verified.hash,now,
                JSON.stringify({
                  migration:'220_BULK_OFFICIAL_COLLISION_RESEARCH',
                  current_codigo_base:r.codigo_base,
                  canonical_base_match:verifiedMatchesBase
                })
              ]);
              report.mutations.evidence+=evidence.rowCount;

              if(verifiedMatchesBase){
                const mergedData={...(locked.enrichment_data||{}),codigo_base_governance:nextGov};
                const validationRow={
                  ...locked,
                  oem_codes:Array.isArray(locked.oem_codes)?locked.oem_codes:[],
                  competitor_codes:Array.isArray(locked.competitor_codes)?locked.competitor_codes:[],
                  equipment_applications:Array.isArray(locked.equipment_applications)?locked.equipment_applications:[],
                  vehicle_applications:Array.isArray(locked.vehicle_applications)?locked.vehicle_applications:[]
                };
                assertGovernedCatalogPatch(validationRow,{...patch,enrichment_data:mergedData},{validateApplications:false});
                const u=await db.query(`
                  UPDATE public.elimfilters_catalog
                  SET enrichment_data=$1::jsonb,
                      canonical_source_brand=$2,
                      canonical_source_code=$3,
                      canonical_source_url=$4,
                      canonical_source_status=$5,
                      canonical_verified_at=$6::timestamptz,
                      canonical_evidence=$7::jsonb
                  WHERE sku=$8
                    AND codigo_base IS NOT DISTINCT FROM $9
                  RETURNING sku
                `,[
                  JSON.stringify(mergedData),
                  patch.canonical_source_brand,
                  patch.canonical_source_code,
                  patch.canonical_source_url,
                  patch.canonical_source_status,
                  patch.canonical_verified_at,
                  JSON.stringify(patch.canonical_evidence),
                  r.sku,r.codigo_base
                ]);
                if(u.rowCount!==1) throw new Error('CATALOG_UPDATE_FAILED');
                report.mutations.catalog++;
              }

              await db.query('COMMIT');
            }catch(e){
              await db.query('ROLLBACK');
              throw e;
            }
          }
        }else{
          report.donaldson.unresolved++;
          report.details.push({sku:r.sku,kind:'DONALDSON',status:'UNRESOLVED'});
        }
      }

      const fgRefs=refs(r.competitor_codes).filter(x=>x.manufacturer==='FLEETGUARD');
      let fgVerified=null;
      for(const x of fgRefs){
        report.fleetguard.attempted++;
        const f=await verifyFleetguardExact(x.code,x.source_url);
        if(f.ok){fgVerified={...x,...f};break;}
      }
      if(fgVerified){
        report.fleetguard.verified++;
        const now=new Date().toISOString();
        if(EXECUTE){
          await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
          try{
            const locked=(await db.query('SELECT sku FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',[r.sku])).rows[0];
            if(!locked) throw new Error('SOURCE_MISSING');
            const evidence=await db.query(`
              INSERT INTO public.catalog_codigo_base_evidence
                (sku,evidence_kind,authority,manufacturer,reference_code,normalized_reference,source_url,evidence_hash,verified_at,metadata)
              VALUES($1,$2,'OFFICIAL_FLEETGUARD','FLEETGUARD',$3,$4,$5,$6,$7,$8::jsonb)
              ON CONFLICT DO NOTHING
              RETURNING id
            `,[r.sku,fgVerified.evidence_kind,fgVerified.code,normalizeCode(fgVerified.code),fgVerified.url,fgVerified.hash,now,JSON.stringify({migration:'220_BULK_OFFICIAL_COLLISION_RESEARCH',purpose:'collision_fallback_candidate'})]);
            report.mutations.evidence+=evidence.rowCount;
            await db.query('COMMIT');
          }catch(e){
            await db.query('ROLLBACK');
            throw e;
          }
        }
        report.details.push({sku:r.sku,kind:'FLEETGUARD',status:'VERIFIED',code:fgVerified.code,url:fgVerified.url});
      }else if(fgRefs.length){
        report.fleetguard.unresolved++;
        report.details.push({sku:r.sku,kind:'FLEETGUARD',status:'UNRESOLVED',candidate_count:fgRefs.length});
      }


    }

    report.summary={
      selected:report.selected,
      donaldson_attempted:report.donaldson.attempted,
      donaldson_verified:report.donaldson.verified,
      donaldson_unresolved:report.donaldson.unresolved,
      fleetguard_attempted:report.fleetguard.attempted,
      fleetguard_verified:report.fleetguard.verified,
      fleetguard_unresolved:report.fleetguard.unresolved,
      catalog_mutations:report.mutations.catalog,
      evidence_mutations:report.mutations.evidence,
      donaldson_evidence_only_code_differs_from_base:report.evidence_only.donaldson_code_differs_from_base
    };
    console.log(JSON.stringify(report,null,2));
  }finally{
    await db.end();
  }
})().catch(e=>{console.error(e.stack||e);process.exit(1);});
