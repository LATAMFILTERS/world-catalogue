/**
 * maintenance-intelligence.ts
 * ELIMFILTERS — Asset Intelligence Engine v1.0
 *
 * Maintenance Intelligence Engine.
 * Automatically determines required protection systems, maintenance kits,
 * available ELIMFILTERS products, OEM equivalents, and coverage gaps for an asset.
 */

import type { MaintenanceProfile } from './asset-types';
import { ASSET_GRAPH, resolveReachableNodes } from './asset-resolver';

export function generateMaintenanceProfile(assetId: string): MaintenanceProfile {
  const asset = ASSET_GRAPH.getNode(assetId);
  if (!asset || asset.type !== 'ASSET') {
    throw new Error('Invalid Asset ID');
  }

  // 1. Gather all required protection systems (direct or via engine)
  const systems = resolveReachableNodes(assetId, 'PROTECTION_SYSTEM', 3);
  const systemIds = systems.map(s => s.id);

  // 2. Gather recommended kits (direct or via engine)
  const kits = resolveReachableNodes(assetId, 'MAINTENANCE_KIT', 3);
  const kitIds = kits.map(k => k.id);

  // 3. Resolve products and OEMs for each system
  const elimfiltersProducts: Record<string, string[]> = {};
  const oemEquivalents: Record<string, string[]> = {};
  const coverageGaps: string[] = [];

  for (const system of systems) {
    // Traverse from system to OEM part
    const oemParts = resolveReachableNodes(system.id, 'OEM_PART', 1);
    
    if (oemParts.length === 0) {
      coverageGaps.push(`System ${system.label} has no known OEM parts for this asset.`);
      continue;
    }

    oemEquivalents[system.id] = oemParts.map(p => p.id);
    elimfiltersProducts[system.id] = [];

    // Traverse from OEM part to ELIMFILTERS part
    for (const oemPart of oemParts) {
      const elimParts = resolveReachableNodes(oemPart.id, 'ELIMFILTERS_PRODUCT', 1);
      if (elimParts.length > 0) {
        elimfiltersProducts[system.id].push(...elimParts.map(p => p.id));
      } else {
        coverageGaps.push(`OEM Part ${oemPart.label} has no ELIMFILTERS cross-reference.`);
      }
    }

    // Deduplicate ELIMFILTERS products
    elimfiltersProducts[system.id] = Array.from(new Set(elimfiltersProducts[system.id]));
  }

  if (systemIds.length === 0) {
    coverageGaps.push(`Asset has no defined protection systems.`);
  }

  return {
    assetId,
    systemsRequired: systemIds,
    recommendedKits: kitIds,
    elimfiltersProducts,
    oemEquivalents,
    coverageGaps,
  };
}
