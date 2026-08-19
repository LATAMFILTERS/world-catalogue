'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const technologies = [
  ['MACROCORE', 'macrocore'],
  ['MICROKAPPA', 'microkappa'],
  ['DRYCORE', 'drycore'],
  ['INTEKCORE', 'intekcore'],
  ['SYNTAPORE', 'syntapore'],
  ['HYDROCORE', 'hydrocore'],
  ['SYNTRAX', 'syntrax'],
  ['NANOFORCE', 'nanoforce'],
  ['THERMACORE', 'thermacore'],
];

function read(key) {
  const file = path.join(root, 'elimfilters-vault', '01-technologies', 'active', `${key}.md`);
  assert.ok(fs.existsSync(file), `${key} active citation note must exist`);
  return fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
}

test('all nine core technologies have active citation-grade vault notes', () => {
  for (const [key, slug] of technologies) {
    const note = read(key);
    const frontmatter = note.match(/^---\n([\s\S]*?)\n---/m)?.[1] || '';
    assert.match(frontmatter, /^type:\s*technology\s*$/m, `${key} type must be technology`);
    assert.match(frontmatter, new RegExp(`^key:\\s*${key}\\s*$`, 'm'), `${key} frontmatter key must match file`);
    assert.match(frontmatter, /^status:\s*active\s*$/m, `${key} status must be active`);
    assert.ok(note.includes('## AI Retrieval'), `${key} must include AI Retrieval`);
    assert.ok(note.includes(`CANONICAL KNOWLEDGE BLOCK: ${key}`), `${key} canonical knowledge block must use current key`);
    assert.ok(note.includes('DEFINITION\n'), `${key} must define the technology`);
    assert.ok(note.includes('INDUSTRIAL_ROLE\n'), `${key} must define industrial role`);
    assert.ok(note.includes('CITATION_REFERENCE\n'), `${key} must include citation reference`);
    assert.ok(
      note.includes(`source: https://elimfilters.com/knowledge-center/technologies/${slug}/`),
      `${key} must cite its canonical Knowledge Center technical definition`,
    );
  }
});
