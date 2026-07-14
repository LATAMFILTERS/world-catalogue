#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const inputArg = process.argv.find((arg) => arg.startsWith('--input='));
const inputPath = path.resolve(root, inputArg ? inputArg.slice('--input='.length) : 'frontend/catalogue.json');
const outputRoot = path.join(root, 'knowledge', 'generated', 'equipment-graph');
const entityDirs = {
  manufacturers: path.join(outputRoot, 'manufacturers'),
  equipment: path.join(outputRoot, 'equipment'),
  engines: path.join(outputRoot, 'engines'),
  vehicles: path.join(outputRoot, 'vehicles'),
};

function slug(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[™®©]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function loadRows(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`input not found: ${filePath}`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
  if (Array.isArray(data)) return data;
  for (const key of ['products', 'items', 'rows', 'catalogue', 'data']) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  throw new Error('input JSON does not contain a recognized row array');
}

function flattenValues(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value.flatMap(flattenValues);
  if (typeof value === 'object') {
    const prioritized = ['application', 'description', 'equipment', 'vehicle', 'engine', 'make', 'model', 'name'];
    const pieces = prioritized.filter((key) => value[key] != null).map((key) => String(value[key]).trim()).filter(Boolean);
    if (pieces.length) return [pieces.join(' ')];
    return Object.values(value).flatMap(flattenValues);
  }
  const text = String(value).trim();
  return text ? [text] : [];
}

function unique(values) {
  return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))];
}

function extractApplications(row, keys) {
  return unique(keys.flatMap((key) => flattenValues(row?.[key])));
}

function detectYearRange(text) {
  const range = text.match(/\b((?:19|20)\d{2})\s*[-–/]\s*((?:19|20)\d{2})\b/);
  if (range) return { start: range[1], end: range[2] };
  const single = text.match(/\b((?:19|20)\d{2})\b/);
  return single ? { start: single[1], end: single[1] } : { start: 'unknown', end: 'unknown' };
}

function tokenizeIdentity(text) {
  const cleaned = text
    .replace(/\b((?:19|20)\d{2})(?:\s*[-–/]\s*((?:19|20)\d{2}))?\b/g, ' ')
    .replace(/[|;,]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const parts = cleaned.split(' ').filter(Boolean);
  if (parts.length < 2) return null;
  return {
    manufacturerName: parts[0],
    model: parts.slice(1).join(' '),
  };
}

function classifyEquipment(text) {
  const lower = text.toLowerCase();
  if (/engine|motor|isx|qsk|c\d+\.?\d*|d\d{2,}/i.test(text) && !/truck|tractor|loader|excavator|bus|coach|vehicle|car|van/i.test(text)) return 'engine';
  if (/truck|tractor|loader|excavator|dozer|grader|combine|harvester|generator|compressor|bus|coach|locomotive|vessel|marine|forklift|crane/i.test(lower)) return 'equipment';
  return 'equipment';
}

function yamlList(values, indent = '') {
  return values.length ? values.map((value) => `${indent}  - ${JSON.stringify(value)}`).join('\n') : `${indent}  - "none"`;
}

function writeEntity(dir, filename, content) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), content, 'utf8');
}

function renderManufacturer(entity, today) {
  return `---\nid: manufacturer:${entity.slug}\ntype: Manufacturer\nname: ${JSON.stringify(entity.name)}\nstatus: under_review\nauthority: generated\nowner: ELIMFILTERS Product Intelligence\nsource:\n  - source:postgresql-elimfilters-catalog\nlast_reviewed: ${today}\nevidence_status: under_review\ncanonical_name: ${JSON.stringify(entity.name)}\naliases:\n${yamlList([...entity.aliases])}\n---\n\n# ${entity.name}\n\nGenerated manufacturer candidate. Review aliases before promotion.\n`;
}

function renderAsset(entity, today) {
  const type = entity.kind === 'vehicle' ? 'Vehicle' : entity.kind === 'engine' ? 'Engine' : 'Equipment';
  const extra = entity.kind === 'vehicle'
    ? `year_start: ${entity.yearStart}\nyear_end: ${entity.yearEnd}\n`
    : entity.kind === 'equipment'
      ? `equipment_class: unknown\n`
      : '';
  const relationName = entity.kind === 'vehicle' ? 'fits_vehicle' : entity.kind === 'engine' ? 'fits_engine' : 'fits_equipment';
  return `---\nid: ${entity.kind}:${entity.slug}\ntype: ${type}\nname: ${JSON.stringify(entity.name)}\nstatus: under_review\nauthority: generated\nowner: ELIMFILTERS Product Intelligence\nsource:\n  - source:postgresql-elimfilters-catalog\nlast_reviewed: ${today}\nevidence_status: under_review\nmanufacturer: manufacturer:${entity.manufacturerSlug}\nmodel: ${JSON.stringify(entity.model)}\n${extra}synchronized_from: elimfilters_catalog\nsynchronized_at: ${today}\n---\n\n# ${entity.name}\n\n## Compatible SKU candidates\n\n${[...entity.skus].sort().map((sku) => `- ${relationName}: \`sku:${slug(sku)}\` — source SKU ${sku}`).join('\n') || '- none'}\n\n## Source application strings\n\n${[...entity.sourceStrings].sort().map((value) => `- ${value}`).join('\n')}\n\n## Review status\n\nGenerated candidate. Compatibility must remain under review until source quality and identity are confirmed.\n`;
}

const rows = loadRows(inputPath);
const manufacturers = new Map();
const assets = new Map();
const unresolved = [];
const today = new Date().toISOString().slice(0, 10);

for (const row of rows) {
  const sku = String(row.sku ?? row.part_number ?? row.partNumber ?? row.code ?? '').trim();
  if (!sku) continue;

  const equipmentStrings = extractApplications(row, [
    'equipment_applications', 'equipmentApplications', 'applications', 'application', 'fitment', 'fitments',
  ]);
  const vehicleStrings = extractApplications(row, [
    'vehicle_applications', 'vehicleApplications', 'vehicles', 'vehicle_fitment', 'vehicleFitment',
  ]);
  const engineStrings = extractApplications(row, [
    'engine_applications', 'engineApplications', 'engines', 'engine_models', 'engineModels',
  ]);

  const candidates = [
    ...equipmentStrings.map((text) => ({ text, kind: classifyEquipment(text) })),
    ...vehicleStrings.map((text) => ({ text, kind: 'vehicle' })),
    ...engineStrings.map((text) => ({ text, kind: 'engine' })),
  ];

  for (const candidate of candidates) {
    const identity = tokenizeIdentity(candidate.text);
    if (!identity) {
      unresolved.push({ sku, kind: candidate.kind, source: candidate.text, reason: 'could-not-separate-manufacturer-and-model' });
      continue;
    }
    const manufacturerSlug = slug(identity.manufacturerName);
    const manufacturer = manufacturers.get(manufacturerSlug) ?? {
      slug: manufacturerSlug,
      name: identity.manufacturerName,
      aliases: new Set(),
    };
    manufacturer.aliases.add(identity.manufacturerName);
    manufacturers.set(manufacturerSlug, manufacturer);

    const years = detectYearRange(candidate.text);
    const assetSlug = slug(`${identity.manufacturerName}-${identity.model}${candidate.kind === 'vehicle' ? `-${years.start}-${years.end}` : ''}`);
    const key = `${candidate.kind}:${assetSlug}`;
    const asset = assets.get(key) ?? {
      kind: candidate.kind,
      slug: assetSlug,
      name: `${identity.manufacturerName} ${identity.model}`,
      manufacturerSlug,
      model: identity.model,
      yearStart: years.start,
      yearEnd: years.end,
      skus: new Set(),
      sourceStrings: new Set(),
    };
    asset.skus.add(sku);
    asset.sourceStrings.add(candidate.text);
    assets.set(key, asset);
  }
}

fs.rmSync(outputRoot, { recursive: true, force: true });
for (const dir of Object.values(entityDirs)) fs.mkdirSync(dir, { recursive: true });

for (const entity of manufacturers.values()) writeEntity(entityDirs.manufacturers, `${entity.slug}.md`, renderManufacturer(entity, today));
for (const entity of assets.values()) {
  const dir = entity.kind === 'vehicle' ? entityDirs.vehicles : entity.kind === 'engine' ? entityDirs.engines : entityDirs.equipment;
  writeEntity(dir, `${entity.slug}.md`, renderAsset(entity, today));
}

const summary = {
  generated_at: new Date().toISOString(),
  input: path.relative(root, inputPath).replaceAll('\\', '/'),
  rows_scanned: rows.length,
  manufacturers: manufacturers.size,
  equipment: [...assets.values()].filter((item) => item.kind === 'equipment').length,
  engines: [...assets.values()].filter((item) => item.kind === 'engine').length,
  vehicles: [...assets.values()].filter((item) => item.kind === 'vehicle').length,
  unresolved_count: unresolved.length,
};

fs.writeFileSync(path.join(outputRoot, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8');
fs.writeFileSync(path.join(outputRoot, 'unresolved.json'), JSON.stringify(unresolved, null, 2), 'utf8');
fs.writeFileSync(path.join(outputRoot, 'README.md'), `# Generated Equipment Graph\n\n- Rows scanned: ${summary.rows_scanned}\n- Manufacturers: ${summary.manufacturers}\n- Equipment: ${summary.equipment}\n- Engines: ${summary.engines}\n- Vehicles: ${summary.vehicles}\n- Unresolved: ${summary.unresolved_count}\n\nGenerated entities are review artifacts, not canonical fitment proof.\n`, 'utf8');

console.log(`[equipment-graph] generated ${assets.size} asset candidates and ${manufacturers.size} manufacturers`);
console.log(`[equipment-graph] unresolved application strings: ${unresolved.length}`);
console.log(`[equipment-graph] output: ${path.relative(root, outputRoot).replaceAll('\\', '/')}`);
