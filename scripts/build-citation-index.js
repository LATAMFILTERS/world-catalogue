'use strict';

/**
 * build-citation-index.js
 * Phase 4A — ELIMFILTERS AI Citation Index Compiler
 *
 * Reads all entity notes from elimfilters-vault/, extracts YAML frontmatter
 * and AI Retrieval canonical blocks, validates, and writes CITATION_INDEX.json.
 *
 * Run from project root:
 *   node scripts/build-citation-index.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ─── Constants ────────────────────────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(__dirname, '..');
const VAULT_DIR = path.join(PROJECT_ROOT, 'elimfilters-vault');
const OUTPUT_PATH = path.join(VAULT_DIR, '00-meta', 'CITATION_INDEX.json');

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

// All relationship YAML fields that may contain [[KEY]] wikilinks
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

// ─── Minimal YAML Parser ──────────────────────────────────────────────────────

/**
 * Parses the simple YAML used in vault frontmatter.
 * Handles: string scalars, arrays, booleans, null, and one-level nested objects.
 * Does NOT handle: multi-line scalars, anchors, complex nesting.
 */
function parseYaml(text) {
  const result = {};
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines and comments
    if (!line.trim() || line.trim().startsWith('#')) {
      i++;
      continue;
    }

    // Top-level key: value
    const topMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)/);
    if (!topMatch) {
      i++;
      continue;
    }

    const key = topMatch[1];
    const rawVal = topMatch[2].trim();

    // Check if next lines are array items or nested key:value (no value on this line)
    if (rawVal === '' || rawVal === null) {
      // Peek ahead
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
        // Check indentation
        const indent = nextLine.match(/^(\s+)/);
        if (!indent) break; // back to top level

        const stripped = nextLine.trim();
        if (stripped.startsWith('- ')) {
          isArray = true;
          children.push(parseScalar(stripped.slice(2).trim()));
          j++;
        } else if (stripped.match(/^[a-zA-Z_][a-zA-Z0-9_]*\s*:/)) {
          isObj = true;
          const m = stripped.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)/);
          if (m) {
            childObj[m[1]] = parseScalar(m[2].trim());
          }
          j++;
        } else {
          break;
        }
      }

      if (isArray) {
        result[key] = children;
        i = j;
      } else if (isObj) {
        result[key] = childObj;
        i = j;
      } else {
        result[key] = null;
        i++;
      }
    } else {
      result[key] = parseScalar(rawVal);
      i++;
    }
  }

  return result;
}

function parseScalar(val) {
  if (!val || val === 'null' || val === '~') return null;
  if (val === 'true') return true;
  if (val === 'false') return false;
  // Strip surrounding quotes
  if ((val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }
  // Inline array [...]
  if (val.startsWith('[') && val.endsWith(']')) {
    const inner = val.slice(1, -1);
    if (!inner.trim()) return [];
    return inner.split(',').map(s => parseScalar(s.trim()));
  }
  return val;
}

// ─── Wikilink Extraction ──────────────────────────────────────────────────────

/** Extract all [[KEY]] patterns from a string, returning array of keys */
function extractWikilinks(str) {
  if (typeof str !== 'string') return [];
  const matches = [];
  const re = /\[\[([A-Z][A-Z0-9_]*)\]\]/g;
  let m;
  while ((m = re.exec(str)) !== null) {
    matches.push(m[1]);
  }
  return matches;
}

/** Extract wikilinks from any value (string, array, or null) */
function extractWikilinksFromValue(val) {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.flatMap(v => extractWikilinks(String(v)));
  }
  return extractWikilinks(String(val));
}

// ─── AI Retrieval Block Parser ────────────────────────────────────────────────

const CANONICAL_FIELDS = [
  'DEFINITION',
  'SYSTEMS',
  'FAILURE_IMPACT',
  'RELATED_STANDARDS',
  'RELATED_TECHNOLOGIES',
  'INDUSTRIAL_ROLE',
  'CITATION_REFERENCE',
];

/**
 * Parse the canonical block text (content inside the ``` fence of ## AI Retrieval).
 * Returns { definition, systems, failure_impact, related_standards,
 *           related_technologies, industrial_role, citation }
 */
function parseCanonicalBlock(blockText) {
  const result = {
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

  if (!blockText || !blockText.trim()) {
    return { canonical: result, citation };
  }

  // Remove header line "CANONICAL KNOWLEDGE BLOCK: ..."
  const text = blockText.replace(/^CANONICAL KNOWLEDGE BLOCK:.*\n/, '').trim();

  // Split into sections by ALL_CAPS labels at the start of a line
  // Build a list of [label, content] pairs
  const sections = [];
  const labelRe = /^([A-Z][A-Z_]+)$/m;
  const lines = text.split('\n');

  let currentLabel = null;
  let currentLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (CANONICAL_FIELDS.includes(trimmed)) {
      if (currentLabel) {
        sections.push([currentLabel, currentLines.join('\n').trim()]);
      }
      currentLabel = trimmed;
      currentLines = [];
    } else {
      if (currentLabel) {
        currentLines.push(line);
      }
    }
  }
  if (currentLabel) {
    sections.push([currentLabel, currentLines.join('\n').trim()]);
  }

  for (const [label, content] of sections) {
    switch (label) {
      case 'DEFINITION':
        result.definition = content || null;
        break;
      case 'SYSTEMS':
        result.systems = content || null;
        break;
      case 'FAILURE_IMPACT':
        result.failure_impact = content || null;
        break;
      case 'RELATED_STANDARDS':
        result.related_standards = content || null;
        break;
      case 'RELATED_TECHNOLOGIES':
        result.related_technologies = content || null;
        break;
      case 'INDUSTRIAL_ROLE':
        result.industrial_role = content || null;
        break;
      case 'CITATION_REFERENCE':
        // Parse sub-fields as key: value
        for (const subLine of content.split('\n')) {
          const m = subLine.match(/^(\w+):\s*(.*)/);
          if (m) {
            const k = m[1];
            const v = m[2].trim();
            if (k === 'source') citation.source_url = v;
            else if (k === 'concept') citation.concept = v;
            else if (k === 'version') citation.version = v;
            else if (k === 'last_updated') citation.last_updated = v;
          }
        }
        break;
    }
  }

  return { canonical: result, citation };
}

/**
 * Extract the content of the fenced code block inside ## AI Retrieval section.
 * Returns null if section/block not found.
 */
function extractAiRetrievalBlock(bodyText) {
  // Find the ## AI Retrieval section
  const sectionMatch = bodyText.match(/##\s+AI\s+Retrieval\s*\n([\s\S]*?)(?=\n##\s|\n---\s*$|$)/);
  if (!sectionMatch) return null;

  const sectionContent = sectionMatch[1];

  // Find the first fenced code block (``` ... ```)
  const fenceMatch = sectionContent.match(/```[^\n]*\n([\s\S]*?)```/);
  if (!fenceMatch) return null;

  return fenceMatch[1];
}

// ─── Note Parser ──────────────────────────────────────────────────────────────

function parseNote(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(PROJECT_ROOT, filePath);

  // Split frontmatter from body
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) {
    return {
      filePath,
      relPath,
      yaml: {},
      canonical: null,
      citation: { source_url: null, concept: null, version: null, last_updated: null },
      hasAiRetrieval: false,
      parseErrors: ['No YAML frontmatter found'],
    };
  }

  const yamlText = fmMatch[1];
  const bodyText = fmMatch[2];

  const yaml = parseYaml(yamlText);

  // Extract AI Retrieval block
  const blockText = extractAiRetrievalBlock(bodyText);
  const hasAiRetrieval = blockText !== null;

  let canonical = null;
  let citation = { source_url: null, concept: null, version: null, last_updated: null };

  if (blockText) {
    const parsed = parseCanonicalBlock(blockText);
    canonical = parsed.canonical;
    citation = parsed.citation;
  }

  return { filePath, relPath, yaml, canonical, citation, hasAiRetrieval, parseErrors: [] };
}

// ─── File Discovery ───────────────────────────────────────────────────────────

function findVaultNotes(vaultDir) {
  const results = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip hidden dirs and 00-meta
        if (!entry.name.startsWith('.') && entry.name !== '00-meta') {
          walk(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Skip README.md, files starting with _, .gitkeep
        if (
          entry.name === 'README.md' ||
          entry.name.startsWith('_') ||
          entry.name === '.gitkeep'
        ) {
          continue;
        }
        results.push(fullPath);
      }
    }
  }

  walk(vaultDir);
  return results.sort();
}

// ─── Record Builder ───────────────────────────────────────────────────────────

function buildCitationRecord(note) {
  const { yaml, canonical, citation, relPath } = note;

  // Extract name (some notes use `label` instead of `name`)
  const name = yaml.name || yaml.label || yaml.key || null;

  // Extract status (technologies use tech_status, others use status)
  const status = yaml.status || yaml.tech_status || 'unknown';

  // Extract in_unified_data
  const in_unified_data = yaml.in_unified_data === true;

  // Extract tags
  const tags = Array.isArray(yaml.tags) ? yaml.tags : [];

  // Extract relationships from known fields
  const relationships = {};
  for (const field of RELATIONSHIP_FIELDS) {
    const val = yaml[field];
    if (val !== undefined && val !== null) {
      const keys = extractWikilinksFromValue(val);
      if (keys.length > 0) {
        relationships[field] = keys;
      }
    }
  }

  // Build canonical block (use null if missing)
  const canonicalBlock = canonical || {
    definition: null,
    systems: null,
    failure_impact: null,
    related_standards: null,
    related_technologies: null,
    industrial_role: null,
  };

  // Compute content hash from canonical fields
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
    key: yaml.key || null,
    type: yaml.type || null,
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

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(records, allKeys, notesByKey) {
  const errors = [];
  const warnings = [];

  for (const record of records) {
    const id = record.key || record.vault_path;

    // E001: Missing key
    if (!record.key) {
      errors.push({ code: 'E001', entity: id, message: 'Missing `key` in YAML frontmatter' });
    }

    // E002: Missing type
    if (!record.type) {
      errors.push({ code: 'E002', entity: id, message: 'Missing `type` in YAML frontmatter' });
    }

    // E003: Missing canonical.definition
    if (!record.canonical.definition) {
      errors.push({ code: 'E003', entity: id, message: 'Missing canonical DEFINITION field (empty or absent)' });
    }

    // E004: Missing citation.version
    if (!record.citation.version) {
      errors.push({ code: 'E004', entity: id, message: 'Missing citation version' });
    }

    // E005: in_unified_data true but no ud_key
    if (record.in_unified_data && !record.ud_key) {
      errors.push({ code: 'E005', entity: id, message: '`in_unified_data: true` but no `ud_key` present' });
    }

    // W001: Missing ## AI Retrieval section
    const note = notesByKey[record.key];
    if (note && !note.hasAiRetrieval) {
      warnings.push({ code: 'W001', entity: id, message: 'Missing ## AI Retrieval section entirely' });
    }

    // W002: Missing canonical.industrial_role
    if (!record.canonical.industrial_role) {
      warnings.push({ code: 'W002', entity: id, message: 'Missing canonical INDUSTRIAL_ROLE field' });
    }

    // W003: Missing citation.source_url
    if (!record.citation.source_url) {
      warnings.push({ code: 'W003', entity: id, message: 'Missing citation source_url' });
    }

    // W004: Missing citation.last_updated
    if (!record.citation.last_updated) {
      warnings.push({ code: 'W004', entity: id, message: 'Missing citation last_updated' });
    }

    // W006: in_unified_data false but has ud_key
    if (!record.in_unified_data && record.ud_key) {
      warnings.push({ code: 'W006', entity: id, message: '`in_unified_data: false` but `ud_key` is set (possible copy-paste error)' });
    }

    // W007: Marketing terms in definition
    if (record.canonical.definition) {
      const defLower = record.canonical.definition.toLowerCase();
      for (const term of MARKETING_TERMS) {
        if (defLower.includes(term)) {
          warnings.push({ code: 'W007', entity: id, message: `Marketing term detected in DEFINITION: "${term}"` });
        }
      }
    }
  }

  // W005: Broken wikilinks (keys referenced but no note exists)
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

// ─── Graph Builder ────────────────────────────────────────────────────────────

function buildGraph(records) {
  const edges = [];
  const danglingKeys = new Set();
  const allKeys = new Set(records.map(r => r.key).filter(Boolean));

  for (const record of records) {
    for (const [relation, targets] of Object.entries(record.relationships)) {
      for (const targetKey of targets) {
        edges.push({
          from: record.key,
          to: targetKey,
          relation,
        });
        if (!allKeys.has(targetKey)) {
          danglingKeys.add(targetKey);
        }
      }
    }
  }

  return { edges, dangling_keys: Array.from(danglingKeys).sort() };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log('CITATION INDEX COMPILER — Phase 4A');
  console.log('===================================');

  // 1. Discover notes
  const noteFiles = findVaultNotes(VAULT_DIR);

  // 2. Parse all notes
  const parsedNotes = noteFiles.map(parseNote);

  // 3. Build citation records
  const records = parsedNotes.map(buildCitationRecord);

  // 4. Build key sets for validation
  const allKeys = new Set(records.map(r => r.key).filter(Boolean));

  // Build notesByKey map for W001 check
  const notesByKey = {};
  for (let i = 0; i < parsedNotes.length; i++) {
    const key = parsedNotes[i].yaml.key;
    if (key) notesByKey[key] = parsedNotes[i];
  }

  // 5. Validate
  const { errors, warnings } = validate(records, allKeys, notesByKey);

  // 6. Build graph
  const graph = buildGraph(records);

  // 7. Build entities map
  const entities = {};
  for (const record of records) {
    if (record.key) {
      entities[record.key] = record;
    }
  }

  // Collect entity types
  const entityTypes = [...new Set(records.map(r => r.type).filter(Boolean))].sort();

  // Resolution ratio: records with complete canonical blocks (definition present)
  const resolvedCount = records.filter(r => r.canonical.definition !== null).length;
  const resolutionRatio = records.length > 0
    ? Math.round((resolvedCount / records.length) * 1000) / 1000
    : 0;

  // 8. Build index
  const index = {
    meta: {
      version: '1.0',
      generated: new Date().toISOString(),
      note_count: records.length,
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

  // 9. Write output
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(index, null, 2), 'utf8');

  // 10. Print validation summary
  console.log(`Notes scanned:    ${noteFiles.length}`);
  console.log(`Records built:    ${records.length}`);
  console.log(`Errors:           ${errors.length}`);
  console.log(`Warnings:         ${warnings.length}`);
  console.log(`Dangling links:   ${graph.dangling_keys.length}`);
  console.log('');

  if (errors.length === 0) {
    console.log('ERRORS: none');
  } else {
    console.log('ERRORS:');
    for (const e of errors) {
      console.log(`  ${e.code}: ${e.entity} — ${e.message}`);
    }
  }

  console.log('');

  if (warnings.length === 0) {
    console.log('WARNINGS: none');
  } else {
    console.log('WARNINGS:');
    for (const w of warnings) {
      if (w.code === 'W005') {
        console.log(`  W005: ${w.from} → [[${w.to}]] (relation: ${w.relation})`);
      } else {
        console.log(`  ${w.code}: ${w.entity} — ${w.message}`);
      }
    }
  }

  console.log('');
  console.log(`OUTPUT: ${path.relative(PROJECT_ROOT, OUTPUT_PATH)}`);

  // Return stats for report generation
  return {
    noteCount: noteFiles.length,
    recordCount: records.length,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings,
    graph,
    entityTypes,
    resolutionRatio,
    outputPath: OUTPUT_PATH,
    index,
  };
}

main();
