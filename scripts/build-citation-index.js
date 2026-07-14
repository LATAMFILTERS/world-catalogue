'use strict';

/**
 * build-citation-index.js
 * Phase 4A — ELIMFILTERS AI Citation Index Compiler
 *
 * Reads entity notes from elimfilters-vault/, extracts YAML frontmatter and
 * AI Retrieval canonical blocks, validates citation-grade records, and writes
 * elimfilters-vault/00-meta/CITATION_INDEX.json.
 *
 * IMPORTANT:
 * - Not every Markdown file in the vault is a citation entity.
 * - Doctrine, master strategy, and implementation documents may live in the
 *   vault without `key` / `type` and must not pollute citation validation.
 * - This compiler indexes only notes with both `key` and `type`.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const VAULT_DIR = path.join(PROJECT_ROOT, 'elimfilters-vault');
const OUTPUT_PATH = path.join(VAULT_DIR, '00-meta', 'CITATION_INDEX.json');

const RETIRED_ENTITY_KEYS = new Set([
  'AIRFILTER',
  'AQUAGUARD',
  'COOLTECH',
]);

const MARKETING_TERMS = [
  'industry-leading',
  'cutting-edge',
  'innovative',
  'advanced solution',
  'best-in-class',
  'state-of-the-art',
  'superior',
  'world-class',
  'premium quality',
  'outperforms',
  'better than',
];

const RELATIONSHIP_FIELDS = [
  'applicable_industries',
  'related_standards',
  'addresses_contamination',
  'resolved_by',
  'applicable_to_technologies',
  'applicable_to_industries',
  'applicable_to_systems',
  'relevant_contamination',
  'applicable_technologies',
  'applicable_standards',
  'resolved_by_technologies',
  'affects_components',
  'affects_systems',
  'recommended_product_families',
  'protected_by_technologies',
  'located_in_systems',
  'typical_filter_families',
  'meets_standards',
  'target_industries',
  'sensitive_to_contamination',
  'related_contamination',
  'root_contamination',
  'uses_technology',
  'belongs_to_domain',
  'belongs_to_product_system',
  'protection_standard',
  'supporting_technologies',
  'related_problems',
  'product_families',
  'related_components',
  'industry_frequency',
  'common_problems',
  'typical_product_families',
];

const CANONICAL_FIELDS = [
  'DEFINITION',
  'SYSTEMS',
  'FAILURE_IMPACT',
  'RELATED_STANDARDS',
  'RELATED_TECHNOLOGIES',
  'INDUSTRIAL_ROLE',
  'CITATION_REFERENCE',
];

function parseScalar(val) {
  if (!val || val === 'null' || val === '~') return null;
  if (val === 'true') return true;
  if (val === 'false') return false;

  if ((val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }

  if (val.startsWith('[') && val.endsWith(']')) {
    const inner = val.slice(1, -1);
    if (!inner.trim()) return [];
    return inner.split(',').map(s => parseScalar(s.trim()));
  }

  return val;
}

function parseYaml(text) {
  const result = {};
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) {
      i++;
      continue;
    }

    const topMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)/);
    if (!topMatch) {
      i++;
      continue;
    }

    const key = topMatch[1];
    const rawVal = topMatch[2].trim();

    if (rawVal === '') {
      const children = [];
      const childObj = {};
      let isArray = false;
      let isObj = false;
      let j = i + 1;

      while (j < lines.length) {
        const nextLine = lines[j];
        if (!nextLine.trim() || nextLine.trim().startsWith('#')) {
          j++;
          continue;
        }

        const indent = nextLine.match(/^(\s+)/);
        if (!indent) break;

        const stripped = nextLine.trim();
        if (stripped.startsWith('- ')) {
          isArray = true;
          children.push(parseScalar(stripped.slice(2).trim()));
          j++;
        } else if (/^[a-zA-Z_][a-zA-Z0-9_]*\s*:/.test(stripped)) {
          isObj = true;
          const m = stripped.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)/);
          if (m) childObj[m[1]] = parseScalar(m[2].trim());
          j++;
        } else {
          break;
        }
      }

      if (isArray) result[key] = children;
      else if (isObj) result[key] = childObj;
      else result[key] = null;
      i = isArray || isObj ? j : i + 1;
    } else {
      result[key] = parseScalar(rawVal);
      i++;
    }
  }

  return result;
}

function extractWikilinks(str) {
  if (typeof str !== 'string') return [];
  const matches = [];
  const re = /\[\[([A-Z][A-Z0-9_]*)\]\]/g;
  let m;
  while ((m = re.exec(str)) !== null) matches.push(m[1]);
  return matches;
}

function extractWikilinksFromValue(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.flatMap(v => extractWikilinks(String(v)));
  return extractWikilinks(String(val));
}

function parseCanonicalBlock(blockText) {
  const canonical = {
    definition: null,
    systems: null,
    failure_impact: null,
    related_standards: null,
    related_technologies: null,
    industrial_role: null,
  };

  const citation = {
    source_url: null,
    concept: null,
    version: null,
    last_updated: null,
  };

  if (!blockText || !blockText.trim()) return { canonical, citation };

  const text = blockText.replace(/^CANONICAL KNOWLEDGE BLOCK:.*\n/, '').trim();
  const sections = [];
  const lines = text.split('\n');
  let currentLabel = null;
  let currentLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (CANONICAL_FIELDS.includes(trimmed)) {
      if (currentLabel) sections.push([currentLabel, currentLines.join('\n').trim()]);
      currentLabel = trimmed;
      currentLines = [];
    } else if (currentLabel) {
      currentLines.push(line);
    }
  }

  if (currentLabel) sections.push([currentLabel, currentLines.join('\n').trim()]);

  for (const [label, content] of sections) {
    if (label === 'DEFINITION') canonical.definition = content || null;
    else if (label === 'SYSTEMS') canonical.systems = content || null;
    else if (label === 'FAILURE_IMPACT') canonical.failure_impact = content || null;
    else if (label === 'RELATED_STANDARDS') canonical.related_standards = content || null;
    else if (label === 'RELATED_TECHNOLOGIES') canonical.related_technologies = content || null;
    else if (label === 'INDUSTRIAL_ROLE') canonical.industrial_role = content || null;
    else if (label === 'CITATION_REFERENCE') {
      for (const subLine of content.split('\n')) {
        const m = subLine.match(/^(\w+):\s*(.*)/);
        if (!m) continue;
        const k = m[1];
        const v = m[2].trim();
        if (k === 'source') citation.source_url = v;
        else if (k === 'concept') citation.concept = v;
        else if (k === 'version') citation.version = v;
        else if (k === 'last_updated') citation.last_updated = v;
      }
    }
  }

  return { canonical, citation };
}

function extractAiRetrievalBlock(bodyText) {
  const sectionMatch = bodyText.match(/##\s+AI\s+Retrieval\s*\n([\s\S]*?)(?=\n##\s|\n---\s*$|$)/);
  if (!sectionMatch) return null;

  const fenceMatch = sectionMatch[1].match(/```[^\n]*\n([\s\S]*?)```/);
  if (!fenceMatch) return null;

  return fenceMatch[1];
}

function parseNote(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\r\n/g, '\n');
  const relPath = path.relative(PROJECT_ROOT, filePath);

  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) {
    return {
      filePath,
      relPath,
      yaml: {},
      canonical: null,
      citation: { source_url: null, concept: null, version: null, last_updated: null },
      hasAiRetrieval: false,
      isEntityNote: false,
    };
  }

  const yaml = parseYaml(fmMatch[1]);
  const bodyText = fmMatch[2];
  const blockText = extractAiRetrievalBlock(bodyText);
  const hasAiRetrieval = blockText !== null;
  const parsed = blockText
    ? parseCanonicalBlock(blockText)
    : {
        canonical: null,
        citation: { source_url: null, concept: null, version: null, last_updated: null },
      };

  return {
    filePath,
    relPath,
    yaml,
    canonical: parsed.canonical,
    citation: parsed.citation,
    hasAiRetrieval,
    isEntityNote: Boolean(yaml.key && yaml.type) && !RETIRED_ENTITY_KEYS.has(yaml.key),
  };
}

function findVaultNotes(vaultDir) {
  const results = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== '00-meta') walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        if (entry.name === 'README.md' || entry.name.startsWith('_') || entry.name === '.gitkeep') continue;
        results.push(fullPath);
      }
    }
  }

  walk(vaultDir);
  return results.sort();
}

function buildCitationRecord(note) {
  const { yaml, canonical, citation, relPath } = note;
  const name = yaml.name || yaml.label || yaml.key || null;
  const status = yaml.status || yaml.tech_status || 'unknown';
  const in_unified_data = yaml.in_unified_data === true;
  const tags = Array.isArray(yaml.tags) ? yaml.tags : [];

  const relationships = {};
  for (const field of RELATIONSHIP_FIELDS) {
    const val = yaml[field];
    if (val !== undefined && val !== null) {
      const keys = extractWikilinksFromValue(val);
      if (keys.length > 0) relationships[field] = keys;
    }
  }

  const canonicalBlock = canonical || {
    definition: null,
    systems: null,
    failure_impact: null,
    related_standards: null,
    related_technologies: null,
    industrial_role: null,
  };

  const hashInput = [
    canonicalBlock.definition,
    canonicalBlock.systems,
    canonicalBlock.failure_impact,
    canonicalBlock.related_standards,
    canonicalBlock.related_technologies,
    canonicalBlock.industrial_role,
  ].filter(Boolean).join('\n');

  const contentHash = hashInput
    ? 'sha256:' + crypto.createHash('sha256').update(hashInput, 'utf8').digest('hex')
    : null;

  return {
    key: yaml.key,
    type: yaml.type,
    name,
    slug: yaml.slug || null,
    status,
    in_unified_data,
    ud_key: yaml.ud_key || null,
    tags,
    citation: {
      source_url: citation.source_url,
      concept: citation.concept,
      version: citation.version,
      last_updated: citation.last_updated,
      content_hash: contentHash,
    },
    canonical: canonicalBlock,
    relationships,
    vault_path: relPath,
  };
}

function validate(records, allKeys, notesByKey) {
  const errors = [];
  const warnings = [];

  for (const record of records) {
    const id = record.key || record.vault_path;

    if (!record.canonical.definition) {
      errors.push({ code: 'E003', entity: id, message: 'Missing canonical DEFINITION field (empty or absent)' });
    }

    if (!record.citation.version) {
      errors.push({ code: 'E004', entity: id, message: 'Missing citation version' });
    }

    if (record.in_unified_data && !record.ud_key) {
      errors.push({ code: 'E005', entity: id, message: '`in_unified_data: true` but no `ud_key` present' });
    }

    const note = notesByKey[record.key];
    if (note && !note.hasAiRetrieval) {
      warnings.push({ code: 'W001', entity: id, message: 'Missing ## AI Retrieval section entirely' });
    }

    if (!record.canonical.industrial_role) {
      warnings.push({ code: 'W002', entity: id, message: 'Missing canonical INDUSTRIAL_ROLE field' });
    }

    if (!record.citation.source_url) {
      warnings.push({ code: 'W003', entity: id, message: 'Missing citation source_url' });
    }

    if (!record.citation.last_updated) {
      warnings.push({ code: 'W004', entity: id, message: 'Missing citation last_updated' });
    }

    if (!record.in_unified_data && record.ud_key) {
      warnings.push({ code: 'W006', entity: id, message: '`in_unified_data: false` but `ud_key` is set (possible copy-paste error)' });
    }

    if (record.canonical.definition) {
      const defLower = record.canonical.definition.toLowerCase();
      for (const term of MARKETING_TERMS) {
        if (defLower.includes(term)) {
          warnings.push({ code: 'W007', entity: id, message: `Marketing term detected in DEFINITION: "${term}"` });
        }
      }
    }
  }

  for (const record of records) {
    for (const [relation, targets] of Object.entries(record.relationships)) {
      for (const targetKey of targets) {
        if (!allKeys.has(targetKey)) {
          warnings.push({
            code: 'W005',
            entity: record.key || record.vault_path,
            message: `Broken wikilink: [[${targetKey}]] (relation: ${relation})`,
            from: record.key,
            to: targetKey,
            relation,
          });
        }
      }
    }
  }

  return { errors, warnings };
}

function buildGraph(records) {
  const edges = [];
  const danglingKeys = new Set();
  const allKeys = new Set(records.map(r => r.key).filter(Boolean));

  for (const record of records) {
    for (const [relation, targets] of Object.entries(record.relationships)) {
      for (const targetKey of targets) {
        edges.push({ from: record.key, to: targetKey, relation });
        if (!allKeys.has(targetKey)) danglingKeys.add(targetKey);
      }
    }
  }

  return { edges, dangling_keys: Array.from(danglingKeys).sort() };
}

function main() {
  console.log('CITATION INDEX COMPILER — Phase 4A');
  console.log('===================================');

  const noteFiles = findVaultNotes(VAULT_DIR);
  const parsedNotes = noteFiles.map(parseNote);
  const entityNotes = parsedNotes.filter(note => note.isEntityNote);
  const skippedNonEntities = parsedNotes.length - entityNotes.length;
  const records = entityNotes.map(buildCitationRecord);
  const allKeys = new Set(records.map(r => r.key).filter(Boolean));

  const notesByKey = {};
  for (const note of entityNotes) {
    if (note.yaml.key) notesByKey[note.yaml.key] = note;
  }

  const { errors, warnings } = validate(records, allKeys, notesByKey);
  const graph = buildGraph(records);

  const entities = {};
  for (const record of records) {
    if (record.key) entities[record.key] = record;
  }

  const entityTypes = [...new Set(records.map(r => r.type).filter(Boolean))].sort();
  const resolvedCount = records.filter(r => r.canonical.definition !== null).length;
  const resolutionRatio = records.length > 0 ? Math.round((resolvedCount / records.length) * 1000) / 1000 : 0;

  const index = {
    meta: {
      version: '1.0',
      generated: new Date().toISOString(),
      note_count: records.length,
      scanned_note_count: parsedNotes.length,
      skipped_non_entity_count: skippedNonEntities,
      retired_entity_keys: Array.from(RETIRED_ENTITY_KEYS).sort(),
      entity_types: entityTypes,
      resolution_ratio: resolutionRatio,
      generator: 'scripts/build-citation-index.js',
    },
    entities,
    graph: {
      edges: graph.edges,
      dangling_keys: graph.dangling_keys,
    },
  };

  const validateOnly = process.argv.includes('--validate');
  if (!validateOnly) {
    const outputDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(index, null, 2), 'utf8');
  }

  console.log(`Notes scanned:    ${parsedNotes.length}`);
  console.log(`Entity records:   ${records.length}`);
  console.log(`Skipped docs:     ${skippedNonEntities}`);
  console.log(`Retired keys:     ${Array.from(RETIRED_ENTITY_KEYS).sort().join(', ') || 'none'}`);
  console.log(`Errors:           ${errors.length}`);
  console.log(`Warnings:         ${warnings.length}`);
  console.log(`Dangling links:   ${graph.dangling_keys.length}`);

  if (errors.length > 0) {
    console.log('\nERRORS');
    for (const err of errors) console.log(`- ${err.code} ${err.entity}: ${err.message}`);
  } else {
    console.log('ERRORS: none');
  }

  if (warnings.length > 0) {
    console.log('\nWARNINGS');
    for (const warn of warnings) console.log(`- ${warn.code} ${warn.entity}: ${warn.message}`);
  } else {
    console.log('WARNINGS: none');
  }

  if (graph.dangling_keys.length > 0) {
    console.log(`DANGLING KEYS: ${graph.dangling_keys.join(', ')}`);
  }

  console.log(`OUTPUT: ${path.relative(PROJECT_ROOT, OUTPUT_PATH)}`);

  if (errors.length > 0) {
    process.exitCode = 1;
  }
}

main();
