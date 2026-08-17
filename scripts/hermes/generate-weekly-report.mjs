#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { analyzeCandidates, loadCandidates, resolveRealCandidatesInputDir, isResearchResolved } from './hermes-core.mjs';

const rawArg = process.argv[2];
const input = rawArg === '--auto' ? resolveRealCandidatesInputDir() : (rawArg || 'hermes/test-candidates');
if (rawArg === '--auto') console.log(`[HERMES report] --auto resolved to ${input}`);
const outputDir = path.resolve(process.argv[3] || 'hermes/reports');

function loadLatestCollectionSummary() {
  const auditDir = path.resolve('elimfilters-vault/94-sync-log');
  if (!fs.existsSync(auditDir)) return null;
  const files = fs.readdirSync(auditDir).filter((f) => /^collection-\d+\.collection\.json$/.test(f)).sort();
  if (!files.length) return null;
  try { return JSON.parse(fs.readFileSync(path.join(auditDir, files.at(-1)), 'utf8')); }
  catch { return null; }
}
const collectionSummary = rawArg === '--auto' ? loadLatestCollectionSummary() : null;

function loadLatestPromotionSummary() {
  const localResultPath = path.resolve('hermes/baselines/promotion-result.local.json');
  if (!fs.existsSync(localResultPath)) return null;
  try { return JSON.parse(fs.readFileSync(localResultPath, 'utf8')); }
  catch { return null; }
}
const promotionSummary = rawArg === '--auto' ? loadLatestPromotionSummary() : null;

function baselinePromotionBanner() {
  if (promotionSummary) {
    if (promotionSummary.status === 'PROMOTED') return 'BASELINE PROMOTED';
    if (promotionSummary.status === 'PROMOTION_NOT_AUTHORIZED') return 'BASELINE PROMOTION NOT AUTHORIZED';
    if (promotionSummary.status === 'PROMOTION_FAILED') return 'BASELINE PROMOTION FAILED';
  }
  if (collectionSummary?.baseline_mode) return 'BASELINE PREVIEW ONLY';
  return null;
}

const now = new Date();
const end = now.toISOString();
const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

const results = analyzeCandidates(loadCandidates(input));
const duplicates = results.filter((r) => r.duplicateOf);
const invalid = results.filter((r) => !r.valid && !r.duplicateOf);
const valid = results.filter((r) => r.valid);

// Only a candidate that has completed its research gate and is explicitly
// PENDING_REVIEW is allowed into Victor's approval queue. Validity alone is
// not synonymous with review readiness.
const reviewReady = valid.filter((r) => r.candidate.workflow_status === 'PENDING_REVIEW' && isResearchResolved(r.candidate));
const needsResearch = results.filter((r) => r.candidate.workflow_status === 'NEEDS_RESEARCH' || (String(r.candidate.entity_code || '').startsWith('HERMES_REAL_') && !isResearchResolved(r.candidate)));
const groqResolved = results.filter((r) => isResearchResolved(r.candidate) && String(r.candidate.entity_code || '').startsWith('HERMES_REAL_'));

const groups = {};
for (const result of reviewReady) {
  const key = result.candidate.candidate_type;
  (groups[key] ||= []).push(result.candidate);
}

const packageData = {
  schema_version: '1.1.0',
  generated_at: end,
  reporting_period: { start, end },
  totals: {
    scanned: results.length,
    source_changes_detected: collectionSummary?.changed ?? 0,
    groq_resolved: groqResolved.length,
    review_ready: reviewReady.length,
    duplicates_suppressed: duplicates.length,
    invalid: invalid.length,
    needs_research: needsResearch.length
  },
  groups,
  research_pending: needsResearch.map((r) => ({
    entity_code: r.candidate.entity_code,
    source_publisher: r.candidate.source_publisher,
    source_url: r.candidate.source_url,
    reason: r.candidate.research_resolution?.reason || 'RESEARCH_NOT_RESOLVED'
  })),
  duplicates: duplicates.map((r) => ({ entity_code: r.candidate.entity_code, duplicate_of: r.duplicateOf })),
  invalid: invalid.map((r) => ({ entity_code: r.candidate.entity_code, errors: r.errors })),
  source_collection: collectionSummary ? {
    baseline_mode: collectionSummary.baseline_mode ?? false,
    sources_checked: collectionSummary.sources_checked ?? collectionSummary.sources_enabled ?? 0,
    unchanged: collectionSummary.unchanged ?? 0,
    changed: collectionSummary.changed ?? 0,
    empty_content: collectionSummary.empty_content ?? 0,
    insufficient_content: collectionSummary.insufficient_content ?? 0,
    failed: collectionSummary.failed ?? collectionSummary.fetch_errors ?? 0,
    baseline_required: collectionSummary.baseline_required ?? 0,
    candidates_created: collectionSummary.candidates_created ?? collectionSummary.created ?? 0,
    candidates_previewed: collectionSummary.candidates_previewed ?? collectionSummary.previewed ?? 0,
    candidates_suppressed: collectionSummary.candidates_suppressed ?? collectionSummary.duplicates ?? 0
  } : null,
  baseline_promotion: promotionSummary ? {
    status: promotionSummary.status,
    banner: baselinePromotionBanner(),
    sources_promoted: promotionSummary.sources_promoted ?? 0,
    baseline_sha256: promotionSummary.baseline_sha256 ?? null,
    timestamp: promotionSummary.timestamp ?? null,
    backup_path: promotionSummary.backup_path ?? null,
    state_branch: promotionSummary.state_branch ?? null,
    state_branch_commit: promotionSummary.state_branch_commit ?? null,
    remote_verified: promotionSummary.remote_verified ?? false,
    candidates_written: promotionSummary.candidates_written ?? 0,
    writes_outside_baseline: promotionSummary.writes_outside_baseline ?? 0
  } : null,
  publication_boundary: 'NO_DATABASE_WRITES',
  approval_authority: 'Victor Abreu'
};

const lines = ['# HERMES Weekly Intelligence Review', ''];
if (packageData.source_collection?.baseline_mode) lines.push('**INITIAL BASELINE — NO INTELLIGENCE CANDIDATES GENERATED**', '');
if (packageData.baseline_promotion?.banner) lines.push(`**${packageData.baseline_promotion.banner}**`, '');

lines.push(
  `Generated: ${end}`, `Reporting period: ${start} — ${end}`, '',
  '## Summary', '',
  `- Candidates scanned: ${packageData.totals.scanned}`,
  `- Source changes detected: ${packageData.totals.source_changes_detected}`,
  `- Resolved by Groq: ${packageData.totals.groq_resolved}`,
  `- Ready for Victor review: ${packageData.totals.review_ready}`,
  `- Research unresolved: ${packageData.totals.needs_research}`,
  `- Duplicates suppressed: ${packageData.totals.duplicates_suppressed}`,
  `- Invalid candidates: ${packageData.totals.invalid}`, '',
  '> This report is review-only. It performs no writes to Obsidian canonical folders, PostgreSQL, pgvector, Part Search, or legacy catalogue layer.ts.', ''
);

if (packageData.source_collection) {
  const sc = packageData.source_collection;
  lines.push(
    '## Source Collection', '',
    `- Sources checked: ${sc.sources_checked}`,
    `- Unchanged: ${sc.unchanged}`,
    `- Changed: ${sc.changed}`,
    `- Empty content: ${sc.empty_content}`,
    `- Insufficient content: ${sc.insufficient_content}`,
    `- Failed: ${sc.failed}`,
    `- Baseline required: ${sc.baseline_required}`,
    `- Candidates created: ${sc.candidates_created}`,
    `- Candidates previewed: ${sc.candidates_previewed}`,
    `- Candidates suppressed: ${sc.candidates_suppressed}`, ''
  );
}

if (packageData.baseline_promotion) {
  const bp = packageData.baseline_promotion;
  lines.push(
    '## Baseline Promotion', '',
    `- Status: ${bp.banner}`,
    `- Sources promoted: ${bp.sources_promoted}`,
    `- Baseline SHA-256: ${bp.baseline_sha256 || 'n/a'}`,
    `- Timestamp: ${bp.timestamp || 'n/a'}`,
    `- Backup created: ${bp.backup_path || 'none (no prior baseline existed)'}`,
    `- State branch: ${bp.state_branch || 'n/a'}`,
    `- State branch commit: ${bp.state_branch_commit || 'n/a'}`,
    `- Remote verified: ${bp.remote_verified}`,
    `- Candidates written by promotion: ${bp.candidates_written}`,
    `- Writes outside the baseline file: ${bp.writes_outside_baseline}`, ''
  );
}

for (const [type, candidates] of Object.entries(groups).sort()) {
  lines.push(`## ${type.replaceAll('_', ' ')}`, '');
  for (const c of candidates) {
    const rr = c.research_resolution;
    lines.push(`### ${c.entity_code}`, '',
      `- Finding: ${rr.finding_title}`,
      `- Source: ${c.source_publisher} — ${rr.evidence_url}`,
      `- Published: ${c.published_at || 'not stated by source'}`,
      `- Evidence: ${c.evidence_level}; confidence ${c.confidence}`,
      `- Groq resolution: ${rr.model}; ${rr.technical_facts.length} technical fact(s) extracted`,
      `- Technical facts: ${rr.technical_facts.join(' | ')}`,
      `- Relevance: ${rr.relevance}`,
      `- Affected entities: ${c.affected_entities.join(', ')}`,
      `- Proposed target: ${c.proposed_target_folder}${c.proposed_target_entity ? ` / ${c.proposed_target_entity}` : ''}`,
      `- Proposed action: ${c.proposed_action}`,
      '- Recommendation: REVIEW FOR APPROVAL',
      `- Source hash: ${c.source_hash}`, '')
  }
}

if (needsResearch.length) {
  lines.push('## Research unresolved', '', '> These items are not approval candidates and are shown only as an operational exception queue.', '');
  for (const r of needsResearch) {
    lines.push(`- ${r.candidate.entity_code}: ${r.candidate.research_resolution?.reason || 'RESEARCH_NOT_RESOLVED'} — ${r.candidate.source_url}`);
  }
  lines.push('');
}

if (duplicates.length) {
  lines.push('## Duplicates suppressed', '');
  for (const r of duplicates) lines.push(`- ${r.candidate.entity_code} duplicates ${r.duplicateOf}`);
  lines.push('');
}
if (invalid.length) {
  lines.push('## Invalid candidates', '');
  for (const r of invalid) lines.push(`- ${r.candidate.entity_code}: ${r.errors.join('; ')}`);
  lines.push('');
}
lines.push('## Decision authority', '', 'Only Victor Abreu may approve, reject, or request additional research.', '');

fs.mkdirSync(outputDir, { recursive: true });
const stamp = end.slice(0, 10);
const jsonPath = path.join(outputDir, `hermes-weekly-${stamp}.json`);
const mdPath = path.join(outputDir, `hermes-weekly-${stamp}.md`);
fs.writeFileSync(jsonPath, JSON.stringify(packageData, null, 2) + '\n');
fs.writeFileSync(mdPath, lines.join('\n'));
console.log(`[HERMES report] wrote ${path.relative(process.cwd(), mdPath)} and ${path.relative(process.cwd(), jsonPath)}`);
