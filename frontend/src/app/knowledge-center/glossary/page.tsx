'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { getPublishedTerms, termIdToSlug } from '@/lib/knowledge-center';

export default function GlossaryPage() {
  const terms = getPublishedTerms().sort((a, b) => a.term.localeCompare(b.term));

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

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
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              color: '#FFF12D',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}>
              KC-00 — Terminology Registry
            </p>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              color: '#fff',
            }}>
              Engineering Terminology Glossary
            </h1>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.05rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.65)',
              maxWidth: '640px',
              textAlign: 'justify',
            }}>
              {terms.length} canonical engineering terms. Each term carries a permanent{' '}
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>TERM-xxx</span>{' '}
              identifier and is referenced by ID across all Knowledge Center articles — definitions
              are never written inline.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Terms list */}
      <div style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 5vw, 4rem)',
      }}>
        {terms.map((term, i) => {
          const slug = termIdToSlug(term.id);
          return (
            <motion.div
              key={term.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
            >
              <Link
                href={`/knowledge-center/glossary/${slug}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <motion.div
                  whileHover={{ borderLeftColor: '#FFF12D', background: 'rgba(255,255,255,0.02)' }}
                  style={{
                    borderLeft: '2px solid rgba(255,255,255,0.08)',
                    padding: '1.25rem 1.5rem',
                    marginBottom: '0.5rem',
                    transition: 'border-left-color 0.2s, background 0.2s',
                  }}
                >
                  {/* Term ID + aliases */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.6rem',
                      color: 'rgba(255,255,255,0.25)',
                      letterSpacing: '0.06em',
                    }}>
                      {term.id}
                    </span>
                    {term.aliases.slice(0, 2).map((alias) => (
                      <span key={alias} style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.58rem',
                        color: 'rgba(255,255,255,0.18)',
                        letterSpacing: '0.04em',
                      }}>
                        {alias}
                      </span>
                    ))}
                  </div>

                  {/* Term name */}
                  <p style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    fontSize: '1.05rem',
                    color: '#fff',
                    marginBottom: '0.5rem',
                  }}>
                    {term.term}
                  </p>

                  {/* Definition excerpt */}
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.5)',
                    lineHeight: 1.65,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textAlign: 'justify',
                  }}>
                    {term.definition}
                  </p>

                  {/* Standards */}
                  {term.applicableStandards.length > 0 && (
                    <div style={{ marginTop: '0.65rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {term.applicableStandards.map((std) => (
                        <span key={std} style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.58rem',
                          color: 'rgba(255,241,45,0.5)',
                          border: '1px solid rgba(255,241,45,0.15)',
                          borderRadius: '3px',
                          padding: '1px 6px',
                        }}>
                          {std}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'DefinedTermSet',
            '@id': 'https://elimfilters.com/knowledge-center/glossary',
            'name': 'ELIMFILTERS Engineering Terminology Glossary',
            'description': 'Canonical definitions for filtration engineering terms, each identified by a permanent TERM-xxx identifier.',
            'url': 'https://elimfilters.com/knowledge-center/glossary',
            'isPartOf': { '@id': 'https://elimfilters.com/knowledge-center' },
            'author': { '@id': 'https://elimfilters.com/#organization' },
            'hasDefinedTerm': terms.map((t) => ({
              '@type': 'DefinedTerm',
              '@id': `https://elimfilters.com/knowledge-center/glossary/${termIdToSlug(t.id)}`,
              'name': t.term,
              'identifier': t.id,
            })),
          }),
        }}
      />
    </main>
  );
}
