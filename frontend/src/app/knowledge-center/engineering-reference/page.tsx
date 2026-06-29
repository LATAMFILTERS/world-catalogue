'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ERL_SECTIONS } from '@/lib/engineering-reference-data';

export default function EngineeringReferencePage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #0a0a0a 0%, #000 60%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              letterSpacing: '0.12em',
              color: '#FFF12D',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
            }}
          >
            ELIMFILTERS / KNOWLEDGE CENTER / ENGINEERING REFERENCE
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              lineHeight: 1.1,
              marginBottom: '1.5rem',
            }}
          >
            Engineering Reference<br />Library v1.0
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.05rem',
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.65)',
              maxWidth: '640px',
              textAlign: 'justify',
            }}
          >
            Twenty structured reference sections covering filtration standards, filtration science, particle science, contamination mechanisms, test methods, performance metrics, materials engineering, and reliability analysis. Content is sourced exclusively from documented ELIMFILTERS technical knowledge and applicable ISO, ASTM, SAE, and NFPA standards.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', flexWrap: 'wrap' }}
          >
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>
              {ERL_SECTIONS.length} SECTIONS
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>
              {ERL_SECTIONS.reduce((acc, s) => acc + s.applicableStandards.length, 0)} STANDARD REFERENCES
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>
              {ERL_SECTIONS.reduce((acc, s) => acc + s.keyConcepts.length, 0)} KEY CONCEPTS DEFINED
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sections Grid */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.35)',
            marginBottom: '2.5rem',
          }}>
            REFERENCE SECTIONS — SELECT TO READ
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {ERL_SECTIONS.map((section, i) => (
              <motion.div
                key={section.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
              >
                <Link
                  href={`/knowledge-center/engineering-reference/${section.slug}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <motion.div
                    whileHover={{ background: 'rgba(255,241,45,0.04)' }}
                    style={{
                      background: '#000',
                      padding: '1.75rem',
                      height: '100%',
                      cursor: 'pointer',
                      borderLeft: '3px solid transparent',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderLeftColor = '#FFF12D';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderLeftColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.75rem' }}>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.6rem',
                        letterSpacing: '0.1em',
                        color: '#FFF12D',
                      }}>
                        {section.number}
                      </span>
                    </div>
                    <h2 style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      fontSize: '1rem',
                      color: '#fff',
                      marginBottom: '0.6rem',
                      lineHeight: 1.2,
                    }}>
                      {section.title}
                    </h2>
                    <p style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.8rem',
                      lineHeight: 1.6,
                      color: 'rgba(255,255,255,0.5)',
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {section.definition}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {section.applicableStandards.slice(0, 3).map((std) => (
                        <span key={std} style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.55rem',
                          letterSpacing: '0.06em',
                          color: 'rgba(255,241,45,0.6)',
                          border: '1px solid rgba(255,241,45,0.2)',
                          padding: '0.15rem 0.4rem',
                        }}>
                          {std}
                        </span>
                      ))}
                      {section.applicableStandards.length > 3 && (
                        <span style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.55rem',
                          color: 'rgba(255,255,255,0.25)',
                        }}>
                          +{section.applicableStandards.length - 3}
                        </span>
                      )}
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Source Note */}
      <section style={{
        padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 4rem)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.01)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.3)',
            lineHeight: 1.8,
          }}>
            SOURCE NOTE — All content in this Engineering Reference Library is derived exclusively from ELIMFILTERS documented technical knowledge base and applicable international standards (ISO, ASTM, SAE, NFPA, DIN). Content gaps are explicitly identified as &ldquo;PENDING ENGINEERING DOCUMENTATION&rdquo; — these entries require additional documentation before formal definition can be published.
          </p>
        </div>
      </section>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        name: 'ELIMFILTERS Engineering Reference Library v1.0',
        description: 'Twenty-section industrial filtration engineering reference covering standards, filtration science, particle science, contamination mechanisms, test methods, and reliability analysis.',
        url: 'https://elimfilters.com/knowledge-center/engineering-reference',
        author: {
          '@type': 'Organization',
          '@id': 'https://elimfilters.com/#organization',
          name: 'ELIMFILTERS',
        },
        about: {
          '@type': 'Thing',
          name: 'Industrial Filtration Engineering',
          description: 'Engineering reference covering filtration standards (ISO 16889, ISO 5011, ISO 4406), contamination science, filter media, materials, performance metrics, and reliability analysis.',
        },
      })}} />
    </main>
  );
}
