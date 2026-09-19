import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseFleetguardMechanicalSpecs,
  assertCompleteMechanicalSpecs,
  buildMechanicalEvidence,
  completeMechanicalEvidence
} from '../product-identity/scripts/validate-mechanical-reference.mjs';

const sample = [
  'Thread Size\t1.00 1/2-16 UNF 2B',
  'Gasket Inside Diameter\t3.72 inch / 94.49 mm',
  'Largest Outside Diameter\t5.38 inch / 136.61 mm',
  'Gasket Outside Diameter\t4.29 inch / 108.97 mm',
  'Height\t12.19 inch / 309.65 mm'
].join('\n');

test('parses Fleetguard LF691A mechanical specs without inference', () => {
  const specs = parseFleetguardMechanicalSpecs(sample);
  assert.equal(specs.thread_size, '1.00 1/2-16 UNF 2B');
  assert.equal(specs.gasket_inside_diameter, '3.72 inch / 94.49 mm');
  assert.equal(specs.largest_outside_diameter, '5.38 inch / 136.61 mm');
  assert.equal(specs.gasket_outside_diameter, '4.29 inch / 108.97 mm');
  assert.equal(specs.height, '12.19 inch / 309.65 mm');
  assert.equal(assertCompleteMechanicalSpecs(specs), true);
});
test('mechanical evidence hard-locks the mounting face to the fresh source', () => {
  const specs = parseFleetguardMechanicalSpecs(sample);
  const base = buildMechanicalEvidence({
    code: 'LF691A',
    productUrl: 'https://www.fleetguard.com/product/LF691A',
    source: {
      resolved_official_page_url: 'https://www.fleetguard.com/product/LF691A',
      source_image_path: 'source.jpg',
      source_image_sha256: 'a'.repeat(64),
      screenshot_path: 'page.png',
      screenshot_sha256: 'b'.repeat(64)
    },
    specs
  });
  const evidence = completeMechanicalEvidence(base);
  assert.equal(evidence.status, 'PASS');
  assert.equal(evidence.competitor_code, 'LF691A');
  assert.equal(evidence.mechanical_lock.mounting_face_exact_match_required, true);
  assert.equal(evidence.mechanical_lock.central_thread_exact_match_required, true);
  assert.equal(evidence.mechanical_lock.inlet_ports_exact_match_required, true);
  assert.match(evidence.thread_geometry, /1\.00 1\/2-16 UNF 2B/);
});

test('mechanical evidence never leaks another SKU into the active reference', () => {
  const specs = parseFleetguardMechanicalSpecs(sample);
  const base = buildMechanicalEvidence({
    code: 'FF5776',
    productUrl: 'https://www.fleetguard.com/product/FF5776',
    source: {
      resolved_official_page_url: 'https://www.fleetguard.com/product/FF5776',
      source_image_path: 'source.jpg',
      source_image_sha256: 'a'.repeat(64),
      screenshot_path: 'page.png',
      screenshot_sha256: 'b'.repeat(64)
    },
    specs
  });
  const evidence = completeMechanicalEvidence(base);
  const serialized = JSON.stringify(evidence);
  assert.match(serialized, /FF5776/);
  assert.doesNotMatch(serialized, /LF691A/);
});

test('fails closed when an official mechanical field is absent', () => {
  assert.throws(
    () => assertCompleteMechanicalSpecs({ thread_size: '1 1/2-16' }),
    /STOP_MECHANICAL_SPEC_MISSING/
  );
});