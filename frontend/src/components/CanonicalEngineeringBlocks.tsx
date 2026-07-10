'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getFamilyBySlug } from '@/lib/product-families-data';
import { getProtectionSystemBySlug } from '@/lib/protection-systems-data';
import { getRelatedEntities } from '@/lib/entity-graph';

interface CanonicalBlock {
  label: string;
  content?: string;
  links?: Array<{ href: string; label: string }>;
}

function humanize(value: string) {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function systemBlocks(slug: string): { title: string; blocks: CanonicalBlock[] } | null {
  const system = getProtectionSystemBySlug(slug);
  if (!system) return null;

  const entityId = `system:${system.slug}`;
  const technologies = getRelatedEntities(entityId, 'uses-technology');
  const families = getRelatedEntities(entityId, 'contains-family');
  const standards = getRelatedEntities(entityId, 'validated-by');

  return {
    title: `${system.name} engineering summary`,
    blocks: [
      { label: 'Definition', content: system.overview },
      { label: 'Engineering Principle', content: system.engineeringPrinciple },
      {
        label: 'Applicable Standards',
        links: standards.map((item) => ({ href: item.href, label: item.name })),
      },
      {
        label: 'Related Technologies',
        links: technologies.map((item) => ({ href: item.href, label: item.name })),
      },
      {
        label: 'Related Product Families',
        links: families.map((item) => ({ href: item.href, label: item.name })),
      },
    ],
  };
}

function familyBlocks(slug: string): { title: string; blocks: CanonicalBlock[] } | null {
  const family = getFamilyBySlug(slug);
  if (!family) return null;

  const entityId = `family:${family.slug}`;
  const systems = getRelatedEntities(entityId, 'belongs-to');
  const technologies = getRelatedEntities(entityId, 'uses-technology');
  const standards = getRelatedEntities(entityId, 'validated-by');

  return {
    title: `${family.name} engineering summary`,
    blocks: [
      { label: 'Definition', content: family.purpose },
      { label: 'Engineering Role', content: family.engineering },
      {
        label: 'Applicable Standards',
        links: standards.map((item) => ({ href: item.href, label: item.name })),
      },
      {
        label: 'Protection System',
        links: systems.map((item) => ({ href: item.href, label: item.name })),
      },
      {
        label: 'Primary Technology',
        links: technologies.map((item) => ({ href: item.href, label: item.name || humanize(family.primaryTechnology) })),
      },
    ],
  };
}

function configFor(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length !== 2) return null;

  if (segments[0] === 'systems') return systemBlocks(segments[1]);
  if (segments[0] === 'families') return familyBlocks(segments[1]);
  return null;
}

export function CanonicalEngineeringBlocks() {
  const pathname = usePathname();
  const config = configFor(pathname);
  if (!config) return null;

  return (
    <section className="canonical-engineering" aria-labelledby="canonical-engineering-title">
      <div className="canonical-engineering__inner">
        <p className="canonical-engineering__eyebrow">CANONICAL ENGINEERING SUMMARY</p>
        <h2 id="canonical-engineering-title" className="canonical-engineering__title">{config.title}</h2>
        <div className="canonical-engineering__grid">
          {config.blocks
            .filter((block) => block.content || (block.links && block.links.length > 0))
            .map((block) => (
              <article key={block.label} className="canonical-engineering__block">
                <h3>{block.label}</h3>
                {block.content && <p>{block.content}</p>}
                {block.links && block.links.length > 0 && (
                  <div className="canonical-engineering__links">
                    {block.links.map((link) => (
                      <Link key={`${block.label}-${link.href}-${link.label}`} href={link.href}>{link.label}</Link>
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
