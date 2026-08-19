#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const [,, targetPathArg, backupPathArg] = process.argv;
if (!targetPathArg || !backupPathArg) {
  console.error('Usage: node scripts/hermes/rollback-note-update.mjs <target-note.md> <backup.md.bak>');
  process.exit(2);
}

const live = String(process.env.HERMES_ROLLBACK_LIVE || 'false').toLowerCase() === 'true';
const confirmation = String(process.env.HERMES_ROLLBACK_CONFIRMATION || '');
const targetPath = path.resolve(targetPathArg);
const backupPath = path.resolve(backupPathArg);
const vaultRoot = path.resolve('elimfilters-vault');
const backupsRoot = path.resolve('hermes/backups');

if (!targetPath.startsWith(vaultRoot + path.sep)) throw new Error('Rollback target must remain inside elimfilters-vault');
if (!backupPath.startsWith(backupsRoot + path.sep)) throw new Error('Rollback backup must remain inside hermes/backups');
if (!fs.existsSync(targetPath)) throw new Error(`Target note not found: ${targetPath}`);
if (!fs.existsSync(backupPath)) throw new Error(`Backup not found: ${backupPath}`);

const expectedConfirmation = path.basename(targetPath);
if (live && confirmation !== expectedConfirmation) {
  throw new Error(`Set HERMES_ROLLBACK_CONFIRMATION=${expectedConfirmation} for this exact note.`);
}

const current = fs.readFileSync(targetPath, 'utf8');
const backup = fs.readFileSync(backupPath, 'utf8');
const currentHash = crypto.createHash('sha256').update(current).digest('hex');
const backupHash = crypto.createHash('sha256').update(backup).digest('hex');
const now = new Date().toISOString();
const previewDir = path.resolve('hermes/rollback-previews');
const auditDir = path.resolve('elimfilters-vault/94-sync-log');
fs.mkdirSync(previewDir, { recursive: true });
fs.mkdirSync(auditDir, { recursive: true });

const previewPath = path.join(previewDir, `${path.basename(targetPath, '.md')}.rollback-preview.txt`);
fs.writeFileSync(previewPath, [
  `Target: ${path.relative(process.cwd(), targetPath).replaceAll('\\','/')}`,
  `Backup: ${path.relative(process.cwd(), backupPath).replaceAll('\\','/')}`,
  `Current SHA-256: ${currentHash}`,
  `Backup SHA-256: ${backupHash}`,
  `Mode: ${live ? 'LIVE' : 'DRY_RUN'}`,
  '',
  'Rollback will replace the complete target note with the selected backup.'
].join('\n') + '\n', 'utf8');

let outcome = 'DRY_RUN';
if (live) {
  const safetyCopy = `${targetPath}.${now.replace(/[:.]/g, '-')}.pre-rollback.bak`;
  fs.writeFileSync(safetyCopy, current, { encoding: 'utf8', flag: 'wx' });
  fs.writeFileSync(targetPath, backup, 'utf8');
  outcome = 'ROLLED_BACK';
}

const audit = {
  actor: 'Victor Abreu',
  timestamp: now,
  mode: live ? 'LIVE' : 'DRY_RUN',
  outcome,
  target_path: path.relative(process.cwd(), targetPath).replaceAll('\\','/'),
  backup_path: path.relative(process.cwd(), backupPath).replaceAll('\\','/'),
  preview_path: path.relative(process.cwd(), previewPath).replaceAll('\\','/'),
  current_sha256: currentHash,
  restored_sha256: backupHash,
  database_write: false,
  pgvector_write: false,
  unified_data_write: false
};
const auditPath = path.join(auditDir, `${path.basename(targetPath, '.md')}-${Date.now()}.rollback.json`);
fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2) + '\n', 'utf8');

console.log(`[HERMES rollback] ${outcome}`);
console.log(`[HERMES rollback] preview ${previewPath}`);
if (live) console.log(`[HERMES rollback] restored ${targetPath}`);
console.log(`[HERMES rollback] audit ${auditPath}`);
