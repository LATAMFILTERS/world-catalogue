'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { KC_STANDARDS } from '@/lib/knowledge-center-data';

export default function StandardsHubPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
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

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              color: '#FFF12D',
              marginBottom: '1rem',
            }}
          >
            02 / STANDARDS REFERENCE
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              lineHeight: 1.15,
              textAlign: 'justify',
              marginBottom: '1.25rem',
            }}
          >
            Industrial Filtration Standards
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              lineHeight: 1.75,
              textAlign: 'justify',
              color: 'rgba(255,255,255,0.6)',
              maxWidth: '600px',
            }}
          >
            ISO, ASTM, SAE, and NAS filtration standards explained with test methodology, acceptance criteria, parameter tables, and industrial application context. Standards are not isolated specifications — each entry explains how the standard functions within a contamination control system.
          </motion.p>
        </div>
      </section>

      {/* Standards Grid */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.04)' }}>
          {KC_STANDARDS.map((std, i) => (
            <motion.div
              key={std.slug}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <Link href={`/knowledge-center/standards/${std.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                <motion.div
                  whileHover={{ background: 'rgba(255,241,45,0.03)', borderLeftColor: '#FFF12D' }}
                  style={{
                    background: '#000',
                    padding: '1.75rem 2rem',
                    display: 'grid',
                    gridTemplateColumns: '180px 1fr auto',
                    gap: '2rem',
                    alignItems: 'center',
                    borderLeft: '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'background 0.2s, border-left-color 0.2s',
                  }}
                >
                  <div>
                    <p style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: '#FFF12D',
                      marginBottom: '0.2rem',
                    }}>
                      {std.code}
                    </p>
                    <p style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.6rem',
                      color: 'rgba(255,255,255,0.3)',
                    }}>
                      {std.year}
                    </p>
                  </div>

                  <div>
                    <p style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      color: '#fff',
                      marginBottom: '0.35rem',
                      lineHeight: 1.25,
                      textAlign: 'justify',
                    }}>
                      {std.title.split('—')[0].trim()}
                    </p>
                    <p style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.8rem',
                      color: 'rgba(255,255,255,0.4)',
                      lineHeight: 1.5,
                      textAlign: 'justify',
                    }}>
                      {std.scope}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '200px' }}>
                    {std.relatedTechnologies.map((tech) => (
                      <span key={tech} style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.6rem',
                        color: 'rgba(255,255,255,0.35)',
                        background: 'rgba(255,255,255,0.04)',
                        padding: '0.2rem 0.45rem',
                        border: '1px solid rgba(255,255,255,0.06)',
                        whiteSpace: 'nowrap',
                      }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Industrial Filtration Standards — ELIMFILTERS Knowledge Center',
        description: 'ISO, ASTM, SAE, and NAS filtration standards with methodology, acceptance criteria, and industrial application context.',
        url: 'https://elimfilters.com/knowledge-center/standards',
        publisher: {
          '@type': 'Organization',
          '@id': 'https://elimfilters.com/#organization',
          name: 'ELIMFILTERS',
        },
        hasPart: KC_STANDARDS.map((s) => ({
          '@type': 'TechArticle',
          identifier: s.code,
          headline: s.title,
          url: `https://elimfilters.com/knowledge-center/standards/${s.slug}`,
          description: s.metaDescription,
        })),
      })}} />
    </main>
  );
}
