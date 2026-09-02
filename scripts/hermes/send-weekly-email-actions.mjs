#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { latestWeeklyReport, resolveMailConfig } from './send-weekly-email.mjs';

const require = createRequire(import.meta.url);
const { buildReviewUrl } = require('../../lib/hermes-review-token');

function esc(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function candidateTypeLabel(type) {
  const labels = {
    equipment_update: 'Actualización de equipo',
    oem_update: 'Actualización OEM',
    competitor_product_update: 'Actualización de producto de tercero',
    competitor_technology_update: 'Actualización tecnológica de tercero',
    filter_media_development: 'Desarrollo de medios filtrantes',
    supplier_development: 'Desarrollo de proveedor',
    standard_update: 'Actualización de norma',
    patent_update: 'Actualización de patente',
    technical_bulletin: 'Boletín técnico',
    application_update: 'Actualización de aplicación',
    oem_reference_update: 'Actualización de referencia OEM',
    coverage_gap: 'Brecha de cobertura',
  };
  return labels[type] || type;
}

function actionConfig(env = process.env) {
  const baseUrl = String(env.HERMES_REVIEW_BASE_URL || '').trim();
  const secret = String(env.HERMES_REVIEW_TOKEN_SECRET || '').trim();
  const runId = String(env.GITHUB_RUN_ID || '').trim();
  const dryRun = String(env.HERMES_COLLECTION_DRY_RUN || 'true').toLowerCase() === 'true';
  const ttlDays = Math.max(1, Math.min(30, Number(env.HERMES_REVIEW_LINK_TTL_DAYS || 14)));
  return { baseUrl, secret, runId, dryRun, ttlDays, enabled: Boolean(baseUrl && secret && /^\d+$/.test(runId) && !dryRun) };
}

function actionButtons(candidate, cfg) {
  if (!cfg.enabled) {
    return '<p style="font-size:12px;color:#777"><strong>Acciones:</strong> no habilitadas en este ciclo (dry-run o Review Center sin configurar).</p>';
  }
  const exp = Math.floor(Date.now() / 1000) + cfg.ttlDays * 86400;
  const common = { candidate: candidate.entity_code, run_id: cfg.runId, exp };
  const approve = buildReviewUrl(cfg.baseUrl, { ...common, decision: 'approve' }, cfg.secret);
  const reject = buildReviewUrl(cfg.baseUrl, { ...common, decision: 'reject' }, cfg.secret);
  const research = buildReviewUrl(cfg.baseUrl, { ...common, decision: 'research' }, cfg.secret);
  const style = 'display:inline-block;margin:4px 5px 4px 0;padding:11px 14px;border-radius:5px;text-decoration:none;font-weight:800;font-size:12px;';
  return `<div style="margin-top:16px">
    <a href="${esc(approve)}" style="${style}background:#FFF12D;color:#000">APROBAR</a>
    <a href="${esc(reject)}" style="${style}background:#222;color:#fff;border:1px solid #555">RECHAZAR</a>
    <a href="${esc(research)}" style="${style}background:#fff;color:#000">INVESTIGAR MÁS</a>
    <p style="font-size:11px;color:#777;margin-top:8px">El botón abre una pantalla de confirmación. El primer clic no ejecuta ningún cambio.</p>
  </div>`;
}

function buildExecutiveMessage(report, env = process.env) {
  const date = report.name.match(/\d{4}-\d{2}-\d{2}/)?.[0] || 'current';
  const data = report.data;
  const cfg = actionConfig(env);
  const subject = `[HERMES] Revisión Semanal de Inteligencia — ${date}`;

  if (!data || typeof data !== 'object') {
    const fallback = esc(report.text);
    return {
      date,
      subject,
      text: `HERMES — Revisión Semanal de Inteligencia\n\n${report.text}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:760px"><h2>${esc(subject)}</h2><pre style="white-space:pre-wrap">${fallback}</pre></div>`,
    };
  }

  const totals = data.totals || {};
  const groups = data.groups || {};
  const cards = [];
  const text = [];
  text.push('HERMES — Revisión Semanal de Inteligencia', '');
  text.push(`Candidatos analizados: ${totals.scanned ?? 0}`);
  text.push(`Listos para revisión: ${totals.review_ready ?? 0}`);
  text.push(`Requieren más investigación: ${totals.needs_research ?? 0}`, '');

  for (const [type, candidates] of Object.entries(groups).sort()) {
    for (const c of candidates) {
      const rr = c.research_resolution || {};
      text.push(`Hallazgo: ${rr.finding_title || c.entity_code}`);
      text.push(`Código: ${c.entity_code}`);
      text.push(`Fuente: ${c.source_publisher || 'n/a'} — ${rr.evidence_url || c.source_url || 'n/a'}`);
      if (Array.isArray(rr.technical_facts) && rr.technical_facts.length) text.push(`Hechos técnicos: ${rr.technical_facts.join(' | ')}`);
      if (rr.relevance) text.push(`Relevancia para ELIMFILTERS: ${rr.relevance}`);
      text.push(`Acción propuesta: ${c.proposed_action || 'n/a'}`);
      text.push('Decisión: APROBAR / RECHAZAR / INVESTIGAR MÁS', '');

      cards.push(`<div style="border:1px solid #ddd;border-radius:8px;padding:16px;margin:14px 0">
        <div style="font-size:12px;text-transform:uppercase;color:#666">${esc(candidateTypeLabel(type))}</div>
        <h3 style="margin:6px 0 10px">${esc(rr.finding_title || c.entity_code)}</h3>
        <p><strong>Código interno:</strong> ${esc(c.entity_code)}</p>
        <p><strong>Fuente:</strong> ${esc(c.source_publisher || 'n/a')} — ${esc(rr.evidence_url || c.source_url || 'n/a')}</p>
        <p><strong>Evidencia:</strong> ${esc(c.evidence_level || 'n/a')} · <strong>Confianza:</strong> ${esc(c.confidence ?? 'n/a')}</p>
        ${Array.isArray(rr.technical_facts) && rr.technical_facts.length ? `<p><strong>Hechos técnicos:</strong> ${esc(rr.technical_facts.join(' | '))}</p>` : ''}
        ${rr.relevance ? `<p><strong>Relevancia para ELIMFILTERS:</strong> ${esc(rr.relevance)}</p>` : ''}
        ${Array.isArray(c.affected_entities) ? `<p><strong>Entidades afectadas:</strong> ${esc(c.affected_entities.join(', '))}</p>` : ''}
        <p><strong>Acción propuesta:</strong> ${esc(c.proposed_action || 'n/a')}</p>
        ${actionButtons(c, cfg)}
      </div>`);
    }
  }

  const notice = 'HERMES no modifica catálogo, Knowledge Center, Obsidian ni PostgreSQL sin aprobación explícita.';
  const html = `<div style="font-family:Arial,sans-serif;max-width:760px;color:#111">
    <h2>${esc(subject)}</h2>
    <div style="background:#f5f5f5;padding:14px;border-radius:8px">
      <strong>Resumen ejecutivo</strong><br>
      Candidatos analizados: ${esc(totals.scanned ?? 0)} · Listos para revisión: ${esc(totals.review_ready ?? 0)} · Requieren investigación: ${esc(totals.needs_research ?? 0)}
    </div>
    <p><strong>${esc(notice)}</strong></p>
    ${cards.join('\n') || '<p>No hay hallazgos listos para revisión en este ciclo.</p>'}
    <hr><p style="font-size:12px;color:#666">Autoridad de decisión: Victor Abreu.</p>
  </div>`;
  return { date, subject, text: `${notice}\n\n${text.join('\n')}`, html };
}

export async function sendWeeklyActionEmail({ reportsDir = 'hermes/reports', env = process.env, gmailTransportFactory = null, outlookFactory = null } = {}) {
  const config = resolveMailConfig(env);
  const report = latestWeeklyReport(reportsDir);
  const message = buildExecutiveMessage(report, env);

  if (!config.live) {
    const preview = path.join(path.resolve(reportsDir), `hermes-email-preview-${message.date}.html`);
    fs.writeFileSync(preview, message.html, 'utf8');
    return { outcome: 'DRY_RUN', preview, provider: config.provider, recipient: config.recipient || null, actionable: actionConfig(env).enabled };
  }

  if (config.provider === 'gmail') {
    const createTransport = gmailTransportFactory || require('nodemailer').createTransport;
    const transport = createTransport({ service: 'gmail', auth: { user: config.senderEmail, pass: config.gmailAppPassword } });
    await transport.verify();
    const result = await transport.sendMail({ from: config.senderEmail ? `${config.senderName} <${config.senderEmail}>` : undefined, to: config.recipient, subject: message.subject, text: message.text, html: message.html });
    return { outcome: 'SENT', provider: 'gmail', recipient: config.recipient, message_id: result.messageId || null, actionable: actionConfig(env).enabled };
  }

  const OutlookMailService = outlookFactory || require('../../lib/outlook-mail.js');
  const mail = new OutlookMailService();
  mail.validateConfig();
  if (config.senderEmail) mail.emailMap.default = config.senderEmail;
  await mail.send(config.recipient, message.subject, message.html, message.text, 'default');
  return { outcome: 'SENT', provider: 'outlook', recipient: config.recipient, message_id: null, actionable: actionConfig(env).enabled };
}

async function main() {
  const result = await sendWeeklyActionEmail({ reportsDir: process.argv[2] || 'hermes/reports' });
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(`[HERMES email] ${error.message}`); process.exit(1); });
}

export { buildExecutiveMessage, actionConfig };
