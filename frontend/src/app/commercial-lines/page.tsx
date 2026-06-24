'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const LINES = [
  {
    name: 'MARINECLEAN™',
    tagline: 'Protecting Marine Assets',
    description: 'Salt-resistant filtration line for commercial marine, offshore, and coastal operations. Epoxy barrier coating, brine rejection geometry, and corrosion-shield internals. IMO certified for continuous saltwater aerosol exposure in diesel fuel and hydraulic systems.',
    specs: ['IMO certified', 'Epoxy barrier coating', 'Brine rejection geometry', 'Diesel fuel & hydraulic protection'],
    href: '/commercial-lines/marineclean',
    src: '/assets/MARINECLEAN.avif',
    domains: 'Marine · Offshore · Coastal Infrastructure',
  },
  {
    name: 'DURATECH™',
    tagline: 'One Kit. More Uptime.',
    description: 'Fleet master kit system that consolidates all filtration elements for a complete vehicle service — oil, fuel, air, and cabin — into a single OEM-interchangeable package. Platform-specific kits for mixed-model fleets in on-road and off-road operations.',
    specs: ['OEM-interchangeable', 'Single-source per service cycle', 'Oil · Fuel · Air · Cabin', 'Mixed-model fleet coverage'],
    href: '/commercial-lines/duratech',
    src: '/assets/Duratech.avif',
    domains: 'Trucks & Fleets · Mining · Construction · Agriculture',
  },
];

export default function CommercialLinesPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Navigation />

      {/* Hero */}
      <section style={{
        padding: 'clamp(6rem, 12vw, 10rem) clamp(1.5rem, 6vw, 4rem) clamp(3rem, 6vw, 5rem)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.25em',
            color: 'rgba(255,241,45,0.7)',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
          }}>
            // COMMERCIAL LINES · ELIMFILTERS®
          </p>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            lineHeight: 1,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
          }}>
            Commercial<br />
            <span style={{ color: '#FFF12D' }}>Lines.</span>
          </h1>
          <p style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)',
            color: 'rgba(255,255,255,0.5)',
            maxWidth: '560px',
            lineHeight: 1.7,
          }}>
            Integrated product lines engineered for specific operational contexts —
            marine environments and mixed-model fleet maintenance.
          </p>
        </motion.div>
      </section>

      {/* Lines */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 6vw, 4rem)' }}>
        {LINES.map((line, i) => (
          <motion.div
            key={line.name}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4rem',
              alignItems: 'center',
              padding: '4rem 0',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
            className="commercial-line-row"
          >
            {/* Image */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              aspectRatio: '4/3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <img
                src={line.src}
                alt={line.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
              />
            </div>

            {/* Content */}
            <div>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6rem',
                letterSpacing: '0.2em',
                color: 'rgba(255,241,45,0.5)',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}>
                {line.domains}
              </p>
              <h2 style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                letterSpacing: '-0.02em',
                marginBottom: '0.3rem',
              }}>
                {line.name}
              </h2>
              <p style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.35)',
                marginBottom: '1.5rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                {line.tagline}
              </p>
              <p style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.95rem',
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.75,
                marginBottom: '2rem',
              }}>
                {line.description}
              </p>

              {/* Specs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                {line.specs.map(s => (
                  <span key={s} style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.6rem',
                    letterSpacing: '0.1em',
                    color: 'rgba(255,255,255,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '0.3rem 0.7rem',
                    textTransform: 'uppercase',
                  }}>
                    {s}
                  </span>
                ))}
              </div>

              <Link
                href={line.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#FFF12D',
                  textDecoration: 'none',
                  borderBottom: '1px solid rgba(255,241,45,0.3)',
                  paddingBottom: '2px',
                }}
              >
                Explore {line.name} →
              </Link>
            </div>
          </motion.div>
        ))}
      </section>

      <style suppressHydrationWarning>{`
        @media (max-width: 768px) {
          .commercial-line-row {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>

      <Footer />
    </main>
  );
}
