'use strict';

require('dotenv').config();
const { Client } = require('pg');
const {
  normalizeCode,
  normalizeManufacturer,
  governanceFrom,
  lastFourNumeric,
} = require('../../lib/catalog-codigo-base-policy');

function prefixFor(sku=''){
  const s=String(sku).toUpperCase();
  for(const p of ['EA1','EA2','EF9','EL8','EH6']) if(s.startsWith(p)) return p;
  return null;
}
function expectedSkuFromCode(sku, code){
  const p=prefixFor(sku), s=lastFourNumeric(code);
  return p&&s ? p+s : null;
}
function refs(v){
  if(!Array.isArray(v)) return [];
  return v.map(x=>({
    code:String(x?.code||x?.reference||x||'').trim(),
    manufacturer:normalizeManufacturer(x?.manufacturer||x?.brand||x?.oem||''),
    source_url:x?.source_url||x?.url||null
  })).filter(x=>x.code);
}
function officialKind(v=''){
  const s=String(v).toUpperCase();
  return s.includes('OFFICIAL') || s.includes('MANUFACTURER');
}
function evidenceKey(e){ return normalizeManufacturer(e.manufacturer)+'|'+normalizeCode(e.reference_code); }

(async()=>{
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();

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
      if(sources.length>1 || occupied){
        for(const source of sources) collisionRows.push({source,target,occupied,source_count:sources.length});
      }
    }

    const skuList=collisionRows.map(x=>x.source.sku);
    let ledger=[];
    const hasLedger=(await db.query("SELECT to_regclass('public.catalog_codigo_base_evidence') AS r")).rows[0]?.r;
    if(hasLedger && skuList.length){
      ledger=(await db.query(`
        SELECT sku,evidence_kind,authority,manufacturer,reference_code,source_url,verified_at,metadata
        FROM public.catalog_codigo_base_evidence
        WHERE sku=ANY($1::text[])
        ORDER BY sku,verified_at DESC,id DESC
      `,[skuList])).rows;
    }
    const ledgerBySku=new Map();
    for(const e of ledger){
      if(!ledgerBySku.has(e.sku)) ledgerBySku.set(e.sku,[]);
      ledgerBySku.get(e.sku).push(e);
    }

    const matrix=[];
    for(const item of collisionRows){
      const r=item.source;
      const gov=governanceFrom(r);
      const duty=String(r.duty||'').toUpperCase();
      const comp=refs(r.competitor_codes);
      const oem=refs(r.oem_codes);
      const evidence=(ledgerBySku.get(r.sku)||[]).filter(e=>officialKind(e.evidence_kind));
      const evidenceSet=new Set(evidence.map(evidenceKey));

      const fleetguard=comp.filter(x=>x.manufacturer==='FLEETGUARD' && evidenceSet.has('FLEETGUARD|'+normalizeCode(x.code)));
      const oemVerified=oem.filter(x=>evidenceSet.has(x.manufacturer+'|'+normalizeCode(x.code)));

      const baseEntry={
        source_sku:r.sku,
        source_base:r.codigo_base,
        natural_target:item.target,
        occupied_by:item.occupied?{sku:item.occupied.sku,codigo_base:item.occupied.codigo_base}:null,
        source_count_for_target:item.source_count,
        duty,
        canonical_source_brand:r.canonical_source_brand,
        canonical_source_code:r.canonical_source_code,
        origin_group:String(gov.origin_group||'').toUpperCase()||null,
        official_evidence_count:evidence.length,
        verified_fleetguard_codes:fleetguard.map(x=>x.code),
        verified_oem_codes:oemVerified.map(x=>({manufacturer:x.manufacturer,code:x.code})),
        qualification:'RESEARCH_REQUIRED',
        candidate:null,
        missing:[]
      };

      if(duty==='HEAVY_DUTY'){
        const donaldsonPrimary = gov.primary_manufacturer_verified===true
          && normalizeManufacturer(r.canonical_source_brand)==='DONALDSON'
          && normalizeCode(r.canonical_source_code);
        if(!donaldsonPrimary) baseEntry.missing.push('VERIFIED_DONALDSON_CANONICAL_IDENTITY');

        if(donaldsonPrimary && fleetguard.length===1){
          const code=fleetguard[0].code;
          const target=expectedSkuFromCode(r.sku,code);
          const occ=bySku.get(target)||null;
          const donaldsonCollisionProven=Boolean(
            item.occupied &&
            normalizeCode(item.occupied.codigo_base)!==normalizeCode(r.codigo_base) &&
            normalizeCode(item.occupied.canonical_source_code)!==normalizeCode(r.canonical_source_code)
          );
          if(!donaldsonCollisionProven){
            baseEntry.missing.push(item.source_count>1
              ? 'MULTIPLE_SOURCE_DONALDSON_TARGET_REQUIRES_PRIMARY_SELECTION'
              : 'DONALDSON_COLLISION_NOT_PROVEN');
          }else if(!occ){
            baseEntry.qualification='AUTO_READY_FLEETGUARD';
            baseEntry.candidate={manufacturer:'FLEETGUARD',code,source_column:'COMPETITOR_CODES',final_sku:target};
          }else{
            baseEntry.missing.push('FLEETGUARD_TARGET_FREE');
          }
        }else if(donaldsonPrimary && fleetguard.length>1){
          baseEntry.missing.push('UNAMBIGUOUS_VERIFIED_FLEETGUARD_CODE');
        }else if(donaldsonPrimary && fleetguard.length===0){
          baseEntry.missing.push('VERIFIED_FLEETGUARD_OFFICIAL_EVIDENCE');
        }

        if(baseEntry.qualification==='RESEARCH_REQUIRED' && donaldsonPrimary && oemVerified.length===1){
          const fgCollisionCode=normalizeCode(gov.collision_fleetguard_code||'');
          const fgCollisionVerified=gov.fleetguard_sku_collision_verified===true && fgCollisionCode;
          if(!fgCollisionVerified){
            baseEntry.missing.push('VERIFIED_FLEETGUARD_COLLISION_BEFORE_OEM');
          }else{
            const x=oemVerified[0];
            const target=expectedSkuFromCode(r.sku,x.code);
            const occ=bySku.get(target)||null;
            if(!occ){
              baseEntry.qualification='AUTO_READY_OEM';
              baseEntry.candidate={manufacturer:x.manufacturer,code:x.code,source_column:'OEM_CODES',final_sku:target};
            }else{
              baseEntry.missing.push('OEM_TARGET_FREE');
            }
          }
        }
      }else if(duty==='LIGHT_DUTY'){
        const origin=String(gov.origin_group||'').toUpperCase();
        const canon=normalizeManufacturer(r.canonical_source_brand);
        const primaryVerified=gov.primary_manufacturer_verified===true;
        if(origin==='EUROPEAN'){
          const mannOk=primaryVerified && ['MANN','MANNFILTER','MANNHUMMEL'].includes(canon);
          if(!mannOk) baseEntry.missing.push('VERIFIED_MANN_CANONICAL_IDENTITY');
          if(mannOk && oemVerified.length===1){
            const x=oemVerified[0];
            const target=expectedSkuFromCode(r.sku,x.code);
            const occ=bySku.get(target)||null;
            if(!occ){
              baseEntry.qualification='AUTO_READY_OEM';
              baseEntry.candidate={manufacturer:x.manufacturer,code:x.code,source_column:'OEM_CODES',final_sku:target};
            }else{
              baseEntry.missing.push('OEM_TARGET_FREE');
            }
          }else if(mannOk && oemVerified.length===0){
            baseEntry.missing.push('VERIFIED_OEM_OFFICIAL_EVIDENCE');
          }else if(mannOk && oemVerified.length>1){
            baseEntry.missing.push('UNAMBIGUOUS_VERIFIED_OEM_CODE');
          }
        }else{
          baseEntry.missing.push('LD_COLLISION_OEM_RULE_REQUIRES_EUROPEAN_MANN');
        }
      }else{
        baseEntry.missing.push('SUPPORTED_DUTY');
      }

      matrix.push(baseEntry);
    }

    const counts={};
    const missingCounts={};
    for(const x of matrix){
      counts[x.qualification]=(counts[x.qualification]||0)+1;
      for(const m of x.missing) missingCounts[m]=(missingCounts[m]||0)+1;
    }
    console.log(JSON.stringify({
      policy:'VERIFIED_COLLISION_FALLBACK_QUALIFICATION_V1',
      matrix,
      summary:{
        collision_rows:matrix.length,
        auto_ready_fleetguard:counts.AUTO_READY_FLEETGUARD||0,
        auto_ready_oem:counts.AUTO_READY_OEM||0,
        research_required:counts.RESEARCH_REQUIRED||0,
        qualification_counts:counts,
        missing_requirement_counts:missingCounts,
        auto_ready_rows:matrix.filter(x=>x.qualification==='AUTO_READY_FLEETGUARD').map(x=>({
          source_sku:x.source_sku,
          source_base:x.source_base,
          natural_target:x.natural_target,
          occupied_by:x.occupied_by,
          source_count_for_target:x.source_count_for_target,
          candidate:x.candidate
        }))
      },
      transaction:'READ_ONLY'
    },null,2));
  }finally{
    await db.end();
  }
})().catch(e=>{console.error(e.stack||e);process.exit(1);});
