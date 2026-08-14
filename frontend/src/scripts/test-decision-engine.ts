/**
 * test-decision-engine.ts
 * ELIMFILTERS — Engineering Decision Engine v1.0
 *
 * Synthetic test suite verifying deterministic reasoning for complex operational environments.
 */

import { evaluateAssetStrategy, type OperatingEnvironment } from '../lib/decision';

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
// TEST 1: Extreme Mining Environment
// ============================================================================
console.log('\n─────────────────────────────────────────────');
console.log('TEST 1: Mining Environment (High Dust, High Vibration)');
console.log('─────────────────────────────────────────────');

const miningEnv: OperatingEnvironment = {
  industry: 'Mining',
  application: 'Haul Truck',
  dutyClass: 'Severe',
};

const miningRec = evaluateAssetStrategy('ASSET-MINING-001', miningEnv);

assert('Mining env triggers MACROCORE™ technology for dust', miningRec.recommendedTechnologies.includes('MACROCORE™'));
assert('Mining env triggers SYNTAPORE™ technology for fuel', miningRec.recommendedTechnologies.includes('SYNTAPORE™'));
assert('Mining env triggers MICROKAPPA™ technology for cabin air', miningRec.recommendedTechnologies.includes('MICROKAPPA™'));
assert('Mining env triggers NANOFORCE™ technology for hydraulics', miningRec.recommendedTechnologies.includes('NANOFORCE™'));

assert('Protection strategy includes Cabin Air', miningRec.protectionStrategy.systems.some(s => s.systemType === 'Cabin Air'));
assert('Maintenance strategy elevates Air Intake priority', miningRec.maintenanceStrategy.criticalSystems.includes('Engine Air Intake'));
assert('Traceability is attached to recommendation', miningRec.trace.length > 5);


// ============================================================================
// TEST 2: Marine Environment
// ============================================================================
console.log('\n─────────────────────────────────────────────');
console.log('TEST 2: Marine Environment (High Water, Poor Fuel)');
console.log('─────────────────────────────────────────────');

const marineEnv: OperatingEnvironment = {
  industry: 'Marine',
  application: 'Propulsion Engine',
  dutyClass: 'Heavy',
};

const marineRec = evaluateAssetStrategy('ASSET-MARINE-001', marineEnv);

assert('Marine env triggers TURBOCORE™ technology for water separation', marineRec.recommendedTechnologies.includes('TURBOCORE™'));
assert('Marine env elevates Fuel System maintenance priority', marineRec.maintenanceStrategy.criticalSystems.includes('Fuel System'));
assert('Traceability includes reference to Water/Fuel Risk Profile', marineRec.trace.some(t => t.reference.includes('Water/Fuel Risk Profile') || t.reference.includes('ISO-4406')));


// ============================================================================
// TEST 3: Standard Highway Transport
// ============================================================================
console.log('\n─────────────────────────────────────────────');
console.log('TEST 3: Standard Highway Transport');
console.log('─────────────────────────────────────────────');

const transportEnv: OperatingEnvironment = {
  industry: 'Transportation',
  application: 'Long Haul Truck',
  dutyClass: 'Standard',
};

const transportRec = evaluateAssetStrategy('ASSET-TRANS-001', transportEnv);

assert('Transport env defaults to baseline INTEKCORE™', transportRec.recommendedTechnologies.includes('INTEKCORE™'));
assert('Maintenance strategy falls back to Standard Baseline', transportRec.maintenanceStrategy.criticalSystems.includes('Engine Lube'));
assert('Protection strategy covers baseline systems (Lube, Fuel, Air)', transportRec.protectionStrategy.systems.length >= 3);


// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n═══════════════════════════════════════════════');
console.log('  ENGINEERING DECISION ENGINE TESTS COMPLETE');
console.log(`  Passed : ${passed}`);
console.log(`  Failed : ${failed}`);
console.log(`  Total  : ${passed + failed}`);
console.log('═══════════════════════════════════════════════\n');

if (failed > 0) {
  console.error(`${failed} test(s) FAILED.`);
  process.exit(1);
} else {
  console.log('All Engineering Decision Engine tests PASSED.');
}
