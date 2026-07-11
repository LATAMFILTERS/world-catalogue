import Link from 'next/link';
import { getItemBySlug } from '@/lib/catalogue';
import { getFamilyBySlug } from '@/lib/product-families-data';
import { getProtectionSystemBySlug } from '@/lib/protection-systems-data';
import { getFailureKnowledgeProfile } from '@/lib/failure-knowledge';
import { getEntityNode, getIncomingEntities, getRelatedEntities } from '@/lib/entity-graph';

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

function entityLinks(prefix: string, slugs: readonly string[]) {
  return slugs
    .map((slug) => getEntityNode(`${prefix}:${slug}`))
    .filter((node): node is NonNullable<typeof node> => Boolean(node))
    .map((node) => ({ href: node.href, name: node.name }));
}

function buildGroups(kind: ConnectionKind, slug: string): { title: string; groups: Group[] } | null {
  if (kind === 'system') {
    const system = getProtectionSystemBySlug(slug);
    if (!system) return null;
    const id = `system:${slug}`;
    return {
      title: `${system.name} connections`,
      groups: [
        { label: 'Technologies', links: unique(getRelatedEntities(id, 'uses-technology')) },
        { label: 'Product Families', links: unique(getRelatedEntities(id, 'contains-family')) },
        { label: 'Standards', links: unique(getRelatedEntities(id, 'validated-by')) },
        { label: 'Industries', links: unique(getRelatedEntities(id, 'applied-in')) },
      ],
    };
  }

  if (kind === 'family') {
    const family = getFamilyBySlug(slug);
    if (!family) return null;
    const id = `family:${slug}`;
    return {
      title: `${family.name} connections`,
      groups: [
        { label: 'Protection System', links: unique(getRelatedEntities(id, 'belongs-to')) },
        { label: 'Primary Technology', links: unique(getRelatedEntities(id, 'uses-technology')) },
        { label: 'Standards', links: unique(getRelatedEntities(id, 'validated-by')) },
      ],
    };
  }

  if (kind === 'technology') {
    const item = getItemBySlug('technologies', slug);
    if (!item) return null;
    const id = `technology:${slug}`;
    return {
      title: `${item.title} connections`,
      groups: [
        { label: 'Protection Systems', links: unique(getIncomingEntities(id, 'uses-technology').filter((node) => node.kind === 'system')) },
        { label: 'Product Families', links: unique(getIncomingEntities(id, 'uses-technology').filter((node) => node.kind === 'family')) },
      ],
    };
  }

  if (kind === 'industry') {
    const item = getItemBySlug('industries', slug);
    if (!item) return null;
    const id = `industry:${slug}`;
    const systems = getIncomingEntities(id, 'applied-in').filter((node) => node.kind === 'system');
    const technologies = systems.flatMap((node) => getRelatedEntities(node.id, 'uses-technology'));
    const families = systems.flatMap((node) => getRelatedEntities(node.id, 'contains-family'));
    return {
      title: `${item.title} protection connections`,
      groups: [
        { label: 'Protection Systems', links: unique(systems) },
        { label: 'Technologies', links: unique(technologies) },
        { label: 'Product Families', links: unique(families) },
      ],
    };
  }

  if (kind === 'standard') {
    const node = getEntityNode(`standard:${slug}`);
    if (!node) return null;
    const systems = getIncomingEntities(node.id, 'validated-by').filter((item) => item.kind === 'system');
    const families = getIncomingEntities(node.id, 'validated-by').filter((item) => item.kind === 'family');
    const technologies = [...systems, ...families].flatMap((item) => getRelatedEntities(item.id, 'uses-technology'));
    return {
      title: `${node.name} engineering connections`,
      groups: [
        { label: 'Protection Systems', links: unique(systems) },
        { label: 'Technologies', links: unique(technologies) },
        { label: 'Product Families', links: unique(families) },
      ],
    };
  }

  const failure = getFailureKnowledgeProfile(slug);
  if (!failure) return null;
  return {
    title: `${failure.name} control connections`,
    groups: [
      { label: 'Protection Systems', links: entityLinks('system', failure.systems) },
      { label: 'Technologies', links: entityLinks('technology', failure.technologies) },
      { label: 'Product Families', links: entityLinks('family', failure.families) },
      { label: 'Standards', links: entityLinks('standard', failure.standards) },
      { label: 'Industries', links: entityLinks('industry', failure.industries) },
    ],
  };
}

export function ServerKnowledgeConnections({ kind, slug }: Props) {
  const config = buildGroups(kind, slug);
  if (!config) return null;
  const groups = config.groups.filter((group) => group.links.length > 0);
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
