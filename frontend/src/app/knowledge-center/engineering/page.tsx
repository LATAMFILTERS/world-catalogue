'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ENGINEERING_ARTICLES } from '@/lib/knowledge-center-data';

const CATEGORIES = ['Engineering', 'Contamination', 'Operations', 'Materials'];

export default function EngineeringHubPage() {
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
            initial={{ opacity: 0, y: 10 }}
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
            01 / ENGINEERING PRINCIPLES
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
              marginBottom: '1.25rem',
            }}
          >
            Filtration Engineering Articles
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.6)',
              maxWidth: '600px',
              textAlign: 'justify',
            }}
          >
            Technical articles covering filtration theory, media science, fluid mechanics, contamination modes, and system engineering for heavy equipment and industrial applications. Each article references applicable ISO, ASTM, and SAE standards.
          </motion.p>
        </div>
      </section>

      {/* Articles List */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          {ENGINEERING_ARTICLES.map((article, i) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Link href={`/knowledge-center/engineering/${article.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                <motion.div
                  whileHover={{ background: 'rgba(255,241,45,0.03)', borderLeftColor: '#FFF12D' }}
                  style={{
                    background: '#000',
                    padding: '1.75rem 2rem',
                    borderLeft: '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'background 0.2s, border-left-color 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '1rem' }}>
                    <p style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.6rem',
                      letterSpacing: '0.1em',
                      color: '#FFF12D',
                      opacity: 0.7,
                      textTransform: 'uppercase',
                    }}>
                      {article.category}
                    </p>
                    <p style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.6rem',
                      color: 'rgba(255,255,255,0.25)',
                      whiteSpace: 'nowrap',
                    }}>
                      {article.readTime}
                    </p>
                  </div>

                  <h2 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    fontSize: '1.05rem',
                    color: '#fff',
                    marginBottom: '0.35rem',
                    lineHeight: 1.25,
                  }}>
                    {article.title}
                  </h2>

                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.4)',
                    lineHeight: 1.5,
                    marginBottom: '1rem',
                  }}>
                    {article.subtitle}
                  </p>

                  {article.relatedStandards.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {article.relatedStandards.map((std) => (
                        <span key={std} style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.6rem',
                          color: 'rgba(255,255,255,0.3)',
                          background: 'rgba(255,255,255,0.04)',
                          padding: '0.2rem 0.45rem',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                          {std}
                        </span>
                      ))}
                    </div>
                  )}
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
        name: 'Filtration Engineering Articles — ELIMFILTERS Knowledge Center',
        description: 'Technical engineering articles on filtration theory, media science, contamination control, and industrial asset protection.',
        url: 'https://elimfilters.com/knowledge-center/engineering',
        publisher: {
          '@type': 'Organization',
          '@id': 'https://elimfilters.com/#organization',
          name: 'ELIMFILTERS',
        },
        hasPart: ENGINEERING_ARTICLES.map((a) => ({
          '@type': 'TechArticle',
          headline: a.title,
          url: `https://elimfilters.com/knowledge-center/engineering/${a.slug}`,
          description: a.metaDescription,
        })),
      })}} />
    </main>
  );
}
