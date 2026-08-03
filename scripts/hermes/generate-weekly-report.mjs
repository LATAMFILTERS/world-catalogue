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
  publication_boundary: 'NO_DATABASE_WRITES',
  approval_authority: 'Victor Abreu'
};

const lines = [
  '# HERMES Weekly Intelligence Review', '',
  `Generated: ${end}`, `Reporting period: ${start} — ${end}`, '',
  '## Summary', '',
  `- Candidates scanned: ${packageData.totals.scanned}`,
  `- Ready for review: ${packageData.totals.review_ready}`,
  `- Duplicates suppressed: ${packageData.totals.duplicates_suppressed}`,
  `- Invalid candidates: ${packageData.totals.invalid}`,
  `- Needs additional research: ${packageData.totals.needs_research}`, '',
  '> This report is review-only. It performs no writes to Obsidian canonical folders, PostgreSQL, pgvector, Part Search, or unified-data.ts.', ''
];
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
