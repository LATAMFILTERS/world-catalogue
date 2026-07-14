#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const skuArg = process.argv[2];
const evidenceArg = process.argv.find((arg) => arg.startsWith('--evidence='));

if (!skuArg || !evidenceArg) {
  console.error('Usage: node scripts/promote-product-intelligence-sku.mjs <SKU> --evidence=evidence:<id>');
  process.exit(1);
}

const slug = (value) => String(value)
  .normalize('NFKD')
  .replace(/[™®©]/g, '')
  .replace(/[^a-zA-Z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .toLowerCase();

const evidenceId = evidenceArg.slice('--evidence='.length);
if (!/^evidence:[a-z0-9-]+$/.test(evidenceId)) {
  console.error(`[product-intelligence] invalid evidence ID: ${evidenceId}`);
  process.exit(1);
}

const normalizedSku = slug(skuArg);
const generatedPath = path.join(root, 'knowledge', 'generated', 'product-intelligence', 'skus', `${normalizedSku}.md`);
const targetDir = path.join(root, 'knowledge', 'entities', 'skus');
const targetPath = path.join(targetDir, `${normalizedSku}.md`);

if (!fs.existsSync(generatedPath)) {
  console.error(`[product-intelligence] generated SKU not found: ${generatedPath}`);
  process.exit(1);
}
if (fs.existsSync(targetPath)) {
  console.error(`[product-intelligence] canonical SKU already exists: ${targetPath}`);
  process.exit(1);
}

let text = fs.readFileSync(generatedPath, 'utf8');
if (/product-family:unknown|technology:unknown|system:unknown/.test(text)) {
  console.error('[product-intelligence] cannot promote a SKU with unresolved core mappings');
  process.exit(1);
}

text = text
  .replace(/^status: under_review$/m, 'status: approved')
  .replace(/^evidence_status: under_review$/m, 'evidence_status: validated')
  .replace(/(## Standards and evidence\n\n)?/m, '')
  .trimEnd();

text += `\n\n## Promotion evidence\n\n- supported_by_evidence: \`${evidenceId}\`\n`;

fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(targetPath, text, 'utf8');
console.log(`[product-intelligence] promoted ${skuArg} to ${path.relative(root, targetPath).replaceAll('\\', '/')}`);
console.log('[product-intelligence] run: node scripts/validate-knowledge-v2.mjs');
