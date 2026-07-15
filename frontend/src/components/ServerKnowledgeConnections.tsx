import { AIEntityCard } from '@/components/AIEntityCard';
import { CanonicalEntitySchema } from '@/components/CanonicalEntitySchema';
import { getCanonicalTechnology } from '@/lib/canonical-technologies';
import { getItemBySlug } from '@/lib/catalogue';
import { compareEntityAuthority } from '@/lib/entity-authority';
import { getFamilyBySlug } from '@/lib/product-families-data';
import { getProtectionSystemBySlug } from '@/lib/protection-systems-data';
import { getConnectedEntities, getEntityNode, type EntityKind, type EntityNode } from '@/lib/entity-graph';

type ConnectionKind = 'technology' | 'system' | 'family' | 'industry' | 'standard' | 'failure';

interface Props {
  kind: ConnectionKind;
  slug: string;
}

interface Group {
  label: string;
  links: Array<{ href: string; name: string }>;
}

function unique(nodes: EntityNode[]) {
  const nodesById = new Map<string, EntityNode>();
  for (const node of nodes) nodesById.set(node.id, node);

  const uniqueNodes: EntityNode[] = Array.from(nodesById.values());
  uniqueNodes.sort((a: EntityNode, b: EntityNode) => compareEntityAuthority(a, b));

  return uniqueNodes.map((node) => ({ href: node.href, name: node.name }));
}

function connected(id: string, targetKind: EntityKind) {
  return unique(getConnectedEntities(id, { targetKind }));
}

function entityId(kind: ConnectionKind, slug: string) {
  return `${kind}:${slug}`;
}

function buildGroups(kind: ConnectionKind, slug: string): { entityId: string; title: string; groups: Group[] } | null {
  if (kind === 'system') {
    const system = getProtectionSystemBySlug(slug);
    if (!system) return null;
    const id = entityId(kind, slug);
    return {
      entityId: id,
      title: `${system.name} connections`,
      groups: [
        { label: 'Technologies', links: connected(id, 'technology') },
        { label: 'Product Families', links: connected(id, 'family') },
        { label: 'Standards', links: connected(id, 'standard') },
        { label: 'Industries', links: connected(id, 'industry') },
        { label: 'Failure Modes Controlled', links: connected(id, 'failure') },
      ],
    };
  }

  if (kind === 'family') {
    const family = getFamilyBySlug(slug);
    if (!family) return null;
    const id = entityId(kind, slug);
    return {
      entityId: id,
      title: `${family.name} connections`,
      groups: [
        { label: 'Protection System', links: connected(id, 'system') },
        { label: 'Primary Technology', links: connected(id, 'technology') },
        { label: 'Standards', links: connected(id, 'standard') },
        { label: 'Industries', links: connected(id, 'industry') },
        { label: 'Failure Modes Controlled', links: connected(id, 'failure') },
      ],
    };
  }

  if (kind === 'technology') {
    const technology = getCanonicalTechnology(slug);
    const node = getEntityNode(entityId(kind, slug));
    if (!technology || !node) return null;
    return {
      entityId: node.id,
      title: `${technology.name} connections`,
      groups: [
        { label: 'Protection Systems', links: connected(node.id, 'system') },
        { label: 'Product Families', links: connected(node.id, 'family') },
        { label: 'Standards', links: connected(node.id, 'standard') },
        { label: 'Industries', links: connected(node.id, 'industry') },
        { label: 'Failure Modes Controlled', links: connected(node.id, 'failure') },
      ],
    };
  }

  if (kind === 'industry') {
    const item = getItemBySlug('industries', slug);
    const node = getEntityNode(entityId(kind, slug));
    if (!item || !node) return null;
    return {
      entityId: node.id,
      title: `${node.name} protection connections`,
      groups: [
        { label: 'Protection Systems', links: connected(node.id, 'system') },
        { label: 'Technologies', links: connected(node.id, 'technology') },
        { label: 'Product Families', links: connected(node.id, 'family') },
        { label: 'Standards', links: connected(node.id, 'standard') },
        { label: 'Failure Modes', links: connected(node.id, 'failure') },
      ],
    };
  }

  if (kind === 'standard') {
    const node = getEntityNode(entityId(kind, slug));
    if (!node) return null;
    return {
      entityId: node.id,
      title: `${node.name} engineering connections`,
      groups: [
        { label: 'Protection Systems', links: connected(node.id, 'system') },
        { label: 'Technologies', links: connected(node.id, 'technology') },
        { label: 'Product Families', links: connected(node.id, 'family') },
        { label: 'Industries', links: connected(node.id, 'industry') },
        { label: 'Failure Modes Addressed', links: connected(node.id, 'failure') },
      ],
    };
  }

  const node = getEntityNode(entityId(kind, slug));
  if (!node) return null;
  return {
    entityId: node.id,
    title: `${node.name} control connections`,
    groups: [
      { label: 'Protection Systems', links: connected(node.id, 'system') },
      { label: 'Technologies', links: connected(node.id, 'technology') },
      { label: 'Product Families', links: connected(node.id, 'family') },
      { label: 'Standards', links: connected(node.id, 'standard') },
      { label: 'Industries', links: connected(node.id, 'industry') },
    ],
  };
}

export function ServerKnowledgeConnections({ kind, slug }: Props) {
  const config = buildGroups(kind, slug);
  if (!config) return null;

  return (
    <>
      <CanonicalEntitySchema kind={kind} slug={slug} />
      <AIEntityCard kind={kind} slug={slug} />
    </>
  );
}
