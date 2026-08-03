#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const OutlookMailService = require('../../lib/outlook-mail.js');

const reportsDir = path.resolve(process.argv[2] || 'hermes/reports');
const recipient = process.env.HERMES_REVIEW_EMAIL;
const live = process.env.HERMES_EMAIL_LIVE === 'true';

const files = fs.existsSync(reportsDir)
  ? fs.readdirSync(reportsDir).filter((name) => /^hermes-weekly-\d{4}-\d{2}-\d{2}\.md$/.test(name)).sort()
  : [];
if (!files.length) throw new Error(`No weekly Markdown report found in ${reportsDir}`);

const reportName = files.at(-1);
const reportPath = path.join(reportsDir, reportName);
const text = fs.readFileSync(reportPath, 'utf8');
const date = reportName.match(/\d{4}-\d{2}-\d{2}/)?.[0] || 'current';
const subject = `[HERMES] Weekly Intelligence Review — ${date}`;
const html = `<div style="font-family:Arial,sans-serif;max-width:760px"><h2>${subject}</h2><p>This report contains candidates only. No database or canonical knowledge changes have been made.</p><pre style="white-space:pre-wrap;font-family:Arial,sans-serif">${text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}</pre></div>`;

if (!live) {
  const preview = path.join(reportsDir, `hermes-email-preview-${date}.html`);
  fs.writeFileSync(preview, html, 'utf8');
  console.log(`[HERMES email] DRY RUN. Preview written to ${preview}`);
  console.log('[HERMES email] Set HERMES_EMAIL_LIVE=true and HERMES_REVIEW_EMAIL to send.');
  process.exit(0);
}
if (!recipient) throw new Error('HERMES_REVIEW_EMAIL is required for live sending');

const mail = new OutlookMailService();
mail.validateConfig();
await mail.send(recipient, subject, html, text, 'default');
console.log(`[HERMES email] sent to ${recipient}`);
