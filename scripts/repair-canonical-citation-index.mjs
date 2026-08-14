#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'elimfilters-vault', '00-meta', 'CITATION_INDEX.json');
const ACTIVE_DIR = path.join(ROOT, 'elimfilters-vault', '01-technologies', 'active');

const CANONICAL_TECHNOLOGIES = [
  'MACROCORE', 'MICROKAPPA', 'DRYCORE', 'INTEKCORE', 'SYNTAPORE',
  'TURBOCORE', 'SYNTRAX', 'NANOFORCE', 'THERMACORE',
];

const RETIRED_TECHNOLOGIES = new Set([
  'HYDROCORE', 'HYDROCORE/SERIES', 'HYDROCORE SERIES', 'SYNTEPORE',
  'SYNTEFOR', 'COOLTECH', 'DURACTECH', 'NANOCORE', 'ELIMCORE', 'DIESELCORE',
]);

const RELATIONSHIP_FIELDS = new Set([
  'applicable_industries', 'related_standards', 'addresses_contamination',
  'resolved_by', 'applicable_to_technologies', 'applicable_to_industries',
  'applicable_to_systems', 'relevant_contamination', 'applicable_technologies',
  'applicable_standards', 'resolved_by_technologies', 'affects_components',
  'affects_systems', 'recommended_product_families', 'protected_by_technologies',
  'located_in_systems', 'typical_filter_families', 'meets_standards',
  'target_industries', 'sensitive_to_contamination', 'related_contamination',
  'root_contamination', 'uses_technology', 'belongs_to_domain',
  'belongs_to_product_system', 'protection_standard', 'supporting_technologies',
  'related_problems', 'product_families', 'related_components',
  'industry_frequency', 'common_problems', 'typical_product_families',
  'related_technologies',
]);

function scalar(value) {
  const text = String(value ?? '').trim();
  if (!text) return null;
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    return text.slice(1, -1);
  }
  return text;
}

function extractWikilinks(value) {
  const links = [];
  const regex = /\[\[([A-Z][A-Z0-9_]*)/g;
  let match;
  while ((match = regex.exec(String(value || ''))) !== null) links.push(match[1]);
  return links;
}

function parseFrontmatter(content) {
  const normalized = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;

  const yaml = {};
  const arrays = {};
  let currentArray = null;

  for (const line of match[1].split('\n')) {
    const top = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/);
    if (top) {
      currentArray = null;
      const key = top[1];
      const raw = top[2].trim();
      if (raw) yaml[key] = scalar(raw);
      else {
        arrays[key] = [];
        currentArray = key;
      }
      continue;
    }

    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && currentArray) arrays[currentArray].push(scalar(item[1]));
  }

  return { yaml, arrays, body: match[2] };
}

function parseCanonical(body) {
  const section = body.match(/##\s+AI\s+Retrieval\s*\n([\s\S]*?)(?=\n##\s|\n---\s*$|$)/);
  if (!section) return null;
  const fence = section[1].match(/```[^\n]*\n([\s\S]*?)```/);
  if (!fence) return null;
  const text = fence[1].replace(/^CANONICAL KNOWLEDGE BLOCK:.*\n/, '').trim();
  const labels = ['DEFINITION', 'SYSTEMS', 'FAILURE_IMPACT', 'RELATED_STANDARDS', 'RELATED_TECHNOLOGIES', 'INDUSTRIAL_ROLE', 'CITATION_REFERENCE'];
  const sections = {};
  let current = null;
  let lines = [];

  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (labels.includes(trimmed)) {
      if (current) sections[current] = lines.join('\n').trim() || null;
      current = trimmed;
      lines = [];
    } else if (current) {
      lines.push(line);
    }
  }
  if (current) sections[current] = lines.join('\n').trim() || null;

  const citation = { source_url: null, concept: null, version: null, last_updated: null };
  for (const line of String(sections.CITATION_REFERENCE || '').split('\n')) {
    const m = line.match(/^(source|concept|version|last_updated):\s*(.*)$/);
    if (!m) continue;
    if (m[1] === 'source') citation.source_url = m[2].trim();
    else citation[m[1]] = m[2].trim();
  }

  const canonical = {
    definition: sections.DEFINITION || null,
    systems: sections.SYSTEMS || null,
    failure_impact: sections.FAILURE_IMPACT || null,
    related_standards: sections.RELATED_STANDARDS || null,
    related_technologies: sections.RELATED_TECHNOLOGIES || null,
    industrial_role: sections.INDUSTRIAL_ROLE || null,
  };
  const hashInput = Object.values(canonical).filter(Boolean).join('\n');
  citation.content_hash = hashInput
    ? `sha256:${crypto.createHash('sha256').update(hashInput, 'utf8').digest('hex')}`
    : null;
  return { canonical, citation };
}

function buildRecord(key) {
  const filePath = path.join(ACTIVE_DIR, `${key}.md`);
  if (!fs.existsSync(filePath)) throw new Error(`Missing canonical technology note: ${filePath}`);
  const parsed = parseFrontmatter(fs.readFileSync(filePath, 'utf8'));
  if (!parsed) throw new Error(`Invalid frontmatter in ${key}.md`);
  const canonical = parseCanonical(parsed.body);
  if (!canonical?.canonical?.definition || !canonical?.citation?.version) {
    throw new Error(`Citation-grade AI Retrieval block missing in ${key}.md`);
  }

  const relationships = {};
  for (const [field, values] of Object.entries(parsed.arrays)) {
    if (!RELATIONSHIP_FIELDS.has(field)) continue;
    const links = values.flatMap(extractWikilinks);
    if (links.length) relationships[field] = [...new Set(links)];
  }

  return {
    key,
    type: 'technology',
    name: parsed.yaml.name || `${key}™`,
    slug: parsed.yaml.slug || key.toLowerCase(),
    status: parsed.yaml.status || parsed.yaml.tech_status || 'active',
    in_unified_data: parsed.yaml.in_unified_data === 'true',
    ud_key: parsed.yaml.ud_key || null,
    tags: parsed.arrays.tags || [],
    citation: canonical.citation,
    canonical: canonical.canonical,
    relationships,
    vault_path: path.relative(ROOT, filePath),
  };
}

if (!fs.existsSync(INDEX_PATH)) throw new Error(`Citation index not found: ${INDEX_PATH}`);
const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
index.entities ||= {};
index.graph ||= { edges: [], dangling_keys: [] };
index.graph.edges ||= [];

const repairedKeys = [];
for (const key of CANONICAL_TECHNOLOGIES) {
  const filePath = path.join(ACTIVE_DIR, `${key}.md`);
  if (!fs.existsSync(filePath)) throw new Error(`Canonical technology note missing: ${key}`);

  const existing = index.entities[key];
  if (!existing || existing.status === 'retired' || !existing.canonical?.definition || !existing.citation?.version) {
    index.entities[key] = buildRecord(key);
    repairedKeys.push(key);
  }

  index.entities[key].status = 'active';
}

for (const key of repairedKeys) {
  index.graph.edges = index.graph.edges.filter(edge => edge?.from !== key);
  const record = index.entities[key];
  for (const [relation, targets] of Object.entries(record.relationships || {})) {
    for (const target of targets) index.graph.edges.push({ from: key, to: target, relation });
  }
}

for (const retired of RETIRED_TECHNOLOGIES) {
  if (index.entities[retired]?.status === 'active') {
    throw new Error(`Retired technology exposed as active citation entity: ${retired}`);
  }
}

const technologyKeys = Object.values(index.entities)
  .filter(entity => entity?.type === 'technology' && entity?.status === 'active')
  .map(entity => entity.key)
  .filter(Boolean);

const missing = CANONICAL_TECHNOLOGIES.filter(key => !technologyKeys.includes(key));
if (missing.length) throw new Error(`Canonical technologies missing from citation index: ${missing.join(', ')}`);

const allKeys = new Set(Object.keys(index.entities));
index.graph.dangling_keys = [...new Set(
  index.graph.edges
    .map(edge => edge?.to)
    .filter(Boolean)
    .filter(target => !allKeys.has(target))
)].sort();

if (index.meta) {
  index.meta.note_count = Object.keys(index.entities).length;
  index.meta.entity_types = [...new Set(Object.values(index.entities).map(entity => entity?.type).filter(Boolean))].sort();
  index.meta.repaired_canonical_technologies = repairedKeys;
  const retiredKeys = new Set(Array.isArray(index.meta.retired_entity_keys) ? index.meta.retired_entity_keys : []);
  retiredKeys.delete('THERMACORE');
  retiredKeys.add('COOLTECH');
  index.meta.retired_entity_keys = [...retiredKeys].sort();
}

if (index.entities.THERMACORE?.status !== 'active') {
  throw new Error('THERMACORE must remain active; COOLTECH is the retired predecessor.');
}

fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2), 'utf8');
console.log(`Canonical citation repair verified: 9/9 technologies active; repaired ${repairedKeys.length}; THERMACORE active, COOLTECH retired.`);
