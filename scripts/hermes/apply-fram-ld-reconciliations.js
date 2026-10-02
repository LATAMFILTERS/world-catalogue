'use strict';
const fs=require('fs');
const path=require('path');
const {Client}=require('pg');

const ROOT=path.resolve(__dirname,'../..');
const EXECUTE=process.argv.includes('--execute');
const EXISTING_APPLICATION_GAPS=process.argv.includes('--existing-application-gaps');
// Application-gap repair is scoped to ld_vehicle_applications (+ readiness.has_applications).
// Competitor/OEM/specification evidence layers are never written in this mode.
const APPLICATIONS_ONLY=EXISTING_APPLICATION_GAPS;
const GAP_DIR=path.join(ROOT,'elimfilters-vault/91-private-evidence/fram-ld-gap-analysis');
const MAP_FILE=process.env.FRAM_LD_RECONCILIATION_MAP||path.join(ROOT,'elimfilters-vault/91-private-evidence/fram-ld-reconciliation-map.json');
const REPORT_DIR=path.join(ROOT,'elimfilters-vault/91-private-evidence/fram-ld-reconciliation-reports');
const FRAM_PRODUCTS_DIR=path.join(ROOT,'elimfilters-vault/91-private-evidence/fram-usa-ld-catalog/fram-usa-ld-full-20260911/products');
const TYPE={AIR:'air',CABIN:'cabin',FUEL:'fuel',LUBE:'oil'};
const SEGMENT={AIR:'Air Filter',CABIN:'Cabin Filter',FUEL:'Fuel Filter',LUBE:'Oil Filter'};
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const clean=(v,max=255)=>v==null?null:String(v).trim().slice(0,max);
const uniq=(rows,key)=>{const s=new Set();return rows.filter(r=>{const k=key(r);if(s.has(k))return false;s.add(k);return true})};
const unitFor=k=>/_mm$/.test(k)?'mm':/_in$/.test(k)?'in':/_psi$/.test(k)?'psi':null;
const applicationKey=r=>[norm(r.elimfilters_sku),norm(r.make),norm(r.model_family),norm(r.model_type),String(r.year||'').trim()].join('|');
function latestGap(){const f=fs.readdirSync(GAP_DIR).filter(x=>/^fram-ld-gap-.*\.json$/.test(x)).map(x=>path.join(GAP_DIR,x));if(!f.length)throw new Error('No gap report');return f.sort((a,b)=>fs.statSync(b).mtimeMs-fs.statSync(a).mtimeMs)[0];}
function buildPlan(entries,byAuthority){
  const comp=[],oem=[],apps=[],specs=[];
  for(const e of entries){
    const src=byAuthority.get(norm(e.authority));
    if(!src)throw new Error(`Authority missing from gap report: ${e.authority}`);
    const j=JSON.parse(fs.readFileSync(src.file,'utf8'));
    const p=j.public_catalog_proposal||{};
    const source=clean(e.authority,50);
    comp.push({sku:e.sku,source,brand:'FRAM',part:source,direct:true});
    for(const code of p.alternatives||[])comp.push({sku:e.sku,source,brand:'FRAM',part:clean(code),direct:false});
    for(const x of p.competitor_cross_reference_candidates||[])comp.push({sku:e.sku,source,brand:clean(x.manufacturer),part:clean(x.part_number),direct:false});
    for(const x of p.oem_cross_reference_candidates||[])oem.push({sku:e.sku,source,brand:clean(x.manufacturer),part:clean(x.part_number)});
    for(const x of p.vehicle_application_candidates||[])apps.push({sku:e.sku,source,make:clean(x.make),model:clean(x.model),year:clean(x.year,50),engine:clean(x.engine),origin:'FRAM_LD_MULTI_REGION'});
    for(const [k,v] of Object.entries(p.technical_specifications||{}))if(v!=null&&v!=='')specs.push({sku:e.sku,source,key:clean(k),value:clean(v),unit:unitFor(k)});
  }
  return {comp:uniq(comp,x=>[x.sku,norm(x.brand),norm(x.part)].join('|')),oem:uniq(oem,x=>[x.sku,norm(x.brand),norm(x.part)].join('|')),apps:uniq(apps,x=>[x.sku,norm(x.make),norm(x.model),x.year||'',norm(x.engine)].join('|')),specs:uniq(specs,x=>[x.sku,x.key].join('|'))};
}
// Applications-only eligibility: the FRAM authority must already be owned directly and
// uniquely by the target in ld_competitor_cross_references, and no other SKU may claim it
// in the public FRAM cross-references. Anything else is held per entry, never reassigned.
function partitionByDirectOwnership(entries,ldOwners,publicOwners){
  const eligible=[],held=[];
  for(const e of entries){
    const k=norm(e.authority),ld=[...(ldOwners.get(k)||[])];
    const conflicting=[...new Set([...ld,...(publicOwners.get(k)||[])])].filter(s=>s!==e.sku).sort();
    if(ld.length===1&&ld[0]===e.sku&&!conflicting.length)eligible.push(e);
    else held.push({authority:e.authority,sku:e.sku,family:e.family,class:'HOLD_IDENTITY',reason:'AUTHORITY_NOT_DIRECTLY_OWNED',conflicting_owners:conflicting});
  }
  return {eligible,held};
}
const toAppRow=x=>({elimfilters_sku:x.sku,source_sku:x.source,make:x.make,model_family:x.model,model_type:x.engine||'',year:x.year,engine_code:x.engine||null,ccm:null,kw:null,hp:null,source_origin:x.origin});
// Year ranges: FRAM "09-05" (2005-2009), "2013", MANN "01/05 → 12/10" or open "01/05 →".
const yy=t=>{const n=+t;return t.length===4?n:(n>40?1900+n:2000+n)};
function yearRange(s){
  s=String(s||'').trim();let m;
  if((m=s.match(/^(\d{2}|\d{4})\s*-\s*(\d{2}|\d{4})$/))){const a=yy(m[1]),b=yy(m[2]);return [Math.min(a,b),Math.max(a,b)]}
  if((m=s.match(/^(\d{2}|\d{4})$/))){const a=yy(m[1]);return [a,a]}
  const mm=[...s.matchAll(/\d{1,2}\/(\d{2,4})/g)].map(x=>yy(x[1]));
  if(mm.length)return [Math.min(...mm),/(→|->)\s*$/.test(s)?new Date().getUTCFullYear():Math.max(...mm)];
  const four=[...s.matchAll(/\b(?:19|20)\d{2}\b/g)].map(x=>+x[0]);
  if(four.length)return [Math.min(...four),/(→|->|\+)\s*$/.test(s)&&four.length===1?new Date().getUTCFullYear():Math.max(...four)];
  return null;
}
// Displacement precedence: engine_code text (e.g. L4-1.8L) > ccm > model_type text as a fallback.
// The model_type fallback only accepts exactly one clear d.d value in a plausible range; opaque
// engine codes (LAX, 2AZ-FE) are never decoded.
const displacementFromText=t=>{const v=[...new Set([...String(t||'').matchAll(/(?<![\d.])(\d\.\d)(?![\d.])/g)].map(m=>(+m[1]).toFixed(1)).filter(x=>+x>=0.6&&+x<=8.5))];return v.length===1?v[0]:null};
const displacement=(engine,ccm,modelType)=>{const m=String(engine||'').match(/(\d{1,2}\.\d)\s*L?/i);if(m)return (+m[1]).toFixed(1);const c=parseInt(ccm,10);if(c>=500&&c<=20000)return (Math.round(c/100)/10).toFixed(1);return displacementFromText(modelType)};
const allEngines=e=>/^ALL$/i.test(String(e||'').trim());
// A proposed row collides when another SKU of the same filter type already owns the same
// make/model with overlapping years and the same engine (exact key or same displacement).
// ponytail: displacement is the engine proxy; anything not comparable (ALL engines, unparsed
// years/engines) is AMBIGUOUS and held rather than guessed. Engine-code alias tables would refine it.
// Optional multiFit(row,peer) exempts proven FRAM multi-fit peers (see isLegitimateFramMultiFit).
function classifyApplicationCollision(row,targetType,peers,multiFit){
  const ry=yearRange(row.year),rd=displacement(row.engine_code,null,row.model_type);let ambiguous=false,multi=false;
  for(const o of peers){
    if(o.sku===row.elimfilters_sku||o.filter_type!==targetType||norm(o.make)!==norm(row.make)||norm(o.model_family)!==norm(row.model_family))continue;
    const exact=norm(o.model_type)===norm(row.model_type)&&String(o.year||'').trim()===String(row.year||'').trim()&&norm(o.engine_code)===norm(row.engine_code);
    const oy=yearRange(o.year);
    if(!exact&&ry&&oy&&(ry[0]>oy[1]||oy[0]>ry[1]))continue;
    const od=displacement(o.engine_code,o.ccm,o.model_type);
    let verdict='HOLD_AMBIGUOUS_APPLICATION';
    if(exact)verdict='HOLD_COLLISION';
    else if(ry&&oy&&!allEngines(row.engine_code)&&!allEngines(o.engine_code)&&rd&&od)verdict=rd===od?'HOLD_COLLISION':null;
    if(!verdict)continue;
    if(multiFit&&multiFit(row,o)){multi=true;continue;}
    if(verdict==='HOLD_COLLISION')return verdict;
    ambiguous=true;
  }
  return ambiguous?'HOLD_AMBIGUOUS_APPLICATION':multi?'LEGITIMATE_MULTI_FIT':null;
}
// Two FRAM-sourced applications for the same vehicle are a legitimate multi-fit only when every
// condition holds; anything else falls back to normal collision logic (fail closed).
const FRAM_ORIGIN='FRAM_LD_MULTI_REGION';
const fitKey=(make,model,year,engine)=>[norm(make),norm(model),String(year||'').trim(),norm(engine)].join('|');
function isLegitimateFramMultiFit(row,peer,facts){
  if(row.source_origin!==FRAM_ORIGIN||peer.source_origin!==FRAM_ORIGIN)return false;
  const a=norm(row.source_sku),b=norm(peer.source_sku);
  if(!a||!b||a===b||row.elimfilters_sku===peer.sku)return false;
  const fa=facts.get(`${row.elimfilters_sku}|${a}`),fb=facts.get(`${peer.sku}|${b}`);
  if(!fa||!fb||fa.blocked||fb.blocked)return false;
  const owns=(f,sku)=>f.ldOwners.length===1&&f.ldOwners[0]===sku&&f.publicClaimants.every(s=>s===sku);
  if(!owns(fa,row.elimfilters_sku)||!owns(fb,peer.sku))return false;
  if(!fa.fitments.has(fitKey(row.make,row.model_family,row.year,row.engine_code))||!fb.fitments.has(fitKey(peer.make,peer.model_family,peer.year,peer.engine_code)))return false;
  // Same product under two FRAM codes (e.g. G7315 / G7315DP) is a duplicate identity, not a multi-fit.
  if(fa.alternatives.has(b)||fb.alternatives.has(a))return false;
  if(fa.fitments.size===fb.fitments.size&&[...fa.fitments].every(k=>fb.fitments.has(k)))return false;
  return true;
}
async function queryPublicFramOwners(client,codes){
  return new Map((await client.query(`SELECT part,array_agg(DISTINCT sku) AS owners FROM (
      SELECT regexp_replace(upper(x),'[^A-Z0-9]','','g') AS part,c.sku FROM public.elimfilters_catalog c CROSS JOIN LATERAL jsonb_array_elements_text(CASE WHEN jsonb_typeof(c.brand_crossrefs->'FRAM')='array' THEN c.brand_crossrefs->'FRAM' ELSE '[]'::jsonb END) x
      UNION ALL
      SELECT regexp_replace(upper(e->>'code'),'[^A-Z0-9]','','g'),c.sku FROM public.elimfilters_catalog c CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(c.competitor_codes)='array' THEN c.competitor_codes ELSE '[]'::jsonb END) e WHERE jsonb_typeof(e)='object' AND upper(regexp_replace(coalesce(e->>'brand',e->>'manufacturer',''),'[^A-Za-z0-9]','','g'))='FRAM'
    ) s WHERE part=ANY($1::text[]) GROUP BY 1`,[codes])).rows.map(r=>[r.part,r.owners]));
}
// Read-only facts for isLegitimateFramMultiFit, keyed `${sku}|${AUTHORITY}`.
async function loadFramMultiFitFacts(client,pairs,fileFor){
  const auths=[...new Set(pairs.map(p=>norm(p.authority)).filter(Boolean))],skus=[...new Set(pairs.map(p=>p.sku))];
  const ld=new Map((await client.query(`SELECT ld_catalog.norm_part(competitor_part_number) AS part,array_agg(DISTINCT elimfilters_sku) AS owners FROM ld_catalog.ld_competitor_cross_references WHERE upper(regexp_replace(coalesce(competitor_brand,''),'[^A-Z0-9]','','g'))='FRAM' AND ld_catalog.norm_part(competitor_part_number)=ANY($1::text[]) GROUP BY 1`,[auths])).rows.map(r=>[r.part,r.owners]));
  const pub=await queryPublicFramOwners(client,auths);
  const quarantined=new Set([
    ...(await client.query(`SELECT authority_normalized AS a FROM ld_catalog.ld_fram_final_quarantine WHERE authority_normalized=ANY($1::text[])`,[auths])).rows.map(r=>r.a),
    ...(await client.query(`SELECT regexp_replace(upper(query_code),'[^A-Z0-9]','','g') AS a FROM public.bad_crossref_quarantine WHERE regexp_replace(upper(query_code),'[^A-Z0-9]','','g')=ANY($1::text[])`,[auths])).rows.map(r=>r.a)]);
  const ident=(await client.query(`SELECT elimfilters_sku AS sku,regexp_replace(upper(canonical_part_number),'[^A-Z0-9]','','g') AS part FROM ld_catalog.ld_canonical_product_identity WHERE status='ACTIVE' AND upper(regexp_replace(coalesce(canonical_brand,''),'[^A-Z0-9]','','g'))='FRAM' AND (elimfilters_sku=ANY($1::text[]) OR regexp_replace(upper(canonical_part_number),'[^A-Z0-9]','','g')=ANY($2::text[]))`,[skus,auths])).rows;
  const facts=new Map();
  for(const {sku,authority} of pairs){const a=norm(authority),key=`${sku}|${a}`;if(!a||facts.has(key))continue;
    let fitments=new Set(),alternatives=new Set(),evidence=false;const file=fileFor(a);
    if(file&&fs.existsSync(file)){const p=JSON.parse(fs.readFileSync(file,'utf8')).public_catalog_proposal||{};evidence=true;
      fitments=new Set((p.vehicle_application_candidates||[]).filter(x=>x.make&&x.model&&x.year).map(x=>fitKey(x.make,x.model,x.year,x.engine)));
      alternatives=new Set((p.alternatives||[]).map(norm));}
    const identityConflict=ident.some(i=>(i.part===a&&i.sku!==sku)||(i.sku===sku&&i.part!==a&&!alternatives.has(i.part)));
    facts.set(key,{ldOwners:ld.get(a)||[],publicClaimants:pub.get(a)||[],fitments,alternatives,blocked:!evidence||quarantined.has(a)||identityConflict});}
  return facts;
}
// Authority-level: one colliding or ambiguous proposed row holds the whole authority.
function partitionByApplicationCollision(entries,rowsByEntry,targetTypes,peers,multiFit){
  const eligible=[],held=[];
  for(const e of entries){
    const hits={HOLD_COLLISION:[],HOLD_AMBIGUOUS_APPLICATION:[],LEGITIMATE_MULTI_FIT:[]};
    for(const r of rowsByEntry.get(e)||[]){const c=classifyApplicationCollision(r,targetTypes.get(e.sku),peers,multiFit);if(c)hits[c].push(r)}
    e.legitimate_multi_fit_rows=hits.LEGITIMATE_MULTI_FIT.length;
    const cls=hits.HOLD_COLLISION.length?'HOLD_COLLISION':hits.HOLD_AMBIGUOUS_APPLICATION.length?'HOLD_AMBIGUOUS_APPLICATION':null;
    if(!cls){eligible.push(e);continue;}
    held.push({authority:e.authority,sku:e.sku,family:e.family,class:cls,reason:cls,proposed_rows:(rowsByEntry.get(e)||[]).length,collision_rows:hits.HOLD_COLLISION.length,ambiguous_rows:hits.HOLD_AMBIGUOUS_APPLICATION.length,examples:[...hits.HOLD_COLLISION,...hits.HOLD_AMBIGUOUS_APPLICATION].slice(0,3).map(r=>[r.make,r.model_family,r.year,r.engine_code].join(' '))});
  }
  return {eligible,held};
}
async function insertRows(client,table,cols,conflict,rows,batch=250){let total=0;for(let i=0;i<rows.length;i+=batch){const part=rows.slice(i,i+batch),params=[],vals=[];let n=1;for(const r of part){const ps=[];for(const c of cols){params.push(r[c]);ps.push(`$${n++}`)}vals.push(`(${ps.join(',')})`)}if(!vals.length)continue;total+=(await client.query(`INSERT INTO ${table} (${cols.join(',')}) VALUES ${vals.join(',')} ${conflict} RETURNING 1`,params)).rowCount;}return total;}
async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('CATALOG_DATABASE_URL missing');
  const gapFile=latestGap();
  const gap=JSON.parse(fs.readFileSync(gapFile,'utf8'));
  const entries=EXISTING_APPLICATION_GAPS
    ? (gap.existing_application_gaps||[]).map(x=>({authority:x.authority,sku:x.sku,family:x.family}))
    : JSON.parse(fs.readFileSync(MAP_FILE,'utf8'));
  if(!Array.isArray(entries)||!entries.length) throw new Error(EXISTING_APPLICATION_GAPS?'No existing application gaps in latest report':'Empty reconciliation map');
  const byAuthority=new Map(gap.results.map(r=>[norm(r.authority),r]));
  const requestedSkus=[...new Set(entries.map(e=>e.sku))];
  const client=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await client.connect();
  const report={mode:EXECUTE?'execute':'dry-run',source_mode:EXISTING_APPLICATION_GAPS?'existing_application_gaps':'explicit_map',gap_report:gapFile,map:EXISTING_APPLICATION_GAPS?null:MAP_FILE,authorities:entries.length,targets:requestedSkus.length,planned:{},inserted:{},skipped:{},audit:{}};
  try{
    await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const targets=(await client.query(
      'SELECT sku,duty,filter_type FROM public.elimfilters_catalog WHERE sku=ANY($1::text[])',
      [requestedSkus]
    )).rows;
    const tm=new Map(targets.map(x=>[x.sku,x]));
    const missingTargetEntries=entries.filter(e=>!tm.has(e.sku));
    let activeEntries=entries.filter(e=>tm.has(e.sku));
    if(APPLICATIONS_ONLY){
      const auths=activeEntries.map(e=>norm(e.authority));
      const ldOwners=new Map((await client.query(`SELECT ld_catalog.norm_part(competitor_part_number) AS part,array_agg(DISTINCT elimfilters_sku) AS owners FROM ld_catalog.ld_competitor_cross_references WHERE upper(regexp_replace(coalesce(competitor_brand,''),'[^A-Z0-9]','','g'))='FRAM' AND ld_catalog.norm_part(competitor_part_number)=ANY($1::text[]) GROUP BY 1`,[auths])).rows.map(r=>[r.part,r.owners]));
      // Public FRAM claims come from brand_crossrefs.FRAM and competitor_codes entries branded FRAM.
      const publicOwners=await queryPublicFramOwners(client,auths);
      const {eligible,held}=partitionByDirectOwnership(activeEntries,ldOwners,publicOwners);
      const hdOwners=new Set((await client.query(`SELECT sku FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) AND duty='HEAVY_DUTY'`,[[...new Set(held.flatMap(h=>h.conflicting_owners))]])).rows.map(r=>r.sku));
      for(const h of held)h.heavy_duty_conflicting_owners=h.conflicting_owners.filter(s=>hdOwners.has(s));
      report.skipped.authority_not_directly_owned=held;
      report.skipped.authority_not_directly_owned_count=held.length;
      report.audit.heavy_duty_conflicts=held.filter(h=>h.heavy_duty_conflicting_owners.length).length;
      // Authority-level collision guard: evaluate every proposed row before any insert.
      const rowsByEntry=new Map(eligible.map(e=>[e,buildPlan([e],byAuthority).apps.filter(x=>x.make&&x.model&&x.year).map(toAppRow)]));
      const ownKeys=new Set((await client.query('SELECT elimfilters_sku,make,model_family,model_type,year FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=ANY($1::text[])',[[...new Set(eligible.map(e=>e.sku))]])).rows.map(applicationKey));
      for(const [e,rows] of rowsByEntry)rowsByEntry.set(e,rows.filter(r=>!ownKeys.has(applicationKey(r))));
      const makes=[...new Set([...rowsByEntry.values()].flat().map(r=>norm(r.make)))];
      const peers=(await client.query(`SELECT v.elimfilters_sku AS sku,v.source_sku,v.source_origin,v.make,v.model_family,v.model_type,v.year,v.engine_code,v.ccm,lower(c.filter_type) AS filter_type FROM ld_catalog.ld_vehicle_applications v JOIN public.elimfilters_catalog c ON c.sku=v.elimfilters_sku WHERE regexp_replace(upper(coalesce(v.make,'')),'[^A-Z0-9]','','g')=ANY($1::text[])`,[makes])).rows;
      const multiFitPairs=[...eligible.map(e=>({sku:e.sku,authority:e.authority})),...peers.filter(p=>p.source_origin===FRAM_ORIGIN).map(p=>({sku:p.sku,authority:p.source_sku}))];
      const multiFitFacts=await loadFramMultiFitFacts(client,multiFitPairs,a=>(byAuthority.get(a)||{}).file||path.join(FRAM_PRODUCTS_DIR,`${a}.json`));
      const collision=partitionByApplicationCollision(eligible,rowsByEntry,new Map(targets.map(t=>[t.sku,String(t.filter_type||'').toLowerCase()])),peers,(r,o)=>isLegitimateFramMultiFit(r,o,multiFitFacts));
      report.skipped.legitimate_multi_fit_rows=collision.eligible.reduce((s,e)=>s+(e.legitimate_multi_fit_rows||0),0);
      report.skipped.application_collision=collision.held;
      report.skipped.hold_collision_count=collision.held.filter(h=>h.class==='HOLD_COLLISION').length;
      report.skipped.hold_ambiguous_application_count=collision.held.filter(h=>h.class==='HOLD_AMBIGUOUS_APPLICATION').length;
      activeEntries=collision.eligible;
    }
    report.skipped.missing_targets=missingTargetEntries.map(e=>({authority:e.authority,sku:e.sku,family:e.family,reason:'TARGET_NOT_IN_PUBLIC_CATALOG'}));
    report.skipped.missing_target_authorities=missingTargetEntries.length;
    report.skipped.missing_target_skus=[...new Set(missingTargetEntries.map(e=>e.sku))];
    if(!activeEntries.length) throw new Error('No reconcilable targets remain after missing-target HOLD');
    const skus=[...new Set(activeEntries.map(e=>e.sku))];
    const plan=buildPlan(activeEntries,byAuthority);
    report.active_authorities=activeEntries.length;
    report.active_targets=skus.length;
    report.planned.competitor=APPLICATIONS_ONLY?0:plan.comp.length;
    report.planned.oem=APPLICATIONS_ONLY?0:plan.oem.length;
    report.planned.applications=plan.apps.length;
    report.planned.specifications=APPLICATIONS_ONLY?0:plan.specs.length;
    for(const e of activeEntries){
      const t=tm.get(e.sku);
      if(t.duty!=='LIGHT_DUTY'||t.filter_type!==TYPE[e.family]) throw new Error(`Target guard failed ${e.authority}->${e.sku}`);
    }
    const existing=(await client.query(
      'SELECT elimfilters_sku,competitor_brand,competitor_part_number FROM ld_catalog.ld_competitor_cross_references'
    )).rows;
    const owner=new Map();
    for(const x of existing){const k=norm(x.competitor_brand)+'|'+norm(x.competitor_part_number);if(!owner.has(k))owner.set(k,new Set());owner.get(k).add(x.elimfilters_sku)}
    for(const e of activeEntries){
      const owners=owner.get('FRAM|'+norm(e.authority))||new Set();
      const bad=[...owners].filter(s=>s!==e.sku);
      if(bad.length) throw new Error(`FRAM_AUTHORITY_CONFLICT ${e.authority} -> ${bad.join(',')}`);
    }
    const proposedOwners=new Map();
    for(const r of plan.comp){const k=norm(r.brand)+'|'+norm(r.part);if(!proposedOwners.has(k))proposedOwners.set(k,new Set());proposedOwners.get(k).add(r.sku)}
    const compRows=[];
    let compSkipped=0;
    for(const r of plan.comp){
      if(!r.brand||!r.part) continue;
      const k=norm(r.brand)+'|'+norm(r.part),old=owner.get(k)||new Set(),planned=proposedOwners.get(k)||new Set();
      const bad=[...old].filter(s=>s!==r.sku);
      if(bad.length||planned.size>1){if(r.direct)throw new Error(`DIRECT_REFERENCE_CONFLICT ${r.part}`);compSkipped++;continue;}
      compRows.push({elimfilters_sku:r.sku,source_sku:r.source,competitor_brand:r.brand,competitor_part_number:r.part});
    }
    report.skipped.competitor_conflicts=compSkipped;
    const oemRows=plan.oem.filter(x=>x.brand&&x.part).map(x=>({elimfilters_sku:x.sku,source_sku:x.source,oem_brand:x.brand,oem_part_number:x.part}));
    const evidenceAppRows=plan.apps.filter(x=>x.make&&x.model&&x.year).map(toAppRow);
    const existingApps=(await client.query(
      'SELECT elimfilters_sku,make,model_family,model_type,year FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=ANY($1::text[])',
      [skus]
    )).rows;
    const existingAppKeys=new Set(existingApps.map(applicationKey));
    const appRows=evidenceAppRows.filter(r=>!existingAppKeys.has(applicationKey(r)));
    report.planned.applications_total_evidence=evidenceAppRows.length;
    report.planned.applications_already_present=evidenceAppRows.length-appRows.length;
    report.planned.applications_missing=appRows.length;
    const specRows=plan.specs.filter(x=>x.key&&x.value).map(x=>({elimfilters_sku:x.sku,source_sku:x.source,spec_key:x.key,spec_value:x.value,spec_unit:x.unit}));
    report.inserted.competitor=0;
    report.inserted.oem=0;
    report.inserted.specifications=0;
    if(!APPLICATIONS_ONLY){
      report.inserted.competitor=await insertRows(client,'ld_catalog.ld_competitor_cross_references',['elimfilters_sku','source_sku','competitor_brand','competitor_part_number'],'ON CONFLICT (elimfilters_sku,competitor_brand,competitor_part_number) DO NOTHING',compRows);
      report.inserted.oem=await insertRows(client,'ld_catalog.ld_oem_cross_references',['elimfilters_sku','source_sku','oem_brand','oem_part_number'],'ON CONFLICT (elimfilters_sku,oem_brand,oem_part_number) DO NOTHING',oemRows);
      report.inserted.specifications=await insertRows(client,'ld_catalog.ld_product_specifications',['elimfilters_sku','source_sku','spec_key','spec_value','spec_unit'],'ON CONFLICT (elimfilters_sku,spec_key) DO NOTHING',specRows);
    }
    report.inserted.applications=await insertRows(client,'ld_catalog.ld_vehicle_applications',['elimfilters_sku','source_sku','make','model_family','model_type','year','engine_code','ccm','kw','hp','source_origin'],'ON CONFLICT (elimfilters_sku,make,model_family,model_type,year) DO NOTHING',appRows);
    const ready=APPLICATIONS_ONLY
      ? await client.query(`UPDATE ld_catalog.ld_production_readiness r SET has_applications=true,updated_at=now() WHERE r.elimfilters_sku=ANY($1::text[]) AND r.has_applications IS NOT TRUE AND EXISTS(SELECT 1 FROM ld_catalog.ld_vehicle_applications a WHERE a.elimfilters_sku=r.elimfilters_sku) RETURNING r.elimfilters_sku`,[skus])
      : await client.query(`UPDATE ld_catalog.ld_production_readiness r SET has_oem=EXISTS(SELECT 1 FROM ld_catalog.ld_oem_cross_references o WHERE o.elimfilters_sku=r.elimfilters_sku),has_competitor=EXISTS(SELECT 1 FROM ld_catalog.ld_competitor_cross_references x WHERE x.elimfilters_sku=r.elimfilters_sku),has_applications=EXISTS(SELECT 1 FROM ld_catalog.ld_vehicle_applications a WHERE a.elimfilters_sku=r.elimfilters_sku),has_specifications=EXISTS(SELECT 1 FROM ld_catalog.ld_product_specifications s WHERE s.elimfilters_sku=r.elimfilters_sku),updated_at=now() WHERE r.elimfilters_sku=ANY($1::text[])`,[skus]);
    report.inserted.readiness_updated=ready.rowCount;
    if(APPLICATIONS_ONLY) report.inserted.readiness_has_applications_skus=ready.rows.map(r=>r.elimfilters_sku).sort();
    const direct=(await client.query(`SELECT competitor_part_number,elimfilters_sku FROM ld_catalog.ld_competitor_cross_references WHERE upper(regexp_replace(coalesce(competitor_brand,''),'[^A-Z0-9]','','g'))='FRAM' AND ld_catalog.norm_part(competitor_part_number)=ANY($1::text[])`,[activeEntries.map(e=>norm(e.authority))])).rows;
    const dm=new Map();for(const x of direct){const k=norm(x.competitor_part_number);if(!dm.has(k))dm.set(k,new Set());dm.get(k).add(x.elimfilters_sku)}
    const failures=[];for(const e of activeEntries){const owners=[...(dm.get(norm(e.authority))||[])];if(owners.length!==1||owners[0]!==e.sku)failures.push({authority:e.authority,expected:e.sku,owners});}
    report.audit.direct_authorities=activeEntries.length-failures.length;
    report.audit.direct_failures=failures;
    if(failures.length) throw new Error(`DIRECT_AUTHORITY_AUDIT_FAILED ${failures.length}`);
    const hd=(await client.query(`SELECT count(*)::int n FROM ld_catalog.ld_competitor_cross_references x JOIN public.elimfilters_catalog c ON c.sku=x.elimfilters_sku WHERE x.source_sku=ANY($1::text[]) AND c.duty='HEAVY_DUTY'`,[activeEntries.map(e=>e.authority)])).rows[0].n;
    report.audit.heavy_duty_rows=hd;
    if(hd!==0) throw new Error(`HEAVY_DUTY_CONTAMINATION ${hd}`);
    if(EXECUTE) await client.query('COMMIT'); else await client.query('ROLLBACK');
    report.transaction=EXECUTE?'COMMIT':'ROLLBACK';
  }catch(e){try{await client.query('ROLLBACK')}catch{}report.error=e.message;throw Object.assign(e,{report});}
  finally{
    await client.end();fs.mkdirSync(REPORT_DIR,{recursive:true});
    const stamp=new Date().toISOString().replace(/[:.]/g,'-');
    const out=path.join(REPORT_DIR,`fram-ld-reconcile-${EXECUTE?'execute':'dryrun'}-${stamp}.json`);
    fs.writeFileSync(out,JSON.stringify(report,null,2));
    console.log(JSON.stringify({report:out,...report},null,2));
  }
}
if(require.main===module)main().catch(e=>{if(!e.report)console.error(e.stack||e.message);process.exit(1)});
module.exports={partitionByDirectOwnership,classifyApplicationCollision,partitionByApplicationCollision,isLegitimateFramMultiFit,loadFramMultiFitFacts,displacement,FRAM_ORIGIN};
