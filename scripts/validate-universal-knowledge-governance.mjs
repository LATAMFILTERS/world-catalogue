#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd().endsWith(`${path.sep}frontend`)
  ? path.resolve(process.cwd(), '..')
  : process.cwd();
const frontendRoot = path.join(root, 'frontend');
const outputMode = process.argv.includes('--out');
const violations = [];
const sourceSignatures = [
  /\bFRAM\b/i,
  /fram\.com/i,
  /\bfram_ld_\d+\b/i,
];
const privateImports = [
  /fram-automotive-source-corpus/i,
  /automotive-evidence-profile/i,
  /hermes\/structured-knowledge/i,
  /hermes\/automotive-source-cache/i,
];

// Competitor names may appear where their explicit purpose is part-number
// identification/trademark disclosure. That is catalog navigation, not a
// knowledge source. Private HERMES imports remain forbidden there as well.
function isIdentificationOnlyPath(file) {
  const rel = path.relative(frontendRoot, file).replaceAll('\\', '/').toLowerCase();
  return rel.includes('src/app/legal/cross-reference/') ||
    rel.includes('src/app/search/') ||
    rel.includes('out/legal/cross-reference/') ||
    rel.includes('out/search/');
}

function walk(dir, allowedExts, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, allowedExts, files);
    else if (allowedExts.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

function scan(file, patterns, reason) {
  const text = fs.readFileSync(file, 'utf8');
  for (const pattern of patterns) {
    if (pattern.test(text)) violations.push(`${path.relative(root, file)} :: ${reason}: ${pattern}`);
  }
}

if (!outputMode) {
  const sourceExts = new Set(['.ts', '.tsx', '.js', '.jsx']);
  const publicSourceRoots = [
    path.join(frontendRoot, 'src', 'app'),
    path.join(frontendRoot, 'src', 'components'),
    path.join(frontendRoot, 'src', 'lib', 'knowledge-center'),
  ];
  const files = publicSourceRoots.flatMap((dir) => walk(dir, sourceExts));
  for (const file of files) {
    if (!isIdentificationOnlyPath(file)) {
      scan(file, sourceSignatures, 'external evidence signature in public knowledge/frontend source');
    }
    scan(file, privateImports, 'direct import/reference to private HERMES evidence layer');
  }
  console.log(`[universal-knowledge-governance] source coverage=${files.length} public frontend files`);
} else {
  const outDir = path.join(frontendRoot, 'out');
  if (!fs.existsSync(outDir)) {
    console.log('[universal-knowledge-governance] frontend/out not found; skipping output scan');
    process.exit(0);
  }
  const publicExts = new Set(['.html', '.json', '.xml', '.txt']);
  const files = walk(outDir, publicExts);
  for (const file of files) {
    if (!isIdentificationOnlyPath(file)) {
      scan(file, sourceSignatures, 'external evidence signature in built public knowledge output');
    }
  }
  console.log(`[universal-knowledge-governance] output coverage=${files.length} public artifacts`);
}

if (violations.length) {
  console.error('[universal-knowledge-governance] FAILED');
  for (const violation of violations) console.error(` - ${violation}`);
  process.exit(1);
}

console.log(`[universal-knowledge-governance] PASS mode=${outputMode ? 'out' : 'source'}`);
