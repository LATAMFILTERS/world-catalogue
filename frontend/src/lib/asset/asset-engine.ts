/**
 * asset-engine.ts
 * ELIMFILTERS — Asset Intelligence Engine v1.0
 *
 * Graph Engine Orchestrator for Assets.
 * Provides the unified public API for the Asset graph.
 */

import type { AssetNode, AssetEdge, AssetNodeType, AssetEdgeDirection } from './asset-types';
import { ASSET_GRAPH, buildNodeId, buildEdgeId, resolveReachableNodes } from './asset-resolver';
import { generateMaintenanceProfile } from './maintenance-intelligence';
import { checkCompatibility, findCompatibleAssets } from './compatibility-engine';
import { analyzeAssetCoverage } from './coverage-engine';

// ============================================================================
// NODE REGISTRATION
// ============================================================================

export function registerAssetNode(params: {
  type: AssetNodeType;
  label: string;
  metadata?: Record<string, any>;
}): AssetNode {
  const node: AssetNode = {
    id: buildNodeId(params.type, params.label),
    type: params.type,
    label: params.label,
    metadata: params.metadata,
    addedAt: new Date().toISOString(),
  };
  ASSET_GRAPH.addNode(node);
  return node;
}

// ============================================================================
// EDGE REGISTRATION (RELATIONSHIPS)
// ============================================================================

export function registerAssetRelationship(params: {
  fromNodeId: string;
  toNodeId: string;
  direction: AssetEdgeDirection;
  weight?: number;
}): AssetEdge {
  const edge: AssetEdge = {
    id: buildEdgeId(params.fromNodeId, params.toNodeId, params.direction),
    fromNodeId: params.fromNodeId,
    toNodeId: params.toNodeId,
    direction: params.direction,
    addedAt: new Date().toISOString(),
    weight: params.weight ?? 1,
  };
  ASSET_GRAPH.addEdge(edge);
  return edge;
}

// ============================================================================
// PUBLIC API
// ============================================================================

export {
  ASSET_GRAPH,
  resolveReachableNodes,
  generateMaintenanceProfile,
  checkCompatibility,
  findCompatibleAssets,
  analyzeAssetCoverage
};

export function getAssetGraphStats() {
  return {
    totalNodes: ASSET_GRAPH.nodeCount,
    totalEdges: ASSET_GRAPH.edgeCount,
    totalAssets: ASSET_GRAPH.getNodesByType('ASSET').length,
    totalEngines: ASSET_GRAPH.getNodesByType('ENGINE').length,
  };
}
