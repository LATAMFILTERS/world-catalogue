#!/usr/bin/env node
// HERMES — Thursday SKU review email.
//
// Monday brings industry intelligence; Thursday is for reviewing and authorizing
// new SKUs. Runs from every Lenovo HERMES run and sends at most once per ISO
// week, on Thursday from 06:00 (or Fri–Sun if the Lenovo was off on Thursday).
// AUTORIZAR / RECHAZAR use the signed Review Center links; an authorization is
// recorded only — creating the SKU stays in the governed catalogue process.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolveMailConfig, deliverMessage } from './send-weekly-email.mjs';
import { actionConfig } from './send-weekly-email-actions.mjs';
import { runSkuProposals, indexCatalogue, readCatalogueRows } from './sku-proposals.mjs';
import { isoWeek, readLedger, caseIdFor } from './oem-research-runner.mjs';

export { isoWeek };

const require = createRequire(import.meta.url);
const { buildReviewUrl } = require('../../lib/hermes-review-token');
const { stageCandidates } = require('../../lib/hermes-review-store');
const { listPendingKnowledgeGaps } = require('../../lib/knowledge-governance/knowledge-gap-store');

const esc = (v) => String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');


/** Thursday from 06:00 local (Recovery runs 06:17), or Fri/Sat/Sun as catch-up; once per ISO week. */
export function shouldSend(now, sentWeek) {
  const day = now.getDay();
  const due = (day === 4 && now.getHours() >= 6) || [5, 6, 0].includes(day);
  return due && sentWeek !== isoWeek(now);
}

function buttons(code, cfg) {
  if (!cfg?.enabled) return '';
  const exp = Math.floor(Date.now() / 1000) + cfg.ttlDays * 86400;
  const url = (decision) => buildReviewUrl(cfg.baseUrl, { candidate: code, run_id: cfg.runId, exp, decision }, cfg.secret);
  const style = 'display:inline-block;margin:4px 5px 4px 0;padding:11px 14px;border-radius:5px;text-decoration:none;font-weight:800;font-size:12px;';
  return `<div style="margin-top:12px"><a href="${esc(url('approve'))}" style="${style}background:#FFF12D;color:#000">AUTORIZAR</a><a href="${esc(url('reject'))}" style="${style}background:#222;color:#fff">RECHAZAR</a></div>`;
}

const evidenceLinks = (p) => p.evidence.map((e) => `<a href="${esc(e.evidence_url)}">${esc(e.ref.toUpperCase())} ${esc(e.code)}</a>`).join(' · ');
const equipment = (p) => [p.equipment?.brand, p.equipment?.model, p.equipment?.engine].filter(Boolean).join(' ');

export function buildSkuReviewMessage({ now = new Date(), proposals = [], invalid = [], openResearch = [], authorizedPending = [], catalogueError = null, cfg = null }) {
  const by = (s) => proposals.filter((p) => p.state === s);
  const ready = by('READY_FOR_AUTHORIZATION'); const stop = by('STOP_REVIEW'); const incomplete = by('INCOMPLETE'); const existing = by('ALREADY_IN_CATALOGUE');
  const date = now.toISOString().slice(0, 10);
  const html = [`<h2>HERMES — Revisión de SKUs nuevos</h2><p style="font-size:12px;color:#666">${esc(date)} · Autorizar registra tu decisión; el alta en catálogo sigue el proceso gobernado.</p>`];
  const text = [`HERMES — REVISIÓN DE SKUS NUEVOS (${date})`, ''];
  if (catalogueError) { html.push(`<p style="background:#FFF12D;padding:10px;border-radius:6px"><strong>No se pudo leer el catálogo para revisar colisiones (${esc(catalogueError)}). Esta semana no hay propuestas.</strong></p>`); text.push(`AVISO: catálogo no disponible (${catalogueError}); sin propuestas esta semana.`, ''); }
  if (ready.length && !cfg?.enabled) { html.push('<p style="background:#FFF12D;padding:10px;border-radius:6px"><strong>Los botones no están disponibles en esta corrida. Nada se autoriza sin tu decisión explícita.</strong></p>'); text.push('AVISO: botones no disponibles en esta corrida.', ''); }

  const section = (title, items, render) => {
    html.push(`<h3>${esc(title)} (${items.length})</h3>`); text.push(`${title.toUpperCase()} (${items.length})`);
    if (!items.length) { html.push('<p style="color:#666">Ninguno.</p>'); text.push('- Ninguno.'); }
    for (const i of items) { const r = render(i); html.push(r.html); text.push(r.text); }
    text.push('');
  };
  section('SKUs listos para autorizar', ready, (p) => ({
    html: `<div style="border:1px solid #ddd;border-radius:8px;padding:14px;margin:12px 0"><h4 style="margin:0 0 4px">${esc(p.proposed_sku)} — ${esc(p.position)}</h4><div style="font-size:12px;color:#666">${esc(equipment(p))} · ${esc(p.duty)} · base ${esc(p.base_manufacturer)} ${esc(p.codigo_base)} · OEM ${esc(p.oem_code)}</div><p style="font-size:13px">Evidencia: ${evidenceLinks(p)}</p>${(p.warnings || []).map((w) => `<p style="font-size:12px;color:#8a6d00">Aviso: ${esc(w)}</p>`).join('')}${buttons(p.entity_code, cfg)}</div>`,
    text: `- ${p.proposed_sku} · ${equipment(p)} · ${p.position} · base ${p.base_manufacturer} ${p.codigo_base} · OEM ${p.oem_code}`
  }));
  section('Bloqueados: requieren tu criterio (STOP_REVIEW)', stop, (p) => ({
    html: `<p>• <strong>${esc(equipment(p))} — ${esc(p.position)}</strong> (OEM ${esc(p.oem_code)}): ${esc(p.reasons.join('; '))}</p>`,
    text: `- ${equipment(p)} — ${p.position} (OEM ${p.oem_code}): ${p.reasons.join('; ')}`
  }));
  section('Investigación incompleta', incomplete, (p) => ({
    html: `<p>• ${esc(equipment(p))} — ${esc(p.position)} (OEM ${esc(p.oem_code)}): falta ${esc(p.reasons.join(', '))}</p>`,
    text: `- ${equipment(p)} — ${p.position} (OEM ${p.oem_code}): falta ${p.reasons.join(', ')}`
  }));
  section('Ya cubiertos en catálogo', existing, (p) => ({
    html: `<p>• ${esc(equipment(p))} — ${esc(p.position)}: OEM ${esc(p.oem_code)} → <strong>${esc(p.proposed_sku)}</strong></p>`,
    text: `- ${equipment(p)} — ${p.position}: OEM ${p.oem_code} -> ${p.proposed_sku}`
  }));
  section('Autorizados, pendientes de alta en catálogo', authorizedPending, (p) => ({
    html: `<p>• <strong>${esc(p.proposed_sku)}</strong> — ${esc(equipment(p))} ${esc(p.position)} (autorizado ${esc(String(p.decided_at).slice(0, 10))})</p>`,
    text: `- ${p.proposed_sku} — ${equipment(p)} ${p.position} (autorizado ${String(p.decided_at).slice(0, 10)})`
  }));
  section('Investigaciones OEM en cola', openResearch, (g) => ({
    html: `<p>• ${esc([g.equipment?.brand, g.equipment?.model].filter(Boolean).join(' ') || 'Equipo por identificar')} — ${esc(g.status)} · ${esc(String(g.reason || '').slice(0, 140))}</p>`,
    text: `- ${[g.equipment?.brand, g.equipment?.model].filter(Boolean).join(' ') || 'Equipo por identificar'} — ${g.status}`
  }));
  if (invalid.length) section('Archivos de investigación inválidos', invalid, (f) => ({ html: `<p>• ${esc(f.file)}: ${esc(f.errors.join('; '))}</p>`, text: `- ${f.file}: ${f.errors.join('; ')}` }));
  return { date, subject: `HERMES — Revisión de SKUs nuevos (${ready.length} para autorizar) ${date}`, html: html.join('\n'), text: text.join('\n'), ready };
}

export async function sendSkuReviewEmail({ now = new Date(), env = process.env, stateRoot = env.HERMES_STATE_ROOT || 'hermes/state', force = false,
  loadCatalogue = null, listGaps = listPendingKnowledgeGaps, stage = stageCandidates, deliver = deliverMessage } = {}) {
  const sentPath = path.resolve(stateRoot, 'sku-review-sent.json');
  let sentWeek = null; try { sentWeek = JSON.parse(fs.readFileSync(sentPath, 'utf8')).week; } catch {}
  if (!force && !shouldSend(now, sentWeek)) return { outcome: 'NOT_DUE', week: isoWeek(now), sent_week: sentWeek };

  let rows = null; let catalogueError = null;
  try { rows = await (loadCatalogue || readCatalogueRows)(env); } catch (error) { catalogueError = error.message; }
  const run = rows ? await runSkuProposals({ stateRoot, loadCatalogue: async () => rows }) : { proposals: [], invalid: [] };
  const index = rows ? indexCatalogue(rows) : null;
  const decisionsDir = path.resolve(stateRoot, 'sku-decisions');
  const authorizedPending = (fs.existsSync(decisionsDir) ? fs.readdirSync(decisionsDir) : []).filter((f) => f.endsWith('.json'))
    .map((f) => { try { return JSON.parse(fs.readFileSync(path.join(decisionsDir, f), 'utf8')); } catch { return null; } })
    .filter((d) => d?.decision === 'AUTHORIZED' && !(index && index.occupied.has(String(d.proposed_sku).toUpperCase())));
  const gaps = await listGaps({ limit: 100 });
  // Cases the Tuesday/Wednesday research already turned into a file leave the queue; failures show why.
  const ledger = readLedger(stateRoot).cases || {};
  const openResearch = (gaps.gaps || []).filter((g) => g.channel === 'hermes_weekly_approved')
    .map((g) => { const c = ledger[caseIdFor(g.request_id)]; return c ? { ...g, status: `${c.status} (intento ${c.attempts}): ${c.detail || ''}`.slice(0, 200) } : g; })
    .filter((g) => !String(g.status).startsWith('DONE'));

  if (!env.HERMES_REVIEW_RUN_ID) env.HERMES_REVIEW_RUN_ID = String(Math.floor(now.getTime() / 1000));
  let cfg = actionConfig(env);
  const ready = run.proposals.filter((p) => p.state === 'READY_FOR_AUTHORIZATION');
  if (cfg.enabled && ready.length) { try { await stage(ready, { cycleId: cfg.runId, env }); } catch (error) { cfg = { ...cfg, enabled: false, staging_error: error.message }; } }
  const message = buildSkuReviewMessage({ now, proposals: run.proposals, invalid: run.invalid, openResearch, authorizedPending, catalogueError, cfg });

  const config = resolveMailConfig(env);
  const counts = { ready: ready.length, proposals: run.proposals.length, invalid: run.invalid.length, open_research: openResearch.length, authorized_pending: authorizedPending.length, actions: cfg.enabled, catalogue_error: catalogueError };
  if (!config.live) {
    const preview = path.resolve(stateRoot, `sku-review-preview-${message.date}.html`);
    fs.writeFileSync(preview, message.html, 'utf8');
    return { outcome: 'DRY_RUN', preview, ...counts };
  }
  const sent = await deliver(message, config);
  fs.writeFileSync(sentPath, `${JSON.stringify({ week: isoWeek(now), sent_at: now.toISOString(), ...counts }, null, 2)}\n`);
  return { ...sent, week: isoWeek(now), ...counts };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  sendSkuReviewEmail({ force: process.argv.includes('--force') })
    .then((r) => console.log(`[HERMES sku-review] ${JSON.stringify(r)}`))
    .catch((error) => { console.error(`[HERMES sku-review] ${error.message}`); process.exit(1); });
}
