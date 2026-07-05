'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { TERMINOLOGY_REGISTRY, termIdToSlug } from '@/lib/knowledge-center';
import type { TerminologyEntry } from '@/lib/knowledge-center';
import {
  ArticleBreadcrumb,
  ArticleHero,
  SpecificationTable,
  ArticleSchema,
} from '@/components/knowledge-center';

export default function GlossaryTermContent({
  entry,
  slug,
}: {
  entry: TerminologyEntry;
  slug: string;
}) {
  const relatedEntries = entry.relatedTerms
    .map((id) => TERMINOLOGY_REGISTRY[id])
    .filter(Boolean) as TerminologyEntry[];

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      <ArticleBreadcrumb items={[
        { label: 'Knowledge Center', href: '/knowledge-center' },
        { label: 'Glossary', href: '/knowledge-center/glossary' },
        { label: entry.term },
      ]} />

      <ArticleHero
        overline={entry.id}
        title={entry.term}
        gradient={false}
      >
        {entry.aliases.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.04em',
            }}
          >
            Also: {entry.aliases.join(' · ')}
          </motion.p>
        )}
      </ArticleHero>

      <div style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 5vw, 4rem)',
      }}>

        {/* Canonical definition */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ marginBottom: '3rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '1.25rem',
          }}>
            Canonical Definition
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'justify',
          }}>
            {entry.definition}
          </p>
        </motion.div>

        {/* Applicable standards */}
        {entry.applicableStandards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              Applicable Standards
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {entry.applicableStandards.map((std) => (
                <span key={std} style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.72rem',
                  color: '#FFF12D',
                  border: '1px solid rgba(255,241,45,0.25)',
                  borderRadius: '4px',
                  padding: '3px 10px',
                }}>
                  {std}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* KC-00 Governance Metadata */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <SpecificationTable
            title="KC-00 Governance Metadata"
            rows={[
              { label: 'Permanent ID', value: entry.id },
              { label: 'Status', value: entry.status.charAt(0).toUpperCase() + entry.status.slice(1) },
              { label: 'Version', value: entry.version },
              { label: 'Last Reviewed', value: entry.lastReviewed },
            ]}
          />
        </motion.div>

        {/* Related terms — pill links (distinct from article cards) */}
        {relatedEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              Related Terms
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {relatedEntries.map((t) => (
                <Link
                  key={t.id}
                  href={`/knowledge-center/glossary/${termIdToSlug(t.id)}`}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.5)',
                    textDecoration: 'none',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    padding: '4px 12px',
                  }}
                >
                  {t.term}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <ArticleSchema data={{
        '@context': 'https://schema.org',
        '@type': 'DefinedTerm',
        '@id': `https://elimfilters.com/knowledge-center/glossary/${slug}`,
        name: entry.term,
        description: entry.definition,
        identifier: entry.id,
        inDefinedTermSet: { '@id': 'https://elimfilters.com/knowledge-center/glossary' },
        author: { '@id': 'https://elimfilters.com/#organization' },
        version: entry.version,
        dateModified: entry.lastReviewed,
        alternateName: entry.aliases,
      }} />
    </main>
  );
}
