const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'server-original.js'), 'utf8');

test('production Search HTTP mutation routes fail closed by default', () => {
  const gate = source.indexOf("app.use(['/api/import', '/api/admin']");
  const firstImport = source.indexOf("app.post('/api/import/donaldson'");
  const firstAdminMutation = source.indexOf("app.post('/api/admin/rename-sku'");
  assert.ok(gate >= 0, 'catalog mutation gate must exist');
  assert.ok(firstImport > gate, 'import routes must be behind mutation gate');
  assert.ok(firstAdminMutation > gate, 'admin mutation routes must be behind mutation gate');
  assert.match(source, /ELIM_CATALOG_MUTATION_API_ENABLED/);
  assert.match(source, /CATALOG_MUTATION_API_DISABLED/);
});
