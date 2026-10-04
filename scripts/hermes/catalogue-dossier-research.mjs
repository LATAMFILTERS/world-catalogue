#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import pg from 'file:///C:/ELIMSERVER/repos/world-catalogue/node_modules/pg/lib/index.js';
import { assessDossier, canonicalRoleForDossier, resolutionDisposition } from './catalogue-dossier-core.mjs';

const require = createRequire(import.meta.url);
const { buildBrandResearchStrategy } = require('../../lib/hermes-brand-search-router');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');
const { Client } = pg;
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const url=process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
const apiKey=process.env.GROQ_API_KEY;
const model=process.env.HERMES_CATALOGUE_DOSSIER_MODEL || process.env.HERMES_GROQ_MODEL || 'openai/gpt-oss-120b';
const fallbackModel=process.env.HERMES_GROQ_FALLBACK_MODEL || 'openai/gpt-oss-20b';
const limit=Math.max(1,Math.min(20,Number(process.env.HERMES_CATALOGUE_RESEARCH_LIMIT||1)));
const pacingMs=Math.max(0,Number(process.env.HERMES_CATALOGUE_RESEARCH_PACING_MS||20000));
const retries=Math.max(0,Math.min(3,Number(process.env.HERMES_CATALOGUE_RESEARCH_RETRIES||2)));
const maxResearchAttempts=Math.max(1,Math.min(10,Number(process.env.HERMES_CATALOGUE_MAX_RESEARCH_ATTEMPTS||3)));
const timeoutMs=Math.max(10000,Number(process.env.HERMES_CATALOGUE_RESEARCH_TIMEOUT_MS||45000));
if(!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL is required');
if(!apiKey) throw new Error('GROQ_API_KEY is required');

const stableId=v=>crypto.createHash('sha256').update(String(v)).digest('hex').slice(0,32);
const sha=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]+/g,'');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function dossierShape(){
  const axis = {
    status:'VERIFIED | NOT_PUBLISHED_BY_SOURCE | CONFLICTING | UNRESOLVED',
    records:['normalized source-reported records; [] only when NOT_PUBLISHED_BY_SOURCE'],
    source_urls:['https:// official evidence URL'],
    checked_sources:['https:// official pages checked; required for NOT_PUBLISHED_BY_SOURCE'],
    note:'short factual note'
  };
  return {
    dossier_status:'DOSSIER_COMPLETE | DOSSIER_INCOMPLETE',
    identity:{
      status:'VERIFIED | CONFLICTING | UNRESOLVED',
      manufacturer:'official manufacturer',
      source_code:'official exact part number',
      product_name:'official product name',
      product_type:'official filter/product type',
      market_segment:'LIGHT_DUTY | HEAVY_DUTY | INDUSTRIAL',
      records:['additional official identity facts'],
      source_urls:['https:// official evidence URL'],
      checked_sources:['https:// official pages checked'],
      note:'short factual note'
    },
    technical_specs:axis,
    dimensions:axis,
    oem_codes:axis,
    cross_references:axis,
    applications:axis,
    provenance:{sources:[{url:'https://...',authority:'manufacturer/OEM',source_type:'official product page/pdf/catalogue',supports:['axis name']}]},
    consistency:{status:'VERIFIED | CONFLICTING',conflicts:['specific contradiction'],notes:['cross-check notes']}
  };
}
function systemPrompt(){
  return `You are HERMES performing a complete canonical product dossier investigation for ELIMFILTERS.
Research ONE exact product deeply in a single investigation. This is not a simple manufacturer lookup.
Use the supplied brand_search_strategy before generic web search. For every known manufacturer/OEM, enter through its specialized official catalogue, vehicle lookup, product search, parts system, or application engine first.
Generic web search is discovery-only: use it to locate an official specialized engine or official document, never as the final authority when a specialized engine exists.
Prefer the manufacturer's official product page, official catalogue, official PDFs, technical data sheets, OEM catalogues and official application data.
Never infer facts from part-number shape, similarity, marketplace listings, SEO snippets, or unverified cross references.
The current ELIMFILTERS codigo_base may be a placeholder. If source_candidate_code is supplied, validate that candidate.
Classify the product market_segment from official applications/product context as LIGHT_DUTY, HEAVY_DUTY, or INDUSTRIAL.
Policy: MANN-FILTER and FRAM are canonical codigo_base authorities only for LIGHT_DUTY. In HEAVY_DUTY, MANN-FILTER and FRAM part numbers are competitor cross-reference codes, not canonical codigo_base.
If the target duty and the confirmed product market_segment conflict, set consistency.status=CONFLICTING and describe the duty mismatch.
For a HEAVY_DUTY target, if the supplied candidate is MANN-FILTER or FRAM, use it only as a competitor clue and continue searching for the actual canonical HD source manufacturer.
Collect ALL source-published technical specifications, dimensions, OEM numbers, cross-reference numbers, and applications.
For vehicle applications capture make, model, year range and engine when published. Preserve source wording and units.
If an official source genuinely does not publish an axis, mark it NOT_PUBLISHED_BY_SOURCE and list the official pages checked.
Do not use NOT_PUBLISHED_BY_SOURCE merely because the first page lacks the field; search the manufacturer's relevant official resources.
Any contradiction must be CONFLICTING and listed in consistency.conflicts.
DOSSIER_COMPLETE is allowed only when identity is VERIFIED, every other required axis is VERIFIED or
NOT_PUBLISHED_BY_SOURCE with evidence of the official sources checked, provenance is complete, and consistency is VERIFIED.
Return strict JSON matching required_json. Do not propose or invent an ELIMFILTERS SKU.`;
}

function retryDelay(status,body,attempt){
  if(status!==429) return 0;
  const m=String(body||'').match(/try again in ([0-9.]+)s/i);
  return Math.ceil((m?Number(m[1]):15)*1000)+1500+(attempt*1000);
}
async function research(item){
  const strategyBrands = [
    item.discovery_hints?.source_candidate_brand,
    item.organization?.name,
    item.competitor_hint?.manufacturer,
    item.competitor_hint?.brand,
  ].filter(Boolean);
  const brandSearchStrategy = buildBrandResearchStrategy({
    brands: strategyBrands,
    market: item.discovery_hints?.market || null,
  });
  const input={
    instruction:'Build the complete defensible product dossier. Do not close the product if any required axis remains unresolved.',
    target:{
      elimfilters_sku:item.sku,
      legacy_codigo_base:item.discovery_hints?.codigo_base||null,
      source_candidate_brand:item.discovery_hints?.source_candidate_brand||null,
      source_candidate_code:item.discovery_hints?.source_candidate_code||null,
      source_candidate_state:item.discovery_hints?.source_candidate_state||null,
      duty:item.duty,
      technology:item.technology,
      filter_type:item.filter_type
    },
    selected_organization:item.organization||null,
    selected_source:item.source||null,
    competitor_hint:item.competitor_hint||null,
    brand_search_strategy:brandSearchStrategy,
    required_json:dossierShape()
  };
  let requestModel=model;
  let lastError=null;
  for(let attempt=0;attempt<=retries;attempt++){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeoutMs*2);
    try{
      const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{
        method:'POST',signal:controller.signal,
        headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},
        body:JSON.stringify({model:requestModel,temperature:0,max_completion_tokens:5000,
          tools:[{type:'browser_search'}],
          messages:[{role:'system',content:systemPrompt()},{role:'user',content:JSON.stringify(input)}]})
      });
      if(!r.ok){
        const body=(await r.text()).slice(0,1600);
        if(r.status===413 && requestModel!==fallbackModel){requestModel=fallbackModel;continue;}
        const wait=retryDelay(r.status,body,attempt);
        lastError=new Error('Groq HTTP '+r.status+': '+body);
        if(wait && attempt<retries){await sleep(wait);continue;}
        throw lastError;
      }
      const body=await r.json();
      const content=body?.choices?.[0]?.message?.content;
      if(!content) throw new Error('Groq returned no dossier content');
      const parsed=JSON.parse(String(content).trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''));
      return {dossier:parsed,model:requestModel};
    }catch(error){
      lastError=error;
      if(attempt>=retries) throw error;
    }finally{clearTimeout(timer);}
  }
  throw lastError||new Error('HERMES dossier research failed');
}

async function fetchText(target){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const r=await fetch(target,{redirect:'follow',signal:controller.signal,headers:{'User-Agent':'ELIMFILTERS-HERMES-DOSSIER/1.0'}});
    const body=await r.text();
    return {ok:r.ok,status:r.status,text:body.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,75000)};
  }catch(error){return {ok:false,status:null,text:'',error:String(error?.message||error)}}
  finally{clearTimeout(timer)}
}
async function validateIdentity(item,dossier){
  const identity=dossier?.identity||{};
  const expected=String(item.discovery_hints?.source_candidate_code||'').trim();
  const code=String(identity.source_code||'').trim();
  const urls=Array.isArray(identity.source_urls)?identity.source_urls.filter(Boolean):[];
  if(identity.status!=='VERIFIED' || !identity.manufacturer || !code || !identity.product_type || !identity.market_segment || urls.length===0){
    return {ok:false,reason:'identity-axis-incomplete'};
  }
  if(expected && norm(expected)!==norm(code)) return {ok:false,reason:'identity-code-does-not-match-governed-candidate'};
  const first=await fetchText(urls[0]);
  if(!first.ok) return {ok:false,reason:'identity-official-page-not-fetchable',page:first};
  if(!norm(first.text).includes(norm(code))) return {ok:false,reason:'identity-code-not-observed-on-evidence-page',page:first};
  return {ok:true,page:{url:urls[0],status:first.status,sha256:sha(first.text),chars:first.text.length}};
}

function axisStatus(dossier,name){
  return String(dossier?.[name]?.status||'').toUpperCase()||null;
}
function uniqueUrls(dossier){
  const urls=[];
  for(const name of ['identity','technical_specs','dimensions','oem_codes','cross_references','applications']){
    for(const u of dossier?.[name]?.source_urls||[]) if(u&&!urls.includes(u)) urls.push(u);
    for(const u of dossier?.[name]?.checked_sources||[]) if(u&&!urls.includes(u)) urls.push(u);
  }
  for(const s of dossier?.provenance?.sources||[]) if(s?.url&&!urls.includes(s.url)) urls.push(s.url);
  return urls;
}

function applicationEvidenceForDossier(dossier,evidenceId){
  if(String(dossier?.applications?.status||'').toUpperCase()!=='VERIFIED') return null;
  const sourceUrl=(dossier.applications.source_urls||[]).find(Boolean)||null;
  if(!sourceUrl) return null;
  const sources=Array.isArray(dossier?.provenance?.sources)?dossier.provenance.sources:[];
  const provenance=sources.find((source)=>{
    if(source?.url!==sourceUrl) return false;
    const supports=Array.isArray(source.supports)?source.supports.map((value)=>String(value).toLowerCase()):[];
    return supports.some((value)=>value.includes('application'));
  }) || sources.find((source)=>source?.url===sourceUrl) || null;
  const authority=String(provenance?.authority||'').trim();
  if(!authority) return null;
  return {
    authority,
    source_url:sourceUrl,
    evidence_hash:sha({
      evidence_id:evidenceId,
      applications:dossier.applications.records||[],
      source_url:sourceUrl,
      authority
    }),
    metadata:{
      hermes_evidence_id:evidenceId,
      source_type:provenance?.source_type||null,
      dossier_axis:'applications',
      exact_application_evidence:true
    }
  };
}
async function persistDossier(db,item,dossier,assessment,identityCheck,attemptError=null){
  const now=new Date().toISOString();
  const urls=uniqueUrls(dossier);
  const status=assessment.complete&&identityCheck.ok?'DOSSIER_COMPLETE':'DOSSIER_INCOMPLETE';
  const identity=dossier.identity||{};
  const payload=[
    item.sku,item.backlog_id,identity.manufacturer||null,identity.source_code||null,
    identity.product_type||null,identity.product_name||null,status,
    identity.market_segment||null,identityCheck?.canonicalRole?.role||null,identityCheck?.canonicalRole?.reason||null,
    axisStatus(dossier,'identity'),axisStatus(dossier,'technical_specs'),axisStatus(dossier,'dimensions'),
    axisStatus(dossier,'oem_codes'),axisStatus(dossier,'cross_references'),axisStatus(dossier,'applications'),
    String(dossier?.consistency?.status||'').toUpperCase()||null,
    assessment.provenance_verified?'VERIFIED':'UNRESOLVED',
    JSON.stringify(assessment.unresolved_axes),JSON.stringify(assessment.conflicts),
    JSON.stringify(dossier.identity||{}),JSON.stringify(dossier.technical_specs||{}),JSON.stringify(dossier.dimensions||{}),
    JSON.stringify(dossier.oem_codes||{}),JSON.stringify(dossier.cross_references||{}),JSON.stringify(dossier.applications||{}),
    JSON.stringify(dossier.provenance||{}),JSON.stringify(dossier.consistency||{}),JSON.stringify(urls),
    sha(dossier),now,status==='DOSSIER_COMPLETE'?now:null
  ];
  await db.query(`INSERT INTO hermes_catalogue_dossier
    (sku,backlog_id,manufacturer,source_code,product_type,product_name,dossier_status,market_segment,canonical_role,canonical_role_reason,
     identity_status,technical_specs_status,dimensions_status,oem_codes_status,cross_references_status,applications_status,
     consistency_status,provenance_status,unresolved_axes,conflicts,identity,technical_specs,dimensions,oem_codes,
     cross_references,applications,provenance,consistency,source_urls,dossier_hash,research_attempts,
     first_researched_at,last_researched_at,completed_at,updated_at)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18::jsonb,$19::jsonb,$20::jsonb,$21::jsonb,$22::jsonb,
      $23::jsonb,$24::jsonb,$25::jsonb,$26::jsonb,$27::jsonb,$28::jsonb,$29,1,$30,$30,$31,now())
    ON CONFLICT(sku) DO UPDATE SET
      backlog_id=excluded.backlog_id,manufacturer=excluded.manufacturer,source_code=excluded.source_code,
      product_type=excluded.product_type,product_name=excluded.product_name,dossier_status=excluded.dossier_status,market_segment=excluded.market_segment,canonical_role=excluded.canonical_role,canonical_role_reason=excluded.canonical_role_reason,
      identity_status=excluded.identity_status,technical_specs_status=excluded.technical_specs_status,
      dimensions_status=excluded.dimensions_status,oem_codes_status=excluded.oem_codes_status,
      cross_references_status=excluded.cross_references_status,applications_status=excluded.applications_status,
      consistency_status=excluded.consistency_status,provenance_status=excluded.provenance_status,
      unresolved_axes=excluded.unresolved_axes,conflicts=excluded.conflicts,identity=excluded.identity,
      technical_specs=excluded.technical_specs,dimensions=excluded.dimensions,oem_codes=excluded.oem_codes,
      cross_references=excluded.cross_references,applications=excluded.applications,provenance=excluded.provenance,
      consistency=excluded.consistency,source_urls=excluded.source_urls,dossier_hash=excluded.dossier_hash,
      research_attempts=hermes_catalogue_dossier.research_attempts+1,
      first_researched_at=coalesce(hermes_catalogue_dossier.first_researched_at,excluded.first_researched_at),
      last_researched_at=excluded.last_researched_at,completed_at=excluded.completed_at,updated_at=now()`,payload);
  return status;
}

function proposedValues(dossier,evidenceId,capturedAt,applicationEvidence=null){
  const identity=dossier.identity;
  const values={
    codigo_base:identity.source_code,
    source_identity:{
      canonical_source_brand:identity.manufacturer,
      canonical_source_code:identity.source_code,
      canonical_source_url:identity.source_urls?.[0]||null,
      canonical_source_status:'VERIFIED',
      canonical_verified_at:capturedAt,
      canonical_evidence:{evidence_id:evidenceId,dossier_complete:true}
    }
  };
  if(dossier.dimensions.status==='VERIFIED') values.dimensions=Object.assign({},...dossier.dimensions.records);
  if(dossier.technical_specs.status==='VERIFIED') values.technical_specs=Object.assign({},...dossier.technical_specs.records);
  if(dossier.oem_codes.status==='VERIFIED') values.oem_codes=dossier.oem_codes.records;
  if(dossier.cross_references.status==='VERIFIED') values.competitor_codes=dossier.cross_references.records;
  if(dossier.applications.status==='VERIFIED' && applicationEvidence) values.vehicle_applications=dossier.applications.records;
  return values;
}
const orgDoc=JSON.parse(fs.readFileSync(path.join(root,'hermes/config/source-organizations.json'),'utf8'));
const index=JSON.parse(fs.readFileSync(path.join(root,'hermes/catalogue-quality/work-orders/index.json'),'utf8'));
const selected=[];
for(const batch of index.batches||[]){
  if(selected.length>=limit) break;
  if(batch.gap_type!=='SOURCE') continue;
  const doc=JSON.parse(fs.readFileSync(path.join(root,batch.file),'utf8'));
  for(const item of doc.items||[]){
    if(selected.length>=limit) break;
    if(item.gap_type==='SOURCE') selected.push(item);
  }
}

const db=new Client({connectionString:url});
await db.connect();
const migration=fs.readFileSync(path.join(root,'scripts/migrations/run_110_hermes_catalogue_dossier_20260918.sql'),'utf8');
await db.query(migration);
await db.query(fs.readFileSync(path.join(root,'scripts/migrations/run_111_hermes_duty_source_role_20260918.sql'),'utf8'));
const run={schema_version:'2.0.0',generated_at:new Date().toISOString(),selected:selected.length,results:[]};

try{
  for(let i=0;i<selected.length;i++){
    const item=selected[i];
    if(i>0&&pacingMs>0) await sleep(pacingMs);
    let researched;
    try{researched=await research(item);}
    catch(error){
      const reason=String(error?.message||error);
      const infrastructure=/model_not_found|Groq HTTP (404|413|429|5\d\d)|ECONNRESET|fetch failed|aborted/i.test(reason);
      const next=new Date(Date.now()+(infrastructure?1:24)*3600_000).toISOString();
      await db.query(`UPDATE hermes_catalogue_backlog SET research_attempts=research_attempts+$4,
        last_research_at=now(),next_attempt_at=$2,last_research_error=$3,updated_at=now() WHERE backlog_id=$1`,
        [item.backlog_id,next,reason,infrastructure?0:1]);
      run.results.push({sku:item.sku,status:'RESEARCH_ERROR',reason,next_attempt_at:next,research_attempt_counted:!infrastructure});
      continue;
    }
    const dossier=researched.dossier||{};
    const assessment=assessDossier(dossier);
    const identityCheck=await validateIdentity(item,dossier);
    const canonicalRole=canonicalRoleForDossier(item,dossier);
    const canonicalEligible=canonicalRole.role==='CANONICAL_BASE';
    const status=await persistDossier(db,item,dossier,assessment,{...identityCheck,canonicalRole});
    if(status!=='DOSSIER_COMPLETE' || !canonicalEligible){
      const reason=[...assessment.unresolved_axes,identityCheck.ok?null:identityCheck.reason,canonicalEligible?null:canonicalRole.reason].filter(Boolean).join('; ');
      let competitorEvidenceId=null;
      if(status==='DOSSIER_COMPLETE' && canonicalRole.role==='COMPETITOR_CODE'){
        competitorEvidenceId='CQR_'+stableId(item.sku+'|'+dossier.identity.manufacturer+'|'+dossier.identity.source_code+'|'+sha(dossier));
        await db.query(`INSERT INTO hermes_catalogue_evidence
          (evidence_id,sku,field_group,field_name,authority,source_type,source_url,source_hash,verification_status,payload,provenance,captured_at,updated_at)
          VALUES($1,$2,'CROSS_REFERENCES','complete_competitor_dossier',$3,'HERMES_COMPLETE_DOSSIER',$4,$5,'VERIFIED',$6::jsonb,$7::jsonb,now(),now())
          ON CONFLICT(evidence_id) DO UPDATE SET payload=excluded.payload,provenance=excluded.provenance,updated_at=now()`,
          [competitorEvidenceId,item.sku,dossier.identity.manufacturer,dossier.identity.source_urls?.[0]||null,sha(dossier),
           JSON.stringify({manufacturer:dossier.identity.manufacturer,part_number:dossier.identity.source_code,market_segment:dossier.identity.market_segment,dossier}),
           JSON.stringify({engine:'HERMES_COMPLETE_DOSSIER',canonical_role:canonicalRole})]);
        await db.query(`UPDATE hermes_catalogue_dossier SET evidence_ids=$2::jsonb,updated_at=now() WHERE sku=$1`,
          [item.sku,JSON.stringify([competitorEvidenceId])]);
      }
      const attempts=Number(item.research_attempts||0)+1;
      const disposition=resolutionDisposition(dossier,{
        research_attempts:attempts,
        max_research_attempts:maxResearchAttempts,
        canonical_eligible:canonicalEligible
      });
      if(disposition.action==='DISCARD_SKU'){
        assertGovernedCatalogPatch({}, {catalog_active:false});
        await db.query('BEGIN');
        try{
          await db.query('UPDATE elimfilters_catalog SET catalog_active=false WHERE sku=$1 AND catalog_active=true',[item.sku]);
          await db.query(`UPDATE hermes_catalogue_dossier SET dossier_status='REJECTED',updated_at=now() WHERE sku=$1`,[item.sku]);
          await db.query(`UPDATE hermes_catalogue_backlog SET status='RESOLVED',research_attempts=$2,last_research_at=now(),
            next_attempt_at=NULL,last_research_error=$3,last_evidence_id=coalesce($4,last_evidence_id),resolved_at=now(),updated_at=now()
            WHERE backlog_id=$1`,[item.backlog_id,attempts,disposition.reason,competitorEvidenceId]);
          await db.query('COMMIT');
        }catch(error){await db.query('ROLLBACK');throw error;}
        run.results.push({sku:item.sku,status:'DISCARDED_NO_EVIDENCE',canonical_role:canonicalRole,unresolved_axes:assessment.unresolved_axes,reason:disposition.reason,research_attempts:attempts,evidence_id:competitorEvidenceId});
        continue;
      }
      const retryInterval=canonicalRole.role==='COMPETITOR_CODE'?'1 hour':'24 hours';
      await db.query(`UPDATE hermes_catalogue_backlog SET research_attempts=$2,
        last_research_at=now(),next_attempt_at=now()+($3::text)::interval,last_research_error=$4,last_evidence_id=coalesce($5,last_evidence_id),updated_at=now()
        WHERE backlog_id=$1`,[item.backlog_id,attempts,retryInterval,reason||'dossier-incomplete',competitorEvidenceId]);
      run.results.push({sku:item.sku,status:canonicalRole.role==='COMPETITOR_CODE'?'COMPETITOR_CODE':'DOSSIER_INCOMPLETE',canonical_role:canonicalRole,unresolved_axes:assessment.unresolved_axes,reason,evidence_id:competitorEvidenceId,research_attempts:attempts});
      continue;
    }

    const capturedAt=new Date().toISOString();
    const evidenceId='CQD_'+stableId(item.sku+'|'+sha(dossier));
    const evidencePayload={dossier,assessment,identity_check:identityCheck};
    await db.query('BEGIN');
    try{
      await db.query(`INSERT INTO hermes_catalogue_evidence
        (evidence_id,sku,field_group,field_name,authority,source_type,source_url,source_hash,
         verification_status,payload,provenance,captured_at,updated_at)
        VALUES($1,$2,'SOURCE_IDENTITY','complete_product_dossier',$3,'HERMES_COMPLETE_DOSSIER',$4,$5,
          'VERIFIED',$6::jsonb,$7::jsonb,$8,now())
        ON CONFLICT(evidence_id) DO UPDATE SET payload=excluded.payload,provenance=excluded.provenance,
          source_hash=excluded.source_hash,updated_at=now()`,
        [evidenceId,item.sku,dossier.identity.manufacturer,dossier.identity.source_urls[0],sha(dossier),
          JSON.stringify(evidencePayload),JSON.stringify({engine:'HERMES_COMPLETE_DOSSIER',model:researched.model}),capturedAt]);
      await db.query(`UPDATE hermes_catalogue_dossier SET evidence_ids=$2::jsonb,dossier_status='REVIEW_REQUIRED',
        updated_at=now() WHERE sku=$1`,[item.sku,JSON.stringify([evidenceId])]);
      await db.query(`UPDATE hermes_catalogue_backlog SET status='REVIEW_REQUIRED',
        research_attempts=research_attempts+1,last_research_at=now(),next_attempt_at=NULL,last_research_error=NULL,
        last_evidence_id=$2,updated_at=now() WHERE backlog_id=$1`,[item.backlog_id,evidenceId]);
      await db.query('COMMIT');
    }catch(error){await db.query('ROLLBACK');throw error;}
    const applicationEvidence=applicationEvidenceForDossier(dossier,evidenceId);
    const values=proposedValues(dossier,evidenceId,capturedAt,applicationEvidence);
    const approvedFields=Object.keys(values);
    const candidate={
      schema_version:'2.0.0',
      candidate_id:'CQDOS_'+stableId(evidenceId),
      target_sku:item.sku,
      gap_type:'SOURCE',
      change_type:'catalogue_correction',
      workflow_status:'REVIEW_REQUIRED',
      dossier_status:'DOSSIER_COMPLETE',
      canonical_role:canonicalRole,
      approval_required:true,
      automatic_publication_allowed:false,
      evidence_id:evidenceId,
      source_urls:uniqueUrls(dossier),
      application_evidence:applicationEvidence,
      dossier,
      publication:{
        target_sku:item.sku,
        approved_fields:approvedFields,
        proposed_values:values
      },
      approval:null,
      created_at:capturedAt
    };
    const reviewDir=path.join(root,'hermes/catalogue-quality/review-candidates');
    fs.mkdirSync(reviewDir,{recursive:true});
    const reviewPath=path.join(reviewDir,candidate.candidate_id+'.json');
    fs.writeFileSync(reviewPath,JSON.stringify(candidate,null,2)+'\n');
    run.results.push({sku:item.sku,status:'DOSSIER_COMPLETE',evidence_id:evidenceId,review_candidate:path.relative(root,reviewPath)});
  }
} finally { await db.end(); }

run.summary={
  processed:run.results.length,
  dossier_complete:run.results.filter(x=>x.status==='DOSSIER_COMPLETE').length,
  dossier_incomplete:run.results.filter(x=>x.status==='DOSSIER_INCOMPLETE').length,
  discarded_no_evidence:run.results.filter(x=>x.status==='DISCARDED_NO_EVIDENCE').length,
  research_error:run.results.filter(x=>x.status==='RESEARCH_ERROR').length
};
const outDir=path.join(root,'hermes/catalogue-quality/dossier-runs');
fs.mkdirSync(outDir,{recursive:true});
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const output=path.join(outDir,'dossier-research-'+stamp+'.json');
fs.writeFileSync(output,JSON.stringify(run,null,2)+'\n');
fs.writeFileSync(path.join(root,'hermes/catalogue-quality/dossier-latest.json'),JSON.stringify({...run,output:path.relative(root,output)},null,2)+'\n');
console.log(JSON.stringify({output,...run.summary},null,2));
