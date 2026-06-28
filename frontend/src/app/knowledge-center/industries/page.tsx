'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { KC_INDUSTRIES } from '@/lib/knowledge-center-data';

const DUST_COLORS: Record<string, string> = {
  'Extreme': '#ff4444',
  'High': '#ff8c00',
  'Moderate': '#FFF12D',
  'Low': '#44ff88',
};

export default function IndustriesPage() {
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
            04 / INDUSTRY APPLICATIONS
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
            Industrial Application Profiles
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
            Industry-specific contamination profiles, equipment exposure levels, and filtration requirements for heavy equipment and industrial operations. Contamination exposure directly determines filtration system design, service intervals, and asset protection strategy.
          </motion.p>
        </div>
      </section>

      {/* Industries Grid */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1rem',
      }}>
        {KC_INDUSTRIES.map((industry, i) => (
          <motion.div
            key={industry.slug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <motion.div
              whileHover={{ borderColor: 'rgba(255,241,45,0.25)', background: 'rgba(255,255,255,0.015)' }}
              style={{
                border: '1px solid rgba(255,255,255,0.07)',
                padding: '1.75rem',
                transition: 'border-color 0.2s, background 0.2s',
                height: '100%',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{industry.icon}</span>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  color: DUST_COLORS[industry.dust] || '#FFF12D',
                  background: `${DUST_COLORS[industry.dust] || '#FFF12D'}15`,
                  border: `1px solid ${DUST_COLORS[industry.dust] || '#FFF12D'}30`,
                  padding: '0.2rem 0.5rem',
                  letterSpacing: '0.05em',
                }}>
                  {industry.dust.toUpperCase()} EXPOSURE
                </span>
              </div>

              <h2 style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: '1.15rem',
                color: '#fff',
                marginBottom: '0.65rem',
                lineHeight: 1.2,
              }}>
                {industry.title}
              </h2>

              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.85rem',
                lineHeight: 1.65,
                color: 'rgba(255,255,255,0.5)',
                textAlign: 'justify',
              }}>
                {industry.description}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </section>

      {/* Context Note */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto 4rem',
        padding: '0 clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{
          background: 'rgba(255,241,45,0.03)',
          border: '1px solid rgba(255,241,45,0.1)',
          padding: '1.5rem 2rem',
        }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,241,45,0.5)',
            marginBottom: '0.5rem',
          }}>
            CONTAMINATION EXPOSURE CLASSIFICATION
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.65,
          }}>
            Exposure levels reflect typical operating conditions for ambient particulate, process contamination, and fluid ingress severity. Extreme exposure (mining, silica-heavy operations) requires daily air restriction checks, cabin HEPA filtration, and reduced hydraulic service intervals. High exposure (agriculture, construction) requires site-specific service intervals rather than OEM calendar-based schedules.
          </p>
        </div>
      </section>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Industrial Application Profiles — ELIMFILTERS Knowledge Center',
        description: 'Industry-specific contamination profiles, exposure levels, and filtration requirements for 8 industrial verticals.',
        url: 'https://elimfilters.com/knowledge-center/industries',
        publisher: {
          '@type': 'Organization',
          '@id': 'https://elimfilters.com/#organization',
          name: 'ELIMFILTERS',
        },
      })}} />
    </main>
  );
}
