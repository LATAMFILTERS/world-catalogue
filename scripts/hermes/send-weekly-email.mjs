#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);

export function resolveMailConfig(env = process.env) {
  const provider = String(env.HERMES_EMAIL_PROVIDER || 'outlook').trim().toLowerCase();
  const recipient = String(env.HERMES_REVIEW_EMAIL || '').trim();
  const senderEmail = String(env.HERMES_SENDER_EMAIL || '').trim();
  const senderName = String(env.HERMES_SENDER_NAME || 'HERMES — ELIMFILTERS Intelligence').trim();
  const live = String(env.HERMES_EMAIL_LIVE || 'false').toLowerCase() === 'true';
  if (!['gmail', 'outlook'].includes(provider)) throw new Error(`Unsupported HERMES_EMAIL_PROVIDER: ${provider}`);
  if (live && !recipient) throw new Error('HERMES_REVIEW_EMAIL is required for live sending');
  if (provider === 'gmail' && live) {
    if (!senderEmail) throw new Error('HERMES_SENDER_EMAIL is required for Gmail');
    if (!env.HERMES_GMAIL_APP_PASSWORD) throw new Error('HERMES_GMAIL_APP_PASSWORD is required for Gmail');
  }
  return { provider, recipient, senderEmail, senderName, live, gmailAppPassword: env.HERMES_GMAIL_APP_PASSWORD || null };
}

export function latestWeeklyReport(reportsDir) {
  const absolute = path.resolve(reportsDir);
  const files = fs.existsSync(absolute) ? fs.readdirSync(absolute).filter((name) => /^hermes-weekly-\d{4}-\d{2}-\d{2}\.md$/.test(name)).sort() : [];
  if (!files.length) throw new Error(`No weekly Markdown report found in ${absolute}`);
  const name = files.at(-1);
  const date = name.match(/\d{4}-\d{2}-\d{2}/)?.[0] || 'current';
  const jsonPath = path.join(absolute, `hermes-weekly-${date}.json`);
  let data = null;
  if (fs.existsSync(jsonPath)) {
    try { data = JSON.parse(fs.readFileSync(jsonPath, 'utf8')); }
    catch { data = null; }
  }
  return { name, path: path.join(absolute, name), text: fs.readFileSync(path.join(absolute, name), 'utf8'), data };
}

function esc(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function translateCandidateType(type) {
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
    coverage_gap: 'Brecha de cobertura'
  };
  return labels[type] || type;
}

function buildSpanishExecutiveReport(data, fallbackText) {
  if (!data || typeof data !== 'object') {
    return {
      text: `Resumen ejecutivo no disponible en formato estructurado.\n\n${fallbackText}`,
      html: `<p>Resumen ejecutivo no disponible en formato estructurado.</p><pre style="white-space:pre-wrap;font-family:Arial,sans-serif">${esc(fallbackText)}</pre>`
    };
  }

  const totals = data.totals || {};
  const groups = data.groups || {};
  const pending = Array.isArray(data.research_pending) ? data.research_pending : [];
  const duplicates = Array.isArray(data.duplicates) ? data.duplicates : [];
  const invalid = Array.isArray(data.invalid) ? data.invalid : [];

  const text = [];
  text.push('HERMES — Revisión Semanal de Inteligencia', '');
  text.push(`Período: ${data.reporting_period?.start || 'n/a'} — ${data.reporting_period?.end || 'n/a'}`, '');
  text.push('RESUMEN EJECUTIVO');
  text.push(`- Candidatos analizados: ${totals.scanned ?? 0}`);
  text.push(`- Cambios de fuente detectados: ${totals.source_changes_detected ?? 0}`);
  text.push(`- Resueltos por Groq: ${totals.groq_resolved ?? 0}`);
  text.push(`- Listos para tu revisión: ${totals.review_ready ?? 0}`);
  text.push(`- Requieren más investigación: ${totals.needs_research ?? 0}`);
  text.push(`- Duplicados suprimidos: ${totals.duplicates_suppressed ?? 0}`);
  text.push(`- Candidatos inválidos: ${totals.invalid ?? 0}`, '');
  text.push('Este informe es solo para revisión. HERMES no modifica el catálogo, Knowledge Center, Obsidian ni PostgreSQL sin tu aprobación explícita.', '');

  for (const [type, candidates] of Object.entries(groups).sort()) {
    text.push(translateCandidateType(type).toUpperCase(), '');
    for (const c of candidates) {
      const rr = c.research_resolution || {};
      text.push(`Hallazgo: ${rr.finding_title || c.entity_code}`);
      text.push(`Código interno: ${c.entity_code}`);
      text.push(`Fuente: ${c.source_publisher || 'n/a'} — ${rr.evidence_url || c.source_url || 'n/a'}`);
      text.push(`Publicado: ${c.published_at || 'no indicado por la fuente'}`);
      text.push(`Evidencia: ${c.evidence_level || 'n/a'}; confianza ${c.confidence ?? 'n/a'}`);
      if (Array.isArray(rr.technical_facts) && rr.technical_facts.length) text.push(`Hechos técnicos: ${rr.technical_facts.join(' | ')}`);
      if (rr.relevance) text.push(`Relevancia para ELIMFILTERS: ${rr.relevance}`);
      if (Array.isArray(c.affected_entities)) text.push(`Entidades afectadas: ${c.affected_entities.join(', ')}`);
      text.push(`Destino propuesto: ${c.proposed_target_folder || 'n/a'}${c.proposed_target_entity ? ` / ${c.proposed_target_entity}` : ''}`);
      text.push(`Acción propuesta: ${c.proposed_action || 'n/a'}`);
      text.push('Recomendación: REVISAR PARA APROBACIÓN');
      text.push('Decisión disponible: APROBAR / RECHAZAR / INVESTIGAR MÁS', '');
    }
  }

  if (pending.length) {
    text.push('REQUIEREN MÁS INVESTIGACIÓN', '');
    for (const item of pending) text.push(`- ${item.entity_code}: ${item.reason || 'RESEARCH_NOT_RESOLVED'} — ${item.source_url || 'n/a'}`);
    text.push('');
  }
  if (duplicates.length) {
    text.push('DUPLICADOS SUPRIMIDOS', '');
    for (const item of duplicates) text.push(`- ${item.entity_code} duplica ${item.duplicate_of}`);
    text.push('');
  }
  if (invalid.length) {
    text.push('CANDIDATOS INVÁLIDOS', '');
    for (const item of invalid) text.push(`- ${item.entity_code}: ${(item.errors || []).join('; ')}`);
    text.push('');
  }
  text.push('AUTORIDAD DE DECISIÓN', 'Solo Victor Abreu puede aprobar, rechazar o solicitar investigación adicional.');

  const cards = [];
  for (const [type, candidates] of Object.entries(groups).sort()) {
    for (const c of candidates) {
      const rr = c.research_resolution || {};
      cards.push(`<div style="border:1px solid #ddd;border-radius:8px;padding:16px;margin:14px 0">
        <div style="font-size:12px;text-transform:uppercase;color:#666">${esc(translateCandidateType(type))}</div>
        <h3 style="margin:6px 0 10px">${esc(rr.finding_title || c.entity_code)}</h3>
        <p><strong>Código interno:</strong> ${esc(c.entity_code)}</p>
        <p><strong>Fuente:</strong> ${esc(c.source_publisher || 'n/a')} — ${esc(rr.evidence_url || c.source_url || 'n/a')}</p>
        <p><strong>Evidencia:</strong> ${esc(c.evidence_level || 'n/a')} · <strong>Confianza:</strong> ${esc(c.confidence ?? 'n/a')}</p>
        ${Array.isArray(rr.technical_facts) && rr.technical_facts.length ? `<p><strong>Hechos técnicos:</strong> ${esc(rr.technical_facts.join(' | '))}</p>` : ''}
        ${rr.relevance ? `<p><strong>Relevancia para ELIMFILTERS:</strong> ${esc(rr.relevance)}</p>` : ''}
        ${Array.isArray(c.affected_entities) ? `<p><strong>Entidades afectadas:</strong> ${esc(c.affected_entities.join(', '))}</p>` : ''}
        <p><strong>Acción propuesta:</strong> ${esc(c.proposed_action || 'n/a')}</p>
        <p><strong>Recomendación:</strong> REVISAR PARA APROBACIÓN</p>
        <p style="font-size:12px;color:#666">Decisión: APROBAR / RECHAZAR / INVESTIGAR MÁS</p>
      </div>`);
    }
  }

  const html = `<div style="font-family:Arial,sans-serif;max-width:760px;color:#111">
    <h2>HERMES — Revisión Semanal de Inteligencia</h2>
    <p><strong>Período:</strong> ${esc(data.reporting_period?.start || 'n/a')} — ${esc(data.reporting_period?.end || 'n/a')}</p>
    <div style="background:#f5f5f5;padding:14px;border-radius:8px">
      <strong>Resumen ejecutivo</strong><br>
      Candidatos analizados: ${esc(totals.scanned ?? 0)} · Cambios detectados: ${esc(totals.source_changes_detected ?? 0)} · Resueltos por Groq: ${esc(totals.groq_resolved ?? 0)} · Listos para revisión: ${esc(totals.review_ready ?? 0)} · Requieren investigación: ${esc(totals.needs_research ?? 0)}
    </div>
    <p><strong>Este informe es solo para revisión.</strong> HERMES no modifica el catálogo, Knowledge Center, Obsidian ni PostgreSQL sin tu aprobación explícita.</p>
    ${cards.join('\n') || '<p>No hay hallazgos listos para revisión en este ciclo.</p>'}
    ${pending.length ? `<h3>Requieren más investigación</h3><ul>${pending.map((item) => `<li>${esc(item.entity_code)}: ${esc(item.reason || 'RESEARCH_NOT_RESOLVED')}</li>`).join('')}</ul>` : ''}
    <hr><p><strong>Autoridad de decisión:</strong> solo Victor Abreu puede aprobar, rechazar o solicitar investigación adicional.</p>
  </div>`;

  return { text: text.join('\n'), html };
}

export function buildMessage(report, config) {
  const date = report.name.match(/\d{4}-\d{2}-\d{2}/)?.[0] || 'current';
  const subject = `[HERMES] Revisión Semanal de Inteligencia — ${date}`;
  const notice = 'Informe de candidatos para revisión. Ningún cambio en el catálogo o Knowledge Center se aplica sin la aprobación explícita de Victor Abreu.';
  const executive = buildSpanishExecutiveReport(report.data, report.text);
  return {
    from: config.senderEmail ? `${config.senderName} <${config.senderEmail}>` : undefined,
    to: config.recipient,
    subject,
    text: `${notice}\n\n${executive.text}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:760px"><p><strong>${esc(notice)}</strong></p>${executive.html}</div>`,
    date
  };
}

export async function sendWeeklyEmail({ reportsDir = 'hermes/reports', env = process.env, gmailTransportFactory = null, outlookFactory = null } = {}) {
  const config = resolveMailConfig(env);
  const report = latestWeeklyReport(reportsDir);
  const message = buildMessage(report, config);
  if (!config.live) {
    const preview = path.join(path.resolve(reportsDir), `hermes-email-preview-${message.date}.html`);
    fs.writeFileSync(preview, message.html, 'utf8');
    return { outcome: 'DRY_RUN', preview, provider: config.provider, recipient: config.recipient || null };
  }
  if (config.provider === 'gmail') {
    const createTransport = gmailTransportFactory || require('nodemailer').createTransport;
    const transport = createTransport({ service: 'gmail', auth: { user: config.senderEmail, pass: config.gmailAppPassword } });
    await transport.verify();
    const result = await transport.sendMail({ from: message.from, to: message.to, subject: message.subject, text: message.text, html: message.html });
    return { outcome: 'SENT', provider: 'gmail', recipient: config.recipient, message_id: result.messageId || null };
  }
  const OutlookMailService = outlookFactory || require('../../lib/outlook-mail.js');
  const mail = new OutlookMailService();
  mail.validateConfig();
  if (config.senderEmail) mail.emailMap.default = config.senderEmail;
  await mail.send(config.recipient, message.subject, message.html, message.text, 'default');
  return { outcome: 'SENT', provider: 'outlook', recipient: config.recipient, message_id: null };
}

async function main() {
  const result = await sendWeeklyEmail({ reportsDir: process.argv[2] || 'hermes/reports' });
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(`[HERMES email] ${error.message}`); process.exit(1); });
}
