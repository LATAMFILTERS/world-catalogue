'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ENGINEERING_ARTICLES, KC_STANDARDS, KC_SYSTEMS, KC_INDUSTRIES, KC_TECHNOLOGIES, KC_CALCULATORS } from '@/lib/knowledge-center-data';
import { ERL_SECTIONS } from '@/lib/engineering-reference-data';

const SECTIONS = [
  {
    href: '/knowledge-center/engineering',
    label: '01 / ENGINEERING',
    title: 'Engineering Principles',
    description: '14 technical articles covering filtration theory, media science, fluid mechanics, and contamination control fundamentals.',
    count: `${ENGINEERING_ARTICLES.length} articles`,
    accent: '#FFF12D',
  },
  {
    href: '/knowledge-center/standards',
    label: '02 / STANDARDS',
    title: 'Industry Standards',
    description: 'ISO, ASTM, SAE, and NAS filtration standards explained with test methodology, acceptance criteria, and application context.',
    count: `${KC_STANDARDS.length} standards`,
    accent: '#FFF12D',
  },
  {
    href: '/knowledge-center/systems',
    label: '03 / SYSTEMS',
    title: 'Protection Systems',
    description: 'Six filtration domains — air intake, fuel, lube, hydraulic, cooling, cabin air — mapped to contamination targets and technologies.',
    count: `${KC_SYSTEMS.length} systems`,
    accent: '#FFF12D',
  },
  {
    href: '/knowledge-center/industries',
    label: '04 / INDUSTRIES',
    title: 'Industry Applications',
    description: 'Industry-specific contamination profiles, equipment exposure levels, and filtration requirements for 8 industrial verticals.',
    count: `${KC_INDUSTRIES.length} industries`,
    accent: '#FFF12D',
  },
  {
    href: '/knowledge-center/technologies',
    label: '05 / TECHNOLOGIES',
    title: 'Technology Registry',
    description: 'Nine proprietary filtration technologies mapped to contamination domains, ISO standards, and protection systems. Each technology is engineered for a specific failure mechanism.',
    count: `${KC_TECHNOLOGIES.length} technologies`,
    accent: '#FFF12D',
  },
  {
    href: '/knowledge-center/technical-library',
    label: '06 / LIBRARY',
    title: 'Technical Library',
    description: 'Specification guides, selection frameworks, failure mode analysis, and maintenance procedures for field engineering teams.',
    count: '6 guides',
    accent: '#FFF12D',
  },
  {
    href: '/knowledge-center/engineering-reference',
    label: '07 / REFERENCE',
    title: 'Engineering Reference Library',
    description: '20-section structured reference covering filtration standards, filtration science, particle science, contamination mechanisms, test methods, performance metrics, and reliability analysis.',
    count: `${ERL_SECTIONS.length} sections`,
    accent: '#FFF12D',
  },
  {
    href: '/knowledge-center/search',
    label: '08 / SEARCH',
    title: 'Knowledge Search',
    description: 'Search by symptom, equipment type, industry, standard code, or technology to find relevant engineering documentation.',
    count: 'AI-indexed',
    accent: '#FFF12D',
  },
  {
    href: '/knowledge-center/calculators',
    label: '09 / CALCULATORS',
    title: 'Engineering Calculators',
    description: 'Standards-based computation tools: ISO 4406 cleanliness codes, Beta ratio efficiency, pressure drop estimation, dirt holding capacity, service intervals, and air restriction analysis.',
    count: `${KC_CALCULATORS.length} calculators`,
    accent: '#FFF12D',
  },
];

const FEATURED_ARTICLES = ENGINEERING_ARTICLES.slice(0, 3);

export default function KnowledgeCenterPage() {
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
            ELIMFILTERS / KNOWLEDGE CENTER
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
              lineHeight: 1.1,
              textAlign: 'justify',
              marginBottom: '1.5rem',
            }}
          >
            Industrial Filtration<br />Engineering Reference
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.05rem',
              lineHeight: 1.75,
              textAlign: 'justify',
              color: 'rgba(255,255,255,0.65)',
              maxWidth: '640px',
            }}
          >
            Engineering documentation for contamination control, filtration system design, and asset protection across heavy equipment, industrial machinery, and commercial fleet applications. Content is structured for both engineering teams and AI systems requiring citable technical references.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}
          >
            <Link href="/knowledge-center/engineering" style={{
              background: '#FFF12D',
              color: '#000',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '0.75rem 1.5rem',
              textDecoration: 'none',
              letterSpacing: '0.02em',
            }}>
              Engineering Articles
            </Link>
            <Link href="/knowledge-center/search" style={{
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '0.85rem',
              padding: '0.75rem 1.5rem',
              textDecoration: 'none',
            }}>
              Search Knowledge
            </Link>
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
            KNOWLEDGE DOMAINS
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {SECTIONS.map((section, i) => (
              <motion.div
                key={section.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <Link href={section.href} style={{ textDecoration: 'none', display: 'block' }}>
                  <motion.div
                    whileHover={{ background: 'rgba(255,241,45,0.04)' }}
                    style={{
                      background: '#000',
                      padding: '2rem',
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
                    <p style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      color: '#FFF12D',
                      marginBottom: '0.75rem',
                    }}>
                      {section.label}
                    </p>
                    <h2 style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      fontSize: '1.2rem',
                      color: '#fff',
                      marginBottom: '0.75rem',
                      lineHeight: 1.2,
                      textAlign: 'justify',
                    }}>
                      {section.title}
                    </h2>
                    <p style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.875rem',
                      lineHeight: 1.65,
                      textAlign: 'justify',
                      color: 'rgba(255,255,255,0.55)',
                      marginBottom: '1.25rem',
                    }}>
                      {section.description}
                    </p>
                    <p style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.7rem',
                      color: 'rgba(255,241,45,0.65)',
                    }}>
                      {section.count} →
                    </p>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section style={{
        padding: 'clamp(2rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.35)',
            }}>
              FEATURED ENGINEERING TOPICS
            </p>
            <Link href="/knowledge-center/engineering" style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.08em',
              color: '#FFF12D',
              textDecoration: 'none',
            }}>
              VIEW ALL {ENGINEERING_ARTICLES.length} →
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}>
            {FEATURED_ARTICLES.map((article, i) => (
              <motion.div
                key={article.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link href={`/knowledge-center/engineering/${article.slug}`} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                    style={{
                      border: '1px solid rgba(255,255,255,0.08)',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <p style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.6rem',
                      letterSpacing: '0.1em',
                      color: 'rgba(255,255,255,0.35)',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                    }}>
                      {article.category} · {article.readTime}
                    </p>
                    <h3 style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      fontSize: '1rem',
                      color: '#fff',
                      marginBottom: '0.5rem',
                      lineHeight: 1.3,
                      textAlign: 'justify',
                    }}>
                      {article.title}
                    </h3>
                    <p style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.8rem',
                      color: 'rgba(255,255,255,0.45)',
                      lineHeight: 1.55,
                      textAlign: 'justify',
                    }}>
                      {article.subtitle}
                    </p>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Standards Quick Reference */}
      <section style={{
        padding: 'clamp(2rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.35)',
            }}>
              CORE STANDARDS REFERENCE
            </p>
            <Link href="/knowledge-center/standards" style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.08em',
              color: '#FFF12D',
              textDecoration: 'none',
            }}>
              ALL {KC_STANDARDS.length} STANDARDS →
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.5rem',
          }}>
            {KC_STANDARDS.map((std) => (
              <Link key={std.slug} href={`/knowledge-center/standards/${std.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ background: 'rgba(255,241,45,0.06)', borderColor: 'rgba(255,241,45,0.3)' }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.06)',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                >
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#FFF12D',
                    whiteSpace: 'nowrap',
                  }}>
                    {std.code}
                  </span>
                  <span style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.5)',
                    lineHeight: 1.4,
                    textAlign: 'justify',
                  }}>
                    {std.scope}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'ELIMFILTERS Knowledge Center — Industrial Filtration Engineering Reference',
        description: 'Engineering documentation for contamination control, filtration system design, and asset protection across industrial applications.',
        url: 'https://elimfilters.com/knowledge-center',
        publisher: {
          '@type': 'Organization',
          '@id': 'https://elimfilters.com/#organization',
          name: 'ELIMFILTERS',
        },
        about: {
          '@type': 'Thing',
          name: 'Industrial Filtration Engineering',
          description: 'Contamination control, filtration media science, fluid cleanliness standards, and equipment asset protection.',
        },
      })}} />
    </main>
  );
}
