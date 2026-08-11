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
  return { name, path: path.join(absolute, name), text: fs.readFileSync(path.join(absolute, name), 'utf8') };
}

export function buildMessage(report, config) {
  const date = report.name.match(/\d{4}-\d{2}-\d{2}/)?.[0] || 'current';
  const subject = `[HERMES] Weekly Intelligence Review — ${date}`;
  const notice = 'Candidates-only report. No catalogue or Knowledge Center change is applied without Victor Abreu’s explicit approval.';
  const escaped = report.text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return {
    from: config.senderEmail ? `${config.senderName} <${config.senderEmail}>` : undefined,
    to: config.recipient, subject,
    text: `${notice}\n\n${report.text}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:760px"><h2>${subject}</h2><p><strong>${notice}</strong></p><pre style="white-space:pre-wrap;font-family:Arial,sans-serif">${escaped}</pre></div>`,
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
