import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { compileUpdate, executeCataloguePublicationPlan, validateCataloguePublicationPlan } from '../../scripts/hermes/publish-catalogue-plan.mjs';

const canonical = (v) => Array.isArray(v) ? v.map(canonical) : (v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canonical(v[k])])) : v);
const hash = (v) => crypto.createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
function plan() {
  const core = { schema_version:'1.0.0', research_bundle_id:'HERMES_BUNDLE_X', target_sku:'EA10001', change_type:'application_update', approval:{ approved_by:'Victor Abreu', approved_at:new Date().toISOString(), approved_fields:['duty'] }, knowledge_approval:{ approved_by:'Victor Abreu', approved_at:new Date().toISOString() }, snapshot_sha256:'a'.repeat(64), operations:[{ field:'duty', before:'HEAVY_DUTY', after:'LIGHT_DUTY' }], evidence:[], source_urls:[] };
  return { ...core, generated_at:new Date().toISOString(), plan_sha256:hash(core), dry_run:true, database_write:false };
}

test('validates intact, fresh plans and rejects tampering', () => {
  const value=plan(); assert.equal(validateCataloguePublicationPlan(value), true);
  value.operations[0].after='MIXED_DUTY';
  assert.throws(() => validateCataloguePublicationPlan(value), /hash mismatch/);
});
test('compiles only allowlisted parameterized assignments', () => {
  const out=compileUpdate(plan());
  assert.equal(out.sql, 'UPDATE elimfilters_catalog SET duty = $1 WHERE sku = $2');
  assert.deepEqual(out.values, ['LIGHT_DUTY','EA10001']);
});
test('is dry-run by default and never requests a pool', async () => {
  const out=await executeCataloguePublicationPlan({ plan:plan(), apply:false });
  assert.deepEqual(out, { outcome:'DRY_RUN', database_write:false, target_sku:'EA10001', operations:1 });
});
test('requires a second live activation gate', async () => {
  delete process.env.HERMES_CATALOGUE_PUBLISH_LIVE;
  await assert.rejects(() => executeCataloguePublicationPlan({ plan:plan(), apply:true, pool:{} }), /PUBLISH_LIVE=true/);
});
