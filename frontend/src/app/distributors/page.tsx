'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const ease = [0.16, 1, 0.3, 1] as const;

const DISTRIBUTORS = [
  {
    country: 'Dominican Republic',
    flag: '🇩🇴',
    company: 'TROY, SRL',
    address: 'Ave. Las Palmas #64, Santo Domingo, Dominican Republic 10905',
    phone: null,
    social: [
      { label: 'Instagram', href: 'https://www.instagram.com/troydominicana/', icon: 'Ig' },
    ],
    accent: '#fb923c',
  },
  {
    country: 'Colombia',
    flag: '🇨🇴',
    company: 'COLSAISA',
    address: 'Cl. 17 #82 – 67, Fontibón, Bogotá, Colombia',
    phone: '+57 310 611 2190',
    social: [],
    accent: '#4ade80',
  },
  {
    country: 'United States',
    flag: '🇺🇸',
    company: 'ELIMPERCA',
    address: 'Frisco, Texas, United States',
    phone: null,
    social: [],
    accent: '#60a5fa',
  },
];

export default function DistributorsPage() {
  return (
    <>
      <Navigation />
      <main style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>

        {/* Hero */}
        <section style={{ padding: '8rem 8% 5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
                color: '#FFF12D',
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
              }}
            >
              AUTHORIZED DISTRIBUTION NETWORK
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease }}
              style={{
                fontFamily: 'Titillium Web, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(2.2rem, 5vw, 4rem)',
                lineHeight: 1,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                color: '#fff',
                margin: '0 0 1.5rem',
              }}
            >
              Authorized<br />
              <span style={{ color: '#FFF12D' }}>Distributors</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease }}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.95rem',
                lineHeight: 1.75,
                color: 'rgba(255,255,255,0.45)',
                maxWidth: '520px',
              }}
            >
              ELIMFILTERS authorized distributors provide local access to the full product catalogue, technical support, and asset protection consultation across the Americas.
            </motion.p>
          </div>
        </section>

        {/* Distributor Cards */}
        <section style={{ padding: '5rem 8%' }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}>
            {DISTRIBUTORS.map((d, i) => (
              <motion.div
                key={d.company}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
                style={{
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '4px',
                  padding: '2.5rem',
                  background: 'rgba(255,255,255,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                {/* Country */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{d.flag}</span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.65rem',
                    letterSpacing: '0.15em',
                    color: d.accent,
                    textTransform: 'uppercase',
                  }}>
                    {d.country}
                  </span>
                </div>

                {/* Company name */}
                <h2 style={{
                  fontFamily: 'Titillium Web, sans-serif',
                  fontWeight: 700,
                  fontSize: '1.4rem',
                  letterSpacing: '-0.01em',
                  color: '#fff',
                  margin: 0,
                  textTransform: 'uppercase',
                }}>
                  {d.company}
                </h2>

                {/* Address */}
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.85rem',
                  lineHeight: 1.65,
                  color: 'rgba(255,255,255,0.5)',
                  margin: 0,
                }}>
                  {d.address}
                </p>

                {/* Phone */}
                {d.phone && (
                  <a
                    href={`tel:${d.phone.replace(/\s/g, '')}`}
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.78rem',
                      color: d.accent,
                      textDecoration: 'none',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {d.phone}
                  </a>
                )}

                {/* Social links */}
                {d.social.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {d.social.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.65rem',
                          letterSpacing: '0.1em',
                          color: d.accent,
                          background: `${d.accent}15`,
                          border: `1px solid ${d.accent}40`,
                          padding: '0.25rem 0.65rem',
                          borderRadius: '2px',
                          textDecoration: 'none',
                          textTransform: 'uppercase',
                        }}
                      >
                        {s.icon} {s.label}
                      </a>
                    ))}
                  </div>
                )}

                {/* Divider accent */}
                <div style={{
                  marginTop: 'auto',
                  paddingTop: '1.25rem',
                  borderTop: `1px solid ${d.accent}25`,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.6rem',
                  letterSpacing: '0.12em',
                  color: 'rgba(255,255,255,0.2)',
                  textTransform: 'uppercase',
                }}>
                  ELIMFILTERS® AUTHORIZED DISTRIBUTOR
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Become a Distributor CTA */}
        <section style={{
          padding: '5rem 8%',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,241,45,0.02)',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
            <div>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                letterSpacing: '0.18em',
                color: '#FFF12D',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
              }}>
                EXPAND THE NETWORK
              </p>
              <h2 style={{
                fontFamily: 'Titillium Web, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                color: '#fff',
                margin: 0,
                lineHeight: 1.2,
              }}>
                Become an Authorized Distributor
              </h2>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.45)',
                marginTop: '0.75rem',
                maxWidth: '420px',
                lineHeight: 1.7,
              }}>
                Join the ELIMFILTERS distribution network and provide industrial asset protection systems to your region.
              </p>
            </div>
            <Link
              href="/distributor-application"
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
                whiteSpace: 'nowrap',
              }}
            >
              APPLY NOW →
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
