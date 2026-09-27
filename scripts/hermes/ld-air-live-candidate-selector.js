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
async function enrichOfficial(candidate,patchMap){
 const code=candidate.identity?.canonical_part_number||candidate.codigo_base;
 const exact=(patchMap.get(candidate.sku)||[]).find(x=>norm(x.mann_source)===norm(code));
 if(!exact)return {...candidate,official:{status:'MANN_PATCH_MISSING',geometry_ok:false,url_ok:false},lane:'REVERIFY'};
 const geometry_complete=hasNum(candidate.specs?.outer_diameter_mm)&&hasNum(candidate.specs?.height_mm)&&hasNum(exact.outer_diameter_mm)&&hasNum(exact.height_mm);
 const geometry_ok=geometry_complete&&close(candidate.specs.outer_diameter_mm,exact.outer_diameter_mm)&&close(candidate.specs.height_mm,exact.height_mm);
 const sourceCode=norm(exact.mann_source),family_ok=sourceCode.startsWith('C')&&!sourceCode.startsWith('CU');
 const sourceSlug=String(exact.mann_source||'').toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9/]/g,'');
 const source_url='https://www.mann-filter.com/en/catalog/search-results/product.html/'+sourceSlug+'_mann-filter.html';
 let http=0,url_ok=false;
 if(geometry_ok){try{const res=await fetch(source_url,{redirect:'follow',signal:AbortSignal.timeout(5000)});http=res.status;url_ok=res.ok}catch(_){}}
 const official={status:'MANN_PATCH_EXACT',mann_source:exact.mann_source,a_mm:exact.outer_diameter_mm,h_mm:exact.height_mm,geometry_complete,geometry_ok,family_ok,source_url,http,url_ok};
 return {...candidate,official,lane:laneFor({...candidate,official})};
}
function laneFor(candidate){
 const reasons=candidate.reasons||[],official=candidate.official||{},identity=candidate.identity||{},gov=candidate.governance||{};
 const code=norm(candidate.codigo_base),core_ok=reasons.includes('ACTIVE_IDENTITY')&&reasons.includes('GOVERNANCE_VERIFIED')
  &&identity.origin_group==='EUROPEAN'&&identity.canonical_brand==='MANN-FILTER'&&norm(identity.canonical_part_number)===code
  &&gov.primary_manufacturer_verified===true&&gov.approved_manufacturer==='MANN-FILTER'&&norm(gov.approved_codigo_base)===code;
 if(!core_ok) return 'REVERIFY';
 if(reasons.includes('HEAVY_SEGMENT_SIGNAL')||reasons.includes('CONTAMINATION_FLAG')) return 'BLOCKED';
 if(official.status==='MANN_PATCH_EXACT'&&official.family_ok===false) return 'BLOCKED';
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
  const ranked=q.rows.map(row=>{
    const identity=idMap.get(row.sku)||null;
    const s=score(row,identity);
    return {sku:row.sku,codigo_base:row.codigo_base,score:s.score,reasons:s.reasons,identity:identity?{origin_group:identity.origin_group,canonical_brand:identity.canonical_brand,canonical_part_number:identity.canonical_part_number,evidence_source:identity.evidence_source}:null,governance:row.enrichment_data?.codigo_base_governance||null,authority_refs:s.refs,makes:s.makes,specs:{height_mm:row.height_mm,outer_diameter_mm:row.outer_diameter_mm,inner_diameter_mm:row.inner_diameter_mm,product_length_mm:row.product_length_mm}};
  }).sort((a,b)=>b.score-a.score||a.sku.localeCompare(b.sku));
  const patchMap=loadMannPatch();
  const poolLimit=Math.min(ranked.length,BATCH_LIMIT*4),selected=ranked.slice(0,poolLimit),enriched=[];
  for(let i=0;i<selected.length;i+=10)enriched.push(...await Promise.all(selected.slice(i,i+10).map(x=>enrichOfficial(x,patchMap))));
  const lanePriority={AUTO_CLOSE:0,REVERIFY:1,BLOCKED:2};
  enriched.sort((a,b)=>lanePriority[a.lane]-lanePriority[b.lane]||b.score-a.score||a.sku.localeCompare(b.sku));
  const batch=enriched.slice(0,BATCH_LIMIT);
  const lanes={AUTO_CLOSE:batch.filter(x=>x.lane==='AUTO_CLOSE'),REVERIFY:batch.filter(x=>x.lane==='REVERIFY'),BLOCKED:batch.filter(x=>x.lane==='BLOCKED')};
  const outPath=path.join(DIR,'ld_air_live_candidates_current.json');
  const payload={selection_model:'LD_AIR_LIVE_PRIORITY_V2_BATCH_LANES',generated_at:new Date().toISOString(),eligible_count:ranked.length,batch_limit:BATCH_LIMIT,summary:{selected:batch.length,auto_close:lanes.AUTO_CLOSE.length,reverify:lanes.REVERIFY.length,blocked:lanes.BLOCKED.length},lanes,candidates:batch};
  fs.writeFileSync(outPath,JSON.stringify(payload,null,2)+'\n');
  console.log(JSON.stringify({eligible_count:ranked.length,batch_limit:BATCH_LIMIT,summary:payload.summary,preview:batch.slice(0,10),output:outPath},null,2));
 } finally {await db.end();}
}
if(require.main===module)main().catch(e=>{console.error(e.stack||e.message);process.exit(1)});
module.exports={score,terminalSkus};