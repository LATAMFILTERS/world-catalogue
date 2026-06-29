/**
 * relationship-builder.ts
 * ELIMFILTERS — Data Ingestion Framework v1.0
 *
 * Relationship Builder Engine.
 * Automatically constructs the relational graph for each record:
 *   OEM → OEM Part → Cross Reference → Equipment → Engine → Application
 *   → Protection System → Technology → Platform → Family → Product
 */

import type {
  NormalizedRecord,
  ValidationResult,
  RelationshipMap,
  UnresolvedRelationship,
} from './ingestion-types';

import { OEM_REGISTRY } from '../oem-registry';
import { OEM_PART_REGISTRY } from '../oem-part-registry';
import { EQUIPMENT_REGISTRY } from '../equipment-registry';
import { ENGINE_REGISTRY } from '../engine-registry';
import { APPLICATION_REGISTRY } from '../application-registry';
import { PRODUCT_FAMILIES } from '../product-families-data';
import { PROTECTION_SYSTEMS } from '../protection-systems-data';

// ============================================================================
// HELPERS
// ============================================================================

function field(record: NormalizedRecord, key: string): string | null {
  const v = record.fields[key];
  return v !== null && v !== undefined ? String(v) : null;
}

function resolveByField(
  registry: Record<string, unknown>,
  value: string,
  fieldName: string
): string | undefined {
  // Direct ID lookup
  if (registry[value]) return value;
  // Case-insensitive lookup
  const lower = value.toLowerCase();
  return Object.keys(registry).find((k) => k.toLowerCase() === lower);
}

// ============================================================================
// DOMAIN-SPECIFIC RELATIONSHIP BUILDERS
// ============================================================================

function buildOemRelationship(record: NormalizedRecord): RelationshipMap {
  const unresolved: UnresolvedRelationship[] = [];
  const oemId = field(record, 'oem_id');

  return {
    sourceId: record.sourceId,
    oemId: oemId ?? undefined,
    unresolved,
  };
}

function buildOemPartRelationship(record: NormalizedRecord): RelationshipMap {
  const unresolved: UnresolvedRelationship[] = [];
  const oemId = field(record, 'oem_id');
  const oemPartId = field(record, 'oem_part_id') ?? `${oemId}_${field(record, 'oem_part_number')}`;

  if (oemId && !OEM_REGISTRY[oemId]) {
    unresolved.push({
      field: 'oem_id',
      value: oemId,
      reason: `OEM "${oemId}" not found in OEM Registry`,
    });
  }

  return {
    sourceId: record.sourceId,
    oemId: oemId ?? undefined,
    oemPartId,
    unresolved,
  };
}

function buildCrossReferenceRelationship(record: NormalizedRecord): RelationshipMap {
  const unresolved: UnresolvedRelationship[] = [];
  const oemPartId = field(record, 'oem_part_id');
  const elimPartNumber = field(record, 'elimfilters_part_number');

  if (oemPartId && !OEM_PART_REGISTRY[oemPartId]) {
    unresolved.push({
      field: 'oem_part_id',
      value: oemPartId,
      reason: `OEM Part "${oemPartId}" not found in OEM Part Registry`,
    });
  }

  return {
    sourceId: record.sourceId,
    oemPartId: oemPartId ?? undefined,
    crossReferenceId: elimPartNumber ? `XREF_${elimPartNumber}` : undefined,
    productPartNumber: elimPartNumber ?? undefined,
    unresolved,
  };
}

function buildEquipmentRelationship(record: NormalizedRecord): RelationshipMap {
  const unresolved: UnresolvedRelationship[] = [];
  const equipmentId = field(record, 'equipment_id');
  const engineId = field(record, 'engine_id');
  const manufacturer = field(record, 'manufacturer');
  const systemField = field(record, 'protection_system');

  if (manufacturer && !OEM_REGISTRY[manufacturer]) {
    unresolved.push({
      field: 'manufacturer',
      value: manufacturer,
      reason: `OEM "${manufacturer}" not found in OEM Registry`,
    });
  }

  if (engineId && !ENGINE_REGISTRY[engineId]) {
    unresolved.push({
      field: 'engine_id',
      value: engineId,
      reason: `Engine "${engineId}" not found in Engine Registry`,
    });
  }

  const resolvedSystem = systemField
    ? resolveByField(PROTECTION_SYSTEMS, systemField, 'protection_system')
    : undefined;
  if (systemField && !resolvedSystem) {
    unresolved.push({
      field: 'protection_system',
      value: systemField,
      reason: `Protection System "${systemField}" not found in System Registry`,
    });
  }

  return {
    sourceId: record.sourceId,
    equipmentId: equipmentId ?? undefined,
    engineId: engineId ?? undefined,
    oemId: manufacturer ?? undefined,
    protectionSystemKey: resolvedSystem,
    unresolved,
  };
}

function buildEngineRelationship(record: NormalizedRecord): RelationshipMap {
  const unresolved: UnresolvedRelationship[] = [];
  const engineId = field(record, 'engine_id');
  const manufacturer = field(record, 'manufacturer');

  if (manufacturer && !OEM_REGISTRY[manufacturer]) {
    unresolved.push({
      field: 'manufacturer',
      value: manufacturer,
      reason: `OEM "${manufacturer}" not found in OEM Registry`,
    });
  }

  return {
    sourceId: record.sourceId,
    engineId: engineId ?? undefined,
    oemId: manufacturer ?? undefined,
    unresolved,
  };
}

function buildApplicationRelationship(record: NormalizedRecord): RelationshipMap {
  const applicationId = field(record, 'application_id');
  return {
    sourceId: record.sourceId,
    applicationIds: applicationId ? [applicationId] : [],
    unresolved: [],
  };
}

function buildProductRelationship(record: NormalizedRecord): RelationshipMap {
  const unresolved: UnresolvedRelationship[] = [];
  const partNumber = field(record, 'part_number');
  const familyKey = field(record, 'product_family');
  const techKey = field(record, 'technology');
  const platformKey = field(record, 'platform');
  const systemKey = field(record, 'protection_system');

  if (familyKey && !PRODUCT_FAMILIES[familyKey as keyof typeof PRODUCT_FAMILIES]) {
    unresolved.push({
      field: 'product_family',
      value: familyKey,
      reason: `Family "${familyKey}" not found in Product Family Registry`,
    });
  }

  if (systemKey && !PROTECTION_SYSTEMS[systemKey as keyof typeof PROTECTION_SYSTEMS]) {
    unresolved.push({
      field: 'protection_system',
      value: systemKey,
      reason: `Protection System "${systemKey}" not found in System Registry`,
    });
  }

  return {
    sourceId: record.sourceId,
    productPartNumber: partNumber ?? undefined,
    familyKey: familyKey ?? undefined,
    technologyKey: techKey ?? undefined,
    platformKey: platformKey ?? undefined,
    protectionSystemKey: systemKey ?? undefined,
    unresolved,
  };
}

// ============================================================================
// MAIN RELATIONSHIP BUILDER
// ============================================================================

export function buildRelationship(
  record: NormalizedRecord,
  validation: ValidationResult
): RelationshipMap {
  // If record has hard errors, skip relationship building
  if (!validation.valid) {
    return {
      sourceId: record.sourceId,
      unresolved: [{
        field: '_record',
        value: record.sourceId,
        reason: `Record has ${validation.errorCount} validation error(s) — relationship building skipped`,
      }],
    };
  }

  switch (record.domain) {
    case 'OEM':              return buildOemRelationship(record);
    case 'OEM_PART':         return buildOemPartRelationship(record);
    case 'CROSS_REFERENCE':  return buildCrossReferenceRelationship(record);
    case 'EQUIPMENT':        return buildEquipmentRelationship(record);
    case 'ENGINE':           return buildEngineRelationship(record);
    case 'APPLICATION':      return buildApplicationRelationship(record);
    case 'PRODUCT':          return buildProductRelationship(record);
    default:
      return { sourceId: record.sourceId, unresolved: [] };
  }
}

export function buildRelationships(
  records: NormalizedRecord[],
  validations: ValidationResult[]
): RelationshipMap[] {
  return records.map((r, i) => buildRelationship(r, validations[i]));
}
