#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import pg from 'file:///C:/ELIMSERVER/repos/world-catalogue/node_modules/pg/lib/index.js';

const require=createRequire(import.meta.url);
const repair=require('../repair-catalog-completeness-from-donaldson.js');
const { relationAuthorityFor }=require('../../lib/hermes-relation-authority-policy.js');
const {Client}=pg;
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
const sync=process.argv.includes('--sync');
const skuArg=process.argv.find(x=>x.startsWith('--sku='));
const targetSku=skuArg?String(skuArg.split('=')[1]||'').trim().toUpperCase():null;
if(!url) throw new Error('DATABASE_URL/CATALOG_DATABASE_URL is required');
if(sync&&String(process.env.HERMES_RELATION_SWEEP_SYNC||'').toLowerCase()!=='true') throw new Error('HERMES_RELATION_SWEEP_SYNC=true is required for --sync');
const sha=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const stable=(...v)=>crypto.createHash('sha256').update(v.join('|')).digest('hex').slice(0,32);
const clean=v=>String(v==null?'':v).replace(/\s+/g,' ').trim();
const norm=repair.norm;
const brand=v=>clean(v).toUpperCase().replace(/[®™]/g,'').replace(/[-+]/g,' ').replace(/\s+/g,' ').trim();
const arr=v=>Array.isArray(v)?v:[];
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
function ref(raw,fallback=''){if(typeof raw==='string')return fallback&&clean(raw)?{brand:clean(fallback),code:clean(raw)}:null;if(!raw||typeof raw!=='object')return null;const b=clean(raw.manufacturer||raw.brand||raw.make||fallback),c=clean(raw.code||raw.part_number||raw.part||raw.reference||raw.oem);return b&&c?{brand:b,code:c}:null;}
const refKey=r=>brand(r.brand)+'|'+norm(r.code);
function currentRefs(row){const out=[];for(const x of arr(row.oem_codes)){const r=ref(x);if(r)out.push({...r,kind:'OEM'});}for(const x of arr(row.competitor_codes)){const r=ref(x);if(r)out.push({...r,kind:'COMPETITOR'});}for(const [b,codes] of Object.entries(obj(row.brand_crossrefs)))for(const x of (Array.isArray(codes)?codes:[codes])){const r=ref(x,b);if(r)out.push({...r,kind:'COMPETITOR'});}const seen=new Set();return out.filter(r=>{const k=r.kind+'|'+refKey(r);if(seen.has(k))return false;seen.add(k);return true;});}
function donaldsonRefs(record){if(!record)return[];const x=repair.extractReferences(record);return [...x.oem.map(r=>({brand:r.manufacturer,code:r.code,kind:'OEM'})),...x.competitors.map(r=>({brand:r.manufacturer,code:r.code,kind:'COMPETITOR'}))];}
function app(raw){if(typeof raw==='string')return clean(raw)?{equipment:clean(raw)}:null;if(!raw||typeof raw!=='object')return null;const make=clean(raw.make||raw.manufacturer||raw.brand),model=clean(raw.model),equipment=clean(raw.equipment||raw.machine||raw.name||[make,model].filter(Boolean).join(' ')),engine=clean(raw.engine||raw.engine_model||raw.motor),year=clean(raw.year||raw.model_year||raw.year_from);if(!equipment&&!make&&!model)return null;return{equipment,make,model,engine,year};}
const appKey=a=>[a.equipment,a.make,a.model,a.engine,a.year].map(norm).join('|');
function currentApps(row){const seen=new Set(),out=[];for(const raw of [...arr(row.equipment_applications),...arr(row.vehicle_applications)]){const a=app(raw);if(!a)continue;const k=appKey(a);if(!seen.has(k)){seen.add(k);out.push(a);}}return out;}
function donaldsonApps(record){if(!record)return[];const seen=new Set(),out=[];for(const raw of repair.extractApplications(record)){const a=app(raw);if(!a)continue;const k=appKey(a);if(!seen.has(k)){seen.add(k);out.push(a);}}return out;}
function readJson(p){if(!fs.existsSync(p))return null;try{return JSON.parse(fs.readFileSync(p,'utf8'));}catch{return null;}}
function flatten(doc){if(Array.isArray(doc))return doc;if(Array.isArray(doc?.results))return doc.results;if(Array.isArray(doc?.products))return doc.products;if(Array.isArray(doc?.items))return doc.items;return doc&&typeof doc==='object'?Object.values(doc).filter(v=>v&&typeof v==='object'):[];}
function genericPart(r){return clean(r?.part_number||r?.codigo_base||r?.code||r?.part||r?.sku);}
function genericRefs(r){const out=[];for(const x of arr(r?.oem_codes)){const z=ref(x);if(z)out.push({...z,kind:'OEM'});}for(const x of arr(r?.cross_references)){const z=ref(x);if(z)out.push({...z,kind:'COMPETITOR'});}for(const [b,codes] of Object.entries(obj(r?.brand_crossrefs)))for(const x of (Array.isArray(codes)?codes:[codes])){const z=ref(x,b);if(z)out.push({...z,kind:'COMPETITOR'});}return out;}
function genericApps(r){return [...arr(r?.equipment),...arr(r?.equipment_applications),...arr(r?.vehicle_applications)].map(app).filter(Boolean);}
function genericIndex(names){const byPart=new Map(),files=[];for(const name of names){const p=path.join(root,'scripts',name),doc=readJson(p);if(!doc)continue;const rows=flatten(doc);files.push({file:name,records:rows.length});for(const r of rows){const k=norm(genericPart(r));if(k&&!byPart.has(k))byPart.set(k,r);}}return{byPart,files};}
function fleetguardIndex(){const dir=path.join(root,'scripts','Fleetguard Scraper'),byPart=new Map(),files=[];if(!fs.existsSync(dir))return{byPart,files};for(const name of fs.readdirSync(dir).filter(n=>/^fleetguard_.*_results\.json$/i.test(n))){const doc=readJson(path.join(dir,name));if(!doc)continue;const rows=flatten(doc);files.push({file:'Fleetguard Scraper/'+name,records:rows.length});for(const r of rows){const k=norm(genericPart(r));if(k&&!byPart.has(k))byPart.set(k,r);}}return{byPart,files};}
const gov=row=>obj(row?.enrichment_data?.codigo_base_governance);
const route=relationAuthorityFor;
function exactRecord(row,r,indexes){const keys=[norm(row.canonical_source_code),norm(row.codigo_base)].filter(Boolean);const index=r.authority==='DONALDSON'?indexes.donaldson.byPart:r.authority==='PARKER_RACOR'?indexes.parker.byPart:r.authority==='FLEETGUARD'?indexes.fleetguard.byPart:null;if(index){for(const k of keys)if(index.has(k))return {record:index.get(k),authority:r.authority,fallback:false};}if(r.fallback_allowed===true&&r.fallback_authority==='FLEETGUARD'){for(const k of keys)if(indexes.fleetguard.byPart.has(k))return {record:indexes.fleetguard.byPart.get(k),authority:'FLEETGUARD',fallback:true};}return null;}
function state(r,recordInfo,kind,current,sourceRefs,sourceApps){if(r.authority.startsWith('HERMES_'))return{status:'REVIEW_REQUIRED',reason:'PRIMARY_AUTHORITY_RESEARCH_REQUIRED'};if(!recordInfo)return{status:'REVIEW_REQUIRED',reason:r.fallback_allowed===true?'PRIMARY_AND_ALLOWED_FALLBACK_SOURCE_RECORD_NOT_AVAILABLE':'PRIMARY_SOURCE_RECORD_NOT_AVAILABLE'};if(kind==='APPLICATION')return sourceApps.some(x=>appKey(x)===appKey(current))?{status:'VERIFIED',reason:'EXACT_APPLICATION_MATCH'}:{status:'REVIEW_REQUIRED',reason:'APPLICATION_NOT_FOUND_IN_PRIMARY_CAPTURE'};const key=refKey(current);if(sourceRefs.some(x=>x.kind===kind&&refKey(x)===key))return{status:'VERIFIED',reason:'EXACT_REFERENCE_MATCH'};if(sourceRefs.some(x=>x.kind!==kind&&refKey(x)===key))return{status:'CONFLICTING',reason:'REFERENCE_CLASSIFICATION_CONFLICT'};return{status:'REVIEW_REQUIRED',reason:'REFERENCE_NOT_FOUND_IN_PRIMARY_CAPTURE'};}
function orgs(r){if(r.authority==='DONALDSON')return[{organization_id:'donaldson',name:'Donaldson Company'}];if(r.authority==='PARKER_RACOR')return[{organization_id:'parker_hannifin_filtration',name:'Parker Racor'}];if(r.authority==='FLEETGUARD')return[{organization_id:'cummins_filtration',name:'Cummins Filtration (Fleetguard)'}];if(r.authority==='HERMES_LD_AUTHORITY_ROUTER')return[{organization_id:'mann_filter',name:'MANN-FILTER'},{organization_id:'fram_group',name:'FRAM'}];return[];}
const d=repair.loadDataset(),indexes={donaldson:{byPart:d.byPart,files:d.files},parker:genericIndex(['parker_turbine_results.json','racor_turbine_results.json','parker_racor_turbine_results.json']),fleetguard:fleetguardIndex()};
const db=new Client({connectionString:url});
await db.connect();

const outDir=path.join(root,'hermes/catalogue-quality');
fs.mkdirSync(outDir,{recursive:true});
const detailPath=path.join(outDir,'catalogue-relation-sweep-details.jsonl');
const detailStream=fs.createWriteStream(detailPath,{flags:'w'});
const routeCounts=new Map();
const totals={
  active_skus:0,
  skus_with_unresolved_relations:0,
  references:{total:0,verified:0,review_required:0,conflicting:0},
  applications:{total:0,verified:0,review_required:0,conflicting:0},
  evidence_records:0,
  backlog_items:0
};

function bumpRoute(authority){
  routeCounts.set(authority,(routeCounts.get(authority)||0)+1);
}

async function syncSku(row,routeInfo,skuEvidence,unresolvedItems){
  if(!sync) return;

  await db.query('BEGIN');
  try{
    for(const ev of skuEvidence){
      const q='INSERT INTO hermes_catalogue_evidence(evidence_id,sku,field_group,field_name,authority,source_type,source_url,source_hash,verification_status,payload,provenance,captured_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,NULL,$7,$8,$9::jsonb,$10::jsonb,now(),now()) ON CONFLICT(evidence_id) DO UPDATE SET authority=excluded.authority,source_hash=excluded.source_hash,verification_status=excluded.verification_status,payload=excluded.payload,provenance=excluded.provenance,captured_at=now(),updated_at=now()';
      await db.query(q,[ev.evidence_id,ev.sku,ev.field_group,ev.field_name,ev.authority,ev.source_type,ev.source_hash,ev.verification_status,JSON.stringify(ev.payload),JSON.stringify(ev.provenance)]);
    }

    const refs=unresolvedItems.filter(x=>x.kind!=='APPLICATION');
    const apps=unresolvedItems.filter(x=>x.kind==='APPLICATION');
    const gapList=[...(refs.length?['CROSS_REFERENCES']:[]),...(apps.length?['APPLICATIONS']:[])];

    for(const gap of gapList){
      const subset=gap==='CROSS_REFERENCES'?refs:apps;
      const hints={
        relation_sweep_version:'1.1.0',
        authority_route:routeInfo,
        unresolved_relation_count:subset.length,
        unresolved_relations:subset.slice(0,250),
        source_candidate_brand:routeInfo.authority==='PARKER_RACOR'
          ? 'PARKER RACOR'
          : routeInfo.authority==='FLEETGUARD'
            ? 'FLEETGUARD'
            : routeInfo.authority==='DONALDSON'
              ? 'DONALDSON'
              : null,
        source_candidate_code:row.canonical_source_code||row.codigo_base||null
      };
      const q='INSERT INTO hermes_catalogue_backlog(backlog_id,sku,gap_type,priority,status,manufacturer_candidates,organization_candidates,discovery_hints,recommended_action,updated_at) VALUES($1,$2,$3,1,\'OPEN\',$4::jsonb,$5::jsonb,$6::jsonb,$7,now()) ON CONFLICT(sku,gap_type) DO UPDATE SET priority=1,status=CASE WHEN hermes_catalogue_backlog.status IN (\'EVIDENCE_FOUND\',\'APPROVED\') THEN hermes_catalogue_backlog.status ELSE \'OPEN\' END,manufacturer_candidates=excluded.manufacturer_candidates,organization_candidates=excluded.organization_candidates,discovery_hints=excluded.discovery_hints,recommended_action=excluded.recommended_action,updated_at=now(),resolved_at=null';
      await db.query(q,[
        'REL_'+stable(row.sku,gap),
        row.sku,
        gap,
        JSON.stringify([routeInfo.authority]),
        JSON.stringify(orgs(routeInfo)),
        JSON.stringify(hints),
        'Verify every unresolved '+gap+' relation against '+routeInfo.authority+'; never infer from absence or code similarity.'
      ]);
      totals.backlog_items++;
    }

    await db.query('COMMIT');
  }catch(error){
    await db.query('ROLLBACK');
    throw error;
  }
}

try{
  if(sync){
    await db.query(fs.readFileSync(path.join(root,'scripts/migrations/run_108_hermes_catalogue_quality_ledger_20260918.sql'),'utf8'));
    await db.query(fs.readFileSync(path.join(root,'scripts/migrations/run_109_hermes_catalogue_quality_dispatcher_20260918.sql'),'utf8'));
  }

  const where=targetSku?'WHERE catalog_active=true AND upper(sku)=$1':'WHERE catalog_active=true';
  const params=targetSku?[targetSku]:[];
  const sql='SELECT sku,codigo_base,duty,technology,filter_type,canonical_source_brand,canonical_source_code,oem_codes,competitor_codes,brand_crossrefs,equipment_applications,vehicle_applications,enrichment_data FROM elimfilters_catalog '+where+' ORDER BY sku';
  const rows=(await db.query(sql,params)).rows;

  for(const row of rows){
    totals.active_skus++;
    const r=route(row);
    bumpRoute(r.authority);

    const recordInfo=exactRecord(row,r,indexes);
    const record=recordInfo?.record||null;
    const usedAuthority=recordInfo?.authority||r.authority;
    const sourceRefs=usedAuthority==='DONALDSON'?donaldsonRefs(record):genericRefs(record);
    const sourceApps=usedAuthority==='DONALDSON'?donaldsonApps(record):genericApps(record);

    const res={
      sku:row.sku,
      duty:row.duty,
      technology:row.technology,
      authority_route:r,
      source_record_available:Boolean(record),
      source_authority_used:recordInfo?.authority||null,
      fallback_used:recordInfo?.fallback===true,
      references:{verified:0,review_required:0,conflicting:0,total:0},
      applications:{verified:0,review_required:0,conflicting:0,total:0},
      unresolved_count:0
    };
    const skuEvidence=[];
    const unresolvedItems=[];

    for(const x of currentRefs(row)){
      const s=state(r,recordInfo,x.kind,x,sourceRefs,sourceApps);
      res.references.total++;
      totals.references.total++;
      if(s.status==='VERIFIED'){res.references.verified++;totals.references.verified++;}
      else if(s.status==='CONFLICTING'){res.references.conflicting++;totals.references.conflicting++;}
      else{res.references.review_required++;totals.references.review_required++;}

      const payload={kind:x.kind,brand:x.brand,code:x.code,state:s.status,reason:s.reason,authority_route:r};
      skuEvidence.push({
        evidence_id:'REL_'+stable(row.sku,'REF',x.kind,x.brand,x.code,usedAuthority),
        sku:row.sku,field_group:'CROSS_REFERENCES',field_name:x.kind,authority:usedAuthority,
        source_type:'HERMES_RELATION_SWEEP',source_hash:sha(payload),verification_status:s.status,payload,
        provenance:{engine:'HERMES_RELATION_SWEEP_V1_1',source_record_available:Boolean(record)}
      });
      if(s.status!=='VERIFIED') unresolvedItems.push(payload);
    }

    for(const x of currentApps(row)){
      const s=state(r,recordInfo,'APPLICATION',x,sourceRefs,sourceApps);
      res.applications.total++;
      totals.applications.total++;
      if(s.status==='VERIFIED'){res.applications.verified++;totals.applications.verified++;}
      else if(s.status==='CONFLICTING'){res.applications.conflicting++;totals.applications.conflicting++;}
      else{res.applications.review_required++;totals.applications.review_required++;}

      const payload={kind:'APPLICATION',application:x,state:s.status,reason:s.reason,authority_route:r};
      skuEvidence.push({
        evidence_id:'REL_'+stable(row.sku,'APP',appKey(x),usedAuthority),
        sku:row.sku,field_group:'APPLICATIONS',field_name:'RELATION',authority:usedAuthority,
        source_type:'HERMES_RELATION_SWEEP',source_hash:sha(payload),verification_status:s.status,payload,
        provenance:{engine:'HERMES_RELATION_SWEEP_V1_1',source_record_available:Boolean(record)}
      });
      if(s.status!=='VERIFIED') unresolvedItems.push(payload);
    }

    totals.evidence_records+=skuEvidence.length;
    res.unresolved_count=unresolvedItems.length;
    if(unresolvedItems.length) totals.skus_with_unresolved_relations++;

    detailStream.write(JSON.stringify(res)+'\n');
    await syncSku(row,r,skuEvidence,unresolvedItems);
  }

  const summary={
    schema_version:'1.1.0',
    generated_at:new Date().toISOString(),
    mode:sync?'SYNC':'READ_ONLY',
    active_skus:totals.active_skus,
    source_files:{
      donaldson:indexes.donaldson.files,
      parker_racor:indexes.parker.files,
      fleetguard:indexes.fleetguard.files
    },
    routes:Object.fromEntries(routeCounts),
    references:totals.references,
    applications:totals.applications,
    skus_with_unresolved_relations:totals.skus_with_unresolved_relations,
    evidence_records:totals.evidence_records,
    backlog_items:totals.backlog_items,
    details_file:path.relative(root,detailPath),
    canonical_catalogue_write:false
  };

  const summaryPath=path.join(outDir,'catalogue-relation-sweep-latest.json');
  fs.writeFileSync(summaryPath,JSON.stringify(summary,null,2)+'\n');
  console.log(JSON.stringify({output:path.relative(root,summaryPath),...summary},null,2));
}finally{
  await new Promise(resolve=>detailStream.end(resolve));
  await db.end();
}
