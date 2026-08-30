'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const PLATFORM_NAME = 'Asset Protection Intelligence';

const PLATFORM_PILLARS = [
  ['KNOWLEDGE CENTER', 'Engineering references indexed by system, failure mode, and industry standard — ISO 4406, ISO 16889, ISO 11171.'],
  ['PRODUCT CATALOGUE', 'SKU-level database mapping OEM part numbers, thread specs, media rating, and cross-references.'],
  ['PART SEARCH', 'Look up by OEM number, dimension, or application to the correct ELIMFILTERS SKU.'],
] as const;

export function GlobalBrandSection() {
  return (
    <section style={{
      padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
      background: 'linear-gradient(90deg, rgba(255,241,45,0.06) 0%, transparent 50%), #000',
      borderTop: '1px solid rgba(255,241,45,0.15)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <p style={{
            color: '#FFF12D',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.78rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: '1.25rem',
          }}>
            {`// ${PLATFORM_NAME}`}
          </p>

          <h2 style={{
            fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(2rem, 4vw, 3.6rem)',
            textTransform: 'uppercase',
            letterSpacing: '0.01em',
            lineHeight: 1.05,
            color: '#fff',
            marginBottom: '1.6rem',
            maxWidth: '980px',
          }}>
            One platform for <span style={{ color: '#FFF12D' }}>asset protection intelligence</span>
          </h2>

          <p style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
            lineHeight: 1.8,
            maxWidth: '900px',
            margin: '0 0 2rem 0',
          }}>
            ELIMFILTERS connects engineered filtration, governed technical knowledge, product intelligence and digital tools in one system built to support better decisions across critical assets.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.9rem',
            marginBottom: '2.5rem',
          }}>
            {PLATFORM_PILLARS.map(([title, body]) => (
              <div key={title} style={{
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center',
              }}>
                <h3 style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontSize: '1.05rem', margin: '0 0 0.55rem', color: '#fff' }}>
                  {title}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: 1.65, margin: 0, textAlign: 'justify' }}>
                  {body}
                </p>
              </div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <Link href="/knowledge-center" style={{
              display: 'inline-block',
              background: '#FFF12D',
              color: '#000',
              textDecoration: 'none',
              fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.1em',
              fontSize: '0.98rem',
              padding: '1.25rem 2rem',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}>
              Explore Knowledge
            </Link>

            <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-block',
              background: 'transparent',
              color: '#FFF12D',
              textDecoration: 'none',
              fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.1em',
              fontSize: '0.98rem',
              padding: '1.25rem 2rem',
              textTransform: 'uppercase',
              textAlign: 'center',
              border: '1px solid rgba(255,241,45,0.4)',
            }}>
              Search Product Intelligence
            </a>

            <Link href="/distributors" style={{
              display: 'inline-block',
              background: 'transparent',
              color: 'rgba(255,255,255,0.75)',
              textDecoration: 'none',
              fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.1em',
              fontSize: '0.98rem',
              padding: '1.25rem 2rem',
              textTransform: 'uppercase',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
              Global Network
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
