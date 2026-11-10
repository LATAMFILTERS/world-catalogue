'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'server-original.js'), 'utf8');
const mapperStart = source.indexOf('function buildFilterData(row, lang = \'en\'){');
const mapperEnd = source.indexOf('\n// Duplicate status route removed', mapperStart);
const mapper = source.slice(mapperStart, mapperEnd);

test('Part Search mapper declares enrichment before supersession and reference relationships', () => {
  assert.ok(mapperStart >= 0 && mapperEnd > mapperStart, 'product mapper exists');
  const definition = mapper.match(/const enrichment = ([\s\S]*?);/);
  assert.ok(definition, 'enrichment is declared in the product mapper scope');
  assert.ok(mapper.indexOf('const enrichment =') < mapper.indexOf('supersession: enrichment.supersession'), 'declaration precedes use');
  assert.match(mapper, /reference_relationships: enrichment\.reference_relationships/);

  const getEnrichment = new Function('row', 'return (' + definition[1] + ');');
  assert.deepEqual(getEnrichment({}), {});
  assert.deepEqual(getEnrichment({ enrichment_data: null }), {});
  assert.deepEqual(getEnrichment({ enrichment_data: [] }), {});
  const data = { supersession: { replaced_by: 'EA99999' }, reference_relationships: [{ source: 'OEM' }] };
  assert.strictEqual(getEnrichment({ enrichment_data: data }), data);
});
