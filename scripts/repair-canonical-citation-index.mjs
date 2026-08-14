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

function scalar(value) {
  const text = String(value ?? '').trim();
  if (!text) return null;
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    return text.slice(1, -1);
  }
  return text;
}

function parseFrontmatter(content) {
  const normalized = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  const yaml = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/);
    if (m && m[2].trim()) yaml[m[1]] = scalar(m[2]);
  }
  return { yaml, body: match[2] };
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

  return {
    key,
    type: 'technology',
    name: parsed.yaml.name || `${key}™`,
    slug: parsed.yaml.slug || key.toLowerCase(),
    status: parsed.yaml.status || parsed.yaml.tech_status || 'active',
    in_unified_data: parsed.yaml.in_unified_data === 'true',
    ud_key: parsed.yaml.ud_key || null,
    tags: [],
    citation: canonical.citation,
    canonical: canonical.canonical,
    relationships: {},
    vault_path: path.relative(ROOT, filePath),
  };
}

if (!fs.existsSync(INDEX_PATH)) throw new Error(`Citation index not found: ${INDEX_PATH}`);
const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
index.entities ||= {};

for (const key of CANONICAL_TECHNOLOGIES) {
  const filePath = path.join(ACTIVE_DIR, `${key}.md`);
  if (!fs.existsSync(filePath)) continue;
  const existing = index.entities[key];
  if (!existing || !existing.canonical?.definition || !existing.citation?.version) {
    index.entities[key] = buildRecord(key);
  }
}

const technologyKeys = Object.values(index.entities)
  .filter(entity => entity?.type === 'technology' && entity?.status !== 'retired')
  .map(entity => entity.key)
  .filter(Boolean);

const missing = CANONICAL_TECHNOLOGIES.filter(key => !technologyKeys.includes(key));
if (missing.length) throw new Error(`Canonical technologies missing from citation index: ${missing.join(', ')}`);

const allKeys = new Set(Object.keys(index.entities));
if (Array.isArray(index.graph?.dangling_keys)) {
  index.graph.dangling_keys = index.graph.dangling_keys.filter(key => !allKeys.has(key));
}
if (index.meta) {
  index.meta.note_count = Object.keys(index.entities).length;
  index.meta.entity_types = [...new Set(Object.values(index.entities).map(entity => entity?.type).filter(Boolean))].sort();
  index.meta.repaired_canonical_technologies = CANONICAL_TECHNOLOGIES;
}

fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2), 'utf8');
console.log(`Canonical citation repair verified: ${CANONICAL_TECHNOLOGIES.length}/9 technologies present.`);
