'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ASSET_PROTECTION_INTELLIGENCE } from '@/lib/asset-protection-intelligence';

export function GlobalBrandSection() {
  const architecture = ASSET_PROTECTION_INTELLIGENCE;

  return (
    <section style={{
      padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
      background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%), linear-gradient(90deg, rgba(255,241,45,0.08) 0%, transparent 50%)',
      borderTop: '1px solid rgba(255,241,45,0.15)',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
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
            {`// ${architecture.platform}`}
          </p>

          <h2 style={{
            fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(2rem, 4vw, 3.6rem)',
            textTransform: 'uppercase',
            letterSpacing: '0.01em',
            lineHeight: 1.05,
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '1.6rem',
            maxWidth: '980px',
          }}>
            One platform for <span style={{ color: '#FFF12D' }}>asset protection intelligence</span>
          </h2>

          <p style={{
            color: 'rgba(255,255,255,0.72)',
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
            {[
              ['HERMES', architecture.systems.hermes.role, 'Discovers and routes new technical evidence.'],
              ['KNOWLEDGE', architecture.systems.obsidian.role, 'Preserves reviewed institutional and technical memory.'],
              ['PRODUCT INTELLIGENCE', architecture.systems.catalogue.role, 'Keeps SKU, applications and cross-references governed.'],
              ['PART SEARCH', architecture.systems.partSearch.role, 'Turns validated catalogue data into fast discovery.'],
            ].map(([title, role, body]) => (
              <div key={title} style={{
                padding: '1.25rem',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <p style={{ color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 0.65rem' }}>
                  {role}
                </p>
                <h3 style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontSize: '1.05rem', margin: '0 0 0.55rem', color: '#fff' }}>
                  {title}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex',
            gap: '0.7rem',
            flexWrap: 'wrap',
            marginBottom: '2.5rem',
          }}>
            {architecture.mantra.map((value) => (
              <span key={value} style={{
                border: '1px solid rgba(255,241,45,0.28)',
                color: 'rgba(255,255,255,0.82)',
                padding: '0.6rem 0.85rem',
                fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
                fontWeight: 700,
                fontSize: '0.72rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}>
                {value}
              </span>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
          >
            <Link href="/knowledge-center" style={{
              display: 'inline-block',
              background: '#FFF12D',
              color: '#000',
              textDecoration: 'none',
              fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.1em',
              fontSize: '0.82rem',
              padding: '0.95rem 1.35rem',
              textTransform: 'uppercase',
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
              fontSize: '0.82rem',
              padding: '0.95rem 1.35rem',
              textTransform: 'uppercase',
              border: '1px solid rgba(255,241,45,0.4)',
            }}>
              Search Product Intelligence
            </a>

            <Link href="/distributors" style={{
              display: 'inline-block',
              background: 'transparent',
              color: 'rgba(255,255,255,0.72)',
              textDecoration: 'none',
              fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.1em',
              fontSize: '0.82rem',
              padding: '0.95rem 1.35rem',
              textTransform: 'uppercase',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              Global Network
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
