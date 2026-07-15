#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const inputArg = process.argv.find((arg) => arg.startsWith('--input='));
const inputPath = inputArg ? path.resolve(root, inputArg.slice(8)) : null;
const outRoot = path.join(root, 'knowledge', 'generated', 'commercial-intelligence');
const today = new Date().toISOString().slice(0, 10);

const slug = (value) => String(value ?? '')
  .normalize('NFKD')
  .replace(/[™®©]/g, '')
  .replace(/[^a-zA-Z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .toLowerCase();

const list = (value) => Array.isArray(value) ? value : value == null ? [] : [value];
const safeText = (value) => String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
const forbidden = /(email|phone|contact|address|bank|account_number|routing|password|secret|token|api_key|margin|unit_price|exact_price|payment_terms)/i;

function sanitize(record) {
  const clean = {};
  for (const [key, value] of Object.entries(record ?? {})) {
    if (forbidden.test(key)) continue;
    if (value && typeof value === 'object' && !Array.isArray(value)) clean[key] = sanitize(value);
    else clean[key] = value;
  }
  return clean;
}

function write(relative, content) {
  const target = path.join(outRoot, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}

function frontmatter(fields) {
  return ['---', ...Object.entries(fields).flatMap(([key, value]) => {
    if (Array.isArray(value)) return [key + ':', ...value.map((item) => '  - ' + safeText(item))];
    return [`${key}: ${safeText(value)}`];
  }), '---', ''].join('\n');
}

if (!inputPath || !fs.existsSync(inputPath)) {
  console.error('Usage: node scripts/build-commercial-intelligence.mjs --input=<sanitized-commercial-export.json>');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const data = Array.isArray(raw) ? { opportunities: raw } : raw;
fs.rmSync(outRoot, { recursive: true, force: true });

const unresolved = [];
const counters = { accounts: 0, suppliers: 0, opportunities: 0, offers: 0, inventory: 0, decisions: 0, risks: 0, approvals: 0 };

for (const original of list(data.accounts)) {
  const row = sanitize(original);
  const key = slug(row.id || row.account_id || row.name || row.alias);
  if (!key) { unresolved.push({ type: 'account', reason: 'missing stable identity' }); continue; }
  write(`accounts/${key}.md`, frontmatter({
    id: `commercial-account:${key}`, type: 'CommercialAccount', name: row.alias || row.name || key,
    status: 'under_review', authority: 'generated', owner: 'ELIMFILTERS Commercial',
    source: ['source:commercial-operational-system'], last_reviewed: today, evidence_status: 'under_review',
    account_class: row.account_class || 'prospect', industry: row.industry_id || 'industry:unknown',
    country_code: row.country_code || 'XX', privacy_class: 'confidential'
  }) + `# ${safeText(row.alias || row.name || key)}\n\nGenerated account candidate. Personal contact data is intentionally excluded.\n`);
  counters.accounts++;
}

for (const original of list(data.suppliers)) {
  const row = sanitize(original);
  const key = slug(row.id || row.supplier_id || row.name);
  if (!key) { unresolved.push({ type: 'supplier', reason: 'missing stable identity' }); continue; }
  write(`suppliers/${key}.md`, frontmatter({
    id: `supplier:${key}`, type: 'Supplier', name: row.name || key, status: 'under_review', authority: 'generated',
    owner: 'ELIMFILTERS Supply Chain', source: ['source:commercial-operational-system'], last_reviewed: today,
    evidence_status: 'under_review', supplier_status: row.status || 'evaluating', country_code: row.country_code || 'XX',
    quality_status: row.quality_status || 'unknown', privacy_class: 'confidential'
  }) + `# ${safeText(row.name || key)}\n\nGenerated supplier candidate. Confidential quotations are excluded.\n`);
  counters.suppliers++;
}

for (const original of list(data.opportunities)) {
  const row = sanitize(original);
  const key = slug(row.id || row.opportunity_id || row.name);
  const account = slug(row.account_id || row.account);
  if (!key || !account) { unresolved.push({ type: 'opportunity', record: key || null, reason: 'missing opportunity or account identity' }); continue; }
  write(`opportunities/${key}.md`, frontmatter({
    id: `commercial-opportunity:${key}`, type: 'CommercialOpportunity', name: row.name || key, status: 'under_review', authority: 'generated',
    owner: 'ELIMFILTERS Commercial', source: ['source:commercial-operational-system'], last_reviewed: today,
    evidence_status: 'under_review', account: `commercial-account:${account}`, stage: row.stage || 'discovery',
    priority: row.priority || 'medium', privacy_class: 'confidential'
  }) + `# ${safeText(row.name || key)}\n\n## Requested entities\n\n${list(row.requested_ids).map((id) => `- requests: \`${safeText(id)}\``).join('\n') || '- none recorded'}\n`);
  counters.opportunities++;
}

for (const original of list(data.offers)) {
  const row = sanitize(original);
  const key = slug(row.id || row.offer_id);
  const opportunity = slug(row.opportunity_id || row.opportunity);
  const supplier = slug(row.supplier_id || row.supplier);
  if (!key || !opportunity || !supplier) { unresolved.push({ type: 'offer', record: key || null, reason: 'missing offer, opportunity, or supplier identity' }); continue; }
  write(`offers/${key}.md`, frontmatter({
    id: `commercial-offer:${key}`, type: 'CommercialOffer', name: row.name || key, status: 'under_review', authority: 'generated',
    owner: 'ELIMFILTERS Commercial', source: ['source:commercial-operational-system'], last_reviewed: today,
    evidence_status: 'under_review', opportunity: `commercial-opportunity:${opportunity}`, supplier: `supplier:${supplier}`,
    currency: row.currency || 'USD', cost_band: row.cost_band || 'confidential', lead_time_band: row.lead_time_band || 'unknown',
    valid_until: row.valid_until || 'unknown', privacy_class: 'restricted'
  }) + `# ${safeText(row.name || key)}\n\nExact prices, margin and payment terms are excluded.\n`);
  counters.offers++;
}

for (const original of list(data.inventory_positions)) {
  const row = sanitize(original);
  const sku = slug(row.sku);
  const key = slug(row.id || `${sku}-${row.as_of || today}-${row.location_class || 'unknown'}`);
  if (!key || !sku) { unresolved.push({ type: 'inventory', reason: 'missing SKU identity' }); continue; }
  write(`inventory/${key}.md`, frontmatter({
    id: `inventory-position:${key}`, type: 'InventoryPosition', name: row.name || `Inventory ${sku}`, status: 'under_review', authority: 'generated',
    owner: 'ELIMFILTERS Supply Chain', source: ['source:commercial-operational-system'], last_reviewed: today,
    evidence_status: 'under_review', sku: `sku:${sku}`, availability_band: row.availability_band || 'unknown',
    as_of: row.as_of || today, location_class: row.location_class || 'unknown', privacy_class: 'restricted'
  }) + `# Inventory ${safeText(sku)}\n\nExact quantity and location are excluded.\n`);
  counters.inventory++;
}

for (const original of list(data.risks)) {
  const row = sanitize(original);
  const key = slug(row.id || row.risk_id || row.name);
  if (!key) { unresolved.push({ type: 'risk', reason: 'missing stable identity' }); continue; }
  write(`risks/${key}.md`, frontmatter({
    id: `commercial-risk:${key}`, type: 'CommercialRisk', name: row.name || key, status: 'under_review', authority: 'generated',
    owner: 'ELIMFILTERS Risk Governance', source: ['source:commercial-operational-system'], last_reviewed: today,
    evidence_status: 'under_review', risk_type: row.risk_type || 'supply', severity: row.severity || 'medium',
    likelihood: row.likelihood || 'possible', risk_status: row.risk_status || 'open', privacy_class: 'confidential'
  }) + `# ${safeText(row.name || key)}\n\nAffected entities: ${list(row.affected_ids).map(safeText).join(', ') || 'not mapped'}\n`);
  counters.risks++;
}

write('summary.json', JSON.stringify({ generated_at: new Date().toISOString(), input: path.basename(inputPath), counts: counters, unresolved: unresolved.length }, null, 2));
write('unresolved.json', JSON.stringify(unresolved, null, 2));
console.log(`[commercial-intelligence] generated ${Object.values(counters).reduce((a, b) => a + b, 0)} candidates; unresolved ${unresolved.length}`);
