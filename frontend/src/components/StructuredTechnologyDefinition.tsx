'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getItemBySlug } from '@/lib/catalogue';
import { getTechnologyEngineering } from '@/lib/canonical-engineering';
import { getIncomingEntities, getRelatedEntities } from '@/lib/entity-graph';

interface DefinitionRow {
  label: string;
  content?: string;
  links?: Array<{ href: string; name: string }>;
}

function humanize(value: string) {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function StructuredTechnologyDefinition() {
  const pathname = usePathname();
  const match = pathname.match(/^\/technologies\/([^/]+)\/?$/);
  if (!match) return null;

  const slug = match[1];
  const item = getItemBySlug('technologies', slug);
  const engineering = getTechnologyEngineering(slug);
  if (!item || !engineering) return null;

  const entityId = `technology:${slug}`;

  const incoming = getIncomingEntities(entityId, 'uses-technology');
  const families = incoming.filter((node) => node.kind === 'family');
  const systemNodes = incoming.filter((node) => node.kind === 'system');

  const standardsMap = new Map<string, { href: string; name: string }>();
  [...systemNodes, ...families].forEach((node) => {
    getRelatedEntities(node.id, 'validated-by').forEach((standard) => {
      standardsMap.set(standard.id, { href: standard.href, name: standard.name });
    });
  });

  const rows: DefinitionRow[] = [
    { label: 'Definition', content: engineering.definition },
    { label: 'Engineering Principle', content: engineering.engineeringPrinciple },
    { label: 'Control Strategy', content: engineering.controlStrategy },
    { label: 'Operational Impact', content: engineering.operationalImpact },
    {
      label: 'Protection Systems',
      links: systemNodes.map((node) => ({ href: node.href, name: node.name })),
    },
    {
      label: 'Product Families',
      links: families.map((node) => ({ href: node.href, name: node.name })),
    },
    {
      label: 'Applicable Standards',
      links: Array.from(standardsMap.values()),
    },
    {
      label: 'Related Knowledge',
      links: [{ href: '/knowledge-center/', name: 'Knowledge System' }],
    },
  ].filter((row) => row.content || (row.links && row.links.length > 0));

  return (
    <section className="structured-definition structured-definition--technology" aria-labelledby={`structured-definition-${slug}`}>
      <div className="structured-definition__inner">
        <p className="structured-definition__eyebrow">STRUCTURED TECHNOLOGY DEFINITION</p>
        <h2 id={`structured-definition-${slug}`} className="structured-definition__title">
          {engineering.name || item.title || humanize(slug)}
        </h2>

        <div className="structured-definition__grid">
          {rows.map((row) => (
            <article key={row.label} className="structured-definition__row">
              <h3>{row.label}</h3>
              {row.content && <p>{row.content}</p>}
              {row.links && row.links.length > 0 && (
                <div className="structured-definition__links">
                  {row.links.map((link) => (
                    <Link key={`${row.label}-${link.href}-${link.name}`} href={link.href}>
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
