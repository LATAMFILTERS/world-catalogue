'use strict';
const fs=require('fs'),path=require('path');
const {Client}=require('pg');
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const DIR=path.resolve(__dirname,'../candidates');
const rawLimit=Number(process.argv.find(x=>x.startsWith('--limit='))?.split('=')[1]||50);
const BATCH_LIMIT=Math.max(20,Math.min(50,Number.isFinite(rawLimit)?Math.trunc(rawLimit):50));
const MANN_PATCH=path.resolve(__dirname,'../mann_specs_patch.jsonl');
const hasNum=v=>v!==null&&v!==undefined&&String(v).trim()!==''&&Number.isFinite(Number(v));
const close=(a,b,tol=1.5)=>hasNum(a)&&hasNum(b)&&Math.abs(Number(a)-Number(b))<=tol;
function loadMannPatch(){
 const map=new Map();
 if(!fs.existsSync(MANN_PATCH)) return map;
 for(const line of fs.readFileSync(MANN_PATCH,'utf8').split(String.fromCharCode(10))){
  if(!line.trim()) continue;
  let x;try{x=JSON.parse(line)}catch{continue}
  const sku=String(x.sku||'').toUpperCase();if(!sku)continue;
  if(!map.has(sku))map.set(sku,[]);map.get(sku).push(x);
 }
 return map;
}
function terminalSkus(){
 const out=new Set();
 for(const f of fs.readdirSync(DIR)){
  if(!/^ld_air_.*\.json$/.test(f)) continue;
  let j; try{j=JSON.parse(fs.readFileSync(path.join(DIR,f),'utf8'));}catch{continue}
  const rows=Array.isArray(j)?j:(Array.isArray(j.candidates)?j.candidates:[j]);
  for(const x of rows) if(x?.sku&&(x.terminal_state||x.reason)) out.add(x.sku);
 }
 return out;
}
function refsFor(row){
 return [...(row.oem_codes||[]),...(row.competitor_codes||[])];
}
function authorityRefs(row){
 return refsFor(row).filter(x=>['MANN','MANNFILTER','MANNHUMMEL','FRAM'].includes(norm(x.manufacturer||x.brand)));
}
function prepareOfficialLocal(candidate,patchMap){
 const code=candidate.identity?.canonical_part_number||candidate.codigo_base;
 const exact=(patchMap.get(candidate.sku)||[]).find(x=>norm(x.mann_source)===norm(code));
 if(!exact)return {...candidate,official:{status:'MANN_PATCH_MISSING',geometry_complete:false,geometry_ok:false,shared_conflict:false,url_ok:false}};
 const catalog=candidate.specs||{};
 const odShared=hasNum(catalog.outer_diameter_mm)&&hasNum(exact.outer_diameter_mm);
 const hShared=hasNum(catalog.height_mm)&&hasNum(exact.height_mm);
 const shared_conflict=(odShared&&!close(catalog.outer_diameter_mm,exact.outer_diameter_mm))||(hShared&&!close(catalog.height_mm,exact.height_mm));
 const geometry_complete=hasNum(catalog.outer_diameter_mm)&&hasNum(catalog.height_mm)&&hasNum(exact.outer_diameter_mm)&&hasNum(exact.height_mm);
 const geometry_ok=geometry_complete&&!shared_conflict&&close(catalog.outer_diameter_mm,exact.outer_diameter_mm)&&close(catalog.height_mm,exact.height_mm);
 const sourceCode=norm(exact.mann_source),family_ok=sourceCode.startsWith('C')&&!sourceCode.startsWith('CU');
 const sourceSlug=String(exact.mann_source||'').toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9/]/g,'');
 const source_url='https://www.mann-filter.com/en/catalog/search-results/product.html/'+sourceSlug+'_mann-filter.html';
 const official={status:'MANN_PATCH_EXACT',mann_source:exact.mann_source,installation_type:exact.installation_type||null,patch_outer_mm:exact.outer_diameter_mm,patch_secondary_mm:exact.gasket_od_mm,a_mm:exact.outer_diameter_mm,h_mm:exact.height_mm,geometry_complete,geometry_ok,shared_conflict,family_ok,source_url,http:0,url_ok:false};
 return {...candidate,official};
}
function numText(v){if(v==null)return null;const n=Number(String(v).replace(',','.'));return Number.isFinite(n)?n:null}
function parseLiveMannDimensions(html){
 const grab=(...patterns)=>{for(const p of patterns){const m=html.match(p);if(m)return numText(m[1])}return null};
 const dimension_values_mm=[];
 const dimension_labels=[];
 const re=/(Length(?:\s+1)?|Width(?:\s+1)?|Inner diameter(?:\s+[12])?|Outer diameter|Diameter)\s*\(([A-D])\)\s*=\s*([0-9.,]+)\s*mm/gi;
 for(const m of html.matchAll(re)){
  const v=numText(m[3]);if(v==null)continue;
  if(!dimension_values_mm.some(x=>close(x,v,0.01)))dimension_values_mm.push(v);
  dimension_labels.push({label:`${m[1]} (${m[2]})`,value_mm:v});
 }
 return {
  a_mm:grab(/Length \(A\)\s*=\s*([0-9.,]+)\s*mm/i,/Outer diameter \(A\)\s*=\s*([0-9.,]+)\s*mm/i,/Outer diameter \(D\)\s*=\s*([0-9.,]+)\s*mm/i,/Diameter \(A\)\s*=\s*([0-9.,]+)\s*mm/i),
  b_mm:grab(/Width \(B\)\s*=\s*([0-9.,]+)\s*mm/i,/Inner diameter \(B\)\s*=\s*([0-9.,]+)\s*mm/i,/Inner diameter \(C\)\s*=\s*([0-9.,]+)\s*mm/i),
  h_mm:grab(/Height \(H\)\s*=\s*([0-9.,]+)\s*mm/i),dimension_values_mm,dimension_labels
 };
}
async function enrichOfficial(candidate){
 let http=0,url_ok=false,live={a_mm:null,b_mm:null,h_mm:null},resolvedSourceUrl=candidate.official?.source_url||null;
 const base=candidate.official||{};
 if(base.family_ok===true&&base.source_url){
  const urls=[base.source_url,...['us-en','ca-en','sg-en'].map(loc=>base.source_url.replace('/en/','/'+loc+'/'))].filter((u,i,a)=>u&&a.indexOf(u)===i);
  for(const url of urls){
   try{
    const res=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(5000)});
    http=res.status;
    if(res.ok){url_ok=true;resolvedSourceUrl=url;live=parseLiveMannDimensions(await res.text());break}
    if(res.status!==404)break;
   }catch(_){}
  }
 }
 const catalog=candidate.specs||{};
 const liveA=hasNum(live.a_mm)?Number(live.a_mm):null,liveB=hasNum(live.b_mm)?Number(live.b_mm):null;
 const liveDims=(live.dimension_values_mm||[]).filter(hasNum).map(Number);
 if(!liveDims.length){for(const v of [liveA,liveB])if(hasNum(v)&&!liveDims.some(x=>close(x,v,0.01)))liveDims.push(Number(v))}
 const baseA=hasNum(base.patch_outer_mm)?Number(base.patch_outer_mm):(hasNum(base.a_mm)?Number(base.a_mm):null);
 const baseB=hasNum(base.patch_secondary_mm)?Number(base.patch_secondary_mm):null;
 const h_mm=hasNum(live.h_mm)?Number(live.h_mm):(hasNum(base.h_mm)?Number(base.h_mm):null);
 const catalogOuter=hasNum(catalog.outer_diameter_mm)?Number(catalog.outer_diameter_mm):null;
 const catalogOuterMatchesLive=catalogOuter!=null&&liveDims.some(v=>close(catalogOuter,v));
 const patchOuterMatchesLive=baseA!=null&&liveDims.some(v=>close(baseA,v));
 const patchSecondaryMatchesLive=baseB!=null&&liveDims.some(v=>close(baseB,v));
 let schemaOuter=null;
 if(catalogOuter!=null&&catalogOuterMatchesLive)schemaOuter=catalogOuter;
 else if(catalogOuter==null&&patchOuterMatchesLive)schemaOuter=baseA;
 else if(catalogOuter==null&&patchSecondaryMatchesLive)schemaOuter=baseB;
 else if(catalogOuter==null&&liveA!=null)schemaOuter=liveA;
 else if(catalogOuter==null&&liveDims.length)schemaOuter=liveDims[0];
 else if(!url_ok&&baseA!=null)schemaOuter=baseA;
 const odConflict=url_ok&&liveDims.length>0&&catalogOuter!=null&&!catalogOuterMatchesLive;
 const hConflict=hasNum(catalog.height_mm)&&hasNum(h_mm)&&!close(catalog.height_mm,h_mm);
 const shared_conflict=(url_ok?(odConflict||hConflict):base.shared_conflict===true||hConflict);
 const geometry_patch={};
 if(!shared_conflict&&catalogOuter==null&&hasNum(schemaOuter))geometry_patch.outer_diameter_mm=schemaOuter;
 if(!shared_conflict&&!hasNum(catalog.height_mm)&&hasNum(h_mm))geometry_patch.height_mm=h_mm;
 const finalOuter=catalogOuter!=null?catalogOuter:geometry_patch.outer_diameter_mm;
 const finalH=hasNum(catalog.height_mm)?Number(catalog.height_mm):geometry_patch.height_mm;
 const outerOk=liveDims.length?hasNum(finalOuter)&&liveDims.some(v=>close(finalOuter,v)):close(finalOuter,schemaOuter);
 const geometry_complete=hasNum(finalOuter)&&hasNum(finalH)&&outerOk&&hasNum(h_mm);
 const geometry_ok=geometry_complete&&!shared_conflict&&outerOk&&close(finalH,h_mm);
 const official={...base,source_url:resolvedSourceUrl,a_mm:schemaOuter,b_mm:liveB,h_mm,live_dimensions:live,schema_dimension_candidates_mm:liveDims,geometry_complete,geometry_ok,shared_conflict,http,url_ok};
 const out={...candidate,official,geometry_patch:Object.keys(geometry_patch).length?geometry_patch:null};
 return {...out,lane:laneFor(out)};
}
function laneFor(candidate){
 const reasons=candidate.reasons||[],official=candidate.official||{},identity=candidate.identity||{},gov=candidate.governance||{},identityPatch=candidate.identity_patch||null;
 const code=norm(candidate.codigo_base);
 const activeIdentityOk=reasons.includes('ACTIVE_IDENTITY')&&identity.origin_group==='EUROPEAN'&&identity.canonical_brand==='MANN-FILTER'&&norm(identity.canonical_part_number)===code;
 const repairIdentityOk=!!identityPatch&&identityPatch.origin_group==='EUROPEAN'&&identityPatch.canonical_brand==='MANN-FILTER'&&norm(identityPatch.canonical_part_number)===code;
 const core_ok=reasons.includes('GOVERNANCE_VERIFIED')&&(activeIdentityOk||repairIdentityOk)
  &&gov.primary_manufacturer_verified===true&&gov.approved_manufacturer==='MANN-FILTER'&&norm(gov.approved_codigo_base)===code;
 if(!core_ok) return 'REVERIFY';
 if(reasons.includes('HEAVY_SEGMENT_SIGNAL')||reasons.includes('CONTAMINATION_FLAG')) return 'BLOCKED';
 if(official.status==='MANN_PATCH_EXACT'&&official.family_ok===false) return 'BLOCKED';
 if(official.status==='MANN_PATCH_EXACT'&&official.shared_conflict===true) return 'BLOCKED';
 if(official.status==='MANN_PATCH_EXACT'&&official.geometry_complete===false) return 'REVERIFY';
 if(official.status==='MANN_PATCH_EXACT'&&official.geometry_complete===true&&official.geometry_ok===false) return 'BLOCKED';
 if(official.status==='MANN_PATCH_EXACT'&&official.family_ok===true&&official.geometry_complete===true&&official.geometry_ok===true&&official.url_ok===true) return 'AUTO_CLOSE';
 return 'REVERIFY';
}
function score(row,identity){
 const gov=row.enrichment_data?.codigo_base_governance||{};
 const refs=authorityRefs(row);
 const apps=row.vehicle_applications||[];
 const makes=[...new Set(apps.map(a=>String(a.make||'').trim()).filter(Boolean))];
 const appBlob=apps.map(a=>JSON.stringify(a)).join(' ').toUpperCase();
 const heavyPattern=/(ACTROS|AXOR|TRUCK|BUS|TRACTOR|CATERPILLAR|KOMATSU|JOHN DEERE|JCB|NEW HOLLAND|CASE-IH|LIEBHERR|VOLVO TRUCKS|SCANIA|KENWORTH|PETERBILT|FREIGHTLINER|MACK|SETRA|NEOPLAN|MAN BUS|RENAULT TRUCKS|AGCO|VALTRA|BOBCAT|KOBELCO|MANITOU)/;
 let score=0;const reasons=[];
 if(identity?.status==='ACTIVE'){score+=40;reasons.push('ACTIVE_IDENTITY')}
 if(gov.state==='CANONICAL_VERIFIED'&&gov.primary_manufacturer_verified===true){score+=25;reasons.push('GOVERNANCE_VERIFIED')}
 const geometry=[row.height_mm,row.outer_diameter_mm,row.inner_diameter_mm,row.product_length_mm].filter(v=>v!==null&&v!==undefined&&String(v)!=='').length;
 if(geometry>=2){score+=8;reasons.push('GEOMETRY_USABLE')} else if(geometry===1){score+=3}
 if(makes.length===1){score+=12;reasons.push('HOMOGENEOUS_MAKE')} else if(makes.length<=3){score+=5}
 const identityBrand=norm(identity?.canonical_brand||gov.approved_manufacturer);
 const identityCode=norm(identity?.canonical_part_number||gov.approved_codigo_base||row.codigo_base);
 const traceableCanonical=refs.some(x=>norm(x.manufacturer||x.brand)===identityBrand&&norm(x.code||x.part_number||x.reference)===identityCode);
 if(traceableCanonical){score+=15;reasons.push('TRACEABLE_CANONICAL_AUTHORITY_REF')}
 else if(identity?.status==='ACTIVE'&&gov.state==='CANONICAL_VERIFIED'){score-=5;reasons.push('OFFICIAL_REVERIFY_REQUIRED')}
 if(heavyPattern.test(appBlob)){score-=70;reasons.push('HEAVY_SEGMENT_SIGNAL')}
 if((gov.contamination_flags||[]).length){score-=30;reasons.push('CONTAMINATION_FLAG')}
 if((row.competitor_codes||[]).length>40){score-=15;reasons.push('HIGH_REF_CARDINALITY')}
 return {score,reasons,makes,refs};
}
async function main(){
 const db=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:false});await db.connect();
 try{
  const terms=[...terminalSkus()];
  const q=await db.query("select * from public.elimfilters_catalog where duty='LIGHT_DUTY' and filter_type='air' and catalog_active=true and coalesce(canonical_source_status,'')<>'VERIFIED' and not (sku=any($1::text[]))",[terms]);
  const ids=await db.query("select * from ld_catalog.ld_canonical_product_identity where status='ACTIVE' and filter_type='air'");
  const idMap=new Map(ids.rows.map(x=>[x.elimfilters_sku,x]));
  const codeOwners=new Map();
  for(const x of ids.rows){const k=norm(x.canonical_part_number);if(!codeOwners.has(k))codeOwners.set(k,[]);codeOwners.get(k).push(x.elimfilters_sku)}
  const ranked=q.rows.map(row=>{
    const identity=idMap.get(row.sku)||null;
    const s=score(row,identity);
    return {sku:row.sku,codigo_base:row.codigo_base,score:s.score,reasons:s.reasons,identity:identity?{origin_group:identity.origin_group,canonical_brand:identity.canonical_brand,canonical_part_number:identity.canonical_part_number,evidence_source:identity.evidence_source}:null,governance:row.enrichment_data?.codigo_base_governance||null,authority_refs:s.refs,makes:s.makes,specs:{height_mm:row.height_mm,outer_diameter_mm:row.outer_diameter_mm,inner_diameter_mm:row.inner_diameter_mm,product_length_mm:row.product_length_mm}};
  }).sort((a,b)=>b.score-a.score||a.sku.localeCompare(b.sku));
  const patchMap=loadMannPatch();
  const prepared=ranked.map(x=>{
   const p=prepareOfficialLocal(x,patchMap),g=x.governance||{},owners=codeOwners.get(norm(x.codigo_base))||[];
   const identity_patch=!x.identity&&owners.length===0&&g.state==='CANONICAL_VERIFIED'&&g.primary_manufacturer_verified===true&&g.approved_manufacturer==='MANN-FILTER'&&norm(g.approved_codigo_base)===norm(x.codigo_base)
    ?{origin_group:'EUROPEAN',canonical_brand:'MANN-FILTER',canonical_part_number:x.codigo_base,filter_type:'air',status:'ACTIVE',evidence_source:'LD_AIR_LIVE_IDENTITY_REPAIR'}:null;
   return {...p,identity_patch};
  });
  const localReady=prepared.filter(x=>{
   const o=x.official||{};
   const r=x.reasons||[];
   return o.status==='MANN_PATCH_EXACT'&&o.family_ok===true&&o.shared_conflict!==true
    &&!r.includes('HEAVY_SEGMENT_SIGNAL')&&!r.includes('CONTAMINATION_FLAG');
  });
  const verifyPool=localReady.slice(0,Math.min(localReady.length,BATCH_LIMIT*3)),verified=[];
  for(let i=0;i<verifyPool.length;i+=20)verified.push(...await Promise.all(verifyPool.slice(i,i+20).map(enrichOfficial)));
  const verifiedMap=new Map(verified.map(x=>[x.sku,x]));
  const classified=prepared.map(x=>verifiedMap.get(x.sku)||({...x,lane:laneFor(x)}));
  const lanePriority={AUTO_CLOSE:0,REVERIFY:1,BLOCKED:2};
  classified.sort((a,b)=>lanePriority[a.lane]-lanePriority[b.lane]||b.score-a.score||a.sku.localeCompare(b.sku));
  const batch=classified.slice(0,BATCH_LIMIT);
  const lanes={AUTO_CLOSE:batch.filter(x=>x.lane==='AUTO_CLOSE'),REVERIFY:batch.filter(x=>x.lane==='REVERIFY'),BLOCKED:batch.filter(x=>x.lane==='BLOCKED')};
  const outPath=path.join(DIR,'ld_air_live_candidates_current.json');
  const payload={selection_model:'LD_AIR_LIVE_PRIORITY_V2_BATCH_LANES',generated_at:new Date().toISOString(),eligible_count:ranked.length,batch_limit:BATCH_LIMIT,summary:{selected:batch.length,auto_close:lanes.AUTO_CLOSE.length,reverify:lanes.REVERIFY.length,blocked:lanes.BLOCKED.length},lanes,candidates:batch};
  fs.writeFileSync(outPath,JSON.stringify(payload,null,2)+'\n');
  console.log(JSON.stringify({eligible_count:ranked.length,batch_limit:BATCH_LIMIT,summary:payload.summary,preview:batch.slice(0,10),output:outPath},null,2));
 } finally {await db.end();}
}
if(require.main===module)main().catch(e=>{console.error(e.stack||e.message);process.exit(1)});
module.exports={score,terminalSkus};