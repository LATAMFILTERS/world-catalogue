'use strict';
const fs=require('fs'),path=require('path');
const {Client}=require('pg');
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const DIR=path.resolve(__dirname,'../candidates');
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
function score(row,identity){
 const gov=row.enrichment_data?.codigo_base_governance||{};
 const refs=authorityRefs(row);
 const makes=[...new Set((row.vehicle_applications||[]).map(a=>String(a.make||'').trim()).filter(Boolean))];
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
  const top=ranked.slice(0,5);
  const outPath=path.join(DIR,'ld_air_b10_live_candidates_20260925.json');
  fs.writeFileSync(outPath,JSON.stringify({selection_model:'LD_AIR_LIVE_PRIORITY_V1',generated_at:new Date().toISOString(),eligible_count:ranked.length,candidates:top},null,2)+'\n');
  console.log(JSON.stringify({eligible_count:ranked.length,top10:ranked.slice(0,10),output:outPath},null,2));
 } finally {await db.end();}
}
if(require.main===module)main().catch(e=>{console.error(e.stack||e.message);process.exit(1)});
module.exports={score,terminalSkus};