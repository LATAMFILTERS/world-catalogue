#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const typeArg = process.argv.find((arg) => arg.startsWith('--type='));
const idArg = process.argv.find((arg) => arg.startsWith('--id='));
const evidenceArg = process.argv.find((arg) => arg.startsWith('--evidence='));
const approvalArg = process.argv.find((arg) => arg.startsWith('--approval='));

if (!typeArg || !idArg || !evidenceArg) {
  console.error('Usage: node scripts/promote-commercial-entity.mjs --type=<folder> --id=<slug> --evidence=evidence:<id> [--approval=approval-record:<id>]');
  process.exit(1);
}

const folder = typeArg.slice(7);
const slug = idArg.slice(5);
const evidence = evidenceArg.slice(11);
const approval = approvalArg?.slice(11);
const folderMap = {
  accounts: 'commercial-accounts', suppliers: 'suppliers', opportunities: 'commercial-opportunities',
  offers: 'commercial-offers', inventory: 'inventory-positions', risks: 'commercial-risks',
  decisions: 'selection-decisions', approvals: 'approval-records'
};

if (!folderMap[folder] || !/^[a-z0-9-]+$/.test(slug)) throw new Error('invalid type or id');
if (!/^evidence:[a-z0-9-]+$/.test(evidence)) throw new Error('invalid evidence ID');
if (approval && !/^approval-record:[a-z0-9-]+$/.test(approval)) throw new Error('invalid approval ID');

const source = path.join(root, 'knowledge', 'generated', 'commercial-intelligence', folder, `${slug}.md`);
const targetDir = path.join(root, 'knowledge', 'entities', folderMap[folder]);
const target = path.join(targetDir, `${slug}.md`);
if (!fs.existsSync(source)) throw new Error(`generated entity not found: ${source}`);
if (fs.existsSync(target)) throw new Error(`canonical entity already exists: ${target}`);

let text = fs.readFileSync(source, 'utf8');
const type = text.match(/^type:\s*(.+)$/m)?.[1]?.trim();
const forbidden = /(password|api[_ -]?key|secret|routing number|bank account|personal email|phone number|exact price|gross margin|payment terms)/i;
if (forbidden.test(text)) throw new Error('entity contains prohibited sensitive content');
if (['SelectionDecision','ApprovalRecord'].includes(type) && !approval) throw new Error(`${type} promotion requires --approval`);
if (type === 'CommercialOpportunity' && /^stage:\s*won$/m.test(text) && !approval) throw new Error('won opportunity promotion requires --approval');

text = text
  .replace(/^status:\s*under_review$/m, 'status: approved')
  .replace(/^authority:\s*generated$/m, 'authority: canonical')
  .replace(/^evidence_status:\s*under_review$/m, 'evidence_status: validated')
  .trimEnd();
text += `\n\n## Promotion governance\n\n- supported_by_evidence: \`${evidence}\`\n`;
if (approval) text += `- authorized_by: \`${approval}\`\n`;

fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(target, text, 'utf8');
console.log(`[commercial-intelligence] promoted ${path.relative(root, target).replaceAll('\\', '/')}`);
console.log('[commercial-intelligence] run: node scripts/validate-knowledge-v2.mjs');
