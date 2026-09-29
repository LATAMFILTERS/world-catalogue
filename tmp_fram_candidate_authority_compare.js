'use strict';
const fs=require('fs'),path=require('path'),{Client}=require('pg');
const ROOT='C:/Users/ELIMSERVER/world-catalogue';
const GAPDIR=path.join(ROOT,'elimfilters-vault/91-private-evidence/fram-ld-gap-analysis');
const latest=fs.readdirSync(GAPDIR).filter(x=>/^fram-ld-gap-2026.*\.json$/.test(x)).map(x=>path.join(GAPDIR,x)).sort((a,b)=>fs.statSync(b).mtimeMs-fs.statSync(a).mtimeMs)[0];
const R=JSON.parse(fs.readFileSync(latest,'utf8'));
const rows=R.results.filter(r=>r.status==='INSUFFICIENT_EXISTING');
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const appKey=x=>[norm(x.make),norm(x.model),String(x.year||'').trim(),norm(x.engine)].join('|');
const refKey=x=>[norm(x.manufacturer),norm(x.part_number)].join('|');
function detail(r){const j=JSON.parse(fs.readFileSync(r.file,'utf8')),p=j.public_catalog_proposal||{};return{r,j,p,spec:p.technical_specifications||{},apps:new Set((p.vehicle_application_candidates||[]).map(appKey)),refs:new Set([...(p.competitor_cross_reference_candidates||[]),...(p.oem_cross_reference_candidates||[])].map(refKey))};}
const dByAuth=new Map(R.results.map(r=>[norm(r.authority),r]).filter(([,r])=>r.file&&fs.existsSync(r.file)).map(([k,r])=>[k,detail(r)]));
async function main(){
 const c=new Client({connectionString:process.env.CATALOG_DATABASE_URL,ssl:{rejectUnauthorized:false}});await c.connect();
 const skus=[...new Set(rows.flatMap(r=>r.candidates.map(x=>x.sku)))];
 const ids=(await c.query(`SELECT elimfilters_sku,canonical_brand,canonical_part_number FROM ld_catalog.ld_canonical_product_identity WHERE status='ACTIVE' AND elimfilters_sku=ANY($1::text[])`,[skus])).rows;
 const idMap=new Map(ids.map(x=>[x.elimfilters_sku,x]));
 const out=[]; for(const r of rows){const src=dByAuth.get(norm(r.authority));if(!src)continue;const cand=[];
  for(const ca of r.candidates){const id=idMap.get(ca.sku);const t=id&&norm(id.canonical_brand)==='FRAM'?dByAuth.get(norm(id.canonical_part_number)):null;
   let specComparable=0,specMatches=0,specConflicts=0,appInter=0,refInter=0;
   const fields=['height_mm','outer_diameter_mm','gasket_od_mm','gasket_id_mm'];
   if(t){for(const k of fields){const a=num(src.spec[k]),b=num(t.spec[k]);if(a==null||b==null)continue;specComparable++;if(Math.abs(a-b)<=0.6)specMatches++;else specConflicts++;}
    for(const k of ['thread_size','media_type','style']){const a=src.spec[k],b=t.spec[k];if(!a||!b)continue;specComparable++;if(norm(a)===norm(b))specMatches++;else specConflicts++;}
    for(const x of src.apps)if(t.apps.has(x))appInter++;for(const x of src.refs)if(t.refs.has(x))refInter++;}
   cand.push({...ca,targetCanonical:id?`${id.canonical_brand}:${id.canonical_part_number}`:null,targetHarvestFound:!!t,specComparable,specMatches,specConflicts,sourceApps:src.apps.size,targetApps:t?t.apps.size:0,appIntersection:appInter,sourceRefs:src.refs.size,targetRefs:t?t.refs.size:0,refIntersection:refInter});}
  out.push({authority:r.authority,family:r.family,candidates:cand});
 }
 const strong=[];for(const r of out){const good=r.candidates.filter(x=>x.targetHarvestFound&&x.specComparable>=3&&x.specConflicts===0&&x.specMatches===x.specComparable&&(x.refIntersection>=1||x.appIntersection>=2));if(good.length===1)strong.push({...r,resolvedSku:good[0].sku,evidence:good[0]});}
 console.log(JSON.stringify({gap:latest,total:out.length,strong:strong.length,strongItems:strong},null,2));
 fs.writeFileSync(path.join(ROOT,'tmp_fram_candidate_authority_compare.json'),JSON.stringify({all:out,strong},null,2));await c.end();
}
main().catch(e=>{console.error(e);process.exit(1)});
