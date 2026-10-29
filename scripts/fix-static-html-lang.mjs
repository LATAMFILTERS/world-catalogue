#!/usr/bin/env node
// Make the exported document language correct in the first HTTP response,
// independently of JavaScript execution or hydration.
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve(process.argv[2] || path.join(import.meta.dirname, '..', 'frontend', 'out'));
const targets = [['es', 'es'], ['pt', 'pt-BR']];
let checked = 0;
let changed = 0;

function visit(directory, language) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const location = path.join(directory, entry.name);
    if (entry.isDirectory()) { visit(location, language); continue; }
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    const html = fs.readFileSync(location, 'utf8');
    const open = html.match(/<html\b[^>]*>/i);
    if (!open) throw new Error('Missing html root: ' + location);
    const lang = open[0].match(/\blang=(["'])([^"']+)\1/i);
    if (!lang) throw new Error('Missing html lang: ' + location);
    if (lang[2] !== 'en' && lang[2] !== language) {
      throw new Error('Unexpected initial language ' + lang[2] + ': ' + location);
    }
    const updatedTag = open[0].replace(/\blang=(["'])([^"']+)\1/i, 'lang="' + language + '"');
    const updated = html.slice(0, open.index) + updatedTag + html.slice(open.index + open[0].length);
    if (updated !== html) {
      fs.writeFileSync(location, updated, 'utf8');
      changed++;
    }
    checked++;
  }
}
for (const [prefix, language] of targets) {
  const directory = path.join(out, prefix);
  if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
    throw new Error('Missing localized export directory: ' + directory);
  }
  const before = checked;
  visit(directory, language);
  if (before === checked) throw new Error('No exported HTML found for /' + prefix + '/');
}
console.log(JSON.stringify({ status: 'PASS', checked, changed, languages: ['es', 'pt-BR'] }));
