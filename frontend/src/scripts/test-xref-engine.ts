/**
 * test-xref-engine.ts
 * ELIMFILTERS — Cross Reference Intelligence Engine v1.0
 *
 * Full integration test suite.
 * Tests all 10 engine modules with a controlled synthetic graph.
 *
 * Graph under test:
 *
 *   donaldson::P181052  ──(OEM_CATALOG, conf=70)──▶ elimfilters::EA13001
 *   fleetguard::AF25139 ──(DIMENSION_MATCH+OEM, conf=90)──▶ elimfilters::EA13001
 *   mann::C281440       ──(MULTI_OEM_AGREEMENT+ENGINEERING, conf=100)──▶ elimfilters::EA13001
 *   donaldson::P550000  ──(OEM_CATALOG, conf=70)──▶ elimfilters::EL80001
 *   donaldson::P550000  ──(OEM_CATALOG, conf=65)──▶ elimfilters::EL80002  ← ONE_TO_MANY conflict
 *   donaldson::XBADPART  (orphan, no edges)
 */

import {
  XREF_GRAPH,
  registerOemPart,
  registerElimPart,
  registerMapping,
  resolveOemToElim,
  resolveElimToOem,
  detectAllConflicts,
  buildBidirectionalIndex,
  lookupElimFromOem,
  lookupOemFromElim,
  buildEquivalenceGroups,
  areEquivalent,
  verifyConsistency,
  analyzeCoverage,
  detectGaps,
  runFullAudit,
  getGraphStats,
  scoreConfidence,
  resolveAllDuplicates,
} from '../lib/xref';

// ============================================================================
// TEST HELPERS
// ============================================================================

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
// SETUP — Build test graph
// ============================================================================

XREF_GRAPH.clear();

// Register ELIMFILTERS parts
registerElimPart({ partNumber: 'EA13001', duty: 'HD', category: 'air' });
registerElimPart({ partNumber: 'EL80001', duty: 'HD', category: 'lube' });
registerElimPart({ partNumber: 'EL80002', duty: 'HD', category: 'lube' });
registerElimPart({ partNumber: 'EA10001', duty: 'HD', category: 'air' });

// Register OEM parts
registerOemPart({ oemId: 'donaldson', partNumber: 'P181052', duty: 'HD', category: 'air' });
registerOemPart({ oemId: 'fleetguard', partNumber: 'AF25139', duty: 'HD', category: 'air' });
registerOemPart({ oemId: 'mann', partNumber: 'C281440', duty: 'HD', category: 'air' });
registerOemPart({ oemId: 'donaldson', partNumber: 'P550000', duty: 'HD', category: 'lube' });
registerOemPart({ oemId: 'donaldson', partNumber: 'XBADPART', duty: 'UNKNOWN', category: '' }); // orphan

// Register mappings
registerMapping({
  fromOemId: 'donaldson', fromPartNumber: 'P181052', toPartNumber: 'EA13001',
  confidenceInput: { sources: ['OEM_CATALOG'], dimensionMatch: false, specMatch: false, multiOemAgreement: false, engineeringReview: false, sourceCount: 1 },
});
registerMapping({
  fromOemId: 'fleetguard', fromPartNumber: 'AF25139', toPartNumber: 'EA13001',
  confidenceInput: { sources: ['OEM_CATALOG', 'DIMENSION_MATCH'], dimensionMatch: true, specMatch: false, multiOemAgreement: false, engineeringReview: false, sourceCount: 2 },
});
registerMapping({
  fromOemId: 'mann', fromPartNumber: 'C281440', toPartNumber: 'EA13001',
  confidenceInput: { sources: ['OEM_CATALOG', 'ENGINEERING_REVIEW', 'MULTI_OEM_AGREEMENT'], dimensionMatch: true, specMatch: true, multiOemAgreement: true, engineeringReview: true, sourceCount: 3 },
});
// ONE_TO_MANY conflict: donaldson P550000 maps to two ELIM parts
registerMapping({
  fromOemId: 'donaldson', fromPartNumber: 'P550000', toPartNumber: 'EL80001',
  confidenceInput: { sources: ['OEM_CATALOG'], dimensionMatch: false, specMatch: false, multiOemAgreement: false, engineeringReview: false, sourceCount: 1 },
});
// Low confidence — below 70
const lowConfEdge = registerMapping({
  fromOemId: 'donaldson', fromPartNumber: 'P550000', toPartNumber: 'EL80002',
  confidenceInput: { sources: [], dimensionMatch: false, specMatch: false, multiOemAgreement: false, engineeringReview: false, sourceCount: 0 },
});

// ============================================================================
// TEST 1: Confidence Engine
// ============================================================================

console.log('\n─────────────────────────────────────────────');
console.log('TEST 1: Confidence Engine');
console.log('─────────────────────────────────────────────');

const multiSource = scoreConfidence({
  sources: ['OEM_CATALOG', 'ENGINEERING_REVIEW', 'MULTI_OEM_AGREEMENT'],
  dimensionMatch: true, specMatch: true, multiOemAgreement: true, engineeringReview: true, sourceCount: 3,
});
assert('Multi-source score = 100', multiSource.score === 100, `got: ${multiSource.score}`);
assert('Multi-source level = VERIFIED_MULTI_SOURCE', multiSource.level === 'VERIFIED_MULTI_SOURCE');
assert('Multi-source approved', multiSource.approved);

const oemOnly = scoreConfidence({
  sources: ['OEM_CATALOG'], dimensionMatch: false, specMatch: false, multiOemAgreement: false, engineeringReview: false, sourceCount: 1,
});
assert('OEM-only score = 70', oemOnly.score === 70, `got: ${oemOnly.score}`);
assert('OEM-only level = CROSS_REF_ONLY', oemOnly.level === 'CROSS_REF_ONLY');
assert('OEM-only approved', oemOnly.approved);

const belowThreshold = scoreConfidence({
  sources: [], dimensionMatch: false, specMatch: false, multiOemAgreement: false, engineeringReview: false, sourceCount: 0,
});
assert('Empty sources score = 0', belowThreshold.score === 0, `got: ${belowThreshold.score}`);
assert('Empty sources not approved', !belowThreshold.approved);

// ============================================================================
// TEST 2: Resolver — OEM to ELIM paths
// ============================================================================

console.log('\n─────────────────────────────────────────────');
console.log('TEST 2: Cross Reference Resolver');
console.log('─────────────────────────────────────────────');

const paths = resolveOemToElim('mann', 'C281440');
assert('Mann C281440 resolves to EA13001', paths.length > 0, `paths: ${paths.length}`);
assert('Path is valid (confidence ≥ 70)', paths[0]?.valid === true);
assert('Path has 1 hop', paths[0]?.hops === 1, `hops: ${paths[0]?.hops}`);

const reversePaths = resolveElimToOem('EA13001');
assert('EA13001 maps back to 3 OEM parts', reversePaths.length === 3, `got: ${reversePaths.length}`);

// ============================================================================
// TEST 3: Conflict Detection
// ============================================================================

console.log('\n─────────────────────────────────────────────');
console.log('TEST 3: Conflict Detection');
console.log('─────────────────────────────────────────────');

const conflicts = detectAllConflicts();
const oneToMany = conflicts.filter(c => c.type === 'ONE_TO_MANY');
assert('ONE_TO_MANY conflict detected for P550000', oneToMany.length >= 1, `count: ${oneToMany.length}`);
assert('ONE_TO_MANY severity is HIGH', oneToMany[0]?.severity === 'HIGH');

// ============================================================================
// TEST 4: Bidirectional Map
// ============================================================================

console.log('\n─────────────────────────────────────────────');
console.log('TEST 4: Bidirectional Map');
console.log('─────────────────────────────────────────────');

const index = buildBidirectionalIndex();
const elimFromDonaldson = lookupElimFromOem(index, 'donaldson::P181052');
assert('Donaldson P181052 → EA13001', elimFromDonaldson.includes('EA13001'), `got: ${elimFromDonaldson}`);

const oemFromElim = lookupOemFromElim(index, 'EA13001');
assert('EA13001 → 3 OEM parts', oemFromElim.length === 3, `got: ${oemFromElim.length}`);

// ============================================================================
// TEST 5: OEM Equivalence Engine
// ============================================================================

console.log('\n─────────────────────────────────────────────');
console.log('TEST 5: OEM Equivalence Engine');
console.log('─────────────────────────────────────────────');

const groups = buildEquivalenceGroups();
assert('At least 1 equivalence group exists', groups.length >= 1, `groups: ${groups.length}`);
const ea13Group = groups.find(g => g.elimPartNumber === 'EA13001');
assert('EA13001 group has 3 OEM equivalents', ea13Group?.equivalentOemParts.length === 3, `got: ${ea13Group?.equivalentOemParts.length}`);
assert('Donaldson and Mann are equivalent via EA13001', areEquivalent(groups, 'donaldson::P181052', 'mann::C281440'));

// ============================================================================
// TEST 6: Consistency Verifier
// ============================================================================

console.log('\n─────────────────────────────────────────────');
console.log('TEST 6: Consistency Verifier');
console.log('─────────────────────────────────────────────');

const consistency = verifyConsistency();
const orphans = consistency.issues.filter(i => i.type === 'ORPHAN_NODE');
assert('Orphan node XBADPART detected', orphans.length >= 1, `orphans: ${orphans.length}`);
assert('Total checked > 0', consistency.totalChecked > 0);

// ============================================================================
// TEST 7: Coverage Analyzer
// ============================================================================

console.log('\n─────────────────────────────────────────────');
console.log('TEST 7: Coverage Analyzer');
console.log('─────────────────────────────────────────────');

const coverage = analyzeCoverage();
assert('Coverage: OEM breakdown exists', coverage.byOem.length > 0);
assert('Coverage: Duty class breakdown exists', coverage.byDutyClass.length > 0);
assert('Coverage: Category breakdown exists', coverage.byCategory.length > 0);
assert('Coverage: Total OEM parts = 5', coverage.totalOemParts === 5, `got: ${coverage.totalOemParts}`);
assert('Coverage: Average confidence ≥ 0', coverage.averageConfidence >= 0);

// ============================================================================
// TEST 8: Gap Detector
// ============================================================================

console.log('\n─────────────────────────────────────────────');
console.log('TEST 8: Gap Detector');
console.log('─────────────────────────────────────────────');

const gaps = detectGaps();
assert('Gap report generated', gaps.totalGaps >= 0);
const missingMappings = gaps.workQueue.filter(g => g.category === 'MISSING_OEM_MAPPING');
assert('XBADPART detected as missing OEM mapping', missingMappings.length >= 1, `count: ${missingMappings.length}`);
const lowConf = gaps.workQueue.filter(g => g.category === 'LOW_CONFIDENCE_MAPPING');
assert('Low confidence mapping detected', lowConf.length >= 1, `count: ${lowConf.length}`);

// ============================================================================
// TEST 9: Duplicate Resolver
// ============================================================================

console.log('\n─────────────────────────────────────────────');
console.log('TEST 9: Duplicate Resolver');
console.log('─────────────────────────────────────────────');

const dups = resolveAllDuplicates();
assert('Duplicate resolver runs without error', typeof dups.totalDuplicates === 'number');

// ============================================================================
// TEST 10: Full Graph Audit
// ============================================================================

console.log('\n─────────────────────────────────────────────');
console.log('TEST 10: Full Graph Audit');
console.log('─────────────────────────────────────────────');

const audit = runFullAudit();
assert('Audit ID generated', !!audit.auditId);
assert('Audit nodes = 9', audit.totalNodes === 9, `got: ${audit.totalNodes}`);
assert('Audit total edges ≥ 5', audit.totalEdges >= 5, `got: ${audit.totalEdges}`);
assert('Summary is non-empty', audit.summary.length > 0);
assert('Coverage report in audit', !!audit.coverage);
assert('Gaps report in audit', !!audit.gaps);
assert('Consistency report in audit', !!audit.consistency);

const stats = getGraphStats();
assert('Graph stats: oemParts = 5', stats.oemParts === 5, `got: ${stats.oemParts}`);
assert('Graph stats: elimParts = 4', stats.elimParts === 4, `got: ${stats.elimParts}`);

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n═══════════════════════════════════════════════');
console.log('  XREF ENGINE TESTS COMPLETE');
console.log(`  Passed : ${passed}`);
console.log(`  Failed : ${failed}`);
console.log(`  Total  : ${passed + failed}`);
console.log('═══════════════════════════════════════════════\n');

if (failed > 0) {
  console.error(`${failed} test(s) FAILED.`);
  process.exit(1);
} else {
  console.log('All Cross Reference Intelligence Engine tests PASSED.');
}
