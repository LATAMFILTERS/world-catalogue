#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const input = process.argv[2];
if (!input) {
  console.error('Usage: node scripts/export-oem-graph.mjs <catalogue.json>');
  process.exit(1);
}

const root = process.cwd();
const outRoot = path.join(root, 'knowledge', 'generated', 'oem-graph');
const dirs = {
  manufacturers: path.join(outRoot, 'manufacturers'),
  oem: path.join(outRoot, 'oem-codes'),
  competitor: path.join(outRoot, 'competitor-codes'),
  assertions: path.join(outRoot, 'assertions'),
};
for (const dir of Object.values(dirs)) fs.mkdirSync(dir, { recursive: true });

const slug = (value) => String(value ?? '')
  .normalize('NFKD')
  .replace(/[™®©]/g, '')
  .replace(/[^a-zA-Z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .toLowerCase();
const normalizeCode = (value) => slug(String(value ?? '').toUpperCase());
const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value == null || value === '') return [];
  if (typeof value === 'object') return Object.entries(value).flatMap(([brand, codes]) => asArray(codes).map((code) => ({ brand, code })));
  return String(value).split(/[;,|\n]+/).map((item) => item.trim()).filter(Boolean);
};
const escapeYaml = (value) => JSON.stringify(String(value ?? ''));
const records = JSON.parse(fs.readFileSync(path.resolve(input), 'utf8'));
const rows = Array.isArray(records) ? records : records.rows || records.data || [];

const manufacturers = new Map();
const oemCodes = new Map();
const competitorCodes = new Map();
const assertions = new Map();
const unresolved = [];

function addCode({ sku, raw, kind, brandHint, sourceField }) {
  let brand = brandHint;
  let code = raw;
  if (raw && typeof raw === 'object') {
    brand = raw.brand || raw.manufacturer || raw.make || brand;
    code = raw.code || raw.part_number || raw.partNumber || raw.number || raw.value;
  }
  if (!code) return;
  if (!brand) {
    unresolved.push({ sku, sourceField, value: raw, reason: 'missing brand/manufacturer namespace' });
    return;
  }

  const brandSlug = slug(brand);
  const codeSlug = normalizeCode(code);
  if (!brandSlug || !codeSlug) return;

  if (kind === 'oem') {
    const manufacturerId = `oem-manufacturer:${brandSlug}`;
    manufacturers.set(manufacturerId, { id: manufacturerId, name: String(brand) });
    const codeId = `oem-code:${brandSlug}-${codeSlug}`;
    oemCodes.set(codeId, { id: codeId, manufacturerId, brand: String(brand), code: String(code), normalized: codeSlug });
    const assertionId = `crossref:${slug(sku)}-${slug(codeId)}`;
    assertions.set(assertionId, { id: assertionId, sku, target: codeId, level: 'observed', sourceField, original: String(code) });
  } else {
    const codeId = `competitor-code:${brandSlug}-${codeSlug}`;
    competitorCodes.set(codeId, { id: codeId, brand: String(brand), code: String(code), normalized: codeSlug });
    const assertionId = `crossref:${slug(sku)}-${slug(codeId)}`;
    assertions.set(assertionId, { id: assertionId, sku, target: codeId, level: 'commercial_match', sourceField, original: String(code) });
  }
}

for (const row of rows) {
  const sku = row.sku || row.part_number || row.partNumber || row.code;
  if (!sku) continue;

  for (const entry of asArray(row.oem_codes ?? row.oemCodes ?? row.oem_cross_references)) {
    addCode({ sku, raw: entry, kind: 'oem', brandHint: row.oem_manufacturer, sourceField: 'oem_codes' });
  }
  for (const entry of asArray(row.competitor_codes ?? row.competitorCodes ?? row.cross_references)) {
    addCode({ sku, raw: entry, kind: 'competitor', sourceField: 'competitor_codes' });
  }
}

const date = new Date().toISOString().slice(0, 10);
for (const item of manufacturers.values()) {
  fs.writeFileSync(path.join(dirs.manufacturers, `${slug(item.name)}.md`), `---\nid: ${item.id}\ntype: OEMManufacturer\nname: ${escapeYaml(item.name)}\nstatus: under_review\nauthority: generated\nowner: ELIMFILTERS Product Intelligence\nsource:\n  - source:postgresql-elimfilters-catalog\nlast_reviewed: ${date}\nevidence_status: under_review\ncanonical_name: ${escapeYaml(item.name)}\n---\n\n# ${item.name}\n`, 'utf8');
}
for (const item of oemCodes.values()) {
  fs.writeFileSync(path.join(dirs.oem, `${slug(item.id)}.md`), `---\nid: ${item.id}\ntype: OEMCode\nname: ${escapeYaml(`${item.brand} ${item.code}`)}\nstatus: under_review\nauthority: generated\nowner: ELIMFILTERS Product Intelligence\nsource:\n  - source:postgresql-elimfilters-catalog\nlast_reviewed: ${date}\nevidence_status: under_review\nmanufacturer: ${item.manufacturerId}\nnormalized_code: ${item.normalized}\ndisplay_code: ${escapeYaml(item.code)}\n---\n\n# ${item.code}\n`, 'utf8');
}
for (const item of competitorCodes.values()) {
  fs.writeFileSync(path.join(dirs.competitor, `${slug(item.id)}.md`), `---\nid: ${item.id}\ntype: CompetitorCode\nname: ${escapeYaml(`${item.brand} ${item.code}`)}\nstatus: under_review\nauthority: generated\nowner: ELIMFILTERS Product Intelligence\nsource:\n  - source:postgresql-elimfilters-catalog\nlast_reviewed: ${date}\nevidence_status: under_review\nbrand: ${escapeYaml(item.brand)}\nnormalized_code: ${item.normalized}\ndisplay_code: ${escapeYaml(item.code)}\n---\n\n# ${item.code}\n`, 'utf8');
}
for (const item of assertions.values()) {
  fs.writeFileSync(path.join(dirs.assertions, `${slug(item.id)}.md`), `---\nid: ${item.id}\ntype: CrossReferenceAssertion\nname: ${escapeYaml(`${item.sku} to ${item.original}`)}\nstatus: under_review\nauthority: generated\nowner: ELIMFILTERS Product Intelligence\nsource:\n  - source:postgresql-elimfilters-catalog\nlast_reviewed: ${date}\nevidence_status: under_review\nsource_sku: sku:${slug(item.sku)}\ntarget_code: ${item.target}\nassertion_level: ${item.level}\nassertion_state: active\n---\n\n# ${item.sku} to ${item.original}\n\n- source_field: ${item.sourceField}\n- original_value: ${item.original}\n`, 'utf8');
}

const summary = {
  rows: rows.length,
  manufacturers: manufacturers.size,
  oem_codes: oemCodes.size,
  competitor_codes: competitorCodes.size,
  assertions: assertions.size,
  unresolved: unresolved.length,
};
fs.writeFileSync(path.join(outRoot, 'summary.json'), JSON.stringify(summary, null, 2));
fs.writeFileSync(path.join(outRoot, 'unresolved.json'), JSON.stringify(unresolved, null, 2));
console.log('[oem-graph]', summary);
