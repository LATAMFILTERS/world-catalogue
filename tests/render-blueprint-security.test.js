'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const render = fs.readFileSync('render.yaml', 'utf8');

const requiredRedirects = new Map([
  ['/es/productos', '/families/'],
  ['/es/transporte', '/industries/truck-fleets/'],
  ['/manufacturing-industrial', '/industries/manufacturing/'],
  ['/premium-preview', '/technologies/'],
]);

const sensitiveKeys = [
  'KNOWLEDGE_API_KEYS',
  'KNOWLEDGE_CENTER_API_KEY',
  'ENGINE_API_KEY',
  'AZURE_CLIENT_SECRET',
  'OUTLOOK_SMTP_PASSWORD',
  'NVIDIA_NIM_API_KEY',
  'LINKEDIN_CLIENT_SECRET',
  'LINKEDIN_VERIFY_TOKEN',
  'WHATSAPP_ACCESS_TOKEN',
  'WHATSAPP_VERIFY_TOKEN',
  'WHATSAPP_APP_SECRET',
  'INSTAGRAM_ACCESS_TOKEN',
  'INSTAGRAM_VERIFY_TOKEN',
  'INSTAGRAM_APP_SECRET',
  'YOUTUBE_API_KEY',
  'YOUTUBE_VERIFY_TOKEN',
  'BOT_PROTOCOL_API_KEY',
];

test('Render blueprint contains canonical legacy redirects', () => {
  for (const [source, destination] of requiredRedirects) {
    const pattern = new RegExp(`source:\\s*${source.replaceAll('/', '\\/')}[\\s\\S]{0,100}?destination:\\s*${destination.replaceAll('/', '\\/')}`);
    assert.match(render, pattern, `Missing redirect ${source} -> ${destination}`);
  }
});

test('Render blueprint does not redeploy retired Phase 5A portal', () => {
  assert.doesNotMatch(render, /name:\s*phase5a-portal\b/);
  assert.doesNotMatch(render, /phase5a-server\.js/);
});

test('sensitive Render variables are never committed with inline values', () => {
  for (const key of sensitiveKeys) {
    const block = new RegExp(`- key:\\s*${key}\\s*\\n(?:\\s+[^\\n]+\\n){0,3}`, 'g');
    for (const match of render.matchAll(block)) {
      assert.doesNotMatch(match[0], /\n\s+value:\s*\S+/, `${key} must use Render secret management, not an inline value`);
      assert.match(match[0], /\n\s+sync:\s*false\b/, `${key} must be declared with sync: false`);
    }
  }
});
