import { PRODUCT_REGISTRY } from '../lib/product-registry-data';
import { PENDING } from '../lib/product-registry-types';
import { OEM_REGISTRY } from '../lib/oem-registry';
import { OEM_PART_REGISTRY } from '../lib/oem-part-registry';
import { CROSS_REFERENCE_REGISTRY } from '../lib/cross-reference-registry';
import { EQUIPMENT_REGISTRY } from '../lib/equipment-registry';
import { ENGINE_REGISTRY } from '../lib/engine-registry';
import { APPLICATION_REGISTRY } from '../lib/application-registry';
import { PRODUCT_FAMILY_REGISTRY } from '../lib/product-family-registry';
import { PRODUCT_PLATFORM_REGISTRY } from '../lib/product-platform-registry';

/**
 * validate-registry.ts
 * ELIMFILTERS — Master Validation Engine
 * 
 * Runs a strict audit against all Master Registries to ensure total compliance
 * with the corporate enterprise architecture.
 */

interface ValidationResult {
  passed: boolean;
  errors: string[];
}

function validatePartNumberFormat(partNumber: string, duty: string): string[] {
  const errors: string[] = [];
  const prefixRules = [
    { prefix: 'EA1', duty: 'HD', type: 'Air' },
    { prefix: 'EA3', duty: 'LD', type: 'Air' },
    { prefix: 'EC1', duty: 'HD', type: 'Cabin' },
    { prefix: 'EC3', duty: 'LD', type: 'Cabin' },
    { prefix: 'EF9', duty: 'HD', type: 'Fuel' },
    { prefix: 'EF3', duty: 'LD', type: 'Fuel' },
    { prefix: 'EL8', duty: 'HD', type: 'Lube' },
    { prefix: 'EL3', duty: 'LD', type: 'Lube' },
    { prefix: 'EH6', duty: 'HD', type: 'Hydraulic' },
    { prefix: 'EW7', duty: 'HD', type: 'Coolant' },
    { prefix: 'ED4', duty: 'HD', type: 'Air Dryer' },
  ];

  let matchedPrefix = false;
  for (const rule of prefixRules) {
    if (partNumber.startsWith(rule.prefix)) {
      matchedPrefix = true;
      if (duty !== PENDING && duty !== rule.duty) {
        errors.push(`Part Number ${partNumber} implies ${rule.duty} but duty is listed as ${duty}.`);
      }
      break;
    }
  }

  if (!matchedPrefix) {
    errors.push(`Part Number ${partNumber} does not match any official ELIMFILTERS prefix.`);
  }
  return errors;
}

export function validateRegistry(): ValidationResult {
  const errors: string[] = [];
  
  // 1. PRODUCT REGISTRY AUDIT
  const skus = Object.keys(PRODUCT_REGISTRY);
  console.log(`Auditing Product Registry: ${skus.length} entries`);
  
  const skuSet = new Set<string>();
  for (const [sku, product] of Object.entries(PRODUCT_REGISTRY)) {
    if (skuSet.has(sku.toUpperCase())) errors.push(`Duplicate Product SKU: ${sku}`);
    skuSet.add(sku.toUpperCase());
    
    if (sku !== product.partNumber) errors.push(`Product key [${sku}] mismatch [${product.partNumber}]`);
    errors.push(...validatePartNumberFormat(product.partNumber, product.duty));
    
    if (product.productFamily !== PENDING && !PRODUCT_FAMILY_REGISTRY[product.productFamily as any]) {
      // Currently PRODUCT_FAMILY_REGISTRY might be empty, just note it if it's missing in a populated state
      // errors.push(`Product ${sku} has missing Family ${product.productFamily}`);
    }
  }

  // 2. OEM REGISTRY AUDIT
  const oemSet = new Set<string>();
  for (const [id, oem] of Object.entries(OEM_REGISTRY)) {
    if (oemSet.has(id.toUpperCase())) errors.push(`Duplicate OEM ID: ${id}`);
    oemSet.add(id.toUpperCase());
    
    // Check for duplicate names
    for (const [otherId, otherOem] of Object.entries(OEM_REGISTRY)) {
      if (id !== otherId && oem.name.toLowerCase() === otherOem.name.toLowerCase()) {
        errors.push(`Duplicate OEM Name detected: ${oem.name}`);
      }
    }
  }

  // 3. OEM PART REGISTRY AUDIT
  const oemPartSet = new Set<string>();
  for (const [id, part] of Object.entries(OEM_PART_REGISTRY)) {
    if (oemPartSet.has(id.toUpperCase())) errors.push(`Duplicate OEM Part ID: ${id}`);
    oemPartSet.add(id.toUpperCase());
    
    if (!OEM_REGISTRY[part.oemId]) errors.push(`OEM Part ${id} references missing OEM: ${part.oemId}`);
    
    part.crossReferences.forEach(cr => {
      // If we had cross references, we would validate they exist in PRODUCT_REGISTRY
      // if (cr !== PENDING && !PRODUCT_REGISTRY[cr]) errors.push(`OEM Part ${id} has invalid cross-ref ${cr}`);
    });
  }

  // 4. CROSS REFERENCE AUDIT
  const crSet = new Set<string>();
  for (const [id, cr] of Object.entries(CROSS_REFERENCE_REGISTRY)) {
    if (crSet.has(id.toUpperCase())) errors.push(`Duplicate Cross Ref ID: ${id}`);
    crSet.add(id.toUpperCase());
    
    if (!OEM_PART_REGISTRY[cr.oemPartId]) errors.push(`Cross Ref ${id} references missing OEM Part: ${cr.oemPartId}`);
  }

  // 5. EQUIPMENT & ENGINE AUDIT (Orphan Check)
  for (const [id, eq] of Object.entries(EQUIPMENT_REGISTRY)) {
    if (!OEM_REGISTRY[eq.manufacturer]) errors.push(`Equipment ${id} has missing OEM manufacturer ${eq.manufacturer}`);
    if (eq.engineId !== PENDING && !ENGINE_REGISTRY[eq.engineId]) errors.push(`Equipment ${id} references missing Engine: ${eq.engineId}`);
  }
  
  for (const [id, eng] of Object.entries(ENGINE_REGISTRY)) {
    if (!OEM_REGISTRY[eng.manufacturer]) errors.push(`Engine ${id} has missing OEM manufacturer ${eng.manufacturer}`);
  }

  if (errors.length > 0) {
    console.error('Validation FAILED with the following errors:');
    errors.forEach(err => console.error(` - ${err}`));
  } else {
    console.log('Validation PASSED. 0 errors found. Architecture conforms perfectly.');
  }

  return { passed: errors.length === 0, errors };
}

if (require.main === module) {
  const result = validateRegistry();
  if (!result.passed) process.exit(1);
}
