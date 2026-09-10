'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('world-catalogue owns native technical notifications', () => {
  const source = read('lib/notification-events.js');
  for (const type of ['CATALOG_GAP','TECHNOLOGY_CONFLICT','PART_SEARCH_ERROR','SITE_HEALTH','KNOWLEDGE_REVIEW','NODAL_REVIEW']) {
    assert.match(source, new RegExp(type));
  }
});

test('world health watcher uses local native notification center, not ntfy', () => {
  const source = read('deploy/lenovo/watch-world-health.ps1');
  assert.match(source, /127\.0\.0\.1:8791\/api\/notifications/);
  assert.doesNotMatch(source, /https:\/\/ntfy\.sh/);
  assert.doesNotMatch(source, /NTFY_TOPIC/);
});

test('world notification center is separate from CRM storage', () => {
  const migration = read('scripts/migrations/run_102_native_notifications.js');
  assert.match(migration, /system_notifications/);
  assert.match(migration, /WORLD_CATALOGUE/);
  assert.doesNotMatch(migration, /elimfilters_crm/);
});
