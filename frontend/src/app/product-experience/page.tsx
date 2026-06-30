'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { PEP_SYSTEMS, PEP_FAMILIES } from '@/lib/pep-data';

export default function ProductExperiencePage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #0a0a0a 0%, #000 60%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
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
            ELIMFILTERS / PRODUCT EXPERIENCE PLATFORM
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
              lineHeight: 1.08,
              textAlign: 'justify',
              marginBottom: '1.5rem',
            }}
          >
            Industrial Asset Protection<br />Through Contamination Control
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
              maxWidth: '660px',
            }}
          >
            The Product Experience Platform is the navigation layer between engineering knowledge and commercial filtration products. Select a protection system to access the engineering center, technology specifications, product families, and individual product references.
          </motion.p>

          {/* Architecture Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{
              marginTop: '2.5rem',
              padding: '1.5rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.72rem',
              color: 'rgba(255,255,255,0.4)',
              lineHeight: 2,
            }}
          >
            <span style={{ color: '#FFF12D' }}>Protection System</span>
            {' → '}
            <span style={{ color: 'rgba(255,241,45,0.6)' }}>Engineering Center</span>
            {' → '}
            <span style={{ color: 'rgba(255,241,45,0.45)' }}>Technology Center</span>
            {' → '}
            <span style={{ color: 'rgba(255,241,45,0.35)' }}>Product Family</span>
            {' → '}
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>HD / LD Products</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            style={{ display: 'flex', gap: '2.5rem', marginTop: '2rem', flexWrap: 'wrap' }}
          >
            {[
              { label: `${PEP_SYSTEMS.length} PROTECTION SYSTEMS` },
              { label: `${PEP_FAMILIES.length} PRODUCT FAMILIES` },
              { label: '12 TECHNOLOGIES' },
            ].map((stat) => (
              <div key={stat.label} style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.1em',
              }}>
                {stat.label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Protection Systems Grid */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.35)',
            marginBottom: '2.5rem',
          }}>
            PROTECTION SYSTEMS — SELECT ENTRY POINT
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {PEP_SYSTEMS.map((system, i) => (
              <motion.div
                key={system.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  href={`/product-experience/systems/${system.slug}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.6rem',
                        letterSpacing: '0.1em',
                        color: '#FFF12D',
                      }}>
                        {system.number}
                      </span>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.55rem',
                        color: 'rgba(255,255,255,0.25)',
                      }}>
                        {system.familySlugs.length} FAMILIES →
                      </span>
                    </div>
                    <h2 style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      fontSize: '1.15rem',
                      color: '#fff',
                      marginBottom: '0.75rem',
                      lineHeight: 1.2,
                      textAlign: 'justify',
                    }}>
                      {system.name}
                    </h2>
                    <p style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.82rem',
                      lineHeight: 1.65,
                      textAlign: 'justify',
                      color: 'rgba(255,255,255,0.5)',
                      marginBottom: '1.25rem',
                    }}>
                      {system.tagline}
                    </p>
                    {/* Technology chips */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      {system.technologySlugs.map((slug) => (
                        <span key={slug} style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.55rem',
                          letterSpacing: '0.06em',
                          color: 'rgba(255,241,45,0.65)',
                          border: '1px solid rgba(255,241,45,0.2)',
                          padding: '0.15rem 0.4rem',
                          textTransform: 'uppercase',
                        }}>
                          {slug.replace(/-/g, '').toUpperCase()}
                        </span>
                      ))}
                    </div>
                    {/* Standards */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {system.applicableStandards.slice(0, 3).map((std) => (
                        <span key={std} style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.52rem',
                          color: 'rgba(255,255,255,0.3)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          padding: '0.1rem 0.35rem',
                        }}>
                          {std}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Families Quick Access */}
      <section style={{
        padding: 'clamp(2rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.01)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.35)',
            }}>
              PRODUCT FAMILIES
            </p>
            <Link href="/product-experience/families" style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.08em',
              color: '#FFF12D',
              textDecoration: 'none',
            }}>
              ALL {PEP_FAMILIES.length} FAMILIES →
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.5rem',
          }}>
            {PEP_FAMILIES.map((family) => (
              <Link key={family.slug} href={`/product-experience/families/${family.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ background: 'rgba(255,241,45,0.05)', borderColor: 'rgba(255,241,45,0.25)' }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.06)',
                    padding: '0.875rem 1rem',
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                >
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    color: '#fff',
                    marginBottom: '0.3rem',
                  }}>
                    {family.name}
                  </p>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {family.hdPrefix && (
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.55rem',
                        color: '#FFF12D',
                        border: '1px solid rgba(255,241,45,0.3)',
                        padding: '0.1rem 0.35rem',
                      }}>
                        HD {family.hdPrefix}
                      </span>
                    )}
                    {family.ldPrefix && (
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.55rem',
                        color: 'rgba(255,255,255,0.5)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        padding: '0.1rem 0.35rem',
                      }}>
                        LD {family.ldPrefix}
                      </span>
                    )}
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Search CTA */}
      <section style={{
        padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 4rem)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '1rem',
          }}>
            SEARCH THE PLATFORM
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '1.5rem',
            lineHeight: 1.65,
            textAlign: 'justify',
          }}>
            Navigate by part number, OEM number, machine, engine, industry, technology, protection system, product family, or standard.
          </p>
          <Link href="/product-experience/search" style={{
            background: '#FFF12D',
            color: '#000',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: '0.85rem',
            padding: '0.75rem 2rem',
            textDecoration: 'none',
            display: 'inline-block',
            letterSpacing: '0.02em',
          }}>
            Search Platform →
          </Link>
        </div>
      </section>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'ELIMFILTERS Product Experience Platform',
        description: 'Navigation layer between industrial filtration engineering knowledge and commercial products. Seven protection systems, twelve product families, twelve technologies.',
        url: 'https://elimfilters.com/product-experience',
        publisher: {
          '@type': 'Organization',
          '@id': 'https://elimfilters.com/#organization',
          name: 'ELIMFILTERS',
        },
      })}} />
    </main>
  );
}
