#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const entitiesRoot = path.join(root, 'knowledge', 'entities');
const allowedLevels = new Set(['observed', 'commercial_match', 'application_match', 'validated_equivalent', 'rejected']);
const errors = [];
const ids = new Set();
const parsed = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : full.endsWith('.md') ? [full] : [];
  });
}

function frontmatter(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const end = text.indexOf('\n---\n', 4);
  if (!text.startsWith('---\n') || end < 0) throw new Error('invalid frontmatter');
  const data = {};
  let list = null;
  for (const raw of text.slice(4, end).split('\n')) {
    const item = raw.match(/^\s+-\s+(.+)$/);
    if (item && list) {
      data[list].push(item[1].trim().replace(/^['"]|['"]$/g, ''));
      continue;
    }
    const match = raw.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) continue;
    const value = match[2].trim();
    if (!value) {
      data[match[1]] = [];
      list = match[1];
    } else {
      data[match[1]] = value.replace(/^['"]|['"]$/g, '');
      list = null;
    }
  }
  return { data, text };
}

for (const file of walk(entitiesRoot)) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  try {
    const result = frontmatter(file);
    if (result.data.id) ids.add(result.data.id);
    parsed.push({ ...result, relative });
  } catch (error) {
    errors.push(`${relative}: ${error.message}`);
  }
}

for (const { data, text, relative } of parsed) {
  if (data.type === 'OEMManufacturer') {
    if (!/^oem-manufacturer:[a-z0-9-]+$/.test(data.id || '')) errors.push(`${relative}: invalid OEMManufacturer id`);
    if (!data.canonical_name) errors.push(`${relative}: missing canonical_name`);
  }

  if (data.type === 'OEMCode') {
    for (const field of ['manufacturer', 'normalized_code', 'display_code']) if (!data[field]) errors.push(`${relative}: OEMCode missing ${field}`);
    if (!/^oem-code:[a-z0-9-]+$/.test(data.id || '')) errors.push(`${relative}: invalid OEMCode id`);
    if (data.manufacturer && !/^oem-manufacturer:[a-z0-9-]+$/.test(data.manufacturer)) errors.push(`${relative}: invalid manufacturer relation`);
  }

  if (data.type === 'CompetitorCode') {
    for (const field of ['brand', 'normalized_code', 'display_code']) if (!data[field]) errors.push(`${relative}: CompetitorCode missing ${field}`);
    if (!/^competitor-code:[a-z0-9-]+$/.test(data.id || '')) errors.push(`${relative}: invalid CompetitorCode id`);
  }

  if (data.type === 'CrossReferenceAssertion') {
    for (const field of ['source_sku', 'target_code', 'assertion_level', 'assertion_state']) if (!data[field]) errors.push(`${relative}: CrossReferenceAssertion missing ${field}`);
    if (!/^crossref:[a-z0-9-]+$/.test(data.id || '')) errors.push(`${relative}: invalid assertion id`);
    if (!allowedLevels.has(data.assertion_level)) errors.push(`${relative}: unsupported assertion_level '${data.assertion_level}'`);
    if (data.source_sku && !/^sku:[a-z0-9-]+$/.test(data.source_sku)) errors.push(`${relative}: invalid source_sku`);
    if (data.target_code && !/^(oem-code|competitor-code):[a-z0-9-]+$/.test(data.target_code)) errors.push(`${relative}: invalid target_code`);
    if (data.assertion_level === 'validated_equivalent' && !/supported_by_evidence:\s*`evidence:[a-z0-9-]+`/.test(text)) errors.push(`${relative}: validated_equivalent requires evidence`);
  }
}

for (const { data, relative } of parsed) {
  if (data.type === 'OEMCode' && data.manufacturer && !ids.has(data.manufacturer)) errors.push(`${relative}: manufacturer target does not exist '${data.manufacturer}'`);
  if (data.type === 'CrossReferenceAssertion') {
    if (data.source_sku && !ids.has(data.source_sku)) errors.push(`${relative}: source SKU does not exist '${data.source_sku}'`);
    if (data.target_code && !ids.has(data.target_code)) errors.push(`${relative}: target code does not exist '${data.target_code}'`);
  }
}

if (errors.length) {
  console.error(`[oem-graph] validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('[oem-graph] validation passed');
