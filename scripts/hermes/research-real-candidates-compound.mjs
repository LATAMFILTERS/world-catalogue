#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolveRealCandidatesInputDir, validateCandidate } from './hermes-core.mjs';

const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.HERMES_GROQ_MODEL || 'groq/compound';
const TIMEOUT_MS = Number(process.env.HERMES_RESEARCH_TIMEOUT_MS || 20000);
const MAX_EVIDENCE_CHARS = Number(process.env.HERMES_RESEARCH_MAX_EVIDENCE_CHARS || 16000);

const hash = (v) => crypto.createHash('sha256').update(String(v)).digest('hex');
const plain = (html) => String(html).replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim();
const stripFence = (v) => String(v || '').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();

export function validateResolution(r) {
  const e = [];
  if (!r || typeof r !== 'object') return ['resolution must be an object'];
  if (r.status !== 'VERIFIED') e.push('status must be VERIFIED');
  if (typeof r.finding_title !== 'string' || r.finding_title.trim().length < 8) e.push('finding_title missing');
  try { new URL(r.evidence_url); } catch { e.push('evidence_url invalid'); }
  if (!Array.isArray(r.technical_facts) || !r.technical_facts.length) e.push('technical_facts missing');
  if (typeof r.relevance !== 'string' || r.relevance.trim().length < 12) e.push('relevance missing');
  if (typeof r.proposed_action !== 'string' || r.proposed_action.trim().length < 20) e.push('proposed_action missing');
  if (typeof r.confidence !== 'number' || r.confidence < 0.65 || r.confidence > 1) e.push('confidence must be >= 0.65');
  return e;
}

async function fetchEvidence(url, fetchImpl = globalThis.fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetchImpl(url, { redirect:'follow', signal:controller.signal, headers:{'User-Agent':'ELIMFILTERS-HERMES/1.2 (+groq-compound-research)'} });
    if (!res.ok) return { ok:false, error:`HTTP ${res.status}`, status:res.status, text:'' };
    const text = plain(await res.text()).slice(0, MAX_EVIDENCE_CHARS);
    return { ok:text.length >= 120, error:text.length >= 120 ? null : 'INSUFFICIENT_EVIDENCE_CONTENT', status:res.status, text };
  } catch (err) {
    return { ok:false, error:String(err?.message || err), status:null, text:'' };
  } finally { clearTimeout(timer); }
}

async function groqSearch(candidate, apiKey, fetchImpl = globalThis.fetch) {
  const system = `You are HERMES, ELIMFILTERS industrial intelligence search resolver. You MUST actively use Groq Compound live web search and website visiting. A changed homepage/newsroom is only a signal, never a finding. Resolve it into the specific current article, bulletin, standard change, product/application update, filter-media development, OEM update, or concrete industry item. Search enough to determine what actually changed. Prefer official/primary evidence. Never invent facts, URLs, dates, standards, specifications, or claims. Competitor names and proprietary competitor technology are internal provenance only; write relevance and proposed actions in neutral ELIMFILTERS technical language. Return strict JSON only.`;
  const input = {
    instruction:'Search the live web now and resolve this signal. Do not return generic wording telling a human to investigate.',
    signal:{entity_code:candidate.entity_code,publisher:candidate.source_publisher,source_url:candidate.source_url,source_title:candidate.source_title,candidate_type:candidate.candidate_type,category:candidate.category,captured_at:candidate.captured_at,snippet:candidate.extracted_snippet || null},
    required_json:{status:'VERIFIED or UNRESOLVED',finding_title:'specific item',evidence_url:'absolute strongest evidence URL',published_at:'ISO date if supported else null',technical_facts:['specific fact'],affected_entities:['neutral technical entity'],relevance:'ELIMFILTERS relevance',proposed_action:'specific review proposal',confidence:'0..1',source_type:'PRIMARY or SECONDARY_VERIFIED'}
  };
  const res = await fetchImpl(ENDPOINT,{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json','Groq-Model-Version':'latest'},body:JSON.stringify({model:MODEL,temperature:0,response_format:{type:'json_object'},messages:[{role:'system',content:system},{role:'user',content:JSON.stringify(input)}]})});
  if (!res.ok) throw new Error(`Groq HTTP ${res.status}: ${(await res.text()).slice(0,400)}`);
  const payload = await res.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Groq returned no content');
  return { resolution:JSON.parse(stripFence(content)), tool_calls:payload?.choices?.[0]?.message?.executed_tools?.length || 0 };
}

async function resolveOne(candidate, apiKey, fetchImpl) {
  const started = new Date().toISOString();
  const unresolved = (reason, extra={}) => ({...candidate,workflow_status:'NEEDS_RESEARCH',research_resolution:{status:'UNRESOLVED',engine:'GROQ',model:MODEL,reason,...extra,started_at:started,resolved_at:new Date().toISOString()}});
  if (!apiKey) return {resolved:false,candidate:unresolved('GROQ_API_KEY_MISSING')};
  let search;
  try { search = await groqSearch(candidate,apiKey,fetchImpl); }
  catch (err) { return {resolved:false,candidate:unresolved('GROQ_SEARCH_FAILED',{error:String(err?.message || err)})}; }
  const errors = validateResolution(search.resolution);
  if (errors.length) return {resolved:false,candidate:unresolved('GROQ_RESULT_NOT_VERIFIABLE',{validation_errors:errors,tool_calls:search.tool_calls})};
  const evidenceUrl = new URL(search.resolution.evidence_url).toString();
  const evidence = await fetchEvidence(evidenceUrl,fetchImpl);
  if (!evidence.ok) return {resolved:false,candidate:unresolved('EVIDENCE_FETCH_FAILED',{evidence_url:evidenceUrl,evidence_fetch_error:evidence.error,tool_calls:search.tool_calls})};
  const published = search.resolution.published_at && !Number.isNaN(Date.parse(search.resolution.published_at)) ? new Date(search.resolution.published_at).toISOString() : null;
  const resolved = {...candidate,workflow_status:'PENDING_REVIEW',source_url:evidenceUrl,source_title:search.resolution.finding_title,published_at:published || candidate.published_at || null,last_verified_at:new Date().toISOString(),confidence:Math.min(1,Math.max(0.65,search.resolution.confidence)),evidence_level:search.resolution.source_type === 'PRIMARY' ? 'PRIMARY' : candidate.evidence_level,affected_entities:Array.isArray(search.resolution.affected_entities)&&search.resolution.affected_entities.length?search.resolution.affected_entities:candidate.affected_entities,proposed_action:search.resolution.proposed_action,change_classification:'RESEARCH_RESOLVED',research_resolution:{status:'VERIFIED',engine:'GROQ',model:MODEL,search_mode:'WEB_SEARCH_AND_VISIT_WEBSITE',finding_title:search.resolution.finding_title,evidence_url:evidenceUrl,published_at:published,technical_facts:search.resolution.technical_facts,relevance:search.resolution.relevance,confidence:search.resolution.confidence,source_type:search.resolution.source_type || null,evidence_sha256:hash(evidence.text),evidence_chars_verified:evidence.text.length,tool_calls:search.tool_calls,started_at:started,resolved_at:new Date().toISOString()}};
  const candidateErrors = validateCandidate(resolved);
  if (candidateErrors.length) return {resolved:false,candidate:{...resolved,workflow_status:'NEEDS_RESEARCH',research_resolution:{...resolved.research_resolution,status:'UNRESOLVED',reason:'CANDIDATE_VALIDATION_FAILED',validation_errors:candidateErrors}}};
  return {resolved:true,candidate:resolved};
}

function atomic(file,value){const tmp=`${file}.tmp-${process.pid}`;fs.writeFileSync(tmp,`${JSON.stringify(value,null,2)}\n`,'utf8');fs.renameSync(tmp,file);}

export async function runResearch({inputDir=resolveRealCandidatesInputDir(),apiKey=process.env.GROQ_API_KEY,fetchImpl=globalThis.fetch}={}){
  const dir=path.resolve(inputDir); if(!fs.existsSync(dir)) return {scanned:0,resolved:0,unresolved:0,results:[]};
  const results=[];
  for(const name of fs.readdirSync(dir).filter(f=>f.endsWith('.json')).sort()){
    const file=path.join(dir,name); const candidate=JSON.parse(fs.readFileSync(file,'utf8'));
    if(!String(candidate.entity_code||'').startsWith('HERMES_REAL_')) continue;
    if(candidate.research_resolution?.status==='VERIFIED'&&candidate.workflow_status==='PENDING_REVIEW'){results.push({entity_code:candidate.entity_code,status:'ALREADY_RESOLVED'});continue;}
    const out=await resolveOne({...candidate,workflow_status:'NEEDS_RESEARCH'},apiKey,fetchImpl); atomic(file,out.candidate); results.push({entity_code:candidate.entity_code,status:out.resolved?'RESOLVED':'UNRESOLVED',reason:out.candidate.research_resolution?.reason||null});
  }
  return {scanned:results.length,resolved:results.filter(r=>r.status==='RESOLVED'||r.status==='ALREADY_RESOLVED').length,unresolved:results.filter(r=>r.status==='UNRESOLVED').length,results};
}

const isCli=process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href;
if(isCli){const s=await runResearch();console.log(`[HERMES research] scanned=${s.scanned} resolved=${s.resolved} unresolved=${s.unresolved}`);for(const r of s.results)console.log(`[HERMES research] ${r.entity_code}: ${r.status}${r.reason?` (${r.reason})`:''}`);}
