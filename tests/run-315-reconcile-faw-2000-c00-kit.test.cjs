'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildReference, plan } = require('../scripts/migrations/run_315_reconcile_faw_2000_c00_kit.js');

test('adds only the verified MANN service-pack reference to the kit', () => {
  const patch = plan({ competitor_codes: [{ manufacturer: 'HENGST', code: 'E1895L' }] });
  assert.equal(patch.competitor_codes.length, 2);
  const added = patch.competitor_codes[1];
  assert.equal(added.code, 'SP 2652-2');
  assert.equal(added.product_role, 'KIT');
  assert.deepEqual(added.kit_components, ['EA17800', 'EA16229']);
  assert.match(added.evidence_hash, /^[a-f0-9]{64}$/);
});

test('is idempotent and never adds blocked candidates', () => {
  assert.equal(plan({ competitor_codes: [buildReference()] }), null);
  const serialized = JSON.stringify(buildReference());
  for (const blocked of ['R005061', 'P641356', 'AA90179', 'CK4945', '1109060/70-2000-C00']) {
    assert.equal(serialized.includes(blocked), false);
  }
});
