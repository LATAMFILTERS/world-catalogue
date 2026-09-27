'use strict';
const fs=require('fs'),path=require('path');
const {Client}=require('pg');
const DIR=path.resolve(__dirname,'../candidates');
const SCAN=path.join(DIR,'ld_air_fram_ca_official_scan_current.json');
const OUT=path.join(DIR,'ld_air_live_candidates_current.json');
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const has=v=>v!==null&&v!==undefined&&String(v).trim()!==''&&Number.isFinite(Number(v));
const close=(a,b,t=3)=>has(a)&&has(b)&&Math.abs(Number(a)-Number(b))<=t;
const heavy=/(ACTROS|AXOR|TRUCK|BUS|TRACTOR|CATERPILLAR|KOMATSU|JOHN DEERE|JCB|NEW HOLLAND|CASE-IH|LIEBHERR|VOLVO TRUCKS|SCANIA|KENWORTH|PETERBILT|FREIGHTLINER|MACK|SETRA|NEOPLAN|MAN BUS|RENAULT TRUCKS|AGCO|VALTRA|BOBCAT|KOBELCO|MANITOU|CONSTRUCTION EQUIPMENT|CLAAS|DEUTZ|BOMAG)/;
const rawLimit=Number(process.argv.find(x=>x.startsWith('--limit='))?.split('=')[1]||50);
const LIMIT=Math.max(20,Math.min(50,Number.isFinite(rawLimit)?Math.trunc(rawLimit):50));
function terminalSkus(){const out=new Set();for(const f of fs.readdirSync(DIR)){if(!/^ld_air_.*\.json$/.test(f))continue;let j;try{j=JSON.parse(fs.readFileSync(path.join(DIR,f),'utf8'))}catch{continue}const rows=Array.isArray(j)?j:(Array.isArray(j.candidates)?j.candidates:[j]);for(const x of rows)if(x?.sku&&(x.terminal_state||x.reason))out.add(String(x.sku).toUpperCase())}return out}
(async()=>{
 if(!fs.existsSync(SCAN))throw new Error('FRAM_SCAN_MISSING');
 const scan=JSON.parse(fs.readFileSync(SCAN,'utf8')),scanMap=new Map((scan.results||[]).map(x=>[String(x.sku).toUpperCase(),x]));
 const db=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:false});await db.connect();
 try{
  const terms=[...terminalSkus()];
  const rows=(await db.query(`select * from public.elimfilters_catalog where duty='LIGHT_DUTY' and filter_type='air' and catalog_active=true and coalesce(canonical_source_status,'')<>'VERIFIED' and enrichment_data->'codigo_base_governance'->>'approved_manufacturer'='FRAM' and enrichment_data->'codigo_base_governance'->>'primary_manufacturer_verified'='true' and not (sku=any($1::text[]))`,[terms])).rows;
  const ids=(await db.query(`select * from ld_catalog.ld_canonical_product_identity where status='ACTIVE' and filter_type='air'`)).rows;
  const idMap=new Map(ids.map(x=>[x.elimfilters_sku,x])),owners=new Map();
  for(const x of ids){const k=norm(x.canonical_part_number);if(!owners.has(k))owners.set(k,[]);owners.get(k).push(x.elimfilters_sku)}
  const classified=[];
  for(const row of rows){
   const gov=row.enrichment_data?.codigo_base_governance||{},code=String(row.codigo_base||''),scanRow=scanMap.get(String(row.sku).toUpperCase())||null;
   const identity=idMap.get(row.sku)||null,collisionOwners=(owners.get(norm(code))||[]).filter(s=>s!==row.sku);
   const makes=[...new Set((row.vehicle_applications||[]).map(a=>String(a.make||'').trim()).filter(Boolean))];
   const heavySignal=heavy.test(makes.join(' ').toUpperCase());
   const found=scanRow?.status==='OFFICIAL_FOUND';
   const L=found&&has(scanRow.length_mm)?Number(scanRow.length_mm):null,W=found&&has(scanRow.width_mm)?Number(scanRow.width_mm):null,H=found&&has(scanRow.height_mm)?Number(scanRow.height_mm):null;
   const outer=has(row.outer_diameter_mm)?Number(row.outer_diameter_mm):null,h=has(row.height_mm)?Number(row.height_mm):null;
   const outerMatch=outer==null||(L!=null&&close(outer,L))||(W!=null&&close(outer,W));
   const heightMatch=h==null||(H!=null&&close(h,H));
   const geometryComplete=L!=null&&H!=null,geometryOk=geometryComplete&&outerMatch&&heightMatch;
   const gp={}; if(geometryOk&&outer==null)gp.outer_diameter_mm=L;if(geometryOk&&h==null)gp.height_mm=H;
   const identityOk=!!identity&&identity.origin_group==='NON_EUROPEAN'&&identity.canonical_brand==='FRAM'&&norm(identity.canonical_part_number)===norm(code);
   const identityPatch=!identity&&!collisionOwners.length?{origin_group:'NON_EUROPEAN',canonical_brand:'FRAM',canonical_part_number:code,filter_type:'air',status:'ACTIVE',evidence_source:'LD_AIR_FRAM_OFFICIAL_IDENTITY'}:null;
   let lane='REVERIFY',reason='FRAM_OFFICIAL_REVERIFY_REQUIRED';
   if(collisionOwners.length){lane='BLOCKED';reason='CANONICAL_CODE_COLLISION_NORMALIZED'}
   else if(heavySignal){lane='BLOCKED';reason='HEAVY_SEGMENT_SIGNAL_OUT_OF_LD_SCOPE'}
   else if(found&&!geometryOk){lane='BLOCKED';reason='OFFICIAL_FRAM_GEOMETRY_CONFLICT'}
   else if(found&&geometryOk&&(identityOk||identityPatch)&&gov.origin_group==='NON_EUROPEAN'&&gov.primary_manufacturer_verified===true&&gov.approved_manufacturer==='FRAM'&&norm(gov.approved_codigo_base)===norm(code)){lane='AUTO_CLOSE';reason=null}
   else if(!/^CA[0-9]/i.test(code)){reason='NONSTANDARD_FRAM_AIR_CODE_REVIEW'}
   else if(!found){reason='OFFICIAL_FRAM_PAGE_NOT_FOUND'}
   classified.push({sku:row.sku,codigo_base:code,authority_brand:'FRAM',origin_group:'NON_EUROPEAN',identity:identity?{origin_group:identity.origin_group,canonical_brand:identity.canonical_brand,canonical_part_number:identity.canonical_part_number,evidence_source:identity.evidence_source}:null,identity_patch:identityPatch,identity_collision_owners:collisionOwners,governance:gov,makes,specs:{height_mm:row.height_mm,outer_diameter_mm:row.outer_diameter_mm,inner_diameter_mm:row.inner_diameter_mm,product_length_mm:row.product_length_mm},official:{status:found?'FRAM_OFFICIAL_PAGE':'FRAM_OFFICIAL_MISSING',family_ok:found,url_ok:found,source_url:scanRow?.url||null,a_mm:L,b_mm:W,h_mm:H,geometry_complete:geometryComplete,geometry_ok:geometryOk,shared_conflict:found&&!geometryOk},geometry_patch:Object.keys(gp).length?gp:null,lane,block_reason:lane==='BLOCKED'?reason:null,reverify_reason:lane==='REVERIFY'?reason:null});
  }
  const pri={AUTO_CLOSE:0,BLOCKED:1,REVERIFY:2};classified.sort((a,b)=>pri[a.lane]-pri[b.lane]||a.sku.localeCompare(b.sku));const batch=classified.slice(0,LIMIT);
  const lanes={AUTO_CLOSE:batch.filter(x=>x.lane==='AUTO_CLOSE'),REVERIFY:batch.filter(x=>x.lane==='REVERIFY'),BLOCKED:batch.filter(x=>x.lane==='BLOCKED')};
  const payload={selection_model:'LD_AIR_FRAM_OFFICIAL_V1',generated_at:new Date().toISOString(),authority:'FRAM',eligible_count:classified.length,batch_limit:LIMIT,summary:{selected:batch.length,auto_close:lanes.AUTO_CLOSE.length,reverify:lanes.REVERIFY.length,blocked:lanes.BLOCKED.length},lanes,candidates:batch};
  fs.writeFileSync(OUT,JSON.stringify(payload,null,2)+'\n');console.log(JSON.stringify({eligible_count:classified.length,batch_limit:LIMIT,summary:payload.summary,preview:batch.slice(0,12),output:OUT},null,2));
 }finally{await db.end()}
})().catch(e=>{console.error('[ld-air-fram-live-candidate-selector]',e.stack||e.message);process.exit(1)});
