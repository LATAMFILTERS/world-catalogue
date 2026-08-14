'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/^\uFEFF/, '');
}

test('client i18n preloads governed English resources before static rendering', () => {
  const source = read('frontend/src/i18n.ts');
  assert.match(source, /import enTranslation from ['"]\.\.\/public\/locales\/en\/translation\.json['"]/);
  assert.match(source, /const governedEnTranslation = cloneTranslation\(enTranslation\)/);
  assert.match(source, /for \(const \[key, value\] of Object\.entries\(GOVERNED_EN_OVERRIDES\)\)/);
  assert.match(source, /resources:\s*\{[\s\S]*?en:\s*\{[\s\S]*?translation:\s*governedEnTranslation/);
  assert.match(source, /partialBundledLanguages:\s*true/);
});

test('default-locale strategic governance replaces unsupported home claims before init', () => {
  const source = read('frontend/src/i18n.ts');
  const requiredOverrides = [
    'home.economicStats.0.value',
    'home.economicStats.1.value',
    'home.economicStats.2.value',
    'home.problemIntro',
    'home.problemBadgeNum',
    'home.whyP2',
    'home.whyCheckItems.1',
    'home.whyCardItems.3',
    'home.techItems.0.desc',
    'home.sciDesc',
    'home.llmP1',
    'home.llmP2',
  ];

  for (const key of requiredOverrides) {
    assert.ok(source.includes(`'${key}'`), `${key} must be governed before i18n initialization`);
  }
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
