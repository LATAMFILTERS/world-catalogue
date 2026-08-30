import Link from 'next/link';
import { getGeoContextByKindAndSlug } from '@/lib/geo-context';
import type { EntityKind } from '@/lib/entity-graph';
import styles from './AIEntityCard.module.css';

interface Props {
  kind: Exclude<EntityKind, 'organization'>;
  slug: string;
}

function EntityLinks({ label, links }: { label: string; links: readonly { href: string; name: string }[] }) {
  if (!links.length) return null;
  return (
    <div className={styles.group}>
      <h3>{label}</h3>
      <div className={styles.links}>
        {links.map((link) => <Link key={`${label}-${link.href}`} href={link.href}>{link.name}</Link>)}
      </div>
    </div>
  );
}

export function AIEntityCard({ kind, slug }: Props) {
  const context = getGeoContextByKindAndSlug(kind, slug);
  if (!context) return null;

  return (
    <section hidden className={styles.section} aria-label={`${context.entity.name} canonical engineering context`}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>CANONICAL ENGINEERING CONTEXT</p>
          <h2>{context.entity.name}</h2>
          <p>{context.definition}</p>
        </div>

        <div className={styles.engineering}>
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

        <div className={styles.relationships}>
          <EntityLinks label="Protection Systems" links={context.systems} />
          <EntityLinks label="Technologies" links={context.technologies} />
          <EntityLinks label="Product Families" links={context.families} />
          <EntityLinks label="Standards" links={context.standards} />
          <EntityLinks label="Failure Modes" links={context.failures} />
          <EntityLinks label="Industries" links={context.industries} />
        </div>

        <div className={styles.answers}>
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
