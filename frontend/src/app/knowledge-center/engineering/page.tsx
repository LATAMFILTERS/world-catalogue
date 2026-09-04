'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ENGINEERING_ARTICLES } from '@/lib/knowledge-center-data';
import { isConsolidatedEngineeringTopic } from '@/lib/knowledge-center/canonical-article-ownership';

const miningSeries = [
  {
    slug: 'mining-contamination-tco',
    title: 'Mining Dust Contamination, Availability & TCO',
    description: 'How contamination mechanisms influence component life, maintenance predictability, equipment availability and lifecycle cost.',
  },
  {
    slug: 'dust-failure-mechanisms-mining',
    title: 'Mining Dust Failure Mechanisms',
    description: 'Abrasive wear, restriction, thermal load and instrumentation interference in severe-duty mining environments.',
  },
  {
    slug: 'contamination-reliability-curve',
    title: 'Contamination & the Equipment Reliability Curve',
    description: 'How contamination can influence early-life failures, useful life and wear-out behavior.',
  },
  {
    slug: 'high-value-component-protection',
    title: 'Protecting High-Value Components Through Filtration',
    description: 'Connect consumable protection elements with component criticality, equipment availability and lifecycle economics.',
  },
] as const;

const canonicalEngineeringArticles = ENGINEERING_ARTICLES.filter(
  (article) => !isConsolidatedEngineeringTopic(article.slug),
);

export default function EngineeringHubPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>
      <section style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Link href="/knowledge-center/" style={{
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
              textAlign: 'left',
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
              textAlign: 'left',
              color: 'rgba(255,255,255,0.6)',
              maxWidth: '820px',
            }}
          >
            Technical references covering filtration theory, contamination modes, fluid mechanics, asset protection and system engineering for heavy equipment and industrial applications.
          </motion.p>
        </div>
      </section>

      <section style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)',
        background: 'radial-gradient(circle at 100% 0%, rgba(255,241,45,0.08), transparent 30%), #050505',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.62rem',
            letterSpacing: '0.12em',
            color: '#FFF12D',
            margin: '0 0 0.8rem',
          }}>
            MINING CONTAMINATION SERIES
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(1.8rem, 4vw, 3.2rem)',
            lineHeight: 1.05,
            margin: '0 0 0.9rem',
            maxWidth: '760px',
          }}>
            From dust exposure to reliability, availability and lifecycle cost.
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            color: 'rgba(255,255,255,0.58)',
            lineHeight: 1.7,
            maxWidth: '720px',
            margin: '0 0 2rem',
          }}>
            A focused engineering path for maintenance, reliability and asset-management teams working in severe-duty mining environments.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {miningSeries.map((item, index) => (
              <Link
                key={item.slug}
                href={`/knowledge-center/engineering/${item.slug}/`}
                style={{
                  background: '#050505',
                  padding: '1.5rem',
                  textDecoration: 'none',
                  color: '#fff',
                  minHeight: '190px',
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: 0,
                }}
              >
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#FFF12D',
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em',
                }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <strong style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1.05rem',
                  lineHeight: 1.25,
                  marginTop: '1rem',
                }}>
                  {item.title}
                </strong>
                <span style={{
                  fontFamily: 'Inter, sans-serif',
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.55,
                  fontSize: '0.82rem',
                  marginTop: '0.65rem',
                }}>
                  {item.description}
                </span>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.58rem',
                  letterSpacing: '0.08em',
                  marginTop: 'auto',
                  paddingTop: '1rem',
                }}>
                  READ GUIDE →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
          gap: '1px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          {canonicalEngineeringArticles.map((article, i) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              style={{ minWidth: 0 }}
            >
              <Link href={`/knowledge-center/engineering/${article.slug}/`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                <motion.div
                  whileHover={{ background: 'rgba(255,241,45,0.03)', borderLeftColor: '#FFF12D' }}
                  style={{
                    background: '#000',
                    padding: '1.75rem 2rem',
                    borderLeft: '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'background 0.2s, border-left-color 0.2s',
                    height: '100%',
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
                    textAlign: 'left',
                  }}>
                    {article.title}
                  </h2>

                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.4)',
                    lineHeight: 1.5,
                    textAlign: 'left',
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

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Filtration Engineering Articles — ELIMFILTERS Knowledge Center',
        description: 'Technical engineering articles on filtration theory, media science, contamination control, reliability and industrial asset protection.',
        url: 'https://elimfilters.com/knowledge-center/engineering/',
        publisher: {
          '@type': 'Organization',
          '@id': 'https://elimfilters.com/#organization',
          name: 'ELIMFILTERS',
        },
        hasPart: [
          ...miningSeries.map((a) => ({
            '@type': 'TechArticle',
            headline: a.title,
            url: `https://elimfilters.com/knowledge-center/engineering/${a.slug}/`,
            description: a.description,
          })),
          ...canonicalEngineeringArticles.map((a) => ({
            '@type': 'TechArticle',
            headline: a.title,
            url: `https://elimfilters.com/knowledge-center/engineering/${a.slug}/`,
            description: a.metaDescription,
          })),
        ],
      })}} />
    </main>
  );
}
