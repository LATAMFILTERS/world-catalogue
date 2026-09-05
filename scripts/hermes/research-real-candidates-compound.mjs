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
const MAX_SEARCH_ATTEMPTS = Number(process.env.HERMES_RESEARCH_ATTEMPTS || 3);
const KNOWLEDGE_ACTIONS = ['CREATE_NEW','UPDATE_REINFORCE','NO_MATERIAL_CHANGE','INTERNAL_ONLY'];

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
  if (!['OEM','AFTERMARKET','FILTER_MEDIA','STANDARD','TECHNICAL','SUPPLIER','INDUSTRY'].includes(r.finding_type)) e.push('finding_type invalid');
  if (!['CATALOGUE','KNOWLEDGE_CENTER','TECHNICAL_INTELLIGENCE','TECHNOLOGY_WATCH','STANDARDS','OEM_APPLICATION_INTELLIGENCE','INTERNAL_ONLY'].includes(r.destination)) e.push('destination invalid');
  if (!KNOWLEDGE_ACTIONS.includes(r.knowledge_action)) e.push('knowledge_action invalid');
  if (r.existing_elimfilters_url != null) {
    try { new URL(r.existing_elimfilters_url); } catch { e.push('existing_elimfilters_url invalid'); }
  }
  return e;
}

async function fetchEvidence(url, fetchImpl = globalThis.fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetchImpl(url, { redirect:'follow', signal:controller.signal, headers:{'User-Agent':'ELIMFILTERS-HERMES/2.0 (+groq-compound-research)'} });
    if (!res.ok) return { ok:false, error:`HTTP ${res.status}`, status:res.status, text:'' };
    const text = plain(await res.text()).slice(0, MAX_EVIDENCE_CHARS);
    return { ok:text.length >= 120, error:text.length >= 120 ? null : 'INSUFFICIENT_EVIDENCE_CONTENT', status:res.status, text };
  } catch (err) {
    return { ok:false, error:String(err?.message || err), status:null, text:'' };
  } finally { clearTimeout(timer); }
}

function researchSystemPrompt(attempt) {
  return `You are HERMES, the industrial filtration intelligence search resolver for ELIMFILTERS. You MUST actively use Groq Compound live web search and website visiting. This is search-and-resolution work, not generic summarization.

NON-NEGOTIABLE OBJECTIVE
A changed homepage, newsroom, catalogue page or manufacturer page is only a signal. You must find the specific current item behind that signal and return a concrete evidence-backed candidate. Do not tell a human to investigate something you can search yourself.

WHAT ELIMFILTERS NEEDS YOU TO CAPTURE
1. OEM intelligence: engines, engine families, vehicles, machines, equipment models, platforms, model years, new generations, technical changes, service applications and maintenance/filtration implications.
2. AFTERMARKET intelligence — PRIORITY: new replacement-filter coverage, application additions, cross-reference relationships, supersessions, service-part additions, dimensional/specification revisions, new catalogue entries, new fitments and coverage expansions.
3. Filtration families: air, cabin, coolant, fuel, fuel/water separator, turbine fuel separator, housings/intake systems, hydraulic, lube/oil, marine filtration and air dryer/desiccant filtration.
4. Technical domains: filter media, filter paper, cellulose/synthetic/glass/nanofiber media, efficiency, restriction, particle and fluid mechanics, contamination control, water separation, cleanliness, fuels, lubricants, coolants, hydraulic fluids, reliability, service intervals, standards, testing and environment/emissions.
5. New powertrains: EV cabin filtration, battery thermal management, dielectric fluids, e-axle/transmission filtration, fuel cells, hydrogen filtration, battery vent filtration and hybrid systems.
6. Equipment/industry relationships: Agriculture, Automotive, Bus & Coach, Construction, Manufacturing, Marine, Mining, Oil & Gas, Power Generation, Railway, Truck Fleets and Waste/Municipal.
7. Catalogue intelligence: explicit part numbers, engine/equipment applications, model/year ranges, references, dimensions, specifications and relationships only when the source actually supports them.

SEARCH PROCEDURE
A. Start from the supplied source URL/publisher and identify the most recent or modified technical/product/catalogue/news item relevant to filtration, engines, equipment, materials, fluids or applications.
B. Search the publisher's own site first: newsroom, product pages, technical bulletins, catalogues, application guides, PDFs and service information.
C. If the source is an OEM, look for engine/equipment/application changes and determine whether they create filtration/catalogue implications.
D. If the source is aftermarket, actively look for new filter numbers, applications, cross references, supersessions and coverage updates.
E. If the source is filter media/materials/standards/technical press, extract the concrete technical development and its relevance to ELIMFILTERS systems or Knowledge Center.
F. Search ELIMFILTERS public Knowledge Center / knowledge-system pages for the same topic BEFORE proposing knowledge work. Classify the result as CREATE_NEW if absent; UPDATE_REINFORCE if existing knowledge should be corrected, expanded or refreshed; NO_MATERIAL_CHANGE if ELIMFILTERS already covers the same fact adequately; INTERNAL_ONLY if it should not become public knowledge.
G. Do not duplicate an existing article or technical note simply because a second source reports the same fact. Reinforce/update the existing topic instead.
H. Cross-check the exact external evidence URL by visiting it. Prefer primary evidence. Use a strong secondary technical source only when primary evidence is unavailable.
I. Ignore unrelated corporate finance, investor relations, hiring, awards, sponsorships, lifestyle or generic marketing unless it contains a concrete filtration/engine/material/fluid/application fact.
J. Never invent facts, URLs, dates, standards, part numbers, cross references, dimensions, applications or compatibility.
K. Competitor identity/technology may be retained only as INTERNAL provenance. proposed_action and public_safe_fact must use neutral ELIMFILTERS technical language and must not promote or copy proprietary competitor claims.
L. Search attempt ${attempt} of ${MAX_SEARCH_ATTEMPTS}. ${attempt > 1 ? 'Previous search was not sufficient. Broaden the query, inspect deeper product/catalogue/application pages, and try alternate primary-source paths before returning UNRESOLVED.' : 'Search broadly enough on the first pass to identify the real item, not just the changed landing page.'}

READY STANDARD
Return VERIFIED only when you have: a specific item, a fetchable evidence URL, at least one verifiable technical/application fact, affected entities, clear ELIMFILTERS relevance, a destination, a knowledge_action and a specific action Victor can approve/reject.

Return strict JSON only.`;
}

async function groqSearch(candidate, apiKey, attempt = 1, previousErrors = [], fetchImpl = globalThis.fetch) {
  const input = {
    instruction:'Search the live web now and resolve this source-change signal into a concrete industrial filtration intelligence candidate. Compare it against ELIMFILTERS existing knowledge and do not return generic wording telling a human to investigate.',
    search_attempt:attempt,
    previous_validation_errors:previousErrors,
    signal:{entity_code:candidate.entity_code,publisher:candidate.source_publisher,source_url:candidate.source_url,source_title:candidate.source_title,candidate_type:candidate.candidate_type,category:candidate.category,captured_at:candidate.captured_at,snippet:candidate.extracted_snippet || null},
    required_json:{status:'VERIFIED or UNRESOLVED',finding_type:'OEM | AFTERMARKET | FILTER_MEDIA | STANDARD | TECHNICAL | SUPPLIER | INDUSTRY',finding_title:'specific item',evidence_url:'absolute strongest evidence URL',published_at:'ISO date if supported else null',technical_facts:['specific verifiable fact'],affected_entities:['engine/equipment/filter/application/technical entity'],destination:'CATALOGUE | KNOWLEDGE_CENTER | TECHNICAL_INTELLIGENCE | TECHNOLOGY_WATCH | STANDARDS | OEM_APPLICATION_INTELLIGENCE | INTERNAL_ONLY',knowledge_action:'CREATE_NEW | UPDATE_REINFORCE | NO_MATERIAL_CHANGE | INTERNAL_ONLY',existing_elimfilters_url:'matching ELIMFILTERS URL or null',relevance:'ELIMFILTERS relevance',public_safe_fact:'neutral technical wording without competitor marketing',proposed_action:'specific review proposal for Victor; for UPDATE_REINFORCE describe what existing knowledge should gain/change',content_channels:['BLOG | WEEKLY_PODCAST | NEWSLETTER | SOCIAL | CUSTOMER_EMAIL | SALES_INTELLIGENCE'],confidence:'0..1',source_type:'PRIMARY or SECONDARY_VERIFIED'}
  };
  const res = await fetchImpl(ENDPOINT,{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json','Groq-Model-Version':'latest'},body:JSON.stringify({model:MODEL,temperature:0,max_completion_tokens:2500,response_format:{type:'json_object'},messages:[
{role:'system',content:MODEL === 'groq/compound-mini'
? `You are HERMES, ELIMFILTERS industrial filtration intelligence researcher.

Use live web search and website visiting.

Resolve the supplied source signal into ONE concrete, current, verifiable finding relevant to filtration, filter media, OEM equipment, applications, standards, fluids, engines or industrial reliability.

Rules:
- Search the supplied publisher/domain first.
- Prefer a specific product page, release, technical document, application page or primary evidence URL.
- Never invent facts, part numbers, dates, applications, standards or URLs.
- Ignore generic corporate/financial/marketing news without technical relevance.
- Return VERIFIED only with a concrete finding, valid evidence URL and technical facts.
- If no concrete evidence can be established, return UNRESOLVED.
- Competitor information is internal provenance only; public_safe_fact must use neutral technical language.
- Return strict JSON matching the requested schema.`
: researchSystemPrompt(attempt)},
{role:'user',content:JSON.stringify(input)}
]})});
  if (!res.ok) {
    const body = (await res.text()).slice(0, 800);

    if (res.status === 429) {
        const retryAfterHeader = Number(res.headers.get('retry-after') || 0);
        const retryMatch = body.match(/try again in\s+([\d.]+)s/i);
        const retrySeconds = retryAfterHeader || Number(retryMatch?.[1] || 20);

        const error = new Error(`Groq HTTP 429: ${body}`);
        error.retryAfterMs = Math.ceil((retrySeconds + 2) * 1000);
        throw error;
    }

    throw new Error(`Groq HTTP ${res.status}: ${body}`);
}
  const payload = await res.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Groq returned no content');
  return { resolution:repairMojibakeDeep(JSON.parse(stripFence(content))), tool_calls:payload?.choices?.[0]?.message?.executed_tools?.length || 0 };
}

const CP1252_REVERSE = new Map([
  [0x20AC,0x80],[0x201A,0x82],[0x0192,0x83],[0x201E,0x84],
  [0x2026,0x85],[0x2020,0x86],[0x2021,0x87],[0x02C6,0x88],
  [0x2030,0x89],[0x0160,0x8A],[0x2039,0x8B],[0x0152,0x8C],
  [0x017D,0x8E],[0x2018,0x91],[0x2019,0x92],[0x201C,0x93],
  [0x201D,0x94],[0x2022,0x95],[0x2013,0x96],[0x2014,0x97],
  [0x02DC,0x98],[0x2122,0x99],[0x0161,0x9A],[0x203A,0x9B],
  [0x0153,0x9C],[0x017E,0x9E],[0x0178,0x9F]
]);

function repairMojibakeString(value) {
  if (typeof value !== 'string' || !/[ÃÂâ]/.test(value)) return value;

  const bytes = [];
  for (const ch of value) {
    const cp = ch.codePointAt(0);

    if (cp <= 0xFF) {
      bytes.push(cp);
      continue;
    }

    const mapped = CP1252_REVERSE.get(cp);
    if (mapped === undefined) return value;
    bytes.push(mapped);
  }

  const repaired = Buffer.from(bytes).toString('utf8');

  const badCount = text => (text.match(/[ÃÂâ]/g) || []).length;
  return badCount(repaired) < badCount(value) ? repaired : value;
}

function repairMojibakeDeep(value) {
  if (typeof value === 'string') return repairMojibakeString(value);
  if (Array.isArray(value)) return value.map(repairMojibakeDeep);

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key,val]) => [key, repairMojibakeDeep(val)])
    );
  }

  return value;
}
async function resolveOne(candidate, apiKey, fetchImpl) {
  const started = new Date().toISOString();
  const unresolved = (reason, extra={}) => ({...candidate,workflow_status:'NEEDS_RESEARCH',research_resolution:{status:'UNRESOLVED',engine:'GROQ',model:MODEL,reason,...extra,started_at:started,resolved_at:new Date().toISOString()}});
  if (!apiKey) return {resolved:false,candidate:unresolved('GROQ_API_KEY_MISSING')};

  let search = null;
  let errors = [];
  let lastError = null;
  for (let attempt = 1; attempt <= MAX_SEARCH_ATTEMPTS; attempt += 1) {
    try {
      search = await groqSearch(candidate,apiKey,attempt,errors,fetchImpl);

      if (search.resolution?.status === 'UNRESOLVED') {
        return {
          resolved:false,
          candidate:unresolved('RESEARCH_UNRESOLVED',{
            model:MODEL,
            tool_calls:search.tool_calls,
            attempts_used:attempt
          })
        };
      }

      errors = validateResolution(search.resolution);
      if (!errors.length) break;
      lastError = `attempt ${attempt}: ${errors.join('; ')}`;
    } catch (err) {
      lastError = `attempt ${attempt}: ${String(err?.message || err)}`;
errors = [lastError];

if (err?.retryAfterMs && attempt < MAX_SEARCH_ATTEMPTS) {
    console.log(`[HERMES research] Groq rate limit - waiting ${Math.ceil(err.retryAfterMs / 1000)}s before retry`);
    await new Promise(resolve => setTimeout(resolve, err.retryAfterMs));
}
    }
  }

  if (!search) return {resolved:false,candidate:unresolved('GROQ_SEARCH_FAILED',{error:lastError})};
  if (errors.length) return {resolved:false,candidate:unresolved('GROQ_RESULT_NOT_VERIFIABLE',{validation_errors:errors,last_error:lastError,tool_calls:search.tool_calls,attempts:MAX_SEARCH_ATTEMPTS})};

  // If the new external source adds nothing material to ELIMFILTERS knowledge,
  // keep the provenance internally but do not place a duplicate item in
  // Victor's approval queue.
  if (search.resolution.knowledge_action === 'NO_MATERIAL_CHANGE') {
    return {resolved:false,candidate:unresolved('NO_MATERIAL_KNOWLEDGE_CHANGE',{knowledge_action:'NO_MATERIAL_CHANGE',existing_elimfilters_url:search.resolution.existing_elimfilters_url || null,tool_calls:search.tool_calls})};
  }

  const evidenceUrl = new URL(search.resolution.evidence_url).toString();
  const evidence = await fetchEvidence(evidenceUrl,fetchImpl);
  if (!evidence.ok) return {resolved:false,candidate:unresolved('EVIDENCE_FETCH_FAILED',{evidence_url:evidenceUrl,evidence_fetch_error:evidence.error,tool_calls:search.tool_calls})};
  const published = search.resolution.published_at && !Number.isNaN(Date.parse(search.resolution.published_at)) ? new Date(search.resolution.published_at).toISOString() : null;
  const resolved = {...candidate,workflow_status:'PENDING_REVIEW',source_url:evidenceUrl,source_title:search.resolution.finding_title,published_at:published || candidate.published_at || null,last_verified_at:new Date().toISOString(),confidence:Math.min(1,Math.max(0.65,search.resolution.confidence)),evidence_level:search.resolution.source_type === 'PRIMARY' ? 'PRIMARY' : candidate.evidence_level,affected_entities:Array.isArray(search.resolution.affected_entities)&&search.resolution.affected_entities.length?search.resolution.affected_entities:candidate.affected_entities,proposed_action:search.resolution.proposed_action,change_classification:'RESEARCH_RESOLVED',research_resolution:{status:'VERIFIED',engine:'GROQ',model:MODEL,search_mode:'WEB_SEARCH_AND_VISIT_WEBSITE',finding_type:search.resolution.finding_type,destination:search.resolution.destination,knowledge_action:search.resolution.knowledge_action,existing_elimfilters_url:search.resolution.existing_elimfilters_url || null,finding_title:search.resolution.finding_title,evidence_url:evidenceUrl,published_at:published,technical_facts:search.resolution.technical_facts,relevance:search.resolution.relevance,public_safe_fact:search.resolution.public_safe_fact || null,content_channels:Array.isArray(search.resolution.content_channels)?search.resolution.content_channels:[],confidence:search.resolution.confidence,source_type:search.resolution.source_type || null,evidence_sha256:hash(evidence.text),evidence_chars_verified:evidence.text.length,tool_calls:search.tool_calls,attempts_used:MAX_SEARCH_ATTEMPTS,started_at:started,resolved_at:new Date().toISOString()}};
  const candidateErrors = validateCandidate(resolved);
  if (candidateErrors.length) return {resolved:false,candidate:{...resolved,workflow_status:'NEEDS_RESEARCH',research_resolution:{...resolved.research_resolution,status:'UNRESOLVED',reason:'CANDIDATE_VALIDATION_FAILED',validation_errors:candidateErrors}}};
  return {resolved:true,candidate:resolved};
}

function atomic(file,value){const tmp=`${file}.tmp-${process.pid}`;fs.writeFileSync(tmp,`${JSON.stringify(value,null,2)}\n`,'utf8');fs.renameSync(tmp,file);}

export async function runResearch({inputDir=resolveRealCandidatesInputDir(),apiKey=process.env.GROQ_API_KEY,fetchImpl=globalThis.fetch}={}){
  const dir=path.resolve(inputDir); if(!fs.existsSync(dir)) return {scanned:0,resolved:0,unresolved:0,results:[]};
  const results=[];
  for(const name of fs.readdirSync(dir).filter(f=>f.endsWith('.json')).sort()){
    const file=path.join(dir,name); const candidate=JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
    if(!String(candidate.entity_code||'').startsWith('HERMES_REAL_')) continue;
    if(candidate.research_resolution?.status==='VERIFIED'&&candidate.workflow_status==='PENDING_REVIEW'){results.push({entity_code:candidate.entity_code,status:'ALREADY_RESOLVED'});continue;}
    const out=await resolveOne({...candidate,workflow_status:'NEEDS_RESEARCH'},apiKey,fetchImpl); atomic(file,out.candidate); results.push({entity_code:candidate.entity_code,status:out.resolved?'RESOLVED':'UNRESOLVED',reason:out.candidate.research_resolution?.reason||null});
  }
  return {scanned:results.length,resolved:results.filter(r=>r.status==='RESOLVED'||r.status==='ALREADY_RESOLVED').length,unresolved:results.filter(r=>r.status==='UNRESOLVED').length,results};
}

const isCli=process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href;
if(isCli){const s=await runResearch();console.log(`[HERMES research] scanned=${s.scanned} resolved=${s.resolved} unresolved=${s.unresolved}`);for(const r of s.results)console.log(`[HERMES research] ${r.entity_code}: ${r.status}${r.reason?` (${r.reason})`:''}`);}
