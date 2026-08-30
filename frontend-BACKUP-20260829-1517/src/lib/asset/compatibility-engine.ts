/**
 * compatibility-engine.ts
 * ELIMFILTERS — Asset Intelligence Engine v1.0
 *
 * Detects compatibility and shared components across different assets.
 */

import type { AssetCompatibility } from './asset-types';
import { ASSET_GRAPH, resolveReachableNodes } from './asset-resolver';

export function checkCompatibility(assetIdA: string, assetIdB: string): AssetCompatibility {
  const assetA = ASSET_GRAPH.getNode(assetIdA);
  const assetB = ASSET_GRAPH.getNode(assetIdB);

  if (!assetA || !assetB || assetA.type !== 'ASSET' || assetB.type !== 'ASSET') {
    throw new Error('Both nodes must be of type ASSET');
  }

  // Resolve components for Asset A
  const enginesA = resolveReachableNodes(assetIdA, 'ENGINE', 2).map(n => n.id);
  const systemsA = resolveReachableNodes(assetIdA, 'PROTECTION_SYSTEM', 3).map(n => n.id);
  const oemPartsA = resolveReachableNodes(assetIdA, 'OEM_PART', 4).map(n => n.id);
  const techA = resolveReachableNodes(assetIdA, 'TECHNOLOGY', 5).map(n => n.id);
  const kitsA = resolveReachableNodes(assetIdA, 'MAINTENANCE_KIT', 2).map(n => n.id);

  // Resolve components for Asset B
  const enginesB = resolveReachableNodes(assetIdB, 'ENGINE', 2).map(n => n.id);
  const systemsB = resolveReachableNodes(assetIdB, 'PROTECTION_SYSTEM', 3).map(n => n.id);
  const oemPartsB = resolveReachableNodes(assetIdB, 'OEM_PART', 4).map(n => n.id);
  const techB = resolveReachableNodes(assetIdB, 'TECHNOLOGY', 5).map(n => n.id);
  const kitsB = resolveReachableNodes(assetIdB, 'MAINTENANCE_KIT', 2).map(n => n.id);

  // Intersections
  const sharedEngine = enginesA.some(e => enginesB.includes(e));
  const sharedSystems = systemsA.filter(s => systemsB.includes(s));
  const sharedOemParts = oemPartsA.filter(p => oemPartsB.includes(p));
  const sharedTechnologies = techA.filter(t => techB.includes(t));
  const sharedMaintenanceKits = kitsA.filter(k => kitsB.includes(k));

  // Compute Score (0-100)
  let score = 0;
  if (sharedEngine) score += 40;
  if (sharedMaintenanceKits.length > 0) score += 30;
  if (sharedOemParts.length > 0) score += 20;
  if (sharedTechnologies.length > 0) score += 10;

  return {
    assetA: assetIdA,
    assetB: assetIdB,
    sharedEngine,
    sharedSystems,
    sharedOemParts,
    sharedTechnologies,
    sharedMaintenanceKits,
    compatibilityScore: Math.min(100, score),
  };
}

export function findCompatibleAssets(assetId: string, minScore = 20): AssetCompatibility[] {
  const allAssets = ASSET_GRAPH.getNodesByType('ASSET');
  const results: AssetCompatibility[] = [];

  for (const asset of allAssets) {
    if (asset.id === assetId) continue;
    const compat = checkCompatibility(assetId, asset.id);
    if (compat.compatibilityScore >= minScore) {
      results.push(compat);
    }
  }

  return results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}
