#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const generatedRoot = path.join(root, 'knowledge', 'generated', 'commercial-intelligence');
const errors = [];
const warnings = [];
const forbiddenContent = /(password|api[_ -]?key|secret|routing number|bank account|email address|phone number|payment terms|exact price|gross margin)/i;
const idPattern = /^(commercial-account|supplier|commercial-opportunity|commercial-offer|inventory-position|commercial-risk|selection-decision|approval-record):[a-z0-9-]+$/;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function parse(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const end = text.indexOf('\n---\n', 4);
  if (!text.startsWith('---\n') || end < 0) throw new Error('invalid frontmatter');
  const data = {};
  for (const line of text.slice(4, end).split('\n')) {
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (match) data[match[1]] = match[2].trim();
  }
  return { text, data };
}

const files = walk(generatedRoot).filter((file) => file.endsWith('.md'));
const ids = new Map();

for (const file of files) {
  const rel = path.relative(root, file).replaceAll('\\', '/');
  try {
    const { text, data } = parse(file);
    for (const key of ['id', 'type', 'status', 'authority', 'owner', 'last_reviewed', 'evidence_status', 'privacy_class']) {
      if (!data[key]) errors.push(`${rel}: missing ${key}`);
    }
    if (data.id && !idPattern.test(data.id)) errors.push(`${rel}: invalid commercial ID ${data.id}`);
    if (data.id) {
      if (ids.has(data.id)) errors.push(`${rel}: duplicate ID ${data.id}`);
      ids.set(data.id, rel);
    }
    if (data.status !== 'under_review') errors.push(`${rel}: generated entity must remain under_review`);
    if (data.authority !== 'generated') errors.push(`${rel}: generated entity must use authority generated`);
    if (!['confidential', 'restricted', 'internal'].includes(data.privacy_class)) errors.push(`${rel}: invalid privacy_class`);
    if (forbiddenContent.test(text)) warnings.push(`${rel}: review text for potentially sensitive wording`);
    if (data.type === 'CommercialOffer' && (!data.opportunity || !data.supplier)) errors.push(`${rel}: offer requires opportunity and supplier`);
    if (data.type === 'InventoryPosition' && (!data.sku || !data.as_of)) errors.push(`${rel}: inventory position requires sku and as_of`);
    if (data.type === 'CommercialOpportunity' && !data.account) errors.push(`${rel}: opportunity requires account`);
  } catch (error) {
    errors.push(`${rel}: ${error.message}`);
  }
}

const summaryPath = path.join(generatedRoot, 'summary.json');
const unresolvedPath = path.join(generatedRoot, 'unresolved.json');
if (!fs.existsSync(summaryPath)) errors.push('missing summary.json');
if (!fs.existsSync(unresolvedPath)) errors.push('missing unresolved.json');

for (const warning of warnings) console.warn(`[commercial-intelligence] warning: ${warning}`);
if (errors.length) {
  console.error(`[commercial-intelligence] validation failed with ${errors.length} error(s)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`[commercial-intelligence] validation passed: ${files.length} generated entities, ${warnings.length} warning(s)`);
