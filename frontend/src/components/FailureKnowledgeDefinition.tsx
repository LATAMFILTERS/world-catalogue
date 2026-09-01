'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getFailureKnowledgeProfile } from '@/lib/failure-knowledge';
import { getEntityNode } from '@/lib/entity-graph';

interface DefinitionRow {
  label: string;
  content?: string;
  links?: Array<{ href: string; name: string }>;
}

function entityLinks(prefix: string, slugs: readonly string[]) {
  return slugs
    .map((slug) => getEntityNode(`${prefix}:${slug}`))
    .filter((node): node is NonNullable<typeof node> => Boolean(node))
    .map((node) => ({ href: node.href, name: node.name }));
}

export function FailureKnowledgeDefinition() {
  const pathname = usePathname();
  const match = pathname.match(/^\/knowledge-system\/contamination\/([^/]+)\/?$/);
  if (!match) return null;

  const slug = match[1];
  const profile = getFailureKnowledgeProfile(slug);
  if (!profile) return null;

  const rows: DefinitionRow[] = [
    { label: 'Definition', content: profile.definition },
    { label: 'Failure Mechanism', content: profile.mechanism },
    { label: 'Operational Impact', content: profile.operationalImpact },
    { label: 'Control Strategy', content: profile.controlStrategy },
    { label: 'Protection Systems', links: entityLinks('system', profile.systems) },
    { label: 'Related Technologies', links: entityLinks('technology', profile.technologies) },
    { label: 'Product Families', links: entityLinks('family', profile.families) },
    { label: 'Applicable Standards', links: entityLinks('standard', profile.standards) },
    { label: 'Industrial Applications', links: entityLinks('industry', profile.industries) },
    {
      label: 'Related Knowledge',
      links: [
        { href: '/knowledge-center/problems', name: 'Contamination and Failure Mechanisms' },
        { href: '/knowledge-system', name: 'Knowledge System' },
      ],
    },
  ].filter((row) => row.content || (row.links && row.links.length > 0));

  return (
    <section className="structured-definition structured-definition--failure" aria-labelledby={`failure-knowledge-${slug}`}>
      <div className="structured-definition__inner">
        <p className="structured-definition__eyebrow">FAILURE KNOWLEDGE NETWORK</p>
        <h2 id={`failure-knowledge-${slug}`} className="structured-definition__title">
          {profile.name}
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
