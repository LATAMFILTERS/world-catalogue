import fs from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(process.cwd(), '..');
const CITATION_DIR = path.join(PROJECT_ROOT, 'frontend', 'public', 'api', 'citation');
const META_DIR = path.join(PROJECT_ROOT, 'elimfilters-vault', '00-meta');

function getAllFiles(dir, basePath = '') {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const relPath = basePath ? `${basePath}/${entry.name}` : entry.name;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, relPath));
    } else {
      files.push(relPath.replaceAll('\\', '/'));
    }
  }
  return files;
}

function main() {
  console.log('CITATION TRACKING GUARD — Phase E');
  console.log('===================================');

  if (!fs.existsSync(CITATION_DIR)) {
    console.error('\nERRORS');
    console.error('- Citation output directory does not exist');
    process.exit(1);
  }

  const citationFiles = getAllFiles(CITATION_DIR);
  const indexFile = path.join(META_DIR, 'CITATION_INDEX.json');
  
  if (!fs.existsSync(indexFile)) {
    console.error('\nERRORS');
    console.error('- CITATION_INDEX.json not found');
    process.exit(1);
  }

  const indexMtime = fs.statSync(indexFile).mtimeMs;
  let hasError = false;
  let hasWarning = false;

  if (!citationFiles.length) {
    console.error('\nERRORS');
    console.error('- No files in citation output directory');
    hasError = true;
  } else {
    console.log(`Files in citation output: ${citationFiles.length}`);
  }

  // Check for stale files (modified before CITATION_INDEX.json)
  const staleFiles = [];
  for (const f of citationFiles) {
    const fullPath = path.join(CITATION_DIR, f);
    const stat = fs.statSync(fullPath);
    if (stat.mtimeMs < indexMtime - 5000) {
      staleFiles.push(f);
    }
  }

  if (staleFiles.length) {
    console.warn('\nWARNINGS');
    console.warn(`- ${staleFiles.length} citation file(s) older than CITATION_INDEX.json:`);
    for (const f of staleFiles.slice(0, 5)) console.warn(`  ${f}`);
    if (staleFiles.length > 5) console.warn(`  ... and ${staleFiles.length - 5} more`);
    hasWarning = true;
  }

  // Verify expected structure: path/, type/, index.json, graph.json, and entity JSON files at root
  const hasPathDir = fs.existsSync(path.join(CITATION_DIR, 'path'));
  const hasTypeDir = fs.existsSync(path.join(CITATION_DIR, 'type'));
  const hasIndexFile = citationFiles.some(f => f === 'index.json');
  const hasGraphFile = citationFiles.some(f => f === 'graph.json');
  const rootJsonFiles = citationFiles.filter(f => !f.includes('/') && f.endsWith('.json'));
  const hasEntities = rootJsonFiles.length >= 10; // At least 10 entity files at root

  if (!hasPathDir || !hasTypeDir || !hasIndexFile || !hasGraphFile || !hasEntities) {
    console.error('\nERRORS');
    console.error('- Citation API structure incomplete');
    if (!hasPathDir) console.error('  Missing: path/ directory');
    if (!hasTypeDir) console.error('  Missing: type/ directory');
    if (!hasIndexFile) console.error('  Missing: index.json');
    if (!hasGraphFile) console.error('  Missing: graph.json');
    if (!hasEntities) console.error(`  Missing: entity JSON files at root (found ${rootJsonFiles.length})`);
    hasError = true;
  }

  if (!hasError) {
    if (hasWarning) {
      console.log('\nRESULT: PASS — citation output exists and is structurally valid (with stale-file warnings)');
    } else {
      console.log('\nRESULT: PASS — citation output is fresh, complete, and structurally valid');
    }
  } else {
    console.log('\nRESULT: FAIL');
    process.exit(1);
  }
}

main();