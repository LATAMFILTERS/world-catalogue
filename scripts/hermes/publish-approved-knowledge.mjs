#!/usr/bin/env node
// HERMES — publish Victor-approved knowledge to the public Knowledge Center.
//
// Victor's ACEPTAR in the weekly email is the approval. For every approved,
// VERIFIED candidate that carries NEW knowledge (knowledge_action CREATE_NEW) and
// is not already in the validated canonical base, this writes one canonical note
// into elimfilters-vault/13-canonical-knowledge, regenerates the tracked index,
// runs the canonical validators, opens a PR and emails Victor the link. Victor
// merges it (main stays protected; no automated merge without review).
//
// Public text = the verified neutral public_safe_fact only: no source URL, no
// competitor names, no raw source performance figures (repo hard rules).
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { buildValidatedKnowledgeContext, validateNoveltyAgainstValidatedBase } from './validated-knowledge-context.mjs';

const BLOCKED = /\b(donaldson|fleetguard|atmus|cummins filtration|ahlstrom|hollingsworth|mann[- ]?filter|mann\+hummel|mann \+ hummel|baldwin|parker|racor|hengst|mahle|ufi|filtration group|fram|wix|camfil|pall|hydac|sogefi|luberfiner|purolator)\b|https?:\/\/|www\.|EVID-/i;
const SYSTEM_BY_DOMAIN = {
  fuel_filtration: 'Fuel Cleanliness Protection Systems', lubrication_oil: 'Lubrication Protection Systems',
  hydraulics_fluids: 'Hydraulic Protection Systems', industrial_fluid_conditioning: 'Hydraulic Protection Systems',
  cooling_thermal: 'Cooling System Protection Systems', air_filtration: 'Air Intake & Airflow Protection Systems',
  industrial_air_filtration: 'Air Intake & Airflow Protection Systems'
};
const ALLOWED_PATH = /^(elimfilters-vault\/13-canonical-knowledge\/(shared-engineering|industrial-process)\/industry-intelligence\/INTEL-[0-9A-F]{12}\.md|frontend\/src\/generated\/canonical-knowledge\.json)$/;
const VALIDATORS = ['build-canonical-knowledge-index.mjs', 'validate-canonical-knowledge-consumption.mjs', 'validate-canonical-ld-hd-separation.mjs', 'validate-canonical-taxonomy.mjs', 'validate-universal-knowledge-governance.mjs', 'validate-path-domain-consistency.mjs'];

const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').replace(/\|/g, '/').trim();

export function knowledgeEligibility(c) {
  const rr = c?.research_resolution || {};
  if (c?.workflow_status !== 'APPROVED' || c?.approved_by !== 'Victor Abreu') return 'NOT_APPROVED';
  if (rr.status !== 'VERIFIED') return 'NOT_VERIFIED';
  if (rr.knowledge_action !== 'CREATE_NEW') return 'NOT_NEW_KNOWLEDGE';
  if (rr.destination === 'INTERNAL_ONLY') return 'INTERNAL_ONLY';
  const fact = clean(rr.public_safe_fact);
  if (fact.length < 12 || BLOCKED.test(fact)) return 'NO_PUBLIC_SAFE_FACT';
  return null;
}

export function buildCanonicalNote(c, now = new Date()) {
  const rr = c.research_resolution;
  const domainId = String(c.category || '').replace(/^industry_sweep:/, '');
  const industrial = domainId.startsWith('industrial_');
  const domain = industrial ? 'INDUSTRIAL_PROCESS_KNOWLEDGE_DOMAIN' : 'SHARED_ENGINEERING_KNOWLEDGE';
  const folder = industrial ? 'industrial-process' : 'shared-engineering';
  const id = `INTEL-${crypto.createHash('sha256').update(c.entity_code).digest('hex').slice(0, 12).toUpperCase()}`;
  const fact = clean(rr.public_safe_fact);
  const title = clean(rr.finding_title && !BLOCKED.test(rr.finding_title) ? rr.finding_title : fact).replace(/"/g, "'").slice(0, 120);
  const text = `---
type: canonical_knowledge
status: approved
knowledge_object_id: "${id}"
title: "${title}"
domain: "${domain}"
knowledge_content_type: "Industry Intelligence"
confidence: "medium"
publication_status: approved
public_use_allowed: true
hermes_origin: true
nodal_review_required: false
catalog_write_allowed: false
cross_reference_write_allowed: false
---

# ${title}

> **ELIMFILTERS CANONICAL KNOWLEDGE.** Industry intelligence verified by HERMES and approved by Victor Abreu.

## Knowledge Position

- Domain: ${domain}
- Industries: Shared / none
- Systems: ${SYSTEM_BY_DOMAIN[domainId] || 'Shared / none'}
- Technologies: None assigned
- Technology relation: none
- Application relation: not_applicable

## Technical Relationships — Validated

- ${fact} | status: approved

## Governance

- Verified industry development; source identity is internal provenance only.
- This knowledge does not create SKU, application or cross-reference authority.

## Canonical Approval

- Reviewer: Victor Abreu (HERMES weekly review, ACEPTAR)
- Reviewed at: ${now.toISOString()}
- Technical relationships approved: 1
- Promotion gate: PASS
`;
  return { id, relPath: `elimfilters-vault/13-canonical-knowledge/${folder}/industry-intelligence/${id}.md`, text, title, fact };
}

export function isNovel(note, base = buildValidatedKnowledgeContext(`${note.title} ${note.fact}`)) {
  return validateNoveltyAgainstValidatedBase({ knowledge_action: 'CREATE_NEW', finding_title: note.title, public_safe_fact: note.fact }, base).length === 0;
}

export const onlyAllowedPaths = (files) => files.length > 0 && files.every((f) => ALLOWED_PATH.test(f));

function readJson(file, fallback) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } }

async function notify(subject, body) {
  try {
    const { createRequire } = await import('node:module');
    const OutlookMailService = createRequire(import.meta.url)('../../lib/outlook-mail.js');
    const to = process.env.HERMES_REVIEW_EMAIL;
    if (!to) return;
    const mail = new OutlookMailService(); mail.validateConfig();
    if (process.env.HERMES_SENDER_EMAIL) mail.emailMap.default = process.env.HERMES_SENDER_EMAIL;
    await mail.send(to, subject, `<p>${body.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`, body, 'default');
  } catch (error) { console.error(`[HERMES kc-publish] notify failed: ${error.message}`); }
}

export async function publishApprovedKnowledge({ repoDir = process.cwd(), stateRoot = process.env.HERMES_STATE_ROOT || 'hermes/state', live = false, now = new Date() } = {}) {
  const approvedDir = path.join(repoDir, 'elimfilters-vault/92-approved-updates');
  const ledgerPath = path.resolve(stateRoot, 'kc-publication-ledger.json');
  const ledger = readJson(ledgerPath, { handled: {} });
  const notes = []; const skipped = [];
  for (const name of fs.existsSync(approvedDir) ? fs.readdirSync(approvedDir).filter((f) => f.endsWith('.json')) : []) {
    const c = readJson(path.join(approvedDir, name), null);
    if (!c?.entity_code || ledger.handled[c.entity_code]) continue;
    const reason = knowledgeEligibility(c);
    const note = reason ? null : buildCanonicalNote(c, now);
    const why = reason || (fs.existsSync(path.join(repoDir, note.relPath)) ? 'ALREADY_PUBLISHED' : !isNovel(note) ? 'ALREADY_IN_KNOWLEDGE_CENTER' : null);
    if (why) { skipped.push({ candidate: c.entity_code, reason: why }); ledger.handled[c.entity_code] = { outcome: 'SKIPPED', reason: why, at: now.toISOString() }; continue; }
    notes.push({ candidate: c.entity_code, ...note });
  }
  const saveLedger = () => { fs.mkdirSync(path.dirname(ledgerPath), { recursive: true }); fs.writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`); };
  if (!notes.length || !live) { if (live) saveLedger(); return { outcome: notes.length ? 'DRY_RUN' : 'NOTHING_TO_PUBLISH', notes: notes.map(({ candidate, id, relPath, title }) => ({ candidate, id, relPath, title })), skipped }; }

  const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { cwd: work, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-kc-'));
  const branch = `hermes/kc-${now.toISOString().slice(0, 10)}-${notes[0].id.slice(6, 14).toLowerCase()}`;
  let pr = null;
  try {
    execFileSync('git', ['-C', repoDir, 'fetch', '-q', 'origin', 'main']);
    execFileSync('git', ['-C', repoDir, 'worktree', 'add', '-q', '-b', branch, work, 'origin/main']);
    for (const n of notes) { fs.mkdirSync(path.dirname(path.join(work, n.relPath)), { recursive: true }); fs.writeFileSync(path.join(work, n.relPath), n.text, { flag: 'wx' }); }
    for (const v of VALIDATORS) run(process.execPath, [`scripts/${v}`]);
    run('git', ['add', '--', 'elimfilters-vault/13-canonical-knowledge', 'frontend/src/generated/canonical-knowledge.json']);
    const staged = run('git', ['diff', '--cached', '--name-only']).split(/\r?\n/).filter(Boolean);
    if (!onlyAllowedPaths(staged)) throw new Error(`unexpected paths staged: ${staged.join(', ')}`);
    run('git', ['commit', '-q', '-m', `docs(knowledge-center): publish ${notes.length} approved HERMES finding(s)\n\nApproved by Victor Abreu via the HERMES weekly email (ACEPTAR).\nCandidates: ${notes.map((n) => n.candidate).join(', ')}`]);
    run('git', ['push', '-q', '-u', 'origin', branch]);
    const body = `Automatic Knowledge Center publication after Victor Abreu's ACEPTAR in the HERMES weekly email.\n\n${notes.map((n) => `- ${n.id}: ${n.title} (from ${n.candidate})`).join('\n')}\n\nOnly canonical notes + the tracked canonical index. Merged automatically only when every check passes.`;
    pr = run('gh', ['pr', 'create', '--base', 'main', '--head', branch, '--title', `Knowledge Center: ${notes.length} approved HERMES finding(s)`, '--body', body]).trim().split(/\s+/).pop();
    for (const n of notes) ledger.handled[n.candidate] = { outcome: 'PR_OPENED', id: n.id, pr, at: new Date().toISOString() };
    saveLedger();
    await notify('[HERMES] Knowledge Center: publicación lista para fusionar', `HERMES preparó ${notes.length} nota(s) para el Knowledge Center a partir de tus aprobaciones: ${notes.map((n) => n.title).join(' | ')}. Revisa y fusiona el PR cuando sus pruebas estén en verde: ${pr}`);
    return { outcome: 'PR_OPENED', pr, notes: notes.map(({ candidate, id, title }) => ({ candidate, id, title })), skipped };
  } catch (error) {
    for (const n of notes) ledger.handled[n.candidate] = { outcome: 'NEEDS_ATTENTION', pr, error: error.message.slice(0, 300), at: new Date().toISOString() };
    saveLedger();
    await notify('[HERMES] Publicación del Knowledge Center pendiente de revisión', `HERMES no pudo publicar automáticamente ${notes.length} hallazgo(s) aprobados. ${pr ? `El PR quedó abierto: ${pr}.` : 'No se abrió PR.'} Motivo: ${error.message.slice(0, 300)}`);
    return { outcome: 'NEEDS_ATTENTION', pr, error: error.message, skipped };
  } finally {
    try { execFileSync('git', ['-C', repoDir, 'worktree', 'remove', '--force', work]); } catch {}
    try { execFileSync('git', ['-C', repoDir, 'branch', '-D', branch], { stdio: 'ignore' }); } catch {}
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = await publishApprovedKnowledge({ live: process.argv.includes('--live') });
  console.log(JSON.stringify(result, null, 2));
  if (result.outcome === 'NEEDS_ATTENTION') process.exitCode = 1;
}
