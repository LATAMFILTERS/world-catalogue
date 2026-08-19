/**
 * validator.ts
 * ELIMFILTERS — Data Ingestion Framework v1.0
 *
 * Validation Engine.
 * Every normalized record must pass validation before it can be approved.
 * Checks duplicates, prefixes, relationships, missing fields, and integrity.
 */

import type {
  NormalizedRecord,
  ValidationResult,
  ValidationIssue,
  IngestionDomain,
} from './ingestion-types';

import { CANONICAL_TECHNOLOGY_KEYS } from '../canonical-entity-types';
import { PROTECTION_SYSTEMS } from '../protection-systems-data';
import { PRODUCT_FAMILIES } from '../product-families-data';

const VALID_TECHNOLOGY_KEYS = CANONICAL_TECHNOLOGY_KEYS;
const VALID_SYSTEM_KEYS = new Set(Object.keys(PROTECTION_SYSTEMS ?? {}));
const VALID_FAMILY_KEYS = new Set(Object.keys(PRODUCT_FAMILIES ?? {}));
const VALID_PLATFORMS = new Set(['MARINECLEAN', 'DURATECH']);

const VALID_PREFIXES: Record<string, 'HD' | 'LD'> = {
  EA1: 'HD',
  EA3: 'LD',
  EC1: 'HD',
  EC3: 'LD',
  EF9: 'HD',
  EF3: 'LD',
  EL8: 'HD',
  EL3: 'LD',
  EH6: 'HD',
  EW7: 'HD',
  ED4: 'HD',
};

const REQUIRED_FIELDS: Record<IngestionDomain, string[]> = {
  OEM: ['oem_id', 'name', 'category'],
  OEM_PART: ['oem_id', 'oem_part_number', 'category'],
  CROSS_REFERENCE: ['oem_part_id', 'elimfilters_part_number'],
  EQUIPMENT: ['equipment_id', 'manufacturer', 'model', 'equipment_type'],
  ENGINE: ['engine_id', 'manufacturer', 'engine_model', 'fuel_type'],
  APPLICATION: ['application_id', 'name', 'category'],
  PRODUCT: ['part_number', 'duty', 'product_family'],
};

export class DuplicateRegistry {
  private seen = new Map<string, Set<string>>();

  check(domain: string, key: string): boolean {
    if (!this.seen.has(domain)) this.seen.set(domain, new Set());
    return this.seen.get(domain)!.has(key);
  }

  register(domain: string, key: string): void {
    if (!this.seen.has(domain)) this.seen.set(domain, new Set());
    this.seen.get(domain)!.add(key);
  }

  reset(): void {
    this.seen.clear();
  }
}

function issue(
  field: string,
  code: ValidationIssue['code'],
  severity: ValidationIssue['severity'],
  message: string,
  value?: string | number | null
): ValidationIssue {
  return { field, code, severity, message, value };
}

function validatePartNumberPrefix(
  partNumber: string | null,
  duty: string | null
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!partNumber) return issues;

  const prefix = partNumber.substring(0, 3).toUpperCase();
  if (!VALID_PREFIXES[prefix]) {
    issues.push(
      issue('part_number', 'INVALID_PREFIX', 'ERROR',
        `Part number "${partNumber}" uses unknown prefix "${prefix}". Must match canonical ELIMFILTERS prefix table.`,
        partNumber
      )
    );
  } else if (duty && duty !== VALID_PREFIXES[prefix]) {
    issues.push(
      issue('duty', 'INVALID_DUTY_CLASS', 'ERROR',
        `Part number "${partNumber}" prefix "${prefix}" implies duty "${VALID_PREFIXES[prefix]}" but field declares "${duty}".`,
        duty
      )
    );
  }

  return issues;
}

function validateRequiredFields(record: NormalizedRecord): ValidationIssue[] {
  const required = REQUIRED_FIELDS[record.domain] ?? [];
  return required
    .filter((f) => !record.fields[f])
    .map((f) =>
      issue(f, 'MISSING_REQUIRED_FIELD', 'ERROR',
        `Required field "${f}" is missing or empty for domain "${record.domain}".`
      )
    );
}

function validateTechnologyKey(record: NormalizedRecord): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const tech = record.fields['technology'] as string | null;
  if (!tech) return issues;
  const normalizedTech = tech.toUpperCase();
  if (!VALID_TECHNOLOGY_KEYS.has(normalizedTech as any)) {
    issues.push(
      issue('technology', 'UNKNOWN_TECHNOLOGY', 'ERROR',
        `Technology key "${tech}" is not registered in the canonical Technology Registry.`, tech)
    );
  }
  return issues;
}

function validateSystemKey(record: NormalizedRecord): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const sys = record.fields['protection_system'] as string | null;
  if (!sys) return issues;
  if (VALID_SYSTEM_KEYS.size > 0 && !VALID_SYSTEM_KEYS.has(sys)) {
    issues.push(
      issue('protection_system', 'UNKNOWN_SYSTEM', 'ERROR',
        `Protection system "${sys}" is not registered in the System Registry.`, sys)
    );
  }
  return issues;
}

function validateFamilyKey(record: NormalizedRecord): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const family = record.fields['product_family'] as string | null;
  if (!family) return issues;
  if (VALID_FAMILY_KEYS.size > 0 && !VALID_FAMILY_KEYS.has(family)) {
    issues.push(
      issue('product_family', 'UNKNOWN_FAMILY', 'ERROR',
        `Product family "${family}" is not registered in the Family Registry.`, family)
    );
  }
  return issues;
}

function validatePlatformKey(record: NormalizedRecord): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const platform = record.fields['platform'] as string | null;
  if (!platform) return issues;
  if (!VALID_PLATFORMS.has(platform.toUpperCase())) {
    issues.push(
      issue('platform', 'UNKNOWN_PLATFORM', 'WARNING',
        `Platform "${platform}" is not in the canonical Platform Registry. Valid: MARINECLEAN, DURATECH.`, platform)
    );
  }
  return issues;
}

export function validateRecord(
  record: NormalizedRecord,
  duplicates: DuplicateRegistry
): ValidationResult {
  const issues: ValidationIssue[] = [];

  issues.push(...validateRequiredFields(record));

  if (record.domain === 'OEM') {
    const id = record.fields['oem_id'] as string | null;
    if (id) {
      if (duplicates.check('OEM_ID', id)) {
        issues.push(issue('oem_id', 'DUPLICATE_OEM_ID', 'ERROR',
          `Duplicate OEM ID "${id}" detected in this import batch.`, id));
      } else {
        duplicates.register('OEM_ID', id);
      }
    }
  }

  if (record.domain === 'OEM_PART') {
    const num = record.fields['oem_part_number'] as string | null;
    if (num) {
      if (duplicates.check('OEM_PART_NUMBER', num)) {
        issues.push(issue('oem_part_number', 'DUPLICATE_OEM_NUMBER', 'ERROR',
          `Duplicate OEM part number "${num}" detected in this import batch.`, num));
      } else {
        duplicates.register('OEM_PART_NUMBER', num);
      }
    }
  }

  if (record.domain === 'PRODUCT') {
    const pn = record.fields['part_number'] as string | null;
    if (pn) {
      if (duplicates.check('PRODUCT_PART_NUMBER', pn)) {
        issues.push(issue('part_number', 'DUPLICATE_PART_NUMBER', 'ERROR',
          `Duplicate ELIMFILTERS part number "${pn}" detected in this import batch.`, pn));
      } else {
        duplicates.register('PRODUCT_PART_NUMBER', pn);
      }
    }
    issues.push(...validatePartNumberPrefix(
      pn,
      record.fields['duty'] as string | null
    ));
  }

  if (record.domain === 'CROSS_REFERENCE') {
    const key = `${record.fields['oem_part_id']}_${record.fields['elimfilters_part_number']}`;
    if (duplicates.check('CROSS_REF', key)) {
      issues.push(issue('elimfilters_part_number', 'DUPLICATE_PART_NUMBER', 'ERROR',
        `Duplicate cross-reference mapping detected.`, key));
    } else {
      duplicates.register('CROSS_REF', key);
    }
  }

  issues.push(...validateTechnologyKey(record));
  issues.push(...validateSystemKey(record));
  issues.push(...validateFamilyKey(record));
  issues.push(...validatePlatformKey(record));

  const errorCount = issues.filter((i) => i.severity === 'ERROR').length;
  const warningCount = issues.filter((i) => i.severity === 'WARNING').length;

  return {
    sourceId: record.sourceId,
    valid: errorCount === 0,
    issues,
    errorCount,
    warningCount,
  };
}

export function validateRecords(
  records: NormalizedRecord[],
  duplicates: DuplicateRegistry
): ValidationResult[] {
  return records.map((r) => validateRecord(r, duplicates));
}
