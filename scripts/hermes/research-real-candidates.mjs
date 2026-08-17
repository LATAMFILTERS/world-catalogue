#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolveRealCandidatesInputDir, validateCandidate } from './hermes-core.mjs';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.HERMES_GROQ_MODEL || 'llama-3.3-70b-versatile';
const MAX_LINKS = Number(process.env.HERMES_RESEARCH_MAX_LINKS || 18);
const MAX_PAGES = Number(process.env.HERMES_RESEARCH_MAX_PAGES || 8);
const MAX_PAGE_CHARS = Number(process.env.HERMES_RESEARCH_MAX_PAGE_CHARS || 12000);
const TIMEOUT_MS = Number(process.env.HERMES_RESEARCH_TIMEOUT_MS || 15000);

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

export function textFromHtml(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleFromHtml(html) {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(String(html));
  return m ? textFromHtml(m[1]).slice(0, 240) : null;
}

function publishedAtFromHtml(html) {
  const text = String(html);
  const candidates = [
    /<meta[^>]+property=["']article:published_time["'][^>]*content=["']([^"']+)["']/i.exec(text)?.[1],
    /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']article:published_time["']/i.exec(text)?.[1],
    /<time[^>]+datetime=["']([^"']+)["']/i.exec(text)?.[1]
  ].filter(Boolean);
  for (const value of candidates) {
    const d = Date.parse(value);
    if (!Number.isNaN(d)) return new Date(d).toISOString();
  }
  return null;
}

export function extractSameDomainLinks(html, baseUrl) {
  const base = new URL(baseUrl);
  const seen = new Set();
  const links = [];
  const re = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(String(html))) && links.length < 250) {
    try {
      const url = new URL(m[1], base);
      if (!['http:', 'https:'].includes(url.protocol)) continue;
      if (url.hostname !== base.hostname) continue;
      url.hash = '';
      const href = url.toString();
      if (seen.has(href)) continue;
      seen.add(href);
      const anchor = textFromHtml(m[2]).slice(0, 180);
      links.push({ url: href, anchor });
    } catch { /* ignore malformed links */ }
  }
  return links;
}

export function linkScore(link) {
  const s = `${link.url} ${link.anchor}`.toLowerCase();
  let score = 0;
  for (const token of ['news','press','release','article','story','media','blog','update','innovation','product','technology','technical','bulletin','standard','launch','2026']) {
    if (s.includes(token)) score += 3;
  }
  if (/\/20\d{2}\//.test(s)) score += 4;
  if (/\b(aug|august|jul|july|sep|september)\b/.test(s)) score += 2;
  if (link.anchor.length >= 20) score += 1;
  return score;
}

async function fetchText(url, fetchImpl = globalThis.fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetchImpl(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'ELIMFILTERS-HERMES/1.1 (+research-resolver)',
        Accept: 'text/html,application/xhtml+xml,application/xml,text/plain;q=0.8,*/*;q=0.5'
      }
    });
    if (!response.ok) return { ok: false, status: response.status, url, html: '', error: `HTTP ${response.status}` };
    const html = await response.text();
    return { ok: true, status: response.status, url: response.url || url, html, error: null };
  } catch (error) {
    return { ok: false, status: null, url, html: '', error: String(error?.message || error) };
  } finally {
    clearTimeout(timer);
  }
}

function stripCodeFence(value) {
  const text = String(value || '').trim();
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
}

export function validateResolution(obj, pages) {
  if (!obj || typeof obj !== 'object') return ['resolution must be an object'];
  const errors = [];
  if (obj.status !== 'VERIFIED') errors.push('status must be VERIFIED');
  if (typeof obj.finding_title !== 'string' || obj.finding_title.trim().length < 8) errors.push('finding_title missing');
  if (typeof obj.evidence_url !== 'string') errors.push('evidence_url missing');
  else {
    try {
      const u = new URL(obj.evidence_url).toString();
      if (!pages.some((p) => p.url === u)) errors.push('evidence_url was not fetched by HERMES');
    } catch { errors.push('evidence_url invalid'); }
  }
  if (!Array.isArray(obj.technical_facts) || obj.technical_facts.length < 1) errors.push('technical_facts missing');
  if (typeof obj.relevance !== 'string' || obj.relevance.trim().length < 12) errors.push('relevance missing');
  if (typeof obj.proposed_action !== 'string' || obj.proposed_action.trim().length < 20) errors.push('proposed_action missing');
  if (typeof obj.confidence !== 'number' || obj.confidence < 0.65 || obj.confidence > 1) errors.push('confidence must be >= 0.65');
  return errors;
}

async function askGroq(candidate, pages, apiKey, fetchImpl = globalThis.fetch) {
  const evidence = pages.map((p, i) => ({
    index: i,
    url: p.url,
    title: p.title,
    published_at: p.published_at,
    text: p.text.slice(0, MAX_PAGE_CHARS)
  }));

  const system = `You are HERMES Research Resolver for ELIMFILTERS. Your job is not to brainstorm and not to return vague monitoring alerts. Resolve the detected industry change into one concrete, source-grounded finding. Use ONLY the fetched evidence supplied by HERMES. Never invent facts, URLs, dates, standards, product names, specifications, or claims. Competitor sources are internal evidence only: do not write promotional competitor language or suggest publishing competitor branding. Return strict JSON only. If evidence truly cannot establish a concrete finding, return {"status":"UNRESOLVED","reason":"..."}.`;
  const user = JSON.stringify({
    task: 'Identify the specific new/changed industry item most likely responsible for this source change and extract the concrete technical facts relevant to ELIMFILTERS.',
    candidate: {
      entity_code: candidate.entity_code,
      source_publisher: candidate.source_publisher,
      source_url: candidate.source_url,
      source_title: candidate.source_title,
      candidate_type: candidate.candidate_type,
      category: candidate.category,
      captured_at: candidate.captured_at
    },
    required_json: {
      status: 'VERIFIED or UNRESOLVED',
      finding_title: 'specific item title',
      evidence_url: 'exact URL from supplied pages',
      published_at: 'ISO date if explicitly supported, otherwise null',
      technical_facts: ['fact grounded in supplied evidence'],
      affected_entities: ['neutral technical entities'],
      relevance: 'why this matters to ELIMFILTERS technical intelligence',
      proposed_action: 'specific review proposal, not a generic request to investigate',
      confidence: 'number 0..1'
    },
    evidence
  });

  const response = await fetchImpl(GROQ_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    })
  });
  if (!response.ok) throw new Error(`Groq HTTP ${response.status}: ${(await response.text()).slice(0, 500)}`);
  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Groq returned no message content');
  return JSON.parse(stripCodeFence(content));
}

async function resolveCandidate(candidate, { apiKey, fetchImpl = globalThis.fetch } = {}) {
  const startedAt = new Date().toISOString();
  const source = await fetchText(candidate.source_url, fetchImpl);
  const attempts = [{ url: candidate.source_url, ok: source.ok, status: source.status, error: source.error }];
  if (!source.ok) {
    return { candidate: { ...candidate, workflow_status: 'NEEDS_RESEARCH', research_resolution: { status: 'UNRESOLVED', reason: 'SOURCE_FETCH_FAILED', attempts, started_at: startedAt, resolved_at: new Date().toISOString() } }, resolved: false };
  }

  const rankedLinks = extractSameDomainLinks(source.html, source.url)
    .map((link) => ({ ...link, score: linkScore(link) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_LINKS);

  const pages = [{
    url: new URL(source.url).toString(),
    title: titleFromHtml(source.html) || candidate.source_title || candidate.source_publisher,
    published_at: publishedAtFromHtml(source.html),
    text: textFromHtml(source.html).slice(0, MAX_PAGE_CHARS)
  }];

  for (const link of rankedLinks) {
    if (pages.length >= MAX_PAGES + 1) break;
    const fetched = await fetchText(link.url, fetchImpl);
    attempts.push({ url: link.url, ok: fetched.ok, status: fetched.status, error: fetched.error });
    if (!fetched.ok) continue;
    const text = textFromHtml(fetched.html);
    if (text.length < 180) continue;
    pages.push({
      url: new URL(fetched.url || link.url).toString(),
      title: titleFromHtml(fetched.html) || link.anchor || link.url,
      published_at: publishedAtFromHtml(fetched.html),
      text: text.slice(0, MAX_PAGE_CHARS)
    });
  }

  if (!apiKey) {
    return { candidate: { ...candidate, workflow_status: 'NEEDS_RESEARCH', research_resolution: { status: 'UNRESOLVED', reason: 'GROQ_API_KEY_MISSING', attempts, fetched_pages: pages.length, started_at: startedAt, resolved_at: new Date().toISOString() } }, resolved: false };
  }

  let resolution;
  try {
    resolution = await askGroq(candidate, pages, apiKey, fetchImpl);
  } catch (error) {
    return { candidate: { ...candidate, workflow_status: 'NEEDS_RESEARCH', research_resolution: { status: 'UNRESOLVED', reason: 'GROQ_RESOLUTION_FAILED', error: String(error?.message || error), attempts, fetched_pages: pages.length, started_at: startedAt, resolved_at: new Date().toISOString() } }, resolved: false };
  }

  const errors = validateResolution(resolution, pages);
  if (errors.length) {
    return { candidate: { ...candidate, workflow_status: 'NEEDS_RESEARCH', research_resolution: { ...resolution, status: 'UNRESOLVED', validation_errors: errors, attempts, fetched_pages: pages.length, started_at: startedAt, resolved_at: new Date().toISOString() } }, resolved: false };
  }

  const evidenceUrl = new URL(resolution.evidence_url).toString();
  const evidencePage = pages.find((p) => p.url === evidenceUrl);
  const resolved = {
    ...candidate,
    workflow_status: 'PENDING_REVIEW',
    source_url: evidenceUrl,
    source_title: resolution.finding_title,
    published_at: resolution.published_at && !Number.isNaN(Date.parse(resolution.published_at)) ? new Date(resolution.published_at).toISOString() : (evidencePage?.published_at || candidate.published_at || null),
    last_verified_at: new Date().toISOString(),
    confidence: Math.min(1, Math.max(0.65, resolution.confidence)),
    affected_entities: Array.isArray(resolution.affected_entities) && resolution.affected_entities.length ? resolution.affected_entities : candidate.affected_entities,
    proposed_action: resolution.proposed_action,
    change_classification: 'RESEARCH_RESOLVED',
    research_resolution: {
      status: 'VERIFIED',
      engine: 'GROQ',
      model: GROQ_MODEL,
      finding_title: resolution.finding_title,
      evidence_url: evidenceUrl,
      published_at: resolution.published_at ?? evidencePage?.published_at ?? null,
      technical_facts: resolution.technical_facts,
      relevance: resolution.relevance,
      confidence: resolution.confidence,
      fetched_pages: pages.length,
      evidence_sha256: sha256(evidencePage?.text || ''),
      attempts,
      started_at: startedAt,
      resolved_at: new Date().toISOString()
    }
  };
  const candidateErrors = validateCandidate(resolved);
  if (candidateErrors.length) {
    resolved.workflow_status = 'NEEDS_RESEARCH';
    resolved.research_resolution = { ...resolved.research_resolution, status: 'UNRESOLVED', reason: 'CANDIDATE_VALIDATION_FAILED', validation_errors: candidateErrors };
    return { candidate: resolved, resolved: false };
  }
  return { candidate: resolved, resolved: true };
}

function writeJsonAtomic(file, value) {
  const temp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temp, file);
}

export async function runResearch({ inputDir = resolveRealCandidatesInputDir(), apiKey = process.env.GROQ_API_KEY, fetchImpl = globalThis.fetch } = {}) {
  const absolute = path.resolve(inputDir);
  if (!fs.existsSync(absolute)) return { scanned: 0, resolved: 0, unresolved: 0, results: [] };
  const files = fs.readdirSync(absolute).filter((f) => f.endsWith('.json')).sort();
  const results = [];
  for (const name of files) {
    const file = path.join(absolute, name);
    const candidate = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!String(candidate.entity_code || '').startsWith('HERMES_REAL_')) continue;
    if (candidate.research_resolution?.status === 'VERIFIED' && candidate.workflow_status === 'PENDING_REVIEW') {
      results.push({ entity_code: candidate.entity_code, status: 'ALREADY_RESOLVED' });
      continue;
    }
    candidate.workflow_status = 'NEEDS_RESEARCH';
    const outcome = await resolveCandidate(candidate, { apiKey, fetchImpl });
    writeJsonAtomic(file, outcome.candidate);
    results.push({ entity_code: candidate.entity_code, status: outcome.resolved ? 'RESOLVED' : 'UNRESOLVED', reason: outcome.candidate.research_resolution?.reason || null });
  }
  return {
    scanned: results.length,
    resolved: results.filter((r) => r.status === 'RESOLVED' || r.status === 'ALREADY_RESOLVED').length,
    unresolved: results.filter((r) => r.status === 'UNRESOLVED').length,
    results
  };
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  const summary = await runResearch();
  console.log(`[HERMES research] scanned=${summary.scanned} resolved=${summary.resolved} unresolved=${summary.unresolved}`);
  for (const row of summary.results) console.log(`[HERMES research] ${row.entity_code}: ${row.status}${row.reason ? ` (${row.reason})` : ''}`);
  if (summary.unresolved > 0) process.exitCode = 2;
}
