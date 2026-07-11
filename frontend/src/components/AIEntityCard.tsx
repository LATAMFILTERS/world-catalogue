import Link from 'next/link';
import { getGeoContextByKindAndSlug } from '@/lib/geo-context';
import type { EntityKind } from '@/lib/entity-graph';

interface Props {
  kind: Exclude<EntityKind, 'organization'>;
  slug: string;
}

function EntityLinks({ label, links }: { label: string; links: readonly { href: string; name: string }[] }) {
  if (!links.length) return null;
  return (
    <div className="ai-entity-card__group">
      <h3>{label}</h3>
      <div className="ai-entity-card__links">
        {links.map((link) => <Link key={`${label}-${link.href}`} href={link.href}>{link.name}</Link>)}
      </div>
    </div>
  );
}

export function AIEntityCard({ kind, slug }: Props) {
  const context = getGeoContextByKindAndSlug(kind, slug);
  if (!context) return null;

  return (
    <section className="ai-entity-card" aria-label={`${context.entity.name} canonical engineering context`}>
      <div className="ai-entity-card__inner">
        <div className="ai-entity-card__header">
          <p className="ai-entity-card__eyebrow">CANONICAL ENGINEERING CONTEXT</p>
          <h2>{context.entity.name}</h2>
          <p>{context.definition}</p>
        </div>

        <div className="ai-entity-card__engineering">
          <article>
            <h3>Engineering Principle</h3>
            <p>{context.engineeringPrinciple}</p>
          </article>
          <article>
            <h3>Control Strategy</h3>
            <p>{context.controlStrategy}</p>
          </article>
          <article>
            <h3>Operational Impact</h3>
            <p>{context.operationalImpact}</p>
          </article>
        </div>

        <div className="ai-entity-card__relationships">
          <EntityLinks label="Protection Systems" links={context.systems} />
          <EntityLinks label="Technologies" links={context.technologies} />
          <EntityLinks label="Product Families" links={context.families} />
          <EntityLinks label="Standards" links={context.standards} />
          <EntityLinks label="Failure Modes" links={context.failures} />
          <EntityLinks label="Industries" links={context.industries} />
        </div>

        <div className="ai-entity-card__answers">
          <h3>Canonical Answers</h3>
          {context.canonicalAnswers.map((entry) => (
            <details key={entry.question}>
              <summary>{entry.question}</summary>
              <p>{entry.answer}</p>
            </details>
          ))}
        </div>

        <div hidden data-geo-context="true">
          {context.retrievalPassages.map((passage) => <p key={passage}>{passage}</p>)}
        </div>
      </div>
    </section>
  );
}
