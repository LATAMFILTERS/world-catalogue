#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const url=process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
const apiKey=process.env.GROQ_API_KEY;
const model=process.env.HERMES_GROQ_MODEL || 'openai/gpt-oss-120b';
const fallbackModel=process.env.HERMES_GROQ_FALLBACK_MODEL || 'openai/gpt-oss-20b';
const maxResearchRetries=Math.max(0,Math.min(3,Number(process.env.HERMES_CATALOGUE_RESEARCH_RETRIES||2)));
const pacingMs=Math.max(0,Number(process.env.HERMES_CATALOGUE_RESEARCH_PACING_MS||20000));
const limit=Math.max(1,Math.min(100,Number(process.env.HERMES_CATALOGUE_RESEARCH_LIMIT||4)));
const timeoutMs=Math.max(5000,Number(process.env.HERMES_CATALOGUE_RESEARCH_TIMEOUT_MS||25000));
const retryHours=Math.max(6,Number(process.env.HERMES_CATALOGUE_RESEARCH_RETRY_HOURS||168));
if(!url) throw new Error('DATABASE_URL/CATALOG_DATABASE_URL is required');
if(!apiKey) throw new Error('GROQ_API_KEY is required');

const norm=v=>String(v||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,'');
const stableId=v=>crypto.createHash('sha256').update(String(v)).digest('hex').slice(0,32);
const hash=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
const stripFence=v=>String(v||'').trim().replace(/^\`\`\`(?:json)?\s*/i,'').replace(/\s*\`\`\`$/,'').trim();

function host(value){
  try{return new URL(value).hostname.toLowerCase().replace(/^www\./,'');}catch{return null;}
}
function hostAllowed(url,domain){
  const a=host(url), b=host(domain);
  return Boolean(a&&b&&(a===b||a.endsWith('.'+b)));
}
async function fetchText(target){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const r=await fetch(target,{redirect:'follow',signal:controller.signal,headers:{'User-Agent':'ELIMFILTERS-HERMES-CATALOGUE/1.0'}});
    const text=await r.text();
    return {ok:r.ok,status:r.status,text:text.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,50000)};
  }catch(error){return {ok:false,status:null,text:'',error:String(error?.message||error)}}
  finally{clearTimeout(timer)}
}

function systemPrompt(){
  return `You are HERMES catalogue evidence research for ELIMFILTERS.
Your job is evidence acquisition, not catalogue editing.
Use live web search and website visiting. Never infer manufacturer, compatibility, dimensions, applications, cross references, images, or packaging from code shape or similarity.
Prefer primary manufacturer/OEM catalogues, official product pages, official PDFs, technical bulletins and official service/application documentation.
Candidate manufacturers and organizations are hints only.
For SOURCE identity, when source_candidate_code is supplied, verify that governed candidate code on the selected official authority. The current codigo_base may be a legacy placeholder and must not be treated as a manufacturer part number. If no governed source candidate is supplied, establish identity from primary evidence without inferring from cross-references.
For every gap, return only facts supported by the evidence URL.
If exact evidence cannot be established, return UNRESOLVED.
Return strict JSON only.`;
}

function requiredShape(item){
  return {
    status:'VERIFIED or UNRESOLVED',
    gap_type:item.gap_type,
    manufacturer:'source-reported manufacturer or null',
    source_code:'exact source code or null',
    organization_id:'known organization id if supported else null',
    evidence_url:'absolute strongest primary evidence URL or null',
    evidence_title:'string or null',
    source_type:'official_product_page | official_catalogue | official_pdf | technical_bulletin | service_information | official_api | null',
    facts:['specific source-reported fact'],
    payload:'object containing only evidence relevant to the requested gap',
    confidence:'0..1',
    unresolved_reason:'string or null'
  };
}
async function sleep(ms){ return new Promise(resolve=>setTimeout(resolve,ms)); }
function retryDelayMs(status,text,attempt){
  if(status!==429) return 0;
  const m=String(text||'').match(/try again in ([0-9.]+)s/i);
  return Math.ceil((m?Number(m[1]):15)*1000)+1500+(attempt*1000);
}
async function researchOne(item){
  const input={
    instruction:'Resolve this exact ELIMFILTERS catalogue evidence gap. Do not propose a catalogue change unless exact primary evidence exists.',
    target:{
      sku:item.sku,
      codigo_base:item.discovery_hints?.codigo_base||null,
      source_candidate_code:item.discovery_hints?.source_candidate_code||null,
      source_candidate_brand:item.discovery_hints?.source_candidate_brand||null,
      source_candidate_state:item.discovery_hints?.source_candidate_state||null,
      duty:item.duty,technology:item.technology,filter_type:item.filter_type,gap_type:item.gap_type
    },
    authority_hint:item.authority_hint||null,selected_organization:item.organization||null,selected_source:item.source||null,
    manufacturer_candidates:item.manufacturer_candidates||[],organization_candidates:item.organization_candidates||[],
    required_json:requiredShape(item)
  };
  let requestModel=model;
  let lastError=null;
  for(let attempt=0;attempt<=maxResearchRetries;attempt++){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeoutMs*2);
    try{
      const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{
        method:'POST',signal:controller.signal,
        headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json','Groq-Model-Version':'latest'},
        body:JSON.stringify({model:requestModel,temperature:0,max_completion_tokens:1000,response_format:{type:'json_object'},messages:[{role:'system',content:systemPrompt()},{role:'user',content:JSON.stringify(input)}]})
      });
      if(!r.ok){
        const body=(await r.text()).slice(0,1200);
        if(r.status===413 && requestModel!==fallbackModel){ requestModel=fallbackModel; lastError=new Error('Groq HTTP 413; retrying '+fallbackModel); continue; }
        const waitMs=retryDelayMs(r.status,body,attempt);
        lastError=new Error('Groq HTTP '+r.status+': '+body);
        if(waitMs>0 && attempt<maxResearchRetries){ await sleep(waitMs); continue; }
        throw lastError;
      }
      const body=await r.json();
      const content=body?.choices?.[0]?.message?.content;
      if(!content) throw new Error('Groq returned no content');
      return {result:JSON.parse(stripFence(content)),tool_calls:body?.choices?.[0]?.message?.executed_tools?.length||0,model:requestModel};
    }catch(error){ lastError=error; if(attempt>=maxResearchRetries) throw error; }
    finally{ clearTimeout(timer); }
  }
  throw lastError||new Error('HERMES research failed');
}

function findOrganization(result,organizations,item){
  const requested=String(result.organization_id||'').trim();
  if(requested){
    const exact=organizations.find(x=>x.id===requested);
    if(exact) return exact;
  }
  const n=norm(result.manufacturer);
  if(!n) return null;
  return organizations.find(x=>[x.name,x.parent_company,x.id?.replace(/_/g,' '),...(x.aliases||[])].some(v=>norm(v)===n)) || null;
}
async function validateResearch(item,raw,organizations){
  const result=raw?.result||{};
  if(result.status!=='VERIFIED') return {status:'UNRESOLVED',reason:result.unresolved_reason||'HERMES did not establish exact primary evidence',result};
  if(!result.evidence_url || !/^https:\/\//i.test(result.evidence_url)) return {status:'UNRESOLVED',reason:'Missing HTTPS evidence URL',result};
  if(!Array.isArray(result.facts) || result.facts.length===0) return {status:'UNRESOLVED',reason:'No verifiable facts returned',result};

  const org=findOrganization(result,organizations,item);
  const authoritativeOrg=item.organization || org;
  const domainOk=authoritativeOrg?.official_domain ? hostAllowed(result.evidence_url,authoritativeOrg.official_domain) : false;
  const page=await fetchText(result.evidence_url);
  const base=String(item.discovery_hints?.codigo_base||'').trim();
  const sourceCode=String(result.source_code||base||'').trim();
  const pageHasCode=Boolean(sourceCode && page.ok && norm(page.text).includes(norm(sourceCode)));
  const sourceOwnsCode=item.gap_type!=='SOURCE' ? true : Boolean(sourceCode && expectedSourceCode && norm(sourceCode)===norm(expectedSourceCode));

  const verified=Boolean(domainOk && page.ok && pageHasCode && sourceOwnsCode);
  return {
    status:verified?'VERIFIED':'REVIEW_REQUIRED',
    reason:verified?null:[
      !domainOk?'official-domain-match-not-established':null,
      !page.ok?'evidence-page-fetch-failed':null,
      !pageHasCode?'exact-code-not-observed-on-fetched-page':null,
      !sourceOwnsCode?'returned-source-code-does-not-match-governed-expected-code':null
    ].filter(Boolean).join('; '),
    result,
    organization:authoritativeOrg||null,
    page:{ok:page.ok,status:page.status,sha256:page.text?hash(page.text):null,chars:page.text?.length||0},
    tool_calls:raw.tool_calls||0
  };
}

function evidenceRecord(item,validation){
  const r=validation.result;
  const payload={
    gap_type:item.gap_type,
    manufacturer:r.manufacturer||null,
    source_code:r.source_code||item.discovery_hints?.codigo_base||null,
    evidence_title:r.evidence_title||null,
    facts:r.facts||[],
    evidence_payload:r.payload||{},
    confidence:Number(r.confidence)||0,
    organization_id:validation.organization?.id||r.organization_id||null
  };
  const id='CQE_'+stableId([item.backlog_id,r.evidence_url,payload.source_code,JSON.stringify(payload)].join('|'));
  return {
    evidence_id:id,sku:item.sku,
    field_group:item.gap_type==='SOURCE'?'SOURCE_IDENTITY':item.gap_type,
    field_name:item.gap_type.toLowerCase(),
    authority:r.manufacturer||validation.organization?.name||null,
    source_type:String(r.source_type||'HERMES_WEB_RESEARCH').toUpperCase(),
    source_url:r.evidence_url,
    source_hash:validation.page?.sha256||hash(JSON.stringify(payload)),
    verification_status:validation.status,
    payload,
    provenance:{
      engine:'HERMES_GROQ_COMPOUND',
      model,
      work_order_backlog_id:item.backlog_id,
      research_mode:item.mode,
      page_fetch:validation.page,
      validation_reason:validation.reason,
      tool_calls:validation.tool_calls
    },
    captured_at:new Date().toISOString()
  };
}
const orgDoc=JSON.parse(fs.readFileSync(path.join(root,'hermes/config/source-organizations.json'),'utf8'));
const organizations=orgDoc.organizations||[];
const indexPath=path.join(root,'hermes/catalogue-quality/work-orders/index.json');
if(!fs.existsSync(indexPath)) throw new Error('Catalogue quality work-order index is missing; run hermes:catalogue:work-orders first');
const index=JSON.parse(fs.readFileSync(indexPath,'utf8'));

const selected=[];
for(const batch of index.batches||[]){
  if(selected.length>=limit) break;
  const file=path.join(root,batch.file);
  if(!fs.existsSync(file)) continue;
  const doc=JSON.parse(fs.readFileSync(file,'utf8'));
  for(const item of doc.items||[]){
    if(selected.length>=limit) break;
    selected.push(item);
  }
}

const db=new Client({connectionString:url});
await db.connect();
const run={schema_version:'1.0.0',generated_at:new Date().toISOString(),model,limit,selected:selected.length,results:[]};
try{
  for(const item of selected){
    let validation;
    try{
      const raw=await researchOne(item);
      validation=await validateResearch(item,raw,organizations);
    }catch(error){
      validation={status:'UNRESOLVED',reason:String(error?.message||error),result:{}};
    }

    if(validation.status==='UNRESOLVED'){
      const transient=/Groq HTTP (413|429|5\d\d)|ECONNRESET|fetch failed|aborted/i.test(String(validation.reason||''));
      const next=new Date(Date.now()+(transient?1:retryHours)*3600_000).toISOString();
      await db.query(`UPDATE hermes_catalogue_backlog
        SET research_attempts=research_attempts+1,last_research_at=now(),next_attempt_at=$2,last_research_error=$3,updated_at=now()
        WHERE backlog_id=$1`,[item.backlog_id,next,validation.reason]);
      run.results.push({sku:item.sku,backlog_id:item.backlog_id,gap_type:item.gap_type,status:'UNRESOLVED',reason:validation.reason,next_attempt_at:next});
      continue;
    }

    const evidence=evidenceRecord(item,validation);
    await db.query('BEGIN');
    try{
      await db.query(`INSERT INTO hermes_catalogue_evidence
        (evidence_id,sku,field_group,field_name,authority,source_type,source_url,source_hash,verification_status,payload,provenance,captured_at,updated_at)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb,$12,now())
        ON CONFLICT(evidence_id) DO UPDATE SET
          authority=excluded.authority,source_type=excluded.source_type,source_url=excluded.source_url,
          source_hash=excluded.source_hash,verification_status=excluded.verification_status,
          payload=excluded.payload,provenance=excluded.provenance,captured_at=excluded.captured_at,updated_at=now()`,
        [evidence.evidence_id,evidence.sku,evidence.field_group,evidence.field_name,evidence.authority,evidence.source_type,evidence.source_url,evidence.source_hash,evidence.verification_status,JSON.stringify(evidence.payload),JSON.stringify(evidence.provenance),evidence.captured_at]);
      const backlogStatus=validation.status==='VERIFIED'?'EVIDENCE_FOUND':'REVIEW_REQUIRED';
      await db.query(`UPDATE hermes_catalogue_backlog
        SET status=$2,research_attempts=research_attempts+1,last_research_at=now(),next_attempt_at=NULL,
            last_research_error=$3,last_evidence_id=$4,updated_at=now()
        WHERE backlog_id=$1`,
        [item.backlog_id,backlogStatus,validation.reason||null,evidence.evidence_id]);
      await db.query('COMMIT');
    }catch(error){
      await db.query('ROLLBACK');
      throw error;
    }

    const reviewDir=path.join(root,'hermes/catalogue-quality/review-candidates');
    fs.mkdirSync(reviewDir,{recursive:true});
    const review={
      schema_version:'1.0.0',
      candidate_id:'CQCAT_'+stableId(evidence.evidence_id),
      target_sku:item.sku,
      gap_type:item.gap_type,
      change_type:'catalogue_correction',
      workflow_status:'REVIEW_REQUIRED',
      approval_required:true,
      automatic_publication_allowed:false,
      evidence_id:evidence.evidence_id,
      evidence_status:evidence.verification_status,
      manufacturer:evidence.payload.manufacturer,
      source_code:evidence.payload.source_code,
      source_urls:[evidence.source_url],
      evidence:[evidence],
      proposed_values:item.gap_type==='SOURCE'?{
        source_identity:{
          canonical_source_brand:evidence.payload.manufacturer,
          canonical_source_code:evidence.payload.source_code,
          canonical_source_url:evidence.source_url,
          canonical_source_status:'VERIFIED',
          canonical_verified_at:evidence.captured_at,
          canonical_evidence:{
            evidence_id:evidence.evidence_id,
            source_hash:evidence.source_hash,
            authority:evidence.authority,
            provenance:evidence.provenance
          }
        }
      }:(evidence.payload.evidence_payload||{}),
      approval:null,
      created_at:new Date().toISOString()
    };
    const reviewPath=path.join(reviewDir,`${review.candidate_id}.json`);
    fs.writeFileSync(reviewPath,JSON.stringify(review,null,2)+'\n');

    run.results.push({
      sku:item.sku,backlog_id:item.backlog_id,gap_type:item.gap_type,
      status:validation.status,evidence_id:evidence.evidence_id,
      review_candidate:path.relative(root,reviewPath),
      source_url:evidence.source_url,reason:validation.reason||null
    });
  }
  const outDir=path.join(root,'hermes/catalogue-quality/research-runs');
  fs.mkdirSync(outDir,{recursive:true});
  const stamp=new Date().toISOString().replace(/[:.]/g,'-');
  const output=path.join(outDir,`catalogue-quality-research-${stamp}.json`);
  run.summary={
    processed:run.results.length,
    verified:run.results.filter(x=>x.status==='VERIFIED').length,
    review_required:run.results.filter(x=>x.status==='REVIEW_REQUIRED').length,
    unresolved:run.results.filter(x=>x.status==='UNRESOLVED').length
  };
  fs.writeFileSync(output,JSON.stringify(run,null,2)+'\n');
  fs.writeFileSync(path.join(root,'hermes/catalogue-quality/research-latest.json'),JSON.stringify({...run,output:path.relative(root,output)},null,2)+'\n');
  console.log(JSON.stringify({output,...run.summary},null,2));
} finally {
  await db.end();
}
