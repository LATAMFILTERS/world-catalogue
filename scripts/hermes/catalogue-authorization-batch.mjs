// HERMES — AUTORIZAR (Thursday SKU email) -> governed catalogue change, phase 1.
//
// For every AUTHORIZED decision on an "existing SKU -> new equipment" proposal
// (state ALREADY_IN_CATALOGUE, Heavy Duty), this builds one batch file
// (data/catalogue-authorizations/), dry-runs run_284 against the catalogue DB
// when one is configured, opens a PR and emails Victor the link. It never writes
// the catalogue: Victor merges and runs run_284 --execute on 5441 and 5432 himself.
// New SKUs and Light Duty vehicles are recorded as PHASE_2 and left for later.
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { SCHEMA, validateBatch } = require('../migrations/run_284_apply_authorized_equipment_applications.js');
const MIGRATION = 'scripts/migrations/run_284_apply_authorized_equipment_applications.js';

const readJson = (file, fallback) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } };

/** Splits AUTHORIZED decisions into phase-1 batch items and phase-2 leftovers. */
export function collectAuthorized(decisions, ledger = { handled: {} }) {
  const items = []; const phase2 = [];
  for (const d of decisions) {
    if (d?.decision !== 'AUTHORIZED' || !d.entity_code || ledger.handled[d.entity_code]) continue;
    if (d.state !== 'ALREADY_IN_CATALOGUE' || d.duty !== 'HEAVY_DUTY' || !d.proposed_sku) { phase2.push({ code: d.entity_code, reason: d.state !== 'ALREADY_IN_CATALOGUE' ? 'NEW_SKU_PHASE_2' : 'LIGHT_DUTY_PHASE_2' }); continue; }
    const oem = (d.evidence || []).find((e) => e.ref === 'oem') || (d.evidence || [])[0] || {};
    items.push({
      proposal_code: d.entity_code, case_id: d.case_id, sku: d.proposed_sku, duty: d.duty, position: d.position, oem_code: d.oem_code,
      equipment: { brand: d.equipment?.brand, model: d.equipment?.model, engine: d.equipment?.engine || null, year: d.equipment?.year || null, type: d.equipment?.type || null },
      evidence: { source_url: oem.evidence_url, evidence_sha256: oem.evidence_sha256 },
      authorized_by: d.decided_by || 'Victor Abreu', authorized_at: d.decided_at, researched_by: d.researched_by, researched_at: d.researched_at
    });
  }
  return { items, phase2 };
}

export function buildBatch(items, now = new Date()) {
  const id = `${now.toISOString().slice(0, 10)}-${crypto.createHash('sha256').update(items.map((i) => i.proposal_code).join('|')).digest('hex').slice(0, 8)}`;
  return { schema: SCHEMA, batch_id: id, created_at: now.toISOString(), phase: 'EXISTING_SKU_TO_NEW_EQUIPMENT', items };
}

export function prBody(batch, dryRun) {
  const rows = batch.items.map((i) => `| ${i.sku} | ${i.equipment.brand} ${i.equipment.model}${i.equipment.engine ? ` (${i.equipment.engine})` : ''} | ${i.position} | ${i.oem_code} | [fuente](${i.evidence.source_url}) |`).join('\n');
  const file = `data/catalogue-authorizations/${batch.batch_id}.json`;
  return `Aplicaciones autorizadas por Victor Abreu (AUTORIZAR, correo SKU del jueves). Fase 1: SKU existente → equipo nuevo, Heavy Duty. Solo agrega aplicaciones; no crea productos ni borra aplicaciones existentes.

| SKU | Equipo | Posición | OEM | Evidencia |
|---|---|---|---|---|
${rows}

## Prueba sin escribir (dry-run)
${dryRun ? `\`\`\`json\n${dryRun.slice(0, 6000)}\n\`\`\`` : '_No hubo base de datos configurada en el Lenovo para la prueba; corre primero el dry-run de abajo._'}

## Para aplicar (después del merge, una vez por base)
\`\`\`powershell
git pull
$env:CATALOG_DATABASE_URL = '<URL de 5441>'
node ${MIGRATION} --batch ${file}            # dry-run
node ${MIGRATION} --batch ${file} --execute  # escribe
$env:CATALOG_DATABASE_URL = '<URL de 5432>'
node ${MIGRATION} --batch ${file} --execute
\`\`\`
Es idempotente: si una aplicación ya existe, la omite.`;
}

async function notify(subject, body) {
  try {
    const OutlookMailService = require('../../lib/outlook-mail.js');
    const to = process.env.HERMES_REVIEW_EMAIL; if (!to) return;
    const mail = new OutlookMailService(); mail.validateConfig();
    if (process.env.HERMES_SENDER_EMAIL) mail.emailMap.default = process.env.HERMES_SENDER_EMAIL;
    await mail.send(to, subject, `<p>${body.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`, body, 'default');
  } catch (error) { console.error(`[HERMES catalogue-auth] notify failed: ${error.message}`); }
}

export async function buildAuthorizationBatch({ repoDir = process.cwd(), stateRoot = process.env.HERMES_STATE_ROOT || 'hermes/state', live = false, now = new Date(), run = execFileSync } = {}) {
  const dir = path.resolve(stateRoot, 'sku-decisions');
  const decisions = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => readJson(path.join(dir, f), null)).filter(Boolean) : [];
  const ledgerPath = path.resolve(stateRoot, 'catalogue-authorization-ledger.json');
  const ledger = readJson(ledgerPath, { handled: {} });
  const { items, phase2 } = collectAuthorized(decisions, ledger);
  const saveLedger = () => { fs.mkdirSync(path.dirname(ledgerPath), { recursive: true }); fs.writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`); };
  if (live) for (const p of phase2) ledger.handled[p.code] = { outcome: 'PHASE_2', reason: p.reason, at: now.toISOString() };
  if (!items.length) { if (live) saveLedger(); return { outcome: 'NOTHING_AUTHORIZED', phase2 }; }
  const batch = buildBatch(items, now);
  const invalid = validateBatch(batch);
  if (invalid.length) {
    if (live) { for (const i of items) ledger.handled[i.proposal_code] = { outcome: 'INCOMPLETE', error: invalid.join('; ').slice(0, 300), at: now.toISOString() }; saveLedger(); await notify('[HERMES] Autorización de catálogo incompleta', `HERMES no pudo preparar el lote: ${invalid.join('; ')}`); }
    return { outcome: 'INCOMPLETE', errors: invalid };
  }
  if (!live) return { outcome: 'DRY_RUN', batch };

  const file = `data/catalogue-authorizations/${batch.batch_id}.json`;
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-catauth-'));
  const branch = `hermes/catalogue-auth-${batch.batch_id}`;
  const sh = (cmd, args, opts = {}) => run(cmd, args, { cwd: work, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
  let pr = null;
  try {
    run('git', ['-C', repoDir, 'fetch', '-q', 'origin', 'main']);
    run('git', ['-C', repoDir, 'worktree', 'add', '-q', '-b', branch, work, 'origin/main']);
    fs.mkdirSync(path.join(work, 'data/catalogue-authorizations'), { recursive: true });
    fs.writeFileSync(path.join(work, file), `${JSON.stringify(batch, null, 2)}\n`, { flag: 'wx' });
    // Dry-run against the configured catalogue DB (rolled back); a failure stops before any PR.
    let dryRun = null;
    if (process.env.CATALOG_DATABASE_URL) dryRun = sh(process.execPath, [path.join(repoDir, MIGRATION), '--batch', path.join(work, file)]);
    sh('git', ['add', '--', file]);
    sh('git', ['commit', '-q', '-m', `data(catalogue): ${items.length} authorized equipment application(s) ${batch.batch_id}\n\nAuthorized by Victor Abreu (HERMES AUTORIZAR). Apply with ${MIGRATION}.`]);
    sh('git', ['push', '-q', '-u', 'origin', branch]);
    pr = sh('gh', ['pr', 'create', '--base', 'main', '--head', branch, '--title', `Catálogo: ${items.length} aplicación(es) autorizada(s) ${batch.batch_id}`, '--body', prBody(batch, dryRun)]).trim().split(/\s+/).pop();
    for (const i of items) ledger.handled[i.proposal_code] = { outcome: 'PR_OPENED', batch: batch.batch_id, pr, at: new Date().toISOString() };
    saveLedger();
    await notify('[HERMES] Catálogo: aplicaciones autorizadas listas para aplicar', `HERMES preparó ${items.length} aplicación(es) que autorizaste (${items.map((i) => `${i.sku} → ${i.equipment.brand} ${i.equipment.model}`).join(' | ')}). Revisa y fusiona el PR; luego corre los comandos del PR en 5441 y 5432: ${pr}`);
    return { outcome: 'PR_OPENED', pr, batch: batch.batch_id, items: items.length, phase2 };
  } catch (error) {
    const msg = String(error.stderr || error.message).slice(0, 300);
    for (const i of items) ledger.handled[i.proposal_code] = { outcome: 'NEEDS_ATTENTION', pr, error: msg, at: new Date().toISOString() };
    saveLedger();
    await notify('[HERMES] Autorización de catálogo pendiente de revisión', `HERMES no pudo preparar ${items.length} aplicación(es) autorizadas. ${pr ? `PR: ${pr}.` : 'No se abrió PR.'} Motivo: ${msg}`);
    return { outcome: 'NEEDS_ATTENTION', pr, error: msg };
  } finally {
    try { run('git', ['-C', repoDir, 'worktree', 'remove', '--force', work]); } catch {}
    try { run('git', ['-C', repoDir, 'branch', '-D', branch], { stdio: 'ignore' }); } catch {}
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = await buildAuthorizationBatch({ live: process.argv.includes('--live') });
  console.log(JSON.stringify(result, null, 2));
  if (result.outcome === 'NEEDS_ATTENTION') process.exitCode = 1;
}
