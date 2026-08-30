/**
 * asset-types.ts
 * ELIMFILTERS — Asset Intelligence Engine v1.0
 *
 * Core type definitions for the Asset Knowledge Graph.
 * The Asset is the primary entity of the ecosystem.
 */

// ============================================================================
// GRAPH NODE TYPES
// ============================================================================

export type AssetNodeType =
  | 'ASSET'
  | 'MANUFACTURER'
  | 'SERIES'
  | 'ENGINE'
  | 'APPLICATION'
  | 'PROTECTION_SYSTEM'
  | 'MAINTENANCE_KIT'
  | 'OEM_PART'
  | 'ELIMFILTERS_PRODUCT'
  | 'TECHNOLOGY';

export interface AssetNode {
  id: string;
  type: AssetNodeType;
  label: string; // Human-readable name
  metadata?: Record<string, any>;
  addedAt: string;
}

// ============================================================================
// GRAPH EDGE TYPES (RELATIONSHIPS)
// ============================================================================

export type AssetEdgeDirection =
  | 'ASSET_TO_MANUFACTURER'
  | 'ASSET_TO_SERIES'
  | 'ASSET_TO_ENGINE'
  | 'ASSET_TO_APPLICATION'
  | 'ENGINE_TO_SYSTEM'
  | 'SYSTEM_TO_OEM_PART'
  | 'OEM_PART_TO_ELIMFILTERS'
  | 'ELIMFILTERS_TO_TECHNOLOGY'
  | 'ASSET_TO_KIT'
  | 'RELATED_ASSET';

export interface AssetEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  direction: AssetEdgeDirection;
  addedAt: string;
  weight: number; // For compatibility/scoring
}

// ============================================================================
// MAINTENANCE INTELLIGENCE
// ============================================================================

export interface MaintenanceProfile {
  assetId: string;
  systemsRequired: string[];
  recommendedKits: string[];
  elimfiltersProducts: Record<string, string[]>; // System -> Part Numbers
  oemEquivalents: Record<string, string[]>;      // System -> OEM Part Numbers
  coverageGaps: string[]; // Missing systems or products
}

// ============================================================================
// COMPATIBILITY ENGINE
// ============================================================================

export interface AssetCompatibility {
  assetA: string;
  assetB: string;
  sharedEngine: boolean;
  sharedSystems: string[];
  sharedOemParts: string[];
  sharedTechnologies: string[];
  sharedMaintenanceKits: string[];
  compatibilityScore: number; // 0-100
}

// ============================================================================
// COVERAGE ENGINE
// ============================================================================

export interface AssetCoverageReport {
  generatedAt: string;
  totalAssets: number;
  assetsWithCompleteCoverage: number;
  assetsWithMissingSystems: number;
  assetsWithMissingProducts: number;
  assetsRequiringReview: number;
  coverageByOem: Record<string, number>;
  coverageByIndustry: Record<string, number>;
  coverageByEngine: Record<string, number>;
  coverageByApplication: Record<string, number>;
}
