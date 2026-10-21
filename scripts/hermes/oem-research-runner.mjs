#!/usr/bin/env node
// HERMES — Tuesday/Wednesday OEM research (option 2).
//
// Runs from every Lenovo HERMES run; works only on Tuesday and Wednesday. Takes
// the OEM research cases opened by Victor's ACEPTAR (knowledge gaps, channel
// hermes_weekly_approved), at most HERMES_OEM_RESEARCH_WEEKLY_MAX per ISO week
// (default 5) and 2 per run, and has headless Claude Code (Victor's plan, no API
// billing) write one hermes.sku_research.v1 file per case into the SKU inbox.
// Thursday's email turns those files into SKU proposals.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { validateResearch } from './sku-proposals.mjs';

const require = createRequire(import.meta.url);
const MAX_ATTEMPTS = 2;
const PER_RUN = 2;
const CASE_TIMEOUT_MS = 60 * 60_000;
// The research child never sees database, mail or review secrets.
const SECRET_ENV = /DATABASE_URL|SECRET|PASSWORD|API_KEY|TOKEN|AZURE_|GROQ|KNOWLEDGE_CENTER/i;

export function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const week = Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export const caseIdFor = (requestId) => `gap-${crypto.createHash('sha256').update(String(requestId)).digest('hex').slice(0, 12)}`;
export const isResearchDay = (now) => [2, 3].includes(now.getDay());

export function readLedger(stateRoot) {
  try { return JSON.parse(fs.readFileSync(path.resolve(stateRoot, 'oem-research-ledger.json'), 'utf8')); } catch { return { cases: {} }; }
}

/** Cases still to research, oldest approval first; done or twice-failed cases are skipped. */
export function pendingCases(gaps, ledger) {
  return gaps.filter((g) => g.channel === 'hermes_weekly_approved')
    .filter((g) => { const c = ledger.cases?.[caseIdFor(g.request_id)]; return !c || (c.status !== 'DONE' && c.status !== 'UNIDENTIFIED' && (c.attempts || 0) < MAX_ATTEMPTS); })
    .sort((a, b) => String(a.first_detected_at || '').localeCompare(String(b.first_detected_at || '')));
}

export function buildPrompt(gap, { caseId, outputPath, template, pageTool = 'scripts/hermes/official-page.mjs', example = '' }) {
  const equipment = [gap.equipment?.brand, gap.equipment?.model, gap.equipment?.engine, gap.equipment?.year].filter(Boolean).join(' ') || 'unknown: identify it from the request';
  return template.replaceAll('{{CASE_ID}}', caseId).replaceAll('{{REQUEST_ID}}', gap.request_id).replaceAll('{{EQUIPMENT}}', equipment)
    .replaceAll('{{QUESTION}}', String(gap.question || gap.reason || '').slice(0, 4000)).replaceAll('{{OUTPUT_PATH}}', outputPath.replaceAll('\\', '/'))
    .replaceAll('{{PAGE_TOOL}}', pageTool.replaceAll('\\', '/')).replaceAll('{{EXAMPLE}}', example);
}

// Isolated child: only Write (inside its working folder = the SKU inbox), WebSearch and the official-page
// reader; no user permission rules, no MCP connectors (Gmail, Drive...), no file reading, no secrets in env.
export function runClaude(prompt, { cwd, pageTool, bin = process.env.HERMES_CLAUDE_BIN || 'C:\\Users\\ELIMSERVER\\.local\\bin\\claude.exe', timeoutMs = CASE_TIMEOUT_MS } = {}) {
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !SECRET_ENV.test(k)));
  // dontAsk: anything not explicitly allowed below is denied (no auto-approved "read-only" shell commands).
  const args = ['-p', prompt, '--output-format', 'text', '--max-turns', '120', '--strict-mcp-config', '--setting-sources', 'project,local',
    '--permission-mode', 'dontAsk', '--tools', 'Write', 'WebSearch', 'Bash',
    '--allowedTools', 'WebSearch', 'Edit(./**)', `Bash(node ${pageTool.replaceAll('\\', '/')}:*)`];
  return new Promise((resolve) => {
    // Long path: 8.3 short names (ELIMSE~1) trip Claude Code's path safety check.
    const child = spawn(bin, args, { cwd: fs.realpathSync.native(cwd), env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = ''; let err = '';
    const timer = setTimeout(() => { child.kill(); resolve({ code: null, out, err: `${err}\nTIMEOUT` }); }, timeoutMs);
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('error', (e) => { clearTimeout(timer); resolve({ code: null, out, err: e.message }); });
    child.on('close', (code) => { clearTimeout(timer); resolve({ code, out, err }); });
  });
}

export async function runOemResearch({ now = new Date(), stateRoot = process.env.HERMES_STATE_ROOT || 'hermes/state', force = false,
  weeklyMax = Math.max(0, Number(process.env.HERMES_OEM_RESEARCH_WEEKLY_MAX ?? 5)), listGaps = null, research = runClaude, repoRoot = process.cwd() } = {}) {
  if (!force && !isResearchDay(now)) return { outcome: 'NOT_DUE' };
  const ledgerPath = path.resolve(stateRoot, 'oem-research-ledger.json');
  const ledger = readLedger(stateRoot); ledger.cases ||= {};
  const week = isoWeek(now);
  const doneThisWeek = Object.values(ledger.cases).filter((c) => c.week === week && ['DONE', 'UNIDENTIFIED'].includes(c.status)).length;
  const budget = Math.min(PER_RUN, weeklyMax - doneThisWeek);
  if (budget <= 0) return { outcome: 'WEEKLY_CAP_REACHED', week, done_this_week: doneThisWeek };

  const list = listGaps || require('../../lib/knowledge-governance/knowledge-gap-store').listPendingKnowledgeGaps;
  const gaps = await list({ limit: 100 });
  if (!gaps.persisted) return { outcome: 'QUEUE_UNAVAILABLE', error: gaps.error || null };
  const todo = pendingCases(gaps.gaps || [], ledger).slice(0, budget);
  const inbox = path.resolve(stateRoot, 'sku-research');
  fs.mkdirSync(inbox, { recursive: true });
  const template = fs.readFileSync(path.join(repoRoot, 'hermes/config/oem-research-prompt.md'), 'utf8');
  const example = fs.readFileSync(path.join(repoRoot, 'hermes/schemas/sku-research.v1.example.json'), 'utf8');
  const pageTool = path.join(repoRoot, 'scripts/hermes/official-page.mjs');
  const save = () => fs.writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);
  const results = [];
  for (const gap of todo) {
    const caseId = caseIdFor(gap.request_id);
    const outputPath = path.join(inbox, `${caseId}.json`);
    const entry = ledger.cases[caseId] || { request_id: gap.request_id, attempts: 0 };
    entry.attempts += 1; entry.started_at = now.toISOString(); entry.week = week;
    ledger.cases[caseId] = entry; save();
    const run = await research(buildPrompt(gap, { caseId, outputPath, template, pageTool, example }), { cwd: inbox, pageTool });
    let doc = null; try { doc = JSON.parse(fs.readFileSync(outputPath, 'utf8')); } catch {}
    // An automated "no search result" is never a verified absence (cross-reference lists miss new OEM numbers):
    // absence flags stay a human decision, so the position is reported as incomplete instead.
    let stripped = 0;
    for (const p of Array.isArray(doc?.positions) ? doc.positions : []) {
      for (const k of ['donaldson_absence_verified', 'fleetguard_absence_verified', 'primary_absence_verified']) if (k in p) { delete p[k]; stripped += 1; }
    }
    if (stripped) fs.writeFileSync(outputPath, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = doc ? validateResearch(doc).concat(doc.case_id === caseId ? [] : ['case_id mismatch']) : [];
    if (doc && !errors.length) entry.status = 'DONE';
    else if (/UNIDENTIFIED/.test(run.out)) entry.status = 'UNIDENTIFIED';
    else {
      entry.status = 'FAILED';
      if (doc) fs.renameSync(outputPath, `${outputPath}.invalid-${Date.now()}`); // keep Thursday's inbox clean
    }
    entry.finished_at = new Date().toISOString();
    entry.detail = (errors.length ? errors.join('; ') : String(run.out || run.err).trim().split('\n').pop()).slice(0, 500);
    save();
    results.push({ case_id: caseId, request_id: gap.request_id, status: entry.status, detail: entry.detail });
  }
  return { outcome: 'OK', week, researched: results.length, pending_after: Math.max(0, pendingCases(gaps.gaps || [], ledger).length), results };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  runOemResearch({ force: process.argv.includes('--force') })
    .then((r) => console.log(`[HERMES oem-research] ${JSON.stringify(r)}`))
    .catch((error) => { console.error(`[HERMES oem-research] ${error.message}`); process.exit(1); });
}
