import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCatalogueCandidates } from '../../scripts/hermes/catalogue-intelligence.mjs';

test('creates a review candidate for a verified new official product', () => {
  const report = buildCatalogueCandidates({
    catalog: { products: [] },
    discoveries: [{
      change_type: 'new_product',
      manufacturer: 'Fleetguard',
      part_number: 'FF-99999',
      product_family: 'fuel_filter',
      source_urls: ['https://example.com/official-product'],
      source_date: '2026-08-04',
      status: 'VERIFIED_OFFICIAL',
      environmental_impact: { waste_impact: 'extended service interval' }
    }]
  });
  assert.equal(report.dry_run, true);
  assert.equal(report.publication_enabled, false);
  assert.equal(report.candidates[0].status, 'REVIEW_REQUIRED');
  assert.equal(report.candidates[0].identity_resolution, 'CATALOGUE_IDENTITY_SEARCH_REQUIRED');
  assert.equal(report.candidates[0].catalogue_comparison.exists, false);
});

test('detects catalogue differences without writing to production', () => {
  const report = buildCatalogueCandidates({
    catalog: { products: [{ brand: 'WIX', part_number: '12345', applications: ['old'] }] },
    discoveries: [{
      change_type: 'application_update',
      manufacturer: 'WIX',
      part_number: '12-345',
      applications: ['old', 'new'],
      source_urls: ['https://example.com/application'],
      source_date: '2026-08-04'
    }]
  });
  assert.equal(report.candidates[0].catalogue_comparison.exists, true);
  assert.equal(report.candidates[0].catalogue_comparison.differences[0].field, 'applications');
  assert.equal(report.candidates[0].status, 'REVIEW_REQUIRED');
});

test('rejects a discovery when it produces no catalogue change', () => {
  const report = buildCatalogueCandidates({
    catalog: { products: [{ brand: 'Baldwin', part_number: 'B2', applications: ['A'] }] },
    discoveries: [{
      change_type: 'application_update',
      manufacturer: 'Baldwin',
      part_number: 'B2',
      applications: ['A'],
      source_urls: ['https://example.com/b2'],
      source_date: '2026-08-04'
    }]
  });
  assert.equal(report.candidates[0].status, 'REJECTED');
  assert.equal(report.candidates[0].rejection_reason, 'No catalogue change detected');
});

test('marks incomplete evidence as insufficient data', () => {
  const report = buildCatalogueCandidates({
    catalog: [],
    discoveries: [{ change_type: 'new_product', manufacturer: 'Cummins', part_number: 'X1' }]
  });
  assert.equal(report.candidates[0].status, 'INSUFFICIENT_DATA');
  assert.ok(report.candidates[0].validation_errors.includes('at least one source_url required'));
});

test('requires approval metadata before publication approval', () => {
  const report = buildCatalogueCandidates({
    catalog: [],
    discoveries: [{
      change_type: 'new_product',
      manufacturer: 'Donaldson',
      part_number: 'P999999',
      source_urls: ['https://example.com/p999999'],
      source_date: '2026-08-04',
      status: 'APPROVED_FOR_PUBLICATION'
    }]
  });
  assert.equal(report.candidates[0].status, 'INSUFFICIENT_DATA');
  assert.ok(report.candidates[0].validation_errors.includes('approval metadata required'));
});

test('reuses existing SKU and preserves applications without inventing a new SKU', () => {
  const report = buildCatalogueCandidates({
    catalog: { products: [{
      sku: 'EF92106', brand: 'Donaldson', part_number: 'P551210',
      source_identity:{canonical_source_brand:'Donaldson',canonical_source_code:'P551210',canonical_source_status:'VERIFIED'}, dimensions:{height_mm:100},
      applications: [{ make: 'Kubota', model: 'RTV-X1100' }]
    }] },
    discoveries: [{
      change_type: 'new_product', manufacturer: 'Donaldson', part_number: 'P551210',
      source_identity:{canonical_source_brand:'Donaldson',canonical_source_code:'P551210',canonical_source_status:'VERIFIED'}, dimensions:{height_mm:100},
      applications: [{ make: 'Kubota', model: 'RTV-X900' }],
      source_urls: ['https://example.com/verified-fitment'],
      source_date: '2026-10-18', status: 'VERIFIED_OFFICIAL'
    }]
  });
  const candidate = report.candidates[0];
  assert.equal(candidate.existing_sku, 'EF92106');
  assert.equal(candidate.change_type, 'application_update');
  assert.equal(candidate.status, 'REVIEW_REQUIRED');
  assert.equal(candidate.applications.length, 2);
  assert.equal(candidate.catalogue_comparison.differences[0].field, 'applications');
  assert.equal(report.publication_enabled, false);
});

test('repeated application produces no duplicate or publication', () => {
  const application = { make: 'Kubota', model: 'RTV-X900' };
  const report = buildCatalogueCandidates({
    catalog: { products: [{sku: 'EF92106',brand:'Donaldson',part_number:'P551210',source_identity:{canonical_source_brand:'Donaldson',canonical_source_code:'P551210',canonical_source_status:'VERIFIED'}, dimensions:{height_mm:100},applications:[application]}] },
    discoveries: [{
      change_type: 'new_product',manufacturer:'Donaldson',part_number:'P551210',source_identity:{canonical_source_brand:'Donaldson',canonical_source_code:'P551210',canonical_source_status:'VERIFIED'}, dimensions:{height_mm:100},
      applications:[application],source_urls:['https://example.com/evidence'],source_date:'2026-10-18'
    }]
  });
  assert.equal(report.candidates[0].status, 'REJECTED');
  assert.equal(report.candidates[0].applications.length, 1);
});

test('technical conflict blocks automatic application enrichment', () => {
  const report = buildCatalogueCandidates({
    catalog: { products: [{sku:'EA10001',brand:'Donaldson',part_number:'P1234',
      dimensions:{height_mm:100},applications:['existing']}] },
    discoveries: [{
      change_type:'new_product',manufacturer:'Donaldson',part_number:'P1234',
      dimensions:{height_mm:120},applications:['new'],
      source_urls:['https://example.com/conflict'],source_date:'2026-10-18'
    }]
  });
  assert.equal(report.candidates[0].identity_resolution, 'IDENTITY_CONFLICT_OR_CROSS_REVIEW');
  assert.equal(report.candidates[0].status, 'REVIEW_REQUIRED');
  assert.deepEqual(report.candidates[0].applications, ['new']);
});

test('OEM and competitor code collision cannot silently mint SKU', () => {
  const report = buildCatalogueCandidates({
    catalog:{products:[{sku:'EL8490', brand:'ELIMFILTERS',part_number:'EL8490',
      oem_codes:[{manufacturer:'Kubota',code:'HH150-32430'}],
      dimensions:{height_mm:100},product_family:'oil_filter'}]},
    discoveries:[{change_type:'new_product',manufacturer:'Kubota',part_number:'HH15032430',
      dimensions:{height_mm:100},product_family:'oil_filter',
      source_urls:['https://example.com/oem'],source_date:'2026-10-18',status:'VERIFIED_OFFICIAL'}]
  });
  assert.equal(report.candidates[0].identity_resolution, 'IDENTITY_CONFLICT_OR_CROSS_REVIEW');
  assert.deepEqual(report.candidates[0].possible_existing_skus,['EL8490']);
  assert.equal(report.candidates[0].status,'REVIEW_REQUIRED');
  assert.equal(report.publication_enabled,false);
});

test('verified canonical source and compatible dimensions identify original SKU', () => {
  const identity={canonical_source_brand:'Donaldson',canonical_source_code:'P550490',canonical_source_status:'VERIFIED'};
  const report=buildCatalogueCandidates({
    catalog:{products:[{sku:'EL8490',brand:'ELIMFILTERS',part_number:'EL8490',
      source_identity:identity,dimensions:{height_mm:100},applications:[{make:'Kubota',model:'A'}]}]},
    discoveries:[{change_type:'new_product',manufacturer:'Donaldson',part_number:'P550490',
      source_identity:identity,dimensions:{height_mm:100},applications:[{make:'Kubota',model:'B'}],
      source_urls:['https://example.com/oem'],source_date:'2026-10-18',status:'VERIFIED_OFFICIAL'}]
  });
  assert.equal(report.candidates[0].existing_sku,'EL8490');
  assert.equal(report.candidates[0].change_type,'application_update');
  assert.equal(report.candidates[0].applications.length,2);
  assert.equal(report.candidates[0].status,'REVIEW_REQUIRED');
});
