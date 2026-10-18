'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const PRIMARY_PROJECTION = "COALESCE(((c.enrichment_data -> 'codigo_base_governance'::text) ->> 'primary_manufacturer_verified'::text)::boolean, false) AS manufacturer_verified";
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');

// Generates SELECT-only review material. This module never connects to a DB,
// installs a view, approves evidence, changes governance, or certifies products.
// Callers must first validate current governance and exact official evidence.
function buildCaseBoundResolverPreview(definition, manifest) {
  assert.equal(typeof definition, 'string');
  assert.ok(Array.isArray(manifest) && manifest.length > 0 && manifest.length <= 200);
  const original = definition.trim().replace(/;$/, '');
  assert.ok(/^WITH\s/i.test(original), 'Expected the existing resolver SELECT');
  assert.ok(!original.includes(';'), 'Multiple statements are forbidden');
  assert.ok(!/\b(create|alter|drop|insert|update|delete|truncate|copy|call|do|grant|revoke)\b/i.test(original), 'Read-only SELECT required');
  assert.equal(original.split(PRIMARY_PROJECTION).length, 2, 'Unexpected resolver projection; review the new definition');
  const skus = new Set(), codes = new Set();
  for (const entry of manifest) {
    assert.ok(entry && /^[A-Z0-9]+$/.test(entry.sku), 'Unsafe SKU');
    assert.ok(/^[A-Z0-9]+$/.test(entry.base), 'Unsafe complete base');
    // PostgreSQL built-in md5 is an equality/change detector, not evidence
    // authentication. SHA256 authenticates the archived input/output artifacts.
    assert.ok(/^[a-f0-9]{32}$/.test(entry.fingerprint), 'Invalid full-row fingerprint');
    assert.ok(!skus.has(entry.sku) && !codes.has(entry.base), 'Duplicate manifest identity');
    skus.add(entry.sku); codes.add(entry.base);
  }
  const values = manifest.map(e => `('${e.sku}','${e.base}','${e.fingerprint}')`).join(',');
  const replacement = `(COALESCE(((c.enrichment_data -> 'codigo_base_governance'::text) ->> 'primary_manufacturer_verified'::text)::boolean, false) OR EXISTS (SELECT 1 FROM (VALUES ${values}) reviewed(sku,base,fingerprint) WHERE reviewed.sku=c.sku::text AND reviewed.base=c.codigo_base::text AND reviewed.fingerprint=md5(to_jsonb(c)::text))) AS manufacturer_verified`;
  const sql = original.replace(PRIMARY_PROJECTION, replacement);
  return { sql, definitionSha256: sha256(definition), previewSha256: sha256(sql), cases: manifest.length };
}
module.exports = { buildCaseBoundResolverPreview };