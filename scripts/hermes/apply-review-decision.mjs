#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const [,, candidatePathArg, decisionArg, ...reasonParts] = process.argv;
if (!candidatePathArg || !decisionArg) {
  console.error('Usage: node scripts/hermes/apply-review-decision.mjs <candidate.json> <approve|reject|research> [reason]');
  process.exit(2);
}
const decision = decisionArg.toLowerCase();
if (!['approve','reject','research'].includes(decision)) throw new Error(`Unsupported decision: ${decision}`);

const candidatePath = path.resolve(candidatePathArg);
const candidate = JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
if (candidate.approval_required !== true) throw new Error('Candidate does not preserve approval_required=true');
if (candidate.workflow_status === 'SYNCED') throw new Error('SYNCED candidates cannot be reviewed again');

const now = new Date().toISOString();
const reason = reasonParts.join(' ').trim() || null;
let targetFolder;
if (decision === 'approve') {
  candidate.workflow_status = 'APPROVED';
  candidate.approved_by = 'Victor Abreu';
  candidate.approved_at = now;
  candidate.sync_status = 'NOT_READY';
  targetFolder = 'elimfilters-vault/92-approved-updates';
} else if (decision === 'reject') {
  if (!reason) throw new Error('A rejection reason is required');
  candidate.workflow_status = 'REJECTED';
  candidate.rejection_reason = reason;
  targetFolder = 'elimfilters-vault/93-rejected';
} else {
  candidate.workflow_status = 'NEEDS_RESEARCH';
  candidate.rejection_reason = reason;
  targetFolder = 'elimfilters-vault/91-pending-review';
}

const outputDir = path.resolve(targetFolder);
fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, `${candidate.entity_code}.json`);
if (fs.existsSync(outputPath)) throw new Error(`Refusing to overwrite existing decision record: ${outputPath}`);
fs.writeFileSync(outputPath, JSON.stringify(candidate, null, 2) + '\n', 'utf8');

const auditDir = path.resolve('elimfilters-vault/94-sync-log');
fs.mkdirSync(auditDir, { recursive: true });
const audit = {
  candidate_entity_code: candidate.entity_code,
  decision,
  actor: 'Victor Abreu',
  timestamp: now,
  reason,
  source_hash: candidate.source_hash,
  output_path: path.relative(process.cwd(), outputPath).replaceAll('\\','/'),
  database_write: false,
  canonical_write: false
};
fs.writeFileSync(path.join(auditDir, `${candidate.entity_code}-${Date.now()}.decision.json`), JSON.stringify(audit, null, 2) + '\n', 'utf8');
console.log(`[HERMES decision] ${candidate.entity_code} -> ${candidate.workflow_status}`);
console.log(`[HERMES decision] wrote ${outputPath}`);
