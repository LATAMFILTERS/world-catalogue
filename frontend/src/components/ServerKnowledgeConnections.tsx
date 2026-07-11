import Link from 'next/link';
import { getItemBySlug } from '@/lib/catalogue';
import { getFamilyBySlug } from '@/lib/product-families-data';
import { getProtectionSystemBySlug } from '@/lib/protection-systems-data';
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

function failuresForEntity(id: string) {
  return unique([
    ...getRelatedEntities(id, 'controls-failure'),
    ...getRelatedEntities(id, 'mitigates-failure'),
    ...getRelatedEntities(id, 'addresses-failure'),
    ...getRelatedEntities(id, 'exposed-to-failure'),
  ]);
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
        { label: 'Failure Modes Controlled', links: failuresForEntity(id) },
      ],
    };
  }

  if (kind === 'family') {
    const family = getFamilyBySlug(slug);
    if (!family) return null;
    const id = `family:${slug}`;
    const systems = getRelatedEntities(id, 'belongs-to');
    const industries = systems.flatMap((system) => getRelatedEntities(system.id, 'applied-in'));
    return {
      title: `${family.name} connections`,
      groups: [
        { label: 'Protection System', links: unique(systems) },
        { label: 'Primary Technology', links: unique(getRelatedEntities(id, 'uses-technology')) },
        { label: 'Standards', links: unique(getRelatedEntities(id, 'validated-by')) },
        { label: 'Industries', links: unique(industries) },
        { label: 'Failure Modes Controlled', links: failuresForEntity(id) },
      ],
    };
  }

  if (kind === 'technology') {
    const item = getItemBySlug('technologies', slug);
    const node = getEntityNode(`technology:${slug}`);
    if (!item || !node) return null;
    const systems = getIncomingEntities(node.id, 'uses-technology').filter((entry) => entry.kind === 'system');
    const families = getIncomingEntities(node.id, 'uses-technology').filter((entry) => entry.kind === 'family');
    const standards = [...systems, ...families].flatMap((entry) => getRelatedEntities(entry.id, 'validated-by'));
    const industries = systems.flatMap((entry) => getRelatedEntities(entry.id, 'applied-in'));
    return {
      title: `${node.name} connections`,
      groups: [
        { label: 'Protection Systems', links: unique(systems) },
        { label: 'Product Families', links: unique(families) },
        { label: 'Standards', links: unique(standards) },
        { label: 'Industries', links: unique(industries) },
        { label: 'Failure Modes Controlled', links: failuresForEntity(node.id) },
      ],
    };
  }

  if (kind === 'industry') {
    const item = getItemBySlug('industries', slug);
    const node = getEntityNode(`industry:${slug}`);
    if (!item || !node) return null;
    const systems = getIncomingEntities(node.id, 'applied-in').filter((entry) => entry.kind === 'system');
    const technologies = systems.flatMap((entry) => getRelatedEntities(entry.id, 'uses-technology'));
    const families = systems.flatMap((entry) => getRelatedEntities(entry.id, 'contains-family'));
    const standards = systems.flatMap((entry) => getRelatedEntities(entry.id, 'validated-by'));
    return {
      title: `${node.name} protection connections`,
      groups: [
        { label: 'Protection Systems', links: unique(systems) },
        { label: 'Technologies', links: unique(technologies) },
        { label: 'Product Families', links: unique(families) },
        { label: 'Standards', links: unique(standards) },
        { label: 'Failure Modes', links: failuresForEntity(node.id) },
      ],
    };
  }

  if (kind === 'standard') {
    const node = getEntityNode(`standard:${slug}`);
    if (!node) return null;
    const systems = getIncomingEntities(node.id, 'validated-by').filter((entry) => entry.kind === 'system');
    const families = getIncomingEntities(node.id, 'validated-by').filter((entry) => entry.kind === 'family');
    const technologies = [...systems, ...families].flatMap((entry) => getRelatedEntities(entry.id, 'uses-technology'));
    const industries = systems.flatMap((entry) => getRelatedEntities(entry.id, 'applied-in'));
    return {
      title: `${node.name} engineering connections`,
      groups: [
        { label: 'Protection Systems', links: unique(systems) },
        { label: 'Technologies', links: unique(technologies) },
        { label: 'Product Families', links: unique(families) },
        { label: 'Industries', links: unique(industries) },
        { label: 'Failure Modes Addressed', links: failuresForEntity(node.id) },
      ],
    };
  }

  const node = getEntityNode(`failure:${slug}`);
  if (!node) return null;
  return {
    title: `${node.name} control connections`,
    groups: [
      { label: 'Protection Systems', links: unique(getIncomingEntities(node.id, 'controls-failure').filter((entry) => entry.kind === 'system')) },
      { label: 'Technologies', links: unique(getIncomingEntities(node.id, 'mitigates-failure')) },
      { label: 'Product Families', links: unique(getIncomingEntities(node.id, 'controls-failure').filter((entry) => entry.kind === 'family')) },
      { label: 'Standards', links: unique(getIncomingEntities(node.id, 'addresses-failure')) },
      { label: 'Industries', links: unique(getIncomingEntities(node.id, 'exposed-to-failure')) },
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
