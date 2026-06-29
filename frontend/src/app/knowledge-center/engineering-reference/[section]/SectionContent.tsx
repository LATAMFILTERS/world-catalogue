'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import type { ERLSection } from '@/lib/engineering-reference-data';

interface Props {
  section: ERLSection;
  prev: ERLSection | null;
  next: ERLSection | null;
}

export default function SectionContent({ section, prev, next }: Props) {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Back nav */}
      <div style={{
        padding: '1.25rem clamp(1.5rem, 4vw, 4rem)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Link href="/knowledge-center/engineering-reference" style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.4)',
          textDecoration: 'none',
        }}>
          ← ENGINEERING REFERENCE
        </Link>
      </div>

      {/* Hero */}
      <section style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              color: '#FFF12D',
              marginBottom: '1rem',
            }}
          >
            SECTION {section.number} / {ERL_SECTIONS_COUNT}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              lineHeight: 1.1,
              marginBottom: '1.5rem',
            }}
          >
            {section.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.05rem',
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.65)',
              textAlign: 'justify',
            }}
          >
            {section.definition}
          </motion.p>
        </div>
      </section>

      {/* Body */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(2rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)' }}>

        {/* Engineering Purpose */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ marginBottom: '3rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.12em',
            color: '#FFF12D',
            marginBottom: '0.75rem',
          }}>
            01 / ENGINEERING PURPOSE
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            lineHeight: 1.75,
            color: 'rgba(255,255,255,0.75)',
            textAlign: 'justify',
          }}>
            {section.engineeringPurpose}
          </p>
        </motion.section>

        {/* Applicable Standards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          style={{ marginBottom: '3rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.12em',
            color: '#FFF12D',
            marginBottom: '0.75rem',
          }}>
            02 / APPLICABLE STANDARDS
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {section.applicableStandards.map((std) => (
              <span key={std} style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.75rem',
                letterSpacing: '0.06em',
                color: '#FFF12D',
                border: '1px solid rgba(255,241,45,0.3)',
                padding: '0.3rem 0.75rem',
              }}>
                {std}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Key Concepts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ marginBottom: '3rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.12em',
            color: '#FFF12D',
            marginBottom: '1.25rem',
          }}>
            03 / KEY CONCEPTS
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
            {section.keyConcepts.map((concept, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
                style={{
                  background: '#000',
                  padding: '1.25rem 1.5rem',
                }}
              >
                <p style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: '#fff',
                  marginBottom: '0.4rem',
                }}>
                  {concept.term}
                </p>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.85rem',
                  lineHeight: 1.65,
                  color: 'rgba(255,255,255,0.6)',
                  textAlign: 'justify',
                }}>
                  {concept.definition}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Engineering Metrics */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          style={{ marginBottom: '3rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.12em',
            color: '#FFF12D',
            marginBottom: '1rem',
          }}>
            04 / ENGINEERING METRICS
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.06)',
          }}>
            {section.engineeringMetrics.map((metric, i) => (
              <div key={i} style={{
                background: '#000',
                padding: '1rem 1.25rem',
              }}>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.45)',
                  marginBottom: '0.3rem',
                }}>
                  {metric.label}
                  {metric.standard && (
                    <span style={{ color: 'rgba(255,241,45,0.5)', marginLeft: '0.5rem' }}>
                      [{metric.standard}]
                    </span>
                  )}
                </p>
                <p style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#fff',
                }}>
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Failure Considerations */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{ marginBottom: '3rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.12em',
            color: '#FFF12D',
            marginBottom: '1rem',
          }}>
            05 / FAILURE CONSIDERATIONS
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {section.failureConsiderations.map((fc, i) => (
              <div key={i} style={{
                borderLeft: '3px solid rgba(255,100,100,0.4)',
                paddingLeft: '1rem',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                lineHeight: 1.65,
                color: 'rgba(255,255,255,0.6)',
              }}>
                {fc}
              </div>
            ))}
          </div>
        </motion.section>

        {/* Related Technologies */}
        {section.relatedTechnologies.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.12em',
              color: '#FFF12D',
              marginBottom: '0.75rem',
            }}>
              06 / RELATED ELIMFILTERS TECHNOLOGIES
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {section.relatedTechnologies.map((tech) => {
                const slug = tech.replace('™', '').toLowerCase();
                return (
                  <Link key={tech} href={`/knowledge-center/technologies/${slug}`} style={{ textDecoration: 'none' }}>
                    <motion.span
                      whileHover={{ borderColor: 'rgba(255,241,45,0.6)', color: '#FFF12D' }}
                      style={{
                        display: 'inline-block',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.75rem',
                        letterSpacing: '0.05em',
                        color: 'rgba(255,255,255,0.6)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        padding: '0.3rem 0.75rem',
                        transition: 'border-color 0.2s, color 0.2s',
                      }}
                    >
                      {tech}
                    </motion.span>
                  </Link>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Related KC Articles */}
        {section.relatedKCArticles.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.12em',
              color: '#FFF12D',
              marginBottom: '0.75rem',
            }}>
              07 / RELATED ENGINEERING ARTICLES
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {section.relatedKCArticles.map((slug) => (
                <Link key={slug} href={`/knowledge-center/engineering/${slug}`} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ borderColor: 'rgba(255,241,45,0.3)', color: '#fff' }}
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.85rem',
                      color: 'rgba(255,255,255,0.5)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      padding: '0.6rem 1rem',
                      transition: 'border-color 0.2s, color 0.2s',
                    }}
                  >
                    {slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} →
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* References */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          style={{ marginBottom: '3rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '0.75rem',
          }}>
            08 / REFERENCES
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {section.references.map((ref, i) => (
              <p key={i} style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.3)',
                lineHeight: 1.6,
              }}>
                {ref}
              </p>
            ))}
          </div>
        </motion.section>

        {/* Section Navigation */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          {prev ? (
            <Link href={`/knowledge-center/engineering-reference/${prev.slug}`} style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '1rem 1.25rem',
                  transition: 'border-color 0.2s',
                }}
              >
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.3rem' }}>
                  ← PREV
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#fff' }}>
                  {prev.title}
                </p>
              </motion.div>
            </Link>
          ) : <div />}

          {next ? (
            <Link href={`/knowledge-center/engineering-reference/${next.slug}`} style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '1rem 1.25rem',
                  textAlign: 'right',
                  transition: 'border-color 0.2s',
                }}
              >
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.3rem' }}>
                  NEXT →
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#fff' }}>
                  {next.title}
                </p>
              </motion.div>
            </Link>
          ) : <div />}
        </div>
      </div>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        name: section.title,
        description: section.definition.slice(0, 155),
        url: `https://elimfilters.com/knowledge-center/engineering-reference/${section.slug}`,
        author: {
          '@type': 'Organization',
          '@id': 'https://elimfilters.com/#organization',
          name: 'ELIMFILTERS',
        },
        isPartOf: {
          '@type': 'TechArticle',
          name: 'ELIMFILTERS Engineering Reference Library v1.0',
          url: 'https://elimfilters.com/knowledge-center/engineering-reference',
        },
        about: {
          '@type': 'Thing',
          name: section.title,
          description: section.engineeringPurpose.slice(0, 120),
        },
        citation: section.references.map((r) => ({ '@type': 'CreativeWork', name: r })),
      })}} />
    </main>
  );
}

const ERL_SECTIONS_COUNT = '20';
