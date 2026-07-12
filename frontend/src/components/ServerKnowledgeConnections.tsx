import Link from 'next/link';
import { AIEntityCard } from '@/components/AIEntityCard';
import { CanonicalEntitySchema } from '@/components/CanonicalEntitySchema';
import { getCanonicalTechnology } from '@/lib/canonical-technologies';
import { getItemBySlug } from '@/lib/catalogue';
import { compareEntityAuthority, getEntityAuthorityScore } from '@/lib/entity-authority';
import { getFamilyBySlug } from '@/lib/product-families-data';
import { getProtectionSystemBySlug } from '@/lib/protection-systems-data';
import { getConnectedEntities, getEntityNode, type EntityKind, type EntityNode } from '@/lib/entity-graph';
import { getSemanticRecommendations } from '@/lib/semantic-recommendations';
import { buildTopicCluster } from '@/lib/topical-authority';

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
  return Array.from(new Map(nodes.map((node) => [node.id, node])).values())
    .sort(compareEntityAuthority)
    .map((node) => ({ href: node.href, name: node.name }));
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

  const cluster = buildTopicCluster(config.entityId);
  const authority = getEntityAuthorityScore(config.entityId);

  // AIEntityCard (rendered below) already lists these same relationship
  // groups, so they're only used here to dedupe the recommendations below,
  // not rendered a second time.
  const displayedHrefs = new Set(
    config.groups.flatMap((group) => group.links.map((link) => link.href)),
  );
  const recommendations = getSemanticRecommendations(config.entityId, { limit: 20 })
    .filter((recommendation) => recommendation.reason === 'shared-context')
    .filter((recommendation) => !displayedHrefs.has(recommendation.node.href))
    .sort((a, b) => compareEntityAuthority(a.node, b.node))
    .slice(0, 6)
    .map((recommendation) => ({
      href: recommendation.node.href,
      name: recommendation.node.name,
    }));

  const topicalPath = cluster
    ? [cluster.hub, ...cluster.recommended]
      .filter((node, index, all) => node.id !== config.entityId && all.findIndex((candidate) => candidate.id === node.id) === index)
      .sort(compareEntityAuthority)
      .slice(0, 6)
    : [];

  const exploreGroups: Group[] = [];
  if (recommendations.length > 0) exploreGroups.push({ label: 'Recommended Next', links: recommendations });
  if (topicalPath.length > 0) exploreGroups.push({ label: 'Related Topics', links: topicalPath.map((node) => ({ href: node.href, name: node.name })) });

  return (
    <>
      <CanonicalEntitySchema kind={kind} slug={slug} />
      <AIEntityCard kind={kind} slug={slug} />
      {exploreGroups.length > 0 && (
        <section
          className="structured-definition structured-definition--connections"
          aria-label="Continue exploring related resources"
          data-topic-cluster={cluster?.hub.id}
          data-entity-authority={authority?.score}
          data-authority-breadth={authority?.coverageBreadth}
        >
          <div className="structured-definition__inner">
            <p className="structured-definition__eyebrow">CONTINUE EXPLORING</p>
            <div className="structured-definition__grid">
              {exploreGroups.map((group) => (
                <article className="structured-definition__row" key={group.label}>
                  <h3>{group.label}</h3>
                  <div className="structured-definition__links">
                    {group.links.map((link) => <Link key={`${group.label}-${link.href}`} href={link.href}>{link.name}</Link>)}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
