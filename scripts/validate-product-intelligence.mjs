#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const generatedRoot = path.join(root, 'knowledge', 'generated', 'product-intelligence');
const skuDir = path.join(generatedRoot, 'skus');
const coveragePath = path.join(generatedRoot, 'coverage.json');

if (!fs.existsSync(skuDir) || !fs.existsSync(coveragePath)) {
  console.error('[product-intelligence] generated output is missing; run scripts/export-product-intelligence.mjs first');
  process.exit(1);
}

const files = fs.readdirSync(skuDir).filter((name) => name.endsWith('.md'));
const ids = new Set();
const skus = new Set();
const errors = [];

function frontmatter(text) {
  const normalized = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) throw new Error('missing frontmatter');
  const end = normalized.indexOf('\n---\n', 4);
  if (end < 0) throw new Error('unterminated frontmatter');
  const data = {};
  let listKey = null;
  for (const line of normalized.slice(4, end).split('\n')) {
    if (!line.trim()) continue;
    const list = line.match(/^\s+-\s+(.+)$/);
    if (list && listKey) {
      data[listKey].push(list[1].trim());
      continue;
    }
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) continue;
    const value = match[2].trim();
    if (!value) {
      data[match[1]] = [];
      listKey = match[1];
    } else {
      data[match[1]] = value.replace(/^['"]|['"]$/g, '');
      listKey = null;
    }
  }
  return data;
}

for (const file of files) {
  const full = path.join(skuDir, file);
  try {
    const data = frontmatter(fs.readFileSync(full, 'utf8'));
    const required = ['id', 'type', 'name', 'status', 'authority', 'owner', 'source', 'last_reviewed', 'evidence_status', 'sku', 'product_family', 'technology', 'system', 'synchronized_from', 'synchronized_at'];
    for (const field of required) {
      if (!(field in data) || data[field] === '' || (Array.isArray(data[field]) && data[field].length === 0)) {
        errors.push(`${file}: missing ${field}`);
      }
    }
    if (data.type !== 'SKU') errors.push(`${file}: type must be SKU`);
    if (data.status !== 'under_review') errors.push(`${file}: generated SKU must remain under_review`);
    if (data.evidence_status !== 'under_review') errors.push(`${file}: generated evidence_status must remain under_review`);
    if (!/^sku:[a-z0-9-]+$/.test(data.id ?? '')) errors.push(`${file}: invalid SKU id`);
    if (!/^product-family:[a-z0-9-]+$/.test(data.product_family ?? '')) errors.push(`${file}: invalid product_family id`);
    if (!/^technology:[a-z0-9-]+$/.test(data.technology ?? '')) errors.push(`${file}: invalid technology id`);
    if (!/^system:[a-z0-9-]+$/.test(data.system ?? '')) errors.push(`${file}: invalid system id`);
    if (ids.has(data.id)) errors.push(`${file}: duplicate id ${data.id}`);
    if (skus.has(String(data.sku).toUpperCase())) errors.push(`${file}: duplicate SKU ${data.sku}`);
    ids.add(data.id);
    skus.add(String(data.sku).toUpperCase());
  } catch (error) {
    errors.push(`${file}: ${error.message}`);
  }
}

const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
if (coverage.entities_written !== files.length) {
  errors.push(`coverage mismatch: ${coverage.entities_written} written but ${files.length} files found`);
}

if (errors.length) {
  console.error(`[product-intelligence] validation failed with ${errors.length} error(s)`);
  for (const error of errors.slice(0, 100)) console.error(`- ${error}`);
  if (errors.length > 100) console.error(`- ... ${errors.length - 100} additional error(s)`);
  process.exit(1);
}

console.log(`[product-intelligence] validation passed: ${files.length} generated SKU entity file(s), ${coverage.unresolved_count} unresolved mapping record(s)`);
