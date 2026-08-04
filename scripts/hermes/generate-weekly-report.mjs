#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { analyzeCandidates, loadCandidates, resolveRealCandidatesInputDir } from './hermes-core.mjs';

// '--auto' is an explicit request (used by hermes:report:real) to resolve
// the real-candidates directory based on HERMES_COLLECTION_DRY_RUN — DRY
// RUN reads hermes/real-candidates-previews, LIVE reads
// hermes/real-candidates. A literal path argument still always wins, and
// the bare default (no argument at all) is untouched.
const rawArg = process.argv[2];
const input = rawArg === '--auto' ? resolveRealCandidatesInputDir() : (rawArg || 'hermes/test-candidates');
if (rawArg === '--auto') console.log(`[HERMES report] --auto resolved to ${input}`);
const outputDir = path.resolve(process.argv[3] || 'hermes/reports');

// Only the real-candidates pipeline (hermes:report:real, signaled by
// '--auto') attaches the collector's own per-source stats (sources
// checked/unchanged/changed/etc.) — the separate hermes/test-candidates
// pipeline never had a real collector run behind it, so it never renders
// this section, even if a stale collection audit happens to exist from an
// unrelated earlier run.
function loadLatestCollectionSummary() {
  const auditDir = path.resolve('elimfilters-vault/94-sync-log');
  if (!fs.existsSync(auditDir)) return null;
  const files = fs.readdirSync(auditDir).filter((f) => /^collection-\d+\.collection\.json$/.test(f)).sort();
  if (!files.length) return null;
  try {
    return JSON.parse(fs.readFileSync(path.join(auditDir, files.at(-1)), 'utf8'));
  } catch {
    return null;
  }
}
const collectionSummary = rawArg === '--auto' ? loadLatestCollectionSummary() : null;

// Same restriction as the collection summary above — only ever attached to
// the real-candidates pipeline.
function loadLatestPromotionSummary() {
  const auditDir = path.resolve('elimfilters-vault/94-sync-log');
  if (!fs.existsSync(auditDir)) return null;
  const files = fs.readdirSync(auditDir).filter((f) => /^promotion-\d+\.promotion\.json$/.test(f)).sort();
  if (!files.length) return null;
  try {
    return JSON.parse(fs.readFileSync(path.join(auditDir, files.at(-1)), 'utf8'));
  } catch {
    return null;
  }
}
const promotionSummary = rawArg === '--auto' ? loadLatestPromotionSummary() : null;

// One of the four required banners. A promotion record (if one exists at
// all) always takes precedence over the generic "preview only" state, since
// it is more specific, more recent evidence about what actually happened.
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
const accepted = results.filter((r) => r.valid);
const invalid = results.filter((r) => !r.valid && !r.duplicateOf);
const duplicates = results.filter((r) => r.duplicateOf);
const groups = {};
for (const result of accepted) {
  const key = result.candidate.candidate_type;
  (groups[key] ||= []).push(result.candidate);
}

const packageData = {
  schema_version: '1.0.0',
  generated_at: end,
  reporting_period: { start, end },
  totals: {
    scanned: results.length,
    review_ready: accepted.length,
    duplicates_suppressed: duplicates.length,
    invalid: invalid.length,
    needs_research: accepted.filter((r) => r.candidate.workflow_status === 'NEEDS_RESEARCH').length
  },
  groups,
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
    candidates_suppressed: collectionSummary.candidates_suppressed ?? collectionSummary.duplicates ?? 0
  } : null,
  baseline_promotion: promotionSummary ? {
    status: promotionSummary.status,
    banner: baselinePromotionBanner(),
    sources_promoted: promotionSummary.sources_promoted ?? 0,
    baseline_sha256: promotionSummary.baseline_sha256 ?? null,
    timestamp: promotionSummary.timestamp ?? null,
    backup_path: promotionSummary.backup_path ?? null,
    candidates_written: promotionSummary.candidates_written ?? 0,
    writes_outside_baseline: promotionSummary.writes_outside_baseline ?? 0
  } : null,
  publication_boundary: 'NO_DATABASE_WRITES',
  approval_authority: 'Victor Abreu'
};

const lines = [
  '# HERMES Weekly Intelligence Review', ''
];
if (packageData.source_collection?.baseline_mode) {
  lines.push('**INITIAL BASELINE — NO INTELLIGENCE CANDIDATES GENERATED**', '');
}
if (packageData.baseline_promotion?.banner) {
  lines.push(`**${packageData.baseline_promotion.banner}**`, '');
}
lines.push(
  `Generated: ${end}`, `Reporting period: ${start} — ${end}`, '',
  '## Summary', '',
  `- Candidates scanned: ${packageData.totals.scanned}`,
  `- Ready for review: ${packageData.totals.review_ready}`,
  `- Duplicates suppressed: ${packageData.totals.duplicates_suppressed}`,
  `- Invalid candidates: ${packageData.totals.invalid}`,
  `- Needs additional research: ${packageData.totals.needs_research}`, '',
  '> This report is review-only. It performs no writes to Obsidian canonical folders, PostgreSQL, pgvector, Part Search, or unified-data.ts.', ''
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
    `- Candidates written by promotion: ${bp.candidates_written}`,
    `- Writes outside the baseline file: ${bp.writes_outside_baseline}`, ''
  );
}
for (const [type, candidates] of Object.entries(groups).sort()) {
  lines.push(`## ${type.replaceAll('_', ' ')}`, '');
  for (const c of candidates) {
    lines.push(`### ${c.entity_code}`, '',
      `- Source: ${c.source_publisher} — ${c.source_url}`,
      `- Evidence: ${c.evidence_level}; confidence ${c.confidence}`,
      `- Claim scope: ${c.claim_scope}`,
      `- Affected entities: ${c.affected_entities.join(', ')}`,
      `- Proposed target: ${c.proposed_target_folder}${c.proposed_target_entity ? ` / ${c.proposed_target_entity}` : ''}`,
      `- Proposed action: ${c.proposed_action}`,
      `- Recommendation: ${c.workflow_status === 'NEEDS_RESEARCH' ? 'RESEARCH' : 'REVIEW FOR APPROVAL'}`,
      `- Source hash: ${c.source_hash}`, '');
  }
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
