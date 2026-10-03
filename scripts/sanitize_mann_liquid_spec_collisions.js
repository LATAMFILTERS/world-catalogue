'use strict';

const fs=require('fs');
const path=require('path');
const {Client}=require('pg');
const {physicalIssues}=require('../lib/product-page-data');
const {normalizePart,fetchOfficialMannSpecs}=require('../lib/mann-official-spec-verifier');
const {loadCollisionGroups,fetchRows,applyOne}=require('./sanitize_mann_air_spec_collisions');

const EXECUTE=process.argv.includes('--execute');
const familyArg=process.argv.find(a=>a.startsWith('--family='));
const FAMILY=String(familyArg?familyArg.split('=')[1]:'').toLowerCase();
const limitArg=process.argv.find(a=>a.startsWith('--limit='));
const LIMIT=limitArg?Math.max(1,Math.min(100,Number(limitArg.split('=')[1])||25)):25;
const scanArg=process.argv.find(a=>a.startsWith('--scan-limit='));
const SCAN_LIMIT=scanArg?Math.max(LIMIT,Math.min(300,Number(scanArg.split('=')[1])||150)):150;
const outArg=process.argv.find(a=>a.startsWith('--out='));
const OUT_FILE=outArg?outArg.slice('--out='.length):null;

function n(v){return v==null||v===''?null:Number(v);}
function sameNum(a,b){return a==null&&b==null?true:n(a)===n(b);}
function sameText(a,b){return String(a||'').trim().toUpperCase()===String(b||'').trim().toUpperCase();}

function comparablePatch(row){
  return {
    installation_type:row.installation_type||null,
    thread_size:row.thread_size||null,
    outer_diameter_mm:n(row.outer_diameter_mm),
    height_mm:n(row.height_mm),
    gasket_od_mm:n(row.gasket_od_mm),
    gasket_id_mm:n(row.gasket_id_mm),
  };
}
function comparableLive(row){
  return {
    installation_type:row.installation_type||null,
    thread_size:row.thread_size||null,
    outer_diameter_mm:n(row.outer_diameter_mm),
    height_mm:n(row.height_mm),
    gasket_od_mm:n(row.gasket_od_mm),
    gasket_id_mm:n(row.gasket_id_mm),
  };
}
function equalComparable(a,b){
  return sameText(a.installation_type,b.installation_type)&&
    sameText(a.thread_size,b.thread_size)&&
    sameNum(a.outer_diameter_mm,b.outer_diameter_mm)&&
    sameNum(a.height_mm,b.height_mm)&&
    sameNum(a.gasket_od_mm,b.gasket_od_mm)&&
    sameNum(a.gasket_id_mm,b.gasket_id_mm);
}

function officialFamilyMatches(official,family){
  const title=String(official?.identity?.title||'');
  return family==='oil'?/\bOil Filter\b/i.test(title):/\bFuel Filter\b/i.test(title);
}

function classifyLiquid(values,family){
  const hasBody=values.outer_diameter_mm!=null&&values.height_mm!=null;
  if(!hasBody) return {ok:false,reason:'MISSING_BODY_DIMENSIONS'};
  if(values.thread_size){
    return {ok:true,shape:'spin-on'};
  }
  if(family==='fuel'&&(values.inlet_mm!=null||values.outlet_mm!=null)){
    return {ok:true,shape:'inline'};
  }
  return {ok:true,shape:'cartridge'};
}

function validateLiquidGeometry(values,shape){
  const reasons=[];
  for(const [key,value] of Object.entries(values)){
    if(typeof value!=='number') continue;
    if(!Number.isFinite(value)||value<=0) reasons.push(key+'_NON_POSITIVE');
    if(value>2000) reasons.push(key+'_OVER_2000MM');
  }
  const physical=physicalIssues({
    height:values.height_mm,
    outerDiameter:values.outer_diameter_mm,
    gasketOuter:values.gasket_od_mm??null,
    gasketInner:values.gasket_id_mm??null,
  });
  reasons.push(...physical.errors);
  if(values.inner_diameter_mm!=null&&values.inner_diameter_mm>=values.outer_diameter_mm){
    reasons.push('INNER_DIAMETER_NOT_BELOW_OUTER');
  }
  if(values.outer_diameter_1_mm!=null&&values.outer_diameter_1_mm>values.outer_diameter_mm*1.5){
    reasons.push('OUTER_DIAMETER_1_IMPLAUSIBLE');
  }
  if(shape==='inline'){
    if(values.inlet_mm>=values.outer_diameter_mm) reasons.push('INLET_NOT_BELOW_BODY_OD');
    if(values.outlet_mm>=values.outer_diameter_mm) reasons.push('OUTLET_NOT_BELOW_BODY_OD');
  }
  if(shape==='spin-on'&&!String(values.thread_size||'').trim()) reasons.push('THREAD_MISSING');
  return {valid:reasons.length===0,reasons,warnings:physical.warnings};
}

function buildLiquidPatch(values,shape,sourceUrl){
  const patch={
    height_mm:values.height_mm,
    product_length_mm:null,
    outer_diameter_mm:values.outer_diameter_mm,
    canonical_source_url:sourceUrl,
    canonical_source_status:'VERIFIED',
    canonical_verified_at:new Date(),
  };
  if(shape==='spin-on'){
    patch.inner_diameter_mm=values.inner_diameter_mm??null;
    patch.gasket_od_mm=values.gasket_od_mm??null;
    patch.gasket_id_mm=values.gasket_id_mm??null;
    patch.thread_size=values.thread_size;
  }else if(shape==='inline'){
    patch.inner_diameter_mm=null;
    patch.gasket_od_mm=null;
    patch.gasket_id_mm=null;
    patch.thread_size=null;
  }else{
    patch.inner_diameter_mm=values.inner_diameter_mm??null;
    patch.gasket_od_mm=null;
    patch.gasket_id_mm=null;
    patch.thread_size=null;
  }
  return patch;
}

function patchDiffers(row,patch){
  for(const key of ['height_mm','product_length_mm','outer_diameter_mm','inner_diameter_mm','gasket_od_mm','gasket_id_mm']){
    if(Object.hasOwn(patch,key)&&!sameNum(row[key],patch[key])) return true;
  }
  if(Object.hasOwn(patch,'thread_size')&&!sameText(row.thread_size,patch.thread_size)) return true;
  return false;
}

async function main(){
  if(!['oil','fuel'].includes(FAMILY)) throw new Error('Use --family=oil or --family=fuel');
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');
  const u=new URL(url);
  if(u.hostname!=='127.0.0.1'||u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');

  const groups=loadCollisionGroups();
  const db=new Client({connectionString:url,ssl:false});
  await db.connect();
  const report={
    mode:EXECUTE?'execute':'dry-run',
    family:FAMILY,
    limit:LIMIT,
    scanned:0,
    official_verified:0,
    repaired:0,
    already_consistent:0,
    rejected:0,
    fetch_failed:0,
    details:[],
  };

  try{
    const rows=await fetchRows(db,groups.map(([sku])=>sku));
    const rowMap=new Map(rows.map(r=>[r.sku,r]));
    const candidates=[];

    for(const [sku,patchRows] of groups){
      const row=rowMap.get(sku);
      if(!row) continue;
      if(row.filter_type!==FAMILY||row.duty!=='LIGHT_DUTY'||row.catalog_active!==true||
         row.canonical_source_brand!=='MANN-FILTER'||!row.canonical_source_code) continue;

      const canonicalRows=patchRows.filter(p=>normalizePart(p.mann_source)===normalizePart(row.canonical_source_code));
      if(canonicalRows.length!==1) continue;
      const live=comparableLive(row);
      const offMatches=patchRows.filter(
        p=>normalizePart(p.mann_source)!==normalizePart(row.canonical_source_code)&&
           equalComparable(live,comparablePatch(p))
      );
      if(!offMatches.length) continue;
      candidates.push({
        row,
        rawCanonicalSource:canonicalRows[0].mann_source,
        offMatches:offMatches.map(p=>p.mann_source),
      });
    }

    candidates.sort((a,b)=>a.row.sku.localeCompare(b.row.sku));
    const verifiedReady=[];
    const CONCURRENCY=6;
    const scanCandidates=candidates.slice(0,SCAN_LIMIT);

    for(let i=0;i<scanCandidates.length&&verifiedReady.length<LIMIT;i+=CONCURRENCY){
      const chunk=scanCandidates.slice(i,i+CONCURRENCY);
      const fetched=await Promise.all(chunk.map(async candidate=>({
        candidate,
        official:await fetchOfficialMannSpecs(candidate.row.canonical_source_code,{
          timeoutMs:12000,
          rawCode:candidate.rawCanonicalSource,
        }),
      })));

      for(const {candidate,official} of fetched){
        const {row,offMatches}=candidate;
        report.scanned++;
        if(!official.ok){
          report.fetch_failed++;
          report.details.push({sku:row.sku,state:'OFFICIAL_FETCH_REJECTED',reason:official.reason,attempts:official.attempts||[]});
          continue;
        }
        if(!officialFamilyMatches(official,FAMILY)){
          report.rejected++;
          report.details.push({sku:row.sku,state:'FAMILY_REJECTED',title:official.identity.title,official_url:official.url});
          continue;
        }
        report.official_verified++;

        const classification=classifyLiquid(official.values,FAMILY);
        if(!classification.ok){
          report.rejected++;
          report.details.push({sku:row.sku,state:'GEOMETRY_REJECTED',reason:classification.reason,values:official.values,official_url:official.url});
          continue;
        }
        const physical=validateLiquidGeometry(official.values,classification.shape);
        if(!physical.valid){
          report.rejected++;
          report.details.push({sku:row.sku,state:'PHYSICAL_REJECTED',reasons:physical.reasons,values:official.values,official_url:official.url});
          continue;
        }

        const patch=buildLiquidPatch(official.values,classification.shape,official.url);
        if(!patchDiffers(row,patch)){
          report.already_consistent++;
          report.details.push({sku:row.sku,state:'ALREADY_CONSISTENT',official_url:official.url});
          continue;
        }
        verifiedReady.push({row,offMatches,official,classification,patch});
        if(verifiedReady.length>=LIMIT) break;
      }
      console.error(JSON.stringify({
        phase:'official-verification',family:FAMILY,scanned:report.scanned,ready:verifiedReady.length,
        official_verified:report.official_verified,rejected:report.rejected,fetch_failed:report.fetch_failed,
      }));
    }

    for(const item of verifiedReady.slice(0,LIMIT)){
      const {row,offMatches,official,classification,patch}=item;
      try{
        const result=await applyOne(db,row,official,classification.shape,patch,{expectedFilterType:FAMILY});
        report.repaired++;
        report.details.push({
          sku:row.sku,state:EXECUTE?'REPAIRED':'DRY_RUN_VALIDATED',
          source:row.canonical_source_code,shape:classification.shape,overwritten_by:offMatches,
          official_url:official.url,official_sha256:official.sha256,official_values:official.values,
          transaction:result.transaction,gateway_scope:result.gateway.scope,
        });
        console.error(JSON.stringify({phase:'transaction',family:FAMILY,sku:row.sku,state:EXECUTE?'REPAIRED':'DRY_RUN_VALIDATED',repaired:report.repaired,target:LIMIT}));
      }catch(error){
        report.rejected++;
        report.details.push({sku:row.sku,state:'WRITE_GUARD_REJECTED',reason:error.message,official_url:official.url});
      }
    }

    const output=JSON.stringify(report,null,2);
    if(OUT_FILE){
      fs.mkdirSync(path.dirname(OUT_FILE),{recursive:true});
      fs.writeFileSync(OUT_FILE,output+'\n','utf8');
    }
    console.log(output);
  }finally{
    await db.end();
  }
}

if(require.main===module){
  main().catch(error=>{console.error(error.stack||error);process.exit(1);});
}

module.exports={officialFamilyMatches,classifyLiquid,validateLiquidGeometry,buildLiquidPatch,patchDiffers};
