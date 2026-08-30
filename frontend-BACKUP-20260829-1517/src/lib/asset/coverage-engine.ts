/**
 * coverage-engine.ts
 * ELIMFILTERS — Asset Intelligence Engine v1.0
 *
 * Asset Coverage Engine.
 * Generates comprehensive coverage metrics centered on assets.
 */

import type { AssetCoverageReport } from './asset-types';
import { ASSET_GRAPH, resolveReachableNodes } from './asset-resolver';
import { generateMaintenanceProfile } from './maintenance-intelligence';

export function analyzeAssetCoverage(): AssetCoverageReport {
  const assets = ASSET_GRAPH.getNodesByType('ASSET');
  
  let completeCoverage = 0;
  let missingSystems = 0;
  let missingProducts = 0;
  let requiringReview = 0;

  const coverageByOem: Record<string, number> = {};
  const coverageByIndustry: Record<string, number> = {};
  const coverageByEngine: Record<string, number> = {};
  const coverageByApplication: Record<string, number> = {};

  for (const asset of assets) {
    const profile = generateMaintenanceProfile(asset.id);
    let hasCompleteCoverage = true;

    if (profile.systemsRequired.length === 0) {
      missingSystems++;
      hasCompleteCoverage = false;
    }

    if (profile.coverageGaps.length > 0 && profile.systemsRequired.length > 0) {
      missingProducts++;
      hasCompleteCoverage = false;
    }

    if (hasCompleteCoverage) {
      completeCoverage++;
    } else {
      requiringReview++;
    }

    // Rollup by OEM/Manufacturer
    const manufacturers = resolveReachableNodes(asset.id, 'MANUFACTURER', 2);
    for (const m of manufacturers) {
      coverageByOem[m.label] = (coverageByOem[m.label] || 0) + 1;
    }

    // Rollup by Engine
    const engines = resolveReachableNodes(asset.id, 'ENGINE', 2);
    for (const e of engines) {
      coverageByEngine[e.label] = (coverageByEngine[e.label] || 0) + 1;
    }

    // Rollup by Application
    const apps = resolveReachableNodes(asset.id, 'APPLICATION', 3);
    for (const a of apps) {
      coverageByApplication[a.label] = (coverageByApplication[a.label] || 0) + 1;
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    totalAssets: assets.length,
    assetsWithCompleteCoverage: completeCoverage,
    assetsWithMissingSystems: missingSystems,
    assetsWithMissingProducts: missingProducts,
    assetsRequiringReview: requiringReview,
    coverageByOem,
    coverageByIndustry, // Requires industry nodes in graph
    coverageByEngine,
    coverageByApplication,
  };
}
