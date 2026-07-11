import Link from 'next/link';
import { getCanonicalTechnology } from '@/lib/canonical-technologies';
import { getItemBySlug } from '@/lib/catalogue';
import { getFamilyBySlug } from '@/lib/product-families-data';
import { getProtectionSystemBySlug } from '@/lib/protection-systems-data';
import { getConnectedEntities, getEntityNode, type EntityKind } from '@/lib/entity-graph';
import { getSemanticRecommendations } from '@/lib/semantic-recommendations';

type ConnectionKind = 'technology' | 'system' | 'family' | 'industry' | 'standard' | 'failure';

interface Props {
  kind: ConnectionKind;
  slug: string;
}

interface Group {
  label: string;
  links: Array<{ href: string; name: string }>;
}

function unique(nodes: Array<{ id: string; href: string; name: string }>) {
  return Array.from(new Map(nodes.map((node) => [node.id, { href: node.href, name: node.name }])).values());
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

  const groups = config.groups.filter((group) => group.links.length > 0);
  const displayedHrefs = new Set(groups.flatMap((group) => group.links.map((link) => link.href)));
  const recommendations = getSemanticRecommendations(config.entityId, { limit: 10 })
    .filter((recommendation) => recommendation.reason === 'shared-context')
    .filter((recommendation) => !displayedHrefs.has(recommendation.node.href))
    .slice(0, 6)
    .map((recommendation) => ({
      href: recommendation.node.href,
      name: recommendation.node.name,
    }));

  if (recommendations.length > 0) {
    groups.push({ label: 'Recommended Next', links: recommendations });
  }

  if (groups.length === 0) return null;

  return (
    <section className="structured-definition structured-definition--connections" aria-label="Engineering knowledge connections">
      <div className="structured-definition__inner">
        <p className="structured-definition__eyebrow">ENGINEERING KNOWLEDGE CONNECTIONS</p>
        <h2 className="structured-definition__title">{config.title}</h2>
        <div className="structured-definition__grid">
          {groups.map((group) => (
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
  );
}
