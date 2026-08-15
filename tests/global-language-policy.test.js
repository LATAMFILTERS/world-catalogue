'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8').replace(/^\uFEFF/, '');

test('English is the official default and US geolocation resolves to English', () => {
  const geo = read('frontend/src/lib/geoLanguage.ts');
  const i18n = read('frontend/src/i18n.ts');

  assert.match(geo, /const OFFICIAL_LANGUAGE = 'en'/);
  assert.match(geo, /const OFFICIAL_COUNTRY = 'US'/);
  assert.match(geo, /US:\s*'en'/);
  assert.match(i18n, /lng:\s*'en'/);
  assert.match(i18n, /fallbackLng:\s*'en'/);
});

test('geolocation never uses an insecure mixed-content endpoint', () => {
  const geo = read('frontend/src/lib/geoLanguage.ts');
  assert.doesNotMatch(geo, /http:\/\/ip-api\.com/);
  assert.match(geo, /https:\/\/ipwho\.is\//);
});

test('localized bundle loads before language changes', () => {
  const detector = read('frontend/src/components/LanguageDetector.tsx');
  const loadIndex = detector.indexOf('await i18n.loadLanguages(language)');
  const changeIndex = detector.indexOf('await i18n.changeLanguage(language)');
  assert.ok(loadIndex >= 0, 'target locale must be loaded');
  assert.ok(changeIndex > loadIndex, 'language must change only after target locale loads');
});

test('shared page header localizes HOME and canonical section labels', () => {
  const header = read('frontend/src/components/PageHeader.tsx');
  assert.match(header, /useTranslation/);
  assert.match(header, /category\.home/);
  assert.match(header, /contact:\s*'nav\.contact'/);
});

test('global consent banner provides localized copy instead of fixed English UI', () => {
  const banner = read('frontend/src/components/ConsentBanner.tsx');
  assert.match(banner, /const COPY:/);
  assert.match(banner, /es:\s*\{/);
  assert.match(banner, /pt:\s*\{/);
  assert.match(banner, /fr:\s*\{/);
  assert.match(banner, /copy\.decline/);
  assert.match(banner, /copy\.accept/);
});

test('English-only universal navigation cannot be injected into localized pages', () => {
  const nav = read('frontend/src/components/UniversalEndNavigation.tsx');
  assert.match(nav, /language !== 'en'/);
  assert.match(nav, /return null/);
});

test('contact page uses translation keys for its visible editorial content', () => {
  const contact = read('frontend/src/app/contact/page.tsx');
  assert.match(contact, /useTranslation/);
  assert.match(contact, /t\('contact\.heroTag'\)/);
  assert.match(contact, /t\('contact\.heroTitle'\)/);
  assert.match(contact, /t\('contact\.heroDescription'\)/);
  assert.match(contact, /t\('contact\.routingTitle'\)/);
  assert.match(contact, /t\('contact\.sectorsTitle'\)/);
});
