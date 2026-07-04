'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { TERMINOLOGY_REGISTRY, termIdToSlug } from '@/lib/knowledge-center';
import type { TerminologyEntry } from '@/lib/knowledge-center';

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

      {/* Back navigation */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1rem clamp(1.5rem, 5vw, 4rem)' }}>
        <Link href="/knowledge-center/glossary" style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.4)',
          textDecoration: 'none',
          letterSpacing: '0.06em',
        }}>
          ← GLOSSARY
        </Link>
      </div>

      {/* Hero */}
      <section style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: '1rem',
            }}>
              {entry.id}
            </p>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              lineHeight: 1.15,
              marginBottom: '0.75rem',
              color: '#fff',
            }}>
              {entry.term}
            </h1>
            {entry.aliases.length > 0 && (
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.04em',
              }}>
                Also: {entry.aliases.join(' · ')}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Definition */}
      <div style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 5vw, 4rem)',
      }}>
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

        {/* Governance metadata */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
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
            KC-00 Governance Metadata
          </p>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              {[
                ['Permanent ID', entry.id],
                ['Status', entry.status.charAt(0).toUpperCase() + entry.status.slice(1)],
                ['Version', entry.version],
                ['Last Reviewed', entry.lastReviewed],
              ].map(([label, value]) => (
                <tr key={label} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.3)',
                    padding: '0.6rem 0',
                    width: '160px',
                    letterSpacing: '0.04em',
                  }}>
                    {label}
                  </td>
                  <td style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.6)',
                    padding: '0.6rem 0 0.6rem 1rem',
                  }}>
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Related terms */}
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

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'DefinedTerm',
            '@id': `https://elimfilters.com/knowledge-center/glossary/${slug}`,
            'name': entry.term,
            'description': entry.definition,
            'identifier': entry.id,
            'inDefinedTermSet': { '@id': 'https://elimfilters.com/knowledge-center/glossary' },
            'author': { '@id': 'https://elimfilters.com/#organization' },
            'version': entry.version,
            'dateModified': entry.lastReviewed,
            'alternateName': entry.aliases,
          }),
        }}
      />
    </main>
  );
}
