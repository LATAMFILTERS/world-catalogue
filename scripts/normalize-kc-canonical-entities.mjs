import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'frontend', 'out');
const TARGET_FAMILIES = '(?:glossary|diagrams|engineering-reference|standards)';

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

// The route may sit in plain HTML ("...") or inside the JSON-escaped Next.js payload
// (self.__next_f.push([1,"...\"url\"..."])). A backslash can therefore never be part of the
// slug, and the closing quote may be preceded by one: otherwise the trailing slash is appended
// after the backslash (url\/") and the payload stops being valid JavaScript, so the page does
// not hydrate.
const SLUG = `[^/\\\\\\s"'<>?#]+`;
const ENDS = `(?=([?#][^"'<>\\\\\\s]*)?\\\\?["'<>\\s])`;
const absoluteRoute = new RegExp(
  `(https://elimfilters\\.com/knowledge-center/${TARGET_FAMILIES}/${SLUG})${ENDS}`,
  'g',
);
const relativeRoute = new RegExp(
  `(/knowledge-center/${TARGET_FAMILIES}/${SLUG})${ENDS}`,
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
