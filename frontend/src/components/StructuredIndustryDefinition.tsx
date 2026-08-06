'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getItemBySlug } from '@/lib/catalogue';
import { getIncomingEntities, getRelatedEntities } from '@/lib/entity-graph';

interface DefinitionRow {
  label: string;
  content?: string;
  links?: Array<{ href: string; name: string }>;
}

export function StructuredIndustryDefinition() {
  const pathname = usePathname();
  const match = pathname.match(/^\/industries\/([^/]+)\/?$/);
  if (!match) return null;

  const slug = match[1];
  const industry = getItemBySlug('industries', slug);
  if (!industry) return null;

  const industryId = `industry:${slug}`;
  const systems = getIncomingEntities(industryId, 'applied-in').filter((node) => node.kind === 'system');

  const technologies = new Map<string, { href: string; name: string }>();
  const families = new Map<string, { href: string; name: string }>();
  const standards = new Map<string, { href: string; name: string }>();

  systems.forEach((system) => {
    getRelatedEntities(system.id, 'uses-technology').forEach((node) => {
      technologies.set(node.id, { href: node.href, name: node.name });
    });
    getRelatedEntities(system.id, 'contains-family').forEach((node) => {
      families.set(node.id, { href: node.href, name: node.name });
    });
    getRelatedEntities(system.id, 'validated-by').forEach((node) => {
      standards.set(node.id, { href: node.href, name: node.name });
    });
  });

  const rows: DefinitionRow[] = [
    { label: 'Industry Definition', content: industry.description },
    {
      label: 'Recommended Protection Systems',
      links: systems.map((node) => ({ href: node.href, name: node.name })),
    },
    {
      label: 'Related Technologies',
      links: Array.from(technologies.values()),
    },
    {
      label: 'Product Families',
      links: Array.from(families.values()),
    },
    {
      label: 'Applicable Standards',
      links: Array.from(standards.values()),
    },
    {
      label: 'Related Knowledge',
      links: [{ href: '/knowledge-center/', name: 'Knowledge System' }],
    },
  ].filter((row) => row.content || (row.links && row.links.length > 0));

  return (
    <section className="structured-definition structured-definition--industry" aria-labelledby={`structured-industry-${slug}`}>
      <div className="structured-definition__inner">
        <p className="structured-definition__eyebrow">STRUCTURED INDUSTRY DEFINITION</p>
        <h2 id={`structured-industry-${slug}`} className="structured-definition__title">
          {industry.title}
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
