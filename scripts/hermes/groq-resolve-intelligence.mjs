#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';
import { resolveRealCandidatesInputDir, validateCandidate } from './hermes-core.mjs';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = process.env.HERMES_GROQ_MODEL || 'llama-3.3-70b-versatile';
const MAX_SOURCE_CHARS = 24000;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}
function cleanJson(text) {
  const raw = String(text || '').trim();
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] || raw;
  const first = fenced.indexOf('{');
  const last = fenced.lastIndexOf('}');
  if (first < 0 || last < first) throw new Error('Groq did not return a JSON object');
  return JSON.parse(fenced.slice(first, last + 1));
}

export const HERMES_GROQ_SYSTEM_PROMPT = `You are the mandatory intelligence-resolution engine for HERMES at ELIMFILTERS.

MISSION
Resolve every detected industry-source change into a concrete, evidence-backed intelligence finding before it can reach Victor Abreu for approval. You are not a generic summarizer and you are not allowed to stop at "the page changed".

BUSINESS SCOPE
ELIMFILTERS develops and sells filtration and asset-protection solutions for engines, mobile equipment, fleets, industrial equipment and power systems. Monitor information relevant to engine and equipment filtration, including:
- OEM engine, vehicle and equipment updates.
- Aftermarket filtration updates, especially new applications, cross references, replacement filters, service parts and coverage expansions.
- Air intake, cabin, fuel, fuel/water separation, lubrication/oil, hydraulic, coolant, air-dryer and related filtration systems.
- Filter media, contamination control, cleanliness, maintenance, reliability and technical standards.
- Agriculture, automotive, bus/coach, construction, manufacturing, marine, mining, oil & gas, power generation, railway, truck fleets and waste/municipal equipment.
- Engine families, equipment models, model years, platforms, specifications, applications and relationships that can improve ELIMFILTERS catalogue intelligence or Knowledge Center coverage.

SOURCE PRIORITY
1. Primary OEM/manufacturer/standards-body source.
2. Official technical bulletin, product page, newsroom item, service document or catalogue update.
3. High-quality technical publication when primary evidence is unavailable.
Never present marketplace listings, forums or weak secondary sources as confirmed technical truth.

MANDATORY PROCEDURE
1. Inspect the supplied changed-source content and all supplied same-domain linked-page evidence.
2. Identify the specific new or modified item that best explains the detected change.
3. Determine whether the item is relevant to ELIMFILTERS filtration intelligence. Ignore unrelated corporate, investor, hiring, sponsorship or lifestyle news.
4. Extract concrete facts: what changed, exact product/engine/equipment/filter/media/standard/application involved, date when available, and why it matters.
5. Classify the finding as OEM, AFTERMARKET, FILTER_MEDIA, STANDARD, TECHNICAL, SUPPLIER or INTERNAL_WATCH.
6. Distinguish source-reported facts from your inference. Never invent a specification, cross-reference, part number or compatibility.
7. Propose the ELIMFILTERS destination: CATALOGUE, KNOWLEDGE_CENTER, TECHNICAL_INTELLIGENCE, TECHNOLOGY_WATCH, STANDARDS, OEM_APPLICATION_INTELLIGENCE or INTERNAL_ONLY.
8. Produce neutral technical language suitable for ELIMFILTERS internal review. Competitor names may remain in internal provenance/evidence, but the public-facing neutral_fact must not market or promote a competitor and must not copy proprietary claims.
9. A finding is READY only when there is a concrete item, a supporting evidence URL, at least one verifiable fact, a relevance statement and a specific proposed action.
10. If the supplied evidence truly cannot resolve the change after examining all available pages, return RESOLUTION_BLOCKED with a precise reason. This is an exceptional failure state, not a normal outcome.

AFTERMARKET EMPHASIS
Do not overlook aftermarket developments. Treat new replacement coverage, application tables, cross-reference relationships, dimensional/specification changes, supersessions, service-part additions and catalogue expansions as high-value findings when evidence is reliable.

OUTPUT
Return JSON only with this exact shape:
{
  "resolution_status": "READY" | "IRRELEVANT" | "RESOLUTION_BLOCKED",
  "finding_type": "OEM" | "AFTERMARKET" | "FILTER_MEDIA" | "STANDARD" | "TECHNICAL" | "SUPPLIER" | "INTERNAL_WATCH",
  "specific_item": "string",
  "published_at": "ISO date-time or null",
  "evidence_url": "absolute URL or null",
  "evidence_title": "string or null",
  "facts": ["verifiable fact"],
  "neutral_fact": "ELIMFILTERS-safe neutral technical statement",
  "affected_entities": ["canonical or source-reported entity"],
  "destination": "CATALOGUE" | "KNOWLEDGE_CENTER" | "TECHNICAL_INTELLIGENCE" | "TECHNOLOGY_WATCH" | "STANDARDS" | "OEM_APPLICATION_INTELLIGENCE" | "INTERNAL_ONLY",
  "relevance": "why this matters to ELIMFILTERS",
  "proposed_action": "specific action for Victor to approve/reject",
  "confidence": 0.0,
  "blocked_reason": "string or null"
}`;

function isReadyResolution(r) {
  return r?.resolution_status === 'READY'
    && typeof r.specific_item === 'string' && r.specific_item.trim().length >= 5
    && typeof r.evidence_url === 'string' && /^https?:\/\//i.test(r.evidence_url)
    && Array.isArray(r.facts) && r.facts.length > 0
    && typeof r.relevance === 'string' && r.relevance.trim().length >= 10
    && typeof r.proposed_action === 'string' && r.proposed_action.trim().length >= 10;
}

export async function resolveWithGroq({ candidate, evidenceBundle, apiKey, model = DEFAULT_MODEL, fetchImpl = globalThis.fetch }) {
  if (!apiKey) throw new Error('GROQ_API_KEY is required for HERMES intelligence resolution');
  const payload = {
    model,
    temperature: 0.05,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: HERMES_GROQ_SYSTEM_PROMPT },
      { role: 'user', content: JSON.stringify({ candidate, evidence_bundle: evidenceBundle }, null, 2).slice(0, MAX_SOURCE_CHARS) }
    ]
  };
  const response = await fetchImpl(GROQ_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`Groq HTTP ${response.status}: ${await response.text()}`);
  const body = await response.json();
  return cleanJson(body?.choices?.[0]?.message?.content);
}

export function applyResolution(candidate, resolution, now = new Date()) {
  const resolvedAt = now.toISOString();
  const next = { ...candidate, groq_resolution: resolution, groq_resolved_at: resolvedAt };
  if (isReadyResolution(resolution)) {
    next.workflow_status = 'PENDING_REVIEW';
    next.change_classification = 'GROQ_RESOLVED_VERIFIED_FINDING';
    next.source_url = resolution.evidence_url;
    next.source_title = resolution.evidence_title || resolution.specific_item;
    if (resolution.published_at && !Number.isNaN(Date.parse(resolution.published_at))) next.published_at = new Date(resolution.published_at).toISOString();
    next.confidence = Math.max(0, Math.min(1, Number(resolution.confidence) || candidate.confidence || 0));
    next.affected_entities = Array.from(new Set([...(candidate.affected_entities || []), ...(resolution.affected_entities || [])])).slice(0, 30);
    next.proposed_action = resolution.proposed_action;
    next.proposed_destination = resolution.destination;
    next.neutral_fact = resolution.neutral_fact;
    next.verified_facts = resolution.facts;
    next.deduplication_key = `groq-${sha256(`${resolution.evidence_url}|${resolution.specific_item}|${resolution.facts.join('|')}`).slice(0, 40)}`;
    next.last_verified_at = resolvedAt;
    return next;
  }
  if (resolution?.resolution_status === 'IRRELEVANT') {
    next.workflow_status = 'REJECTED';
    next.rejection_reason = `HERMES automatic relevance rejection: ${resolution.blocked_reason || resolution.relevance || 'not relevant to ELIMFILTERS filtration intelligence'}`;
    return next;
  }
  next.workflow_status = 'NEEDS_RESEARCH';
  next.proposed_action = `Resolution blocked after mandatory Groq research: ${resolution?.blocked_reason || 'insufficient accessible evidence'}`;
  return next;
}

function collectEvidence(candidate, sourceCacheDir) {
  const sourceId = candidate.endpoint_id || candidate.entity_code.replace(/^HERMES_REAL_/, '').replace(/_[A-F0-9]{8}$/, '').toLowerCase();
  const files = fs.existsSync(sourceCacheDir) ? fs.readdirSync(sourceCacheDir).filter((f) => f.endsWith('.json')) : [];
  const matching = [];
  for (const file of files) {
    const data = readJson(path.join(sourceCacheDir, file));
    if (data.source_url === candidate.source_url || data.source_id === sourceId || file.startsWith(`${sourceId}.`)) matching.push(data);
  }
  return matching.length ? matching : [{ source_url: candidate.source_url, raw_snippet: candidate.extracted_snippet || '' }];
}

async function main() {
  const inputDir = path.resolve(process.argv[2] || resolveRealCandidatesInputDir());
  const sourceCacheDir = path.resolve(process.argv[3] || 'hermes/source-cache');
  if (!fs.existsSync(inputDir)) return;
  const files = fs.readdirSync(inputDir).filter((f) => f.endsWith('.json')).sort();
  let resolved = 0;
  let blocked = 0;
  let rejected = 0;
  for (const file of files) {
    const full = path.join(inputDir, file);
    const candidate = readJson(full);
    if (!['CAPTURED','NORMALIZED','NEEDS_RESEARCH'].includes(candidate.workflow_status)) continue;
    const evidenceBundle = collectEvidence(candidate, sourceCacheDir);
    let resolution;
    try {
      resolution = await resolveWithGroq({ candidate, evidenceBundle, apiKey: process.env.GROQ_API_KEY });
    } catch (error) {
      resolution = { resolution_status: 'RESOLUTION_BLOCKED', finding_type: 'INTERNAL_WATCH', specific_item: candidate.source_title || candidate.source_publisher, published_at: null, evidence_url: candidate.source_url, evidence_title: candidate.source_title || null, facts: [], neutral_fact: '', affected_entities: candidate.affected_entities || [], destination: 'INTERNAL_ONLY', relevance: '', proposed_action: '', confidence: 0, blocked_reason: String(error.message || error) };
    }
    const next = applyResolution(candidate, resolution);
    const errors = validateCandidate(next);
    if (errors.length) throw new Error(`${candidate.entity_code}: resolved candidate invalid: ${errors.join('; ')}`);
    writeJson(full, next);
    if (next.workflow_status === 'PENDING_REVIEW') resolved += 1;
    else if (next.workflow_status === 'REJECTED') rejected += 1;
    else blocked += 1;
  }
  console.log(`[HERMES Groq] resolved=${resolved} rejected=${rejected} blocked=${blocked}`);
  if (blocked > 0) process.exitCode = 2;
}

if (import.meta.url === `file://${process.argv[1]}`) main();
