'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { catalogue, getSlug } from '@/lib/catalogue';
import { StaggerContainer, itemVariants } from '@/components/AnimateIn';

export default function TechnologiesPage() {
  const itemListData = catalogue.technologies.map((tech, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: tech.title,
    description: tech.description,
    url: `https://elimfilters.com/technologies/${getSlug(tech.name)}`,
  }));

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: itemListData,
      }) }} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Technologies', item: 'https://elimfilters.com/technologies' },
        ],
      }) }} />

      <Link href="/" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        transition: 'background 0.2s, border-color 0.2s',
      }}>← HOME</Link>

      {/* Hero Section */}
      <section
        style={{
          marginTop: 0,
          paddingTop: '5rem',
          paddingBottom: '5rem',
          backgroundImage: 'url(/images/sistems-hero.avif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          backgroundAttachment: 'scroll',
          position: 'relative',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 100%)',
          zIndex: 1,
        }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: '1.5rem' }}
          >
            <span
              style={{
                display: 'block',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.25em',
                color: '#FFF12D',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              // TECHNOLOGIES
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 900,
              fontFamily: 'Space Grotesk, sans-serif',
              marginBottom: '1.5rem',
              lineHeight: 1.1,
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            12 PROPRIETARY TECHNOLOGIES
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.1rem)',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.75)',
              fontFamily: 'Outfit, sans-serif',
              maxWidth: '700px',
              borderLeft: '3px solid #FFF12D',
              paddingLeft: '1.25rem',
            }}
          >
            SYNTRAX™, AQUAGUARD™, NANOFORCE™ and 9 more proprietary asset protection technologies engineered for maximum performance across critical industries.
          </motion.p>
        </div>
      </section>

      {/* ── ASSET PROTECTION NARRATIVE ── */}
      <section style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.02) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ maxWidth: '900px', margin: '0 auto', padding: '0 0' }}
        >
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.8,
          }}>
            ELIMFILTERS technologies are engineered to protect industrial assets by controlling contamination at the source across air, fuel, hydraulic, lubrication, and cabin systems. Each technology is designed to solve specific contamination problems that degrade equipment performance, reduce operational reliability, and accelerate total cost of ownership. Technologies are the physical embodiment of ELIMFILTERS' industrial asset protection strategy.
          </p>
        </motion.div>
      </section>

      {/* Technologies Grid */}
      <section style={{ padding: '5rem 2rem', background: '#000' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <StaggerContainer
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
            }}
          >
            {catalogue.technologies.map((tech) => {
              const slug = getSlug(tech.name);
              return (
                <motion.div key={tech.name} variants={itemVariants}>
                  <Link
                    href={`/technologies/${slug}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <motion.div
                      whileHover={{ y: -5, boxShadow: '0 16px 48px rgba(255,241,45,0.14)' }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,0,0,0.3) 100%)',
                        border: '1px solid rgba(255,241,45,0.2)',
                        borderRadius: '12px',
                        padding: '2.5rem 2rem',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          paddingBottom: '1rem',
                          borderBottom: '1px solid rgba(255,241,45,0.1)',
                        }}
                      >
                        <h3
                          style={{
                            fontSize: '1.4rem',
                            fontWeight: 700,
                            fontFamily: 'Space Grotesk, sans-serif',
                            color: 'rgba(255,255,255,0.75)',
                            margin: '0 0 0.5rem',
                            minHeight: '3.5rem',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {tech.title}
                        </h3>
                        {tech.subtitle && (
                          <p
                            style={{
                              fontSize: '0.9rem',
                              color: '#FFF12D',
                              fontFamily: 'Outfit, sans-serif',
                              fontWeight: 600,
                              margin: '0',
                            }}
                          >
                            {tech.subtitle}
                          </p>
                        )}
                      </div>

                      <p
                        style={{
                          fontSize: '0.85rem',
                          color: 'rgba(255,255,255,0.55)',
                          fontFamily: 'Outfit, sans-serif',
                          lineHeight: 1.6,
                          margin: '0',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '4rem',
                        }}
                      >
                        {tech.description}
                      </p>

                      <div style={{ marginTop: 'auto' }}>
                        {tech.features.length > 0 && (
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '0.5rem',
                              marginBottom: '1rem',
                            }}
                          >
                            {tech.features.slice(0, 3).map((feature, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: '0.75rem',
                                  background: 'rgba(255,241,45,0.1)',
                                  color: '#FFF12D',
                                  padding: '0.4rem 0.8rem',
                                  borderRadius: '4px',
                                  fontFamily: 'Outfit, sans-serif',
                                  fontWeight: 600,
                                }}
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}
                        <span
                          style={{
                            display: 'inline-block',
                            color: '#FFF12D',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            fontFamily: 'Outfit, sans-serif',
                            letterSpacing: '0.05em',
                          }}
                        >
                          DISCOVER →
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </StaggerContainer>
        </div>
      </section>
    </main>
  );
}
