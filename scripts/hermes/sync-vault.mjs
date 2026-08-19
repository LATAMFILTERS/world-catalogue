#!/usr/bin/env node
// HERMES -> Obsidian Knowledge Vault sync CLI.
//
// Dry-run is the default and safe mode (matches item 15's requirement: "Use
// dry-run as the default until validation is complete"). Live writes
// require BOTH --apply and HERMES_VAULT_SYNC_LIVE=true, mirroring the
// existing publish-approved-candidate.mjs/update-existing-note.mjs
// convention of a CLI flag plus an explicit env var, never either alone.
//
// This script only ever reads APPROVED findings (workflow_status ===
// 'APPROVED', approved_by/approved_at present) from hermes/real-candidates/
// — the same directory and the same approval contract the existing publish
// pipeline already uses. It never reads hermes/real-candidates-previews/
// (dry-run-only candidate previews) as sync input.
//
// Transaction safety (item 21): every file this run would touch is fully
// prepared and validated in memory FIRST; only if every single plan item
// is either NOOP, REJECTED (skipped, not attempted) or a validated
// CREATE/UPDATE does the apply phase begin, and even then each write is
// wrapped so a failure on one entity's write does not leave a different
// entity half-written — write failures are collected and reported, and any
// entity that fails to write is rolled back from its prepared backup
// before this process exits with a non-zero code.
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  planSync,
  resolveVaultWritePath,
  mergeManagedBlock
} from './vault-sync-core.mjs';

const vaultRoot = path.resolve('elimfilters-vault');
const candidatesDir = path.resolve('hermes/real-candidates');
const auditDir = path.resolve(vaultRoot, '94-sync-log');
const reportDir = path.resolve('hermes/vault-sync-reports');

const apply = process.argv.includes('--apply');
const live = apply && String(process.env.HERMES_VAULT_SYNC_LIVE || 'false').toLowerCase() === 'true';
if (apply && !live) {
  console.error('[HERMES vault-sync] --apply requires HERMES_VAULT_SYNC_LIVE=true as well. Running as dry-run instead.');
}

// Narrow, explicit, conservative mapping from a HERMES candidate's
// governed category to a REAL current vault folder. Deliberately does NOT
// cover every CATEGORY_RULES entry in collect-real-sources-core.mjs —
// several of those (oem_*, filtration_competitor, strategic_supplier,
// filter_media, technical_publication) target folders (12-oems,
// 17-technology-watch, 16-suppliers, 15-filter-media, 14-intelligence)
// that do not exist as real elimfilters-vault directories yet. Findings in
// those categories correctly fall through to NO_TARGET_MAPPING and stay as
// intelligence-only records — that is the safe, honest behavior per the
// mission's own instruction to record an intelligence finding rather than
// invent a destination.
function resolveTarget(finding) {
  if (finding.category === 'standards' || finding.category === 'regulation') {
    const key = finding.canonical_entity || finding.affected_entities?.[0];
    if (!key) return null;
    return { folder: '04-standards', key, name: finding.source_title || key };
  }
  return null;
}

function loadApprovedFindings() {
  if (!fs.existsSync(candidatesDir)) return [];
  const findings = [];
  for (const file of fs.readdirSync(candidatesDir).filter((f) => f.endsWith('.json'))) {
    try {
      const candidate = JSON.parse(fs.readFileSync(path.join(candidatesDir, file), 'utf8'));
      if (candidate.workflow_status === 'APPROVED') findings.push(candidate);
    } catch { /* malformed candidate file — skipped, not fatal to the run */ }
  }
  return findings;
}

const findings = loadApprovedFindings();
const { plans, summary } = planSync(findings, {
  vaultRoot,
  readFile: (p) => fs.readFileSync(p, 'utf8'),
  resolveTarget
});

console.log(`[HERMES vault-sync] mode=${live ? 'LIVE' : 'DRY_RUN'} findings=${findings.length} create=${summary.create} update=${summary.update} noop=${summary.noop} ambiguous=${summary.ambiguous} rejected=${summary.rejected}`);
for (const plan of plans) {
  if (plan.decision === 'AMBIGUOUS') console.warn(`[HERMES vault-sync] AMBIGUOUS ${plan.finding_id}: matches ${plan.matches.join(', ')} — requires human review, no note created`);
  if (plan.decision === 'REJECTED') console.warn(`[HERMES vault-sync] REJECTED ${plan.finding_id}: ${plan.reason}`);
  if (plan.danglingRejected?.length) console.warn(`[HERMES vault-sync] ${plan.finding_id}: dropped dangling link(s) ${plan.danglingRejected.join(', ')}`);
}

fs.mkdirSync(reportDir, { recursive: true });
const now = new Date().toISOString();
const reportPath = path.join(reportDir, `vault-sync-${now.replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(reportPath, JSON.stringify({ mode: live ? 'LIVE' : 'DRY_RUN', generated_at: now, summary, plans }, null, 2) + '\n', 'utf8');
console.log(`[HERMES vault-sync] report ${reportPath}`);

if (!live) {
  console.log('[HERMES vault-sync] DRY RUN — no vault files were written.');
  process.exit(0);
}

// --- Prepare phase: resolve every write target, read+validate every
// existing note that would be touched, build every new file's full
// content, BEFORE writing anything. ---
const writable = plans.filter((p) => p.decision === 'CREATE' || p.decision === 'UPDATE');
const prepared = [];
let prepareFailed = false;

for (const plan of writable) {
  if (plan.decision === 'CREATE') {
    const resolved = resolveVaultWritePath(vaultRoot, plan.targetFolder, plan.targetKey);
    if (!resolved.ok) { console.error(`[HERMES vault-sync] PREPARE FAILED ${plan.finding_id}: ${resolved.reason}`); prepareFailed = true; continue; }
    if (fs.existsSync(resolved.filePath)) { console.error(`[HERMES vault-sync] PREPARE FAILED ${plan.finding_id}: target already exists, refusing to overwrite via CREATE path: ${resolved.filePath}`); prepareFailed = true; continue; }
    const content = [
      '---',
      'type: intelligence_candidate',
      'status: candidate',
      `key: ${plan.targetKey}`,
      `name: "${plan.targetKey}"`,
      'in_unified_data: false',
      'tags:',
      '  - hermes-discovered',
      '  - pending-canonical-review',
      '---',
      '',
      `# ${plan.targetKey}`,
      '',
      '> **NOT YET CANONICAL.** This note was created by HERMES from an approved finding and requires a separate human promotion step (status: candidate -> active) before it is treated as canonical ELIMFILTERS knowledge.',
      '',
      plan.managedBlock,
      ''
    ].join('\n');
    prepared.push({ plan, mode: 'CREATE', filePath: resolved.filePath, content });
  } else {
    let original;
    try { original = fs.readFileSync(plan.targetPath, 'utf8'); } catch (error) {
      console.error(`[HERMES vault-sync] PREPARE FAILED ${plan.finding_id}: cannot read ${plan.targetPath}: ${error.message}`);
      prepareFailed = true;
      continue;
    }
    prepared.push({ plan, mode: 'UPDATE', filePath: plan.targetPath, content: mergeManagedBlock(original, plan.managedBlock), original });
  }
}

if (prepareFailed) {
  console.error('[HERMES vault-sync] ABORTED — one or more items failed to prepare. No vault files were written (all-or-nothing).');
  process.exit(1);
}

// --- Apply phase: write everything; on any failure, roll back everything
// this run touched before exiting non-zero. ---
const backupDir = path.resolve('hermes/backups');
fs.mkdirSync(backupDir, { recursive: true });
const written = [];
let applyFailed = null;

for (const item of prepared) {
  try {
    if (item.mode === 'UPDATE') {
      const stamp = now.replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `${path.basename(item.filePath)}-${stamp}.bak`);
      fs.writeFileSync(backupPath, item.original, { flag: 'wx' });
      item.backupPath = backupPath;
    }
    fs.mkdirSync(path.dirname(item.filePath), { recursive: true });
    fs.writeFileSync(item.filePath, item.content, { encoding: 'utf8', flag: item.mode === 'CREATE' ? 'wx' : 'w' });
    written.push(item);
  } catch (error) {
    applyFailed = { item, error };
    break;
  }
}

if (applyFailed) {
  console.error(`[HERMES vault-sync] WRITE FAILED for ${applyFailed.item.plan.finding_id}: ${applyFailed.error.message}`);
  for (const item of written) {
    if (item.mode === 'UPDATE' && item.original !== undefined) fs.writeFileSync(item.filePath, item.original, 'utf8');
    else if (item.mode === 'CREATE') fs.rmSync(item.filePath, { force: true });
  }
  console.error(`[HERMES vault-sync] rolled back ${written.length} item(s) written before the failure. No partial vault mutation was left in place.`);
  process.exit(1);
}

fs.mkdirSync(auditDir, { recursive: true });
const auditPath = path.join(auditDir, `vault-sync-${now.replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(auditPath, JSON.stringify({
  generated_at: now,
  actor: 'Victor Abreu',
  mode: 'LIVE',
  written: written.map((w) => ({ mode: w.mode, path: path.relative(process.cwd(), w.filePath).replaceAll('\\', '/'), finding_id: w.plan.finding_id, fingerprint: w.plan.fingerprint })),
  database_write: false,
  pgvector_write: false,
  unified_data_write: false
}, null, 2) + '\n', 'utf8');

console.log(`[HERMES vault-sync] LIVE — wrote ${written.length} file(s)`);
console.log(`[HERMES vault-sync] audit ${auditPath}`);
