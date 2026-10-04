'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { pageSupportsOfficialProduct } = require('../lib/donaldson-official-evidence');

test('official product evidence requires Donaldson context and exact normalized code', () => {
  assert.equal(pageSupportsOfficialProduct('<html><body>Donaldson P551313 Filter</body></html>', 'P551313'), true);
  assert.equal(pageSupportsOfficialProduct('<html><body>Generic P551313 Filter</body></html>', 'P551313'), false);
  assert.equal(pageSupportsOfficialProduct('<html><body>Donaldson P551999 Filter</body></html>', 'P551313'), false);
});

test('historical sanitation worker does not infer manufacturer absence or rename SKU', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'catalog-historical-sanitation.js'), 'utf8');
  assert.match(source, /absence_inferred:\s*0/);
  assert.match(source, /sku_mutations:\s*0/);
  assert.doesNotMatch(source, /SET\s+sku\s*=/i);
});

test('canonical promotion mutates alternates only through the constrained promotion helper', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'catalog-historical-sanitation.js'), 'utf8');
  assert.match(source, /buildCanonicalPromotionAlternates/);
  assert.match(source, /SANITATION_POSTCHECK_CANONICAL_DUPLICATED/);
  assert.match(source, /SANITATION_POSTCHECK_PRIOR_BASE_NOT_PRESERVED/);
  assert.match(source, /replacedReferenceManufacturer/);
});

test('primary candidates fail closed when evidence is only a cross-reference', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'catalog-historical-sanitation.js'), 'utf8');
  assert.match(source, /CROSS_REFERENCE_ONLY_NOT_CANONICAL_AUTHORITY/);
  assert.doesNotMatch(source, /findOfficialLiteratureCrossReference/);
});

test('cross-reference-only queue rows are excluded from automatic sanitation batches', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'catalog-historical-sanitation.js'), 'utf8');
  assert.match(source, /CROSS_REFERENCE_ONLY_NOT_MANUFACTURING_AUTHORITY/);
  assert.match(source, /SUPERSEDED_REFERENCE_NOT_CANONICAL_AUTHORITY/);
  assert.match(source, /DONALDSON_PRODUCT_EXISTS_IDENTITY_LINK_UNVERIFIED/);
  assert.match(source, /DONALDSON_NOT_FOUND_NOT_ABSENCE_EVIDENCE/);
  assert.match(source, /coalesce\(q\.last_error,''\) NOT IN/);
});

test('automatic sanitation only processes current-base evidence, not review candidates', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'catalog-historical-sanitation.js'), 'utf8');
  assert.match(source, /state' = 'CANONICAL_EVIDENCED_NOT_VERIFIED'/);
  assert.doesNotMatch(source, /IN \('CANONICAL_EVIDENCED_NOT_VERIFIED','REVIEW_PRIMARY_CANDIDATE'\)/);
});

test('review candidates have a read-only manufacturing-authority research mode', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'catalog-historical-sanitation.js'), 'utf8');
  assert.match(source, /--research-only/);
  assert.match(source, /SINGLE_CANDIDATE_MANUFACTURING_AUTHORITY_RESEARCH/);
  assert.match(source, /MULTI_CANDIDATE_IDENTITY_CONFLICT_RESEARCH/);
  assert.match(source, /OFFICIAL_CROSS_REFERENCE/);
  assert.match(source, /automatic_promotion_allowed:\s*false/);
  assert.match(source, /RESEARCH_ONLY_REFUSES_APPLY/);
  assert.match(source, /writes_performed:\s*0/);
});

test('historical sanitation catalog writes pass through gateway and compare-and-swap postchecks', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'catalog-historical-sanitation.js'), 'utf8');
  assert.match(source, /assertGovernedCatalogPatch/);
  assert.match(source, /SELECT \* FROM elimfilters_catalog WHERE sku=\$1 FOR UPDATE/);
  assert.match(source, /codigo_base IS NOT DISTINCT FROM \$6/);
  assert.match(source, /SANITATION_POSTCHECK_FAILED/);
  assert.match(source, /SANITATION_QUEUE_COMPARE_AND_SWAP_FAILED/);
  assert.match(source, /gateway_validated/);
});

test('historical sanitation reconciles only terminal governed queue states', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'catalog-historical-sanitation.js'), 'utf8');
  assert.match(source, /CANONICAL_VERIFIED_FALLBACK/);
  assert.match(source, /RETIRED/);
  assert.match(source, /SUPERSEDED/);
  assert.match(source, /reconcileTerminalQueue/);
  assert.match(source, /status='RESOLVED'/);
  assert.match(source, /RECONCILE_ONLY/);
  assert.match(source, /if \(reconcileOnly\) return summary/);
});

test('sanitation queue migration never updates protected catalog fields', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'migrations', 'run_074_catalog_historical_sanitation_queue.js'), 'utf8');
  assert.doesNotMatch(source, /UPDATE\s+elimfilters_catalog/i);
  assert.match(source, /protected_catalog_fields_mutated:\s*0/);
});

test('historical sanitation cancels slow verification rows instead of blocking the batch', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'catalog-historical-sanitation.js'), 'utf8');
  assert.match(source, /VERIFY_ROW_TIMEOUT/);
  assert.match(source, /verify-row-timeout-ms=/);
  assert.match(source, /new AbortController\(\)/);
  assert.match(source, /externalSignal\?\.addEventListener\('abort'/);
  assert.match(source, /verifyRowWithTimeout/);
});
