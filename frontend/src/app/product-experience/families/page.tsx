'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { PEP_FAMILIES, PEP_SYSTEMS } from '@/lib/pep-data';

export default function FamiliesPage() {
  const systemOrder = PEP_SYSTEMS.map((s) => s.slug);

  const grouped = systemOrder.map((systemSlug) => {
    const system = PEP_SYSTEMS.find((s) => s.slug === systemSlug)!;
    const families = PEP_FAMILIES.filter((f) => f.systemSlug === systemSlug);
    return { system, families };
  }).filter((g) => g.families.length > 0);

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
            PRODUCT EXPERIENCE / PRODUCT FAMILIES
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
            Product Family Centers
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
            {PEP_FAMILIES.length} product families organized by protection system. Each family center documents purpose, engineering, applications, construction, technology, standards, and Heavy Duty / Light Duty product references.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}
          >
            {[
              { label: `${PEP_FAMILIES.filter((f) => f.hdPrefix).length} HD FAMILIES` },
              { label: `${PEP_FAMILIES.filter((f) => f.ldPrefix).length} LD FAMILIES` },
              { label: `${PEP_SYSTEMS.length} PROTECTION SYSTEMS` },
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

      {/* Grouped by System */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {grouped.map(({ system, families }, gi) => (
            <motion.div
              key={system.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: gi * 0.05 }}
              viewport={{ once: true }}
              style={{ marginBottom: '3.5rem' }}
            >
              {/* System Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '1rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.6rem',
                    color: '#FFF12D',
                    letterSpacing: '0.1em',
                    marginRight: '0.75rem',
                  }}>
                    {system.number}
                  </span>
                  <span style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    color: '#fff',
                  }}>
                    {system.name}
                  </span>
                </div>
                <Link href={`/product-experience/systems/${system.slug}`} style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.6rem',
                  color: 'rgba(255,241,45,0.5)',
                  textDecoration: 'none',
                  letterSpacing: '0.06em',
                }}>
                  ENGINEERING CENTER →
                </Link>
              </div>

              {/* Families Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1px',
                background: 'rgba(255,255,255,0.06)',
              }}>
                {families.map((family) => (
                  <Link
                    key={family.slug}
                    href={`/product-experience/families/${family.slug}`}
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <motion.div
                      whileHover={{ background: 'rgba(255,241,45,0.04)' }}
                      style={{
                        background: '#000',
                        padding: '1.5rem',
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
                      <h3 style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: '#fff',
                        marginBottom: '0.6rem',
                        lineHeight: 1.2,
                      }}>
                        {family.name}
                      </h3>
                      <p style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.78rem',
                        lineHeight: 1.6,
                        color: 'rgba(255,255,255,0.45)',
                        marginBottom: '1rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {family.purpose}
                      </p>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {family.hdPrefix && (
                          <span style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            color: '#FFF12D',
                            border: '1px solid rgba(255,241,45,0.35)',
                            padding: '0.15rem 0.4rem',
                          }}>
                            HD {family.hdPrefix}
                          </span>
                        )}
                        {family.ldPrefix && (
                          <span style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '0.6rem',
                            color: 'rgba(255,255,255,0.5)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            padding: '0.15rem 0.4rem',
                          }}>
                            LD {family.ldPrefix}
                          </span>
                        )}
                        <span style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.55rem',
                          color: 'rgba(255,255,255,0.2)',
                        }}>
                          {family.standards[0]}
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'ELIMFILTERS Product Family Centers',
        description: `${PEP_FAMILIES.length} product families covering Heavy Duty and Light Duty filtration across all protection systems.`,
        url: 'https://elimfilters.com/product-experience/families',
        isPartOf: { '@type': 'CollectionPage', url: 'https://elimfilters.com/product-experience', name: 'ELIMFILTERS Product Experience Platform' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
      })}} />
    </main>
  );
}
