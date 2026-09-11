import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  EVIDENCE_LAYERS,
  LAYERS,
  normalizeLdApplicationEvidence,
  validateLdApplicationEvidence,
  canWriteConfirmedCross,
  canWriteConfirmedApplication
} = require('../lib/knowledge-governance/hermes-evidence-layer-registry.js');

const required = [
  'PRODUCT_CHANGE_INTELLIGENCE',
  'QUALITY_EVENT_EVIDENCE',
  'INSTALLATION_PROCEDURE_EVIDENCE',
  'WARRANTY_ROOT_CAUSE_EVIDENCE',
  'LD_APPLICATION_CROSS_EVIDENCE'
];

for (const key of required) {
  if (!EVIDENCE_LAYERS[key]) throw new Error(`Missing HERMES evidence layer: ${key}`);
  const config = LAYERS[EVIDENCE_LAYERS[key]];
  if (!config) throw new Error(`Missing layer configuration: ${key}`);
  if (config.public_projection_allowed !== false) throw new Error(`${key} must remain private`);
  if (config.canonical_auto_promotion_allowed !== false) throw new Error(`${key} must not auto-promote to canonical knowledge`);
}

const sample = normalizeLdApplicationEvidence({
  source_url: 'https://private-evidence.invalid/product-page',
  source_snapshot_sha256: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  source_market_scope: 'source-declared-market',
  source_product_number: 'SOURCE-PART',
  application: { year_start: 2020, make: 'Example', model: 'Vehicle', engine: '2.0L' },
  cross_reference: { manufacturer: 'SOURCE', part_number: 'SOURCE-XREF', relation_type: 'listed_cross' }
});

const result = validateLdApplicationEvidence(sample);
if (!result.valid) throw new Error(`Valid LD evidence rejected: ${result.errors.join('; ')}`);
if (sample.knowledge_domain !== 'LIGHT_DUTY_KNOWLEDGE_DOMAIN') throw new Error('LD evidence escaped LD domain');
if (sample.industry !== 'Automotive') throw new Error('LD evidence escaped Automotive industry');
if (sample.catalog_write_eligible !== false) throw new Error('Evidence must not auto-write catalog');
if (canWriteConfirmedCross(sample) !== false) throw new Error('Evidence must never auto-write confirmed crosses');
if (canWriteConfirmedApplication(sample) !== false) throw new Error('Evidence must never auto-write confirmed applications');

const invalid = { ...sample, knowledge_domain: 'HEAVY_DUTY_KNOWLEDGE_DOMAIN' };
if (validateLdApplicationEvidence(invalid).valid) throw new Error('Validator allowed LD evidence into HD domain');

const falselyValidated = {
  ...sample,
  application_status: 'validated',
  cross_status: 'validated',
  independent_validation_sources: []
};
if (validateLdApplicationEvidence(falselyValidated).valid) {
  throw new Error('Validator allowed validated application/cross without independent evidence');
}

console.log('HERMES evidence layers: PASS');
console.log('LD application/cross quarantine: PASS');
