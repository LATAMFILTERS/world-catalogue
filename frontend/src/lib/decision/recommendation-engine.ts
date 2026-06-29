/**
 * recommendation-engine.ts
 * ELIMFILTERS — Engineering Decision Engine v1.0
 *
 * Deterministically recommends technologies and cross-references them against the Asset Graph
 * to output available products and gaps.
 */

import type { MaintenanceProfile } from '../asset/asset-types';
import type { ProtectionStrategy, MaintenanceStrategy, TraceLink } from './decision-types';

export function buildRecommendation(params: {
  assetId: string;
  recommendedTechnologies: string[];
  protectionStrategy: ProtectionStrategy;
  maintenanceStrategy: MaintenanceStrategy;
  assetProfile: MaintenanceProfile | null;
}) {
  const { assetId, recommendedTechnologies, protectionStrategy, maintenanceStrategy, assetProfile } = params;
  
  const recommendedProductFamilies: string[] = [];
  const availableProducts = new Set<string>();
  const engineeringNotes: string[] = [];
  const trace: TraceLink[] = [];

  // Map technologies to product families (synthetic mapping for logic)
  const techToFamily: Record<string, string[]> = {
    'MACROCORE™': ['Heavy Duty Air', 'Off-Highway Air'],
    'HYDROCORE™': ['Water Separators', 'Fuel Coalescers'],
    'NANOFORCE™': ['High Pressure Hydraulics'],
    'MICROKAPPA™': ['Cabin Air Filters'],
    'SYNTEPORE™': ['Advanced Fuel Filters'],
    'SYNTRAX™': ['Air/Oil Separators'],
    'INTEKCORE™': ['Standard Lube', 'Standard Fuel', 'Standard Air'],
  };

  for (const tech of recommendedTechnologies) {
    if (techToFamily[tech]) {
      recommendedProductFamilies.push(...techToFamily[tech]);
      trace.push({
        step: `Map Technology to Family`,
        reference: `Tech Specs: ${tech}`,
        justification: `${tech} is deployed via the ${techToFamily[tech].join(', ')} families.`,
      });
    }
  }

  // Cross reference with actual asset profile (if provided)
  if (assetProfile) {
    // Add available ELIMFILTERS products
    for (const [systemId, products] of Object.entries(assetProfile.elimfiltersProducts)) {
      products.forEach(p => availableProducts.add(p));
    }
    
    // Transfer coverage gaps to maintenance strategy
    maintenanceStrategy.coverageGaps.push(...assetProfile.coverageGaps);

    if (assetProfile.coverageGaps.length > 0) {
      engineeringNotes.push('Warning: Asset has known coverage gaps. Certain recommended systems cannot be fulfilled by current product catalog.');
      trace.push({
        step: `Asset Graph Cross-reference`,
        reference: `Asset Graph DB`,
        justification: `Found ${assetProfile.coverageGaps.length} coverage gaps for asset ${assetId}.`,
      });
    }
  } else {
    engineeringNotes.push('Note: No asset profile provided. Recommendations are purely theoretical based on environment.');
  }

  return {
    assetId,
    recommendedTechnologies: Array.from(new Set(recommendedTechnologies)),
    recommendedProductFamilies: Array.from(new Set(recommendedProductFamilies)),
    availableProducts: Array.from(availableProducts),
    protectionStrategy,
    maintenanceStrategy,
    engineeringNotes,
    trace,
  };
}
