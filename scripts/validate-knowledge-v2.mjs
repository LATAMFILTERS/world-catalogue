#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const entitiesRoot = path.join(root, 'knowledge', 'entities');
const requiredFields = [
  'id',
  'type',
  'name',
  'status',
  'authority',
  'owner',
  'source',
  'last_reviewed',
  'evidence_status',
];
const allowedTypes = new Set([
  'Technology',
  'ProtectionSystem',
  'Industry',
  'ProductFamily',
  'SKU',
  'Standard',
  'FailureMode',
  'Contaminant',
  'EvidenceRecord',
  'SourceDocument',
]);
const allowedStatuses = new Set(['draft', 'under_review', 'approved', 'deprecated', 'rejected']);
const allowedAuthorities = new Set(['canonical', 'operational', 'working', 'historical', 'generated']);
const allowedEvidence = new Set(['unverified', 'under_review', 'validated', 'rejected', 'not_required']);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : full.endsWith('.md') ? [full] : [];
  });
}

function parseFrontmatter(filePath) {
  const text = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  if (!text.startsWith('---\n') && !text.startsWith('---\r\n')) {
    throw new Error('missing YAML frontmatter');
  }
  const normalized = text.replace(/\r\n/g, '\n');
  const end = normalized.indexOf('\n---\n', 4);
  if (end === -1) throw new Error('unterminated YAML frontmatter');
  const block = normalized.slice(4, end);
  const data = {};
  let activeList = null;

  for (const rawLine of block.split('\n')) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith('#')) continue;
    const listMatch = rawLine.match(/^\s+-\s+(.+)$/);
    if (listMatch && activeList) {
      data[activeList].push(listMatch[1].trim().replace(/^['"]|['"]$/g, ''));
      continue;
    }
    const match = rawLine.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    const value = rawValue.trim();
    if (!value) {
      data[key] = [];
      activeList = key;
    } else {
      data[key] = value.replace(/^['"]|['"]$/g, '');
      activeList = null;
    }
  }
  return data;
}

const files = walk(entitiesRoot);
const errors = [];
const ids = new Map();

for (const file of files) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  try {
    const entity = parseFrontmatter(file);
    for (const field of requiredFields) {
      if (!(field in entity) || entity[field] === '' || (Array.isArray(entity[field]) && entity[field].length === 0)) {
        errors.push(`${relative}: missing required field '${field}'`);
      }
    }

    if (entity.id && !/^[a-z0-9-]+:[a-z0-9-]+$/.test(entity.id)) {
      errors.push(`${relative}: invalid canonical id '${entity.id}'`);
    }
    if (entity.id) {
      if (ids.has(entity.id)) errors.push(`${relative}: duplicate id '${entity.id}' also used by ${ids.get(entity.id)}`);
      else ids.set(entity.id, relative);
    }
    if (entity.type && !allowedTypes.has(entity.type)) errors.push(`${relative}: unsupported type '${entity.type}'`);
    if (entity.status && !allowedStatuses.has(entity.status)) errors.push(`${relative}: unsupported status '${entity.status}'`);
    if (entity.authority && !allowedAuthorities.has(entity.authority)) errors.push(`${relative}: unsupported authority '${entity.authority}'`);
    if (entity.evidence_status && !allowedEvidence.has(entity.evidence_status)) {
      errors.push(`${relative}: unsupported evidence_status '${entity.evidence_status}'`);
    }
    if (entity.last_reviewed && !/^\d{4}-\d{2}-\d{2}$/.test(entity.last_reviewed)) {
      errors.push(`${relative}: last_reviewed must use YYYY-MM-DD`);
    }
    if (entity.status === 'approved' && !['validated', 'not_required'].includes(entity.evidence_status)) {
      errors.push(`${relative}: approved entity requires evidence_status validated or not_required`);
    }
    if (entity.authority && entity.authority !== 'canonical') {
      errors.push(`${relative}: files under knowledge/entities must use authority: canonical`);
    }
  } catch (error) {
    errors.push(`${relative}: ${error.message}`);
  }
}

if (errors.length) {
  console.error(`[knowledge-v2] validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`[knowledge-v2] validation passed: ${files.length} canonical entity file(s), ${ids.size} unique id(s)`);
