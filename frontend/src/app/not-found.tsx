'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Navigation />
      <main style={{ background: '#000', minHeight: '100vh', color: '#fff', display: 'flex', flexDirection: 'column' }}>

        <section style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8rem 8% 6rem',
        }}>
          <div style={{ maxWidth: '640px', width: '100%' }}>

            {/* Error code */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.7rem',
                letterSpacing: '0.25em',
                color: '#FFF12D',
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
              }}
            >
              ERROR 404 · PAGE NOT FOUND
            </motion.p>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              style={{
                fontFamily: 'Titillium Web, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
                lineHeight: 1,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                color: '#fff',
                margin: '0 0 1.5rem',
              }}
            >
              This path<br />
              <span style={{ color: '#FFF12D' }}>does not exist.</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.95rem',
                lineHeight: 1.75,
                color: 'rgba(255,255,255,0.45)',
                marginBottom: '3rem',
                maxWidth: '460px',
              }}
            >
              The page you are looking for has been moved, removed, or never existed.
              Use the navigation below to find what you need.
            </motion.p>

            {/* Navigation links */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem',
                marginBottom: '2.5rem',
              }}
            >
              {[
                { label: 'Home', href: '/' },
                { label: 'Products', href: '/systems' },
                { label: 'Industries', href: '/industries' },
                { label: 'Technologies', href: '/technologies' },
                { label: 'Knowledge System', href: '/knowledge-system' },
                { label: 'Contact', href: '/contact' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'block',
                    padding: '0.75rem 1.25rem',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontFamily: 'Barlow, sans-serif',
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.55)',
                    textDecoration: 'none',
                    transition: 'border-color 0.2s, color 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#FFF12D';
                    e.currentTarget.style.color = '#FFF12D';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                  }}
                >
                  {item.label} →
                </Link>
              ))}
            </motion.div>

            {/* Part search CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <a
                href="https://part-search.elimfilters.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.85rem 1.75rem',
                  background: '#FFF12D',
                  color: '#000',
                  fontFamily: 'Titillium Web, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.08em',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  borderRadius: '3px',
                }}
              >
                SEARCH PARTS CATALOGUE →
              </a>
            </motion.div>

          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
