#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const [,, candidatePathArg] = process.argv;
if (!candidatePathArg) {
  console.error('Usage: node scripts/hermes/update-existing-note.mjs <approved-candidate.json>');
  process.exit(2);
}

const candidatePath = path.resolve(candidatePathArg);
const candidate = JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
const live = String(process.env.HERMES_UPDATE_LIVE || 'false').toLowerCase() === 'true';
const allowSynthetic = String(process.env.HERMES_ALLOW_SYNTHETIC_UPDATE || 'false').toLowerCase() === 'true';
const confirmation = String(process.env.HERMES_UPDATE_CONFIRMATION || '');

if (candidate.workflow_status !== 'APPROVED') throw new Error('Only APPROVED candidates may update canonical notes');
if (candidate.approved_by !== 'Victor Abreu' || !candidate.approved_at) throw new Error('Victor approval metadata is required');
if (candidate.approval_required !== true) throw new Error('approval_required must remain true');
if (!candidate.proposed_target_folder || !candidate.proposed_target_entity) throw new Error('Target folder and entity are required');

const allowedFolders = new Set([
  '01-technologies','02-industries','03-systems','04-standards','05-contamination','06-components',
  '07-problems','08-product-families','09-products','10-case-studies','11-articles','12-oems',
  '13-equipment','14-intelligence','15-filter-media','16-suppliers','17-technology-watch'
]);
const normalizedFolder = String(candidate.proposed_target_folder).replace(/\/$/, '');
if (!allowedFolders.has(normalizedFolder)) throw new Error(`Target folder is not governed: ${normalizedFolder}`);

const isSynthetic = candidate.entity_code.startsWith('HERMES_TEST_') || String(candidate.source_url || '').includes('example.invalid');
if (live && isSynthetic && !allowSynthetic) throw new Error('Synthetic update blocked. Set HERMES_ALLOW_SYNTHETIC_UPDATE=true only for explicit local testing.');
if (live && confirmation !== candidate.entity_code) throw new Error(`Set HERMES_UPDATE_CONFIRMATION=${candidate.entity_code} for this exact candidate.`);

const vaultRoot = path.resolve('elimfilters-vault');
const targetDir = path.resolve(vaultRoot, normalizedFolder);
if (!targetDir.startsWith(vaultRoot + path.sep)) throw new Error('Target folder escapes the vault');
const safeEntity = String(candidate.proposed_target_entity).replace(/[^A-Za-z0-9_-]/g, '_');
const targetPath = path.join(targetDir, `${safeEntity}.md`);
if (!fs.existsSync(targetPath)) throw new Error(`Existing canonical note not found: ${targetPath}`);

const previewDir = path.resolve('hermes/update-previews');
const backupDir = path.resolve('hermes/backups');
const auditDir = path.resolve('elimfilters-vault/94-sync-log');
fs.mkdirSync(previewDir, { recursive: true });
fs.mkdirSync(backupDir, { recursive: true });
fs.mkdirSync(auditDir, { recursive: true });

const original = fs.readFileSync(targetPath, 'utf8');
const originalHash = crypto.createHash('sha256').update(original).digest('hex');
const now = new Date().toISOString();
const markerStart = '<!-- HERMES MANAGED UPDATE START -->';
const markerEnd = '<!-- HERMES MANAGED UPDATE END -->';
const managedBlock = `${markerStart}\n## HERMES approved update\n\n- Candidate: ${candidate.entity_code}\n- Approved by: Victor Abreu\n- Approved at: ${candidate.approved_at}\n- Applied from HERMES at: ${now}\n- Evidence: ${candidate.evidence_level}\n- Claim scope: ${candidate.claim_scope}\n- Confidence: ${candidate.confidence}\n\n### Proposed action\n\n${candidate.proposed_action}\n\n### Affected entities\n\n${candidate.affected_entities.map(v => `- ${v}`).join('\n')}\n\n### Source\n\n- Publisher: ${candidate.source_publisher}\n- URL: ${candidate.source_url}\n- Source hash: ${candidate.source_hash}\n${markerEnd}`;

let updated;
const start = original.indexOf(markerStart);
const end = original.indexOf(markerEnd);
if (start >= 0 && end >= start) {
  updated = original.slice(0, start) + managedBlock + original.slice(end + markerEnd.length);
} else {
  updated = original.trimEnd() + `\n\n${managedBlock}\n`;
}
const updatedHash = crypto.createHash('sha256').update(updated).digest('hex');

function unifiedPreview(before, after) {
  const beforeLines = before.split(/\r?\n/);
  const afterLines = after.split(/\r?\n/);
  const lines = ['--- existing', '+++ proposed'];
  const max = Math.max(beforeLines.length, afterLines.length);
  for (let i = 0; i < max; i += 1) {
    const a = beforeLines[i];
    const b = afterLines[i];
    if (a === b) continue;
    if (a !== undefined) lines.push(`-${a}`);
    if (b !== undefined) lines.push(`+${b}`);
  }
  return lines.join('\n') + '\n';
}

const previewPath = path.join(previewDir, `${candidate.entity_code}.update.diff`);
fs.writeFileSync(previewPath, unifiedPreview(original, updated), 'utf8');

let backupPath = null;
let outcome = 'DRY_RUN';
if (live) {
  const stamp = now.replace(/[:.]/g, '-');
  backupPath = path.join(backupDir, `${safeEntity}-${stamp}-${originalHash.slice(0, 12)}.md.bak`);
  fs.writeFileSync(backupPath, original, { encoding: 'utf8', flag: 'wx' });
  const currentHash = crypto.createHash('sha256').update(fs.readFileSync(targetPath, 'utf8')).digest('hex');
  if (currentHash !== originalHash) throw new Error('Canonical note changed after preview generation; update aborted.');
  fs.writeFileSync(targetPath, updated, 'utf8');
  outcome = 'UPDATED';
}

const audit = {
  candidate_entity_code: candidate.entity_code,
  actor: 'Victor Abreu',
  timestamp: now,
  mode: live ? 'LIVE' : 'DRY_RUN',
  outcome,
  target_path: path.relative(process.cwd(), targetPath).replaceAll('\\', '/'),
  preview_path: path.relative(process.cwd(), previewPath).replaceAll('\\', '/'),
  backup_path: backupPath ? path.relative(process.cwd(), backupPath).replaceAll('\\', '/') : null,
  original_sha256: originalHash,
  updated_sha256: updatedHash,
  synthetic_test: isSynthetic,
  database_write: false,
  pgvector_write: false,
  unified_data_write: false
};
const auditPath = path.join(auditDir, `${candidate.entity_code}-${Date.now()}.update.json`);
fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2) + '\n', 'utf8');

console.log(`[HERMES update] ${outcome}`);
console.log(`[HERMES update] diff ${previewPath}`);
if (backupPath) console.log(`[HERMES update] backup ${backupPath}`);
if (live) console.log(`[HERMES update] wrote ${targetPath}`);
console.log(`[HERMES update] audit ${auditPath}`);
