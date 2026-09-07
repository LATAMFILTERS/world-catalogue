'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { getPublishedTerms, termIdToSlug, TERM_CATEGORY_LABELS } from '@/lib/knowledge-center';
import type { TermCategory } from '@/lib/knowledge-center';

export default function GlossaryPage() {
  const allTerms = getPublishedTerms(); // already sorted alphabetically

  // Group terms by category
  const categories = Object.keys(TERM_CATEGORY_LABELS) as TermCategory[];
  const byCategory = new Map<TermCategory, typeof allTerms>();
  for (const cat of categories) {
    const catTerms = allTerms.filter((t) => t.category === cat);
    if (catTerms.length > 0) byCategory.set(cat, catTerms);
  }

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem)',
        backgroundImage: "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.78) 48%, rgba(0,0,0,0.48) 100%), url('/images/system-hero.avif')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Link href="/knowledge-center" style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.35)',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: '2rem',
          }}>
            ← KNOWLEDGE CENTER
          </Link>

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
              maxWidth: '820px',
            }}>
              {allTerms.length} canonical engineering terms across {byCategory.size} technical categories.
              Each term carries a permanent{' '}
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>TERM-xxx</span>{' '}
              identifier and is referenced by ID across all Knowledge Center articles — definitions
              are never written inline.
            </p>
          </motion.div>

          {/* Category nav pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '2rem' }}
          >
            {categories.filter((c) => byCategory.has(c)).map((cat) => (
              <a
                key={cat}
                href={`#cat-${cat}`}
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.62rem',
                  letterSpacing: '0.06em',
                  color: 'rgba(255,255,255,0.4)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '4px',
                  padding: '3px 10px',
                  textDecoration: 'none',
                }}
              >
                {TERM_CATEGORY_LABELS[cat]} ({byCategory.get(cat)!.length})
              </a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 5vw, 4rem)',
      }}>
        {categories.filter((cat) => byCategory.has(cat)).map((cat, catIndex) => {
          const catTerms = byCategory.get(cat)!;
          return (
            <motion.section
              key={cat}
              id={`cat-${cat}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: catIndex * 0.06 }}
              style={{ marginBottom: '3.5rem' }}
            >
              {/* Category heading */}
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '1rem',
                marginBottom: '1.25rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <h2 style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '1.15rem',
                  color: '#fff',
                }}>
                  {TERM_CATEGORY_LABELS[cat]}
                </h2>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.6rem',
                  color: 'rgba(255,255,255,0.2)',
                }}>
                  {catTerms.length} {catTerms.length === 1 ? 'term' : 'terms'}
                </span>
              </div>

              {/* Terms in this category */}
              {catTerms.map((term) => {
                const slug = termIdToSlug(term.id);
                return (
                  <Link
                    key={term.id}
                    href={`/knowledge-center/glossary/${slug}`}
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <motion.div
                      whileHover={{ borderLeftColor: '#FFF12D', background: 'rgba(255,255,255,0.02)' }}
                      style={{
                        borderLeft: '2px solid rgba(255,255,255,0.08)',
                        padding: '1.1rem 1.5rem',
                        marginBottom: '0.4rem',
                        transition: 'border-left-color 0.2s, background 0.2s',
                      }}
                    >
                      {/* Term ID + aliases */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.6rem',
                          color: 'rgba(255,255,255,0.22)',
                          letterSpacing: '0.06em',
                        }}>
                          {term.id}
                        </span>
                        {term.aliases.slice(0, 2).map((alias) => (
                          <span key={alias} style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '0.58rem',
                            color: 'rgba(255,255,255,0.15)',
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
                        fontSize: '1.0rem',
                        color: '#fff',
                        marginBottom: '0.4rem',
                      }}>
                        {term.term}
                      </p>

                      {/* Definition excerpt */}
                      <p style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.85rem',
                        color: 'rgba(255,255,255,0.45)',
                        lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {term.definition}
                      </p>

                      {/* Standards */}
                      {term.applicableStandards.length > 0 && (
                        <div style={{ marginTop: '0.55rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {term.applicableStandards.map((std) => (
                            <span key={std} style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: '0.58rem',
                              color: 'rgba(255,241,45,0.45)',
                              border: '1px solid rgba(255,241,45,0.12)',
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
                );
              })}
            </motion.section>
          );
        })}
      </div>

      {/* CTA Section: Go Deeper */}
      <section style={{
        padding: '3rem clamp(1.5rem, 5vw, 4rem)',
        marginTop: '2rem',
        background: 'rgba(255,241,45,0.05)',
        borderTop: '1px solid rgba(255,241,45,0.2)',
        borderBottom: '1px solid rgba(255,241,45,0.2)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
          >
            <h3 style={{
              fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
              fontSize: '1.2rem',
              fontWeight: 700,
              marginBottom: '1rem',
              color: '#fff',
              letterSpacing: '0.01em',
            }}>
              Go Deeper: Standards & Testing
            </h3>
            <p style={{
              marginBottom: '1.5rem',
              color: 'rgba(255,255,255,0.7)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '1rem',
              lineHeight: 1.6,
            }}>
              These definitions are used throughout our technical standards. Explore implementation methods, measurement techniques, and practical applications.
            </p>
            <Link href="/knowledge-center/engineering-reference/" style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: '#FFF12D',
              color: '#000',
              textDecoration: 'none',
              fontWeight: 700,
              fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
              letterSpacing: '0.05em',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
            }}>
              Explore ISO 16889 & Testing Standards →
            </Link>
          </motion.div>
        </div>
      </section>

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
            'hasDefinedTerm': allTerms.map((t) => ({
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
