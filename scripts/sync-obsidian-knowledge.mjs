#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const vaultRoot = path.resolve(root, process.env.OBSIDIAN_VAULT_PATH || 'elimfilters-vault');
const outputDir = path.join(root, 'knowledge', 'generated', 'digital-brain', 'obsidian');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '.obsidian' || entry.name === '.git') return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : /\.(md|markdown)$/i.test(entry.name) ? [full] : [];
  });
}

if (!fs.existsSync(vaultRoot)) {
  console.log(`[obsidian-sync] vault not found at ${vaultRoot}; skipping`);
  process.exit(0);
}

const files = walk(vaultRoot);
const records = files.map((file) => {
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const relative = path.relative(vaultRoot, file).replaceAll('\\', '/');
  const title = text.match(/^#\s+(.+)$/m)?.[1]?.trim() || path.basename(file, path.extname(file));
  const links = [...text.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g)].map((match) => match[1].trim());
  return {
    path: relative,
    title,
    bytes: Buffer.byteLength(text, 'utf8'),
    sha256: crypto.createHash('sha256').update(text).digest('hex'),
    wikilinks: [...new Set(links)].sort()
  };
});

const knownTitles = new Set(records.map((record) => record.title.toLowerCase()));
const unresolvedLinks = [];
for (const record of records) {
  for (const link of record.wikilinks) {
    if (!knownTitles.has(link.toLowerCase())) unresolvedLinks.push({ source: record.path, target: link });
  }
}

fs.mkdirSync(outputDir, { recursive: true });
const index = {
  schema_version: '1.0.0',
  generated_at: new Date().toISOString(),
  vault_path: path.relative(root, vaultRoot).replaceAll('\\', '/'),
  document_count: records.length,
  unresolved_link_count: unresolvedLinks.length,
  documents: records,
  unresolved_links: unresolvedLinks
};
fs.writeFileSync(path.join(outputDir, 'obsidian-index.json'), JSON.stringify(index, null, 2) + '\n', 'utf8');
console.log(`[obsidian-sync] indexed ${records.length} document(s); ${unresolvedLinks.length} unresolved wikilink(s)`);
