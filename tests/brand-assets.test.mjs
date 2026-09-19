import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveTechnologyAsset } from '../product-identity/scripts/resolve-technology-asset.mjs';
import {
  catalogCandidates,
  resolveBrandConsensus,
  buildBrandAssetEvidence
} from '../product-identity/scripts/validate-brand-assets.mjs';

test('current lube authority resolves SYNTRAX asset including AVIF', async () => {
  const result = await resolveTechnologyAsset({
    filterType: 'oil',
    catalogTechnology: 'SYNTRAX™'
  });
  assert.equal(result.technology, 'SYNTRAX™');
  assert.equal(result.technology_key, 'SYNTRAX');
  assert.equal(result.technology_asset_path, 'frontend/public/assets/SYNTRAX_final.avif');
});

test('legacy SINTRAX catalog value resolves to current SYNTRAX authority', async () => {
  const result = await resolveTechnologyAsset({
    filterType: 'oil',
    catalogTechnology: 'SINTRAX®'
  });
  assert.equal(result.technology_key, 'SYNTRAX');
});
test('ambiguous SKU matches may lock brand assets only with one family and technology consensus', async () => {
  const resolution = {
    status: 'STOP_REVIEW',
    reason: 'AMBIGUOUS_EXACT_CATALOG_MATCH',
    matches: [
      { sku: 'EL81808', filter_type: 'oil', duty: 'HEAVY_DUTY', catalog_technology: 'SYNTRAX™' },
      { sku: 'EL84005', filter_type: 'oil', duty: 'HEAVY_DUTY', catalog_technology: 'SYNTRAX™' }
    ]
  };
  const candidates = catalogCandidates(resolution);
  const consensus = await resolveBrandConsensus(candidates);
  assert.equal(consensus.filter_type, 'OIL');
  assert.equal(consensus.technology, 'SYNTRAX™');

  const evidence = await buildBrandAssetEvidence({
    manufacturer: 'FLEETGUARD',
    competitorCode: 'LF691A',
    catalogResolution: resolution,
    consensus
  });
  assert.equal(evidence.brand_identity_status, 'PASS');
  assert.equal(evidence.canonical_sku_resolved, false);
  assert.deepEqual(evidence.candidate_skus, ['EL81808', 'EL84005']);
  assert.match(evidence.logo_asset_sha256, /^[a-f0-9]{64}$/);
  assert.match(evidence.technology_asset_sha256, /^[a-f0-9]{64}$/);
});
test('brand asset gate fails closed when catalog candidates disagree on family', async () => {
  await assert.rejects(
    resolveBrandConsensus([
      { sku: 'A', filter_type: 'oil', catalog_technology: 'SYNTRAX™' },
      { sku: 'B', filter_type: 'fuel', catalog_technology: 'SYNTAPORE™' }
    ]),
    /STOP_BRAND_ASSET_FILTER_TYPE_CONFLICT/
  );
});

test('HYDRACORE legacy alias resolves to current HYDROCORE authority', async () => {
  const result = await resolveTechnologyAsset({
    filterType: 'fuel_water_separator',
    catalogTechnology: 'HYDRACORE®'
  });
  assert.equal(result.technology, 'HYDROCORE™');
  assert.equal(result.technology_asset_path, 'frontend/public/assets/HYDROCORE_final.avif');
});