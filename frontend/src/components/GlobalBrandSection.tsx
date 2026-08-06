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

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              background: 'rgba(255,241,45,0.05)',
              border: '2px solid rgba(255,241,45,0.2)',
              borderRadius: '8px',
              padding: 'clamp(2rem, 4vw, 2.5rem)',
              marginBottom: '2.5rem',
            }}
          >
            <p style={{
              color: '#FFF12D',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.85rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
              margin: '0 0 1.5rem 0',
            }}>
              Operating Model — Authorized Distributor Network
            </p>

            <p style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
              lineHeight: 1.8,
              margin: '0 0 1.5rem 0',
            }}>
              ELIMFILTERS opera a través de una red global de distribuidores autorizados certificados en cada región. Estos distribuidores especializados atienden directamente a puntos de venta, centros de servicio, operadores de flota e industria, proporcionando expertise técnico en sistemas ELIMFILTERS y garantizando cumplimiento de estándares internacionales.
            </p>

            <p style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: 'clamp(0.9rem, 1.4vw, 1rem)',
              lineHeight: 1.7,
              margin: 0,
            }}>
              <strong style={{ color: '#FFF12D' }}>Estándares de Cumplimiento Global:</strong><br/>
              ISO 16889 (Beta Ratio) · ISO 4406 (Cleanliness Codes) · ASTM D6304 (Fuel Filtration) · SAE J1539 (Air Intake) · NFPA T2.14 (Hydraulic Systems) · ISO 11155 (Cabin Air) · ISO 8573 (Compressed Air)
            </p>
          </motion.div>

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
