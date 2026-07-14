#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const assertionArg = process.argv[2];
const levelArg = process.argv.find((arg) => arg.startsWith('--level='));
const evidenceArg = process.argv.find((arg) => arg.startsWith('--evidence='));
if (!assertionArg || !levelArg) {
  console.error('Usage: node scripts/promote-oem-assertion.mjs <assertion-file-or-id> --level=<level> [--evidence=evidence:<id>]');
  process.exit(1);
}

const allowed = new Set(['observed', 'commercial_match', 'application_match', 'validated_equivalent', 'rejected']);
const level = levelArg.slice('--level='.length);
const evidence = evidenceArg?.slice('--evidence='.length);
if (!allowed.has(level)) throw new Error(`Unsupported level: ${level}`);
if (level === 'validated_equivalent' && !evidence) throw new Error('validated_equivalent requires --evidence=evidence:<id>');
if (evidence && !/^evidence:[a-z0-9-]+$/.test(evidence)) throw new Error(`Invalid evidence ID: ${evidence}`);

const root = process.cwd();
const generatedDir = path.join(root, 'knowledge', 'generated', 'oem-graph', 'assertions');
const candidate = assertionArg.endsWith('.md') ? assertionArg : `${assertionArg.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}.md`;
const sourcePath = path.isAbsolute(candidate) ? candidate : path.join(generatedDir, candidate);
if (!fs.existsSync(sourcePath)) throw new Error(`Generated assertion not found: ${sourcePath}`);

let text = fs.readFileSync(sourcePath, 'utf8');
text = text
  .replace(/^status: under_review$/m, level === 'rejected' ? 'status: rejected' : 'status: approved')
  .replace(/^authority: generated$/m, 'authority: canonical')
  .replace(/^evidence_status: under_review$/m, level === 'validated_equivalent' ? 'evidence_status: validated' : 'evidence_status: not_required')
  .replace(/^assertion_level: .+$/m, `assertion_level: ${level}`);
if (evidence) text += `\n## Validation evidence\n\n- supported_by_evidence: \`${evidence}\`\n`;

const targetDir = path.join(root, 'knowledge', 'entities', 'cross-references');
fs.mkdirSync(targetDir, { recursive: true });
const targetPath = path.join(targetDir, path.basename(sourcePath));
if (fs.existsSync(targetPath)) throw new Error(`Canonical assertion already exists: ${targetPath}`);
fs.writeFileSync(targetPath, text, 'utf8');
console.log(`[oem-graph] promoted assertion to ${path.relative(root, targetPath).replaceAll('\\', '/')}`);
console.log('[oem-graph] run node scripts/validate-oem-graph.mjs');
