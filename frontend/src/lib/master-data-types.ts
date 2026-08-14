import { TechnologyKey, EcosystemKey, SystemKey } from './canonical-entity-types';
import { ProtectionSystemKey } from './protection-systems-data';
import { DocumentationPending } from './product-registry-types';
import { FamilyKey } from './product-families-data';

export type OemId = string;
export type OemPartId = string;
export type EquipmentId = string;
export type EngineId = string;
export type ApplicationId = string;

export interface OemEntry {
  id: OemId;
  name: string;
  category: string;
  country: string;
  status: 'ACTIVE' | 'INACTIVE' | DocumentationPending;
  productCategories: string[];
  documentationStatus: 'COMPLETE' | 'PARTIAL' | DocumentationPending;
}

export interface OemPartEntry {
  id: OemPartId;
  oemId: OemId;
  oemPartNumber: string;
  category: string;
  duty: 'HD' | 'LD' | DocumentationPending;
  productType: string;
  crossReferences: string[];
  applications: ApplicationId[];
  equipment: EquipmentId[];
  engines: EngineId[];
  status: 'ACTIVE' | 'OBSOLETE' | DocumentationPending;
}

export interface CrossReferenceEntry {
  id: string;
  oemPartId: OemPartId;
  elimfiltersPartNumber: string;
  validationStatus: 'VALIDATED' | 'PENDING_VALIDATION' | DocumentationPending;
}

export interface EquipmentEntry {
  id: EquipmentId;
  manufacturer: OemId;
  model: string;
  series: string;
  equipmentType: string;
  engineId: EngineId | DocumentationPending;
  protectionSystems: ProtectionSystemKey[];
  applications: ApplicationId[];
  supportedProducts: string[];
}

export interface EngineEntry {
  id: EngineId;
  manufacturer: OemId;
  engineModel: string;
  displacement: string;
  fuelType: string;
  applications: ApplicationId[];
  equipment: EquipmentId[];
  protectionSystems: ProtectionSystemKey[];
  supportedProducts: string[];
}

export interface ApplicationEntry {
  id: ApplicationId;
  name: string;
  category: string;
  description: string | DocumentationPending;
}

export interface ProductPlatformEntry {
  key: EcosystemKey;
  name: string;
  slug: string;
  description: string;
  technologies: TechnologyKey[];
  systems: SystemKey[];
  status: 'ACTIVE' | 'IN_DEVELOPMENT' | DocumentationPending;
}
