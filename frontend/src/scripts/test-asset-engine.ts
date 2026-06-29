/**
 * test-asset-engine.ts
 * ELIMFILTERS — Asset Intelligence Engine v1.0
 *
 * Full integration test suite.
 * Tests the Asset graph, maintenance intelligence, compatibility, and coverage.
 */

import {
  ASSET_GRAPH,
  registerAssetNode,
  registerAssetRelationship,
  resolveReachableNodes,
  generateMaintenanceProfile,
  checkCompatibility,
  findCompatibleAssets,
  analyzeAssetCoverage,
  getAssetGraphStats
} from '../lib/asset';

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
// SETUP — Build synthetic asset graph
// ============================================================================

ASSET_GRAPH.clear();

// 1. Assets
const assetCat = registerAssetNode({ type: 'ASSET', label: 'CAT 320D' });
const assetVolvo = registerAssetNode({ type: 'ASSET', label: 'Volvo EC210' }); // Competitor with same engine
const assetDeere = registerAssetNode({ type: 'ASSET', label: 'John Deere 8245R' }); // Completely different

// 2. Engines
const engineCat = registerAssetNode({ type: 'ENGINE', label: 'C6.4' });
const engineDeere = registerAssetNode({ type: 'ENGINE', label: 'PowerTech PSX 9.0L' });

// 3. Systems
const sysAir = registerAssetNode({ type: 'PROTECTION_SYSTEM', label: 'Engine Air Intake' });
const sysLube = registerAssetNode({ type: 'PROTECTION_SYSTEM', label: 'Engine Lube' });

// 4. OEM Parts
const oemAirCat = registerAssetNode({ type: 'OEM_PART', label: 'Cat 326-1644' });
const oemLubeCat = registerAssetNode({ type: 'OEM_PART', label: 'Cat 1R-0716' });

// 5. ELIMFILTERS Products
const elimAir = registerAssetNode({ type: 'ELIMFILTERS_PRODUCT', label: 'EA13001' });
const elimLube = registerAssetNode({ type: 'ELIMFILTERS_PRODUCT', label: 'EL80001' });

// 6. Maintenance Kits
const kitCat = registerAssetNode({ type: 'MAINTENANCE_KIT', label: 'MK-CAT-320D-250H' });

// 7. Establish Relationships (The Graph)
// CAT 320D
registerAssetRelationship({ fromNodeId: assetCat.id, toNodeId: engineCat.id, direction: 'ASSET_TO_ENGINE' });
registerAssetRelationship({ fromNodeId: assetCat.id, toNodeId: kitCat.id, direction: 'ASSET_TO_KIT' });
registerAssetRelationship({ fromNodeId: engineCat.id, toNodeId: sysAir.id, direction: 'ENGINE_TO_SYSTEM' });
registerAssetRelationship({ fromNodeId: engineCat.id, toNodeId: sysLube.id, direction: 'ENGINE_TO_SYSTEM' });

// Volvo EC210 (Shares C6.4 engine in this synthetic example)
registerAssetRelationship({ fromNodeId: assetVolvo.id, toNodeId: engineCat.id, direction: 'ASSET_TO_ENGINE' });

// Deere 8245R (Different engine, missing systems to trigger gaps)
registerAssetRelationship({ fromNodeId: assetDeere.id, toNodeId: engineDeere.id, direction: 'ASSET_TO_ENGINE' });

// Systems to OEM Parts
registerAssetRelationship({ fromNodeId: sysAir.id, toNodeId: oemAirCat.id, direction: 'SYSTEM_TO_OEM_PART' });
registerAssetRelationship({ fromNodeId: sysLube.id, toNodeId: oemLubeCat.id, direction: 'SYSTEM_TO_OEM_PART' });

// OEM to ELIMFILTERS
registerAssetRelationship({ fromNodeId: oemAirCat.id, toNodeId: elimAir.id, direction: 'OEM_PART_TO_ELIMFILTERS' });
registerAssetRelationship({ fromNodeId: oemLubeCat.id, toNodeId: elimLube.id, direction: 'OEM_PART_TO_ELIMFILTERS' });


// ============================================================================
// TEST 1: Asset Graph Resolution
// ============================================================================
console.log('\n─────────────────────────────────────────────');
console.log('TEST 1: Asset Graph Resolution');
console.log('─────────────────────────────────────────────');

const reachableSystems = resolveReachableNodes(assetCat.id, 'PROTECTION_SYSTEM', 3);
assert('CAT 320D resolves to 2 protection systems', reachableSystems.length === 2, `got: ${reachableSystems.length}`);

const reachableProducts = resolveReachableNodes(assetCat.id, 'ELIMFILTERS_PRODUCT', 5);
assert('CAT 320D resolves to 2 ELIMFILTERS products', reachableProducts.length === 2, `got: ${reachableProducts.length}`);

// ============================================================================
// TEST 2: Maintenance Intelligence
// ============================================================================
console.log('\n─────────────────────────────────────────────');
console.log('TEST 2: Maintenance Intelligence');
console.log('─────────────────────────────────────────────');

const profileCat = generateMaintenanceProfile(assetCat.id);
assert('CAT profile finds 2 required systems', profileCat.systemsRequired.length === 2);
assert('CAT profile finds 1 maintenance kit', profileCat.recommendedKits.length === 1);
assert('CAT profile has 0 coverage gaps', profileCat.coverageGaps.length === 0, `gaps: ${profileCat.coverageGaps.join(', ')}`);

const profileDeere = generateMaintenanceProfile(assetDeere.id);
assert('Deere profile has coverage gaps (no systems mapped)', profileDeere.coverageGaps.length > 0);

// ============================================================================
// TEST 3: Compatibility Engine
// ============================================================================
console.log('\n─────────────────────────────────────────────');
console.log('TEST 3: Compatibility Engine');
console.log('─────────────────────────────────────────────');

const compat = checkCompatibility(assetCat.id, assetVolvo.id);
assert('CAT and Volvo share an engine', compat.sharedEngine === true);
assert('CAT and Volvo share 2 systems', compat.sharedSystems.length === 2);
assert('CAT and Volvo share OEM parts', compat.sharedOemParts.length > 0);
assert('Compatibility score > 0', compat.compatibilityScore > 0);

const incompat = checkCompatibility(assetCat.id, assetDeere.id);
assert('CAT and Deere do not share engine', incompat.sharedEngine === false);
assert('CAT and Deere compatibility score is 0', incompat.compatibilityScore === 0);

const allCompat = findCompatibleAssets(assetCat.id);
assert('findCompatibleAssets returns Volvo for CAT', allCompat.some(c => c.assetB === assetVolvo.id));

// ============================================================================
// TEST 4: Coverage Engine
// ============================================================================
console.log('\n─────────────────────────────────────────────');
console.log('TEST 4: Coverage Engine');
console.log('─────────────────────────────────────────────');

const coverage = analyzeAssetCoverage();
assert('Coverage report generated', !!coverage.generatedAt);
assert('Total assets = 3', coverage.totalAssets === 3);
assert('Assets with complete coverage = 2 (CAT, Volvo)', coverage.assetsWithCompleteCoverage === 2);
assert('Assets with missing systems = 1 (Deere)', coverage.assetsWithMissingSystems === 1);
assert('Coverage by engine correctly aggregated', Object.keys(coverage.coverageByEngine).length === 2);

// ============================================================================
// TEST 5: Graph Engine Orchestrator
// ============================================================================
console.log('\n─────────────────────────────────────────────');
console.log('TEST 5: Graph Engine Orchestrator');
console.log('─────────────────────────────────────────────');

const stats = getAssetGraphStats();
assert('Total graph nodes >= 10', stats.totalNodes >= 10, `got: ${stats.totalNodes}`);
assert('Total graph edges >= 8', stats.totalEdges >= 8, `got: ${stats.totalEdges}`);

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n═══════════════════════════════════════════════');
console.log('  ASSET ENGINE TESTS COMPLETE');
console.log(`  Passed : ${passed}`);
console.log(`  Failed : ${failed}`);
console.log(`  Total  : ${passed + failed}`);
console.log('═══════════════════════════════════════════════\n');

if (failed > 0) {
  console.error(`${failed} test(s) FAILED.`);
  process.exit(1);
} else {
  console.log('All Asset Intelligence Engine tests PASSED.');
}
