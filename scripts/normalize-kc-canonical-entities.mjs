import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'frontend', 'out');
const TARGET_FAMILIES = '(?:glossary|diagrams|engineering-reference)';

if (!fs.existsSync(out)) {
  console.error('[normalize-kc-canonical-entities] frontend/out is missing');
  process.exit(1);
}

const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}
walk(path.join(out, 'knowledge-center'));

const absoluteRoute = new RegExp(
  `(https://elimfilters\\.com/knowledge-center/${TARGET_FAMILIES}/[^/\\s"'<>?#]+)(?=([?#][^"'<>\\s]*)?["'<>\\s])`,
  'g',
);
const relativeRoute = new RegExp(
  `(/knowledge-center/${TARGET_FAMILIES}/[^/\\s"'<>?#]+)(?=([?#][^"'<>\\s]*)?["'<>\\s])`,
  'g',
);

let changedFiles = 0;
let replacements = 0;

for (const file of htmlFiles) {
  const original = fs.readFileSync(file, 'utf8');
  let html = original;

  html = html.replace(absoluteRoute, (match) => {
    replacements += 1;
    return `${match}/`;
  });
  html = html.replace(relativeRoute, (match) => {
    replacements += 1;
    return `${match}/`;
  });

  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    changedFiles += 1;
  }
}

console.log(`[normalize-kc-canonical-entities] PASS — ${replacements} URL occurrence(s) normalized across ${changedFiles} HTML file(s)`);
