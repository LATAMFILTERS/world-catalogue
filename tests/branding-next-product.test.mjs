import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveNextSequenceProduct,
  sourceCodeFromMaster,
  approvalStateFromMaster,
  pilotPositionFromMaster
} from '../product-identity/scripts/resolve-next-branding-product.mjs';

const codes = [
  'LF14000NN', 'LF3970', 'LF9009', 'LF3620', 'LF670',
  'LF691A', 'LF667', 'LF16015', 'LF777', 'LF3000'
];

const master = (position, code, sku = `EL${position}`) => ({
  sku,
  pilotPosition: `${position}/20`,
  sourceCrossReference: { partNumber: code },
  visualMaster: { status: 'FINAL_APPROVED' }
});

test('normalizes legacy production-master shapes', () => {
  const value = {
    sku: 'EL83000',
    technical_source: { cross_reference: { code: 'LF9009' } },
    media: { approval_state: 'FINAL_APPROVED', pilot_position: '3/20' }
  };
  assert.equal(sourceCodeFromMaster(value), 'LF9009');
  assert.equal(approvalStateFromMaster(value), 'FINAL_APPROVED');
  assert.deepEqual(pilotPositionFromMaster(value), { position: 3, total: 20 });
});
test('selects first unapproved product after contiguous approved prefix', () => {
  const result = deriveNextSequenceProduct({
    orderedCodes: codes,
    masters: codes.slice(0, 5).map((code, index) => master(index + 1, code)),
    targetCount: 10
  });

  assert.equal(result.status, 'REFERENCE_SELECTED');
  assert.equal(result.completed_prefix, 5);
  assert.equal(result.next.position, 6);
  assert.equal(result.next.competitor_code, 'LF691A');
  assert.equal(result.next.product_url, 'https://www.fleetguard.com/product/LF691A');
});

test('fails closed when current official order breaks approved continuity', () => {
  const changed = [...codes];
  changed[2] = 'LF99999';
  assert.throws(
    () => deriveNextSequenceProduct({
      orderedCodes: changed,
      masters: codes.slice(0, 5).map((code, index) => master(index + 1, code)),
      targetCount: 10
    }),
    /STOP_SEQUENCE_CONTINUITY_MISMATCH:3:LF9009:LF99999/
  );
});

test('reports completed pilot when all target positions are approved', () => {
  const result = deriveNextSequenceProduct({
    orderedCodes: codes,
    masters: codes.map((code, index) => master(index + 1, code)),
    targetCount: 10
  });
  assert.equal(result.status, 'PILOT_SEQUENCE_COMPLETE');
  assert.equal(result.next, null);
});