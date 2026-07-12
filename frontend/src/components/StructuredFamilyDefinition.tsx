'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getFamilyBySlug } from '@/lib/product-families-data';
import { getRelatedEntities } from '@/lib/entity-graph';

interface DefinitionRow {
  label: string;
  content?: string;
  links?: Array<{ href: string; name: string }>;
}

export function StructuredFamilyDefinition() {
  const pathname = usePathname();
  const match = pathname.match(/^\/families\/([^/]+)\/?$/);
  if (!match) return null;

  const slug = match[1];
  const family = getFamilyBySlug(slug);
  if (!family) return null;

  const entityId = `family:${family.slug}`;
  const systems = getRelatedEntities(entityId, 'belongs-to');
  const technologies = getRelatedEntities(entityId, 'uses-technology');
  const standards = getRelatedEntities(entityId, 'validated-by');

  const industriesMap = new Map<string, { href: string; name: string }>();
  systems.forEach((system) => {
    getRelatedEntities(system.id, 'applied-in').forEach((industry) => {
      industriesMap.set(industry.id, { href: industry.href, name: industry.name });
    });
  });

  const rows: DefinitionRow[] = [
    { label: 'Definition', content: family.purpose },
    { label: 'Engineering Role', content: family.engineering },
    {
      label: 'Protection System',
      links: systems.map((node) => ({ href: node.href, name: node.name })),
    },
    {
      label: 'Primary Technology',
      links: technologies.map((node) => ({ href: node.href, name: node.name })),
    },
    {
      label: 'Applicable Standards',
      links: standards.map((node) => ({ href: node.href, name: node.name })),
    },
    {
      label: 'Industrial Applications',
      links: Array.from(industriesMap.values()),
    },
    {
      label: 'Related Knowledge',
      links: [{ href: '/knowledge-system', name: 'Knowledge System' }],
    },
  ].filter((row) => row.content || (row.links && row.links.length > 0));

  return (
    <section
      className="structured-definition structured-definition--family"
      aria-labelledby={`structured-family-${slug}`}
    >
      <div className="structured-definition__inner">
        <p className="structured-definition__eyebrow">STRUCTURED PRODUCT FAMILY DEFINITION</p>
        <h2 id={`structured-family-${slug}`} className="structured-definition__title">
          {family.name}
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
