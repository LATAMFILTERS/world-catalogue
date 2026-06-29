/**
 * decision-types.ts
 * ELIMFILTERS — Engineering Decision Engine v1.0
 *
 * Deterministic types and interfaces for engineering decisions.
 */

export type RiskLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

export interface OperatingEnvironment {
  industry: string;
  application: string;
  dutyClass: string;
  dustLevel?: RiskLevel;
  waterLevel?: RiskLevel;
  fuelQuality?: RiskLevel;
  hydraulicContamination?: RiskLevel;
}

export interface ContaminationProfile {
  dustExposure: RiskLevel;
  waterRisk: RiskLevel;
  fuelQualityRisk: RiskLevel;
  hydraulicContaminationRisk: RiskLevel;
  coolingSystemRisk: RiskLevel;
  cabinAirRisk: RiskLevel;
  compressedAirRisk: RiskLevel;
}

export interface EngineeringRule {
  id: string;
  condition: (env: OperatingEnvironment, profile: ContaminationProfile) => boolean;
  reference: string;
  justification: string;
  action: {
    technology?: string;
    systemType?: string;
    required?: boolean;
    priority?: string;
  };
}

export interface TraceLink {
  step: string;
  reference: string;
  justification: string;
}

export interface ProtectionStrategy {
  systems: {
    systemType: string;
    required: boolean;
    reason: string;
  }[];
  coverageLevel: string;
  justification: string;
  trace: TraceLink[];
}

export interface MaintenanceStrategy {
  criticalSystems: string[];
  inspectionPriorities: string[];
  replacementPriorities: string[];
  recommendedSequence: string[];
  coverageGaps: string[];
  trace: TraceLink[];
}

export interface EngineeringRecommendation {
  assetId: string;
  recommendedTechnologies: string[];
  recommendedProductFamilies: string[];
  availableProducts: string[];
  protectionStrategy: ProtectionStrategy;
  maintenanceStrategy: MaintenanceStrategy;
  engineeringNotes: string[];
  trace: TraceLink[];
}
