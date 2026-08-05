'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export function GlobalBrandSection() {
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
          <h2 style={{
            fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(2rem, 4vw, 3.6rem)',
            textTransform: 'uppercase',
            letterSpacing: '0.01em',
            lineHeight: 1.05,
            color: 'rgba(255,255,255,0.85)',
            marginBottom: '2rem',
          }}>
            Global Brand, <span style={{ color: '#FFF12D' }}>Local Support</span>
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(1.5rem, 3vw, 2.5rem)',
            marginBottom: '2.5rem',
          }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: 'clamp(1rem, 1.6vw, 1.2rem)',
                lineHeight: 1.7,
                margin: 0,
              }}>
                <strong style={{ color: '#FFF12D' }}>ELIMFILTERS®</strong> is <strong>Kleo Technology LLC's</strong> global industrial filtration brand.
              </p>
              <p style={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: '1rem',
                lineHeight: 1.7,
                margin: 0,
              }}>
                We do not sell directly to end users. All products are available exclusively through our network of authorized distributors across the Americas and other regions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                background: 'rgba(255,241,45,0.05)',
                border: '1px solid rgba(255,241,45,0.15)',
                borderRadius: '2px',
                padding: 'clamp(1.5rem, 3vw, 2rem)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <p style={{
                color: '#FFF12D',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.85rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
              }}>
                Operating Model
              </p>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: 'clamp(1.1rem, 1.8vw, 1.35rem)',
                fontWeight: 600,
                lineHeight: 1.5,
                margin: 0,
              }}>
                100% distributor-based<br />
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', fontWeight: 400 }}>No direct sales</span>
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
          >
            <Link href="/distributors" style={{
              display: 'inline-block',
              background: '#FFF12D',
              color: '#000',
              textDecoration: 'none',
              fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.1em',
              fontSize: '0.85rem',
              padding: 'clamp(0.75rem, 1.5vw, 1rem) clamp(1.2rem, 2vw, 1.5rem)',
              textTransform: 'uppercase',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 28px rgba(255,241,45,0.55)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Find a Distributor
            </Link>

            <Link href="/about" style={{
              display: 'inline-block',
              background: 'transparent',
              color: '#FFF12D',
              textDecoration: 'none',
              fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.1em',
              fontSize: '0.85rem',
              padding: 'clamp(0.75rem, 1.5vw, 1rem) clamp(1.2rem, 2vw, 1.5rem)',
              textTransform: 'uppercase',
              border: '1px solid rgba(255,241,45,0.4)',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,241,45,0.8)';
                e.currentTarget.style.backgroundColor = 'rgba(255,241,45,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,241,45,0.4)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              About ELIMFILTERS
            </Link>

            <Link href="/knowledge-system" style={{
              display: 'inline-block',
              background: 'transparent',
              color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.1em',
              fontSize: '0.85rem',
              padding: 'clamp(0.75rem, 1.5vw, 1rem) clamp(1.2rem, 2vw, 1.5rem)',
              textTransform: 'uppercase',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
              }}
            >
              Knowledge Center
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
