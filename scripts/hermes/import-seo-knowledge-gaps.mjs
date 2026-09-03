#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { resolveRealCandidatesInputDir, validateCandidate } from './hermes-core.mjs';

const DEFAULT_INPUT = 'seo-geo-audit-out/hermes-knowledge-gaps.json';

function stableHash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function targetFolder(url) {
  let pathname = '/';
  try { pathname = new URL(url).pathname; } catch { /* validated later */ }
  if (pathname.includes('/standards/')) return '04-standards';
  if (pathname.includes('/contamination/')) return '05-contamination';
  if (pathname.includes('/problems/') || pathname.includes('/failure')) return '07-problems';
  if (pathname.includes('/technologies/')) return '01-technologies';
  if (pathname.includes('/systems/')) return '03-systems';
  if (pathname.includes('/industries/')) return '02-industries';
  if (pathname.includes('/families/') || pathname.includes('/commercial-lines/')) return '08-product-families';
  return '11-articles';
}

function entityLabel(url) {
  try {
    const pathname = new URL(url).pathname.replace(/^\/+|\/+$/g, '');
    return pathname || 'homepage';
  } catch {
    return String(url || 'unknown-page');
  }
}

export function requestToCandidate(request, now = new Date()) {
  const pageUrl = String(request?.page_url || '').trim();
  const question = String(request?.research_question || '').trim();
  const deduplicationKey = `seo-geo-aeo:${pageUrl}`;
  const entityCode = `HERMES_REAL_SEO_GAP_${stableHash(pageUrl).slice(0, 16).toUpperCase()}`;
  const capturedAt = now.toISOString();

  const candidate = {
    entity_type: 'intelligence_candidate',
    entity_code: entityCode,
    workflow_status: 'NEEDS_RESEARCH',
    candidate_type: 'coverage_gap',
    source_type: 'elimfilters_internal_audit',
    source_url: pageUrl,
    source_publisher: 'ELIMFILTERS',
    source_title: `SEO/GEO/AEO knowledge gap: ${entityLabel(pageUrl)}`,
    published_at: null,
    captured_at: capturedAt,
    last_verified_at: null,
    confidence: 0,
    evidence_level: 'SECONDARY_UNVERIFIED',
    claim_scope: 'HERMES_INFERENCE',
    affected_entities: [pageUrl],
    proposed_action: question,
    proposed_target_folder: targetFolder(pageUrl),
    proposed_target_entity: pageUrl,
    deduplication_key: deduplicationKey,
    approval_required: true,
    approved_by: null,
    approved_at: null,
    rejection_reason: null,
    sync_status: 'NOT_READY',
    sync_target: [],
    source_hash: stableHash(JSON.stringify(request)),
    knowledge_gap_request_id: request?.knowledge_gap_request_id || null,
    research_type: 'ELIMFILTERS_KNOWLEDGE_GAP',
    audit_context: {
      source_audit: request?.source_audit || 'seo-geo-audit',
      page_type: request?.page_type || null,
      observed_word_count: request?.observed_word_count ?? null,
      triage_action: request?.triage_action || null,
      required_source_types: Array.isArray(request?.required_source_types) ? request.required_source_types : [],
      minimum_independent_sources: request?.minimum_independent_sources ?? 1,
      publication_policy: request?.publication_policy || { auto_publish: false, requires_review: true }
    }
  };

  const errors = validateCandidate(candidate);
  if (errors.length) throw new Error(`${entityCode}: ${errors.join('; ')}`);
  return candidate;
}

export function importSeoKnowledgeGaps({ inputPath = DEFAULT_INPUT, outputDir = resolveRealCandidatesInputDir(), now = new Date() } = {}) {
  const input = path.resolve(inputPath);
  if (!fs.existsSync(input)) return { imported: 0, skipped: 0, outputDir: path.resolve(outputDir), candidates: [] };

  const payload = JSON.parse(fs.readFileSync(input, 'utf8'));
  const requests = Array.isArray(payload?.requests) ? payload.requests : [];
  const dir = path.resolve(outputDir);
  fs.mkdirSync(dir, { recursive: true });

  const candidates = [];
  let skipped = 0;
  for (const request of requests) {
    if (request?.triage_action !== 'REVIEW_FOR_EXPANSION') { skipped += 1; continue; }
    const candidate = requestToCandidate(request, now);
    const file = path.join(dir, `${candidate.entity_code}.json`);
    fs.writeFileSync(file, `${JSON.stringify(candidate, null, 2)}\n`, 'utf8');
    candidates.push({ entity_code: candidate.entity_code, file, page_url: candidate.source_url });
  }

  return { imported: candidates.length, skipped, outputDir: dir, candidates };
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  const inputPath = process.argv[2] || DEFAULT_INPUT;
  const outputDirArg = process.argv.find((arg) => arg.startsWith('--output-dir='));
  const outputDir = outputDirArg ? outputDirArg.slice('--output-dir='.length) : resolveRealCandidatesInputDir();
  const result = importSeoKnowledgeGaps({ inputPath, outputDir });
  console.log(`[HERMES SEO bridge] imported=${result.imported} skipped=${result.skipped} output=${result.outputDir}`);
}
