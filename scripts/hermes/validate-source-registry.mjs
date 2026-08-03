#!/usr/bin/env node
// HERMES Phase 5 Lite — validates hermes/config/source-organizations.json
// and hermes/config/source-endpoints.json against the governance rules in
// scripts/hermes/source-registry-core.mjs. Read-only; performs no network
// calls and no writes.
import process from 'node:process';
import { loadRegistry, validateRegistry } from './source-registry-core.mjs';

const organizationsPath = process.argv[2] || 'hermes/config/source-organizations.json';
const endpointsPath = process.argv[3] || 'hermes/config/source-endpoints.json';

let registry;
try {
  registry = loadRegistry(organizationsPath, endpointsPath);
} catch (error) {
  console.error(`[HERMES registry validator] ${error.message}`);
  process.exit(2);
}

const errors = validateRegistry(registry);
console.log(`[HERMES registry validator] organizations=${registry.organizations.length} endpoints=${registry.endpoints.length}`);
if (errors.length) {
  console.error(`[HERMES registry validator] FAIL (${errors.length} issue${errors.length === 1 ? '' : 's'})`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log('[HERMES registry validator] PASS');
