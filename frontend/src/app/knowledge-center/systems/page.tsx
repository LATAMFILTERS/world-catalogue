'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { KC_SYSTEMS } from '@/lib/knowledge-center-data';

export default function SystemsPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{
        backgroundColor: '#050505',
        backgroundImage: "linear-gradient(90deg, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.70) 36%, rgba(0,0,0,0.42) 68%, rgba(0,0,0,0.20) 100%), url('/images/dossier-filters.avif')",
        backgroundSize: '100% 100%, contain',
        backgroundPosition: 'center, 72% center',
        backgroundRepeat: 'no-repeat, no-repeat',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3.5rem, 6vw, 5.5rem) clamp(1.5rem, 4vw, 4rem)',
        minHeight: 'clamp(500px, 52vw, 620px)',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <Link href="/knowledge-center" style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.42)',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: '2rem',
          }}>
            ← KNOWLEDGE CENTER
          </Link>

          <motion.p
            initial={false}
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
            03 / PROTECTION SYSTEMS
          </motion.p>

          <motion.h1
            initial={false}
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
            Filtration Protection Systems
          </motion.h1>

          <motion.p
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.68)',
              maxWidth: '820px',
            }}
          >
            Six asset protection domains covering air intake, fuel, lubrication, hydraulics, cooling, and cabin air. Each domain maps contamination targets, applicable standards, and the ELIMFILTERS technologies engineered to address specific failure mechanisms.
          </motion.p>
        </div>
      </section>

      {/* Systems Grid */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1px',
        background: 'rgba(255,255,255,0.04)',
      }}>
        {KC_SYSTEMS.map((system, i) => (
          <motion.div
            key={system.slug}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
          >
          <Link href={`/knowledge-center/systems/${system.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
          <div
            style={{
              background: '#000',
              padding: '2rem',
              borderLeft: '3px solid transparent',
              transition: 'border-left-color 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderLeftColor = '#FFF12D'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderLeftColor = 'transparent'; }}
          >
            <p style={{
              fontSize: '1.8rem',
              marginBottom: '0.75rem',
              lineHeight: 1,
            }}>
              {system.icon}
            </p>

            <h2 style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              fontSize: '1.2rem',
              color: '#fff',
              marginBottom: '0.75rem',
              lineHeight: 1.2,
            }}>
              {system.title}
            </h2>

            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.55)',
              marginBottom: '1.5rem',
            }}>
              {system.description}
            </p>

            {system.technologies.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.58rem',
                  letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.3)',
                  marginBottom: '0.5rem',
                }}>
                  TECHNOLOGIES
                </p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {system.technologies.map((tech) => (
                    <span key={tech} style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      color: '#FFF12D',
                      background: 'rgba(255,241,45,0.07)',
                      padding: '0.2rem 0.5rem',
                      border: '1px solid rgba(255,241,45,0.2)',
                    }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {system.kits.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.58rem',
                  letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.3)',
                  marginBottom: '0.5rem',
                }}>
                  COMMERCIAL KITS
                </p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {system.kits.map((kit) => (
                    <Link
                      key={kit}
                      href={`/commercial-lines/${kit.replace('™', '').toLowerCase()}`}
                      style={{
                        textDecoration: 'none',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        color: '#66ccff',
                        background: 'rgba(102,204,255,0.07)',
                        padding: '0.2rem 0.5rem',
                        border: '1px solid rgba(102,204,255,0.2)',
                      }}
                    >
                      {kit}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {system.standards.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.58rem',
                  letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.3)',
                  marginBottom: '0.5rem',
                }}>
                  STANDARDS
                </p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {system.standards.map((std) => (
                    <span key={std} style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.62rem',
                      color: 'rgba(255,255,255,0.4)',
                      background: 'rgba(255,255,255,0.04)',
                      padding: '0.2rem 0.5rem',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}>
                      {std}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.58rem',
                letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.3)',
                marginBottom: '0.5rem',
              }}>
                CONTAMINATION CHALLENGES
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {system.challenges.map((ch) => (
                  <p key={ch} style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.78rem',
                    color: 'rgba(255,255,255,0.4)',
                    paddingLeft: '0.75rem',
                    borderLeft: '2px solid rgba(255,255,255,0.1)',
                  }}>
                    {ch}
                  </p>
                ))}
              </div>
            </div>
          </div>
          </Link>
          </motion.div>
        ))}
      </section>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Filtration Protection Systems — ELIMFILTERS Knowledge Center',
        description: 'Six industrial filtration protection domains mapped to contamination targets, standards, and technologies.',
        url: 'https://elimfilters.com/knowledge-center/systems',
        publisher: {
          '@type': 'Organization',
          '@id': 'https://elimfilters.com/#organization',
          name: 'ELIMFILTERS',
        },
      })}} />
    </main>
  );
}
