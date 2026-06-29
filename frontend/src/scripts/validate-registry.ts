import { PRODUCT_REGISTRY } from '../lib/product-registry-data';
import { PENDING } from '../lib/product-registry-types';

/**
 * validate-registry.ts
 * ELIMFILTERS — Validation Engine
 * 
 * Runs a strict audit against the PRODUCT_REGISTRY to ensure total compliance
 * with the corporate doctrine.
 */

interface ValidationResult {
  passed: boolean;
  errors: string[];
}

function validatePartNumberFormat(partNumber: string, duty: string): string[] {
  const errors: string[] = [];
  
  // ELIMFILTERS prefix doctrine rules
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
        errors.push(`Part Number ${partNumber} (Prefix ${rule.prefix}) implies ${rule.duty} but duty is listed as ${duty}.`);
      }
      break;
    }
  }

  if (!matchedPrefix) {
    errors.push(`Part Number ${partNumber} does not match any official ELIMFILTERS prefix.`);
  }

  // Check length (Prefix + 4 digits = 7 chars usually, but we allow variations if documented)
  if (partNumber.length < 5) {
    errors.push(`Part Number ${partNumber} is too short.`);
  }

  return errors;
}

export function validateRegistry(): ValidationResult {
  const errors: string[] = [];
  const skus = Object.keys(PRODUCT_REGISTRY);

  console.log(`Starting validation for ${skus.length} products in the registry...`);

  if (skus.length === 0) {
    console.log('Registry is empty. Passed (Zero-Product State compliant).');
    return { passed: true, errors: [] };
  }

  // 1. Uniqueness check (Object.keys already guarantees unique keys, but we check casing)
  const skuSet = new Set<string>();
  for (const sku of skus) {
    if (skuSet.has(sku.toUpperCase())) {
      errors.push(`Duplicate SKU detected (case-insensitive): ${sku}`);
    }
    skuSet.add(sku.toUpperCase());
  }

  // 2. Validate Each Product
  for (const [sku, product] of Object.entries(PRODUCT_REGISTRY)) {
    // Ensure key matches partNumber
    if (sku !== product.partNumber) {
      errors.push(`Registry key [${sku}] does not match product.partNumber [${product.partNumber}].`);
    }

    // Prefix & Duty Logic
    const formatErrors = validatePartNumberFormat(product.partNumber, product.duty);
    errors.push(...formatErrors);

    // Structural Integrity (Check arrays)
    if (Array.isArray(product.applications)) {
      if (product.applications.length === 0) {
        errors.push(`Product ${sku}: applications array is empty instead of 'DOCUMENTATION PENDING'.`);
      }
    }
    // (TypeScript handles the union types and keys, so we just run logical checks)
  }

  if (errors.length > 0) {
    console.error('Validation FAILED with the following errors:');
    errors.forEach(err => console.error(` - ${err}`));
  } else {
    console.log('Validation PASSED. 0 errors found.');
  }

  return { passed: errors.length === 0, errors };
}

// Auto-run if executed directly
if (require.main === module) {
  const result = validateRegistry();
  if (!result.passed) process.exit(1);
}
