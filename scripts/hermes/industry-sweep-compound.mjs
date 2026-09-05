#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { resolveRealCandidatesInputDir, validateCandidate } from './hermes-core.mjs';

const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.HERMES_SWEEP_MODEL || 'groq/compound-mini';
const MISSION_PATH = path.resolve(process.env.HERMES_MISSION_PATH || 'hermes/config/intelligence-mission.json');
const BATCH_SIZE = Math.max(1, Number(process.env.HERMES_SWEEP_DOMAIN_BATCH || 3));
const TIMEOUT_MS = Number(process.env.HERMES_RESEARCH_TIMEOUT_MS || 25000);
const MAX_EVIDENCE_CHARS = Number(process.env.HERMES_RESEARCH_MAX_EVIDENCE_CHARS || 16000);
const MAX_COMPLETION_TOKENS = Math.max(600, Number(process.env.HERMES_SWEEP_MAX_COMPLETION_TOKENS || 1800));
const MAX_FINDINGS_PER_DOMAIN = Math.max(1, Number(process.env.HERMES_SWEEP_MAX_FINDINGS_PER_DOMAIN || 3));
const MAX_TOPICS_PER_REQUEST = Math.max(1, Number(process.env.HERMES_SWEEP_MAX_TOPICS_PER_REQUEST || 4));

const sha256 = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');
const plain = (html) => String(html).replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim();
const stripFence = (value) => String(value || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
const safeFragment = (value) => String(value || 'INDUSTRY').toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48) || 'INDUSTRY';

const DESTINATION_FOLDER = {
  CATALOGUE: '09-products',
  KNOWLEDGE_CENTER: '11-articles',
  TECHNICAL_INTELLIGENCE: '14-intelligence',
  TECHNOLOGY_WATCH: '17-technology-watch',
  STANDARDS: '04-standards',
  OEM_APPLICATION_INTELLIGENCE: '12-oems',
  INTERNAL_ONLY: '14-intelligence'
};

const FINDING_CANDIDATE_TYPE = {
  OEM: 'oem_update',
  AFTERMARKET: 'application_update',
  FILTER_MEDIA: 'filter_media_development',
  MATERIALS_COMPONENTS: 'supplier_development',
  STANDARD: 'standard_update',
  TECHNICAL: 'technical_bulletin',
  ENVIRONMENT: 'technical_bulletin',
  EV_POWERTRAIN: 'technical_bulletin',
  FUELS_LUBRICANTS: 'technical_bulletin',
  INDUSTRY: 'technical_bulletin'
};

function loadMission() {
  return JSON.parse(fs.readFileSync(MISSION_PATH, 'utf8'));
}

function chunks(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function validateFinding(finding, mission) {
  const errors = [];
  if (!finding || typeof finding !== 'object') return ['finding must be object'];
  if (typeof finding.finding_title !== 'string' || finding.finding_title.trim().length < 8) errors.push('finding_title missing');
  try { new URL(finding.evidence_url); } catch { errors.push('evidence_url invalid'); }
  if (typeof finding.source_publisher !== 'string' || finding.source_publisher.trim().length < 2) errors.push('source_publisher missing');
  if (!Array.isArray(finding.technical_facts) || finding.technical_facts.length === 0) errors.push('technical_facts missing');
  if (!Array.isArray(finding.affected_entities) || finding.affected_entities.length === 0) errors.push('affected_entities missing');
  if (!FINDING_CANDIDATE_TYPE[finding.finding_type]) errors.push('finding_type invalid');
  if (!mission.content_destinations.includes(finding.destination)) errors.push('destination invalid');
  if (!mission.knowledge_actions.includes(finding.knowledge_action)) errors.push('knowledge_action invalid');
  if (typeof finding.relevance !== 'string' || finding.relevance.trim().length < 12) errors.push('relevance missing');
  if (typeof finding.public_safe_fact !== 'string' || finding.public_safe_fact.trim().length < 12) errors.push('public_safe_fact missing');
  if (typeof finding.proposed_action !== 'string' || finding.proposed_action.trim().length < 20) errors.push('proposed_action missing');
  if (typeof finding.confidence !== 'number' || finding.confidence < 0.65 || finding.confidence > 1) errors.push('confidence must be >= 0.65');
  return errors;
}

async function fetchEvidence(url, fetchImpl = globalThis.fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetchImpl(url, { redirect: 'follow', signal: controller.signal, headers: { 'User-Agent': 'ELIMFILTERS-HERMES/2.0 (+industry-sweep)' } });
    if (!res.ok) return { ok: false, status: res.status, error: `HTTP ${res.status}`, text: '' };
    const text = plain(await res.text()).slice(0, MAX_EVIDENCE_CHARS);
    return { ok: text.length >= 120, status: res.status, error: text.length >= 120 ? null : 'INSUFFICIENT_EVIDENCE_CONTENT', text };
  } catch (error) {
    return { ok: false, status: null, error: String(error?.message || error), text: '' };
  } finally {
    clearTimeout(timer);
  }
}

function sweepPrompt(mission, domainBatch) {
  const domains = domainBatch.map((domain) => ({
    id: domain.id,
    label: domain.label,
    topics: domain.topics
  }));
  return `You are HERMES, ELIMFILTERS' industrial filtration intelligence researcher. Use live web search and website visiting.

MISSION
${mission.mission}

SEARCH SCOPE
${JSON.stringify(domains)}

Find only concrete, verifiable developments from the last ${mission.lookback_days} days. Use the supplied topics as search terms. Cover:
A. Current products, engines, equipment, applications, fluids or manufacturing changes.
B. Technical materials, performance, testing, standards, regulation or research.
C. The ELIMFILTERS knowledge gap: CREATE_NEW, UPDATE_REINFORCE, NO_MATERIAL_CHANGE or INTERNAL_ONLY.

Prefer primary evidence. Reject generic marketing and vague commentary. Never invent facts, dates, specifications, applications, standards or URLs. Competitor identity is internal provenance only; public wording must be neutral. Returning zero findings is correct.

Return strict JSON:
{"findings":[{"domain_id":"supplied id","finding_type":"OEM|AFTERMARKET|FILTER_MEDIA|MATERIALS_COMPONENTS|STANDARD|TECHNICAL|ENVIRONMENT|EV_POWERTRAIN|FUELS_LUBRICANTS|INDUSTRY","finding_title":"specific item","evidence_url":"absolute URL","source_publisher":"publisher","source_type":"PRIMARY|SECONDARY_VERIFIED","published_at":"ISO date or null","technical_facts":["verified fact"],"affected_entities":["entity"],"destination":"CATALOGUE|KNOWLEDGE_CENTER|TECHNICAL_INTELLIGENCE|TECHNOLOGY_WATCH|STANDARDS|OEM_APPLICATION_INTELLIGENCE|INTERNAL_ONLY","knowledge_action":"CREATE_NEW|UPDATE_REINFORCE|NO_MATERIAL_CHANGE|INTERNAL_ONLY","existing_elimfilters_url":"URL or null","relevance":"ELIMFILTERS relevance","public_safe_fact":"neutral reusable fact","proposed_action":"specific review proposal for Victor","content_channels":["BLOG|WEEKLY_PODCAST|NEWSLETTER|SOCIAL|CUSTOMER_EMAIL|SALES_INTELLIGENCE"],"confidence":0.0}]}

Return at most ${MAX_FINDINGS_PER_DOMAIN} highest-value findings for this request.`;
}

async function searchSegment(mission, domainBatch, apiKey, fetchImpl = globalThis.fetch) {
  const response = await fetchImpl(ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Groq-Model-Version': 'latest' },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      max_completion_tokens: MAX_COMPLETION_TOKENS,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: sweepPrompt(mission, domainBatch) },
        { role: 'user', content: 'Search this narrow scope now and return only verified, material developments.' }
      ]
    })
  });
  if (!response.ok) {
    const error = new Error(`Groq HTTP ${response.status}: ${(await response.text()).slice(0, 400)}`);
    error.status = response.status;
    throw error;
  }
  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Groq returned no content');
  const parsed = JSON.parse(stripFence(content));
  return { findings: Array.isArray(parsed.findings) ? parsed.findings : [], tool_calls: payload?.choices?.[0]?.message?.executed_tools?.length || 0 };
}

async function searchTopicsAdaptive(mission, domain, topics, apiKey, fetchImpl) {
  try {
    return await searchSegment(mission, [{ ...domain, topics }], apiKey, fetchImpl);
  } catch (error) {
    if (error?.status !== 413 || topics.length <= 1) throw error;
    const midpoint = Math.ceil(topics.length / 2);
    console.warn(`[HERMES industry sweep] HTTP 413 domain=${domain.id} topics=${topics.length}; splitting into ${midpoint}+${topics.length - midpoint}`);
    const left = await searchTopicsAdaptive(mission, domain, topics.slice(0, midpoint), apiKey, fetchImpl);
    const right = await searchTopicsAdaptive(mission, domain, topics.slice(midpoint), apiKey, fetchImpl);
    return { findings: [...left.findings, ...right.findings], tool_calls: left.tool_calls + right.tool_calls };
  }
}

async function searchBatch(mission, domainBatch, apiKey, fetchImpl = globalThis.fetch) {
  const findings = [];
  const partialErrors = [];
  let toolCalls = 0;

  for (const domain of domainBatch) {
    const topicGroups = chunks(domain.topics, MAX_TOPICS_PER_REQUEST);
    for (const topics of topicGroups) {
      try {
        const result = await searchTopicsAdaptive(mission, domain, topics, apiKey, fetchImpl);
        findings.push(...result.findings);
        toolCalls += result.tool_calls;
      } catch (error) {
        if (error?.code === 'HERMES_QUOTA_EXHAUSTED') throw error;
        partialErrors.push({ domain_id: domain.id, topics, error: String(error?.message || error) });
      }
    }
  }

  const seen = new Set();
  const deduplicated = findings.filter((finding) => {
    const key = `${finding?.evidence_url || ''}|${finding?.finding_title || ''}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    findings: deduplicated.slice(0, MAX_FINDINGS_PER_DOMAIN * domainBatch.length),
    tool_calls: toolCalls,
    partial_errors: partialErrors
  };
}

function existingSignatures(dir) {
  const urls = new Set();
  const keys = new Set();
  if (!fs.existsSync(dir)) return { urls, keys };
  for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    try {
      const candidate = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
      if (candidate.source_url) urls.add(candidate.source_url);
      if (candidate.deduplication_key) keys.add(candidate.deduplication_key);
    } catch { /* ignore malformed legacy file here; validation handles it elsewhere */ }
  }
  return { urls, keys };
}

function candidateFromFinding(finding, evidence, now, toolCalls) {
  const sourceHash = sha256(evidence.text);
  const key = `industry-sweep-${sha256(`${finding.evidence_url}|${finding.finding_title}`).slice(0, 40)}`;
  const idHash = sha256(key).slice(0, 12).toUpperCase();
  const publishedAt = finding.published_at && !Number.isNaN(Date.parse(finding.published_at)) ? new Date(finding.published_at).toISOString() : null;
  return {
    entity_type: 'intelligence_candidate',
    entity_code: `HERMES_REAL_SWEEP_${safeFragment(finding.domain_id)}_${idHash}`,
    workflow_status: 'PENDING_REVIEW',
    candidate_type: FINDING_CANDIDATE_TYPE[finding.finding_type],
    source_type: 'groq_compound_web_search',
    source_url: finding.evidence_url,
    source_publisher: finding.source_publisher,
    source_title: finding.finding_title,
    published_at: publishedAt,
    captured_at: now,
    last_verified_at: now,
    confidence: finding.confidence,
    evidence_level: finding.source_type === 'PRIMARY' ? 'PRIMARY' : 'SECONDARY_VERIFIED',
    claim_scope: 'SOURCE_REPORTED',
    affected_entities: finding.affected_entities,
    proposed_action: finding.proposed_action,
    proposed_target_folder: DESTINATION_FOLDER[finding.destination] || '14-intelligence',
    proposed_target_entity: null,
    deduplication_key: key,
    approval_required: true,
    approved_by: null,
    approved_at: null,
    rejection_reason: null,
    sync_status: 'NOT_READY',
    sync_target: [],
    source_hash: sourceHash,
    category: `industry_sweep:${finding.domain_id}`,
    research_resolution: {
      status: 'VERIFIED',
      engine: 'GROQ',
      model: MODEL,
      search_mode: 'MISSION_DRIVEN_INDUSTRY_SWEEP',
      finding_type: finding.finding_type,
      destination: finding.destination,
      knowledge_action: finding.knowledge_action,
      existing_elimfilters_url: finding.existing_elimfilters_url || null,
      finding_title: finding.finding_title,
      evidence_url: finding.evidence_url,
      published_at: publishedAt,
      technical_facts: finding.technical_facts,
      relevance: finding.relevance,
      public_safe_fact: finding.public_safe_fact,
      content_channels: Array.isArray(finding.content_channels) ? finding.content_channels : [],
      confidence: finding.confidence,
      source_type: finding.source_type,
      evidence_sha256: sourceHash,
      evidence_chars_verified: evidence.text.length,
      tool_calls: toolCalls,
      resolved_at: now
    }
  };
}

function atomicWrite(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(tmp, file);
}

export async function runIndustrySweep({ apiKey = process.env.GROQ_API_KEY, fetchImpl = globalThis.fetch, outputDir = resolveRealCandidatesInputDir(), now = () => new Date() } = {}) {
  const mission = loadMission();
  const output = path.resolve(outputDir);
  fs.mkdirSync(output, { recursive: true });
  const signatures = existingSignatures(output);
  const summary = {
    mission_version: mission.schema_version, model: MODEL, domains: mission.domains.length, batches: 0,
    findings_seen: 0, created: 0, duplicates: 0, no_material_change: 0, invalid: 0, failed_batches: 0, failures: [],
    quota_exhausted: false, quota_exhausted_reason: null, skipped_due_quota: 0, skipped_domains: []
  };
  if (!apiKey) return { ...summary, error: 'GROQ_API_KEY_MISSING' };

  const allBatches = chunks(mission.domains, BATCH_SIZE);
  for (let i = 0; i < allBatches.length; i += 1) {
    const domainBatch = allBatches[i];
    summary.batches += 1;
    let search;
    try {
      search = await searchBatch(mission, domainBatch, apiKey, fetchImpl);
    } catch (error) {
      if (error?.code === 'HERMES_QUOTA_EXHAUSTED') {
        summary.quota_exhausted = true;
        summary.quota_exhausted_reason = String(error?.message || error);
        summary.skipped_due_quota += 1;
        summary.skipped_domains.push(...domainBatch.map((d) => d.id));
        for (let j = i + 1; j < allBatches.length; j += 1) {
          summary.batches += 1;
          summary.skipped_due_quota += 1;
          summary.skipped_domains.push(...allBatches[j].map((d) => d.id));
        }
        break;
      }
      summary.failed_batches += 1;
      summary.failures.push({ domains: domainBatch.map((d) => d.id), error: String(error?.message || error) });
      continue;
    }

    for (const finding of search.findings) {
      summary.findings_seen += 1;
      const errors = validateFinding(finding, mission);
      if (errors.length) { summary.invalid += 1; continue; }
      if (finding.knowledge_action === 'NO_MATERIAL_CHANGE') { summary.no_material_change += 1; continue; }

      const normalizedUrl = new URL(finding.evidence_url).toString();
      const key = `industry-sweep-${sha256(`${normalizedUrl}|${finding.finding_title}`).slice(0, 40)}`;
      if (signatures.urls.has(normalizedUrl) || signatures.keys.has(key)) { summary.duplicates += 1; continue; }

      const evidence = await fetchEvidence(normalizedUrl, fetchImpl);
      if (!evidence.ok) { summary.invalid += 1; continue; }
      finding.evidence_url = normalizedUrl;
      const stamp = now().toISOString();
      const candidate = candidateFromFinding(finding, evidence, stamp, search.tool_calls);
      const candidateErrors = validateCandidate(candidate);
      if (candidateErrors.length) { summary.invalid += 1; continue; }

      const file = path.join(output, `${candidate.entity_code.toLowerCase()}.json`);
      atomicWrite(file, candidate);
      signatures.urls.add(normalizedUrl);
      signatures.keys.add(candidate.deduplication_key);
      summary.created += 1;
    }

    if (search.partial_errors?.length) {
      summary.failed_batches += 1;
      summary.failures.push({
        domains: domainBatch.map((domain) => domain.id),
        error: `PARTIAL_SEGMENT_FAILURES_${search.partial_errors.length}: ${search.partial_errors.map((item) => item.error).join(' | ').slice(0, 800)}`
      });
    }
  }

  const auditPath = path.resolve('hermes/industry-sweep/last-run.json');
  atomicWrite(auditPath, { ...summary, generated_at: now().toISOString(), approval_authority: mission.public_governance.approval_authority, automatic_canonical_publication: false });
  return summary;
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  const summary = await runIndustrySweep();
  console.log(`[HERMES industry sweep] domains=${summary.domains} batches=${summary.batches} findings=${summary.findings_seen} created=${summary.created} duplicates=${summary.duplicates} no_material_change=${summary.no_material_change} invalid=${summary.invalid} failed_batches=${summary.failed_batches}`);
  if (summary.error) console.error(`[HERMES industry sweep] ${summary.error}`);
  if (summary.error) process.exitCode = 1;
}