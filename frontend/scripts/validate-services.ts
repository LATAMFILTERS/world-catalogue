/**
 * validate-services.ts
 * Phase 3 Engineering Services Validation
 *
 * Verifies: search integrity, recommendation integrity,
 * citation integrity, provenance integrity, AI context integrity.
 *
 * Usage:  npx tsx scripts/validate-services.ts
 * Exit 0: all checks pass.
 * Exit 1: one or more checks fail.
 */

import {
  loadGraph,
  getGraphVersion,
  search,
  searchByType,
  findById,
  recommendFromPrinciple,
  recommendFromFailureMode,
  recommendFromContamination,
  recommendFromTechnology,
  citeEntity,
  citeRecommendation,
  getEntityProvenance,
  getFullAuditTrail,
  listAliasEntities,
  getGovernanceSummary,
  buildAIContext,
} from '../src/lib/services';

// ─── Check runner ─────────────────────────────────────────────────────────────

interface CheckResult {
  name: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
}

function check(name: string, fn: () => void): CheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  try {
    fn();
    return { name, passed: true, errors, warnings };
  } catch (e) {
    errors.push(e instanceof Error ? e.message : String(e));
    return { name, passed: false, errors, warnings };
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`ASSERT: ${message}`);
}

// ─── Checks ───────────────────────────────────────────────────────────────────

const results: CheckResult[] = [];

// 1. Knowledge Service
results.push(check('Knowledge Service — graph loads', () => {
  const graph = loadGraph();
  assert(graph.totalNodes > 0, `Expected nodes, got ${graph.totalNodes}`);
  assert(graph.totalRelationships > 0, `Expected relationships, got ${graph.totalRelationships}`);
  const v = getGraphVersion();
  assert(typeof v === 'string' && v.length > 0, 'Graph version must be a non-empty string');
}));

// 2. Search — known entity by ID
results.push(check('Search Service — entity ID search', () => {
  const hits = search('TECH-MACROCORE');
  assert(hits.length > 0, 'Search for TECH-MACROCORE returned no results');
  assert(hits[0].entityId === 'TECH-MACROCORE', `Top hit should be TECH-MACROCORE, got ${hits[0].entityId}`);
}));

// 3. Search — keyword search
results.push(check('Search Service — keyword search', () => {
  const hits = search('hydraulic');
  assert(hits.length > 0, 'Keyword search for "hydraulic" returned no results');
}));

// 4. Search — type filter
results.push(check('Search Service — type-filtered search', () => {
  const hits = searchByType('ISO', 'STANDARD');
  assert(hits.length > 0, 'Type-filtered search for ISO standards returned no results');
  for (const h of hits) {
    assert(h.entityType === 'STANDARD', `Expected STANDARD, got ${h.entityType}`);
  }
}));

// 5. Search — findById
results.push(check('Search Service — findById', () => {
  const node = findById('EP-SEP-001');
  assert(node !== null, 'findById(EP-SEP-001) returned null');
  assert(node!.entityId === 'EP-SEP-001', `Expected EP-SEP-001, got ${node!.entityId}`);
}));

// 6. Search — empty query returns empty
results.push(check('Search Service — empty query', () => {
  const hits = search('');
  assert(hits.length === 0, `Empty query should return 0 results, got ${hits.length}`);
}));

// 7. Recommendation — from principle
results.push(check('Recommendation Service — from principle', () => {
  const recs = recommendFromPrinciple('EP-SEP-001');
  assert(recs.length > 0, 'recommendFromPrinciple(EP-SEP-001) returned no recommendations');
  for (const rec of recs) {
    assert(rec.steps.length > 0, `Recommendation ${rec.recommendationId} has no steps`);
    assert(rec.explanation.length > 0, `Recommendation ${rec.recommendationId} has no explanation`);
    assert(rec.confidence !== undefined, `Recommendation ${rec.recommendationId} missing confidence`);
  }
}));

// 8. Recommendation — from failure mode
results.push(check('Recommendation Service — from failure mode', () => {
  const recs = recommendFromFailureMode('FM-AIR-001');
  assert(recs.length > 0, 'recommendFromFailureMode(FM-AIR-001) returned no recommendations');
  const techRec = recs.find((r) => r.targetEntityType === 'TECHNOLOGY_ARCHITECTURE');
  assert(techRec !== undefined, 'Expected at least one TECHNOLOGY_ARCHITECTURE recommendation');
}));

// 9. Recommendation — from contamination
results.push(check('Recommendation Service — from contamination', () => {
  const recs = recommendFromContamination('CONT-DUST-MINERAL');
  assert(recs.length > 0, 'recommendFromContamination(CONT-DUST-MINERAL) returned no recommendations');
}));

// 10. Recommendation — from technology
results.push(check('Recommendation Service — from technology', () => {
  const recs = recommendFromTechnology('TECH-NANOFORCE');
  assert(recs.length > 0, 'recommendFromTechnology(TECH-NANOFORCE) returned no recommendations');
  const hasEP = recs.some((r) => r.targetEntityType === 'ENGINEERING_PRINCIPLE');
  assert(hasEP, 'Technology recommendation should include Engineering Principle links');
}));

// 11. Recommendation — unknown entity returns empty
results.push(check('Recommendation Service — unknown entity', () => {
  const recs = recommendFromPrinciple('EP-DOES-NOT-EXIST');
  assert(recs.length === 0, 'Unknown entity should return empty recommendations');
}));

// 12. Citation — citeEntity
results.push(check('Citation Service — citeEntity', () => {
  const cit = citeEntity('TECH-MACROCORE', 'MACROCORE controls air intake contamination');
  assert(cit.citationId.startsWith('CIT-'), `Expected CIT- prefix, got ${cit.citationId}`);
  assert(cit.sourceEntityId === 'TECH-MACROCORE', `Expected TECH-MACROCORE, got ${cit.sourceEntityId}`);
  assert(cit.sourceRegistry === 'technology-architectures.ts', `Unexpected registry: ${cit.sourceRegistry}`);
  assert(cit.traceability !== 'NONE', 'Citation traceability should not be NONE for a known entity');
}));

// 13. Citation — citeRecommendation
results.push(check('Citation Service — citeRecommendation', () => {
  const recs = recommendFromFailureMode('FM-AIR-001');
  assert(recs.length > 0, 'Need recommendations to test citation');
  const cit = citeRecommendation(recs[0]);
  assert(cit.claim.length > 0, 'Cited recommendation should have a claim');
  assert(cit.sourceEntityId === recs[0].targetEntityId, 'Citation source should match recommendation target');
}));

// 14. Citation — unknown entity throws
results.push(check('Citation Service — unknown entity throws', () => {
  let threw = false;
  try {
    citeEntity('TECH-UNKNOWN-999', 'should throw');
  } catch {
    threw = true;
  }
  assert(threw, 'citeEntity with unknown entity should throw');
}));

// 15. Provenance — known entity
results.push(check('Provenance Service — getEntityProvenance', () => {
  const prov = getEntityProvenance('TECH-SYNTRAX');
  assert(prov !== null, 'getEntityProvenance(TECH-SYNTRAX) returned null');
  assert(prov!.provenance.sourceRegistry === 'technology-architectures.ts', `Unexpected registry: ${prov!.provenance.sourceRegistry}`);
  assert(prov!.provenance.governanceStatus === 'ACTIVE', `Expected ACTIVE, got ${prov!.provenance.governanceStatus}`);
}));

// 16. Provenance — alias entity
results.push(check('Provenance Service — alias detection', () => {
  const aliases = listAliasEntities();
  assert(aliases.length > 0, 'Expected at least one alias entity (EP-SEP-005)');
  const epSep005 = aliases.find((n) => n.entityId === 'EP-SEP-005');
  assert(epSep005 !== undefined, 'EP-SEP-005 should be listed as an alias');
}));

// 17. Provenance — audit trail
results.push(check('Provenance Service — audit trail', () => {
  const trail = getFullAuditTrail('TECH-MACROCORE');
  assert(trail.entityProvenance !== null, 'Audit trail should include provenance');
  assert(trail.edrRefs.length > 0, 'TECH-MACROCORE should have EDR references');
}));

// 18. Provenance — governance summary
results.push(check('Provenance Service — governance summary', () => {
  const summary = getGovernanceSummary();
  assert(summary.totalEntities > 0, 'Governance summary should count entities');
  assert(summary.activeEntities > 0, 'Should have active entities');
  assert(summary.aliasEntities >= 1, 'Should have at least 1 alias (EP-SEP-005)');
}));

// 19. AI Context — single entity
results.push(check('AI Context Builder — single entity', () => {
  const ctx = buildAIContext('TECH-MACROCORE');
  assert(ctx.queryEntityId === 'TECH-MACROCORE', 'Query entity should be TECH-MACROCORE');
  assert(ctx.nodes.length > 0, 'Context should include nodes');
  assert(ctx.citations.length > 0, 'Context should include citations');
  assert(ctx.packageId.startsWith('AICTX-'), `Expected AICTX- prefix, got ${ctx.packageId}`);
  assert(ctx.graphVersion.length > 0, 'Context should include graph version');
}));

// 20. AI Context — depth 2
results.push(check('AI Context Builder — depth 2 includes more nodes', () => {
  const ctx1 = buildAIContext('EP-SEP-001', 1);
  const ctx2 = buildAIContext('EP-SEP-001', 2);
  assert(ctx2.nodes.length >= ctx1.nodes.length, 'Depth 2 should include at least as many nodes as depth 1');
}));

// 21. AI Context — unknown entity throws
results.push(check('AI Context Builder — unknown entity throws', () => {
  let threw = false;
  try {
    buildAIContext('TECH-UNKNOWN-999');
  } catch {
    threw = true;
  }
  assert(threw, 'buildAIContext with unknown entity should throw');
}));

// ─── Report ───────────────────────────────────────────────────────────────────

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(' ELIMFILTERS Engineering Intelligence Platform');
console.log(' Phase 3 Engineering Services Validation Report');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

let passed = 0, failed = 0;
for (const r of results) {
  const icon = r.passed ? '✓' : '✗';
  console.log(`  ${icon}  ${r.name}`);
  for (const e of r.errors) console.log(`       ERROR: ${e}`);
  for (const w of r.warnings) console.log(`       WARN:  ${w}`);
  if (r.passed) passed++; else failed++;
}

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`  Checks: ${results.length}  |  Passed: ${passed}  |  Failed: ${failed}`);
console.log(`  Overall: ${failed === 0 ? 'PASS ✓' : 'FAIL ✗'}`);
console.log('═══════════════════════════════════════════════════════════════\n');

process.exit(failed === 0 ? 0 : 1);
