'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'server-original.js'), 'utf8');

test('GET /api/kits treats only the absent suggested-addons relation as optional', () => {
  const routeStart = source.indexOf("app.get('/api/kits/:kit_sku'");
  const routeEnd = source.indexOf("app.post('/api/kits/:kit_sku/suggested-addons'", routeStart);
  assert.notEqual(routeStart, -1);
  assert.notEqual(routeEnd, -1);
  const route = source.slice(routeStart, routeEnd);

  assert.match(route, /to_regclass\('public\.kit_suggested_addons'\)/);
  assert.match(route, /let addons = \{ rows: \[\] \}/);
  assert.match(route, /if \(addonsRelation\.rows\[0\]\?\.relation\)/);
  assert.match(route, /suggested_addons: addons\.rows\.map/);
  assert.doesNotMatch(route, /e\.code\s*===\s*['"]42P01['"]/);
});
