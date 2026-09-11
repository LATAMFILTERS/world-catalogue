#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const [,, candidatePathArg] = process.argv;
if (!candidatePathArg) {
  console.error('Usage: node scripts/hermes/publish-approved-candidate.mjs <approved-candidate.json>');
  process.exit(2);
}

const candidatePath = path.resolve(candidatePathArg);
const candidate = JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
const live = String(process.env.HERMES_PUBLISH_LIVE || 'false').toLowerCase() === 'true';
const allowSynthetic = String(process.env.HERMES_ALLOW_SYNTHETIC_PUBLISH || 'false').toLowerCase() === 'true';

if (candidate.workflow_status !== 'APPROVED') throw new Error('Only APPROVED candidates may be published');
if (candidate.approved_by !== 'Victor Abreu' || !candidate.approved_at) throw new Error('Victor approval metadata is required');
if (candidate.approval_required !== true) throw new Error('approval_required must remain true');
if (candidate.sync_status !== 'NOT_READY' && candidate.sync_status !== 'READY') throw new Error(`Unsupported sync_status: ${candidate.sync_status}`);
if (!candidate.proposed_target_folder || !candidate.proposed_target_entity) throw new Error('Target folder and entity are required');

const governedFolders = new Set([
  '01-technologies',
  '02-industries',
  '03-systems',
  '04-standards',
  '05-contamination',
  '06-components',
  '07-problems',
  '08-product-families',
  '09-products',
  '10-case-studies',
  '11-articles',
  '12-oems',
  '13-equipment',
  '14-intelligence',
  '15-filter-media',
  '16-suppliers',
  '17-technology-watch'
]);

const normalizedTargetFolder = String(candidate.proposed_target_folder).replaceAll('\\', '/').replace(/\/$/, '');
if (!governedFolders.has(normalizedTargetFolder)) {
  throw new Error(`Target folder is not governed: ${candidate.proposed_target_folder}`);
}

const isSynthetic = candidate.entity_code.startsWith('HERMES_TEST_') || String(candidate.source_url || '').includes('example.invalid');
if (live && isSynthetic && !allowSynthetic) {
  throw new Error('Synthetic publication is blocked. Set HERMES_ALLOW_SYNTHETIC_PUBLISH=true only for an explicit local test.');
}

const sourcePublicReferenceAllowed = candidate?.source_governance?.public_brand_reference === true;
const publicSourceVisibility = sourcePublicReferenceAllowed ? 'explicitly_allowed' : 'internal_only';

const vaultRoot = path.resolve('elimfilters-vault');
const targetDir = path.resolve(vaultRoot, normalizedTargetFolder);
if (!targetDir.startsWith(vaultRoot + path.sep)) throw new Error('Target folder escapes the vault');

// Git does not preserve empty directories. Create only folders from the governed allowlist.
fs.mkdirSync(targetDir, { recursive: true });

const safeEntity = String(candidate.proposed_target_entity).replace(/[^A-Za-z0-9_-]/g, '_');
const targetPath = path.join(targetDir, `${safeEntity}.md`);
const previewDir = path.resolve('hermes/publication-previews');
const backupDir = path.resolve('hermes/backups');
const auditDir = path.resolve('elimfilters-vault/94-sync-log');
fs.mkdirSync(previewDir, { recursive: true });
fs.mkdirSync(backupDir, { recursive: true });
fs.mkdirSync(auditDir, { recursive: true });

const now = new Date().toISOString();
const note = `---\nentity_type: ${candidate.candidate_type}\nentity_code: ${safeEntity}\nstatus: DRAFT\nsource_candidate: ${candidate.entity_code}\nsource_url: ${candidate.source_url}\nsource_publisher: ${JSON.stringify(candidate.source_publisher)}\npublic_source_visibility: ${publicSourceVisibility}\nevidence_level: ${candidate.evidence_level}\nclaim_scope: ${candidate.claim_scope}\nconfidence: ${candidate.confidence}\napproved_by: Victor Abreu\napproved_at: ${candidate.approved_at}\npublished_from_hermes_at: ${now}\nsynthetic_test: ${isSynthetic}\n---\n\n# ${safeEntity}\n\n## Proposed update\n\n${candidate.proposed_action}\n\n## Affected entities\n\n${candidate.affected_entities.map(v => `- ${v}`).join('\n')}\n\n## Internal evidence provenance\n\n> Internal governance metadata. Do not render this section, publisher name, or source URL in public ELIMFILTERS content unless public_source_visibility is explicitly_allowed after editorial review.\n\n- Publisher: ${candidate.source_publisher}\n- URL: ${candidate.source_url}\n- Source hash: ${candidate.source_hash}\n\n> HERMES-controlled publication. This note remains DRAFT until canonical editorial review is complete.\n`;
const noteHash = crypto.createHash('sha256').update(note).digest('hex');
const previewPath = path.join(previewDir, `${candidate.entity_code}.publication-preview.md`);
fs.writeFileSync(previewPath, note, 'utf8');

let backupPath = null;
let outcome = 'DRY_RUN';
if (live) {
  if (fs.existsSync(targetPath)) {
    const existing = fs.readFileSync(targetPath);
    const stamp = now.replace(/[:.]/g, '-');
    backupPath = path.join(backupDir, `${safeEntity}-${stamp}.md.bak`);
    fs.writeFileSync(backupPath, existing);
    throw new Error(`Refusing to overwrite existing canonical note. Backup created: ${backupPath}`);
  }
  fs.writeFileSync(targetPath, note, { encoding: 'utf8', flag: 'wx' });
  outcome = 'SYNCED';
}

const audit = {
  candidate_entity_code: candidate.entity_code,
  actor: 'Victor Abreu',
  timestamp: now,
  mode: live ? 'LIVE' : 'DRY_RUN',
  outcome,
  target_path: path.relative(process.cwd(), targetPath).replaceAll('\\','/'),
  preview_path: path.relative(process.cwd(), previewPath).replaceAll('\\','/'),
  backup_path: backupPath ? path.relative(process.cwd(), backupPath).replaceAll('\\','/') : null,
  note_sha256: noteHash,
  synthetic_test: isSynthetic,
  public_source_visibility: publicSourceVisibility,
  database_write: false,
  pgvector_write: false,
  unified_data_write: false
};
const auditPath = path.join(auditDir, `${candidate.entity_code}-${Date.now()}.publication.json`);
fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2) + '\n', 'utf8');

console.log(`[HERMES publish] ${outcome}`);
console.log(`[HERMES publish] preview ${previewPath}`);
if (live) console.log(`[HERMES publish] wrote ${targetPath}`);
console.log(`[HERMES publish] audit ${auditPath}`);
