import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOfficialCatalogueEvidence } from '../../scripts/hermes/official-catalogue-evidence.mjs';

const organizations = [{
  id: 'volvo_trucks', name: 'Volvo Trucks', category: 'oem_heavy_duty',
  official_domain: 'https://www.volvotrucks.com'
}];
const base = {
  organization_id: 'volvo_trucks', source_type: 'oem_catalogue',
  source_url: 'https://parts.volvotrucks.com/catalogue/filter-1',
  source_hash: 'a'.repeat(64), captured_at: '2026-08-11T00:00:00.000Z',
  change_type: 'new_product', manufacturer: 'Volvo', part_number: '21707132', product_family: 'oil_filter'
};

test('accepts registered official subdomains as primary evidence requiring review', () => {
  const report = buildOfficialCatalogueEvidence([base], organizations);
  assert.equal(report.summary.official_discoveries, 1);
  assert.equal(report.discoveries[0].evidence_level, 'PRIMARY');
  assert.equal(report.discoveries[0].workflow_status, 'PENDING_REVIEW');
  assert.equal(report.discoveries[0].automatic_publication_allowed, false);
  assert.equal(report.publication_enabled, false);
});

test('rejects lookalike and non-HTTPS domains', () => {
  const lookalike = buildOfficialCatalogueEvidence([{ ...base, source_url: 'https://volvotrucks.com.example.org/item' }], organizations);
  const insecure = buildOfficialCatalogueEvidence([{ ...base, source_url: 'http://www.volvotrucks.com/item' }], organizations);
  assert.equal(lookalike.summary.rejected, 1);
  assert.equal(insecure.summary.rejected, 1);
});

test('application claims missing make or model require research', () => {
  const report = buildOfficialCatalogueEvidence([{ ...base, change_type: 'application_update', applications: [{ make: 'Volvo' }] }], organizations);
  assert.equal(report.discoveries[0].workflow_status, 'NEEDS_RESEARCH');
  assert.match(report.discoveries[0].research_reasons.join(' '), /make and model/);
});

test('rejects unknown organizations and duplicate evidence', () => {
  const unknown = buildOfficialCatalogueEvidence([{ ...base, organization_id: 'invented' }], organizations);
  const duplicate = buildOfficialCatalogueEvidence([base, base], organizations);
  assert.equal(unknown.summary.rejected, 1);
  assert.equal(duplicate.summary.official_discoveries, 1);
  assert.equal(duplicate.summary.rejected, 1);
});

test('rejects OEM and aftermarket category cross-classification', () => {
  const wrongAftermarket = buildOfficialCatalogueEvidence([{ ...base, source_type: 'aftermarket_catalogue' }], organizations);
  const competitorOrganizations = [{
    id: 'donaldson', name: 'Donaldson', category: 'filtration_competitor', official_domain: 'https://www.donaldson.com'
  }];
  const wrongOem = buildOfficialCatalogueEvidence([{
    ...base, organization_id: 'donaldson', source_type: 'oem_catalogue', source_url: 'https://www.donaldson.com/item'
  }], competitorOrganizations);
  assert.match(wrongAftermarket.rejected[0].errors.join(' '), /filtration_competitor/);
  assert.match(wrongOem.rejected[0].errors.join(' '), /OEM organization/);
});
