import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCataloguePublicationPlan } from '../../scripts/hermes/catalogue-publication-plan.mjs';

function fixture() {
  const id = 'HERMES_BUNDLE_ABC123';
  return {
    bundle: {
      research_bundle_id: id,
      knowledge_candidate: { research_bundle_id: id, workflow_status: 'APPROVED', approval_required: true, approved_by: 'Victor Abreu', approved_at: '2026-08-11T12:00:00Z' },
      catalogue_candidate: {
        research_bundle_id: id, status: 'APPROVED_FOR_PUBLICATION', change_type: 'application_update',
        approval: { approved_by: 'Victor Abreu', approved_at: '2026-08-11T12:01:00Z', approved_fields: ['equipment_applications'] },
        publication: { target_sku: 'EA10001', approved_fields: ['equipment_applications'], proposed_values: { equipment_applications: [{ make: 'VOLVO', model: 'NEW 2027' }] } },
        evidence: [{ evidence_id: 'OFFICIAL-1', source_hash: 'a'.repeat(64) }], source_urls: ['https://example.com/bulletin']
      }
    },
    catalog: [{ sku: 'EA10001', equipment_applications: [{ make: 'VOLVO', model: 'OLD' }] }]
  };
}

test('creates deterministic field-level dry-run plan for an existing SKU', () => {
  const input = fixture();
  const a = buildCataloguePublicationPlan({ ...input, generatedAt: '2026-08-11T13:00:00Z' });
  const b = buildCataloguePublicationPlan({ ...input, generatedAt: '2026-08-12T13:00:00Z' });
  assert.equal(a.target_sku, 'EA10001');
  assert.equal(a.operations[0].before[0].model, 'OLD');
  assert.equal(a.operations[0].after[0].model, 'NEW 2027');
  assert.equal(a.plan_sha256, b.plan_sha256);
  assert.equal(a.database_write, false);
});

test('rejects candidates without both approvals', () => {
  const input = fixture();
  input.bundle.knowledge_candidate.workflow_status = 'PENDING_REVIEW';
  assert.throws(() => buildCataloguePublicationPlan(input), /must be APPROVED/);
});

test('rejects mismatched linked bundle identity', () => {
  const input = fixture();
  input.bundle.catalogue_candidate.research_bundle_id = 'HERMES_BUNDLE_OTHER';
  assert.throws(() => buildCataloguePublicationPlan(input), /must match/);
});

test('blocks missing or invented SKU targets', () => {
  const input = fixture();
  input.bundle.catalogue_candidate.publication.target_sku = 'EA39999';
  assert.throws(() => buildCataloguePublicationPlan(input), /does not exist/);
});

test('blocks unapproved and non-publishable fields', () => {
  const input = fixture();
  input.bundle.catalogue_candidate.publication.proposed_values.sku = 'EA39999';
  assert.throws(() => buildCataloguePublicationPlan(input), /was not approved/);
});

test('rejects a no-op plan', () => {
  const input = fixture();
  input.bundle.catalogue_candidate.publication.proposed_values.equipment_applications = input.catalog[0].equipment_applications;
  assert.throws(() => buildCataloguePublicationPlan(input), /No catalogue change/);
});
