'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/^\uFEFF/, '');
}

test('client i18n preloads English resources before static rendering', () => {
  const source = read('frontend/src/i18n.ts');
  assert.match(source, /import enTranslation from ['"]\.\.\/public\/locales\/en\/translation\.json['"]/);
  assert.match(source, /resources:\s*\{[\s\S]*?en:\s*\{[\s\S]*?translation:\s*enTranslation/);
  assert.match(source, /partialBundledLanguages:\s*true/);
});

test('contact page remains connected to the shared i18n source', () => {
  const source = read('frontend/src/app/contact/page.tsx');
  assert.match(source, /import ['"]@\/i18n['"]/);
  assert.match(source, /useTranslation\(\)/);
});
