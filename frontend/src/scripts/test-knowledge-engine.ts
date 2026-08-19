/**
 * test-knowledge-engine.ts
 * ELIMFILTERS — Knowledge Acquisition Engine v1.0
 *
 * Synthetic test suite verifying document parsing, entity extraction, 
 * relationship generation, and evidence tracking.
 */

import { processDocument, KNOWLEDGE_REGISTRY, type SourceDocument } from '../lib/knowledge';

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

// ============================================================================
// SETUP
// ============================================================================

KNOWLEDGE_REGISTRY.clear();

const rawDocumentV1: SourceDocument = {
  id: 'doc-bulletin-101',
  title: 'Engineering Bulletin: Mining Filtration Standards',
  type: 'BULLETIN',
  version: '1.0',
  author: 'Engineering Dept',
  publishedDate: '2026-01-15T00:00:00Z',
  content: `
# Executive Summary
This document covers the latest filtration standards for heavy equipment.

# Failure Modes and Protection
Severe dust environments in mining operations cause abrasive wear and cylinder scoring. 
To prevent this, equipment must be fitted with MACROCORE™ technology, which meets the ISO-5011 standard for heavy duty air intake systems.

# Maintenance Intervals
Standard maintenance is required every 500 hours.
  `
};

const rawDocumentV2: SourceDocument = {
  ...rawDocumentV1,
  version: '2.0',
  publishedDate: '2026-06-01T00:00:00Z',
  content: `
# Executive Summary
This document covers the updated filtration standards for heavy equipment.

# Failure Modes and Protection
Severe dust environments in mining operations cause abrasive wear and cylinder scoring. 
To prevent this, equipment must be fitted with MACROCORE™ technology, which meets the ISO-5011 standard for heavy duty air intake systems.
Additionally, water contamination causes pump cavitation, requiring HYDROCORE™ technology.

# Maintenance Intervals
Standard maintenance is required every 250 hours in extreme environments.
  `
};

// ============================================================================
// TEST 1: Initial Document Ingestion (v1.0)
// ============================================================================
console.log('\n─────────────────────────────────────────────');
console.log('TEST 1: Document Ingestion (v1.0)');
console.log('─────────────────────────────────────────────');

const reportV1 = processDocument(rawDocumentV1);

assert('New entities registered', reportV1.newEntities.length >= 4);
assert('New concepts registered', reportV1.modifiedConcepts.length >= 1);
assert('Relationships detected', reportV1.newRelationships.length >= 2);

const relTechStandard = reportV1.newRelationships.find(r => r.type === 'TECHNOLOGY_MEETS_STANDARD');
assert('Detected TECHNOLOGY ↔ STANDARD relationship', !!relTechStandard);
assert('Relationship has Evidence attached', (relTechStandard?.evidence.length ?? 0) === 1);
assert('Evidence tracks original document ID', relTechStandard?.evidence[0].sourceDocumentId === 'doc-bulletin-101');
assert('Evidence contains original text', !!relTechStandard?.evidence[0].extractedText.includes('MACROCORE'));

const relFailure = reportV1.newRelationships.find(r => r.type === 'CONTAMINATION_CAUSES_FAILURE');
assert('Detected CONTAMINATION ↔ FAILURE MODE relationship', !!relFailure);

// ============================================================================
// TEST 2: Knowledge Versioning (v2.0 Update)
// ============================================================================
console.log('\n─────────────────────────────────────────────');
console.log('TEST 2: Knowledge Versioning (v2.0)');
console.log('─────────────────────────────────────────────');

const reportV2 = processDocument(rawDocumentV2);

assert('Detected new HYDROCORE entities', reportV2.newEntities.some(e => e.value === 'HYDROCORE™'));
assert('Superseded existing relationship versions', reportV2.deprecatedRelationships.length > 0);

const updatedTechRel = reportV2.newRelationships.find(r => r.type === 'TECHNOLOGY_MEETS_STANDARD' && r.sourceEntityId.includes('macrocore'));
assert('Version bumped to 2 on existing relationship', updatedTechRel?.version === 2);
assert('Evidence history preserved (2 pieces of evidence now)', (updatedTechRel?.evidence.length ?? 0) === 2);


// ============================================================================
// TEST 3: Registry Integrity
// ============================================================================
console.log('\n─────────────────────────────────────────────');
console.log('TEST 3: Registry Integrity');
console.log('─────────────────────────────────────────────');

const allEntities = KNOWLEDGE_REGISTRY.getAllEntities();
const allRels = KNOWLEDGE_REGISTRY.getAllRelationships();

assert('No duplicate entities in registry', allEntities.length === new Set(allEntities.map(e => e.id)).size);
assert('No duplicate relationship IDs in registry', allRels.length === new Set(allRels.map(r => r.id)).size);


// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n═══════════════════════════════════════════════');
console.log('  KNOWLEDGE ACQUISITION ENGINE TESTS COMPLETE');
console.log(`  Passed : ${passed}`);
console.log(`  Failed : ${failed}`);
console.log(`  Total  : ${passed + failed}`);
console.log('═══════════════════════════════════════════════\n');

if (failed > 0) {
  console.error(`${failed} test(s) FAILED.`);
  process.exit(1);
} else {
  console.log('All Knowledge Acquisition Engine tests PASSED.');
}
