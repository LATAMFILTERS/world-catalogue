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

test('English contact crawler-critical keys resolve to human-readable copy', () => {
  const translation = JSON.parse(read('frontend/public/locales/en/translation.json'));
  const contact = translation.contact;
  assert.ok(contact && typeof contact === 'object', 'English contact translations must exist');

  const required = [
    'heroTag',
    'heroTitle',
    'heroSubtitle',
    'heroDescription',
    'heroCta1',
    'heroCta2',
    'heroCta3',
    'channel1Label',
    'channel1Title',
    'channel1Desc',
    'channel2Label',
    'channel2Title',
    'channel2Desc',
    'channel3Label',
    'channel3Title',
    'channel3Desc',
  ];

  for (const key of required) {
    const value = contact[key];
    assert.equal(typeof value, 'string', `contact.${key} must be a string`);
    assert.ok(value.trim().length > 2, `contact.${key} must contain crawler-visible copy`);
    assert.notEqual(value, `contact.${key}`, `contact.${key} must not resolve to its translation key`);
  }
});
