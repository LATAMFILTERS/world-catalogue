#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const candidates = [
  path.join(root, 'frontend', 'catalogue.json'),
  path.join(root, 'catalogue.json'),
  path.join(root, 'data', 'catalogue.json'),
];
const inputPath = process.argv[2]
  ? path.resolve(root, process.argv[2])
  : candidates.find((file) => fs.existsSync(file));

if (!inputPath || !fs.existsSync(inputPath)) {
  console.error('[product-intelligence] no catalogue JSON found. Pass a path as the first argument.');
  process.exit(1);
}

const outputRoot = path.join(root, 'knowledge', 'generated', 'product-intelligence');
const skuDir = path.join(outputRoot, 'skus');
fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(skuDir, { recursive: true });

const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8').replace(/^\uFEFF/, ''));
const rows = Array.isArray(raw)
  ? raw
  : Array.isArray(raw.products)
    ? raw.products
    : Array.isArray(raw.items)
      ? raw.items
      : Array.isArray(raw.data)
        ? raw.data
        : [];

if (!rows.length) {
  console.error('[product-intelligence] catalogue JSON does not contain a supported product array.');
  process.exit(1);
}

const first = (obj, keys) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key];
  }
  return undefined;
};

const toArray = (value) => {
  if (value === undefined || value === null || value === '') return [];
  if (Array.isArray(value)) return value.flatMap(toArray);
  if (typeof value === 'object') return Object.values(value).flatMap(toArray);
  return String(value)
    .split(/[;,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const slug = (value) => String(value ?? '')
  .normalize('NFKD')
  .replace(/[™®©]/g, '')
  .replace(/[^a-zA-Z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .toLowerCase();

const yamlList = (items) => items.length
  ? items.map((item) => `  - ${JSON.stringify(String(item))}`).join('\n')
  : '  - none';

const date = new Date().toISOString().slice(0, 10);
const unresolved = [];
let written = 0;
let skipped = 0;

for (const row of rows) {
  const sku = first(row, ['sku', 'part_number', 'partNumber', 'code', 'elimfilters_code']);
  if (!sku) {
    skipped += 1;
    continue;
  }

  const normalizedSku = slug(sku);
  if (!normalizedSku) {
    skipped += 1;
    continue;
  }

  const name = first(row, ['name', 'description', 'product_name', 'productName']) ?? String(sku);
  const rawFamily = first(row, ['product_family', 'productFamily', 'category', 'product_type', 'productType']);
  const rawTechnology = first(row, ['technology', 'technology_name', 'technologyName']);
  const rawSystem = first(row, ['system', 'protection_system', 'protectionSystem']);
  const family = rawFamily ? `product-family:${slug(rawFamily)}` : 'product-family:unknown';
  const technology = rawTechnology ? `technology:${slug(rawTechnology)}` : 'technology:unknown';
  const system = rawSystem ? `system:${slug(rawSystem)}` : 'system:unknown';

  const oem = toArray(first(row, ['oem_codes', 'oemCodes', 'oem_cross_references', 'oemCrossReferences']));
  const competitors = toArray(first(row, ['competitor_codes', 'competitorCodes', 'cross_references', 'crossReferences']));
  const equipment = toArray(first(row, ['equipment_applications', 'equipmentApplications', 'applications', 'equipment']));
  const vehicles = toArray(first(row, ['vehicle_applications', 'vehicleApplications', 'vehicles']));
  const industries = toArray(first(row, ['industries', 'industry']));

  const missing = [];
  if (!rawFamily) missing.push('product_family');
  if (!rawTechnology) missing.push('technology');
  if (!rawSystem) missing.push('system');
  if (missing.length) unresolved.push({ sku: String(sku), missing });

  const body = `---
id: sku:${normalizedSku}
type: SKU
name: ${JSON.stringify(String(name))}
status: under_review
authority: canonical
owner: ELIMFILTERS Product Intelligence
source:
  - source:catalogue-json
last_reviewed: ${date}
evidence_status: under_review
sku: ${JSON.stringify(String(sku))}
product_family: ${family}
technology: ${technology}
system: ${system}
lifecycle_status: active
synchronized_from: ${JSON.stringify(path.relative(root, inputPath).replaceAll('\\', '/'))}
synchronized_at: ${date}
---

# ${String(sku)}

## Product definition

${String(name)}

## Protection architecture

- belongs_to_product_family: \`${family}\`
- implements_technology: \`${technology}\`
- protects_system: \`${system}\`

## OEM references

${oem.length ? oem.map((item) => `- ${item}`).join('\n') : '- None recorded'}

## Competitor references

${competitors.length ? competitors.map((item) => `- ${item}`).join('\n') : '- None recorded'}

## Equipment applications

${equipment.length ? equipment.map((item) => `- ${item}`).join('\n') : '- None recorded'}

## Vehicle applications

${vehicles.length ? vehicles.map((item) => `- ${item}`).join('\n') : '- None recorded'}

## Industries

${industries.length ? industries.map((item) => `- industry:${slug(item)}`).join('\n') : '- None recorded'}

## Unresolved mappings

${missing.length ? missing.map((item) => `- ${item}`).join('\n') : '- None'}
`;

  fs.writeFileSync(path.join(skuDir, `${normalizedSku}.md`), body, 'utf8');
  written += 1;
}

const summary = {
  source: path.relative(root, inputPath).replaceAll('\\', '/'),
  generated_at: new Date().toISOString(),
  rows_seen: rows.length,
  entities_written: written,
  rows_skipped: skipped,
  unresolved_count: unresolved.length,
  unresolved,
};

fs.writeFileSync(path.join(outputRoot, 'coverage.json'), JSON.stringify(summary, null, 2) + '\n');
fs.writeFileSync(path.join(outputRoot, 'README.md'), `# Generated Product Intelligence\n\n- Source: \`${summary.source}\`\n- Rows seen: ${rows.length}\n- SKU entities written: ${written}\n- Rows skipped: ${skipped}\n- Records with unresolved core mappings: ${unresolved.length}\n\nThis directory is generated and non-authoritative.\n`);

console.log(`[product-intelligence] wrote ${written} SKU entity file(s); ${unresolved.length} require mapping review`);
