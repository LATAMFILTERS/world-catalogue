#!/usr/bin/env node
'use strict';

/**
 * generate-citation-api.js
 * Phase 4E — ELIMFILTERS Static Citation API Generator
 *
 * Reads CITATION_INDEX.json and PART_SEARCH_MAP.json and writes pre-generated
 * static JSON files into frontend/public/api/citation/. Next.js static export
 * copies public/ directly to out/, so these files are available at /api/citation/
 * in the deployed site without any server runtime.
 *
 * Run from project root:
 *   node scripts/generate-citation-api.js
 *   node scripts/generate-citation-api.js --validate  (dry-run, no writes)
 */

const fs = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CI_PATH = path.join(PROJECT_ROOT, 'elimfilters-vault', '00-meta', 'CITATION_INDEX.json');
const PM_PATH = path.join(PROJECT_ROOT, 'elimfilters-vault', '00-meta', 'PART_SEARCH_MAP.json');
const OUT_DIR = path.join(PROJECT_ROOT, 'frontend', 'public', 'api', 'citation');

const validateOnly = process.argv.includes('--validate');

// ─── Load Sources ─────────────────────────────────────────────────────────────

if (!fs.existsSync(CI_PATH)) {
  console.error('ERROR: CITATION_INDEX.json not found at', CI_PATH);
  process.exit(1);
}
if (!fs.existsSync(PM_PATH)) {
  console.error('ERROR: PART_SEARCH_MAP.json not found at', PM_PATH);
  process.exit(1);
}

const ci = JSON.parse(fs.readFileSync(CI_PATH, 'utf8'));
const pm = JSON.parse(fs.readFileSync(PM_PATH, 'utf8'));
const entities = ci.entities;
const edges = ci.graph.edges;
const danglingKeys = ci.graph.dangling_keys || [];
const paths = pm.traversal_paths;

// ─── Validation ───────────────────────────────────────────────────────────────

let errorCount = 0;
let warningCount = 0;

function logError(msg) {
  console.error('ERROR:', msg);
  errorCount++;
}

function logWarning(msg) {
  console.warn('WARN: ', msg);
  warningCount++;
}

// Validate entities
const entityKeys = Object.keys(entities);
if (entityKeys.length === 0) {
  logError('No entities found in CITATION_INDEX.json');
}

// Validate paths
if (paths.length === 0) {
  logError('No traversal paths found in PART_SEARCH_MAP.json');
}

// Check each path's steps resolve to known entity keys
paths.forEach(p => {
  p.steps.forEach(step => {
    if (!entities[step.key]) {
      logWarning(`Path ${p.path_id} step key ${step.key} not in entities (may be dangling)`);
    }
  });
});

// ─── Validate-only mode ───────────────────────────────────────────────────────

if (validateOnly) {
  console.log('CITATION API VALIDATOR — Phase 4E');
  console.log('==================================');
  console.log('Entities found:   ', entityKeys.length);
  console.log('Paths found:      ', paths.length);
  console.log('Edges found:      ', edges.length);
  console.log('Errors:           ', errorCount);
  console.log('Warnings:         ', warningCount);
  console.log('');
  console.log('Validation complete (--validate mode, no files written)');
  process.exit(errorCount > 0 ? 1 : 0);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

let fileCount = 0;

function trackWrite(filePath, data) {
  writeJson(filePath, data);
  fileCount++;
}

// Build _links.related for an entity from edge list
function buildRelatedLinks(key) {
  const related = [];
  edges.forEach(edge => {
    if (edge.from === key) {
      related.push({
        key: edge.to,
        relation: edge.relation,
        href: `/api/citation/${edge.to}.json`,
      });
    }
  });
  return related;
}

// ─── Setup Output Directories ─────────────────────────────────────────────────

ensureDir(OUT_DIR);
ensureDir(path.join(OUT_DIR, 'type'));
ensureDir(path.join(OUT_DIR, 'path'));
ensureDir(path.join(OUT_DIR, 'path', 'by-entry'));

// ─── Generate index.json ─────────────────────────────────────────────────────

const now = new Date().toISOString();

const indexData = {
  meta: {
    version: '1.0',
    generated: now,
    entity_count: entityKeys.length,
    endpoint_base: '/api/citation',
    query_patterns: {
      entity_lookup: '/api/citation/[KEY].json',
      type_scan: '/api/citation/type/[type].json',
      type_index: '/api/citation/type/index.json',
      graph: '/api/citation/graph.json',
      path_traversal: '/api/citation/path/[path_id].json',
      paths_by_entry: '/api/citation/path/by-entry/[KEY].json',
      path_index: '/api/citation/path/index.json',
    },
  },
  entities,
};

trackWrite(path.join(OUT_DIR, 'index.json'), indexData);

// ─── Generate [KEY].json (one per entity) ────────────────────────────────────

entityKeys.forEach(key => {
  const entity = entities[key];
  const related = buildRelatedLinks(key);

  const entityFile = {
    ...entity,
    _links: {
      self: `/api/citation/${key}.json`,
      type_index: `/api/citation/type/${entity.type}.json`,
      related,
    },
  };

  trackWrite(path.join(OUT_DIR, `${key}.json`), entityFile);
});

// ─── Generate type/ files ────────────────────────────────────────────────────

const typeMap = {};
entityKeys.forEach(key => {
  const entity = entities[key];
  const t = entity.type;
  if (!typeMap[t]) typeMap[t] = [];
  typeMap[t].push(entity);
});

const allTypes = Object.keys(typeMap).sort();

// type/index.json
const typeIndex = {
  type_count: allTypes.length,
  types: allTypes.map(t => ({
    type: t,
    count: typeMap[t].length,
    href: `/api/citation/type/${t}.json`,
  })),
};
trackWrite(path.join(OUT_DIR, 'type', 'index.json'), typeIndex);

// type/[type].json
allTypes.forEach(t => {
  const typeFile = {
    type: t,
    count: typeMap[t].length,
    entities: typeMap[t],
  };
  // Normalize type name for filename: contamination-mode → contamination-mode.json
  const filename = `${t}.json`;
  trackWrite(path.join(OUT_DIR, 'type', filename), typeFile);
});

// ─── Generate graph.json ─────────────────────────────────────────────────────

const graphData = {
  edge_count: edges.length,
  node_count: entityKeys.length,
  dangling_keys: danglingKeys,
  edges,
};
trackWrite(path.join(OUT_DIR, 'graph.json'), graphData);

// ─── Generate path/index.json ────────────────────────────────────────────────

const validPathCount = paths.filter(p => p.valid).length;

const pathIndex = {
  path_count: paths.length,
  valid_count: validPathCount,
  paths: paths.map(p => ({
    path_id: p.path_id,
    path_type: p.path_type,
    entry_node: p.entry_node,
    entry_type: p.entry_type || null,
    industry: p.industry || null,
    valid: p.valid,
    terminal_product_families: p.terminal_product_families || [],
    href: `/api/citation/path/${p.path_id}.json`,
  })),
};
trackWrite(path.join(OUT_DIR, 'path', 'index.json'), pathIndex);

// ─── Generate path/[path_id].json ────────────────────────────────────────────

paths.forEach(p => {
  // Embed full citation records for each step
  const enrichedSteps = p.steps.map(step => ({
    key: step.key,
    type: step.type,
    name: step.name,
    citation_record: entities[step.key] || null,
  }));

  const pathFile = {
    path_id: p.path_id,
    path_type: p.path_type,
    entry_node: p.entry_node,
    entry_type: p.entry_type || null,
    industry: p.industry || null,
    valid: p.valid,
    steps: enrichedSteps,
    terminal_product_families: p.terminal_product_families || [],
  };

  trackWrite(path.join(OUT_DIR, 'path', `${p.path_id}.json`), pathFile);
});

// ─── Generate path/by-entry/[KEY].json ───────────────────────────────────────

// Build entry→paths map
const byEntryMap = {};
paths.forEach(p => {
  const entryKey = p.entry_node;
  if (!byEntryMap[entryKey]) byEntryMap[entryKey] = [];
  byEntryMap[entryKey].push({
    path_id: p.path_id,
    path_type: p.path_type,
    entry_node: p.entry_node,
    entry_type: p.entry_type || null,
    industry: p.industry || null,
    valid: p.valid,
    terminal_product_families: p.terminal_product_families || [],
    href: `/api/citation/path/${p.path_id}.json`,
  });
});

Object.keys(byEntryMap).forEach(entryKey => {
  const byEntryFile = {
    entry_key: entryKey,
    path_count: byEntryMap[entryKey].length,
    paths: byEntryMap[entryKey],
  };
  trackWrite(path.join(OUT_DIR, 'path', 'by-entry', `${entryKey}.json`), byEntryFile);
});

// ─── Generate README.md ───────────────────────────────────────────────────────

const readmeContent = `# ELIMFILTERS Citation API — Static Endpoints

This directory contains pre-generated static JSON files serving the ELIMFILTERS
Knowledge Vault citation index. Files are regenerated automatically on every
\`npm run build\` via the prebuild script.

## Endpoints

| Pattern | File | Description |
|---------|------|-------------|
| \`/api/citation/index.json\` | index.json | All ${entityKeys.length} entity records |
| \`/api/citation/[KEY].json\` | MACROCORE.json etc | Single entity lookup with _links |
| \`/api/citation/graph.json\` | graph.json | Full edge list (${edges.length} edges) |
| \`/api/citation/type/index.json\` | type/index.json | All entity types list |
| \`/api/citation/type/[type].json\` | type/technology.json etc | Type scan |
| \`/api/citation/path/index.json\` | path/index.json | All path summaries |
| \`/api/citation/path/[path_id].json\` | path/PATH_A_*.json etc | Path with embedded citation records |
| \`/api/citation/path/by-entry/[KEY].json\` | path/by-entry/MINING.json etc | Paths by entry node |

## Query Patterns

\`\`\`
entity_lookup:   /api/citation/[KEY].json
type_scan:       /api/citation/type/[type].json
graph:           /api/citation/graph.json
path_traversal:  /api/citation/path/[path_id].json
paths_by_entry:  /api/citation/path/by-entry/[KEY].json
\`\`\`

## Source

Generated from:
- \`elimfilters-vault/00-meta/CITATION_INDEX.json\`
- \`elimfilters-vault/00-meta/PART_SEARCH_MAP.json\`

Generator: \`scripts/generate-citation-api.js\`
Last generated: ${now}
`;

fs.writeFileSync(path.join(OUT_DIR, 'README.md'), readmeContent, 'utf8');

// ─── Summary ─────────────────────────────────────────────────────────────────

const entityFileCount = entityKeys.length;
const typeFileCount = allTypes.length + 1; // +1 for index
const pathFileCount = paths.length + 1 + Object.keys(byEntryMap).length; // paths + index + by-entry
const graphFileCount = 1;
const indexFileCount = 1;

console.log('CITATION API GENERATOR — Phase 4E');
console.log('==================================');
console.log(`Entity files:     ${entityFileCount}`);
console.log(`Type files:       ${typeFileCount} (${allTypes.length} types + 1 index)`);
console.log(`Graph file:       ${graphFileCount}`);
console.log(`Path files:       ${paths.length} paths + 1 index + ${Object.keys(byEntryMap).length} by-entry`);
console.log(`Index file:       ${indexFileCount}`);
console.log(`Total files:      ${fileCount}`);
console.log(`Output:           ${path.relative(PROJECT_ROOT, OUT_DIR)}`);
console.log('');
console.log('Entity types generated:');
allTypes.forEach(t => console.log(`  ${t}: ${typeMap[t].length} entities`));
console.log('');
console.log('By-entry keys:');
Object.keys(byEntryMap).forEach(k => console.log(`  ${k}: ${byEntryMap[k].length} paths`));
