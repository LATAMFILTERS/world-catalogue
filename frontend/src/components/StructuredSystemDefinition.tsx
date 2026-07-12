'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getProtectionSystemBySlug } from '@/lib/protection-systems-data';
import { getRelatedEntities } from '@/lib/entity-graph';

interface DefinitionRow {
  label: string;
  content?: string;
  links?: Array<{ href: string; name: string }>;
}

export function StructuredSystemDefinition() {
  const pathname = usePathname();
  const match = pathname.match(/^\/systems\/([^/]+)\/?$/);
  if (!match) return null;

  const slug = match[1];
  const system = getProtectionSystemBySlug(slug);
  if (!system) return null;

  const entityId = `system:${system.slug}`;
  const technologies = getRelatedEntities(entityId, 'uses-technology');
  const families = getRelatedEntities(entityId, 'contains-family');
  const standards = getRelatedEntities(entityId, 'validated-by');
  const industries = getRelatedEntities(entityId, 'applied-in');

  const rows: DefinitionRow[] = [
    { label: 'Definition', content: system.overview },
    { label: 'Engineering Function', content: system.tagline },
    { label: 'Operating Principle', content: system.engineeringPrinciple },
    {
      label: 'Primary Technologies',
      links: technologies.map((node) => ({ href: node.href, name: node.name })),
    },
    {
      label: 'Product Families',
      links: families.map((node) => ({ href: node.href, name: node.name })),
    },
    {
      label: 'Applicable Standards',
      links: standards.map((node) => ({ href: node.href, name: node.name })),
    },
    {
      label: 'Industrial Applications',
      links: industries.map((node) => ({ href: node.href, name: node.name })),
    },
    {
      label: 'Related Knowledge',
      links: [{ href: '/knowledge-system', name: 'Knowledge System' }],
    },
  ].filter((row) => row.content || (row.links && row.links.length > 0));

  return (
    <section className="structured-definition structured-definition--system" aria-labelledby={`structured-system-${slug}`}>
      <div className="structured-definition__inner">
        <p className="structured-definition__eyebrow">STRUCTURED SYSTEM DEFINITION</p>
        <h2 id={`structured-system-${slug}`} className="structured-definition__title">
          {system.name}
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
