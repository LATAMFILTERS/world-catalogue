import {
  INDUSTRIAL_PROCESS_PLATFORMS,
  industrialProcessPlatformUrl,
  industrialProcessTechnologyUrl,
} from './industrial-process-architecture';

export type IndustrialProcessEntityKind =
  | 'industrial-process'
  | 'industrial-platform'
  | 'industrial-treatment-family';

export interface IndustrialProcessEntityNode {
  readonly id: string;
  readonly kind: IndustrialProcessEntityKind;
  readonly name: string;
  readonly href: string;
  readonly parentId?: string;
}

export interface IndustrialProcessEntityRelation {
  readonly from: string;
  readonly to: string;
  readonly type: 'contains' | 'belongs-to';
}

const ROOT_ID = 'industrial-process:root';

const rootNode: IndustrialProcessEntityNode = {
  id: ROOT_ID,
  kind: 'industrial-process',
  name: 'Industrial & Process',
  href: '/industrial-process/',
};

const platformNodes: IndustrialProcessEntityNode[] = INDUSTRIAL_PROCESS_PLATFORMS.map((platform) => ({
  id: `industrial-platform:${platform.slug}`,
  kind: 'industrial-platform',
  name: platform.name,
  href: industrialProcessPlatformUrl(platform.slug),
  parentId: ROOT_ID,
}));

const treatmentFamilyNodes: IndustrialProcessEntityNode[] = INDUSTRIAL_PROCESS_PLATFORMS.flatMap((platform) =>
  platform.technologies.map((technology) => ({
    id: `industrial-treatment-family:${platform.slug}/${technology.slug}`,
    kind: 'industrial-treatment-family' as const,
    name: technology.name,
    href: industrialProcessTechnologyUrl(platform.slug, technology.slug),
    parentId: `industrial-platform:${platform.slug}`,
  })),
);

export const INDUSTRIAL_PROCESS_ENTITY_NODES: readonly IndustrialProcessEntityNode[] = [
  rootNode,
  ...platformNodes,
  ...treatmentFamilyNodes,
];

export const INDUSTRIAL_PROCESS_ENTITY_RELATIONS: readonly IndustrialProcessEntityRelation[] = [
  ...platformNodes.flatMap((platform) => [
    { from: ROOT_ID, to: platform.id, type: 'contains' as const },
    { from: platform.id, to: ROOT_ID, type: 'belongs-to' as const },
  ]),
  ...treatmentFamilyNodes.flatMap((family) => [
    { from: family.parentId!, to: family.id, type: 'contains' as const },
    { from: family.id, to: family.parentId!, type: 'belongs-to' as const },
  ]),
];

const nodeById = new Map(INDUSTRIAL_PROCESS_ENTITY_NODES.map((node) => [node.id, node]));

export function getIndustrialProcessEntity(id: string): IndustrialProcessEntityNode | undefined {
  return nodeById.get(id);
}

export function getIndustrialProcessChildren(id: string): IndustrialProcessEntityNode[] {
  return INDUSTRIAL_PROCESS_ENTITY_RELATIONS
    .filter((relation) => relation.from === id && relation.type === 'contains')
    .map((relation) => nodeById.get(relation.to))
    .filter((node): node is IndustrialProcessEntityNode => Boolean(node));
}

export function validateIndustrialProcessEntityGraph() {
  const ids = INDUSTRIAL_PROCESS_ENTITY_NODES.map((node) => node.id);
  const duplicateNodeIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const idSet = new Set(ids);
  const orphanRelations = INDUSTRIAL_PROCESS_ENTITY_RELATIONS
    .filter((relation) => !idSet.has(relation.from) || !idSet.has(relation.to))
    .map((relation) => `${relation.from}->${relation.to}`);
  const isolatedNodes = INDUSTRIAL_PROCESS_ENTITY_NODES
    .filter((node) => node.id !== ROOT_ID)
    .filter((node) => !INDUSTRIAL_PROCESS_ENTITY_RELATIONS.some((relation) => relation.from === node.id || relation.to === node.id))
    .map((node) => node.id);

  return {
    duplicateNodeIds: Array.from(new Set(duplicateNodeIds)),
    orphanRelations: Array.from(new Set(orphanRelations)),
    isolatedNodes,
    expectedNodeCount: 1 + INDUSTRIAL_PROCESS_PLATFORMS.length +
      INDUSTRIAL_PROCESS_PLATFORMS.reduce((sum, platform) => sum + platform.technologies.length, 0),
    actualNodeCount: INDUSTRIAL_PROCESS_ENTITY_NODES.length,
    isValid:
      duplicateNodeIds.length === 0 &&
      orphanRelations.length === 0 &&
      isolatedNodes.length === 0 &&
      INDUSTRIAL_PROCESS_ENTITY_NODES.length ===
        1 + INDUSTRIAL_PROCESS_PLATFORMS.length +
        INDUSTRIAL_PROCESS_PLATFORMS.reduce((sum, platform) => sum + platform.technologies.length, 0),
  };
}
