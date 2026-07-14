#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const typeArg = process.argv.find((arg) => arg.startsWith('--type='));
const idArg = process.argv.find((arg) => arg.startsWith('--id='));
const evidenceArg = process.argv.find((arg) => arg.startsWith('--evidence='));

if (!typeArg || !idArg || !evidenceArg) {
  console.error('Usage: node scripts/promote-equipment-entity.mjs --type=equipment|engine|vehicle|manufacturer --id=<slug> --evidence=evidence:<id>');
  process.exit(1);
}

const type = typeArg.slice('--type='.length);
const id = idArg.slice('--id='.length);
const evidenceId = evidenceArg.slice('--evidence='.length);
const config = {
  equipment: { generated: 'equipment', canonical: 'equipment' },
  engine: { generated: 'engines', canonical: 'engines' },
  vehicle: { generated: 'vehicles', canonical: 'vehicles' },
  manufacturer: { generated: 'manufacturers', canonical: 'manufacturers' },
}[type];

if (!config || !/^[a-z0-9-]+$/.test(id) || !/^evidence:[a-z0-9-]+$/.test(evidenceId)) {
  console.error('Invalid type, ID or evidence ID.');
  process.exit(1);
}

const sourcePath = path.join(root, 'knowledge', 'generated', 'equipment-graph', config.generated, `${id}.md`);
const targetDir = path.join(root, 'knowledge', 'entities', config.canonical);
const targetPath = path.join(targetDir, `${id}.md`);
const evidencePath = path.join(root, 'knowledge', 'entities', 'evidence', `${evidenceId.slice('evidence:'.length)}.md`);

if (!fs.existsSync(sourcePath)) throw new Error(`generated entity not found: ${sourcePath}`);
if (!fs.existsSync(evidencePath)) throw new Error(`evidence entity not found: ${evidencePath}`);
if (fs.existsSync(targetPath)) throw new Error(`canonical entity already exists: ${targetPath}`);

let text = fs.readFileSync(sourcePath, 'utf8');
if (/manufacturer:unknown|could-not-separate|status: approved/.test(text)) throw new Error('entity contains unresolved identity or invalid status');
text = text
  .replace(/^status: under_review$/m, 'status: approved')
  .replace(/^authority: generated$/m, 'authority: canonical')
  .replace(/^evidence_status: under_review$/m, 'evidence_status: validated')
  .trimEnd();
text += `\n\n## Promotion evidence\n\n- supported_by_evidence: \`${evidenceId}\`\n`;

fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(targetPath, text, 'utf8');
console.log(`[equipment-graph] promoted ${type}:${id} to canonical knowledge`);
console.log('[equipment-graph] run: node scripts/validate-knowledge-v2.mjs');
