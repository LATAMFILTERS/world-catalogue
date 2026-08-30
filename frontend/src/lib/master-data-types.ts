import { TechnologyKey, EcosystemKey, SystemKey } from './canonical-entity-types';
import { ProtectionSystemKey } from './protection-systems-data';
import { DocumentationPending } from './product-registry-types';
import { FamilyKey } from './product-families-data';

export type OemId = string;
export type OemPartId = string;
export type EquipmentId = string;
export type EngineId = string;
export type ApplicationId = string;

// 1. OEM REGISTRY
export interface OemEntry {
  id: OemId;
  name: string;
  category: string;
  country: string;
  status: 'ACTIVE' | 'INACTIVE' | DocumentationPending;
  productCategories: string[];
  documentationStatus: 'COMPLETE' | 'PARTIAL' | DocumentationPending;
}

// 2. OEM PART REGISTRY
export interface OemPartEntry {
  id: OemPartId; // Usually OEM ID + Part Number
  oemId: OemId;
  oemPartNumber: string;
  category: string;
  duty: 'HD' | 'LD' | DocumentationPending;
  productType: string;
  crossReferences: string[]; // ELIMFILTERS part numbers
  specifications?: { label: string; value: string }[]; // From the OEM's official product page (e.g. dimensions, thread size)
  oemCrossReferences?: { manufacturer: string; partNumber: string }[]; // Other-brand OEM codes listed on the OEM's own official page (not the crossreference.com sites)
  equipmentApplications?: { equipment: string; year: string; equipmentType: string; equipmentOptions: string; engine: string; engineOption: string }[]; // Fitment table from the OEM's official product page; not yet normalized into EQUIPMENT_REGISTRY/ENGINE_REGISTRY
  applications: ApplicationId[];
  equipment: EquipmentId[];
  engines: EngineId[];
  sourceUrl?: string; // The official OEM product page this entry was captured from
  status: 'ACTIVE' | 'OBSOLETE' | DocumentationPending;
}

// 3. CROSS REFERENCE REGISTRY
export interface CrossReferenceEntry {
  id: string; // Composite ID
  oemPartId: OemPartId;
  elimfiltersPartNumber: string;
  validationStatus: 'VALIDATED' | 'PENDING_VALIDATION' | DocumentationPending;
}

// 4. EQUIPMENT REGISTRY
export interface EquipmentEntry {
  id: EquipmentId;
  manufacturer: OemId;
  model: string;
  series: string;
  equipmentType: string;
  engineId: EngineId | DocumentationPending;
  protectionSystems: ProtectionSystemKey[];
  applications: ApplicationId[];
  supportedProducts: string[]; // ELIMFILTERS part numbers
}

// 5. ENGINE REGISTRY
export interface EngineEntry {
  id: EngineId;
  manufacturer: OemId;
  engineModel: string;
  displacement: string;
  fuelType: string;
  applications: ApplicationId[];
  equipment: EquipmentId[];
  protectionSystems: ProtectionSystemKey[];
  supportedProducts: string[]; // ELIMFILTERS part numbers
}

// 6. APPLICATION REGISTRY
export interface ApplicationEntry {
  id: ApplicationId; // e.g. "excavator", "loader"
  name: string;
  category: string;
  description: string | DocumentationPending;
}

// 9. PRODUCT PLATFORM REGISTRY
export interface ProductPlatformEntry {
  id: EcosystemKey; // 'MARINECLEAN' | 'DURATECH'
  name: string;
  description: string;
  supportedTechnologies: TechnologyKey[];
  supportedFamilies: FamilyKey[];
  supportedIndustries: string[];
}

// 10. PRODUCT FAMILY REGISTRY (Extended from existing definition)
export interface ProductFamilyEntry {
  id: FamilyKey;
  name: string;
  protectionSystem: ProtectionSystemKey;
  technology: TechnologyKey;
  platform: EcosystemKey | null;
  duty: 'HD' | 'LD' | 'MIXED';
  supportedProducts: string[]; // ELIMFILTERS part numbers
}
