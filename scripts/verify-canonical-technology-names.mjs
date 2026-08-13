import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const excludedDirs = new Set(['.git', 'node_modules', '.next', 'dist', 'build', 'coverage']);
const textExtensions = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.json', '.md', '.txt', '.xml', '.sql', '.yml', '.yaml', '.toml', '.html', '.css']);

const retired = [
  ['cool', 'tech'],
  ['hydro', 'core'],
  ['synte', 'pore'],
  ['synte', 'for'],
  ['turbo', 'cor'],
  ['aqua', 'guard'],
  ['dura', 'tech'],
].map((parts) => parts.join('').toLowerCase());

const findings = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!textExtensions.has(path.extname(entry.name).toLowerCase())) continue;
    const relative = path.relative(root, full).replaceAll('\\', '/');
    const body = fs.readFileSync(full, 'utf8').toLowerCase();
    for (const token of retired) {
      if (body.includes(token) || relative.toLowerCase().includes(token)) {
        findings.push(relative);
        break;
      }
    }
  }
}

walk(root);

if (findings.length) {
  console.error('Canonical technology-name guard failed. Retired nomenclature detected in:');
  for (const file of [...new Set(findings)].sort()) console.error(`- ${file}`);
  process.exit(1);
}

console.log('Canonical technology-name guard passed.');
